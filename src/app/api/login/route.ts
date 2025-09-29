
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  
  // Since we are disabling real auth, we'll just set the session as a logged-in admin.
  session.isLoggedIn = true;
  session.username = 'Admin';
  session.uid = 'admin_user'; // Mock UID
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ success: true, username: 'Admin', isAdmin: true });
}
