import mongoose, { Document } from "mongoose";
import { ICartItem } from "./order";


export interface ICart extends Document {
    userId: mongoose.Types.ObjectId;
    cartItems: ICartItem[];
    totalPrice: number;
}


const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "User",
        unique: true,
    },
    cartItems: [
        {
            storeId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "Store",
            },
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "Product",
            },
            name: {
                type: String,
                required: true,
            },
            size: String,
            color: String,
            quantity: {
                type: Number,
                min: 1,
                required: true,
            },
            price: {
                type: Number,
                min: 0,
                required: true,
            },
            totalPrice: {
                type: Number,
                min: 0,
            }
        },
    ],
    subCartTotalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
}, { timestamps: true });


const Cart = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
