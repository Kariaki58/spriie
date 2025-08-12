import { getServerSession } from 'next-auth';
import { options } from '../../auth/options';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/user';
import Transaction from '@/models/transaction';

interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    status: 'success' | 'failed' | 'abandoned' | 'pending';
    amount: number;
    reference: string;
    metadata: {
      userId: string;
    };
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(options);

  console.log('verifying.....')

  if (!session || !session.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const reference = req.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      { success: false, error: 'Missing reference' },
      { status: 400 }
    );
  }

  try {
    await connectToDatabase();

    // Verify payment with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = (await verifyRes.json()) as PaystackVerificationResponse;

    if (!result.status || result.data.status !== 'success') {

      await Transaction.findOneAndUpdate({ fromUserId: session.user.id }, { status: "failed" }, { new: true })
      return NextResponse.json(
        { success: false, error: result.message || 'Verification failed' },
        { status: 400 }
      );
    }

    const paymentData = result.data;
    const amount = paymentData.amount / 100;
    const { userId } = paymentData.metadata;

    console.log(userId)

    if (userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized transaction' },
        { status: 403 }
      );
    }

    // Update user's wallet
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('before updating...')

    // Assume there's only one wallet, just called `wallet`
    user.wallet = (user.wallet || 0) + amount;
    await user.save();

    console.log("updatedd")
    await Transaction.findOneAndUpdate({ fromUserId: session.user.id }, { status: "completed" }, { new: true })

    return NextResponse.json({
      success: true,
      message: 'Wallet funded successfully',
      amount,
      newBalance: user.wallet,
      reference,
    });

  } catch (error) {
    console.error('Paystack verify error:', error);
    await Transaction.findOneAndUpdate({ fromUserId: session.user.id }, { status: "failed" }, { new: true })
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
