
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  const body = await request.json();

  const { isGoogle, email, username, uid } = body;
  
  // Enforce admin UID check
  const ADMIN_UID = process.env.ADMIN_UID || 'fk1OUNDO5gc50Yi1JkvmrlMoS8g2';
  if (uid !== ADMIN_UID) {
    return NextResponse.json({ success: false, error: 'Unauthorized access. This account is not permitted.' });
  }

  session.isLoggedIn = true;
  session.username = username;
  await session.save();

  return NextResponse.json({ success: true, username });
}
