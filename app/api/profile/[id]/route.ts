import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/product";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import mongoose from "mongoose";
import User from "@/models/user";

export async function GET(req: NextRequest, { params }: {
    params: { id: string }
}) {
    try {
        const profileID = await params;

        console.log({
            profileID
        });
        
        const session = await getServerSession(options);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized: Please log in" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        const userId = session.user?.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(profileID.id)) {
            return NextResponse.json(
                { error: "Invalid user ID" },
                { status: 400 }
            );
        }

        const user = await User.findById(profileID.id);
        if (!user) {
            return NextResponse.json({
                error: "Invalid user"
            }, { status: 404 });
        }

        const userUpload = await Product.find({ userId: profileID.id }).populate('userId')

        console.log({ userUpload })
        console.log(userUpload.userId)


        return NextResponse.json({
            message: userUpload
        }, { status: 200 });

    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "Something went wrong",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}