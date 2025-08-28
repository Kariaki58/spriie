import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({ req, secret });

  if (!token && pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  if (pathname.startsWith("/auth")) {
    if (role === "seller") {
      return NextResponse.redirect(new URL("/vendor", req.url));
    }
    if (role === "buyer") {
      return NextResponse.redirect(new URL("/user", req.url));
    }
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  if (role === "seller") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/vendor", req.url));
    }
    if (pathname === "/store") {
      return NextResponse.redirect(new URL("/vendor", req.url));
    }
    if (pathname === "/select-account") {
      return NextResponse.redirect(new URL("/vendor", req.url));
    }
  }

  if (role === "buyer") {
    if (pathname.startsWith("/admin") || pathname.startsWith("/vendor")) {
      return NextResponse.redirect(new URL("/user", req.url));
    }
  }

  if (role === "admin") {
    if (pathname.startsWith("/user") || pathname.startsWith("/vendor")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/vendor/:path*",
    "/user/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/select-account",
    "/auth/login",
    "/auth/register",
    "/((?!_next|api|static|.*\\..*).*)",
  ],
};