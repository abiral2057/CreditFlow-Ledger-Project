import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This middleware is currently disabled to bypass login.
// All routes are publicly accessible.
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}
 
export const config = {
  matcher: [], // Empty matcher disables the middleware
}
