
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { SignJWT } from 'jose';

// This is just for demo purposes. 
// In a real app, you'd check this from your database for the specific user.
let isEnrolled = false; 

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { AUTH_EMAIL, AUTH_PASSWORD, JWT_SECRET, TOTP_SECRET } = process.env;
  
  const requires2FA = !!TOTP_SECRET;

  if (email === AUTH_EMAIL && password === AUTH_PASSWORD) {
    if (!JWT_SECRET) {
      console.error('Missing JWT_SECRET environment variable.');
      return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
    }

    if (requires2FA && TOTP_SECRET) {
      const preauthCookie = serialize('preauth', '1', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 5, // 5 minutes
        path: '/',
        sameSite: 'lax',
      });
      
      const response = NextResponse.json({ 
        success: true, 
        requires2FA: true,
        isEnrolled: isEnrolled 
      });
      response.headers.set('Set-Cookie', preauthCookie);
      return response;

    } else {
      // User will be logged in directly
      const secret = new TextEncoder().encode(JWT_SECRET);
      const jwt = await new SignJWT({ email: AUTH_EMAIL, sub: 'admin_user' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(secret);
      
      const authCookie = serialize('auth', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
        path: '/',
        sameSite: 'lax',
      });

      const response = NextResponse.json({ 
        success: true, 
        requires2FA: false
      });
      response.headers.set('Set-Cookie', authCookie);
      return response;
    }
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
}

// This function is used by the verify-2fa route to update the enrollment status
export function setEnrolledStatus(enrolled: boolean) {
  isEnrolled = enrolled;
}
