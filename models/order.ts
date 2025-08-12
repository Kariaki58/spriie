import mongoose, { Document, Schema, Types } from "mongoose";

export interface ICartItemVariant {
  attribute: string;
  value: string;
}

export interface ICartItem {
  productId: Types.ObjectId;
  storeId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  reviewed?: boolean;
  variants?: ICartItemVariant[];
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  storeId: Types.ObjectId;
  cartItems: ICartItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
  shippingAddress: Record<string, any>;
  paymentMethod: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    storeId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    cancellationReason: {
      type: String,
    },
    cartItems: {
      type: [
        {
          productId: { type: mongoose.Types.ObjectId, required: true, ref: "Product" },
          storeId: { type: mongoose.Types.ObjectId, required: true, ref: "Store" },
          name: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true, min: 0 },
          reviewed: { type: Boolean, default: false },
          variants: [{
            attribute: { type: String },
            value: { type: String }
          }],
        },
      ],
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    shippingAddress: {
      type: Schema.Types.Mixed,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["wallet", "bank_transfer", "cash_on_delivery", "paystack"],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;