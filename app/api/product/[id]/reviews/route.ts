import { NextResponse, NextRequest } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Reviews from '@/models/reviews';

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDatabase();

    const data = await params

    const reviews = await Reviews.find({ productId: data.productId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}