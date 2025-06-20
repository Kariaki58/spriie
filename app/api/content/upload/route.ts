import { NextRequest, NextResponse } from "next/server";
import { UploadFile } from "@/lib/cloudinary/cloud-fun";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/product";
import Category from "@/models/category";
import Tag from "@/models/tags";
import User from "@/models/user";
import Store from "@/models/store";
import { options } from "../../auth/options";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";

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

        // Validate required fields
        const requiredFields = ['title', 'description', 'basePrice', 'discountedPrice', 'inventory'];
        const missingFields = requiredFields.filter(field => !formData.has(field));
        
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Extract and validate basic fields
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const basePrice = parseFloat(formData.get("basePrice") as string);
        const discountedPrice = parseFloat(formData.get("discountedPrice") as string);
        const showPrice = formData.get("showPrice") === "true";
        const sku = formData.get("sku") as string | null;
        const inventory = parseInt(formData.get("inventory") as string, 10);
        const hasVariants = formData.get("hasVariants") === "true";

        // Validate numeric fields
        if (isNaN(basePrice)) {
            return NextResponse.json(
                { error: "Base price must be a valid number" },
                { status: 400 }
            );
        }
        if (isNaN(discountedPrice)) {
            return NextResponse.json(
                { error: "Discounted price must be a valid number" },
                { status: 400 }
            );
        }
        if (isNaN(inventory)) {
            return NextResponse.json(
                { error: "Inventory must be a valid number" },
                { status: 400 }
            );
        }

        // Validate files
        const video = formData.get("video") as File | null;
        const thumbnail = formData.get("thumbnail") as File | null;
        const images: File[] = [];
        
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("images[")) {
                if (value instanceof File) {
                    images.push(value);
                }
            }
        }

        if (!video) {
            return NextResponse.json(
                { error: "Video file is required" },
                { status: 400 }
            );
        }
        if (!thumbnail && images.length === 0) {
            return NextResponse.json(
                { error: "Either thumbnail or at least one image is required" },
                { status: 400 }
            );
        }

        // Process attributes if hasVariants is true
        const attributes: {
            name: string;
            values: { value: string; label: string }[];
        }[] = [];

        if (hasVariants) {
            const attributeIndices = new Set<string>();
            
            // Get all unique attribute indices
            for (const [key] of formData.entries()) {
                const match = key.match(/attributes\[(\d+)\]\[name\]/);
                if (match) {
                    attributeIndices.add(match[1]);
                }
            }

            // Process each attribute
            for (const index of attributeIndices) {
                const name = formData.get(`attributes[${index}][name]`) as string;
                if (!name) continue;

                const values: { value: string; label: string }[] = [];
                
                // Get all values for this attribute
                for (const [key, value] of formData.entries()) {
                    const valueMatch = key.match(`attributes\\[${index}\\]\\[values\\]\\[(\\d+)\\]\\[(value|label)\\]`);
                    if (valueMatch) {
                        const valueIndex = parseInt(valueMatch[1], 10);
                        const type = valueMatch[2]; // 'value' or 'label'
                        
                        // Initialize if not exists
                        if (!values[valueIndex]) {
                            values[valueIndex] = { value: '', label: '' };
                        }
                        
                        // Set the appropriate property
                        if (type === 'value' || type === 'label') {
                            values[valueIndex][type] = value as string;
                        }
                        // values[valueIndex][type] = value as string;
                    }
                }

                // Filter out any empty values and add to attributes array
                if (name && values.length > 0) {
                    attributes.push({
                        name,
                        values: values.filter(v => v.value && v.label)
                    });
                }
            }
        }

        // Upload files to Cloudinary
        const [videoUpload, thumbnailUpload, ...imageUploads] = await Promise.all([
            UploadFile(video!),
            thumbnail ? UploadFile(thumbnail) : Promise.resolve(null),
            ...images.map(image => UploadFile(image))
        ]);

        await connectToDatabase();

        // Verify user
        const userId = new Types.ObjectId(session.user.id);
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }
        if (user.role !== "seller") {
            return NextResponse.json(
                { error: "Register as a seller to list products" },
                { status: 403 }
            );
        }

        const findStore = await Store.findOne({
            userId
        })

        if (!findStore) {
            return NextResponse.json(
                { error: "You don't currently have a store." },
                { status: 404 }
            )
        }

        // Process category
        const categoryValue = formData.get("category") as string | null;
        let categoryId: Types.ObjectId | null = null;

        if (categoryValue) {
            const category = await Category.findOneAndUpdate(
                { name: categoryValue },
                { $setOnInsert: { name: categoryValue } },
                { new: true, upsert: true }
            );
            categoryId = category._id;
        } else {
            // Fallback to default category if none provided
            const defaultCategory = await Category.findOneAndUpdate(
                { name: "default" },
                { $setOnInsert: { name: "default" } },
                { new: true, upsert: true }
            );
            categoryId = defaultCategory._id;
        }

        // Process tags
        const tags = formData.getAll("tags[]") as string[];
        const tagsDocuments = await Promise.all(
            tags.map(async (tag) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                const existingTag = await Tag.findOne({ name: trimmedTag });
                if (existingTag) return existingTag._id;
                
                const newTag = await Tag.create({ 
                    name: trimmedTag, 
                });
                return newTag._id;
            })
        );
        const validTags = tagsDocuments.filter((tagId): tagId is Types.ObjectId => tagId !== null);

        // Generate slug
        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .trim();
        
        // Create product
        const product = await Product.create({
            userId,
            title,
            slug,
            description,
            basePrice,
            discountedPrice,
            showPrice,
            hasVariants,
            sku: sku || undefined,
            inventory,
            category: categoryId,
            tags: validTags,
            video: videoUpload,
            thumbnail: thumbnailUpload || imageUploads[0],
            images: imageUploads,
            attributes: attributes.length > 0 ? attributes : undefined
        });

        return NextResponse.json(
            {
                success: true,
                message: "Product created successfully",
                data: {
                    id: product._id,
                    title: product.title,
                    slug: product.slug,
                    attributes: product.attributes // Include in response for verification
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Product creation error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}