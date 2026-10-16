import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/config/site";
import { TOPICS } from "@/config/topics";

export function Explainer() {
  return (
    <section id="about" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow">Genjutsu, explained</p>
      <h2 className="mt-3 max-w-3xl font-display text-3xl font-black sm:text-4xl">The Genjutsu AI video generator</h2>
      <div className="mt-8 grid gap-8 text-white/65 md:grid-cols-2">
        <p>
          Genjutsu AI is video-to-video generation named after the illusion techniques (幻術) of Naruto and popularized by Higgsfield Genjutsu: the original motion,
          camera path and timing of a clip stay exactly as filmed while the character, an object, the location or the whole art style changes.
        </p>
        <p>
          {SITE.name} puts seven genjutsu techniques in one studio — motion transfer, character swap, outfit swap, object swap, background swap, restyle and face
          swap — as an independent Higgsfield Genjutsu and Kling Motion Control alternative. Want the viral orange-booth duet instead? Try our sister generator{" "}
          <a href={SITE.sisterUrl} target="_blank" rel="noopener" className="text-chakra-300 underline-offset-4 hover:underline">
            Hotel Lobby AI
          </a>
          .
        </p>
      </div>
      <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TOPICS.map((t) => (
          <li key={t.slug}>
            <Link to={`/${t.slug}`} className="card flex h-full items-center justify-between gap-3 p-4 text-sm font-semibold transition hover:border-chakra-500/50">
              {t.nav}
              <ArrowUpRight className="h-4 w-4 flex-none text-white/40" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
