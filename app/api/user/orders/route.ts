import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongoose';
import { options } from '../../auth/options';
import Order from '@/models/order';


export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get total count of orders
    const totalOrders = await Order.countDocuments({ userId: session.user.id });

    // Get the most recent order
    const lastOrder = await Order.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select('createdAt');

    return NextResponse.json({
      totalOrders,
      lastOrder: lastOrder 
        ? lastOrder.createdAt.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'No orders yet'
    });
  } catch (error) {
    console.error('Order history fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}