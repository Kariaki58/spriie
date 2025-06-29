import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import Product from "@/models/product";
import connectToDatabase from "@/lib/mongoose";



export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const product = await Product.find({})
        .sort({ createdAt: -1 })
        .populate('userId');

        console.log(product)
        return NextResponse.json({
            message: product
        }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({
            error: "Bad Request"
        }, { status: 500})
    }
}