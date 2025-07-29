import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/options";
import connectToDatabase from "@/lib/mongoose";
import Comment from "@/models/comments";
import Like from "@/models/like";


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(options);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to like a comment" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const commentId = (await params).id;
    const userId = session.user.id;

    // Check if comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this comment
    const existingLike = await Like.findOne({ 
      user: userId, 
      comment: commentId 
    });

    if (existingLike) {
      await Like.deleteOne({ _id: existingLike._id });
      await Comment.updateOne(
        { _id: commentId },
        { $pull: { likes: existingLike._id } }
      );
      
      return NextResponse.json(
        { message: "Comment unliked successfully", liked: false },
        { status: 200 }
      );
    }

    const newLike = new Like({
      user: userId,
      comment: commentId
    });
    await newLike.save();

    await Comment.updateOne(
      { _id: commentId },
      { $addToSet: { likes: newLike._id } }
    );

    return NextResponse.json(
      { message: "Comment liked successfully", liked: true },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error liking comment:", error);
    return NextResponse.json(
      { error: "Failed to like comment" },
      { status: 500 }
    );
  }
}