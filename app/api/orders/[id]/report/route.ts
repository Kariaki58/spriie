import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Order from "@/models/order";
import Escrow from "@/models/EscrowTransaction";
import User from "@/models/user";
import { adminOrderProblemReportEmail, sellerOrderProblemReportEmail } from "@/lib/email/email-templates";
import { resend } from "@/lib/email/resend";


export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: orderId } = await params;
  
  try {
    await connectToDatabase();
    
    const { confirmToken, problem } = await req.json();

    // 1. Validate the request
    if (!confirmToken || !problem?.trim()) {
      return NextResponse.json(
        { error: "Confirmation token and problem description are required" },
        { status: 400 }
      );
    }

    // 2. Verify the order and escrow
    const order = await Order.findById(orderId)
      .populate('buyerId')
      .populate('sellerId')
      .populate('items.product');

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const escrow = await Escrow.findOne({ orderId });

    if (!escrow || escrow.confirmationToken !== confirmToken) {
      return NextResponse.json(
        { error: "Invalid confirmation token" },
        { status: 401 }
      );
    }

    // 3. Update order status and add problem report
    order.status = "problem_reported";
    order.problemReports = order.problemReports || [];
    order.problemReports.push({
      reportedAt: new Date(),
      description: problem,
      status: "pending_review"
    });

    await order.save();

    // 4. Send notifications (non-blocking)
    try {
      // Get admin users
    //   const admins = await User.find({ role: "admin" }).select("email");
    //   const adminEmails = admins.map(admin => admin.email);

    //   await resend.emails.send({
    //     from: 'Spriie <contact@spriie.com>',
    //     to: "",
    //     ...adminOrderProblemReportEmail(orderId, order.buyerId.name, problem)
    //   })

      await resend.emails.send({
        from: 'Spriie <contact@spriie.com>',
        to: order.sellerId.email,
        ...sellerOrderProblemReportEmail(
          orderId,
          order.sellerId.name,
          order.buyerId.name,
          problem
        )
      })

    } catch (emailError) {
      console.error("Failed to send problem report emails:", emailError);
      // Continue even if emails fail
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