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
            storeName: {
                type: String,
                required: true
            },
            productId: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "Product",
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


CartSchema.pre("save", function (next) {
  this.cartItems.forEach(item => {
    item.totalPrice = item.price * item.quantity;
  });
  next();
});



const Cart = mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);

export default Cart;
