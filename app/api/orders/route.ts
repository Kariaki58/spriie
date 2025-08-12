import Order from "@/models/order";
import Transaction from "@/models/transaction";
import Product from "@/models/product";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Store from "@/models/store";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import Customer from "@/models/customer";
import mongoose from "mongoose";
import { buyerOrderPlacedEmail, sellerOrderPlacedEmail } from "@/lib/email/email-templates";
import { resend } from "@/lib/email/resend";


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You are not logged in" },
        { status: 401 }
      );
    }

    if (session.user.role !== "seller") {
      return NextResponse.json(
        { error: "You are not a seller" },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: session.user.id });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const store = await Store.findOne({ userId: user._id });
    if (!store) {
      return NextResponse.json(
        { error: "You don't have a store" },
        { status: 404 }
      );
    }

    const orders = await Order.find({ storeId: store._id })
      .populate('userId')
      .populate('cartItems.productId');
    

    console.log(orders)

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
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
    } = body;

    // Validate required fields
    if (!product || !customer || !currency || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "You are not logged in" },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ _id: session.user?.id });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find the product
    const dbProduct = await Product.findById(product._id);
    if (!dbProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check stock
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
        { error: "Could not find product in any store" },
        { status: 400 }
      );
    }

    const actualPrice = product.discountedPrice || product.basePrice;
    const totalCost = qty * actualPrice;

    const userWithStore = await User.findOne({ _id: storeWithProduct.userId });

    // Prepare cart item with variants
    const cartItem: any = {
      productId: dbProduct._id,
      storeId: storeWithProduct._id,
      name: dbProduct.title,
      quantity: qty,
      price: actualPrice,
    };


    console.log(product.selectedVariants)

    // Add variants if they exist
    if (product.selectedVariants && Object.keys(product.selectedVariants).length > 0) {
      cartItem.variants = Object.entries(product.selectedVariants).map(([attribute, value]) => ({
        attribute,
        value
      }));
    }

    // Create order
    const order = new Order({
      userId: user._id,
      storeId: storeWithProduct._id,
      cartItems: [cartItem],
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

    // Update product inventory
    dbProduct.inventory -= qty;
    await dbProduct.save();

    // Handle payment
    if (paymentMethod === "wallet") {
      if (user.wallet < totalCost) {
        return NextResponse.json(
          { error: "Insufficient wallet balance" },
          { status: 400 }
        );
      }

      user.wallet -= totalCost;
      userWithStore.wallet += totalCost;
      await user.save();
    } else if (paymentMethod === "paystack") {
      userWithStore.wallet += totalCost;
    }

    await userWithStore.save();

    // Create transaction record
    const transactionDb = new Transaction({
      fromUserId: session.user.id,
      toUserId: userWithStore._id,
      type: "buy",
      amount: totalCost,
      status: "completed",
      paymentMethod
    });

    await transactionDb.save();

    // Update or create customer record
    let customerDb = await Customer.findOne({ email: customer.email });
    if (!customerDb) {
      customerDb = new Customer({
        userId: user._id,
        storeId: storeWithProduct._id,
        name: customer.fullName,
        email: customer.email,
        avatar: user.avatar,
        orders: [order._id]
      });
    } else {
      customerDb.orders.push(order._id);
    }
    await customerDb.save();

    const { error } = await resend.emails.send({
      from: 'Spriie <contact@spriie.com>',
      to: userWithStore.email,
      ...sellerOrderPlacedEmail(order._id, userWithStore.name),
    });


    if (error) {
      await resend.emails.send({
        from: 'Spriie <contact@spriie.com>',
        to: userWithStore.email,
        ...sellerOrderPlacedEmail(order._id, userWithStore.name),
      });
    }


    const { error: feedback } = await resend.emails.send({
      from: 'Spriie <contact@spriie.com>',
      to: userWithStore.email,
      ...buyerOrderPlacedEmail(order._id, customer.fullName),
    })

    if (feedback) {
      await resend.emails.send({
        from: 'Spriie <contact@spriie.com>',
        to: customer.email,
        ...buyerOrderPlacedEmail(order._id, customer.fullName),
      })
    }

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