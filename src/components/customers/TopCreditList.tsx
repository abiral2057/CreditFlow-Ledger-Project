
'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatAmount } from "@/lib/utils";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Printer, User } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { Customer } from '@/lib/types';

const ITEMS_PER_PAGE = 12;

type CustomerWithBalance = Customer & { balance: number };

type TopCreditListProps = {
    customers: CustomerWithBalance[];
}

export function TopCreditList({ customers }: TopCreditListProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    const currentPage = Number(searchParams.get('page')) || 1;

    const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return customers.slice(startIndex, endIndex);
    }, [customers, currentPage]);

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(name, value);
        return params.toString();
    };

    const handlePageChange = (page: number) => {
        router.push(`${pathname}?${createQueryString('page', page.toString())}`);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('Top Credit Customers Report', 14, 22);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
        
        const tableData = customers.map((c, index) => [
            index + 1,
            c.meta.name,
            c.meta.customer_code,
            c.meta.phone,
            formatAmount(c.balance),
        ]);

        (doc as any).autoTable({
            startY: 40,
            head: [['#', 'Name', 'Customer Code', 'Phone', 'Balance']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [0, 0, 0] },
        });

        doc.save(`Top_Credit_Customers_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-2xl font-headline">Top Credit Customers</CardTitle>
                        <CardDescription>List of customers sorted by their credit balance from highest to lowest.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] hidden sm:table-cell">#</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden md:table-cell">Customer Code</TableHead>
                                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCustomers.length > 0 ? (
                                paginatedCustomers.map((customer, index) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium hidden sm:table-cell">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/customers/${customer.id}`} className="flex items-center gap-3 group">
                                                <Avatar className="h-9 w-9">
                                                    <AvatarFallback>
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="grid gap-0.5">
                                                    <p className="font-medium text-primary group-hover:underline">{customer.meta.name}</p>
                                                    <p className="text-xs text-muted-foreground md:hidden">{customer.meta.customer_code}</p>
                                                </div>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{customer.meta.customer_code}</TableCell>
                                        <TableCell className="hidden lg:table-cell">{customer.meta.phone || 'N/A'}</TableCell>
                                        <TableCell className={`text-right font-semibold ${customer.balance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                                            {formatAmount(customer.balance)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                 {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t print:hidden">
                        <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
