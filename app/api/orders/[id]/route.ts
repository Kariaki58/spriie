import Order from "@/models/order";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Product from "@/models/product";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import { NextRequest, NextResponse } from "next/server";
import { buyerOrderUpdateEmail } from "@/lib/email/email-templates";
import crypto from 'crypto';
import Escrow from "@/models/EscrowTransaction";
import EmailJob from "@/models/emailJob";
import mongoose from "mongoose";


export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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


export function generateHash(
  input?: string,
  algorithm: string = "sha256",
  length: number = 32
): string {
  if (!input) {
    return crypto.randomBytes(length).toString("hex");
  }
  const hash = crypto.createHash(algorithm);
  hash.update(input + crypto.randomBytes(16).toString("hex"));
  return hash.digest("hex");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Id is required" },
        { status: 400 }
      );
    }

    const sessionAuth = await getServerSession(options);
    const data = await req.json();

    if (data.status === "cancelled" && !data.cancellationReason) {
      return NextResponse.json(
        { error: "Must provide a cancellation reason" },
        { status: 400 }
      );
    }

    if (!sessionAuth || !sessionAuth.user) {
      return NextResponse.json(
        { error: "You are not logged in" },
        { status: 401 }
      );
    }

    if (sessionAuth.user.role !== "seller") {
      return NextResponse.json(
        { error: "You are not a seller" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(sessionAuth.user.id).session(mongoSession);
    if (!user || user.role !== "seller") {
      return NextResponse.json(
        { error: "You are not authorized" },
        { status: 403 }
      );
    }

    const store = await Store.findOne({ userId: user._id }).session(mongoSession);
    if (!store) {
      return NextResponse.json(
        { error: "You do not have a store" },
        { status: 404 }
      );
    }

    const order = await Order.findOne({
      storeId: store._id,
      _id: id,
    })
      .populate("userId")
      .session(mongoSession);

    if (!order) {
      return NextResponse.json(
        { error: "We could not find your order" },
        { status: 404 }
      );
    }

    order.status = data.status;
    if (data.cancellationReason) {
      order.cancellationReason = data.cancellationReason;
    }
    await order.save({ session: mongoSession });

    const confirmationToken = generateHash();

    // Escrow update if delivered
    if (data.status === "delivered") {
      const findEscrow = await Escrow.findOne({
        orderId: order._id,
        sellerId: sessionAuth.user.id,
        buyerId: order.userId._id,
      }).session(mongoSession);

      if (findEscrow) {
        findEscrow.releaseConditions.deliveryConfirmation = true;
        findEscrow.confirmationToken = confirmationToken;
        await findEscrow.save({ session: mongoSession });
      }
    }

    // Queue email instead of sending directly
    if (["shipped", "delivered"].includes(data.status)) {
      await EmailJob.create(
        [
          {
            to: order.userId.email,
            ...buyerOrderUpdateEmail(
              order._id,
              order.userId.name,
              data.status,
              confirmationToken
            ),
          },
        ],
        { session: mongoSession }
      );
    }

    await mongoSession.commitTransaction();
    mongoSession.endSession();

    return NextResponse.json(
      { message: "Order updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    await mongoSession.abortTransaction();
    mongoSession.endSession();
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
