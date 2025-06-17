import { NextRequest, NextResponse } from "next/server";
import { UploadFile } from "@/lib/cloudinary/cloud-fun";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/product";
import Category from "@/models/category";
import Tags from "@/models/tags";
import User from "@/models/user";
import { options } from "../../auth/options";
import { getServerSession } from "next-auth";


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const session = await getServerSession(options);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const basePrice = formData.get("basePrice") as string;
        const discountedPrice = formData.get("discountedPrice") as string;
        const showPrice = formData.get("showPrice") as string;
        const sku = formData.get("sku") as string | null;
        const inventory = formData.get("inventory") as string;

        const video = formData.get("video") as File | null;
        const thumbnail = formData.get("thumbnail") as File | null;

        const tags = formData.getAll("tags[]") as string[];

        const images: File[] = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("images[")) {
                if (value instanceof File) {
                    images.push(value);
                }
            }
        }
        // validate all data.

        const videoUpload = video ? await UploadFile(video) : null;
        const thumbnailUpload = thumbnail ? await UploadFile(thumbnail) : null;
        const imageUploads = await Promise.all(
            images.map((image) => UploadFile(image))
        );

        await connectToDatabase();

        const userId = session.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        // if (user.role !== "admin") {
        //     return NextResponse.json(
        //         { error: "Unauthorized" },
        //         { status: 403 }
        //     );
        // }

        const category = await Category.findOneAndUpdate(
            { name: "Default Category" },
            { name: "Default Category" },
            { new: true, upsert: true }
        );

        if (!category) {
            return NextResponse.json(
                { error: "Category not found or could not be created" },
                { status: 404 }
            );
        }

        const tagsDocuments = await Promise.all(
            tags.map(async (tag) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                const existingTag = await Tags.findOne({ name: trimmedTag });
                if (existingTag) {
                    return existingTag._id;
                }
                const newTag = await Tags.create({ name: trimmedTag });
                return newTag._id;
            })
        );
        const validTags = tagsDocuments.filter((tagId) => tagId !== null);
        if (validTags.length === 0) {
            return NextResponse.json(
                { error: "No valid tags provided" },
                { status: 400 }
            );
        }

        const product = await Product.create({
            userId,
            name: title,
            description,
            basePrice: parseFloat(basePrice),
            discount: parseFloat(discountedPrice),
            showPrice: showPrice === "true",
            slug: `${title}-123`,
            sku: sku || undefined,
            stock: parseInt(inventory, 10),
            category: category?._id,
            tags: validTags,
            video: videoUpload,
            thumbnail: thumbnailUpload ? thumbnailUpload : null,
            images: imageUploads
        });

        if (!product) {
            return NextResponse.json(
                { error: "Product creation failed" },
                { status: 500 }
            );
        }
        console.log(product);

        console.log({videoUpload, thumbnailUpload, imageUploads});

        console.log({
            title,
            description,
            basePrice,
            discountedPrice,
            showPrice,
            sku,
            inventory,
            tags,
            videoName: video?.name,
            video: video,
            thumbnailName: thumbnail?.name,
            thumbnail,
            imageCount: images.length,
            images: images
        });

        return NextResponse.json(
        {
            success: true,
            message: "Form data received",
            data: {
                title,
                description,
                basePrice,
                discountedPrice,
                showPrice,
                sku,
                inventory,
                tags,
                video: video?.name,
                thumbnail: thumbnail?.name,
                imageCount: images.length,
            },
        },
        { status: 200 }
        );
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
