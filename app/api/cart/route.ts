import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { options } from '../auth/options';
import connectToDatabase from '@/lib/mongoose';
import Cart from '@/models/carts';
import { ICartItem } from '@/models/order';
import Store from '@/models/store';
import Product from '@/models/product';
import { StoreIcon } from 'lucide-react';


export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to view your cart' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate({
        path: 'cartItems.productId',
      })
      .populate({
        path: 'cartItems.storeId',
        select: 'name',
      });

    if (!cart) {
      return NextResponse.json({ cartItems: [] }, { status: 200 });
    }

    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart', details: error.message },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    console.log("wowowow")
    const session = await getServerSession(options);


    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to modify your cart' },
        { status: 401 }
      );
    }

    const { cartItems } = await req.json();

    if (!Array.isArray(cartItems)) {
      return NextResponse.json(
        { error: 'Invalid cart items format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Add storeId to each cart item
    const enrichedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const store = await Store.findOne({ products: item.productId });

        if (!store) {
          throw new Error(`Store not found for product ID: ${item.productId}`);
        }

        return {
          ...item,
          storeName: store.storeName,
          storeId: store._id,
        };
      })
    );

    const subCartTotalPrice = enrichedCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const cart = await Cart.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        cartItems: enrichedCartItems,
        subCartTotalPrice,
      },
      {
        upsert: true,
        new: true,
      }
    );

    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to modify your cart' },
        { status: 401 }
      );
    }

    const { cartItem } = await req.json();

    console.log(cartItem)

    console.log("###############3")

    if (!cartItem || !cartItem.productId || !cartItem.productId._id) {
      return NextResponse.json(
        { error: 'Invalid cart item format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find store containing the product
    const store = await Store.findOne({ products: cartItem.productId._id }).populate('products');

    if (!store) {
      return NextResponse.json(
        { error: `Store not found for product ID: ${cartItem.productId._id}` },
        { status: 404 }
      );
    }

    // Find the product inside the store
    const product = store.products.find((p: any) => p._id.toString() === cartItem.productId._id.toString());


    if (!product) {
      return NextResponse.json(
        { error: `Product not found in store for ID: ${cartItem.productId._id}` },
        { status: 404 }
      );
    }

    // Build the complete cart item object
    const completeCartItem = {
      storeId: store._id,
      storeName: store.storeName,
      productId: product._id,
      name: product.title,
      size: cartItem.size || undefined,
      color: cartItem.color || undefined,
      quantity: cartItem.quantity,
      price: cartItem.price,
      totalPrice: cartItem.quantity * cartItem.price,
    };

    console.log(completeCartItem)

    // Get or create user's cart
    let cart = await Cart.findOne({ userId: session.user.id });

    if (!cart) {
      cart = new Cart({
        userId: session.user.id,
        cartItems: [],
        subCartTotalPrice: 0,
      });
    }

    const existingItemIndex = cart.cartItems.findIndex((item) =>
      item.productId.toString() === cartItem.productId._id.toString()
    );

    console.log(existingItemIndex)

    if (existingItemIndex > -1) {
      if (cartItem.quantity <= 0) {
        cart.cartItems.splice(existingItemIndex, 1);
      } else {
        // Update item
        cart.cartItems[existingItemIndex] = {
          ...completeCartItem,
          size: cartItem.size || cart.cartItems[existingItemIndex].size,
          color: cartItem.color || cart.cartItems[existingItemIndex].color,
        };

      }
    } else if (cartItem.quantity > 0) {
      // Add new item
      cart.cartItems.push(completeCartItem);
    }

    // Update subtotal
    cart.subCartTotalPrice = cart.cartItems.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    await cart.save();

    return NextResponse.json(cart);
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to clear your cart' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    await Cart.deleteOne({ userId: session.user.id });

    return NextResponse.json(
      { message: 'Cart cleared successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart', details: error.message },
      { status: 500 }
    );
  }
}