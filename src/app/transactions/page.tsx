
import { getAllTransactions } from "@/lib/api";
import { Header } from "@/components/common/Header";
import { Card } from "@/components/ui/card";
import { AllTransactionsDataTable } from "@/components/transactions/AllTransactionsDataTable";
import type { TransactionWithCustomer } from "@/lib/types";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const transactions: TransactionWithCustomer[] = await getAllTransactions();
  const session = await getIronSession(cookies(), sessionOptions);
  const isLoggedIn = session.isLoggedIn || false;
  const username = session.username || 'User';

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header isLoggedIn={isLoggedIn} username={username} />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold text-primary">All Transactions</h2>
              <p className="text-muted-foreground mt-1">A complete record of all credits and debits.</p>
            </div>
          </div>
          <Card className="shadow-sm">
            <AllTransactionsDataTable transactions={transactions} />
          </Card>
        </div>
      </main>
    </div>
  );
}
