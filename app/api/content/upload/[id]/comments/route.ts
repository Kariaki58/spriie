import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/mongoose';
import Comment from '@/models/comments';
import { options } from '@/app/api/auth/options';

export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(options);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectToDatabase();
    const { content, parentCommentId } = await request.json();

    const newComment = new Comment({
      user: session.user.id,
      productId: params.productId,
      content,
      parentCommentId: parentCommentId || null,
      likes: []
    });

    await newComment.save();

    // Populate user data before returning
    await newComment.populate('user', 'name avatar');

    return NextResponse.json(newComment);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}