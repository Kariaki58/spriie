import { NextResponse } from 'next/server';
import { options } from '../../auth/options';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/user';
import Order from '@/models/order';
import Like from '@/models/like';
import Product from '@/models/product';
import { getServerSession } from 'next-auth';

// Define types for the response data
interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

interface UserData {
  name: string;
  orders?: any[];
  loyaltyPoints?: number;
  loyaltyTier?: string;
  address?: Address;
}

interface OrderItem {
  _id: string;
  createdAt: Date;
  status: string;
  cartItems: Array<{
    price: number;
    quantity: number;
  }>;
}

interface ProductItem {
  _id: string;
  title: string;
  price: number;
  thumbnail?: string;
  images: string[];
}

interface LikeItem {
  product: ProductItem;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  date: string;
  icon: {
    svg: string;
  };
}

interface DashboardResponse {
  user: {
    name: string;
    initials: string;
    totalSpent: number;
    totalOrders: number;
    activeOrders: number;
    loyaltyPoints: number;
    loyaltyTier: string;
    address: Address;
  };
  orders: Array<{
    id: string;
    date: string;
    status: string;
    amount: number;
  }>;
  wishlist: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  recommendedProducts: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
  }>;
  activities: Activity[];
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(options);

    console.log("Fetching dashboard data...");

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get user data
    const user = await User.findById(session.user.id)
      .select('name address loyaltyPoints loyaltyTier')
      .lean<UserData>();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all completed orders to calculate total spent
    const allOrders = await Order.find({ 
      userId: session.user.id,
      status: { $in: ['delivered'] } // Only count delivered orders as completed/spent
    })
    .select('cartItems')
    .lean<OrderItem[]>();

    // Calculate total spent from all delivered orders
    const totalSpent = allOrders.reduce((sum, order) => {
      return sum + order.cartItems.reduce((orderSum, item) => {
        return orderSum + (item.price * item.quantity);
      }, 0);
    }, 0);
    console.log(totalSpent)

    // Get recent orders (last 2)
    const recentOrders = await Order.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('_id createdAt status cartItems')
      .lean<OrderItem[]>();

    // Get wishlist items
    const likes = await Like.find({ 
      user: session.user.id,
      product: { $exists: true }
    })
    .populate<{ product: ProductItem }>({
      path: 'product',
      model: Product,
      select: 'title price thumbnail images'
    })
    .lean<LikeItem[]>();

    // Get recommended products (based on user's order history or other logic)
    const recommendedProducts = await Product.find()
      .sort({ likes: -1 })
      .limit(4)
      .select('title price thumbnail images')
      .lean<ProductItem[]>();

    // Get total order count
    const totalOrders = await Order.countDocuments({ userId: session.user.id });

    // Format the response
    const response: DashboardResponse = {
      user: {
        name: user.name,
        initials: user.name.split(' ').map(n => n[0]).join(''),
        totalSpent,
        totalOrders,
        activeOrders: recentOrders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length,
        loyaltyPoints: user.loyaltyPoints || 0,
        loyaltyTier: user.loyaltyTier || 'Silver',
        address: user.address || {
          street: '',
          city: '',
          state: '',
          country: ''
        }
      },
      orders: recentOrders.map(order => ({
        id: order._id.toString().slice(-6).toUpperCase(),
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }),
        status: order.status,
        amount: order.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      })),
      wishlist: likes.map(like => ({
        id: like.product._id.toString(),
        name: like.product.title,
        price: like.product.price,
        image: like.product.thumbnail || like.product.images[0]
      })),
      recommendedProducts: recommendedProducts.map(product => ({
        id: product._id.toString(),
        name: product.title,
        price: product.price,
        image: product.thumbnail || product.images[0]
      })),
      activities: [
        ...recentOrders.map(order => ({
          id: order._id.toString(),
          type: 'order',
          title: `Order ${order._id.toString().slice(-6).toUpperCase()} ${order.status}`,
          date: new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          icon: getActivityIcon(order.status)
        })),
        {
          id: 'points-1',
          type: 'points',
          title: `You earned ${Math.floor(Math.random() * 100) + 50} loyalty points`,
          date: new Date(Date.now() - 86400000 * 7).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          icon: getActivityIcon('points')
        }
      ]
    };
    console.log("fkfkdjafldkafsd")
    console.log(response.user.totalSpent)

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function getActivityIcon(type: string): { svg: string } {
  switch(type) {
    case 'delivered':
      return {
        svg: '<svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>'
      };
    case 'shipped':
      return {
        svg: '<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
      };
    case 'points':
      return {
        svg: '<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>'
      };
    default:
      return {
        svg: '<svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
      };
  }
}