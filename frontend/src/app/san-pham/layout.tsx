import { Suspense } from "react";
import { ProductSidebar } from "@/components/product/ProductSidebar";
import { ProductSidebarDrawer } from "@/components/product/ProductSidebarDrawer";

export default function SanPhamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-1 bg-[#f8fafc]">
      <Suspense fallback={<aside className="hidden w-[280px] shrink-0 md:block" />}>
        <aside className="hidden w-[280px] shrink-0 md:block pt-6 pl-4">
          <ProductSidebar />
        </aside>
      </Suspense>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-6">
        <div className="mx-auto max-w-5xl">
          <ProductSidebarDrawer />
          {children}
        </div>
      </main>
    </div>
  );
}
