import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.redirect(new URL('/auth/login', request.url));

    const payload = await verifyToken(token);
    console.log('MIDDLEWARE - token:', !!token, 'payload:', JSON.stringify(payload));
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.redirect(new URL('/auth/login', request.url));

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};