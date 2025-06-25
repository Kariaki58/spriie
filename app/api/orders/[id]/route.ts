import Order from "@/models/order";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import { NextRequest, NextResponse } from "next/server";



export async function PUT(req: NextRequest,  { params }: {  params: { id: string } }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({
                error: "Id is required"
            }, { status: 400 })
        }

        const session = await getServerSession(options);

        const data = await req.json();

        if (data.status === "cancelled" && !data.cancellationReason) {
            return NextResponse.json({
                error: "must provide a cancellation Reason"
            })
        }

        console.log('fire line 17')

        console.log(data)



        if (!session || !session.user) {
        return NextResponse.json(
            { error: "you are not logged in " },
            { status: 404 }
        )
        }

        if (session.user.role !== "seller") {
            return NextResponse.json(
                { erro: "you are not a seller" },
                { status: 400 }
            )
        }

        await connectToDatabase();

        const user = await User.findOne({ _id: session.user.id })

        if (!user) {
        return NextResponse.json(
            { error: "you are not logged in " },
            { status: 404}
        )
        }
        if (user.role !== "seller") {
        return NextResponse.json(
            { error: "you are not logged in " },
            { status: 404}
        )
        }

        const store = await Store.findOne({ userId: user._id })

        if (!store) {
        return NextResponse.json(
            { error: "you don not have a store " },
            { status: 404 }
        )
        }

        const orders = await Order.findOne({ 
            storeId: store._id,
            _id: id
        });

        if (!orders) {
            return NextResponse.json(
                { error: "we could not find your order" },
                { status: 404 }
            )
        }

        orders.status = data.status;

        if (data.cancellationReason) {
            orders.cancellationReason = data.cancellationReason
        }

        await orders.save();

        console.log({ orders })
        return NextResponse.json(
            { message: "order updated successfully" },
            { status: 200 }
        )
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "something went wrong"
        }, {
            status: 500
        })
    }
}