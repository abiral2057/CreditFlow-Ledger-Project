

'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAllCustomers } from "@/lib/api";
import { Header } from "@/components/common/Header";
import { CustomerCard } from "@/components/customers/CustomerCard";
import type { Customer } from "@/lib/types";
import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const fetchedCustomers = await getAllCustomers();
        setCustomers(fetchedCustomers);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) {
      return customers;
    }
    return customers.filter(customer => {
      const name = customer.meta.name?.toLowerCase() || '';
      const phone = customer.meta.phone?.toLowerCase() || '';
      const customer_code = customer.meta.customer_code?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || phone.includes(query) || customer_code.includes(query);
    });
  }, [customers, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
        <main className="flex-1">
         <div className="container mx-auto py-8 px-4 md:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className='w-full'>
                <h2 className="text-3xl font-headline font-bold text-primary">Customers</h2>
                <p className="text-muted-foreground mt-1">An overview of all your customers.</p>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search customers..."
                    className="pl-10 bg-card"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <CreateCustomerForm />
              </div>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : filteredCustomers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                {filteredCustomers.map((customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground rounded-lg border border-dashed">
                <p className="text-lg font-medium">No customers found.</p>
                <p className="text-sm mt-2">{searchQuery ? 'Try adjusting your search.' : 'Click "Create Customer" to add your first one.'}</p>
              </div>
            )}
          </div>
        </main>
    </div>
  );
}

function CardSkeleton() {
    return (
        <div className="p-6 bg-card border rounded-lg shadow-sm">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-1/3 mb-4" />
            <div className="flex justify-end">
                <Skeleton className="h-9 w-28" />
            </div>
        </div>
    )
}
