import Product from "@/models/product";
import Tags from "@/models/tags";
import connectToDatabase from "@/lib/mongoose";
import { NextResponse, NextRequest } from "next/server";


export async function GET(req: NextRequest, { params }: {
    params: { id: string }
}) {
    try {
        const { id: _id } = await params;

        console.log({_id})
        await connectToDatabase();

        const product = await Product.findOne({ _id });

        console.log(product);
        return NextResponse.json({
            message: product
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({
            error: "something went wrong"
        }, { status: 200 })
    }
}