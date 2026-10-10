import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
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
      <Helmet>
        <title>{mode.seoTitle} | {SITE.name}</title>
        <meta name="description" content={mode.seoDescription} />
      </Helmet>

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
