
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  // Redirect to login page after destroying the session
  const response = NextResponse.redirect(new URL('/login', request.url), { status: 302 });
  return response;
}
