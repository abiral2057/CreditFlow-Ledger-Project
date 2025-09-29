import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from './lib/auth';

const protectedRoutes = ['/', '/customers', '/transactions', '/customer-search'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession(cookies(), sessionOptions);

  const { isLoggedIn, isAdmin } = session;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If user is logged in and tries to access login page, redirect them
  if (isLoggedIn && pathname.startsWith('/login')) {
    const url = isAdmin ? '/' : '/customer-search';
    return NextResponse.redirect(new URL(url, request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If a non-admin tries to access admin-only routes
  if (isLoggedIn && !isAdmin && (pathname.startsWith('/customers') || pathname.startsWith('/transactions') || pathname === '/')) {
    return NextResponse.redirect(new URL('/customer-search', request.url));
  }

  // If an admin tries to access the customer search page
  if (isLoggedIn && isAdmin && pathname.startsWith('/customer-search')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return response;
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
