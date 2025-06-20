import mongoose, { Document, Schema, Types } from "mongoose";

export interface IProduct extends Document {
  userId: Types.ObjectId;
  title: string;
  slug: string;
  sku?: string;
  basePrice: number;
  discountedPrice: number;
  category: Types.ObjectId;
  description: string;
  inventory: number;
  video: string;
  thumbnail: string;
  images: string[];
  showPrice: boolean;
  hasVariants: boolean;
  attributes: {
    name: string;
    values: { value: string; label: string }[];
  }[];
  tags: Types.ObjectId[];
  reviews: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sku: {
      type: String,
      index: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    inventory: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    video: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
      validate: [(val: string[]) => val.length > 0, "At least one image is required"],
    },
    showPrice: {
      type: Boolean,
      default: true,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    attributes: [
      {
        name: { type: String, required: true },
        values: [
          {
            value: { type: String, required: true },
            label: { type: String, required: true },
          },
        ],
      },
    ],
    tags: [{
      type: Schema.Types.ObjectId,
      ref: "Tag",
    }],
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: "Review",
    }],
  },
  { timestamps: true }
);

// Compound index for faster queries
ProductSchema.index({ userId: 1, slug: 1 }, { unique: true });
ProductSchema.index({ title: "text", description: "text" });

// Virtual for discount percentage
ProductSchema.virtual("discountPercentage").get(function (this: IProduct) {
  return Math.round(((this.basePrice - this.discountedPrice) / this.basePrice) * 100);
});

// Ensure virtuals are included in toJSON output
ProductSchema.set("toJSON", { virtuals: true });

const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;