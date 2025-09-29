import { Header } from "@/components/common/Header";
import { Spinner } from "@/components/common/Spinner";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Spinner />
      </main>
    </div>
  );
}
