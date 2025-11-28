// Middleware for route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname === '/login' || pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  // Protected routes
  const protectedRoutes = ['/admin', '/dashboard', '/input-emotion', '/reports', '/notifications'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Admin-only routes
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/input-emotion/:path*',
    '/reports/:path*',
    '/notifications/:path*',
    '/login',
  ],
};
