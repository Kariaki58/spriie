import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateResetToken } from "@/lib/tokens";
import User from "@/models/user";
import { passwordResetEmail } from "@/lib/email/email-templates";
import connectToDatabase from "@/lib/mongoose";
import { resend } from "@/lib/email/resend";



export async function POST(req: NextRequest) {
  try {
    const email = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await connectToDatabase()

    const user = await User.findOne({ email }).select('_id email');
    if (!user) {
      return NextResponse.json(
        { message: "A reset link has been sent" },
        { status: 200 }
      );
    }
    
    if (user.authMethod === "google") {
        return NextResponse.json(
            { message: "you authenticated with google" },
            { status: 400 }
        )
    }

    const resetToken = await generateResetToken(email);
    const resetLink = `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password?token=${resetToken}`;

    const { error } = await resend.emails.send({
      from: 'Spriie <contact@spriie.com>',
      to: email,
      ...passwordResetEmail(resetLink, "1 hour"),
    });



    if (error) {
      console.error("Failed to send reset email:", error);
      throw new Error("Failed to send password reset email");
    }

    return NextResponse.json(
      { message: "A reset link has been sent" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}