import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/types";
import { User, Hash, Phone, ArrowRight } from "lucide-react";

type CustomerCardProps = {
  customer: Customer;
};

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Link href={`/customers/${customer.id}`} className="group h-full">
      <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 hover:border-accent/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-headline text-primary">
            <User className="h-5 w-5 text-accent" />
            {customer.meta.name || customer.title.rendered}
          </CardTitle>
          <CardDescription className="flex items-center gap-2 pt-1">
            <Hash className="h-4 w-4" />
            {customer.meta.customer_code}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span>{customer.meta.phone_number || 'No phone number'}</span>
            </div>
            <div className="text-right mt-4">
                <Button variant="ghost" size="sm" className="text-accent group-hover:bg-accent/10">
                    View Ledger
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}
