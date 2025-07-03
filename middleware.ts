import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Prevent logged-in users from accessing auth routes
  if (token && pathname.startsWith('/auth')) {
    // Redirect sellers to vendor dashboard
    if (token.role === 'seller') {
      return NextResponse.redirect(new URL('/vendor', req.url));
    }
    // Redirect other users to home page
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Allow access to auth routes for unauthenticated users
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Handle seller redirection for account selection
  if (token.role === 'seller' && pathname === '/select-account') {
    return NextResponse.redirect(new URL('/vendor', req.url));
  }

  // Allow access for other cases
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/select-account',
    '/auth/login',
    '/auth/register',
  ],
};