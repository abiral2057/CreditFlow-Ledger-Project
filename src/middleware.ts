import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/auth';
 
export async function middleware(request: NextRequest) {
  const session = await getIronSession(request.cookies, sessionOptions);

  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
 
  return NextResponse.next()
}
 
export const config = {
  matcher: ['/', '/customers/:path*', '/transactions'],
}
