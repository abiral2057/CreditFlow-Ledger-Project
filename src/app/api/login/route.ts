import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const { AUTH_EMAIL, AUTH_PASSWORD } = process.env;

  if (email === AUTH_EMAIL && password === AUTH_PASSWORD) {
    const preauthCookie = serialize('preauth', '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      sameSite: 'lax',
    });

    const response = NextResponse.json({ success: true, message: 'Credentials valid.' });
    response.headers.set('Set-Cookie', preauthCookie);
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
}
