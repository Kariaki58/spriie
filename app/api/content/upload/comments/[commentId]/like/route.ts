import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongoose';
import Comment from '@/models/comments';
import { options } from '@/app/api/auth/options';

export async function POST(
  request: Request,
  { params }: { params: { commentId: string } }
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

    const comment = await Comment.findById(params.commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      // Unlike
      await Comment.findByIdAndUpdate(params.commentId, {
        $pull: { likes: userId }
      });
    } else {
      // Like
      await Comment.findByIdAndUpdate(params.commentId, {
        $addToSet: { likes: userId }
      });
    }

    // Return updated comment with populated user
    const updatedComment = await Comment.findById(params.commentId)
      .populate('user', 'name avatar');

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update like status" },
      { status: 500 }
    );
  }
}