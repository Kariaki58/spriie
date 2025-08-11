import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import Reviews from "@/models/reviews";
import Order from "@/models/order";
import Product from "@/models/product";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;
    const { name, email } = session.user;

    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    const { productId, orderId, rating, comment, reviewImage } = await req.json();

    if (!productId || !orderId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await connectToDatabase();

    // Verify the user ordered this product and it was delivered
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: "delivered",
      "cartItems.productId": productId
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found or product not delivered" }, { status: 404 });
    }

    // Check if already reviewed
    const existingReview = await Reviews.findOne({ userId, productId, orderId });
    if (existingReview) {
      return NextResponse.json({ error: "You've already reviewed this product" }, { status: 400 });
    }

    // Create the review
    const review = new Reviews({
      userId,
      productId,
      orderId,
      rating,
      name,
      comment,
      email,
      reviewImage: reviewImage || null
    });

    await review.save();

    // Update the order to mark this product as reviewed
    await Order.updateOne(
      { _id: orderId, "cartItems.productId": productId },
      { $set: { "cartItems.$.reviewed": true } }
    );

    // Update product rating stats
    await Product.findByIdAndUpdate(productId, {
      $inc: { totalRatings: rating, reviewCount: 1 }
    });

    return NextResponse.json({ success: true, review });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}