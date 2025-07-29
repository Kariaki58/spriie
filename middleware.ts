import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Allow unauthenticated users to access auth pages
  if (!token && pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  // Prevent logged-in users from accessing auth pages
  if (token && pathname.startsWith('/auth')) {
    if (role === 'seller') {
      return NextResponse.redirect(new URL('/vendor', req.url));
    }
    if (role === 'buyer') {
      return NextResponse.redirect(new URL('/user', req.url));
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Redirect seller away from admin
  if (role === 'seller' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/vendor', req.url));
  }

  if (role === "seller" && pathname ===  "/store") {
    return NextResponse.redirect(new URL('/vendor', req.url))
  }

  // Redirect seller away from /user if needed (optional: sellers can access /user)
  // Commented out because seller is allowed to access buyer (/user)
  // if (role === 'seller' && pathname.startsWith('/user')) {
  //   return NextResponse.redirect(new URL('/vendor', req.url));
  // }

  // Redirect buyer away from admin and vendor
  if (role === 'buyer') {
    if (pathname.startsWith('/admin') || pathname.startsWith('/vendor')) {
      return NextResponse.redirect(new URL('/user', req.url));
    }
  }

  // Redirect admin away from /user and /vendor
  if (role === 'admin') {
    if (pathname.startsWith('/user') || pathname.startsWith('/vendor')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  // Handle seller redirection from /select-account
  if (role === 'seller' && pathname === '/select-account') {
    return NextResponse.redirect(new URL('/vendor', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/vendor/:path*',
    '/user/:path*',
    '/admin/:path*',
    '/profile/:path*',
    '/select-account',
    '/auth/login',
    '/auth/register',
  ],
};
