import { NextResponse } from 'next/server';
import Escrow from '@/models/EscrowTransaction';
import Order from '@/models/order';
import Transaction from '@/models/transaction';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/user';


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, data } = body;

    console.log("Webhook received:", {
      event,
      metadata: data.metadata,
      amount: data.amount / 100
    });

    if (event !== 'charge.success') {
      return NextResponse.json({ received: true });
    }

    await connectToDatabase();

    // 1. Verify payment with Paystack API
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${data.reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
    });
    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // 2. Prevent duplicate processing
    const existingTransaction = await Transaction.findOne({
      paymentReference: data.reference
    });
    if (existingTransaction) {
      return NextResponse.json({ received: true });
    }

    const escrow = await Escrow.findOne({
      _id: data.metadata.escrow_id,
      status: "pending"
    }).populate('buyerId sellerId');

    if (!escrow) {
      return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
    }

    if ((verifyData.data.amount / 100) !== escrow.amount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    // 5. Update escrow status
    escrow.status = "funded";
    escrow.paymentTransactionId = data.reference;
    await escrow.save();

    await Order.updateOne(
      { _id: escrow.orderId },
      { status: "processing" }
    );

    // 7. Create transaction record
    const transaction = new Transaction({
      fromUserId: escrow.buyerId._id,
      toUserId: escrow.sellerId._id,
      type: "buy",
      amount: escrow.amount,
      status: "completed",
      paymentMethod: "paystack",
      paymentReference: data.reference,
      escrowId: escrow._id
    });
    await transaction.save();

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
