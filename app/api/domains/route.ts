import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { options } from '../auth/options';
import { VercelClient } from '@/lib/vercel';


// Define types for Vercel API responses
type VercelDomain = {
  id: string;
  name: string;
  apexName: string;
  projectId: string;
  redirect?: string | null;
  redirectStatusCode?: number | null;
  gitBranch?: string | null;
  updatedAt?: number;
  createdAt?: number;
  verified: boolean;
  verification?: {
    type: 'TXT' | 'CNAME';
    domain: string;
    value: string;
    reason: string;
  }[];
};

type VercelProjectAlias = {
  domain: string;
  isPrimary: boolean;
  createdAt: number;
  updatedAt: number;
};

type VercelProject = {
  id: string;
  name: string;
  alias: VercelProjectAlias[];
  // Add other project properties as needed
};

export async function GET() {
  const session = await getServerSession(options);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vercel = new VercelClient(process.env.VERCEL_ACCESS_TOKEN!);

  try {
    const project: VercelProject = await vercel.getProject(process.env.VERCEL_PROJECT_ID!);
    const domains: VercelDomain[] = await vercel.getDomains(process.env.VERCEL_PROJECT_ID!);

    const customDomain = domains.find((d: VercelDomain) => d.redirect === null);
    
    // Safely handle missing alias array
    const defaultDomain = project.alias?.find((a: VercelProjectAlias) => a.isPrimary)?.domain 
      || `spriie.vercel.app`; // Fallback to your default domain

    return NextResponse.json({
      domain: customDomain?.name,
      verified: customDomain?.verified,
      verificationRecord: customDomain?.verification?.find((v: { type: string }) => v.type === 'TXT')?.value,
      defaultDomain
    });
  } catch (error: any) {
    console.error('Domain API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const addedDomain = await vercel.addDomain(process.env.VERCEL_PROJECT_ID!, domain);
    return NextResponse.json({
      domain: addedDomain.name,
      verificationRecord: addedDomain.verification?.find((v: { type: string }) => v.type === 'TXT')?.value
    });
  } catch (error: any) {
    console.error('Add domain error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add domain' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    await vercel.removeDomain(process.env.VERCEL_PROJECT_ID!, domain);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove domain error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove domain' },
      { status: 500 }
    );
  }
}