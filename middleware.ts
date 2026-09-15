import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get("morya_auth");
  let payload: any = null;

  if (cookie?.value) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
      const verified = await jwtVerify(cookie.value, secret);
      payload = verified.payload;
    } catch (err) {
      // Invalid or expired
    }
  }

  // 1. Protect Admin Routes (but NOT the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!payload) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (payload.role !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // 2. Protect Admin API Routes
  if (pathname.startsWith('/api/admin')) {
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // 3. Protect Customer Pages
  if (pathname.startsWith('/account')) {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to protected paths only
  matcher: ['/admin/:path*', '/account/:path*', '/api/admin/:path*'],
};