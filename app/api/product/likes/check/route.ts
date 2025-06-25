import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '@/app/api/auth/options';
import Product from '@/models/product';
import connectToDatabase from '@/lib/mongoose';



export async function GET(request: NextRequest) {
  const session = await getServerSession(options);
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  console.log("run check")



  if (!session || !productId) {
    return NextResponse.json({ liked: false });
  }

  try {
    await connectToDatabase();
    const product = await Product.findById(productId);
    
    if (!product) {
      return NextResponse.json({ liked: false });
    }

    const isLiked = product.likedBy.includes(session.user.id);
    return NextResponse.json({ liked: isLiked });
    
  } catch (error) {
    return NextResponse.json({ liked: false });
  }
}