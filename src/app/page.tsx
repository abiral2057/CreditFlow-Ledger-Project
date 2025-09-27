

import { getAllCustomers, getAllTransactions } from "@/lib/api";
import { Header } from "@/components/common/Header";
import type { Customer, Transaction, TransactionWithCustomer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import { ArrowUp, ArrowDown, CircleDollarSign, User } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { TopCustomersChart } from "@/components/dashboard/TopCustomersChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/auth';


type CustomerWithBalance = Customer & { balance: number };

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getIronSession(cookies(), sessionOptions);
  const isLoggedIn = session.isLoggedIn || false;
  const username = session.username || 'User';

  const [customers, allTransactions] = await Promise.all([
    getAllTransactions(),
    getAllCustomers(),
  ]);

  const customerBalances: Record<string, number> = {};
  customers.forEach(tx => {
    if (!tx.customer) return;
    const customerId = tx.customer.id.toString();
    const amount = parseFloat(tx.meta.amount || '0');
    if (tx.meta.transaction_type === 'Credit') {
      customerBalances[customerId] = (customerBalances[customerId] || 0) + amount;
    } else {
      customerBalances[customerId] = (customerBalances[customerId] || 0) - amount;
    }
  });

  const customersWithBalance: CustomerWithBalance[] = allTransactions.map(c => ({
    ...c,
    balance: customerBalances[c.id.toString()] || 0
  }));

  const totalCredit = customers
    .filter(t => t.meta.transaction_type === 'Credit')
    .reduce((sum, t) => sum + parseFloat(t.meta.amount || '0'), 0);

  const totalDebit = customers
    .filter(t => t.meta.transaction_type === 'Debit')
    .reduce((sum, t) => sum + parseFloat(t.meta.amount || '0'), 0);

  const totalBalance = totalCredit - totalDebit;

  const topCreditCustomers = [...customersWithBalance].sort((a, b) => b.balance - a.balance).slice(0, 5);
  const topDebitCustomers = [...customersWithBalance].sort((a, b) => a.balance - b.balance).slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header isLoggedIn={isLoggedIn} username={username} />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-headline font-bold text-primary">Dashboard</h1>
            <p className="text-muted-foreground mt-1">An overview of your business.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
                    <ArrowUp className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">+{formatAmount(totalCredit)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
                    <ArrowDown className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">-{formatAmount(totalDebit)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
                    <CircleDollarSign className={`h-5 w-5 ${totalBalance >= 0 ? 'text-primary' : 'text-destructive'}`} />
                </CardHeader>
                <CardContent>
                    <div className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatAmount(totalBalance)}</div>
                </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <Card>
                <CardHeader>
                    <CardTitle>Top 5 Customers by Balance</CardTitle>
                    <CardDescription>Highest and lowest balances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TopCustomersChart customers={customersWithBalance} />
                </CardContent>
            </Card>
            <RecentTransactions transactions={customers} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Credit Customers</CardTitle>
                <CardDescription>Customers with the highest positive balance.</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerList customers={topCreditCustomers} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Debit Customers</CardTitle>
                <CardDescription>Customers with the highest negative balance.</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerList customers={topDebitCustomers} />
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

function CustomerList({ customers }: { customers: CustomerWithBalance[] }) {
    if (customers.length === 0) {
        return <p className="text-muted-foreground text-center py-4">No customers to display.</p>;
    }
    return (
        <ul className="space-y-3">
            {customers.map(customer => (
            <li key={customer.id} className="flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <Button variant="link" asChild className="p-0 h-auto font-medium -ml-1">
                            <Link href={`/customers/${customer.id}`}>{customer.meta.name}</Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">{customer.meta.customer_code}</p>
                    </div>
                </div>
                <div className={`font-semibold text-sm ${customer.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {formatAmount(customer.balance)}
                </div>
            </li>
            ))}
        </ul>
    )
}
