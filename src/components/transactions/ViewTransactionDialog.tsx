
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Tag, CreditCard, Landmark, Coins, FileText, Banknote } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { formatAmount } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { format as formatDate } from 'date-fns';

type ViewTransactionDialogProps = {
  transaction: Transaction;
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
    'Cash': <Coins className="h-4 w-4 text-muted-foreground" />,
    'Card': <CreditCard className="h-4 w-4 text-muted-foreground" />,
    'Bank Transfer': <Landmark className="h-4 w-4 text-muted-foreground" />,
    'Online Payment': <Banknote className="h-4 w-4 text-muted-foreground" />,
};

export function ViewTransactionDialog({ transaction }: ViewTransactionDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8">
            <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">Transaction Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Amount</span>
                <span className={`text-lg font-bold ${transaction.meta.transaction_type === 'Credit' ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>
                    {transaction.meta.transaction_type === 'Credit' ? '+' : '-'}{formatAmount(transaction.meta.amount)}
                </span>
            </div>
            <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm text-muted-foreground ml-auto">{formatDate(new Date(transaction.date), 'PPP')}</span>
                </div>
                 <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant={transaction.meta.transaction_type === 'Credit' ? 'secondary' : 'destructive'} className="ml-auto">
                        {transaction.meta.transaction_type}
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    {paymentMethodIcons[transaction.meta.method] || <CreditCard className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">Payment Method:</span>
                    <span className="text-sm text-muted-foreground ml-auto">{transaction.meta.method}</span>
                </div>
            </div>
            {transaction.meta.notes && (
                 <div className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Notes:</span>
                    </div>
                    <p className="text-sm text-muted-foreground pl-1">{transaction.meta.notes}</p>
                 </div>
            )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
