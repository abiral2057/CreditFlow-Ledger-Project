
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const protectedRoutes = ['/dashboard', '/customers', '/transactions', '/setup-qr'];
const publicRoutes = ['/login', '/2fa', '/customer-search'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // --- TEMPORARILY DISABLED FOR TESTING ---
    // const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    
    // if (isProtectedRoute) {
    //     const authCookie = request.cookies.get('auth');
    //     if (!authCookie?.value) {
    //         return NextResponse.redirect(new URL('/login', request.url));
    //     }

    //     try {
    //         const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    //         await jose.jwtVerify(authCookie.value, secret);
    //         return NextResponse.next();
    //     } catch (error) {
    //         console.error('JWT verification failed:', error);
    //         // Clear invalid cookie and redirect
    //         const response = NextResponse.redirect(new URL('/login', request.url));
    //         response.cookies.delete('auth');
    //         return response;
    //     }
    // }
    
    // Redirect logged-in users from login/2fa pages to dashboard
    if (pathname === '/login' || pathname === '/2fa') {
        const authCookie = request.cookies.get('auth');
        if (authCookie?.value) {
             try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
                await jose.jwtVerify(authCookie.value, secret);
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch (error) {
                // Invalid token, let them stay on the page
            }
        }
    }

    return NextResponse.next();
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
