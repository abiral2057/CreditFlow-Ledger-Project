
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  const body = await request.json();

  const { email, username, uid } = body;
  
  // Enforce admin check
  const ADMIN_UID = process.env.ADMIN_UID || 'fk1OUNDO5gc50Yi1JkvmrlMoS8g2';
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS?.split(',') || ['abiral.shrestha72@gmail.com']);

  const isAdmin = uid === ADMIN_UID || ADMIN_EMAILS.includes(email);

  session.isLoggedIn = true;
  session.username = username;
  session.uid = uid;
  session.isAdmin = isAdmin;
  await session.save();

  return NextResponse.json({ success: true, username, isAdmin });
}
