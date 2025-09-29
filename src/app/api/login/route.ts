
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import * as jose from 'jose';

// This is just for the temporary disabling of 2FA. 
// In a real app, you'd check this from your database for the specific user.
let isEnrolled = false; 

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { AUTH_EMAIL, AUTH_PASSWORD, JWT_SECRET } = process.env;

  if (email === AUTH_EMAIL && password === AUTH_PASSWORD) {
    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET environment variable.');
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }
    
    // Create JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const jwt = await new jose.SignJWT({ email: AUTH_EMAIL, sub: 'admin_user' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);
    
    // Set auth cookie
    const authCookie = serialize('auth', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60, // 1 hour
      path: '/',
      sameSite: 'lax',
    });


    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful.',
    });
    
    response.headers.set('Set-Cookie', authCookie);
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
}

// This function is used by the verify-2fa route to update the enrollment status
export function setEnrolledStatus(enrolled: boolean) {
  isEnrolled = enrolled;
}
