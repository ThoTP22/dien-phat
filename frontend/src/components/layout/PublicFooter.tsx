import Image from "next/image";
import Link from "next/link";

const footerContent = {
  companyName: "CÔNG TY TNHH TPT ĐIỆN PHÁT",
  tagline: "Gold Shop Midea tại An Giang",
  address: "Số 6 Nguyễn Văn Cưng, Phường Mỹ Long, TP Long Xuyên, Tỉnh An Giang",
  taxCode: "1602189097",
  legalNotice:
    "Hoạt động trưng bày, nhận diện thương hiệu và chính sách hỗ trợ được áp dụng theo HĐ Gold Shop Midea số VNS137/03/2025 - GOLD SHOP MIDEA và Phụ lục số PLVNS137/03/2025 - GOLD SHOP MIDEA, hiệu lực từ 07/03/2025 đến 07/03/2026.",
  copyright: "© 2025 CÔNG TY TNHH TPT ĐIỆN PHÁT. All rights reserved.",
};

export function PublicFooter() {
  return (
    <footer className="border-t border-[#0098d1] bg-[#00b0f0]">
      <div className="mx-auto max-w-7xl px-3 py-8 md:px-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Điện Phát - Gold Shop Midea"
                width={100}
                height={40}
                className="h-9 w-auto"
              />
            </Link>
            <div>
              <p className="text-sm font-semibold text-white">{footerContent.companyName}</p>
              <p className="text-xs text-white/90">{footerContent.tagline}</p>
            </div>
            <p className="text-xs text-white/80">{footerContent.address}</p>
            <p className="text-xs text-white/80">MST: {footerContent.taxCode}</p>
          </div>

          <nav className="flex flex-wrap gap-4 text-xs">
            <Link href="/" className="text-white/90 hover:text-white">
              Trang chủ
            </Link>
            <Link href="/gioi-thieu" className="text-white/90 hover:text-white">
              Giới thiệu
            </Link>
            <Link href="/san-pham" className="text-white/90 hover:text-white">
              Sản phẩm
            </Link>
            <Link href="/showroom" className="text-white/90 hover:text-white">
              Showroom & Liên hệ
            </Link>
            <Link href="/tin-tuc" className="text-white/90 hover:text-white">
              Tin tức
            </Link>
          </nav>
        </div>

        <div className="mt-6 border-t border-white/30 pt-6">
          <p className="text-[11px] leading-relaxed text-white/80">
            {footerContent.legalNotice}
          </p>
        </div>

        <div className="mt-4 text-center text-[11px] text-white/70">
          {footerContent.copyright}
        </div>
      </div>
    </footer>
  );
}
