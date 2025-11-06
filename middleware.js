// middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// ✅ Routes that require login
const protectedRoutes = ['/orders', '/dashboard', '/profile', '/fundaccount'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (!protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ Proper async cookies usage
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // ❌ No token → redirect straight to /login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ Validate token
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/orders/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/fundaccount/:path*',
  ],
  runtime: 'nodejs',
};

