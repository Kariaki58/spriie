import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { options } from '../../auth/options';
import connectToDatabase from '@/lib/mongoose';
import Order from '@/models/order';
import Cart from '@/models/carts';
import Product from '@/models/product';
import Store from '@/models/store';
import User from '@/models/user';
// import { sendOrderConfirmationEmail } from '@/lib/email';

// Define TypeScript interfaces for your data structures
interface CartItem {
  productId: typeof Product;
  storeId: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

interface PopulatedCartItem extends Omit<CartItem, 'productId'> {
  productId: {
    _id: string;
    title: string;
    images: string[];
  };
}

interface CartDocument {
  userId: string;
  cartItems: PopulatedCartItem[];
}

interface UserDocument {
  _id: string;
  wallet: number;
  // Add other user properties as needed
}

interface StoreDocument {
  _id: string;
  userId: string;
  // Add other store properties as needed
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  image: string;
}

interface OrderRequest {
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'wallet' | 'card' | 'paypal'; // Add other payment methods as needed
}

interface ProcessedOrderItem {
  storeId: string;
  storeOwnerId: string;
  items: OrderItem[];
  shippingAddress: OrderRequest['shippingAddress'];
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  status: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to place an order' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get user's cart and profile
    const [cart, user] = await Promise.all([
      Cart.findOne({ userId: session.user.id }).populate({
        path: 'cartItems.productId',
        model: Product
      }) as Promise<CartDocument>,
      User.findById(session.user.id) as Promise<UserDocument>
    ]);

    if (!cart || cart.cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    const body: OrderRequest = await req.json();
    const { shippingAddress, paymentMethod } = body;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Group cart items by store
    const itemsByStore: Record<string, PopulatedCartItem[]> = {};
    cart.cartItems.forEach((item: PopulatedCartItem) => {
      const storeId = item.storeId.toString();
      if (!itemsByStore[storeId]) {
        itemsByStore[storeId] = [];
      }
      itemsByStore[storeId].push(item);
    });

    // Create order items for each store and calculate totals
    const orderItems: ProcessedOrderItem[] = await Promise.all(
      Object.entries(itemsByStore).map(async ([storeId, items]) => {
        const store = await Store.findById(storeId);
        if (!store) {
          throw new Error(`Store not found: ${storeId}`);
        }
        const storeOwner = await User.findOne({ _id: store.userId });

        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = subtotal > 50000 ? 0 : 2000;
        const tax = subtotal * 0.075;
        const total = subtotal + shippingFee + tax;

        return {
          storeId,
          storeOwnerId: storeOwner._id,
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
          status: 'pending'
        };
      })
    );

    // Calculate grand total
    const grandTotal = orderItems.reduce((sum, item) => sum + item.total, 0);

    // Handle wallet payment if selected
    if (paymentMethod === 'wallet') {
      // Check if user has sufficient balance
      if (user.wallet < grandTotal) {
        return NextResponse.json(
          { error: 'Insufficient wallet balance' },
          { status: 400 }
        );
      }

      // Deduct from buyer's wallet
      user.wallet -= grandTotal;
      await user.save();
    }

    // Create orders and update sellers' wallets
    const orderLists = await Promise.all(
      orderItems.map(async (item) => {
        // Create the order
        const order = new Order({
          userId: session.user.id,
          storeId: item.storeId,
          cartItems: item.items,
          status: 'pending',
          shippingAddress: item.shippingAddress,
          paymentMethod,
        });

        // Update seller's wallet (credit their account)
        if (paymentMethod === 'wallet') {
          const seller = await User.findById(item.storeOwnerId) as UserDocument;
          if (seller) {
            // Deduct platform fee (example: 10%)
            const platformFee = item.total * 0.1;
            const sellerEarnings = item.total - platformFee;
            
            seller.wallet += sellerEarnings;
            await seller.save();

            // Record the transaction in the order
            order.sellerEarnings = sellerEarnings;
            order.platformFee = platformFee;
          }
        }

        await order.save();
        return order;
      })
    );

    // Clear the user's cart after successful order
    await Cart.findOneAndDelete({ userId: session.user.id });

    return NextResponse.json({
      success: true,
      orderIds: orderLists.map(order => order._id),
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