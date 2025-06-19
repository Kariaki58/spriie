import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/order";
import Transaction from "@/models/transaction";
import Product from "@/models/product";
import connectToDatabase from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: "Reference and order ID are required" },
        { status: 400 }
      );
    }

    
    const verifyData = await verifyResponse.json();

    if (verifyData.data.status !== "success") {
      return NextResponse.json(
        { status: "failed", message: "Payment not successful" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Update order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: "processing" },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { reference },
      { status: "completed" }
    );

    // Update product stock
    for (const item of order.cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Payment verified successfully",
      order,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}