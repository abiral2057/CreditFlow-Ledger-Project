
'use client'

import { useState, useMemo } from 'react';
import type { Transaction } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTransactionButton } from "@/components/transactions/DeleteTransactionButton";
import { formatAmount } from "@/lib/utils";
import { CreditCard, Coins, Landmark, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteMultipleTransactions } from '@/lib/actions';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, startOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';


type TransactionsDataTableProps = {
    transactions: Transaction[];
    customerId: string;
}

const ITEMS_PER_PAGE = 12;

const paymentMethodIcons: Record<string, React.ReactNode> = {
    'Cash': <Coins className="h-4 w-4 text-muted-foreground" />,
    'Card': <CreditCard className="h-4 w-4 text-muted-foreground" />,
    'Bank Transfer': <Landmark className="h-4 w-4 text-muted-foreground" />,
};

export function TransactionsDataTable({ transactions, customerId }: TransactionsDataTableProps) {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

    const filteredTransactions = useMemo(() => {
        if (!dateRange?.from) return transactions;
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const from = new Date(dateRange.from!);
            from.setHours(0,0,0,0); // Start of the day
            const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from!);
            to.setHours(23,59,59,999); // End of the day
            
            return txDate >= from && txDate <= to;
        });
    }, [transactions, dateRange]);


    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedRows(paginatedTransactions.map(tx => tx.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
          await deleteMultipleTransactions(selectedRows, customerId);
          toast({
            title: 'Success',
            description: `${selectedRows.length} transaction(s) deleted successfully.`,
          });
          setSelectedRows([]);
        } catch (error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: (error as Error).message,
          });
        } finally {
          setIsDeleting(false);
          setIsBulkDeleteConfirmOpen(false);
        }
      };


    const isAllSelectedInPage = selectedRows.length > 0 && paginatedTransactions.every(tx => selectedRows.includes(tx.id));
    const isIndeterminate = selectedRows.length > 0 && !isAllSelectedInPage;


    return (
        <>
        <div className="flex items-center justify-between p-4">
            <div>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
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
                        <span>Pick a date</span>
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
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
            {selectedRows.length > 0 && (
                <div className="bg-muted/50 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {selectedRows.length} row(s) selected.
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteConfirmOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Selected
                    </Button>
                </div>
            )}
        </div>
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox 
                        checked={isAllSelectedInPage || (isIndeterminate ? 'indeterminate' : false)}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows on this page"
                    />
                </TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px] text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map(tx => (
                    <TableRow key={tx.id} data-state={selectedRows.includes(tx.id) && "selected"}>
                        <TableCell>
                            <Checkbox 
                                checked={selectedRows.includes(tx.id)}
                                onCheckedChange={(checked) => handleSelectRow(tx.id, !!checked)}
                                aria-label={`Select row ${tx.id}`}
                            />
                        </TableCell>
                        <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
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
                        <TableCell className="text-right">
                            <DeleteTransactionButton transactionId={tx.id} customerId={customerId} />
                        </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No transactions found for the selected date range.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
        <div className="flex items-center justify-between p-4">
            <div className="text-sm text-muted-foreground">
                Showing {paginatedTransactions.length > 0 ? ((currentPage -1) * ITEMS_PER_PAGE) + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transaction(s).
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <span className="text-sm font-medium">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <AlertDialog open={isBulkDeleteConfirmOpen} onOpenChange={setIsBulkDeleteConfirmOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the selected {selectedRows.length} transaction(s).
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                    {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
