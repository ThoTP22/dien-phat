"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminToken } from "@/lib/use-admin-token";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAdminToken();

  const isLoginPage = useMemo(() => pathname === "/admin/login", [pathname]);

  useEffect(() => {
    if (isLoginPage) return;
    if (!token) {
      router.replace("/admin/login");
      return;
    }
  }, [isLoginPage, token, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!token) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Đang chuyển đến trang đăng nhập...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-4 py-4 md:px-6 md:py-6">
      <aside className="hidden w-56 flex-col gap-2 text-sm text-zinc-700 md:flex">
        <Tabs defaultValue="dashboard" orientation="vertical" className="flex-1">
          <TabsList variant="line" className="w-full flex-col items-stretch">
            <Link href="/admin">
              <TabsTrigger value="dashboard" className="w-full justify-start">
                Tổng quan
              </TabsTrigger>
            </Link>
            <Link href="/admin/categories">
              <TabsTrigger value="categories" className="w-full justify-start">
                Danh mục
              </TabsTrigger>
            </Link>
            <Link href="/admin/products">
              <TabsTrigger value="products" className="w-full justify-start">
                Sản phẩm
              </TabsTrigger>
            </Link>
            <Link href="/admin/showroom">
              <TabsTrigger value="showroom" className="w-full justify-start">
                Showroom
              </TabsTrigger>
            </Link>
            <Link href="/admin/leads">
              <TabsTrigger value="leads" className="w-full justify-start">
                Leads
              </TabsTrigger>
            </Link>
            <Link href="/admin/posts">
              <TabsTrigger value="posts" className="w-full justify-start">
                Bài viết
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </aside>

      <section className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        {children}
      </section>
    </div>
  );
}
