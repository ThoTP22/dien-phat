import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicProductDetail } from "@/services/product.service";
import { fetchPublicShowroom } from "@/services/showroom.service";
import { sanitizeRichTextHtml } from "@/lib/sanitize-html";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";

function getSpecValue(
  specs: { key?: string; name: string; value: string; unit?: string }[] | undefined,
  key: string
) {
  const found = specs?.find((s) => s.key === key);
  if (!found) return null;
  return `${found.value}${found.unit ? ` ${found.unit}` : ""}`.trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await fetchPublicProductDetail(slug);
    const desc = p.shortDescription || p.name;
    const img = p.images?.find((x) => x.isPrimary)?.url || p.images?.[0]?.url;
    return {
      title: p.name,
      description: desc.slice(0, 160),
      openGraph: {
        title: p.name,
        description: desc.slice(0, 160),
        images: img ? [img] : undefined,
        url: absoluteUrl(`/san-pham/${p.slug}`),
      },
    };
  } catch {
    return { title: "Sản phẩm | Gold Shop Midea Điện Phát" };
  }
}

export default async function SanPhamChiTietPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    let showroomPhone = "";
    try {
      const showroom = await fetchPublicShowroom();
      showroomPhone = (showroom?.phone || "").trim();
    } catch {
      showroomPhone = "";
    }
    const fallbackHotline = (process.env.NEXT_PUBLIC_HOTLINE || "").trim();
    const tel = showroomPhone || fallbackHotline || "0900000000";
    const hotlineTel = `tel:${tel.replace(/\s+/g, "")}`;
    const hotlineLabel = tel;

    const p = await fetchPublicProductDetail(slug);
    const safeDescription = sanitizeRichTextHtml(p.description || "");

    const specBtu = getSpecValue(p.specifications, "capacity_btu");
    const specHp = getSpecValue(p.specifications, "capacity_hp");
    const specTech = getSpecValue(p.specifications, "technology");
    const specGas = getSpecValue(p.specifications, "refrigerant");
    const specOrigin = getSpecValue(p.specifications, "origin");
    const specWarrantyUnit = getSpecValue(p.specifications, "warranty_unit");
    const specWarrantyCompressor = getSpecValue(p.specifications, "warranty_compressor");

    const specsSorted = [...(p.specifications || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const grouped = specsSorted.reduce<Record<string, typeof specsSorted>>((acc, s) => {
      const g = s.group?.trim() || "Khác";
      acc[g] = acc[g] || [];
      acc[g].push(s);
      return acc;
    }, {});

    const productUrl = absoluteUrl(`/san-pham/${p.slug}`);
    const primaryImage = p.images?.find((x) => x.isPrimary)?.url || p.images?.[0]?.url;

    return (
      <div className="bg-zinc-50">
        <ProductJsonLd
          name={p.name}
          description={p.shortDescription}
          image={primaryImage}
          url={productUrl}
        />
        <BreadcrumbJsonLd
          items={[
            { name: "Trang chủ", url: absoluteUrl("") },
            { name: "Sản phẩm", url: absoluteUrl("/san-pham") },
            { name: p.name, url: productUrl },
          ]}
        />
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
            <nav className="mb-3 flex items-center gap-2 text-sm text-zinc-600">
              <Link href="/" className="hover:text-primary">Trang chủ</Link>
              <span>/</span>
              <Link href="/san-pham" className="hover:text-primary">Sản phẩm</Link>
              <span>/</span>
              <span className="text-zinc-800">{p.name}</span>
            </nav>

            <h1 className="text-2xl font-semibold text-zinc-900">{p.name}</h1>
            {p.modelCode ? (
              <p className="mt-1 text-sm text-zinc-600">Model: {p.modelCode}</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-700">
              {specTech ? (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">{specTech}</span>
              ) : null}
              {specBtu ? (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">{specBtu}</span>
              ) : null}
              {specHp ? (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">{specHp}</span>
              ) : null}
              {specGas ? (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">Gas {specGas}</span>
              ) : null}
              {specOrigin ? (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">Xuất xứ: {specOrigin}</span>
              ) : null}
              {specWarrantyUnit || specWarrantyCompressor ? (
                <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                  Bảo hành: {specWarrantyUnit || "—"} / {specWarrantyCompressor || "—"}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:py-8 md:grid-cols-5 md:px-6">
          <div className="md:col-span-3">
            <Card className="shadow-sm">
              <CardContent className="space-y-4 p-4">
                <ProductImageGallery images={p.images || []} productName={p.name} />

                {p.shortDescription ? (
                  <p className="text-sm text-zinc-700">{p.shortDescription}</p>
                ) : null}

                {p.description ? (
                  <div className="prose prose-zinc max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: safeDescription }} />
                  </div>
                ) : (
                  <p className="text-sm text-zinc-600">Nội dung mô tả sẽ được cập nhật.</p>
                )}
              </CardContent>
            </Card>

            {specsSorted.length ? (
              <Card className="mt-4 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm">
                  {Object.entries(grouped).map(([groupName, specs]) => (
                    <div key={groupName}>
                      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                        {groupName}
                      </div>
                      <div className="overflow-x-auto rounded-md border border-zinc-200 bg-white">
                        <table className="w-full min-w-[240px] text-sm">
                          <tbody>
                            {specs.map((s, idx) => (
                              <tr key={`${s.key || s.name}-${idx}`} className="border-b last:border-0">
                                <td className="px-2 py-2 text-zinc-600 sm:w-[42%] sm:px-3">
                                  {s.name}
                                </td>
                                <td className="px-2 py-2 font-medium text-zinc-900 sm:px-3">
                                  {s.value}
                                  {s.unit ? ` ${s.unit}` : ""}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Tư vấn & báo giá</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-700">
                <p>
                  Cần tư vấn công suất, vị trí lắp đặt hoặc báo giá chi tiết? Hãy gọi hoặc để lại thông tin, đội ngũ Điện
                  Phát sẽ liên hệ sớm.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild>
                    <a href={hotlineTel}>{`Gọi ngay: ${hotlineLabel}`}</a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/showroom">Xem showroom & liên hệ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {p.features?.length ? (
              <Card className="mt-4 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">Tính năng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-zinc-700">
                  {p.features.slice(0, 8).map((f, idx) => (
                    <div key={`${f.title}-${idx}`}>
                      <div className="font-medium text-zinc-900">{f.title}</div>
                      {f.description ? <div className="text-zinc-600">{f.description}</div> : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}

