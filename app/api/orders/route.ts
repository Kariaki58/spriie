import Order from "@/models/order";
import Transaction from "@/models/transaction";
import Product from "@/models/product";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import mongoose from "mongoose";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    console.log('fire line 17')



    if (!session || !session.user) {
      return NextResponse.json(
        { error: "you are not logged in " },
        { status: 404 }
      )
    }

    if (session.user.role !== "seller") {
      return NextResponse.json(
        { erro: "you are not a seller" },
        { status: 400 }
      )
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: session.user.id })

    if (!user) {
      return NextResponse.json(
        { error: "you are not logged in " },
        { status: 404}
      )
    }
    if (user.role !== "seller") {
      return NextResponse.json(
        { error: "you are not logged in " },
        { status: 404}
      )
    }

    const store = await Store.findOne({ userId: user._id })

    if (!store) {
      return NextResponse.json(
        { error: "you don not have a store " },
        { status: 404 }
      )
    }

    const orders = await Order.find({ storeId: store._id })
    .populate('userId')
    .populate('cartItems.productId');
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
    console.log({orders})
    console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')



    return NextResponse.json(orders);
  } catch (error: any) {
    console.log(error)
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
        error: "You are not logged in"
      }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: session.user?.id });
    if (!user) {
      return NextResponse.json({
        error: "User not found"
      }, { status: 404 });
    }

    // Find the product
    const dbProduct = await Product.findById(product._id);
    if (!dbProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock - fixed the comparison
    if (qty > dbProduct.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock available" },
        { status: 400 }
      );
    }

    const storeWithProduct = await Store.findOne({
      products: new mongoose.Types.ObjectId(dbProduct._id),
    });


    if (!storeWithProduct) {
      return NextResponse.json(
        { error: "could not find product in any store"},
        { status: 400 }
      )
    }

    console.log(storeWithProduct)

    console.log({ dbProduct })


    // Create order in database (pending status)
    const order = new Order({
      userId: user._id,
      storeId: storeWithProduct._id,
      cartItems: [
        {
          productId: dbProduct._id,
          storeId: storeWithProduct._id, // Added storeId to cartItem as required by interface
          name: dbProduct.title, // Using the name from the database product
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

    await order.save();

    console.log("line 125")

    const transactionDb = new Transaction({
      userId: user._id,
      storeId: order.storeId, // Changed from order._id to order.storeId
      reference: reference,
      status: "paid",
      transaction: transaction,
      trxef: trxref, // Fixed typo (was trxef)
    });

    await transactionDb.save();

    console.log("weldone.")

    return NextResponse.json(
      { message: "Order Placed", orderId: order._id },
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