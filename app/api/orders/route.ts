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
import Escrow from "@/models/EscrowTransaction";
import EmailJob from "@/models/emailJob";



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

const verifyTransaction = async (reference: string) => {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });
  const data = await res.json();
  return data;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: "You are not logged in" }, { status: 401 });
  }

  const { product, customer, currency, paymentMethod, qty, reference } = await req.json();

  if (!product || !customer || !currency || !paymentMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectToDatabase();
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();

  try {
    // Verify payment first (if Paystack)
    if (paymentMethod === "paystack") {
      const verification = await verifyTransaction(reference);
      if (!(verification.status && verification.data.status === "success")) {
        throw new Error("Payment not confirmed with Paystack");
      }
    }

    const user = await User.findById(session.user.id).session(mongoSession);
    if (!user) throw new Error("User not found");

    const dbProduct = await Product.findById(product._id).session(mongoSession);
    if (!dbProduct) throw new Error("Product not found");

    if (qty > dbProduct.quantity) {
      throw new Error("Insufficient stock available");
    }

    const storeWithProduct = await Store.findOne({
      products: new mongoose.Types.ObjectId(dbProduct._id),
    }).session(mongoSession);

    if (!storeWithProduct) throw new Error("Could not find product in any store");

    const actualPrice = product.discountedPrice;
    const totalCost = qty * actualPrice;

    const userWithStore = await User.findById(storeWithProduct.userId).session(mongoSession);
    if (!userWithStore) throw new Error("Seller not found");

    // Prepare cart item
    const cartItem: any = {
      productId: dbProduct._id,
      storeId: storeWithProduct._id,
      name: dbProduct.title,
      quantity: qty,
      price: actualPrice,
    };

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

    // Create escrow
    const escrow = new Escrow({
      orderId: order._id,
      buyerId: user._id,
      sellerId: userWithStore._id,
      amount: totalCost,
      status: "pending",
      paymentMethod,
      releaseConditions: {
        timeBasedRelease: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await order.save({ session: mongoSession });
    dbProduct.quantity -= qty;
    await dbProduct.save({ session: mongoSession });

    if (paymentMethod === "wallet") {
      if (user.wallet < totalCost) throw new Error("Insufficient wallet balance");
        user.wallet -= totalCost;
        await user.save({ session: mongoSession });

        escrow.status = "held";
        await escrow.save({ session: mongoSession });

        const walletTransaction = new Transaction({
          fromUserId: user._id,
          toUserId: userWithStore._id,
          type: "held",
          amount: totalCost,
          status: "completed",
          paymentMethod: "wallet",
          escrowId: escrow._id,
        });
        await walletTransaction.save({ session: mongoSession });
    } else if (paymentMethod === "paystack") {
        escrow.status = "held";
        await escrow.save({ session: mongoSession });

        const paystackTransaction = new Transaction({
          fromUserId: user._id,
          toUserId: userWithStore._id,
          type: "held",
          amount: totalCost,
          status: "completed",
          paymentMethod: "paystack",
          escrowId: escrow._id,
        });
        await paystackTransaction.save({ session: mongoSession });
    }

    // Add or update customer
    let customerDb = await Customer.findOne({ email: customer.email }).session(mongoSession);
    if (!customerDb) {
      customerDb = new Customer({
        userId: user._id,
        storeId: storeWithProduct._id,
        name: customer.fullName,
        email: customer.email,
        avatar: user.avatar,
        orders: [order._id],
      });
    } else {
      customerDb.orders.push(order._id);
    }
    await customerDb.save({ session: mongoSession });

    await EmailJob.create([
      {
        to: userWithStore.email,
        ...sellerOrderPlacedEmail(order._id, userWithStore.name),
      },
      {
        to: customer.email,
        ...buyerOrderPlacedEmail(order._id, customer.fullName),
      }
    ], { session: mongoSession });

    await mongoSession.commitTransaction();


    return NextResponse.json({ message: "Order Placed", orderId: order._id }, { status: 200 });
  } catch (error: any) {
    await mongoSession.abortTransaction();
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  } finally {
    mongoSession.endSession();
  }
}
