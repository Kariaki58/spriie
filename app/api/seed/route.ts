import connectToDatabase from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user"; // adjust path if needed

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Update all users where `wallet` is undefined
    const result = await User.updateMany(
      { wallet: { $exists: false } }, // Only users without wallet
      { $set: { wallet: 0 } }
    );

    return NextResponse.json({
      message: "Wallet field seeded for users",
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error seeding wallets:", error);
    return NextResponse.json({ error: "Failed to seed wallets" }, { status: 500 });
  }
}
