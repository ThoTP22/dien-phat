"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Home, PackageSearch, PhoneCall, Newspaper, Store } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const tel = (process.env.NEXT_PUBLIC_HOTLINE || "").trim();
  const telHref = useMemo(() => `tel:${tel.replace(/\s+/g, "") || "0900000000"}`, [tel]);

  const items = useMemo(
    () => [
      {
        key: "home",
        label: "Trang chủ",
        href: "/",
        icon: Home,
        isActive: pathname === "/"
      },
      {
        key: "products",
        label: "Sản phẩm",
        href: "/san-pham",
        icon: PackageSearch,
        isActive: pathname.startsWith("/san-pham")
      },
      {
        key: "showroom",
        label: "Showroom",
        href: "/showroom",
        icon: Store,
        isActive: pathname.startsWith("/showroom")
      },
      {
        key: "news",
        label: "Tin tức",
        href: "/tin-tuc",
        icon: Newspaper,
        isActive: pathname.startsWith("/tin-tuc")
      },
      {
        key: "call",
        label: "Gọi tư vấn",
        href: telHref,
        icon: PhoneCall,
        isActive: false
      }
    ],
    [pathname, telHref]
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <Link
              key={it.key}
              href={it.href}
              className={[
                "flex flex-col items-center justify-center gap-1 text-[11px] transition",
                it.isActive ? "text-primary" : "text-zinc-600 hover:text-zinc-900"
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

