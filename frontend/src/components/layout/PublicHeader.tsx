"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [phone, setPhone] = useState<string>("");

  const pathname = usePathname();
  const isHome = pathname === "/";
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    fetch("/api/v1/showroom")
      .then((r) => r.json())
      .then((json) => {
        const p = (json?.data?.phone || "").toString().trim();
        if (p) setPhone(p);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => {
      // home: transparent only at top; other pages: always solid
      const next = isHome ? window.scrollY < 24 : false;
      setAtTop(next);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const headerClassName = useMemo(() => {
    if (isHome && atTop) {
      return "fixed top-0 z-40 w-full border-b border-transparent bg-transparent";
    }
    return "sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur";
  }, [isHome, atTop]);

  const fallbackHotline = (process.env.NEXT_PUBLIC_HOTLINE || "").trim();
  const tel = phone || fallbackHotline || "0900000000";
  const telHref = `tel:${tel.replace(/\s+/g, "")}`;

  return (
    <header className={headerClassName}>
      <div className="mx-auto flex max-w-8xl items-center justify-between px-3 py-3 md:px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Điện Phát - Gold Shop Midea"
            width={120}
            height={48}
            priority
            className="h-10 w-auto"
          />
          <div className="hidden flex-col sm:flex">
            <span className={isHome && atTop ? "text-sm font-semibold text-white" : "text-sm font-semibold text-primary"}>
              Gold Shop Midea
            </span>
            <span className={isHome && atTop ? "text-sm text-white/80" : "text-sm text-zinc-600"}>
              Điện Phát - Gold Shop Midea
            </span>
          </div>
        </Link>

        <nav className={["hidden gap-6 text-sm font-medium md:flex", isHome && atTop ? "text-white/90" : "text-zinc-700"].join(" ")}>
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <Link href="/gioi-thieu" className="hover:text-primary">
            Giới thiệu
          </Link>
          <Link href="/san-pham" className="hover:text-primary">
            Sản phẩm
          </Link>
          <Link href="/showroom" className="hover:text-primary">
            Showroom & Liên hệ
          </Link>
          <Link href="/tin-tuc" className="hover:text-primary">
            Tin tức
          </Link>
        </nav>

        <Button asChild size="sm" variant={isHome && atTop ? "secondary" : "default"} className={isHome && atTop ? "bg-white/15 text-white hover:bg-white/25" : ""}>
          <Link href={telHref}>Gọi tư vấn</Link>
        </Button>
      </div>
    </header>
  );
}

