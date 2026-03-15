import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublicPosts } from "@/services/post.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Tin tức",
  description:
    "Bài viết tư vấn và thông tin liên quan đến điều hòa Midea, kinh nghiệm sử dụng và bảo trì.",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  let data: Awaited<ReturnType<typeof fetchPublicPosts>>;
  try {
    data = await fetchPublicPosts({ page: 1, limit: 20 });
  } catch {
    data = { items: [], total: 0, page: 1, limit: 20 };
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", url: absoluteUrl("") },
          { name: "Tin tức", url: absoluteUrl("/tin-tuc") },
        ]}
      />
      <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <span className="text-zinc-800">Tin tức</span>
      </nav>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Tin tức</h1>
        <p className="text-sm text-zinc-600">
          Bài viết tư vấn và thông tin liên quan đến điều hòa Midea.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {data.items.map((p) => (
          <Card key={p.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">
                <Link href={`/tin-tuc/${p.slug}`} className="hover:text-primary">
                  {p.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-700">
              {p.summary || "—"}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

