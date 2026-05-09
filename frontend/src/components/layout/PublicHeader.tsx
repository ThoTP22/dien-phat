"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    fetch("/api/v1/showroom")
      .then((r) => r.json())
      .then((json) => {
        const p = (json?.data?.phone || "").toString().trim();
        if (p) setPhone(p);
      })
      .catch(() => {});
  }, []);

  const headerClassName = "sticky top-0 z-40 w-full border-b border-primary/30 bg-primary shadow-md";

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
            <span className="text-sm font-semibold text-primary-foreground">
              Gold Shop Midea
            </span>
            <span className="text-sm text-primary-foreground/75">
              Điện Phát
            </span>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-primary-foreground/90 md:flex">
          <Link href="/" className="hover:text-primary-foreground transition-colors">
            Trang chủ
          </Link>
          <Link href="/gioi-thieu" className="hover:text-primary-foreground transition-colors">
            Giới thiệu
          </Link>
          <Link href="/san-pham" className="hover:text-primary-foreground transition-colors">
            Sản phẩm
          </Link>
          <Link href="/showroom" className="hover:text-primary-foreground transition-colors">
            Showroom & Liên hệ
          </Link>
          <Link href="/tin-tuc" className="hover:text-primary-foreground transition-colors">
            Tin tức
          </Link>
        </nav>

        <Button asChild size="sm" variant="secondary" className="bg-white/20 text-primary-foreground hover:bg-white/35 border-0">
          <Link href={telHref}>Gọi tư vấn</Link>
        </Button>
      </div>
    </header>
  );
}

