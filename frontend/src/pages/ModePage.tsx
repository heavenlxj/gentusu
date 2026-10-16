import { Link, useParams } from "react-router-dom";
import { Seo, breadcrumbJsonLd } from "@/components/seo/Seo";
import { ArrowUpRight } from "lucide-react";
import { Studio } from "@/components/studio/Studio";
import { Comparison, FAQ } from "@/components/home/Sections";
import { Pricing } from "@/components/home/Pricing";
import { MODES, SITE, getMode } from "@/config/site";

export default function ModePage() {
  const { modeId } = useParams();
  const mode = getMode(modeId);
  const others = MODES.filter((m) => m.id !== mode.id);

  return (
    <div>
      <Seo
        title={mode.seoTitle}
        description={mode.seoDescription}
        path={`/${mode.id}`}
        image={mode.example.poster}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: `${SITE.name} ${mode.name}`,
            applicationCategory: "MultimediaApplication",
            operatingSystem: "Web",
            url: `${SITE.url}/${mode.id}`,
            description: mode.seoDescription,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free trial clip for new accounts" },
          },
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: `${mode.name} example — ${mode.example.caption}`,
            description: mode.description,
            thumbnailUrl: mode.example.poster,
            contentUrl: mode.example.after,
            uploadDate: "2026-10-01",
          },
          breadcrumbJsonLd([[mode.name, `/${mode.id}`]]),
        ]}
      />

      <Studio initialMode={mode.id} routeOnSwitch title={mode.seoTitle} subtitle={mode.description} />

      <section className="mx-auto max-w-[1320px] px-4 pt-24 sm:px-6">
        <p className="eyebrow">More illusions</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((m) => (
            <Link key={m.id} to={`/${m.id}`} className="card group flex items-center gap-4 p-5 transition hover:border-chakra-500/50">
              <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-chakra-500/15 font-jp text-2xl text-chakra-400">{m.kanji}</span>
              <span className="flex-1">
                <span className="block font-semibold">{m.name}</span>
                <span className="block text-xs text-white/45">{m.tagline}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/40 transition group-hover:text-white" />
            </Link>
          ))}
        </div>
      </section>

      <Comparison />
      <Pricing compact />
      <FAQ />
    </div>
  );
}
