import { getServerSession } from 'next-auth';
import { options } from '../../auth/options';
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/user';
import connectToDatabase from '@/lib/mongoose';

interface FundWalletRequest {
  amount: number;
  callbackUrl: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(options);

  if (!session || !session.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { amount, callbackUrl } = (await req.json()) as FundWalletRequest;

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount. Must be a positive number' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.user.id).select('+email');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const reference = `FUND-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // in kobo
        reference,
        callback_url: `${process.env.NEXT_PUBLIC_API_URL}/wallet/verify?callbackUrl=${callbackUrl}`,
        metadata: {
          userId: user._id.toString(),
        }
      })
    });

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      return NextResponse.json(
        {
          success: false,
          error: paystackData.message || 'Failed to initialize payment',
        },
        { status: 400 }
      );
    }

    console.log("the ending...")

    return NextResponse.json({
      success: true,
      message: 'Payment initialized successfully',
      paymentUrl: paystackData.data.authorization_url,
      reference,
    });

  } catch (error) {
    console.error('Paystack funding error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
