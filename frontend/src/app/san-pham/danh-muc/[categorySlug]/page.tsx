import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicCategoryDetail, fetchPublicCategories } from "@/services/category.service";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  try {
    const cat = await fetchPublicCategoryDetail(categorySlug);
    const desc = cat.summary || `Danh mục sản phẩm điều hòa ${cat.name} tại Gold Shop Midea Điện Phát.`;
    return {
      title: cat.name,
      description: desc.slice(0, 160),
      openGraph: {
        title: cat.name,
        description: desc.slice(0, 160),
        url: absoluteUrl(`/san-pham/danh-muc/${cat.slug}`),
      },
    };
  } catch {
    return { title: "Danh mục | Gold Shop Midea Điện Phát" };
  }
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams?: Promise<{ page?: string }>;
}) {
  const { categorySlug } = await params;
  const sp = (await searchParams) ?? {};
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;

  try {
    const category = await fetchPublicCategoryDetail(categorySlug);

    const [subcats, productData] = await Promise.all([
      fetchPublicCategories({ parentId: category.id, limit: 20 }).then((r) => r.items).catch(() => []),
      fetchPublicProducts({
        page,
        limit: 24,
        categoryId: category.id,
        includeSubcategories: true,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil((productData.total || 0) / productData.limit));

    const breadcrumbItems = [
      { name: "Trang chủ", url: absoluteUrl("") },
      { name: "Sản phẩm", url: absoluteUrl("/san-pham") },
    ];
    if (category.parent) {
      breadcrumbItems.push({
        name: category.parent.name,
        url: absoluteUrl(`/san-pham/danh-muc/${category.parent.slug}`),
      });
    }
    breadcrumbItems.push({
      name: category.name,
      url: absoluteUrl(`/san-pham/danh-muc/${category.slug}`),
    });

    return (
      <div className="bg-zinc-50">
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
            <nav className="mb-2 flex items-center gap-2 text-sm text-zinc-600">
              <Link href="/" className="hover:text-primary">Trang chủ</Link>
              <span>/</span>
              <Link href="/san-pham" className="hover:text-primary">Sản phẩm</Link>
              {category.parent ? (
                <>
                  <span>/</span>
                  <Link href={`/san-pham/danh-muc/${category.parent.slug}`} className="hover:text-primary">
                    {category.parent.name}
                  </Link>
                </>
              ) : null}
              <span>/</span>
              <span className="text-zinc-900">{category.name}</span>
            </nav>

            <h1 className="text-2xl font-semibold text-zinc-900">{category.name}</h1>
            {category.summary ? (
              <p className="mt-1 text-sm text-zinc-600">{category.summary}</p>
            ) : (
              <p className="mt-1 text-sm text-zinc-600">
                Danh mục sản phẩm điều hòa {category.name} đang được showroom Điện Phát giới thiệu.
              </p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          {subcats.length > 0 ? (
            <div className="mb-6">
              <h2 className="mb-3 text-sm font-semibold text-zinc-700">Danh mục con</h2>
              <div className="flex flex-wrap gap-2">
                {subcats.map((sc) => (
                  <Button key={sc.id} asChild variant="outline" size="sm">
                    <Link href={`/san-pham/danh-muc/${sc.slug}`}>{sc.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-4 text-sm text-muted-foreground">
            {productData.total} sản phẩm trong danh mục này.
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productData.items.map((p) => {
              const primaryImage = p.images?.find((x) => x.isPrimary)?.url || p.images?.[0]?.url;
              const specBtu = getSpecValue(p.specifications, "capacity_btu");
              const specHp = getSpecValue(p.specifications, "capacity_hp");
              const specTech = getSpecValue(p.specifications, "technology");
              const specGas = getSpecValue(p.specifications, "refrigerant");
              return (
                <Card key={p.id} className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base text-zinc-900">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {primaryImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={primaryImage}
                        alt={p.images?.find((x) => x.isPrimary)?.alt || p.name}
                        className="aspect-[4/3] w-full rounded-md border border-zinc-200 bg-white object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="aspect-[4/3] w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50" />
                    )}

                    {p.shortDescription ? (
                      <p className="line-clamp-3 text-sm text-zinc-700">{p.shortDescription}</p>
                    ) : (
                      <p className="text-sm text-zinc-600">Nhấn xem chi tiết để xem mô tả sản phẩm.</p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-zinc-700">
                      {specTech ? (
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                          {specTech}
                        </span>
                      ) : null}
                      {specBtu ? (
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                          {specBtu}
                        </span>
                      ) : null}
                      {specHp ? (
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                          {specHp}
                        </span>
                      ) : null}
                      {specGas ? (
                        <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5">
                          Gas {specGas}
                        </span>
                      ) : null}
                    </div>

                    <Button asChild variant="outline" className="w-full">
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
                href={`/san-pham/danh-muc/${category.slug}?${new URLSearchParams({
                  page: String(page - 1),
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
                href={`/san-pham/danh-muc/${category.slug}?${new URLSearchParams({
                  page: String(page + 1),
                }).toString()}`}
              >
                Trang sau
              </Link>
            </Button>
          </div>
        </section>
      </div>
    );
  } catch {
    notFound();
  }
}

