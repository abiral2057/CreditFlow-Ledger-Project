import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(request: NextRequest) {
  // Create a cookie that expires in the past to effectively delete it
  const authCookie = serialize('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  const response = NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  response.headers.set('Set-Cookie', authCookie);
  
  return response;
}
