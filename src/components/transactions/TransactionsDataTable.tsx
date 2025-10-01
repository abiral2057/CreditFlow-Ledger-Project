
'use client'

import { useState, useMemo, useEffect, useTransition } from 'react';
import type { Transaction, Customer } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTransactionButton } from "@/components/transactions/DeleteTransactionButton";
import { formatAmount } from "@/lib/utils";
import { Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, FileDown, Coins, CreditCard, Landmark, Banknote } from "lucide-react";
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { EditTransactionForm } from './EditTransactionForm';
import { ViewTransactionDialog } from './ViewTransactionDialog';


type TransactionsDataTableProps = {
    transactions: Transaction[];
    customerId: string;
    customer: Customer;
    isReadOnly?: boolean;
}

const ITEMS_PER_PAGE = 10;

const paymentMethodIcons: Record<string, React.ReactNode> = {
    'Cash': <Coins className="h-4 w-4" />,
    'Card': <CreditCard className="h-4 w-4" />,
    'Bank Transfer': <Landmark className="h-4 w-4" />,
    'Online Payment': <Banknote className="h-4 w-4" />,
};

export function TransactionsDataTable({ transactions, customerId, customer, isReadOnly = false }: TransactionsDataTableProps) {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [isClient, setIsClient] = useState(false);
    const isMobile = useIsMobile();


    useEffect(() => {
        // This ensures the date is only set on the client, preventing hydration mismatch
        setIsClient(true);
    }, []);

    const filteredTransactions = useMemo(() => {
        if (!dateRange?.from || !isClient) return transactions;
        return transactions.filter(tx => {
            const txDate = new Date(tx.date);
            const from = new Date(dateRange.from!);
            from.setHours(0,0,0,0); // Start of the day
            const to = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from!);
            to.setHours(23,59,59,999); // End of the day
            
            return txDate >= from && txDate <= to;
        });
    }, [transactions, dateRange, isClient]);


    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
        setSelectedRows([]);
    }, [transactions, dateRange]);

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedRows(paginatedTransactions.map(tx => tx.id.toString()));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedRows(prev => [...prev, id]);
        } else {
            setSelectedRows(prev => prev.filter(rowId => rowId !== id));
        }
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
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
            setIsBulkDeleteConfirmOpen(false);
            }
        });
      };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        
        const totalCredit = filteredTransactions
            .filter(t => t.meta.transaction_type === 'Credit')
            .reduce((sum, t) => sum + parseFloat(t.meta.amount || '0'), 0);
        const totalDebit = filteredTransactions
            .filter(t => t.meta.transaction_type === 'Debit')
            .reduce((sum, t) => sum + parseFloat(t.meta.amount || '0'), 0);
        const balance = totalCredit - totalDebit;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('Transaction Ledger', 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Customer: ${customer.meta.name}`, 14, 32);
        doc.text(`Code: ${customer.meta.customer_code}`, 14, 38);
        doc.text(`Date Range: ${dateRange?.from ? format(dateRange.from, 'PP') : 'All Time'} - ${dateRange?.to ? format(dateRange.to, 'PP') : ''}`, 14, 44);
        
        const tableData = filteredTransactions.map(tx => [
            new Date(tx.date).toLocaleDateString(),
            tx.meta.transaction_type,
            tx.meta.method,
            tx.meta.notes,
            `${tx.meta.transaction_type === 'Credit' ? '+' : '-'} ${formatAmount(tx.meta.amount)}`
        ]);

        (doc as any).autoTable({
            startY: 55,
            head: [['Date', 'Type', 'Method', 'Notes', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0] },
            didDrawPage: (data: any) => {
                // Footer
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 70;
        doc.setFontSize(12);

        const summaryX = 140;
        doc.text('Summary', summaryX, finalY + 10);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        (doc as any).autoTable({
            startY: finalY + 14,
            body: [
                ['Total Credit:', `+ ${formatAmount(totalCredit)}`],
                ['Total Debit:', `- ${formatAmount(totalDebit)}`],
            ],
            theme: 'plain',
            tableWidth: 'wrap',
            margin: { left: summaryX - 2 },
            styles: { fontSize: 10, cellPadding: 1 },
        });

        const summaryFinalY = (doc as any).lastAutoTable.finalY;
        doc.setFont('helvetica', 'bold');
        (doc as any).autoTable({
            startY: summaryFinalY + 1,
             body: [
                ['Current Balance:', formatAmount(balance)],
            ],
            theme: 'plain',
            tableWidth: 'wrap',
            margin: { left: summaryX - 2 },
            styles: { fontSize: 11, cellPadding: 1, fontStyle: 'bold' },
            bodyStyles: {
                textColor: balance >= 0 ? [76, 175, 80] : [244, 67, 54],
            }
        });


        doc.save(`Ledger_${customer.meta.name.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    };


    const isAllSelectedInPage = selectedRows.length > 0 && paginatedTransactions.every(tx => selectedRows.includes(tx.id.toString()));
    const isIndeterminate = selectedRows.length > 0 && !isAllSelectedInPage;

    if (!isClient) {
        // Render a skeleton or null to avoid hydration mismatch while server-rendering
        return (
            <div className="p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                    <Skeleton className="h-10 w-full sm:w-[300px]" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }


    return (
        <>
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
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
                    <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
                {!isReadOnly && selectedRows.length > 0 && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <div className="text-sm text-muted-foreground">
                            {selectedRows.length} selected
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteConfirmOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                )}
            </div>
            <div className="overflow-x-auto">
              <Table>
                  <TableHeader>
                      <TableRow>
                        {!isReadOnly && (
                            <TableHead className="w-[50px] px-4">
                                <Checkbox 
                                    checked={isAllSelectedInPage || (isIndeterminate ? 'indeterminate' : false)}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all rows on this page"
                                />
                            </TableHead>
                        )}
                      <TableHead className="w-[150px]">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="table-cell">Payment Method</TableHead>
                      <TableHead className="hidden sm:table-cell">Notes</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-[120px] text-right pr-4">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map(tx => (
                          <TableRow key={tx.id} data-state={selectedRows.includes(tx.id.toString()) && "selected"} className="hover:bg-muted/50">
                              {!isReadOnly && (
                                <TableCell className="px-4">
                                    <Checkbox 
                                        checked={selectedRows.includes(tx.id.toString())}
                                        onCheckedChange={(checked) => handleSelectRow(tx.id.toString(), !!checked)}
                                        aria-label={`Select row ${tx.id}`}
                                    />
                                </TableCell>
                              )}
                              <TableCell className="font-medium">
                                {new Date(tx.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                  <Badge variant={tx.meta.transaction_type === 'Credit' ? 'secondary' : 'destructive'} >
                                  {tx.meta.transaction_type}
                                  </Badge>
                              </TableCell>
                              <TableCell className="table-cell">
                                  <div className="flex items-center gap-2">
                                    {paymentMethodIcons[tx.meta.method] || <CreditCard className="h-4 w-4" />}
                                    {tx.meta.method}
                                  </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell truncate max-w-[150px]">
                                {tx.meta.notes || '-'}
                              </TableCell>
                              <TableCell className={`text-right font-semibold ${tx.meta.transaction_type === 'Credit' ? 'text-green-600' : 'text-destructive'}`}>
                                  {tx.meta.transaction_type === 'Credit' ? '+' : '-'}{formatAmount(tx.meta.amount)}
                              </TableCell>
                              
                              <TableCell className="text-right pr-2">
                                  <div className="flex justify-end items-center">
                                      <ViewTransactionDialog transaction={tx} />
                                      {!isReadOnly && (
                                        <>
                                          <EditTransactionForm transaction={tx} customerId={customerId} />
                                          <DeleteTransactionButton transactionId={tx.id.toString()} customerId={customerId} />
                                        </>
                                      )}
                                  </div>
                              </TableCell>
                          </TableRow>
                      ))
                      ) : (
                      <TableRow>
                          <TableCell colSpan={isReadOnly ? 5 : 7} className="text-center h-24">
                              No transactions found.
                          </TableCell>
                      </TableRow>
                      )}
                  </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Showing {paginatedTransactions.length > 0 ? ((currentPage -1) * ITEMS_PER_PAGE) + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transaction(s).
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <span className="text-sm font-medium">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || totalPages === 0}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
            <AlertDialog open={isBulkDeleteConfirmOpen} onOpenChange={setIsBulkDeleteConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will permanently delete the selected {selectedRows.length} transaction(s).
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} disabled={isPending} className="bg-destructive hover:bg-destructive/90">
                        {isPending ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
