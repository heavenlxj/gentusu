import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { CompareSlider } from "@/components/studio/CompareSlider";
import { ChakraRing } from "@/components/studio/ChakraRing";
import { HERO_DEMO, MODES, SITE } from "@/config/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 sm:pt-36">
      <span className="pointer-events-none absolute -top-10 left-1/2 -z-10 -translate-x-1/2 select-none font-jp text-[300px] font-black leading-none text-white/[0.025] sm:text-[460px]">
        {SITE.kanji}
      </span>
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-chakra-500/40 bg-chakra-500/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-chakra-300">
            <ChakraRing className="h-3.5 w-3.5" spinning={false} /> AI motion transfer & video swap
          </span>
          <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
            Rewrite reality.
            <br />
            <span className="relative inline-block">
              <span className="text-chakra-gradient">Keep the motion.</span>
              <span aria-hidden className="absolute inset-0 animate-glitch text-spirit/60 mix-blend-screen">Keep the motion.</span>
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-white/60">
            Genjutsu separates <b className="text-white">who</b> is moving from <b className="text-white">how</b> they move. Recast the performer, swap a product, restyle the whole scene — the movement, camera and timing stay exactly as filmed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#studio" className="btn-primary px-7 py-4 text-base">
              Open the studio <ArrowRight className="h-5 w-5" />
            </a>
            <a href="#showcase" className="btn-ghost px-6 py-4">
              <Play className="h-4 w-4" /> Watch the showcase
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {MODES.map((m) => (
              <Link key={m.id} to={`/${m.id}`} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/70 transition hover:border-chakra-500/60 hover:text-white">
                <span className="font-jp text-chakra-400">{m.kanji}</span> {m.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative animate-rise [animation-delay:.15s]">
          <div className="absolute -inset-6 -z-10 rounded-[40px] bg-gradient-to-br from-chakra-500/30 via-transparent to-spirit/20 blur-2xl" />
          <CompareSlider before={HERO_DEMO.source} after={HERO_DEMO.result} beforeLabel="Source motion" afterLabel="Your character" autoSweep className="aspect-[4/5] w-full rounded-[28px] border border-white/10 shadow-chakra sm:aspect-[4/4.2]" />
          <div className="absolute -left-4 bottom-8 z-20 hidden animate-float rounded-2xl border border-white/15 bg-ink-900/90 p-2 shadow-2xl backdrop-blur sm:block">
            <img src={HERO_DEMO.character} alt="Character input" className="h-24 w-20 rounded-xl object-cover" />
            <p className="mt-1 text-center font-mono text-[9px] uppercase tracking-widest text-white/60">1 photo</p>
          </div>
          <div className="absolute -right-3 top-10 z-20 hidden rounded-2xl border border-white/15 bg-ink-900/90 px-4 py-3 shadow-2xl backdrop-blur sm:block">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">Identity lock</p>
            <p className="font-display text-2xl font-bold text-spirit">99.2%</p>
          </div>
        </div>
      </div>
    </section>
  );
}
