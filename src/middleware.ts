
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
    return pathname.startsWith(route);
  });
  const isAccessingCustomerRoute = pathname.startsWith(customerRoute);

  // If not logged in, redirect to login page if accessing protected routes
  if (!isLoggedIn) {
    if (isAccessingAdminRoute || isAccessingCustomerRoute) {
      return NextResponse.redirect(new URL(loginRoute, request.url));
    }
    return NextResponse.next();
  }

  // --- At this point, the user is logged in ---

  // If a logged-in user tries to access the login page, redirect them.
  if (pathname === loginRoute) {
    const targetUrl = isAdmin ? '/' : customerRoute;
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // If a non-admin tries to access an admin route, redirect to customer search
  if (!isAdmin && isAccessingAdminRoute) {
    return NextResponse.redirect(new URL(customerRoute, request.url));
  }

  // If an admin tries to access the customer search route, redirect to dashboard
  if (isAdmin && isAccessingCustomerRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
