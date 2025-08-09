import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/user';
import { options } from '../auth/options';
import { getServerSession } from 'next-auth';


export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/auth/error?message=Invalid verification link', req.url));
    }

    // Find the team invitation
    const invitation = await Team.findOne({
      email,
      verificationToken: token,
      status: 'pending'
    });

    if (!invitation) {
      return NextResponse.redirect(new URL('/auth/error?message=Invalid or expired invitation', req.url));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (user) {
      // Update invitation status to active
      invitation.userId = user._id;
      invitation.status = 'active';
      await invitation.save();

      // Automatically sign in the user
      const session = await getServerSession(options);
      if (!session) {
        return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=/user&email=${email}`, req.url));
      }

      return NextResponse.redirect(new URL('/user', req.url));
    } else {
      // Redirect to signup with prefilled email
      return NextResponse.redirect(new URL(`/auth/signup?email=${email}&token=${token}`, req.url));
    }

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.redirect(new URL('/auth/error?message=Verification failed', req.url));
  }
}