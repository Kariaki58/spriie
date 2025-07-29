import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Comment from "@/models/comments";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(options);
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    
    const commentId = (await params).id;
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return NextResponse.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }

    if (comment.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    await comment.deleteOne();

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}