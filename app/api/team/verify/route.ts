import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Team from "@/models/Team";
import User from "@/models/user";
import Store from "@/models/store";


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    await connectToDatabase();


    const invitation = await Team.findOne({
      email,
      verificationToken: token,
      status: "pending",
      tokenExpires: { $gt: new Date() },
    }).populate("storeId");

    if (!invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    
    if (user) {
      // Update invitation
      invitation.userId = user._id;
      invitation.status = "active";
      invitation.verificationToken = undefined;
      invitation.tokenExpires = undefined;
      await invitation.save();

      return NextResponse.json({
        success: true,
        userExists: true,
        storeName: invitation.storeId.storeName,
      });
    } else {
      return NextResponse.json({
        success: true,
        userExists: false,
        storeName: invitation.storeId.storeName,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}