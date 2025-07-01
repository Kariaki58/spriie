import { NextResponse, NextRequest } from "next/server";
import Comment from "@/models/comments";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/product";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log(productId)

    const comment = await Comment.find({ product: productId})
    

    const comments = await Comment.find({ product: productId, parentComment: { $exists: false } })
      .populate({
        path: "user",
        select: "name image"
      })
      .populate({
        path: "replies",
        populate: {
          path: "user",
          select: "name image"
        }
      })
      .sort({ createdAt: -1 });

    console.log({comments})

    return NextResponse.json(comments, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);

  console.log("line 48")
  
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    
    const { content, productId, parentCommentId } = await req.json();

    console.log({
        content,
        productId,
        parentCommentId
    })
    
    if (!content || !productId) {
      return NextResponse.json(
        { error: "Content and product ID are required" },
        { status: 400 }
      );
    }

    const commentData: any = {
      user: session.user.id,
      product: productId,
      content,
      replies: [],
      likes: []
    };

    if (parentCommentId) {
      commentData.parentComment = parentCommentId;
    }

    const newComment = await Comment.create(commentData);

    // If this is a reply, add it to the parent comment's replies array
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: newComment._id }
      });
    }
    console.log("line 98")
    // Populate user data before returning
    const populatedComment = await Comment.findById(newComment._id)
      .populate("user", "name image");

    console.log([
      populatedComment
    ])
    
    console.log("line 103")
    return NextResponse.json(populatedComment, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}