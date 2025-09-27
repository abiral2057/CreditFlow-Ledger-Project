import { Header } from "@/components/common/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Skeleton className="h-9 w-72 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="flex flex-col justify-between gap-4">
                 <Skeleton className="h-4 w-1/3" />
                 <div className="self-end">
                    <Skeleton className="h-9 w-28" />
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
