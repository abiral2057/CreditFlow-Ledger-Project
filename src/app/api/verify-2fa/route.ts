import { NextRequest, NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import { serialize } from 'cookie';
import * as jose from 'jose';

export async function POST(request: NextRequest) {
  const preauthCookie = request.cookies.get('preauth');

  if (!preauthCookie || preauthCookie.value !== '1') {
    return NextResponse.json({ success: false, message: 'Not authorized.' }, { status: 401 });
  }

  const { token } = await request.json();
  const { TOTP_SECRET, JWT_SECRET, AUTH_EMAIL } = process.env;

  if (!TOTP_SECRET || !JWT_SECRET || !AUTH_EMAIL) {
    console.error('Missing required environment variables for 2FA verification.');
    return NextResponse.json({ success: false, message: 'Server configuration error.' }, { status: 500 });
  }

  const verified = speakeasy.totp.verify({
    secret: TOTP_SECRET,
    encoding: 'base32',
    token,
    window: 1,
  });

  if (verified) {
    // Clear preauth cookie
    const clearPreauthCookie = serialize('preauth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
    });

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

    const response = NextResponse.json({ success: true, message: '2FA successful.' });
    // Set both cookies in the response headers
    response.headers.append('Set-Cookie', clearPreauthCookie);
    response.headers.append('Set-Cookie', authCookie);
    
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid 2FA token.' }, { status: 401 });
}
