import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectToDatabase();

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: "User ID is required" },
                { status: 400 }
            );
        }

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const userData = {
            _id: user._id,
            name: user.name,
            image: user.avatar,
            email: user.email,
        };

        return NextResponse.json(
            { success: true, data: userData },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}