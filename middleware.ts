// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });


  // Allow access if token exists or it's an auth route
  if (token || req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Redirect to login page
  const loginUrl = new URL('/auth/login', req.url);
  return NextResponse.redirect(loginUrl);
}


export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
