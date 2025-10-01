
'use client';

import { WalletCards, Users, LogOut, User as UserIcon, LayoutGrid, ShieldCheck, Menu, Search, LogIn, TrendingUp } from 'lucide-react';
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
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '../ui/sheet';
import React from 'react';
import { useSession } from '@/hooks/use-session';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading } = useSession();
  
  const adminNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid, exact: true },
    { href: '/customers', label: 'Customers', icon: Users, exact: false },
    { href: '/transactions', label: 'Transactions', icon: WalletCards, exact: false },
    { href: '/top-credit', label: 'Top Credit', icon: TrendingUp, exact: true },
  ];

  const publicNavLinks = [
      { href: '/customer-search', label: 'Search Transactions', icon: Search, exact: true },
      { href: '/login', label: 'Admin Login', icon: LogIn, exact: true },
  ];

  const navLinks = session.isLoggedIn ? adminNavLinks : publicNavLinks;

  const handleLogout = async () => {
    try {
        await fetch('/api/logout');
        window.location.href = '/login';
    } catch (error) {
        console.error("Logout failed", error);
        window.location.href = '/login';
    }
  };

  const isAuthPage = ['/login', '/2fa', '/setup-2fa'].includes(pathname);

  if (isAuthPage) {
     return null;
  }
  
  const renderNavLinks = (links: typeof navLinks, isSheet: boolean = false) => {
    return links.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const linkContent = (
            <>
                <link.icon className={isSheet ? "h-5 w-5" : "h-4 w-4"} />
                {link.label}
            </>
        );

        if (isSheet) {
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
                    {linkContent}
                </Link>
                </SheetClose>
            )
        }

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
                {linkContent}
            </Link>
        )
    });
  }

  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href={session.isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <WalletCards className="h-7 w-7 text-foreground" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">udharibook</h1>
        </Link>
        
        <div className="flex items-center gap-2">
            {isLoading ? (
                 <Skeleton className="h-8 w-8 rounded-full" />
            ) : session.isLoggedIn ? (
                <>
                    <nav className="hidden md:flex items-center gap-2">
                        {renderNavLinks(adminNavLinks)}
                    </nav>
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
                                {session.username}
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
                </>
            ) : (
                <>
                    <nav className="hidden md:flex items-center gap-2">
                        {renderNavLinks(publicNavLinks)}
                    </nav>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Open navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetTitle className="sr-only">Main Menu</SheetTitle>
                            <div className="flex flex-col gap-4 py-8">
                                <Link href="/" className="flex items-center gap-3 text-primary mb-4 px-4">
                                    <WalletCards className="h-7 w-7 text-foreground" />
                                    <h1 className="text-2xl font-headline font-bold tracking-tight">udharibook</h1>
                                </Link>
                                <nav className="flex flex-col gap-2">
                                    {renderNavLinks(publicNavLinks, true)}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </>
            )}
        </div>
      </div>
    </header>
  );
}
