import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import User from "@/models/user";
import AddressModel from "@/models/address";


export async function GET(req: NextRequest) {
    try {
        return NextResponse.json({ message: "address data" }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ error: "something went wrong" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = getServerSession(options);
        const address = await req.json();

        console.log(address)


        return NextResponse.json({ message: "address data" }, { status: 200 })

    } catch (err) {
        return NextResponse.json({ error: "something went wrong" }, { status: 500 })
    }
}