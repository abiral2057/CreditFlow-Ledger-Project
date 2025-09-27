
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';
import { validateUser } from '@/lib/api';

export async function POST(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  const body = await request.json();

  if (body.isGoogle) {
    // Handle Google Sign-In
    const { username, email } = body;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nepalhighlandtreks2080@gmail.com';

    if (email !== ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. This account is not permitted.' });
    }

    session.isLoggedIn = true;
    session.username = username;
    session.token = `google-user-${email}`;
    await session.save();

    return NextResponse.json({ success: true, username });

  } else {
    // Handle username/password login
    const { username, password } = body;
    try {
      const user = await validateUser(username, password);

      if (!user.token) {
        throw new Error(user.message || 'Invalid credentials');
      }

      session.isLoggedIn = true;
      session.username = user.user_display_name;
      session.token = user.token;
      await session.save();

      return NextResponse.json({ success: true, username: user.user_display_name });
    } catch (error) {
      return NextResponse.json({ success: false, error: (error as Error).message });
    }
  }
}
