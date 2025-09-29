
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const protectedRoutes = ['/dashboard', '/customers', '/transactions', '/setup-qr'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    if (isProtectedRoute) {
        const authCookie = request.cookies.get('auth');
        if (!authCookie?.value) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
            await jose.jwtVerify(authCookie.value, secret);
            // Token is valid, allow access to protected route
            return NextResponse.next();
        } catch (error) {
            console.error('JWT verification failed:', error);
            // If token is invalid, delete it and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete('auth');
            return response;
        }
    }
    
    // Redirect logged-in users away from auth pages to dashboard
    if (pathname === '/login' || pathname === '/2fa' || pathname === '/setup-2fa') {
        const authCookie = request.cookies.get('auth');
        if (authCookie?.value) {
             try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
                await jose.jwtVerify(authCookie.value, secret);
                // If token is valid, redirect from auth page to dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch (error) {
                // Token is invalid, allow them to stay on the auth page
            }
        }
    }

    // Allow access to all other pages (e.g., /customer-search)
    return NextResponse.next();
}
 
export const config = {
  // Match all routes except for API, static files, and image optimization
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
