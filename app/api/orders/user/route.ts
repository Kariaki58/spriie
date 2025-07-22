import Order from "@/models/order";
import Transaction from "@/models/transaction";
import Product from "@/models/product";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";



export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const session = await getServerSession(options);
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }


        const userId = session.user.id;
        if (!userId) {
            return NextResponse.json(
                { error: "User ID not found" },
                { status: 400 }
            );
        }

        const orders = await Order.find({ userId })
            .populate({
                path: "cartItems.productId",
                model: Product,
                select: "thumbnail images"
            })
            .sort({ createdAt: -1 });

        // Transform the data to match the frontend type
        const transformedOrders = orders.map(order => ({
            id: order._id.toString(),
            date: order.createdAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            }),
            status: order.status,
            amount: order.cartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            ),
            paymentMethod: order.paymentMethod,
            items: order.cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.productId?.thumbnail || item.productId?.images[0] || "https://placehold.co/80x80?text=Product"
            })),
            shippingAddress: order.shippingAddress,
            trackingNumber: order.trackingNumber
        }));

        return NextResponse.json(transformedOrders);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return NextResponse.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}