
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Header } from '@/components/common/Header';
import { MobileFooterNav } from '@/components/common/MobileFooterNav';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'udharibook',
  description: 'Customer ledger system for tracking credit and debit.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = cookies().has('auth');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 pb-20 md:pb-0">
            {children}
        </div>
        {isLoggedIn && <MobileFooterNav />}
        <Toaster />
      </body>
    </html>
  );
}
