
import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

// A simple in-memory flag to simulate if 2FA has been enrolled.
// In a real app, you'd check this from your database for the specific user.
let isEnrolled = false; 

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

    const response = NextResponse.json({ 
      success: true, 
      message: 'Credentials valid.',
      // Signal to the client whether to start the enrollment flow
      // or the standard 2FA verification flow.
      enroll: !isEnrolled 
    });
    
    response.headers.set('Set-Cookie', preauthCookie);
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials.' }, { status: 401 });
}

// This function is used by the verify-2fa route to update the enrollment status
export function setEnrolledStatus(enrolled: boolean) {
  isEnrolled = enrolled;
}
