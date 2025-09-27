
'use client';

import { WalletCards, Users } from 'lucide-react';
import Link from 'next/link';
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '../ui/sidebar';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  return (
    <>
      <header className="bg-card border-b sticky top-0 z-40 shadow-sm md:z-50 md:pl-[calc(var(--sidebar-width-icon)_+_1rem)] peer-data-[collapsible=icon]:md:pl-[calc(var(--sidebar-width)_+_1rem)] transition-[padding] peer-data-[variant=inset]:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
              <WalletCards className="h-8 w-8 text-accent" />
              <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow</h1>
            </Link>
          </div>
        </div>
      </header>
      <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Customers">
                  <Link href="/">
                      <Users />
                      <span>Customers</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/transactions'} tooltip="All Transactions">
                  <Link href="/transactions">
                      <WalletCards />
                      <span>All Transactions</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
      </Sidebar>
    </>
  );
}
