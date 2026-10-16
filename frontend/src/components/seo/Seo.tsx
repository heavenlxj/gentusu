import { Helmet } from "react-helmet-async";
import { SITE } from "@/config/site";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "video.other";
  noindex?: boolean;
  jsonLd?: object | object[];
}

/** index.html 里的同名标签带 data-rh，每个路由都必须渲染一次 Seo 才不会丢 meta */
export function Seo({ title, description, path, image = SITE.ogImage, type = "website", noindex, jsonLd }: SeoProps) {
  const url = `${SITE.url}${path}`;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-video-preview:-1"} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(b)}
        </script>
      ))}
    </Helmet>
  );
}

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const breadcrumbJsonLd = (items: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["Home", "/"], ...items].map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: `${SITE.url}${path}`,
  })),
});
