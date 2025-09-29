import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { cookies } from 'next/headers';
import * as jose from 'jose';

export const metadata: Metadata = {
  title: 'CreditFlow Ledger',
  description: 'Customer ledger system for tracking credit and debit.',
};

async function getSessionData() {
    const authCookie = cookies().get('auth');
    if (!authCookie?.value) {
        return { isLoggedIn: false };
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jose.jwtVerify(authCookie.value, secret);
        return {
            isLoggedIn: true,
            username: payload.email as string,
            isAdmin: true, // Assuming the logged in user is always an admin
        };
    } catch {
        return { isLoggedIn: false };
    }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoggedIn, username, isAdmin } = await getSessionData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <Header isLoggedIn={isLoggedIn} username={username} isAdmin={isAdmin} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
