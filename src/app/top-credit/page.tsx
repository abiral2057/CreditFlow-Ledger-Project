
import { getAllCustomers, getAllTransactions } from "@/lib/api";
import type { Customer, Transaction } from "@/lib/types";
import { TopCreditList } from "@/components/customers/TopCreditList";

type CustomerWithBalance = Customer & { balance: number };

export const dynamic = 'force-dynamic';

export default async function TopCreditPage({ searchParams }: { searchParams?: { page?: string; }; }) {

  const [allTransactions, allCustomers] = await Promise.all([
    getAllTransactions(),
    getAllCustomers(),
  ]);

  const customerBalances: Record<string, number> = {};
  allTransactions.forEach(tx => {
    // Use customer_code as the key to ensure correct mapping
    const customerCode = tx.meta?.customer_code;
    if (!customerCode) return;

    const amount = parseFloat(tx.meta.amount || '0');
    if (tx.meta.transaction_type === 'Credit') {
      customerBalances[customerCode] = (customerBalances[customerCode] || 0) + amount;
    } else {
      customerBalances[customerCode] = (customerBalances[customerCode] || 0) - amount;
    }
  });

  const customersWithBalance: CustomerWithBalance[] = allCustomers.map(c => ({
    ...c,
    balance: customerBalances[c.meta.customer_code] || 0
  })).sort((a, b) => b.balance - a.balance); // Sort from highest to lowest balance

  return (
    <div className="flex-1 bg-muted/40">
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <TopCreditList customers={customersWithBalance} />
        </div>
      </main>
    </div>
  );
}
