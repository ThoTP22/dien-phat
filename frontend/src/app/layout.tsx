import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { ChatWidget } from "@/components/chat/ChatWidget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

const getMetadataBase = (): URL => {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://dienphat-midea.vn";
  const url = raw.startsWith("http") ? raw : `https://${raw}`;
  try {
    return new URL(url);
  } catch {
    return new URL("https://dienphat-midea.vn");
  }
};

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: "Gold Shop Midea - Điện Phát",
    template: "%s | Gold Shop Midea Điện Phát",
  },
  description:
    "Showroom Gold Shop Midea Điện Phát - giới thiệu sản phẩm điều hòa Midea, thông tin showroom và tư vấn lắp đặt tại Long Xuyên.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} antialiased bg-background text-foreground font-sans`}
      >
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <div className="min-h-screen flex flex-col">
          <PublicHeader />

          <main className="flex-1">{children}</main>

          <PublicFooter />
        </div>
        <ChatWidget />
      </body>
    </html>
  );
}
