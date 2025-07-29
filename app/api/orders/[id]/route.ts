import Order from "@/models/order";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Product from "@/models/product";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }
    const { id } = await params;


    await connectToDatabase();
    
    const order = await Order.findOne({
      _id: id,
      userId: session.user.id
    }).populate('orderItems.items.productId')
      .populate({
        path: 'orderItems.storeId',
        model: Store,
        select: 'storeName'
      });

    console.log(order.orderItems[0].items)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}

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
                { error: "you are not a seller" },
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