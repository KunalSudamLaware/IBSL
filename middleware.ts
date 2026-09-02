import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Protect Admin Routes (but NOT the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      // NextAuth v5 uses a different cookie name by default
      cookieName: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    });

    // If not authenticated or not ADMIN, redirect to admin login
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // 2. Protect Logged-in Customer Routes
  if (pathname.startsWith('/account')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
    });

    // Standard authenticated user required
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to protected paths only
  matcher: ['/admin/:path*', '/account/:path*'],
};

