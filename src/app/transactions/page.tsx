import { getAllTransactions } from "@/lib/api";
import { Header } from "@/components/common/Header";
import { Card } from "@/components/ui/card";
import { AllTransactionsDataTable } from "@/components/transactions/AllTransactionsDataTable";
import type { TransactionWithCustomer } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const transactions: TransactionWithCustomer[] = await getAllTransactions();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-headline font-bold text-primary">All Transactions</h2>
        </div>
        <Card className="shadow-sm">
          <AllTransactionsDataTable transactions={transactions} />
        </Card>
      </main>
    </div>
  );
}
