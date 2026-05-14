import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site-url";

const LANDING_PAGES = [
  {
    slug: "gold-shop-midea-an-giang",
    title: "Gold Shop Midea An Giang - Đại lý ủy quyền chính hãng",
    description: "Gold Shop Midea An Giang chuyên cung cấp, lắp đặt và bảo hành các dòng máy lạnh Midea chính hãng với giá tốt nhất khu vực.",
    heading: "Gold Shop Midea An Giang",
    subheading: "Đại lý ủy quyền chính thức các sản phẩm Midea tại An Giang",
    content: "Chào mừng quý khách đến với Gold Shop Midea An Giang. Chúng tôi tự hào là đối tác chiến lược, chuyên cung cấp các giải pháp làm mát, máy lạnh dân dụng và công nghiệp thương hiệu Midea. Với đội ngũ kỹ thuật viên giàu kinh nghiệm, chúng tôi cam kết mang đến dịch vụ lắp đặt và bảo hành tận tâm nhất.",
  },
  {
    slug: "may-lanh-midea-long-xuyen",
    title: "Máy lạnh Midea Long Xuyên - Lắp đặt nhanh, Giá siêu rẻ",
    description: "Mua máy lạnh Midea tại Long Xuyên ở đâu? Đến ngay Điện Phát - Nhà phân phối máy lạnh Midea uy tín, bảo hành dài hạn tại Long Xuyên.",
    heading: "Máy lạnh Midea Long Xuyên",
    subheading: "Giải pháp làm mát tối ưu cho gia đình và doanh nghiệp tại Long Xuyên",
    content: "Bạn đang tìm kiếm địa chỉ mua máy lạnh Midea uy tín tại Long Xuyên? Điện Phát mang đến hàng loạt các dòng sản phẩm máy lạnh Midea Inverter tiết kiệm điện, máy lạnh tủ đứng, âm trần với giá cực kỳ cạnh tranh. Miễn phí khảo sát và hỗ trợ lắp đặt nhanh chóng trong ngày.",
  },
  {
    slug: "lap-dat-may-lanh-midea-an-giang",
    title: "Dịch vụ lắp đặt máy lạnh Midea tại An Giang chuyên nghiệp",
    description: "Dịch vụ thi công, lắp đặt máy lạnh Midea trọn gói tại An Giang. Kỹ thuật chuyên nghiệp, vật tư tiêu chuẩn, bảo hành dịch vụ dài hạn.",
    heading: "Lắp Đặt Máy Lạnh Midea Tại An Giang",
    subheading: "Thi công nhanh chóng - Vật tư chuẩn - Bảo hành uy tín",
    content: "Hệ thống làm mát đóng vai trò quan trọng trong không gian sống và làm việc. Dịch vụ lắp đặt máy lạnh Midea tại An Giang của chúng tôi sử dụng vật tư ống đồng tiêu chuẩn, đảm bảo tính thẩm mỹ cao và hiệu suất hoạt động tối đa cho máy. Cam kết bảo hành kỹ thuật lắp đặt lên đến 12 tháng.",
  }
];

// Generate static routes during build time
export function generateStaticParams() {
  return LANDING_PAGES.map((page) => ({
    slug: page.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = LANDING_PAGES.find((p) => p.slug === params.slug);
  if (!page) return {};

  const canonicalUrl = absoluteUrl(`/khu-vuc/${params.slug}`);

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl,
      type: "website",
    },
  };
}

export default function KhuVucLandingPage({ params }: { params: { slug: string } }) {
  const page = LANDING_PAGES.find((p) => p.slug === params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-900 py-20 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-zinc-900/80"></div>
        <div className="relative mx-auto max-w-6xl px-4 md:px-6">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {page.heading}
            </h1>
            <p className="text-lg text-zinc-300">
              {page.subheading}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" asChild>
                <Link href="/san-pham">Xem sản phẩm Midea</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-zinc-900 bg-white hover:bg-zinc-100 border-none" asChild>
                <Link href="/showroom">Liên hệ tư vấn</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 md:px-6">
        <div className="prose prose-zinc max-w-none md:prose-lg">
          <h2>Về dịch vụ của chúng tôi</h2>
          <p>{page.content}</p>
          
          <h3>Tại sao chọn Gold Shop Midea Điện Phát?</h3>
          <ul>
            <li><strong>Sản phẩm chính hãng:</strong> Cam kết 100% sản phẩm Midea đều có xuất xứ rõ ràng.</li>
            <li><strong>Giá cạnh tranh:</strong> Chúng tôi là đại lý trực tiếp nên luôn có mức giá tốt nhất cho khách hàng.</li>
            <li><strong>Bảo hành tận tâm:</strong> Hỗ trợ kích hoạt bảo hành điện tử và xử lý sự cố nhanh chóng.</li>
            <li><strong>Lắp đặt chuyên nghiệp:</strong> Đội ngũ thợ tay nghề cao, thi công an toàn và thẩm mỹ.</li>
          </ul>

          <div className="mt-12 rounded-xl bg-blue-50 p-6 sm:p-8 border border-blue-100 not-prose">
            <h3 className="text-xl font-bold text-blue-900 mb-2">Bạn cần hỗ trợ ngay?</h3>
            <p className="mb-6 text-blue-800">
              Hãy gọi trực tiếp cho chúng tôi qua đường dây nóng hoặc để lại lời nhắn để được hỗ trợ báo giá và khảo sát miễn phí tận nơi.
            </p>
            <Button asChild>
              <Link href="/showroom">Đi tới trang Liên hệ</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
