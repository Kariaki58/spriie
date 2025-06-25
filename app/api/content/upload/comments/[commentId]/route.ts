import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongoose';
import Comment from '@/models/comments';
import { options } from '@/app/api/auth/options';

export async function DELETE(
  request: NextRequest,
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

    // Find the comment
    const comment = await Comment.findById(params.commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user owns the comment
    if (comment.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    // Delete the comment and all its replies
    await Comment.deleteMany({
      $or: [
        { _id: params.commentId },
        { parentCommentId: params.commentId }
      ]
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}