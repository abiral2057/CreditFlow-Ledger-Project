
import { getCustomerById, getTransactionsForCustomer } from "@/lib/api";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import { ArrowLeft, User, Phone, CircleDollarSign, Hash, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddTransactionForm } from "@/components/transactions/AddTransactionForm";
import { TransactionsDataTable } from "@/components/transactions/TransactionsDataTable";
import { SidebarInset } from "@/components/ui/sidebar";

export default async function CustomerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  let customer, transactions;

  try {
    [customer, transactions] = await Promise.all([
      getCustomerById(id),
      getTransactionsForCustomer(id)
    ]);
  } catch (error) {
    if ((error as Error).message === 'Customer not found') {
      notFound();
    }
    throw error;
  }
  
  if (!customer) {
    notFound();
  }

  const totalCredit = transactions
    .filter(t => t.meta.transaction_type === 'Credit')
    .reduce((sum, t) => sum + parseFloat(t.meta.amount || '0'), 0);

  const totalDebit = transactions
    .filter(t => t.meta.transaction_type === 'Debit')
    .reduce((sum, t) => sum + parseFloat(t.meta.amount || '0'), 0);

  const balance = totalCredit - totalDebit;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <SidebarInset>
        <div className="container mx-auto">
        <main className="flex-1 p-4 md:p-8 animate-in fade-in-0 duration-500">
          <div className="mb-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Customers
              </Link>
            </Button>
          </div>

          <Card className="mb-8 shadow-sm">
              <CardHeader>
                  <CardTitle className="text-3xl font-headline text-primary flex items-center gap-3">
                      <User className="h-8 w-8 text-accent"/>
                      {customer.meta.name || customer.title.rendered}
                  </CardTitle>
                  <CardDescription>Ledger details and transaction history.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      <strong>Code:</strong> <span className="text-foreground">{customer.meta.customer_code}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <strong>Phone:</strong> <span className="text-foreground">{customer.meta.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <CircleDollarSign className="h-4 w-4" />
                      <strong>Credit Limit:</strong> <span className="text-foreground">{formatAmount(customer.meta.credit_limit)}</span>
                  </div>
              </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
                      <ArrowUp className="h-5 w-5 text-[hsl(var(--chart-2))]" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold text-[hsl(var(--chart-2))]">+{formatAmount(totalCredit)}</div>
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
                      <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                      <CircleDollarSign className={`h-5 w-5 ${balance >= 0 ? 'text-primary' : 'text-destructive'}`} />
                  </CardHeader>
                  <CardContent>
                      <div className={`text-2xl font-bold ${balance >= 0 ? 'text-primary' : 'text-destructive'}`}>{formatAmount(balance)}</div>
                  </CardContent>
              </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <h3 className="text-2xl font-headline font-bold text-primary">Transaction History</h3>
              <AddTransactionForm customerId={customer.id} />
          </div>
          <Card className="shadow-sm">
            <TransactionsDataTable transactions={transactions} customerId={id} customer={customer} />
          </Card>
        </main>
        </div>
      </SidebarInset>
    </div>
  );
}
