
'use client'

import type { TransactionWithCustomer } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/utils";
import { CreditCard, Coins, Landmark, User } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

type AllTransactionsDataTableProps = {
    transactions: TransactionWithCustomer[];
}

const paymentMethodIcons: Record<string, React.ReactNode> = {
    'Cash': <Coins className="h-4 w-4 text-muted-foreground" />,
    'Card': <CreditCard className="h-4 w-4 text-muted-foreground" />,
    'Bank Transfer': <Landmark className="h-4 w-4 text-muted-foreground" />,
};

export function AllTransactionsDataTable({ transactions }: AllTransactionsDataTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[120px]">Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.length > 0 ? (
                transactions.map(tx => (
                    <TableRow key={tx.id}>
                        <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                            {tx.customer ? (
                                <Button variant="link" asChild className="p-0 h-auto font-normal text-base">
                                    <Link href={`/customers/${tx.customer.id}`} className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-accent" />
                                        {tx.customer.meta.name}
                                    </Link>
                                </Button>
                            ) : (
                                'N/A'
                            )}
                        </TableCell>
                        <TableCell>
                            <Badge variant={tx.meta.transaction_type === 'Credit' ? 'secondary' : 'destructive'}>
                            {tx.meta.transaction_type}
                            </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                            {paymentMethodIcons[tx.meta.payment_method] || null}
                            {tx.meta.payment_method}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${tx.meta.transaction_type === 'Credit' ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                            {tx.meta.transaction_type === 'Credit' ? '+' : '-'}{formatAmount(tx.meta.amount)}
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No transactions found.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
