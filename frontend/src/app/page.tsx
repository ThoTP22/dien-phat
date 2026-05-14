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
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SocialProof } from "@/components/hero/SocialProof";

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

  const sectionPromises = rootCategories.map(async (root) => {
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
        return childSections;
      }
      const products = await fetchPublicProducts({
        page: 1,
        limit: 6,
        categoryId: root.id,
        includeSubcategories: true,
      });
      return [{ cat: root, products: products.items }];
    } catch {
      try {
        const products = await fetchPublicProducts({
          page: 1,
          limit: 6,
          categoryId: root.id,
          includeSubcategories: true,
        });
        return [{ cat: root, products: products.items }];
      } catch {
        return [{ cat: root, products: [] }];
      }
    }
  });

  const sectionResults = await Promise.all(sectionPromises);
  sectionResults.forEach((sections) => categorySections.push(...sections));

  const mapEmbedSrc = (() => {
    const raw = (showroom?.mapUrl || "").trim();
    if (!raw) return null;
    if (raw.includes("/maps/embed") || raw.includes("output=embed")) return raw;
    const q = (showroom?.address?.fullText || raw).trim();
    if (!q) return null;
    return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
  })();

  return (
    <div>
      {/* Hero section */}
      <section className="relative flex w-full flex-col bg-gradient-to-br from-white via-blue-50 to-sky-100">
        {/* Decorative background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-1 grid-cols-1 flex-col items-center gap-10 px-4 py-14 md:grid md:grid-cols-2 md:gap-14 md:px-8 md:py-20">
          {/* LEFT: text content */}
          <div className="order-2 space-y-6 md:order-1">
            {/* Brand badge */}
            <span className="inline-block rounded-full border border-primary/30 bg-primary/8 px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
              Midea Gold Shop · Điện Phát
            </span>

            {/* H1 */}
            <h1 className="text-3xl font-extrabold leading-tight text-green-700 sm:text-4xl md:text-5xl">
              Đại lý Midea chính hãng tại Long Xuyên
            </h1>

            {/* Subheader */}
            <p className="text-base leading-relaxed text-zinc-500 md:text-lg">
              Tư vấn đúng công suất theo diện tích, lắp đặt chuẩn kỹ thuật. Đại lý Gold Shop Midea uy tín duy nhất tại An Giang.
            </p>

            {/* Key features */}
            <ul className="space-y-3">
              {[
                "Tư vấn công suất phù hợp theo diện tích từng phòng",
                "Lắp đặt chuẩn kỹ thuật bởi kĩ thuật viên được đào tạo bài bản",
                "Bảo hành chính hãng Midea toàn quốc",
                "Hỗ trợ sau mua, bảo trì và vệ sinh máy định kỳ",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-700">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/showroom"
                className="group relative overflow-hidden inline-flex items-center rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 hover:shadow-primary/40"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                Nhận tư vấn miễn phí
              </Link>
              <Link
                href="/san-pham"
                className="inline-flex items-center rounded-full border-2 border-zinc-200 bg-white px-7 py-3.5 text-sm font-bold text-zinc-700 transition hover:border-primary hover:text-primary hover:-translate-y-1"
              >
                Xem sản phẩm
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-200 pt-4">
              {[
                "Midea Gold Shop",
                "Chính hãng 100%",
                "Tư vấn miễn phí",
                "Bảo hành chính hãng",
                "Lắp đặt tại Long Xuyên",
              ].map((label) => (
                <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                  <svg className="h-3.5 w-3.5 shrink-0 text-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT: video */}
          <div className="order-1 md:order-2 relative w-full max-w-xl mx-auto md:max-w-none">
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-2xl shadow-primary/20 ring-1 ring-white/50">
              {process.env.NEXT_PUBLIC_HERO_VIDEO_URL ? (
                <HeroVideo
                  className="h-full w-full object-cover"
                  src={process.env.NEXT_PUBLIC_HERO_VIDEO_URL}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                  Video showroom
                </div>
              )}
            </div>
            
            {/* Floating Badge (Glassmorphism) */}
            <div className="absolute -bottom-6 -left-4 sm:-left-8 z-10 flex items-center gap-3 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/50 p-3 sm:p-4 shadow-2xl animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-500">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg sm:text-xl shadow-inner">
                ❄️
              </div>
              <div className="min-w-0 pr-2">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-primary tracking-widest opacity-90">Top 1 Bán chạy</p>
                <p className="text-xs sm:text-sm font-bold text-zinc-900 truncate">Midea Inverter 1HP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScrollReveal delay={0.1}>
        <section id="danh-muc-san-pham" className="mx-auto max-w-7xl px-3 py-8 sm:py-10 md:px-4 md:py-12 mt-4">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
              Danh mục sản phẩm
            </span>
          </div>
          <Link
            href="/san-pham"
            className="shrink-0 rounded-full border border-primary px-5 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            Xem tất cả →
          </Link>
        </header>

        {categorySections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500">
            Danh mục sản phẩm sẽ hiển thị sau khi bạn tạo danh mục trong trang admin.
          </div>
        ) : (
          <div className="space-y-10">
            {categorySections.map(({ cat, parent, products }) => (
              <section key={cat.id} className="space-y-4">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-8 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-zinc-900 sm:text-xl">
                        {parent ? (
                          <>
                            <Link href={`/san-pham/danh-muc/${parent.slug}`} className="font-normal text-zinc-400 hover:text-primary">
                              {parent.name}
                            </Link>
                            <span className="mx-1.5 text-zinc-300">/</span>
                            {cat.name}
                          </>
                        ) : (
                          cat.name
                        )}
                      </h3>
                      {cat.summary ? (
                        <p className="mt-0.5 text-xs text-zinc-500">{cat.summary}</p>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={`/san-pham/danh-muc/${cat.slug}`}
                    className="shrink-0 rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-bold text-zinc-600 transition hover:bg-primary hover:text-white"
                  >
                    Xem thêm →
                  </Link>
                </header>

                {products.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500">
                    Chưa có sản phẩm trong danh mục này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 md:grid-cols-4 lg:gap-6">
                    {products.map((p: any) => (
                      <Card
                        key={p.id}
                        className="group flex flex-col overflow-hidden rounded-2xl border-0 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                      >
                        <CardContent className="flex min-w-0 flex-1 flex-col p-0">
                          <div className="relative w-full overflow-hidden bg-zinc-50">
                            <HoverImageCarousel
                              images={p.images}
                              fallbackAlt={p.name}
                              wrapperClassName="aspect-[4/3] w-full bg-zinc-50 overflow-hidden"
                              imgClassName="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          </div>
                          <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
                            <div className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 sm:text-base group-hover:text-primary transition-colors">
                              {p.name}
                            </div>
                            {p.modelCode ? (
                              <span className="inline-flex w-fit rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                                {p.modelCode}
                              </span>
                            ) : null}
                            {Array.isArray(p.images) && p.images.length > 1 ? (
                              <div className="flex gap-1.5">
                                {p.images.slice(0, 4).map((img: any, idx: number) => (
                                  <div
                                    key={`${p.id}-${idx}`}
                                    className="h-8 w-8 overflow-hidden rounded-lg border-2 border-white shadow transition-all duration-200 group-hover:border-primary/40"
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
                              className="mt-auto inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white shadow-sm transition-all duration-300 hover:brightness-110 hover:shadow-md lg:translate-y-4 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
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
      </ScrollReveal>

      <SocialProof />

      <ScrollReveal yOffset={30}>
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
      </ScrollReveal>

      <ScrollReveal yOffset={40}>
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
              <Card key={post.id} className="overflow-hidden shadow-sm">
                {post.coverImageUrl ? (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-zinc-100" />
                )}
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
      </ScrollReveal>
    </div>
  );
}
