
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function GET(request: NextRequest) {
  // Create cookies that expire in the past to effectively delete them
  const authCookie = serialize('auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  const preauthCookie = serialize('preauth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/',
    sameSite: 'lax',
  });

  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  // Set both cookies to clear them
  response.headers.append('Set-Cookie', authCookie);
  response.headers.append('Set-Cookie', preauthCookie);
  
  return response;
}
