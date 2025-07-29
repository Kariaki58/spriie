import { NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongoose"
import User from "@/models/user"
import bcrypt from "bcryptjs";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "All filed are required" }, { status: 400 })
        }

        await connectToDatabase();
        let findUser = await User.findOne({ email: email });

        if (findUser) {
            return NextResponse.json({ error: "you already have an account" }, { status: 400 })
        }

        const hashPassword = await bcrypt.hash(password, 10);
        findUser = await User.create({
            name,
            email,
            password: hashPassword,
            authMethod: "email",
            role: "buyer",
            isVerified: false
        })

        await findUser.save()

        return NextResponse.json({ message: "Account created successfully." }, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}