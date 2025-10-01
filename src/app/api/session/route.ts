
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');

    if (!authCookie?.value) {
        return NextResponse.json({ isLoggedIn: false });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(authCookie.value, secret);
        return NextResponse.json({
            isLoggedIn: true,
            username: payload.email as string,
        });
    } catch {
        return NextResponse.json({ isLoggedIn: false });
    }
}
