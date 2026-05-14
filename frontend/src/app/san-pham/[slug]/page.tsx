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
      <div className="bg-[#f8fafc]">
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
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
          <nav className="mb-2 flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="text-zinc-300">/</span>
            <Link href="/san-pham" className="hover:text-primary transition-colors">Sản phẩm</Link>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900 line-clamp-1">{p.name}</span>
          </nav>
        </div>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-8 md:grid-cols-1 lg:grid-cols-12 md:px-6">
          {/* Cột trái: Hình ảnh */}
          <div className="lg:col-span-5">
             <Card className="shadow-sm border border-black/5 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-md">
                <CardContent className="p-2">
                  <ProductImageGallery images={p.images || []} productName={p.name} />
                </CardContent>
             </Card>
          </div>

          {/* Cột phải: Thông tin chính */}
          <div className="lg:col-span-7 flex flex-col justify-start">
             <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold text-zinc-900 leading-tight drop-shadow-sm">{p.name}</h1>
                {p.modelCode ? (
                  <p className="text-sm font-medium text-zinc-500">Model: <span className="text-zinc-800">{p.modelCode}</span></p>
                ) : null}

                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs font-bold pb-4 border-b border-zinc-200/50">
                  {specTech ? <span className="rounded-xl bg-teal-50 text-teal-700 border border-teal-100 px-3.5 py-1.5">{specTech}</span> : null}
                  {specBtu ? <span className="rounded-xl bg-blue-50 text-blue-700 border border-blue-100 px-3.5 py-1.5">{specBtu}</span> : null}
                  {specHp ? <span className="rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 px-3.5 py-1.5">{specHp}</span> : null}
                  {specGas ? <span className="rounded-xl bg-orange-50 text-orange-700 border border-orange-100 px-3.5 py-1.5">Gas {specGas}</span> : null}
                  {specOrigin ? <span className="rounded-xl bg-white border border-zinc-200 text-zinc-700 px-3.5 py-1.5 shadow-sm">Xuất xứ: {specOrigin}</span> : null}
                  {specWarrantyUnit || specWarrantyCompressor ? (
                    <span className="rounded-xl bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 shadow-sm">
                      Bảo hành: {specWarrantyUnit || "—"} / {specWarrantyCompressor || "—"}
                    </span>
                  ) : null}
                </div>

                {p.shortDescription ? (
                  <p className="text-base text-zinc-600 leading-relaxed py-2">{p.shortDescription}</p>
                ) : null}
                
                {/* Tư vấn & Báo giá Hero Card */}
                <Card className="mt-4 shadow-lg border border-primary/20 bg-gradient-to-br from-blue-50/50 to-white rounded-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <svg className="w-24 h-24 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20 10.999h2C22 5.869 18.127 2 12.99 2v2C17.052 4 20 6.943 20 10.999z"/><path d="M13 8c2.103 0 3 .897 3 3h2c0-3.225-1.775-5-5-5v2zm3.422 5.443a1.001 1.001 0 0 0-1.391.043l-2.393 2.461c-.576-.11-1.734-.471-2.926-1.66-1.192-1.193-1.553-2.354-1.66-2.926l2.459-2.394a1 1 0 0 0 .043-1.391L6.859 3.513a1 1 0 0 0-1.391-.087l-2.17 2a1 1 0 0 0-.272.982c.883 3.104 2.909 6.862 6.467 10.42 3.556 3.556 7.314 5.583 10.418 6.466a1 1 0 0 0 .982-.271l1.999-2.17a1 1 0 0 0-.085-1.392l-5.163-3.619z"/></svg>
                  </div>
                  <CardContent className="p-6 relative z-10 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-zinc-900">Nhận Tư vấn & Báo giá Tốt nhất</h3>
                      <p className="text-sm text-zinc-600 mt-1 max-w-[85%]">
                        Cần tư vấn công suất, vị trí lắp đặt hoặc báo giá chi tiết? Đội ngũ Điện Phát luôn sẵn sàng hỗ trợ.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button asChild size="lg" className="rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                        <a href={hotlineTel}>{`Gọi ngay: ${hotlineLabel}`}</a>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="rounded-xl shadow-sm bg-white/60 backdrop-blur-sm hover:bg-white transition-all hover:-translate-y-0.5 border-zinc-200">
                        <Link href="/showroom">Xem showroom</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
             </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-4 sm:py-8 md:grid-cols-3 md:px-6">
          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-sm border border-black/5 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md">
              <CardHeader className="bg-white/40 border-b border-black/5 px-6">
                <CardTitle className="text-lg font-bold text-zinc-900">Mô tả sản phẩm</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
              <Card className="shadow-sm border border-black/5 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md">
                <CardHeader className="bg-white/40 border-b border-black/5 px-6">
                  <CardTitle className="text-lg font-bold text-zinc-900">Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-sm p-6">
                  {Object.entries(grouped).map(([groupName, specs]) => (
                    <div key={groupName}>
                      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-zinc-500">
                        {groupName}
                      </div>
                      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                        <table className="w-full min-w-[240px] text-sm">
                          <tbody>
                            {specs.map((s, idx) => (
                              <tr key={`${s.key || s.name}-${idx}`} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                                <td className="px-4 py-3 text-zinc-600 sm:w-[42%]">
                                  {s.name}
                                </td>
                                <td className="px-4 py-3 font-semibold text-zinc-900">
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

          <div className="md:col-span-1 space-y-8">
            {p.features?.length ? (
              <Card className="shadow-sm border border-black/5 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md sticky top-24">
                <CardHeader className="bg-white/40 border-b border-black/5 px-6">
                  <CardTitle className="text-lg font-bold text-zinc-900">Tính năng nổi bật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6 text-sm text-zinc-700">
                  {p.features.slice(0, 8).map((f, idx) => (
                    <div key={`${f.title}-${idx}`} className="flex gap-3 group">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <div>
                        <div className="font-bold text-zinc-900">{f.title}</div>
                        {f.description ? <div className="text-zinc-600 mt-1 leading-relaxed">{f.description}</div> : null}
                      </div>
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

