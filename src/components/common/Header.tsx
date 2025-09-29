
'use client';

import { WalletCards, Users, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export function Header({ isLoggedIn = true, username = 'Admin' }: { isLoggedIn?: boolean; username?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const navLinks = [
    { href: '/customers', label: 'Customers', icon: Users },
    { href: '/transactions', label: 'Transactions', icon: WalletCards },
  ]

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <WalletCards className="h-7 w-7 text-accent" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
        </Link>
        
        {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
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
        )}

        <div className='flex items-center gap-4'>
            {isLoggedIn ? (
                <>
                  <div className='flex items-center gap-2 text-sm'>
                    <UserIcon className='h-5 w-5 text-muted-foreground' />
                    <span className='font-medium text-muted-foreground'>{username}</span>
                  </div>
                   <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            )}
        </div>
      </div>
    </header>
  );
}
