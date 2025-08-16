import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";
import Escrow from "@/models/EscrowTransaction";
import Order from "@/models/order";
import Transaction from "@/models/transaction";
import User from "@/models/user";
import EmailJob from "@/models/emailJob";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/options";
import connectToDatabase from "@/lib/mongoose";
import {
  sellerFundsReleasedEmail,
  buyerFundsReleasedConfirmationEmail,
} from "@/lib/email/email-templates";
import { resend } from "@/lib/email/resend";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(options);
  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: orderId } = await params;
  const { confirmToken } = await req.json();

  let mongoSession: mongoose.ClientSession | null = null;

  try {
    await connectToDatabase();
    mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();

    // 1. Verify escrow
    const escrow = await Escrow.findOne({ orderId })
      .session(mongoSession)
      .populate("buyerId sellerId");

    if (!escrow) {
      throw new Error("Escrow record not found");
    }

    const isTokenValid =
      escrow.confirmationToken === confirmToken &&
      escrow.confirmationTokenExpires &&
      new Date(escrow.confirmationTokenExpires) > new Date();

    if (!isTokenValid) {
      throw new Error(
        escrow.confirmationTokenExpires &&
          new Date(escrow.confirmationTokenExpires) <= new Date()
          ? "Confirmation link has expired"
          : "Invalid confirmation token"
      );
    }

    // ✅ Deduct 5% platform fee
    const platformFee = escrow.amount * 0.05;
    const sellerAmount = escrow.amount - platformFee;

    escrow.releaseConditions.buyerConfirmation = true;
    escrow.status = "released";
    escrow.confirmationToken = null;
    escrow.confirmationTokenExpires = null;

    await escrow.save({ session: mongoSession });

    await Transaction.findOneAndUpdate(
      { escrowId: escrow._id, type: "held" },
      {
        type: "released",
        amount: sellerAmount,
        platformFee,
        releasedAt: new Date(),
      },
      { session: mongoSession }
    );

    await User.findByIdAndUpdate(
      escrow.sellerId._id,
      { $inc: { wallet: sellerAmount } },
      { session: mongoSession }
    );

    await Order.findByIdAndUpdate(
      orderId,
      { status: "delivered" },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();

    const sellerEmailData = sellerFundsReleasedEmail(
      escrow.sellerId.name,
      orderId,
      escrow.amount,
      platformFee,
      sellerAmount
    );

    const buyerEmailData = buyerFundsReleasedConfirmationEmail(
      escrow.buyerId.name,
      orderId,
      escrow.sellerId.name
    );

    const { error: sellerError } = await resend.emails.send({
      from: "Spriie <contact@spriie.com>",
      to: escrow.sellerId.email,
      subject: sellerEmailData.subject,
      html: sellerEmailData.html,
    });

    if (sellerError) {
      await EmailJob.create({
        from: "Spriie <contact@spriie.com>",
        to: escrow.sellerId.email,
        subject: sellerEmailData.subject,
        html: sellerEmailData.html,
        sent: false,
      });
    }

    const { error: buyerError } = await resend.emails.send({
      from: "Spriie <contact@spriie.com>",
      to: escrow.buyerId.email,
      subject: buyerEmailData.subject,
      html: buyerEmailData.html,
    });

    if (buyerError) {
      await EmailJob.create({
        from: "Spriie <contact@spriie.com>",
        to: escrow.buyerId.email,
        subject: buyerEmailData.subject,
        html: buyerEmailData.html,
        sent: false,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Funds released successfully, emails sent/queued",
        amount: sellerAmount,
        sellerId: escrow.sellerId._id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (mongoSession) {
      await mongoSession.abortTransaction();
    }
    console.error("Confirmation error:", error);
    return NextResponse.json(
      { error: error.message || "Confirmation failed" },
      { status: 400 }
    );
  } finally {
    if (mongoSession) {
      await mongoSession.endSession();
    }
  }
}
