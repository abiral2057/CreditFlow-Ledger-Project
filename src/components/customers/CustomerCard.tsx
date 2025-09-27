
'use client';

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Customer } from "@/lib/types";
import { User, Hash, Phone, ArrowRight, MoreVertical } from "lucide-react";
import { EditCustomerForm } from "./EditCustomerForm";
import { DeleteCustomerButton } from "./DeleteCustomerButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

type CustomerCardProps = {
  customer: Customer;
};

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
      <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-lg hover:border-accent/50 group">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-2 font-headline text-primary">
                    <User className="h-5 w-5 text-accent" />
                    {customer.meta.name || customer.title.rendered}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <Hash className="h-4 w-4" />
                    {customer.meta.customer_code}
                </CardDescription>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <EditCustomerForm customer={customer} />
                    <DropdownMenuSeparator />
                    <DeleteCustomerButton customerId={customer.id} />
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4" />
                <span>{customer.meta.phone_number || 'No phone number'}</span>
            </div>
            <div className="text-right mt-4">
                <Button asChild variant="ghost" size="sm" className="text-accent group-hover:bg-accent/10">
                    <Link href={`/customers/${customer.id}`}>
                        View Ledger
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
  );
}
