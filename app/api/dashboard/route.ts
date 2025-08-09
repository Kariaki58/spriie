import connectToDatabase from "@/lib/mongoose";
import User from "@/models/user";
import Store from "@/models/store";
import Product from "@/models/product";
import Order from "@/models/order";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import { NextRequest, NextResponse } from "next/server";
import { DashboardResponse } from "@/types/dashboard";
import { Types } from "mongoose";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: 'dollar-sign' | 'shopping-cart' | 'package' | 'message-square';
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: string;
  status: string;
  date: string;
}

interface AlertItem {
  type: string;
  message: string;
  details: string;
}

interface PerformanceDataItem {
  day: string;
  sales: number;
  orders: number;
}

interface CartItem {
  productId: Types.ObjectId;
  price: number;
  quantity: number;
  name: string;
  size?: string;
  color?: string;
}

interface PopulatedOrder {
  _id: Types.ObjectId;
  userId: {
    name: string;
    email: string;
  };
  cartItems: CartItem[];
  status: string;
  createdAt: Date;
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        
        const session = await getServerSession(options);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.role !== "seller") {
            return NextResponse.json({ error: "register to become a seller!" }, { status: 400 })
        }

        const store = await Store.findOne({ userId: user._id });
        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        // Get actual revenue data for the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const revenueResult = await Order.aggregate<{ _id: null, totalRevenue: number }>([
            { 
                $match: { 
                    storeId: store._id,
                    status: "delivered" 
                } 
            },
            { 
                $unwind: "$cartItems" 
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $multiply: ["$cartItems.price", "$cartItems.quantity"] }
                    }
                }
            }
        ]);

        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        // Get pending orders count
        const pendingOrdersCount = await Order.countDocuments({
            storeId: store._id,
            status: { $in: ["pending", "processing"] }
        });

        // Get products count
        const productsCount = await Product.countDocuments({ userId: user._id });

        // Get low stock products
        const lowStockProductsCount = await Product.countDocuments({
            userId: user._id,
            inventory: { $lt: 5 }
        });

        // Get unread messages count (you'll need to implement this based on your messaging system)
        const unreadMessagesCount = 0;

        // Get recent orders with actual data
        const recentOrders = await Order.find({ storeId: store._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate({
                path: 'userId',
                select: 'name email'
            }) as PopulatedOrder[];

        const formattedOrders = recentOrders.map(order => ({
            id: `#ORD-${order._id.toString().slice(-4).toUpperCase()}`,
            customer: order.userId.name,
            amount: `₦${order.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toLocaleString()}`,
            status: order.status,
            date: formatDate(order.createdAt)
        }));

        const performanceData = await Order.aggregate<PerformanceDataItem>([
            {
                $match: {
                    storeId: store._id,
                    createdAt: { 
                        $gte: sevenDaysAgo,
                        $lte: today
                    },
                    status: { $in: ["delivered", "processing", "pending", "shipped", "returned"] }
                }
            },
            {
                $addFields: {
                    orderDay: {
                        $dayOfWeek: "$createdAt" // 1=Sunday, 2=Monday, ..., 7=Saturday
                    },
                    totalAmount: {
                        $sum: "$cartItems.price"
                    }
                }
            },
            {
                $group: {
                    _id: "$orderDay",
                    sales: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            {
                $project: {
                    day: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", 1] }, then: "Sun" },
                                { case: { $eq: ["$_id", 2] }, then: "Mon" },
                                { case: { $eq: ["$_id", 3] }, then: "Tue" },
                                { case: { $eq: ["$_id", 4] }, then: "Wed" },
                                { case: { $eq: ["$_id", 5] }, then: "Thu" },
                                { case: { $eq: ["$_id", 6] }, then: "Fri" },
                                { case: { $eq: ["$_id", 7] }, then: "Sat" }
                            ],
                            default: "Unknown"
                        }
                    },
                    sales: 1,
                    orders: 1,
                    _id: 0
                }
            }
        ]);

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const completePerformanceData = daysOfWeek.map(day => {
            const dayData = performanceData.find(d => d.day === day);
            return {
                day,
                sales: dayData?.sales || 0,
                orders: dayData?.orders || 0
            };
        });

        const dashboardData: DashboardResponse = {
            stats: [
                { 
                    title: 'Total Revenue', 
                    value: `₦${totalRevenue.toLocaleString()}`, 
                    change: await getRevenueChange(store._id),
                    icon: 'dollar-sign'
                },
                { 
                    title: 'Pending Orders', 
                    value: pendingOrdersCount.toString(), 
                    change: await getPendingOrdersChange(store._id),
                    icon: 'shopping-cart'
                },
                { 
                    title: 'Products', 
                    value: productsCount.toString(), 
                    change: `${lowStockProductsCount} low in stock`,
                    icon: 'package'
                },
                { 
                    title: 'Customer Messages', 
                    value: unreadMessagesCount.toString(), 
                    change: `${unreadMessagesCount} awaiting reply`,
                    icon: 'message-square'
                },
            ],
            recentOrders: formattedOrders,
            alerts: [
                ...(lowStockProductsCount > 0 ? [{
                    type: 'low-stock',
                    message: `${lowStockProductsCount} products low in stock`,
                    details: 'Some products are running low on inventory'
                }] : []),
                ...(pendingOrdersCount > 0 ? [{
                    type: 'pending-orders',
                    message: `${pendingOrdersCount} orders need processing`,
                    details: 'Packages need to be prepared for shipping'
                }] : [])
            ],
            performanceData: completePerformanceData
        };

        return NextResponse.json(dashboardData, { status: 200 });

    } catch (error) {
        console.error('Dashboard error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Something went wrong" }, 
            { status: 500 }
        );
    }
}

function formatDate(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}

function getEmptyPerformanceData(): PerformanceDataItem[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map(day => ({ day, sales: 0, orders: 0 }));
}

async function getRevenueChange(storeId: Types.ObjectId): Promise<string> {
    const yesterdayRevenue = 0;
    return yesterdayRevenue > 0 ? 
        `+${Math.round((yesterdayRevenue / 100) * 100)}% from yesterday` : 
        'No change from yesterday';
}

async function getPendingOrdersChange(storeId: Types.ObjectId): Promise<string> {
    const newLastHour = 0;
    return newLastHour > 0 ? 
        `${newLastHour} new in last hour` : 
        'No new orders in last hour';
}