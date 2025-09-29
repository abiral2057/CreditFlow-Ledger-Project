
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  const body = await request.json();

  const { isGoogle, email, username } = body;
  
  // Enforce admin email check for both login types
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'abiral.shrestha72@gmail.com';
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ success: false, error: 'Unauthorized access. This account is not permitted.' });
  }

  session.isLoggedIn = true;
  session.username = username;
  await session.save();

  return NextResponse.json({ success: true, username });
}
