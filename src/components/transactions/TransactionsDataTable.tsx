
'use client'

import { useState } from 'react';
import type { Transaction } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTransactionButton } from "@/components/transactions/DeleteTransactionButton";
import { formatAmount } from "@/lib/utils";
import { CreditCard, Coins, Landmark, Trash2 } from "lucide-react";
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


type TransactionsDataTableProps = {
    transactions: Transaction[];
    customerId: string;
}

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

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedRows(transactions.map(tx => tx.id));
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


    const isAllSelected = selectedRows.length > 0 && selectedRows.length === transactions.length;
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < transactions.length;

    return (
        <>
        {selectedRows.length > 0 && (
            <div className="p-4 bg-muted/50 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    {selectedRows.length} of {transactions.length} row(s) selected.
                </div>
                <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteConfirmOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                </Button>
            </div>
        )}
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox 
                        checked={isAllSelected || isIndeterminate}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all rows"
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
                {transactions.length > 0 ? (
                transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => (
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
                    No transactions found for this customer.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
        </Table>
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
