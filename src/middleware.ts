
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from './lib/auth';

const protectedRoutes = ['/', '/customers', '/transactions'];
const customerSearchRoute = '/customer-search';
const loginRoute = '/login';

export async function middleware(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  const { isLoggedIn, isAdmin } = session;
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access login page, redirect them away.
  if (isLoggedIn && pathname === loginRoute) {
    const url = isAdmin ? '/' : customerSearchRoute;
    return NextResponse.redirect(new URL(url, request.url));
  }

  // Handle unauthenticated users trying to access protected content
  if (!isLoggedIn) {
    if (protectedRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith(customerSearchRoute)) {
        return NextResponse.redirect(new URL(loginRoute, request.url));
    }
    return NextResponse.next();
  }
  
  // At this point, user is logged in. Handle role-based access.
  if (isAdmin) {
    // If admin is on the customer search page, redirect to dashboard.
    if (pathname.startsWith(customerSearchRoute)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else { // User is not an admin
    // If a non-admin tries to access any admin-only protected route, redirect to customer search.
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL(customerSearchRoute, request.url));
    }
  }
  
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
