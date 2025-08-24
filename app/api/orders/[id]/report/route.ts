import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/order";
import Escrow from "@/models/EscrowTransaction";
import User from "@/models/user";
import { adminOrderProblemReportEmail, sellerOrderProblemReportEmail } from "@/lib/email/email-templates";
import { resend } from "@/lib/email/resend";
import { getServerSession } from "next-auth";
import { options } from "@/app/api/auth/options";
import Store from "@/models/store";
import EmailJob from "@/models/emailJob";


export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: orderId } = await params;

  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json(
      { error: "Authentication Required" },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    const { confirmToken, problem } = await req.json();

    if (!confirmToken || !problem?.trim()) {
      return NextResponse.json(
        { error: "Confirmation token and problem description are required" },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId).populate("userId");

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId._id.toString() !== session?.user.id) {
      return NextResponse.json(
        { error: "We could not find your Order" },
        { status: 404 }
      );
    }

    const userIdWithStore = await Store.findOne({ _id: order.storeId }).populate(
      "userId"
    );

    const escrow = await Escrow.findOne({ orderId });

    if (!escrow || escrow.confirmationToken !== confirmToken) {
      return NextResponse.json(
        { error: "Invalid confirmation token" },
        { status: 401 }
      );
    }

    // update order with problem report
    order.status = "problem_reported";
    order.problemReports = order.problemReports || [];
    order.problemReports.push({
      reportedAt: new Date(),
      description: problem,
      status: "pending_review",
    });

    await order.save();

    // prepare email payloads
    const adminPayload = adminOrderProblemReportEmail(
      orderId,
      order.userId.name,
      problem
    );
    const sellerPayload = sellerOrderProblemReportEmail(
      orderId,
      userIdWithStore.userId.name,
      order.userId.name,
      problem
    );

    // try sending admin email
    const { error: adminError } = await resend.emails.send({
      from: "Spriie <contact@spriie.com>",
      to: process.env.ADMIN_EMAIL!,
      ...adminPayload,
    });

    if (adminError) {
      await EmailJob.create({
        to: process.env.ADMIN_EMAIL!,
        ...adminPayload,
      });
    }

    // try sending seller email
    const { error: sellerError } = await resend.emails.send({
      from: "Spriie <contact@spriie.com>",
      to: userIdWithStore.userId.email,
      ...sellerPayload,
    });

    if (sellerError) {
      await EmailJob.create({
        to: userIdWithStore.userId.email,
        ...sellerPayload,
      });
    }

    return NextResponse.json(
      { success: true, message: "Problem reported successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Problem report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to report problem" },
      { status: 500 }
    );
  }
}
