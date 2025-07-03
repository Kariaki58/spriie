import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import User from "@/models/user";
import Product from "@/models/product";
import Store from "@/models/store";
import connectToDatabase from "@/lib/mongoose";



export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(options);


        if (!session || !session.user) {
            return NextResponse.json(
                { error: "you are not logged in " },
                { status: 404 }
            )
        }
        
        if (session.user.role !== "seller") {
            return NextResponse.json(
                { error: "you are not a seller" },
                { status: 400 }
            )
        }

        console.log({session})
        await connectToDatabase();

        const user = await User.findOne({ _id: session.user.id })
        
        if (!user) {
            return NextResponse.json(
            { error: "you are not logged in " },
            { status: 404}
            )
        }
        if (user.role !== "seller") {
            return NextResponse.json(
                { error: "you are not logged in " },
                { status: 404}
            )
        }

        const store = await Store.findOne({ userId: user._id }).populate('products');
        
        if (!store) {
            return NextResponse.json(
                { error: "you don not have a store " },
                { status: 404 }
            )
        }

        const userContent = store.products

        return NextResponse.json({
            message: userContent
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "Bad Request"
        }, { status: 500})
    }
}