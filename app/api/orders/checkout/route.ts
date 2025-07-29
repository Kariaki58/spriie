import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/options';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/order';
import Cart from '@/models/carts';
import Product from '@/models/product';
import Store from '@/models/store';
// import { sendOrderConfirmationEmail } from '@/lib/email';


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to place an order' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get user's cart
    const cart = await Cart.findOne({ userId: session.user.id }).populate({
      path: 'cartItems.productId',
      model: Product
    });

    if (!cart || cart.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    const body = await req.json();

    console.log(body)
    const { shippingAddress, paymentMethod } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Group cart items by store
    const itemsByStore: Record<string, typeof cart.cartItems> = {};
    cart.cartItems.forEach(item => {
      const storeId = item.storeId.toString();
      if (!itemsByStore[storeId]) {
        itemsByStore[storeId] = [];
      }
      itemsByStore[storeId].push(item);
    });

    // Create order items for each store
    const orderItems = await Promise.all(
      Object.entries(itemsByStore).map(async ([storeId, items]) => {
        const store = await Store.findById(storeId);
        if (!store) {
          throw new Error(`Store not found: ${storeId}`);
        }

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = subtotal > 50000 ? 0 : 2000;
        const tax = subtotal * 0.075;
        const total = subtotal + shippingFee + tax;

        return {
          storeId,
          items: items.map(item => ({
            productId: item.productId._id,
            name: item.productId.title,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
            image: item.productId.images[0]
          })),
          shippingAddress,
          subtotal,
          shippingFee,
          tax,
          total,
          status: 'pending' as const
        };
      })
    );

    // Calculate grand total
    const grandTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

    console.log('############ORDER ITEMS##############')
    console.log(orderItems);
    console.log('############ORDER ITEMS##############')
    console.log("#############CART ITEMS###############")
    console.log(orderItems[0].items)
    console.log("###############ORDER ITEMS##############")
    console.log('############PAYMENT METHOD##############')
    console.log(paymentMethod)
    console.log(grandTotal)
    console.log('############PAYMENT METHOD##############')

    const orderLists = await Promise.all(
      orderItems.map(async (item) => {
        const order = new Order({
          userId: session.user.id,
          storeId: item.storeId,
          cartItems: item.items,
          status: "pending",
          shippingAddress: item.shippingAddress,
          paymentMethod,
        });

        await order.save();
        return order;
      })
    );



    console.log(orderLists);

    return NextResponse.json({
      success: true,
      // orderId: order._id,
      grandTotal,
      paymentMethod
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to view orders' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const orders = await Order.find({ userId: session.user.id })
      .populate({
        path: 'orderItems.storeId',
        select: 'name logo'
      })
      .populate({
        path: 'orderItems.items.productId',
        select: 'title images'
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    );
  }
}