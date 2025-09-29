import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session';
import { sessionOptions } from './lib/auth';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  const { isLoggedIn } = session;
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access login page, redirect to home
  if (isLoggedIn && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!isLoggedIn && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
