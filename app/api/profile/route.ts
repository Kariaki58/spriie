import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";


export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session) {
            return NextResponse.json({ error: "you are not logged in" }, { status: 400 })
        }
        await connectToDatabase();
        const user = await User.findOne({ _id: session?.user.id }).select('-password');


        if (!user) {
            return NextResponse.json({ error: "user not found" }, { status: 404 })
        }

        return NextResponse.json({ message: user }, { status: 200 })
        
    } catch (error) {
        return NextResponse.json({ error: "something went wrong" }, { status: 500 })
    }
}