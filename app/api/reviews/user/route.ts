import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import Reviews from "@/models/reviews";
import Product from "@/models/product";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    await connectToDatabase();

    const reviews = await Reviews.find({ userId })
      .populate({
        path: "productId",
        model: Product,
        select: "title thumbnail"
      })
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map(review => ({
      id: review._id.toString(),
      productId: review.productId._id.toString(),
      productName: review.productId.title,
      productImage: review.productId.thumbnail,
      rating: review.rating,
      date: review.createdAt.toISOString(),
      comment: review.comment,
      reviewImage: review.reviewImage
    }));

    return NextResponse.json({ reviews: formattedReviews });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}