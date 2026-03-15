import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverImageCarousel } from "@/components/product/HoverImageCarousel";
import { fetchPublicProducts } from "@/services/product.service";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";

function getSpecValue(
  specs: { key?: string; name: string; value: string; unit?: string }[] | undefined,
  key: string
) {
  const found = specs?.find((s) => s.key === key);
  if (!found) return null;
  return `${found.value}${found.unit ? ` ${found.unit}` : ""}`.trim();
}

export const metadata: Metadata = {
  title: "Sản phẩm điều hòa Midea",
  description:
    "Danh sách sản phẩm điều hòa Midea đang được showroom Điện Phát giới thiệu - inverter, công suất đa dạng.",
};

export default async function SanPhamPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; page?: string; segment?: string; capacityBtu?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = (sp.q ?? "").trim();
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const segment = (sp.segment ?? "").trim();
  const capacityBtu = (sp.capacityBtu ?? "").trim();

  const data = await fetchPublicProducts({
    page,
    limit: 24,
    search: q || undefined,
    segment: segment || undefined,
    capacityBtu: capacityBtu || undefined
  });

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / data.limit));

  return (
    <div className="bg-zinc-50">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", url: absoluteUrl("") },
          { name: "Sản phẩm", url: absoluteUrl("/san-pham") },
        ]}
      />
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
          <nav className="mb-3 flex items-center gap-2 text-sm text-zinc-600">
            <Link href="/" className="hover:text-primary">Trang chủ</Link>
            <span>/</span>
            <span className="text-zinc-800">Sản phẩm</span>
          </nav>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Danh sách sản phẩm
            </p>
            <h1 className="text-2xl font-semibold text-zinc-900">Sản phẩm điều hòa Midea</h1>
            <p className="text-sm text-zinc-600">
              Danh sách sản phẩm điều hòa Midea đang được showroom Điện Phát giới thiệu.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-4 flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <span>{data.total}</span>
            <span>{` sản phẩm`}</span>
            {q ? <span>{` (từ khóa: "${q}")`}</span> : null}
            {segment ? <span>{` · dòng: ${segment}`}</span> : null}
            {capacityBtu ? <span>{` · ${capacityBtu} BTU`}</span> : null}
          </div>
          <div className="text-xs">
            Mẹo: dùng bộ lọc bên trái để so sánh các dòng và công suất BTU khách quan hơn.
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => {
            const specBtu = getSpecValue(p.specifications, "capacity_btu");
            const specHp = getSpecValue(p.specifications, "capacity_hp");
            const specTech = getSpecValue(p.specifications, "technology");
            const specGas = getSpecValue(p.specifications, "refrigerant");
            return (
              <Card
                key={p.id}
                className="group border-t-2 border-t-primary/70 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-2 text-sm font-semibold text-zinc-900">
                    {p.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <HoverImageCarousel
                    images={p.images}
                    fallbackAlt={p.name}
                    wrapperClassName="aspect-[4/3] w-full rounded-md border border-zinc-200 bg-white overflow-hidden"
                    imgClassName="h-full w-full object-cover transition group-hover:scale-[1.03]"
                  />

                  {p.shortDescription ? (
                    <p className="line-clamp-3 text-xs text-zinc-700">{p.shortDescription}</p>
                  ) : (
                    <p className="text-xs text-zinc-600">
                      Nhấn xem chi tiết để xem mô tả sản phẩm.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 text-[11px] text-zinc-700">
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
                  </div>

                  {Array.isArray(p.images) && p.images.length > 1 ? (
                    <div className="flex gap-1 pt-1">
                      {p.images.slice(0, 4).map((img, idx) => (
                        <div
                          key={`${p.id}-${idx}`}
                          className="h-8 w-8 overflow-hidden rounded border border-zinc-200 bg-white opacity-0 transition group-hover:opacity-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.alt || p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <Button asChild variant="outline" className="mt-1 w-full">
                    <Link href={`/san-pham/${p.slug}`}>Xem chi tiết</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button asChild variant="outline" disabled={page <= 1}>
            <Link
              href={`/san-pham?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(segment ? { segment } : {}),
                ...(capacityBtu ? { capacityBtu } : {}),
                page: String(page - 1)
              }).toString()}`}
            >
              Trang trước
            </Link>
          </Button>
          <div className="text-sm text-muted-foreground">
            Trang {page}/{totalPages}
          </div>
          <Button asChild variant="outline" disabled={page >= totalPages}>
            <Link
              href={`/san-pham?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(segment ? { segment } : {}),
                ...(capacityBtu ? { capacityBtu } : {}),
                page: String(page + 1)
              }).toString()}`}
            >
              Trang sau
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

