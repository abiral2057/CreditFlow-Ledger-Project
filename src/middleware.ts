import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const protectedRoutes = ['/dashboard', '/customers', '/transactions'];
const publicRoutes = ['/login', '/2fa', '/customer-search'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isProtectedRoute) {
        const authCookie = request.cookies.get('auth');
        if (!authCookie?.value) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
            await jose.jwtVerify(authCookie.value, secret);
            return NextResponse.next();
        } catch (error) {
            console.error('JWT verification failed:', error);
            // Clear invalid cookie and redirect
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth');
            return response;
        }
    }
    
    return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
