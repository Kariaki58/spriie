import crypto from 'crypto';

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null
): boolean {
  if (!signature) return false;
  
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex');
    
  return hash === signature;
}