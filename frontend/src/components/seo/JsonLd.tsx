export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

import { absoluteUrl } from "@/lib/site-url";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CÔNG TY TNHH TPT ĐIỆN PHÁT",
    alternateName: "Gold Shop Midea Điện Phát",
    url: absoluteUrl(""),
    logo: absoluteUrl("/logo.png"),
    address: {
      "@type": "PostalAddress",
      streetAddress: "Số 6 Nguyễn Văn Cưng",
      addressLocality: "Phường Mỹ Long",
      addressRegion: "Long Xuyên",
      addressCountry: "VN",
    },
    taxID: "1602189097",
  };
  return <JsonLd data={data} />;
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gold Shop Midea - Điện Phát",
    url: absoluteUrl(""),
    description:
      "Showroom Gold Shop Midea Điện Phát - giới thiệu sản phẩm điều hòa Midea, thông tin showroom và tư vấn lắp đặt tại Long Xuyên.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${absoluteUrl("")}/san-pham?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
  return <JsonLd data={data} />;
}

export function ProductJsonLd({
  name,
  description,
  image,
  url,
}: {
  name: string;
  description?: string;
  image?: string;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || name,
    image: image ? (image.startsWith("http") ? image : absoluteUrl(image.startsWith("/") ? image : `/${image}`)) : undefined,
    url,
  };
  return <JsonLd data={data} />;
}

export function ArticleJsonLd({
  title,
  description,
  image,
  url,
  datePublished,
  dateModified,
}: {
  title: string;
  description?: string;
  image?: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || title,
    image: image ? (image.startsWith("http") ? image : absoluteUrl(image.startsWith("/") ? image : `/${image}`)) : undefined,
    url,
    datePublished: datePublished || undefined,
    dateModified: dateModified || undefined,
  };
  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={data} />;
}
