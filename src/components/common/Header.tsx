
'use client';

import { WalletCards, Users, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const navLinks = [
    { href: '/', label: 'Customers', icon: Users },
    { href: '/transactions', label: 'Transactions', icon: WalletCards },
  ]

  const NavLinkContent = ({isSheet = false} : {isSheet?: boolean}) => (
    <>
    {navLinks.map((link) => {
        const isActive = (link.href === '/' && pathname === '/') || (link.href !== '/' && pathname.startsWith(link.href));
        return (
          <Link 
              key={link.href}
              href={link.href}
              onClick={() => isSheet && setIsSheetOpen(false)}
              className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
                  isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                  isSheet && "text-lg gap-4"
              )}
          >
              <link.icon className="h-5 w-5" />
              {link.label}
          </Link>
      )
    })}
    </>
  )

  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <WalletCards className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
            <NavLinkContent />
        </nav>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className='border-b pb-4 mb-4'>
                 <Link href="/" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-3 text-primary">
                    <WalletCards className="h-7 w-7 text-accent" />
                    <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
                  </Link>
              </div>
              <nav className="flex flex-col gap-2">
                <NavLinkContent isSheet={true} />
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
