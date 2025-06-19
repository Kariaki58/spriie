import Order from "@/models/order";
import Transaction from "@/models/transaction";
import Product from "@/models/product";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("storeId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await getServerSession(options);
    const {
      product,
      customer,
      currency,
      paymentMethod,
      qty,
      reference,
      trxref,
      transaction
    }: {
      product: {
        _id: string;
        name: string;
        basePrice: number;
        quantity: number;
        thumbnail: string;
      };
      customer: any;
      currency: string;
      paymentMethod: string;
      qty: number;
      reference: string;
      trxref: string;
      transaction: string;
    } = body;

    // Validate required fields
    if (!product || !customer || !currency || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!session) {
        return NextResponse.json({
            error: "You are not loged in"
        }, { status: 404 })
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: session.user?.id })

    if (!user) {
        return NextResponse.json({
            error: "you are not a valid user"
        }, { status: 404 })
    }
    // Find the product
    console.log({ productId: product._id })
    const dbProduct = await Product.findById(product._id);
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock
    if (qty < product.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock available" },
        { status: 400 }
      );
    }

    // Create order in database (pending status)
    const order = new Order({
      userId: user._id,
      storeId: dbProduct.userId,
      cartItems: [
        {
          productId: product._id,
          name: product.name,
          quantity: qty,
          price: product.basePrice,
        },
      ],
      status: "pending",
      shippingAddress: {
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        country: customer.country,
      },
      paymentMethod,
    });

    console.log("line 117")

    await order.save();

    console.log("pass")

    const transactionDb = new Transaction({
      userId: user._id,
      storeId: order._id,
      reference: reference,
      status: "paid",
      transaction: transaction,
      trxef: trxref,
    });

    await transactionDb.save();

    return NextResponse.json(
      { message: "Order Placed" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
