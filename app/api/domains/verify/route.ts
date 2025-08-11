import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../../auth/options';
import { VercelClient } from '@/lib/vercel';


export async function POST(request: Request) {

   const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vercel = new VercelClient(process.env.VERCEL_ACCESS_TOKEN!);
  const { domain } = await request.json();

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    const verification = await vercel.verifyDomain(process.env.VERCEL_PROJECT_ID!, domain);
    return NextResponse.json({ verified: verification.verified });
  } catch (error: any) {
    console.error('Domain verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify domain' },
      { status: 500 }
    );
  }
}