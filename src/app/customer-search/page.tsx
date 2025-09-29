
'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';
import { getAllCustomers, getTransactionsForCustomer } from '@/lib/api';
import type { Customer, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { TransactionsDataTable } from '@/components/transactions/TransactionsDataTable';

export default function CustomerSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please enter a customer code or name to search.' });
            return;
        }

        setIsLoading(true);
        setCustomer(null);
        setTransactions([]);

        try {
            const allCustomers = await getAllCustomers();
            const foundCustomer = allCustomers.find(c => 
                c.meta.customer_code.toLowerCase() === searchTerm.toLowerCase() || 
                c.meta.name.toLowerCase() === searchTerm.toLowerCase()
            );

            if (foundCustomer) {
                const customerTransactions = await getTransactionsForCustomer(foundCustomer.id.toString());
                setCustomer(foundCustomer);
                setTransactions(customerTransactions);
            } else {
                toast({ variant: 'destructive', title: 'Not Found', description: 'No customer found with that code or name.' });
            }
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch customer data.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex-1">
            <div className="container mx-auto py-8 px-4 md:px-6">
                <div className="max-w-2xl mx-auto">
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Search Your Transactions</CardTitle>
                            <CardDescription>Enter your unique Customer Code or full name to find your transaction history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Enter Customer Code or Name..."
                                        className="pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? 'Searching...' : 'Search'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {isLoading && (
                         <div className="text-center p-8">
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
                                />
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
