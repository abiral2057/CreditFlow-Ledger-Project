
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Users, WalletCards, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, exact: true },
  { href: '/customers', label: 'Customers', icon: Users, exact: false },
  { href: '/transactions', label: 'Transactions', icon: WalletCards, exact: false },
  { href: '/top-credit', label: 'Top Credit', icon: TrendingUp, exact: true },
];

export function MobileFooterNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-lg z-50">
      <div className="flex justify-around items-center h-full">
        {navLinks.map((link) => {
          const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} className="flex-1 flex flex-col items-center justify-center h-full">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors w-full h-full',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{link.label}</span>
              </div>
               {isActive && <div className="absolute bottom-0 h-1 w-12 bg-primary rounded-t-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
