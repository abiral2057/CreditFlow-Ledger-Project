
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { sessionOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await getIronSession(cookies(), sessionOptions);
  return NextResponse.json(session);
}
