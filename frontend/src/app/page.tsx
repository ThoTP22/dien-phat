/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchPublicCategories } from "@/services/category.service";
import { fetchPublicShowroom } from "@/services/showroom.service";
import { fetchPublicPosts } from "@/services/post.service";
import { fetchPublicProducts } from "@/services/product.service";
import { HeroVideo } from "@/components/hero/HeroVideo";
import { HoverImageCarousel } from "@/components/product/HoverImageCarousel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Điều hòa Midea tại Long Xuyên",
  description:
    "Showroom Gold Shop Midea Điện Phát - sản phẩm điều hòa chính hãng, tư vấn công suất và lắp đặt chuẩn kỹ thuật tại Long Xuyên, An Giang.",
  openGraph: {
    title: "Gold Shop Midea - Điện Phát",
    description: "Điều hòa Midea chính hãng tại Long Xuyên. Tư vấn và lắp đặt uy tín.",
  },
};

export default async function Home() {
  let categories: Awaited<ReturnType<typeof fetchPublicCategories>> | null = null;
  let showroom: Awaited<ReturnType<typeof fetchPublicShowroom>> | null = null;
  let posts: Awaited<ReturnType<typeof fetchPublicPosts>> | null = null;

  try {
    const [cats, showroomData, postData] = await Promise.all([
      fetchPublicCategories({ page: 1, limit: 6, rootOnly: true }),
      fetchPublicShowroom().catch(() => null),
      fetchPublicPosts({ page: 1, limit: 3 }).catch(() => null)
    ]);
    categories = cats;
    showroom = showroomData;
    posts = postData;
  } catch {
    // nếu lỗi categories, cứ để null, UI sẽ fallback
  }

  const rootCategories = categories?.items ?? [];
  const latestPosts = posts?.items ?? [];

  const categorySections: { cat: Awaited<ReturnType<typeof fetchPublicCategories>>["items"][0]; parent?: Awaited<ReturnType<typeof fetchPublicCategories>>["items"][0]; products: any[] }[] = [];

  for (const root of rootCategories) {
    try {
      const childrenRes = await fetchPublicCategories({ parentId: root.id, limit: 20 });
      const children = childrenRes.items;

      if (children.length > 0) {
        const childSections = await Promise.all(
          children.map(async (child) => {
            try {
              const products = await fetchPublicProducts({
                page: 1,
                limit: 6,
                categoryId: child.id,
                includeSubcategories: true,
              });
              return { cat: child, parent: root, products: products.items };
            } catch {
              return { cat: child, parent: root, products: [] as any[] };
            }
          })
        );
        categorySections.push(...childSections);
      } else {
        const products = await fetchPublicProducts({
          page: 1,
          limit: 6,
          categoryId: root.id,
          includeSubcategories: true,
        });
        categorySections.push({ cat: root, products: products.items });
      }
    } catch {
      try {
        const products = await fetchPublicProducts({
          page: 1,
          limit: 6,
          categoryId: root.id,
          includeSubcategories: true,
        });
        categorySections.push({ cat: root, products: products.items });
      } catch {
        categorySections.push({ cat: root, products: [] });
      }
    }
  }

  const mapEmbedSrc = (() => {
    const raw = (showroom?.mapUrl || "").trim();
    if (!raw) return null;
    if (raw.includes("/maps/embed") || raw.includes("output=embed")) return raw;
    const q = (showroom?.address?.fullText || raw).trim();
    if (!q) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  })();

  return (
    <div className="bg-zinc-50">
      <section className="relative w-full overflow-hidden bg-black">
        <div className="relative aspect-video w-full md:aspect-auto md:min-h-screen">
          <div className="absolute inset-0">
            {process.env.NEXT_PUBLIC_HERO_VIDEO_URL && (
              <HeroVideo
                className="h-full w-full object-cover"
                src={process.env.NEXT_PUBLIC_HERO_VIDEO_URL}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/15" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-7.5xl flex-col justify-end px-3 pb-6 pt-4 md:inset-0 md:flex md:items-end md:justify-end md:pb-14 md:pt-20 md:px-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-8 sm:py-10 md:px-4 md:py-12">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Danh mục sản phẩm
            </p>
            <h2 className="mt-1 text-lg font-semibold text-zinc-900 sm:text-xl">Các nhóm điều hòa Midea</h2>
            <p className="mt-1 text-xs text-zinc-600">
              Các nhóm sản phẩm điều hòa Midea đang có tại showroom Điện Phát.
            </p>
          </div>
          <Link href="/san-pham" className="shrink-0 text-xs font-semibold text-primary hover:underline">
            Xem tất cả
          </Link>
        </header>

        {categorySections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500">
            Danh mục sản phẩm sẽ hiển thị sau khi bạn tạo danh mục trong trang admin.
          </div>
        ) : (
          <div className="space-y-10">
            {categorySections.map(({ cat, parent, products }) => (
              <section key={cat.id} className="space-y-3">
                <header className="flex flex-col gap-2 border-b border-zinc-100 pb-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
                  <div className="min-w-0 pl-1">
                    <h3 className="text-base font-semibold text-zinc-900 sm:text-lg">
                      {parent ? (
                        <>
                          <Link href={`/san-pham/danh-muc/${parent.slug}`} className="text-zinc-500 hover:text-primary">
                            {parent.name}
                          </Link>
                          <span className="mx-1.5 text-zinc-300">/</span>
                          {cat.name}
                        </>
                      ) : (
                        cat.name
                      )}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-600">
                      {cat.summary || "Danh mục sản phẩm sẽ được cập nhật nội dung chi tiết."}
                    </p>
                  </div>
                  <Link
                    href={`/san-pham/danh-muc/${cat.slug}`}
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                  >
                    Xem thêm
                  </Link>
                </header>

                {products.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500">
                    Chưa có sản phẩm trong danh mục này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:gap-5">
                    {products.map((p: any) => (
                      <Card
                        key={p.id}
                        className="group flex flex-col overflow-hidden shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:hover:-translate-y-1"
                      >
                        <CardContent className="flex min-w-0 flex-1 flex-col p-0">
                          <div className="relative w-full overflow-hidden bg-white">
                            <HoverImageCarousel
                              images={p.images}
                              fallbackAlt={p.name}
                              wrapperClassName="aspect-[4/3] w-full bg-white overflow-hidden"
                              imgClassName="h-full w-full object-cover transition group-hover:scale-[1.03]"
                            />
                          </div>
                          <div className="flex flex-1 flex-col space-y-1.5 p-3 sm:space-y-2 sm:p-4">
                            <div className="line-clamp-2 text-xs font-semibold text-zinc-900 sm:text-sm">
                              {p.name}
                            </div>
                              {p.modelCode ? (
                                <div className="text-xs text-zinc-600">Model: {p.modelCode}</div>
                              ) : null}
                              {Array.isArray(p.images) && p.images.length > 1 ? (
                                <div className="flex gap-1 pt-1">
                                  {p.images.slice(0, 3).map((img: any, idx: number) => (
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
                            <Link
                              href={`/san-pham/${p.slug}`}
                              className="mt-auto inline-flex text-xs font-semibold text-primary hover:underline"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-3 py-8 sm:py-10 md:flex-row md:items-center md:px-4 md:py-12">
          <div className="flex-1 space-y-2">
            <h2 className="text-lg font-semibold text-zinc-900">
              {showroom?.name || "Showroom Gold Shop Điện Phát"}
            </h2>
            {showroom ? (
              <>
                <p className="text-sm text-zinc-600">
                  {showroom.address?.fullText ||
                    "Địa chỉ showroom sẽ được cập nhật từ thông tin admin."}
                </p>
                <p className="text-sm text-zinc-600">
                  {showroom.phone ? `Điện thoại: ${showroom.phone}` : "Điện thoại: (cập nhật sau)"}
                  {showroom.email ? ` · Email: ${showroom.email}` : ""}
                </p>
                {showroom.openingHours?.length ? (
                  <p className="text-xs text-zinc-600">
                    Giờ mở cửa:{" "}
                    {showroom.openingHours
                      .slice(0, 2)
                      .map((h) =>
                        h.closed
                          ? `${h.day}: nghỉ`
                          : `${h.day}: ${h.open} - ${h.close}`
                      )
                      .join(" · ")}
                  </p>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-zinc-600">
                Địa chỉ, bản đồ và hình ảnh showroom sẽ được đồng bộ từ admin showroom settings. Khách
                có thể xem nhanh thông tin mở cửa và gửi yêu cầu liên hệ.
              </p>
            )}
            <Link
              href="/showroom"
              className="inline-flex text-xs font-semibold text-primary hover:underline"
            >
              Xem chi tiết showroom
            </Link>
          </div>
          <div className="flex-1">
            {mapEmbedSrc ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <iframe
                  src={mapEmbedSrc}
                  title="Bản đồ showroom"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : showroom && showroom.gallery?.length ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={showroom.gallery[0].url}
                  alt={showroom.gallery[0].alt || showroom.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500 flex items-center justify-center text-center px-4">
                Khu vực này có thể hiển thị bản đồ Google Maps hoặc hình ảnh showroom sau khi bạn cập nhật trong trang admin.
              </div>
            )}

            {showroom?.mapUrl ? (
              <div className="mt-2 text-xs">
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
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-8 sm:py-10 md:px-4 md:py-12">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Tin tức & bài viết</h2>
            <p className="text-xs text-zinc-600">
              Các bài viết mới nhất từ showroom Điện Phát.
            </p>
          </div>
          <Link href="/tin-tuc" className="text-xs font-semibold text-primary hover:underline">
            Xem tất cả
          </Link>
        </header>
        {latestPosts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500">
            Chưa có bài viết nào. Hãy tạo bài viết trong trang admin để hiển thị tại đây.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Card key={post.id} className="shadow-sm">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-sm font-semibold text-zinc-900">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-700">
                  {post.summary ? (
                    <p className="line-clamp-3 text-xs text-zinc-600">{post.summary}</p>
                  ) : null}
                  <Link
                    href={`/tin-tuc/${post.slug}`}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Xem chi tiết
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
