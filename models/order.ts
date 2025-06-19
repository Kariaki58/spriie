import mongoose, { Document, Schema } from "mongoose";

export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    name: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
}


export interface IOrder extends Document {
    userId: mongoose.Types.ObjectId;
    storeId: mongoose.Types.ObjectId;
    cartItems: ICartItem[];
    status: "pending" | "processing" | "completed" | "cancelled";
    shippingAddress: Record<string, any>;
    paymentMethod: string;
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
        cartItems: {
            type: [
                {
                    productId: { type: mongoose.Types.ObjectId, required: true, ref: "Product" },
                    name: { type: String, required: true },
                    quantity: { type: Number, required: true, min: 1 },
                    size: { type: String },
                    color: { type: String },
                    price: { type: Number, required: true, min: 0 },
                },
            ],
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "processing", "completed", "cancelled"],
            default: "pending",
        },
        shippingAddress: {
            type: Schema.Types.Mixed, // Allows storing any structured object
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ["credit_card", "paypal", "bank_transfer", "cash_on_delivery", "paystack"],
        },
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
