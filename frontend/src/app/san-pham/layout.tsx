import { Suspense } from "react";
import { ProductSidebar } from "@/components/product/ProductSidebar";

export default function SanPhamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-1 bg-zinc-50">
      <Suspense fallback={<aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white md:block" />}>
        <ProductSidebar />
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
