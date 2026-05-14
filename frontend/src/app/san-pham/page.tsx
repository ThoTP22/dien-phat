import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverImageCarousel } from "@/components/product/HoverImageCarousel";
import { fetchPublicProducts } from "@/services/product.service";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function getSpecValue(
  specs: { key?: string; name: string; value: string; unit?: string }[] | undefined,
  key: string
) {
  const found = specs?.find((s) => s.key === key);
  if (!found) return null;
  return `${found.value}${found.unit ? ` ${found.unit}` : ""}`.trim();
}

export const dynamic = "force-dynamic";

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
      <section className="border-b border-white/60 bg-gradient-to-br from-white via-blue-50/50 to-sky-100/30 backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-zinc-100/[0.2] bg-[size:20px_20px]" />
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 relative z-10">
          <nav className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-500">
            <Link href="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-900">Sản phẩm</span>
          </nav>
          <div className="space-y-2 max-w-2xl">
            <p className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm">
              Danh sách sản phẩm
            </p>
            <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight sm:text-4xl drop-shadow-sm">Sản phẩm điều hòa Midea</h1>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Khám phá danh sách điều hòa Midea chính hãng với mức giá tốt nhất, công suất đa dạng phù hợp cho mọi không gian sống.
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

        <ScrollReveal>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((p) => {
            const specBtu = getSpecValue(p.specifications, "capacity_btu");
            const specHp = getSpecValue(p.specifications, "capacity_hp");
            const specTech = getSpecValue(p.specifications, "technology");
            const specGas = getSpecValue(p.specifications, "refrigerant");
            return (
              <Card
                key={p.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] relative"
              >
                <CardHeader className="pb-3 px-5 pt-6">
                  <CardTitle className="line-clamp-2 text-base font-bold leading-snug text-zinc-900 group-hover:text-primary transition-colors">
                    {p.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex min-w-0 flex-1 flex-col px-5 pb-6 pt-0 space-y-4">
                  <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-50 border border-zinc-100">
                    <HoverImageCarousel
                      images={p.images}
                      fallbackAlt={p.name}
                      wrapperClassName="aspect-[4/3] w-full overflow-hidden"
                      imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    {specTech ? (
                      <span className="rounded-lg bg-teal-50 text-teal-700 border border-teal-100 px-2.5 py-1">{specTech}</span>
                    ) : null}
                    {specBtu ? (
                      <span className="rounded-lg bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1">{specBtu}</span>
                    ) : null}
                    {specHp ? (
                      <span className="rounded-lg bg-zinc-100 text-zinc-700 border border-zinc-200 px-2.5 py-1">{specHp}</span>
                    ) : null}
                    {specGas ? (
                      <span className="rounded-lg bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1">Gas {specGas}</span>
                    ) : null}
                  </div>

                  <p className="line-clamp-2 text-xs text-zinc-500 leading-relaxed min-h-[2rem]">
                     {p.shortDescription || "Nhấn xem chi tiết để xem thêm thông tin mô tả."}
                  </p>

                  <Link
                    href={`/san-pham/${p.slug}`}
                    className="mt-auto inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:brightness-110 hover:shadow-lg lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
                  >
                    Xem chi tiết
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
        </ScrollReveal>

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

