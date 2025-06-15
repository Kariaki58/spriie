import mongoose, { Document } from "mongoose";


export interface IProduct extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    sku: string;
    basePrice: number;
    discount: number;
    category: mongoose.Types.ObjectId;
    // variants: IVariant[];
    video: string[];
    description: string;
    stock: number;
    thumbnail: string;
    images: string[];
    showPrice: boolean;
    // aditionalInfo: mongoose.Types.ObjectId;
    reviews: mongoose.Types.ObjectId[];
    tags: mongoose.Types.ObjectId[];
}

// const VariantSchema = new mongoose.Schema({
//     size: { type: String, required: true },
//     color: { type: String, required: true },
//     price: { type: Number, required: true, min: 0 },
//     stock: { type: Number, required: true, min: 0 },
//     image: { type: [String], required: true }
// });

const ProductSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "User"
        },
        name: {
            type: String,
            required: true,
            index: true
        },
        sku: {
            type: String,
            required: true,
            index: true
        },
        slug: {
            type: String,
            required: true,
            index: true
        },
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            min: 0
        },
        discount: {
            type: Number,
            required: true,
            min: 0
        },
        category: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: "Category"
        },
        // variants: {
        //     type: [VariantSchema],
        //     required: true
        // },
        video: {
            type: String,
        },
        description: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        images: {
            type: [String],
            required: true
        },
        showPrice: {
            type: Boolean,
            default: true
        },
        // aditionalInfo: {
        //     type: mongoose.Types.ObjectId,
        //     ref: "ProductPage"
        // },
        reviews: {
            type: [mongoose.Types.ObjectId],
            ref: "Review"
        },
        tags: {
            type: [mongoose.Types.ObjectId],
            ref: "Tag"
        }
    },
    { timestamps: true }
);

ProductSchema.index({ userId: 1, slug: 1 }, { unique: true });

const Product = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
