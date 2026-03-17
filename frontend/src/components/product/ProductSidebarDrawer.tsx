"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProductSidebar } from "@/components/product/ProductSidebar";

export function ProductSidebarDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const title = useMemo(() => {
    if (pathname?.startsWith("/san-pham/danh-muc/")) return "Danh mục & bộ lọc";
    return "Bộ lọc sản phẩm";
  }, [pathname]);

  useEffect(() => {
    // đóng drawer khi đổi route
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Mở bộ lọc
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={title}>
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          />
          <div className="absolute left-0 top-0 h-full w-[86vw] max-w-[360px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div className="text-sm font-semibold text-zinc-900">{title}</div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Đóng
              </Button>
            </div>
            <div className="h-[calc(100vh-52px)] overflow-y-auto">
              <ProductSidebar />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

