import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchPublicShowroom } from "@/services/showroom.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Gold Shop Midea Điện Phát - điểm đến chuyên về giải pháp điều hòa Midea cho gia đình và showroom tại Long Xuyên, An Giang.",
};

export default async function GioiThieuPage() {
  let showroom = null;
  try {
    showroom = await fetchPublicShowroom();
  } catch {
    showroom = null;
  }

  return (
    <div className="bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Giới thiệu Gold Shop Midea Điện Phát</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Gold Shop Midea Điện Phát là điểm đến chuyên về giải pháp điều hòa Midea cho gia đình, cửa hàng
            và showroom tại địa phương, tập trung vào tư vấn đúng nhu cầu và dịch vụ lắp đặt – bảo hành uy tín.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:flex md:gap-6 md:px-6">
        <div className="flex-1 space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Về Điện Phát</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-700">
              <p>
                Điện Phát là đơn vị phân phối và lắp đặt điều hòa Midea tại địa phương, hướng tới việc mang lại
                trải nghiệm mát mẻ, tiết kiệm điện và bền bỉ cho khách hàng gia đình lẫn khách hàng kinh doanh.
              </p>
              <p>
                Thay vì chỉ bán sản phẩm, Điện Phát chú trọng tư vấn công suất phù hợp, khảo sát vị trí lắp đặt thực
                tế và hỗ trợ trọn gói từ tư vấn – thi công – bảo hành.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Giải pháp Midea tại showroom</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700">
              <ul className="list-disc space-y-1 pl-5">
                <li>Máy lạnh treo tường inverter và mono cho hộ gia đình, căn hộ, văn phòng nhỏ.</li>
                <li>Giải pháp điều hòa cho showroom, cửa hàng, quán cà phê với công suất lớn hơn.</li>
                <li>Tư vấn vị trí dàn nóng/dàn lạnh phù hợp với không gian thực tế.</li>
                <li>Hỗ trợ bảo hành chính hãng Midea kết hợp dịch vụ sau bán hàng từ Điện Phát.</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex-1 space-y-4 md:mt-0">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Showroom & liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700">
              <p>
                {showroom?.name || "Showroom Gold Shop Midea Điện Phát"}
              </p>
              <p>
                Địa chỉ:{" "}
                {showroom?.address?.fullText ||
                  "Địa chỉ showroom sẽ được cập nhật từ thông tin admin."}
              </p>
              <p>
                Điện thoại:{" "}
                {showroom?.phone ? (
                  <a href={`tel:${showroom.phone}`} className="text-primary hover:underline">
                    {showroom.phone}
                  </a>
                ) : (
                  " (cập nhật sau)"
                )}
              </p>
              {showroom?.email ? (
                <p>
                  Email:{" "}
                  <a href={`mailto:${showroom.email}`} className="text-primary hover:underline">
                    {showroom.email}
                  </a>
                </p>
              ) : null}

              <div className="pt-2">
                <Button asChild size="sm">
                  <Link href="/showroom">Xem chi tiết showroom</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

