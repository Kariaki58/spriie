import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { verifyInvitation } from '@/lib/team';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function VerifyInvitation({
  searchParams,
}: {
  searchParams: { token?: string; email?: string };
}) {
  const params = await searchParams;

  console.log({params});
  console.log(params.token)
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Accept Invitation</h1>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<VerificationLoading />}>
            <VerificationHandler token={params.token} email={params.email} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function VerificationHandler({ token, email }: { token?: string; email?: string }) {
  if (!token || !email) {
    return <InvalidLink />;
  }

  try {
    const result = await verifyInvitation(token, email);
    
    if (result.userExists) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-emerald-600">Invitation accepted successfully!</p>
          <p>You now have access to {result.storeName}.</p>
          <Button asChild>
            <Link href="/user">Go to Dashboard</Link>
          </Button>
        </div>
      );
    } else {
      return (
        <div className="space-y-4 text-center">
          <p>Please create an account to accept your invitation to {result.storeName}.</p>
          <Button asChild>
            <Link href={`/auth/signup?email=${email}&inviteToken=${token}`}>
              Create Account
            </Link>
          </Button>
        </div>
      );
    }
  } catch (error) {
    return <InvalidLink message={error instanceof Error ? error.message : undefined} />;
  }
}

function VerificationLoading() {
  return <p className="text-center">Verifying your invitation...</p>;
}

function InvalidLink({ message }: { message?: string }) {
  return (
    <div className="space-y-2 text-center text-red-600">
      <p>{message || 'Invalid or expired invitation link'}</p>
      <p className="text-sm text-gray-600">
        Please ask the store owner to send you a new invitation.
      </p>
    </div>
  );
}