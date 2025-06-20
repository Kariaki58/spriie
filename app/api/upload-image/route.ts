import { NextRequest, NextResponse } from "next/server";
import { UploadFile } from "@/lib/cloudinary/cloud-fun";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import User from "@/models/user";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(options);

        if (!session) {
            return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
        }
        const userId = session?.user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Invalid User" }, { status: 401 });
        }

        await connectToDatabase();

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        // user has to be a seller to upload a file
        const formData = await req.formData();
        const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);


        console.log(files)

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "video/mp4", "video/mov", "video/avi", "video/mkv"];
        const maxFileSize = 10 * 1024 * 1024; // 5MB

        const errors: string[] = [];

        for (const file of files) {
            if (!(file instanceof File)) {
                continue;
            }

            if (!allowedTypes.includes(file.type)) {
                errors.push(`File type not allowed: ${file.type}`);
            }

            if (file.size > maxFileSize) {
                errors.push(`File ${file.name} is too large (max 5MB).`);
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({ errors }, { status: 400 });
        }
        const fileList: string[] = [];

        await Promise.all(
            files.map(async (file: File) => {
                const secure_url = await UploadFile(file);
                fileList.push(secure_url);
            })
        );

        return NextResponse.json({ message: fileList });

    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: "Error occurred" }, { status: 500 });
    }
}