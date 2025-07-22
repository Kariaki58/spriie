import Order from "@/models/order";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/options";


export async function PATCH(req: NextRequest, { params }: { params: { orderId: string } }) {
    try {
        await connectToDatabase();
        const { id } = await params;

        const session = await getServerSession(options);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const orderId = id;
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        if (order.userId.toString() !== session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized to return this order" },
                { status: 403 }
            );
        }

        if (order.status !== 'delivered') {
            return NextResponse.json(
                { error: "Only delivered orders can be returned" },
                { status: 400 }
            );
        }

        order.status = 'returned';
        await order.save();

        return NextResponse.json({ message: "Return initiated successfully" });
    } catch (error) {
        console.error("Error initiating return:", error);
        return NextResponse.json(
            { error: "Failed to initiate return" },
            { status: 500 }
        );
    }
}