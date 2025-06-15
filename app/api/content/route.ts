import { NextRequest, NextResponse } from "next/server";
import Product from "@/models/product";
import connectToDatabase from "@/lib/mongoose";



export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const product = await Product.find({});

        return NextResponse.json({
            message: product
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            error: "Bad Request"
        }, { status: 500})
    }
}