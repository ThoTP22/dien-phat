import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${beVietnamPro.variable} antialiased text-foreground font-sans`}
      >
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <div className="min-h-screen flex flex-col">
          <PublicHeader />

          <main className="flex-1 pb-20 md:pb-0">{children}</main>

          <PublicFooter />
        </div>
        <MobileBottomNav />
        <ChatWidget />
      </body>
    </html>
  );
}
