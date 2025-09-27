import { getAllCustomers } from "@/lib/api";
import { Header } from "@/components/common/Header";
import { CustomerCard } from "@/components/customers/CustomerCard";
import type { Customer } from "@/lib/types";
import { CreateCustomerForm } from "@/components/customers/CreateCustomerForm";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const customers: Customer[] = await getAllCustomers();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-headline font-bold text-primary">Customer Dashboard</h2>
          <CreateCustomerForm />
        </div>
        {customers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground rounded-lg border border-dashed">
            <p className="text-lg font-medium">No customers found.</p>
            <p className="text-sm mt-2">Click "Create Customer" to add your first one.</p>
          </div>
        )}
      </main>
    </div>
  );
}
