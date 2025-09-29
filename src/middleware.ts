
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from './lib/auth';

const adminRoutes = ['/', '/customers', '/transactions'];
const customerRoute = '/customer-search';
const loginRoute = '/login';

export async function middleware(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  const { isLoggedIn, isAdmin } = session;
  const { pathname } = request.nextUrl;

  const isAccessingAdminRoute = adminRoutes.some(route => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route) && pathname !== customerRoute;
  });
  const isAccessingCustomerRoute = pathname.startsWith(customerRoute);

  // If user is not logged in, redirect to login page for any protected route
  if (!isLoggedIn && pathname !== loginRoute) {
    if (isAccessingAdminRoute || isAccessingCustomerRoute) {
      return NextResponse.redirect(new URL(loginRoute, request.url));
    }
    return NextResponse.next();
  }

  // If user is logged in
  if (isLoggedIn) {
    // If trying to access login page, redirect them away
    if (pathname === loginRoute) {
      const targetUrl = isAdmin ? '/' : customerRoute;
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    // If non-admin tries to access an admin route, redirect to customer search
    if (!isAdmin && isAccessingAdminRoute) {
      return NextResponse.redirect(new URL(customerRoute, request.url));
    }

    // If an admin tries to access the customer search route, redirect to dashboard
    if (isAdmin && isAccessingCustomerRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

