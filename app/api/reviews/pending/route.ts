import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import Order from "@/models/order";
import Product from "@/models/product";
import { Types } from "mongoose";

interface ProductDocument {
  _id: Types.ObjectId;
  title: string;
  thumbnail: string;
}

interface CartItem {
  reviewed: boolean;
  name?: string;
  productId?: ProductDocument | null;
}

interface OrderDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: string;
  cartItems: CartItem[];
  updatedAt: Date;
}

interface PendingReview {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  deliveredDate: string;
}



export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session) {
      return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
    }

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Invalid User" }, { status: 401 });
    }

    await connectToDatabase();

    // Find orders that are delivered and have items not reviewed yet
    const orders = await Order.find({
      userId,
      status: "delivered",
      "cartItems.reviewed": false
    }).populate({
      path: "cartItems.productId",
      model: Product
    });

    // Filter out products that haven't been reviewed yet
    const pendingReviews: PendingReview[] = orders.flatMap((order: OrderDocument) => 
        order.cartItems
            .filter((item: CartItem) => !item.reviewed && item.productId)
            .map((item: CartItem) => ({
                id: item.productId!._id.toString(),
                orderId: order._id.toString(),
                productId: item.productId!._id.toString(),
                productName: item.name || item.productId!.title,
                productImage: item.productId!.thumbnail,
                deliveredDate: order.updatedAt.toISOString().split("T")[0]
        }))
    );

    return NextResponse.json({ pendingReviews });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error occurred" }, { status: 500 });
  }
}