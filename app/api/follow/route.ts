import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Follow from "@/models/following";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not Authenticated"}, { status: 401 });
    }
    
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get('followerId');
    const followingId = searchParams.get('followingId');

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    // Verify the authenticated user is the same as the followerId
    if (session.user.id !== followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existing = await Follow.findOne({ 
      follower: followerId, 
      following: followingId 
    });

    return NextResponse.json({ 
      isFollowing: !!existing 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Not Authenticated"}, { status: 401 });
    }
    
    await connectToDatabase();

    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
    }

    // Verify the authenticated user is the same as the followerId
    if (session.user.id !== followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const checkUserExist = await User.findOne({ _id: session.user.id })

    if (!checkUserExist) {
        return NextResponse.json({ error: "User Account Not found" }, { status: 404 });
    }

    const existing = await Follow.findOne({ follower: followerId, following: followingId });

    if (existing) {
      await Follow.deleteOne({ _id: existing._id });
      return NextResponse.json({ 
        message: "Unfollowed successfully",
        isFollowing: false 
      });
    }

    const follow = await Follow.create({ follower: followerId, following: followingId });
    return NextResponse.json({ 
      message: "Followed successfully", 
      follow,
      isFollowing: true 
    });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}