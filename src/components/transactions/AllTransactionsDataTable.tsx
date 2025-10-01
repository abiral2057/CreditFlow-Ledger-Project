
'use client'

import { useState, useMemo, useEffect } from 'react';
import type { TransactionWithCustomer } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatAmount } from "@/lib/utils";
import { User, Calendar as CalendarIcon, FileDown, Coins, CreditCard, Landmark, Banknote, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Skeleton } from '../ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { ViewTransactionDialog } from './ViewTransactionDialog';

type AllTransactionsDataTableProps = {
    transactions: TransactionWithCustomer[];
}

const paymentMethodIcons: Record<string, React.ReactNode> = {
    'Cash': <Coins className="h-4 w-4 text-muted-foreground" />,
    'Card': <CreditCard className="h-4 w-4 text-muted-foreground" />,
    'Bank Transfer': <Landmark className="h-4 w-4 text-muted-foreground" />,
    'Online Payment': <Banknote className="h-4 w-4 text-muted-foreground" />,
    'Product': <Package className="h-4 w-4 text-muted-foreground" />,
};

export function AllTransactionsDataTable({ transactions }: AllTransactionsDataTableProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isClient, setIsClient] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredTransactions = useMemo(() => {
        if (!dateRange?.from || !isClient) return transactions;
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const from = new Date(dateRange.from!);
            from.setHours(0, 0, 0, 0); // Start of the day
            const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from!);
            to.setHours(23, 59, 59, 999); // End of the day
            
            return txDate >= from && txDate <= to;
        });
    }, [transactions, dateRange, isClient]);

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('All Transactions', 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date Range: ${dateRange?.from ? format(dateRange.from, 'PP') : 'All Time'} - ${dateRange?.to ? format(dateRange.to, 'PP') : ''}`, 14, 32);
        
        const tableData = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.customer?.meta.name || 'N/A',
            tx.meta.transaction_type,
            tx.meta.method,
            tx.meta.notes,
            `${tx.meta.transaction_type === 'Credit' ? '+' : '-'} ${formatAmount(tx.meta.amount)}`
        ]);

        (doc as any).autoTable({
            startY: 45,
            head: [['Date', 'Customer', 'Type', 'Method', 'Notes', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0] },
        });

        doc.save(`All_Transactions_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (!isClient) {
        return (
             <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <Skeleton className="h-10 w-full sm:w-[300px]" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }


    return (
        <>
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[300px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                        dateRange.to ? (
                            <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(dateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date range</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={isMobile ? 1 : 2}
                    />
                    </PopoverContent>
                </Popover>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[150px]">Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="table-cell">Payment Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px] text-right pr-4">View</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(tx => (
                        <TableRow key={tx.id}>
                             <TableCell className="font-medium">
                                {new Date(tx.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                                {tx.customer ? (
                                    <Button variant="link" asChild className="p-0 h-auto font-normal text-base -ml-2">
                                        <Link href={`/customers/${tx.customer.id}`} className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
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
                            <TableCell className="table-cell">
                                <div className="flex items-center gap-2">
                                    {paymentMethodIcons[tx.meta.method] || <CreditCard className="h-4 w-4" />}
                                    {tx.meta.method}
                                </div>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${tx.meta.transaction_type === 'Credit' ? 'text-green-600' : 'text-destructive'}`}>
                                {tx.meta.transaction_type === 'Credit' ? '+' : '-'}{formatAmount(tx.meta.amount)}
                            </TableCell>
                            <TableCell className="text-right pr-2">
                                <ViewTransactionDialog transaction={tx} />
                            </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No transactions found.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>
        </>
    );
}
