
'use client';

import { WalletCards, Users, LogOut, User as UserIcon, LayoutGrid, ShieldCheck, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../ui/sheet';
import React from 'react';

export function Header({ isLoggedIn, username, isAdmin }: { isLoggedIn?: boolean; username?: string; isAdmin?: boolean; }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/customers', label: 'Customers', icon: Users, exact: false },
    { href: '/transactions', label: 'Transactions', icon: WalletCards, exact: false },
  ];

  const handleLogout = async () => {
    try {
        await fetch('/api/logout');
        // Forcing a full page reload to ensure all state is cleared
        window.location.href = '/login';
    } catch (error) {
        console.error("Logout failed", error);
        // Fallback redirection
        router.push('/login');
        router.refresh();
    }
  };

  const isAuthPage = ['/login', '/2fa', '/setup-2fa'].includes(pathname);

  if (isAuthPage) {
     return null;
  }
  
  if (!isLoggedIn) {
     return (
       <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
              <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
                <WalletCards className="h-7 w-7 text-accent" />
                <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
              </Link>
          </div>
       </header>
     )
  }

  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <WalletCards className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                return (
                <Link 
                    key={link.href}
                    href={link.href}
                    className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                </Link>
            )
            })}
        </nav>

        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <UserIcon className="h-5 w-5" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Admin</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {username}
                    </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/setup-qr')}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Manage 2FA</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Nav */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="flex flex-col gap-4 py-8">
                        <Link href="/dashboard" className="flex items-center gap-3 text-primary mb-4 px-4">
                            <WalletCards className="h-7 w-7 text-accent" />
                            <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
                        </Link>
                        <nav className="flex flex-col gap-2">
                            {navLinks.map((link) => {
                                const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
                                return (
                                <SheetClose asChild key={link.href}>
                                <Link 
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                                        isActive 
                                            ? "bg-primary/10 text-primary" 
                                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                    )}
                                >
                                    <link.icon className="h-5 w-5" />
                                    {link.label}
                                </Link>
                                </SheetClose>
                            )
                            })}
                        </nav>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
      </div>
    </header>
  );
}
