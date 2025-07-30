import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongoose";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            $unset: {
                resetToken: "",
                resetTokenExpires: ""
            }
        });

        return NextResponse.json(
            { message: "Password reset successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Password reset error:", error);
        return NextResponse.json(
            { error: "An error occurred while resetting password" },
            { status: 500 }
        );
    }
}