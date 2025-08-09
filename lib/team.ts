export async function verifyInvitation(token: string, email: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/team/verify?token=${token}&email=${email}`,
    { method: 'GET' }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Verification failed');
  }

  return await res.json();
}