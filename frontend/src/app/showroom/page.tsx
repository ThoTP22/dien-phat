import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicShowroom } from "@/services/showroom.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Showroom & Liên hệ",
  description:
    "Thông tin showroom Gold Shop Midea Điện Phát - địa chỉ, giờ mở cửa, bản đồ và kênh liên hệ tại Long Xuyên.",
};

export default async function ShowroomPage() {
  let showroom = null;
  try {
    showroom = await fetchPublicShowroom();
  } catch {
    showroom = null;
  }

  const mapEmbedSrc = (() => {
    const raw = (showroom?.mapUrl || "").trim();
    if (!raw) return null;
    // If user already pasted an embeddable maps url, keep it
    if (raw.includes("/maps/embed") || raw.includes("output=embed")) return raw;

    // Fallback: generate embed from query (works without API key)
    // Prefer full address, otherwise use the raw url as query
    const q = (showroom?.address?.fullText || raw).trim();
    if (!q) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  })();

  const addressText =
    showroom?.address?.fullText ||
    [
      showroom?.address?.street,
      showroom?.address?.ward,
      showroom?.address?.district,
      showroom?.address?.province
    ]
      .filter(Boolean)
      .join(", ");

  return (
    <div className="bg-zinc-50">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <h1 className="text-2xl font-semibold text-zinc-900">
            {showroom?.name || "Showroom Gold Shop Midea Điện Phát"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Thông tin showroom, địa chỉ, giờ mở cửa và kênh liên hệ nhanh với Điện Phát.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:py-8 md:grid-cols-5 md:px-6">
        <div className="space-y-4 md:col-span-3">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-700">
              <div>
                <div className="font-medium text-zinc-900">Địa chỉ</div>
                <p className="mt-1 text-zinc-700">
                  {addressText || "Địa chỉ showroom sẽ được cập nhật từ trang admin."}
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="font-medium text-zinc-900">Liên hệ</div>
                <p className="text-zinc-700">
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
                  <p className="text-zinc-700">
                    Email:{" "}
                    <a href={`mailto:${showroom.email}`} className="text-primary hover:underline">
                      {showroom.email}
                    </a>
                  </p>
                ) : null}
              </div>

              {showroom?.openingHours?.length ? (
                <div>
                  <div className="font-medium text-zinc-900">Giờ mở cửa</div>
                  <ul className="mt-1 space-y-1 text-xs text-zinc-700">
                    {showroom.openingHours.map((h) => (
                      <li key={`${h.day}-${h.open}-${h.close}`}>
                        <span className="font-medium">{h.day}:</span>{" "}
                        {h.closed ? "Nghỉ" : `${h.open} - ${h.close}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {showroom?.intro ? (
                <p className="text-sm text-zinc-700">{showroom.intro}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Gửi yêu cầu tư vấn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-zinc-700">
              <p className="text-xs text-zinc-600">
                Form tư vấn chi tiết sẽ được triển khai sau. Hiện tại bạn có thể gọi trực tiếp hoặc
                dùng kênh liên hệ nhanh trên website.
              </p>
              <Button asChild>
                <a href={showroom?.phone ? `tel:${showroom.phone}` : "tel:0900000000"}>
                  Gọi tư vấn
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Bản đồ & hình ảnh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mapEmbedSrc ? (
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-zinc-200">
                  <iframe
                    src={mapEmbedSrc}
                    title="Bản đồ showroom"
                    className="h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full rounded-lg border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-500 flex items-center justify-center text-center px-4">
                  Bản đồ Google Maps của showroom sẽ hiển thị tại đây sau khi bạn cập nhật đường dẫn
                  bản đồ trong trang admin showroom.
                </div>
              )}

              {showroom?.mapUrl ? (
                <div className="text-xs">
                  <a
                    href={showroom.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    Mở Google Maps
                  </a>
                </div>
              ) : null}

              {showroom?.gallery?.length ? (
                <div className="grid grid-cols-2 gap-2">
                  {showroom.gallery.slice(0, 4).map((img, idx) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${img.url}-${idx}`}
                      src={img.url}
                      alt={img.alt || showroom?.name || "Showroom"}
                      className="aspect-video w-full rounded-md border border-zinc-200 object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

