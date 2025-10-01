
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export default async function RootPage() {
    const cookieStore = cookies();
    const authCookie = cookieStore.get('auth');

    if (authCookie?.value) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(authCookie.value, secret);
        // If token is valid, go to the admin dashboard
        redirect('/dashboard');
      } catch (e) {
        // Invalid token, fall through to public page
      }
    }
    
    // If not logged in, redirect to the admin customers page (which will be caught by middleware)
    redirect('/customers');
}
