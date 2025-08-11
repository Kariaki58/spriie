import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import User from '@/models/user';
import connectToDatabase from '@/lib/mongoose';
import { options } from '../../auth/options';


export async function GET() {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email })
      .select('-password -token -expires -resetToken -resetTokenExpires -verifyToken -verifyTokenExpires');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      avatar: user.avatar || '/default-avatar.jpg',
      joinedDate: user.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(options);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone } = await request.json();

    await connectToDatabase();
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { name, phone } },
      { new: true }
    ).select('-password -token -expires -resetToken -resetTokenExpires -verifyToken -verifyTokenExpires');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone || '',
      avatar: updatedUser.avatar || '/default-avatar.jpg',
      joinedDate: updatedUser.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}