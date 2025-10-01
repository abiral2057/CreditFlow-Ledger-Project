
'use client';

import type { TransactionWithCustomer } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatAmount } from "@/lib/utils";
import { User, CreditCard, Coins, Landmark, Banknote } from "lucide-react";
import Link from 'next/link';
import { Button } from "../ui/button";

type RecentTransactionsProps = {
    transactions: TransactionWithCustomer[];
}

const paymentMethodIcons: Record<string, React.ReactNode> = {
    'Cash': <Coins className="h-4 w-4 text-muted-foreground" />,
    'Card': <CreditCard className="h-4 w-4 text-muted-foreground" />,
    'Bank Transfer': <Landmark className="h-4 w-4 text-muted-foreground" />,
    'Online Payment': <Banknote className="h-4 w-4 text-muted-foreground" />,
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const recentTransactions = transactions.slice(0, 5);

    if (recentTransactions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>No recent transactions recorded.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No transactions yet.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of the latest transactions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {recentTransactions.map(tx => (
                        <li key={tx.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                 <div className="p-2 bg-primary/10 rounded-full">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        <Button variant="link" asChild className="p-0 h-auto -ml-1">
                                            <Link href={`/customers/${tx.customer?.id}`}>
                                                {tx.customer?.meta.name}
                                            </Link>
                                        </Button>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                       {new Date(tx.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-semibold text-sm ${tx.meta.transaction_type === 'Credit' ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                                    {tx.meta.transaction_type === 'Credit' ? '+' : '-'}{formatAmount(tx.meta.amount)}
                                </p>
                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                    {paymentMethodIcons[tx.meta.method]}
                                    <span>{tx.meta.method}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
