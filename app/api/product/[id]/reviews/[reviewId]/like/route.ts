import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongoose';
import Reviews from '@/models/reviews';
import { options } from '@/app/api/auth/options';


export async function POST(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();

    const review = await Reviews.findById(params.reviewId);
    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isLiked = review.likes.includes(userId);

    if (isLiked) {
      // Unlike
      await Reviews.findByIdAndUpdate(params.reviewId, {
        $pull: { likes: userId }
      });
    } else {
      // Like
      await Reviews.findByIdAndUpdate(params.reviewId, {
        $addToSet: { likes: userId }
      });
    }

    // Return updated review with populated user
    const updatedReview = await Reviews.findById(params.reviewId)
      .populate('user', 'name avatar');

    return NextResponse.json(updatedReview);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update like status" },
      { status: 500 }
    );
  }
}