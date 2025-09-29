
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from 'lucide-react';
import { getAllCustomers, getTransactionsForCustomer } from '@/lib/api';
import type { Customer, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TransactionsDataTable } from '@/components/transactions/TransactionsDataTable';
import { Spinner } from '@/components/common/Spinner';

export default function CustomerSearchPage() {
    const [customerCode, setCustomerCode] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerCode.trim() && !customerName.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter either Customer Code or Name.' });
            return;
        }

        setIsLoading(true);
        setCustomer(null);
        setTransactions([]);

        try {
            const allCustomers = await getAllCustomers();
            const foundCustomer = allCustomers.find(c => {
                const codeMatch = customerCode.trim() ? c.meta.customer_code.toLowerCase() === customerCode.toLowerCase().trim() : false;
                const nameMatch = customerName.trim() ? c.meta.name.toLowerCase() === customerName.toLowerCase().trim() : false;
                
                if (customerCode.trim() && customerName.trim()) {
                    return codeMatch && nameMatch;
                }
                return codeMatch || nameMatch;
            });

            if (foundCustomer) {
                const customerTransactions = await getTransactionsForCustomer(foundCustomer.id.toString());
                setCustomer(foundCustomer);
                setTransactions(customerTransactions);
                toast({ title: 'Success', description: 'Transactions found.' });
            } else {
                toast({ variant: 'destructive', title: 'Not Found', description: 'No customer found with the provided details.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch customer data.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1">
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Search Your Transactions</CardTitle>
                            <CardDescription>Enter your unique Customer Code and/or full name to find your transaction history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="space-y-4">
                                <div className="space-y-2">
                                     <Label htmlFor="customer-code">Customer Code</Label>
                                     <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            id="customer-code"
                                            placeholder="e.g., CUST-001"
                                            className="pl-10"
                                            value={customerCode}
                                            onChange={(e) => setCustomerCode(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                               <div className="space-y-2">
                                     <Label htmlFor="customer-name">Full Name</Label>
                                     <Input
                                        id="customer-name"
                                        placeholder="e.g., John Doe"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading ? 'Searching...' : 'Search Transactions'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {isLoading && (
                         <div className="text-center p-8 flex flex-col items-center gap-4">
                            <Spinner />
                            <p>Loading transactions...</p>
                        </div>
                    )}

                    {customer && (
                        <div>
                            <h2 className="text-2xl font-bold mb-4">Transaction History for {customer.meta.name}</h2>
                            <Card>
                                <TransactionsDataTable 
                                    transactions={transactions} 
                                    customerId={customer.id.toString()}
                                    customer={customer}
                                    isReadOnly={true}
                                />
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
