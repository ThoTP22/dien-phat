import Link from "next/link";
import type { Metadata } from "next";
import { fetchPublicPostDetail } from "@/services/post.service";
import { sanitizeRichTextHtml } from "@/lib/sanitize-html";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/site-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await fetchPublicPostDetail(slug);
    const desc = post.summary || post.title;
    return {
      title: post.title,
      description: desc.slice(0, 160),
      openGraph: {
        title: post.title,
        description: desc.slice(0, 160),
        images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
        url: absoluteUrl(`/tin-tuc/${post.slug}`),
      },
    };
  } catch {
    return { title: "Tin tức | Gold Shop Midea Điện Phát" };
  }
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPublicPostDetail(slug);
  const safeContent = sanitizeRichTextHtml(post.content || "");
  const postUrl = absoluteUrl(`/tin-tuc/${post.slug}`);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <ArticleJsonLd
        title={post.title}
        description={post.summary}
        image={post.coverImageUrl}
        url={postUrl}
        datePublished={post.publishedAt || post.createdAt}
        dateModified={post.updatedAt}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Trang chủ", url: absoluteUrl("") },
          { name: "Tin tức", url: absoluteUrl("/tin-tuc") },
          { name: post.title, url: postUrl },
        ]}
      />
      <nav className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <span>/</span>
        <Link href="/tin-tuc" className="hover:text-primary">Tin tức</Link>
        <span>/</span>
        <span className="text-zinc-800">{post.title}</span>
      </nav>
      <header className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold text-zinc-900">{post.title}</h1>
        {post.summary && <p className="text-sm text-zinc-600">{post.summary}</p>}
      </header>

      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mb-6 h-auto w-full rounded-xl border object-cover"
        />
      )}

      <article
        className="prose prose-zinc max-w-none"
        dangerouslySetInnerHTML={{ __html: safeContent }}
      />
    </div>
  );
}

