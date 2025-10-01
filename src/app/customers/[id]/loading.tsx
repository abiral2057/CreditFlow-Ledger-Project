
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function CustomerLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button disabled variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="mb-8">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-9 w-1/3" />
                </div>
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-48" />
            </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-1/2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[70px] w-full" />
                </CardContent>
            </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-10 w-36" />
        </div>
        <Card>
            <div className="p-4 flex items-center justify-between">
                <Skeleton className="h-10 w-64" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-28" />
                </div>
            </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"><Skeleton className="h-5 w-5" /></TableHead>
                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                <TableHead className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead className="text-right"><Skeleton className="h-5 w-24 ml-auto" /></TableHead>
                <TableHead className="w-32"><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-5" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    <TableCell><div className="flex gap-2 justify-end"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
           <div className="flex items-center justify-between p-4">
                <Skeleton className="h-5 w-48" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>
        </Card>
      </main>
    </div>
  );
}
