import { Header } from "@/components/common/Header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <div>
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-4 w-96 mt-2" />
            </div>
          </div>
          <Card className="shadow-sm">
            <div className="p-4 border-b">
                <Skeleton className="h-10 w-full sm:w-[300px]" />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                        <TableHead><Skeleton className="h-5 w-28" /></TableHead>
                        <TableHead className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}
