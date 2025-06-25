import { NextRequest, NextResponse } from "next/server";
import { UploadFile, DeleteFile } from "@/lib/cloudinary/cloud-fun";
import connectToDatabase from "@/lib/mongoose";
import Product from "@/models/product";
import Category from "@/models/category";
import Tags from "@/models/tags";
import User from "@/models/user";
import Store from "@/models/store";
import { options } from "@/app/api/auth/options";
import { getServerSession } from "next-auth";
import { Types } from "mongoose";


const getPublicIdFromUrl = (url: string) => {
    const parts = url.split('/');
    return parts.slice(-1)[0].split('.')[0];
};


interface Category {
    _id: Types.ObjectId;
    name: string;
}

interface Tag {
    _id: Types.ObjectId;
    name: string;
}

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
}

interface ProductAttribute {
    name: string;
    values: Array<{
        value: string;
        label: string;
    }>;
}

interface ProductDocument {
    _id: Types.ObjectId;
    title: string;
    description: string;
    basePrice: number;
    discountedPrice: number;
    showPrice: boolean;
    hasVariants: boolean;
    sku?: string;
    inventory: number;
    category?: Category;
    tags: Tag[];
    video: CloudinaryResource;
    thumbnail: CloudinaryResource;
    images: CloudinaryResource[];
    attributes: ProductAttribute[];
    __v: number;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = await params;

        // Validate the ID
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        console.log({ id })
        const product = await Product.findById(id)
        .populate('category')
        .populate('tags')
        .populate('comments')
        .populate('likes')

        console.log({product})

        if (!product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        // Type assertion for the product document
        const productDoc = product as unknown as ProductDocument;

        console.log("*******************")
        console.log(productDoc)
        console.log("*******************")


        // Transform the product data for the client
        const responseData = {
            id: productDoc._id.toString(),
            title: productDoc.title,
            description: productDoc.description,
            basePrice: productDoc.basePrice.toString(),
            discountedPrice: productDoc.discountedPrice.toString(),
            showPrice: productDoc.showPrice,
            hasVariants: productDoc.hasVariants,
            sku: productDoc.sku || undefined,
            inventory: productDoc.inventory.toString(),
            tags: productDoc.tags.map((tag) => ({
                label: tag.name,
                value: tag.name
            })),
            category: productDoc.category ? {
                label: productDoc.category.name,
                value: productDoc.category.name
            } : undefined,
            video: productDoc.video,
            thumbnail: productDoc.thumbnail,
            images: productDoc.images,
            attributes: productDoc.attributes || []
        };

        return NextResponse.json({message: responseData}, { status: 200 });

    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params; // No need for await here, params is an object
        const formData = await req.formData();

        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>")
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>")

        const session = await getServerSession(options);

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectToDatabase();

        // Verify user and product ownership
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
                { error: "Only sellers can update products" },
                { status: 403 }
            );
        }

        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        if (!existingProduct.userId.equals(userId)) {
            return NextResponse.json(
                { error: "You don't have permission to edit this product" },
                { status: 403 }
            );
        }

        // Prepare update data
        const updateData: any = {};
        const filesToDelete: string[] = [];

        // Handle basic fields
        const fieldsToUpdate = ['title', 'description', 'basePrice', 'discountedPrice', 'inventory', 'showPrice', 'sku', 'hasVariants'];
        fieldsToUpdate.forEach(field => {
            if (formData.has(field)) {
                const value = formData.get(field);
                if (field === 'basePrice' || field === 'discountedPrice') {
                    updateData[field] = parseFloat(value as string);
                } else if (field === 'inventory') {
                    updateData[field] = parseInt(value as string, 10);
                } else if (field === 'showPrice' || field === 'hasVariants') {
                    updateData[field] = value === "true";
                } else {
                    updateData[field] = value;
                }
            }
        });

        // Handle slug if title is updated
        if (updateData.title) {
            updateData.slug = updateData.title.toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .trim();
        }

        // Handle category
        if (formData.has("category")) {
            const categoryValue = formData.get("category") as string;
            if (categoryValue) {
                const category = await Category.findOneAndUpdate(
                    { name: categoryValue },
                    { $setOnInsert: { name: categoryValue } },
                    { new: true, upsert: true }
                );
                updateData.category = category._id;
            }
        }

        // Handle tags
        if (formData.has("tags[]")) {
            const tags = formData.getAll("tags[]") as string[];
            const tagsDocuments = await Promise.all(
                tags.map(async (tag) => {
                    const trimmedTag = tag.trim();
                    if (!trimmedTag) return null;
                    const existingTag = await Tags.findOne({ name: trimmedTag });
                    if (existingTag) return existingTag._id;
                    
                    const newTag = await Tags.create({ name: trimmedTag });
                    return newTag._id;
                })
            );
            updateData.tags = tagsDocuments.filter((tagId): tagId is Types.ObjectId => tagId !== null);
        }

        // Handle attributes if hasVariants is true
        if (formData.has("hasVariants") && formData.get("hasVariants") === "true") {
            const attributes: {
                name: string;
                values: { value: string; label: string }[];
            }[] = [];

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
                        
                        if (!values[valueIndex]) {
                            values[valueIndex] = { value: '', label: '' };
                        }
                        
                        if (type === 'value' || type === 'label') {
                            values[valueIndex][type] = value as string;
                        }
                    }
                }

                if (name && values.length > 0) {
                    attributes.push({
                        name,
                        values: values.filter(v => v.value && v.label)
                    });
                }
            }

            updateData.attributes = attributes.length > 0 ? attributes : undefined;
        } else if (formData.has("hasVariants")) {
            updateData.attributes = undefined;
        }

        // Handle video update
        const video = formData.get("video") as File | null;
        if (video) {
            const videoUpload = await UploadFile(video);
            if (existingProduct.video?.public_id) {
                filesToDelete.push(existingProduct.video.public_id);
            }
            updateData.video = videoUpload;
        }

        // Handle thumbnail update
        const thumbnail = formData.get("thumbnail") as File | null;
        if (thumbnail) {
            const thumbnailUpload = await UploadFile(thumbnail);
            if (existingProduct.thumbnail?.public_id) {
                filesToDelete.push(existingProduct.thumbnail.public_id);
            }
            updateData.thumbnail = thumbnailUpload;
        }

        // Handle images update
        const newImages: File[] = [];
        const existingImageUrls: string[] = [];
        const removedImageUrls: string[] = [];

        // Collect new images, existing images to keep, and removed images
        for (const [key, value] of formData.entries()) {
            if (key.startsWith("images[")) {
                if (value instanceof File) {
                    newImages.push(value);
                }
            } else if (key.startsWith("existingImages[")) {
                existingImageUrls.push(value as string);
            } else if (key.startsWith("removedImages[")) {
                removedImageUrls.push(value as string);
            }
        }

        // Upload new images
        let newImageUploads: any[] = [];
        if (newImages.length > 0) {
            newImageUploads = await Promise.all(newImages.map(image => UploadFile(image)));
        }

        // Filter existing images to keep only those in existingImageUrls
        

        // Combine kept images with new ones
        console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\")
        console.log([...existingImageUrls, ...newImageUploads])
        console.log("\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\")

        updateData.images = [...existingImageUrls, ...newImageUploads];

        // Mark images for deletion (either explicitly removed or not in existingImageUrls)
        existingProduct.images.forEach((img: any) => {
            if (!existingImageUrls.includes(img.url) || removedImageUrls.includes(img.url)) {
                if (img.public_id) {
                    filesToDelete.push(img.public_id);
                }
            }
        });

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        // Delete old files in the background
        if (filesToDelete.length > 0) {
            Promise.all(filesToDelete.map(publicId => DeleteFile(getPublicIdFromUrl(publicId))))
                .catch(error => console.error("Error deleting old files:", error));
        }

        return NextResponse.json(
            {
                success: true,
                message: "Product updated successfully",
                data: {
                    id: updatedProduct._id,
                    title: updatedProduct.title,
                    slug: updatedProduct.slug,
                    attributes: updatedProduct.attributes
                }
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Product update error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}