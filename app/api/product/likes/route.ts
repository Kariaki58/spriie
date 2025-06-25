import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/options';
import connectToDatabase from '@/lib/mongoose';
import Product from '@/models/product';

export async function POST(request: NextRequest) {
  const session = await getServerSession(options);

  console.log("liking")

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { productId } = await request.json();
    const userId = session.user.id;

    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const hasLiked = product.likedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      product.likedBy.pull(userId);
      product.likes = product.likes - 1;
    } else {
      // Like
      product.likedBy.push(userId);
      product.likes = product.likes + 1;
    }

    await product.save();

    return NextResponse.json({
      likes: product.likes,
      liked: !hasLiked,
    }, { status: 200 });

  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
