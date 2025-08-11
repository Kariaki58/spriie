import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import Reviews from "@/models/reviews";
import Product from "@/models/product";


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(options);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user?.id;
    const reviewId = (await params).id;

    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 401 });
    }

    if (!reviewId) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Find the review first to get the rating before deleting
    const review = await Reviews.findOne({ _id: reviewId, userId });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found or you don't have permission to delete it" },
        { status: 404 }
      );
    }

    // Delete the review
    await Reviews.deleteOne({ _id: reviewId, userId });

    // Update the product's rating stats
    await Product.findByIdAndUpdate(review.productId, {
      $inc: {
        totalRatings: -review.rating,
        reviewCount: -1
      }
    });

    return NextResponse.json(
      { success: true, message: "Review deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}