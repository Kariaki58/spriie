import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Product from "@/models/product";
import Store from "@/models/store";


export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(options);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();


    // Find user
    const user = await User.findOne({ _id: session.user.id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the store by user ID
    const store = await Store.findOne({ userId: user._id }).populate("products").lean();

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ store }, { status: 200 });
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
