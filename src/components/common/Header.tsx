import { WalletCards } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <WalletCards className="h-8 w-8 text-accent" />
          <h1 className="text-2xl font-headline font-bold tracking-tight">CreditFlow Ledger</h1>
        </Link>
      </div>
    </header>
  );
}
