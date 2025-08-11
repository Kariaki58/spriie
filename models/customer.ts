import mongoose, { Document, Schema } from "mongoose";
import { IOrder } from "./order";
import { IUser } from "./user";

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  storeId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  avatar?: string;
  orders: mongoose.Types.ObjectId[] | IOrder[];
  totalOrders: number;
  totalProducts: number;
  totalSpent: number;
  lastPurchase?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastPurchase: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for faster queries
CustomerSchema.index({ storeId: 1 });
CustomerSchema.index({ userId: 1 });
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ lastPurchase: -1 });

// Virtual for formatted last purchase date
CustomerSchema.virtual("lastPurchaseFormatted").get(function () {
  return this.lastPurchase
    ? this.lastPurchase.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Never";
});

// Update customer stats when orders change
CustomerSchema.pre("save", async function (next) {
  if (this.isModified("orders")) {
    const orders: IOrder[] = await mongoose.model("Order").find({
      _id: { $in: this.orders },
    });
    
    this.totalOrders = orders.length;
    this.totalProducts = orders.reduce(
      (sum: number, order: IOrder) =>
        sum + order.cartItems.reduce(
          (itemSum: number, item: { quantity: number }) => itemSum + item.quantity,
          0
        ),
      0
    );
    this.totalSpent = orders.reduce((sum: number, order: IOrder) => {
      const orderTotal = order.cartItems.reduce(
        (itemSum: number, item: { price: number; quantity: number }) => 
          itemSum + (item.price * item.quantity),
        0
      );
      return sum + orderTotal;
    }, 0);
    
    this.lastPurchase = orders.length > 0 
      ? new Date(Math.max(...orders.map(o => o.createdAt.getTime()))) 
      : undefined;
  }
  next();
});

const Customer =
  mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;