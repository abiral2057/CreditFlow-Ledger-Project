
import { getAllCustomers } from "@/lib/api";
import { CustomerCard } from "@/components/customers/CustomerCard";
import type { Customer } from "@/lib/types";
import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm";
import { CustomerSearch } from "@/components/customers/CustomerSearch";

export const dynamic = 'force-dynamic';

export default async function CustomersPage({ searchParams }: { searchParams?: { query?: string; }; }) {
  const allCustomers = await getAllCustomers();
  const searchQuery = searchParams?.query || '';

  const filteredCustomers = allCustomers.filter(customer => {
      const name = customer.meta.name?.toLowerCase() || '';
      const phone = customer.meta.phone?.toLowerCase() || '';
      const customer_code = customer.meta.customer_code?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || phone.includes(query) || customer_code.includes(query);
  });

  return (
    <div className="flex-1 bg-muted/40">
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className='w-full'>
              <h2 className="text-3xl font-headline font-bold text-primary">Customers</h2>
              <p className="text-muted-foreground mt-1">An overview of all your customers.</p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <CustomerSearch />
              <CreateCustomerForm />
            </div>
          </div>
          {filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
              {filteredCustomers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground rounded-lg border border-dashed">
              <p className="text-lg font-medium">No customers found.</p>
              <p className="text-sm mt-2">{searchQuery ? 'Try adjusting your search.' : 'Click "Create Customer" to get started.'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
