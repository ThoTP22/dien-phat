"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getKtvTokenCookie, clearKtvTokenCookie } from "@/lib/ktv-cookie";
import { Button } from "@/components/ui/button";

interface TokenPayload {
  fullName?: string;
  email?: string;
}

function parseJwtPayload(token: string): TokenPayload {
  try {
    const base64 = token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.codePointAt(0)!.toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json) as TokenPayload;
  } catch {
    return {};
  }
}

export default function TechnicianLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const pathname = usePathname();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const token = getKtvTokenCookie();
    if (!token && pathname !== "/technician/login") {
      router.replace("/technician/login");
      return;
    }
    if (token) {
      const payload = parseJwtPayload(token);
      setName(payload.fullName || payload.email || "KTV");
    }
  }, [pathname, router]);

  if (pathname === "/technician/login") return <>{children}</>;

  function handleLogout() {
    clearKtvTokenCookie();
    router.replace("/technician/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-gray-800">⚙ Điện Phát — KTV</span>
            <nav className="flex gap-4">
              <Link
                href="/technician/tickets"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Phiếu của tôi
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Xin chào, {name}</span>
            <Button size="sm" variant="outline" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
