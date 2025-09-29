import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { BottomNav } from '@/components/common/BottomNav';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/auth';
import { Header } from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'CreditFlow Ledger',
  description: 'Customer ledger system for tracking credit and debit.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getIronSession(cookies(), sessionOptions);
  const isLoggedIn = session.isLoggedIn || false;
  const username = session.username || 'Guest';
  const isAdmin = session.isAdmin || false;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <Header isLoggedIn={isLoggedIn} username={username} isAdmin={isAdmin} />
        <div className="pb-20 md:pb-0">
          {children}
        </div>
        <Toaster />
        {isLoggedIn && isAdmin && <BottomNav />}
      </body>
    </html>
  );
}
