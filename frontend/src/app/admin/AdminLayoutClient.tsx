"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminToken } from "@/lib/use-admin-token";
import { Button } from "@/components/ui/button";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAdminToken();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const navItems = [
    { href: "/admin", label: "Tổng quan", key: "dashboard" },
    { href: "/admin/categories", label: "Danh mục", key: "categories" },
    { href: "/admin/products", label: "Sản phẩm", key: "products" },
    { href: "/admin/showroom", label: "Showroom", key: "showroom" },
    { href: "/admin/leads", label: "Leads", key: "leads" },
    { href: "/admin/posts", label: "Bài viết", key: "posts" },
  ] as const;

  const activeKey =
    navItems.find((i) => (i.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(i.href)))?.key ??
    "dashboard";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="w-full flex-1 bg-zinc-50">
      <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
            Menu
          </Button>
          <div className="text-sm font-semibold text-zinc-900">Admin</div>
          <div className="w-[64px]" />
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu admin">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Đóng"
          />
          <div className="absolute left-0 top-0 h-full w-[82vw] max-w-[320px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div className="text-sm font-semibold text-zinc-900">Menu</div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                Đóng
              </Button>
            </div>
            <div className="p-2">
              {navItems.map((i) => {
                const isActive = i.key === activeKey;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    className={[
                      "block rounded-md px-3 py-2 text-sm",
                      isActive ? "bg-zinc-100 font-semibold text-zinc-900" : "text-zinc-700 hover:bg-zinc-50",
                    ].join(" ")}
                  >
                    {i.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-4 px-4 py-4 md:px-6 md:py-6">
        <aside className="hidden w-56 flex-col gap-2 text-sm text-zinc-700 md:flex">
          <Tabs value={activeKey} orientation="vertical" className="flex-1">
            <TabsList variant="line" className="w-full flex-col items-stretch">
              {navItems.map((i) => (
                <Link key={i.href} href={i.href}>
                  <TabsTrigger value={i.key} className="w-full justify-start">
                    {i.label}
                  </TabsTrigger>
                </Link>
              ))}
            </TabsList>
          </Tabs>
        </aside>

        <section className="flex-1 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          {children}
        </section>
      </div>
    </div>
  );
}
