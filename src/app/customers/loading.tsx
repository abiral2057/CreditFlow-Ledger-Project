import { Header } from "@/components/common/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="w-full">
              <Skeleton className="h-9 w-48" />
              <Skeleton className="h-4 w-72 mt-2" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <Skeleton className="h-10 w-full md:w-64" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
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
