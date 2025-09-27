
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, WalletCards, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/transactions', label: 'Transactions', icon: WalletCards },
  ];

  // A more specific link for customers to keep the "Customers" icon active on the customer details page.
  const customerLinks = [
    { href: '/customers', label: 'Customers', icon: Users}
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-sm z-50 flex items-center justify-around">
      {navLinks.map((link) => {
        const isActive = (link.href === '/' && pathname === '/') || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        );
      })}
       {customerLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href="/"
            className={cn(
              'flex flex-col items-center justify-center gap-1 w-full h-full transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
            )}
          >
            <link.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{link.label}</span>
          </Link>
        );
       })}
    </nav>
  );
}
