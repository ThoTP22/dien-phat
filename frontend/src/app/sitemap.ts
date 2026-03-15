import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";
import { fetchPublicCategories } from "@/services/category.service";
import { fetchPublicProducts } from "@/services/product.service";
import { fetchPublicPosts } from "@/services/post.service";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = absoluteUrl("");

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/gioi-thieu"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/san-pham"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/showroom"), lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tin-tuc"), lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const catRes = await fetchPublicCategories({ limit: 500 });
    categoryPages = catRes.items.map((c) => ({
      url: absoluteUrl(`/san-pham/danh-muc/${c.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // ignore
  }

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const prodRes = await fetchPublicProducts({ limit: 500 });
    productPages = prodRes.items.map((p) => ({
      url: absoluteUrl(`/san-pham/${p.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // ignore
  }

  let postPages: MetadataRoute.Sitemap = [];
  try {
    const postRes = await fetchPublicPosts({ limit: 500 });
    postPages = postRes.items.map((post) => ({
      url: absoluteUrl(`/tin-tuc/${post.slug}`),
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // ignore
  }

  return [...staticPages, ...categoryPages, ...productPages, ...postPages];
}
