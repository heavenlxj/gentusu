import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, Fingerprint, Layers, Lock, Minus, Plus, ScanLine, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { FREE_TRIAL, MODES, PLANS, creditsPerSecond, type Mode } from "@/config/site";
import { CompareSlider } from "@/components/studio/CompareSlider";
import { cn } from "@/lib/cn";

export function Showcase() {
  return (
    <section id="showcase" className="relative mx-auto max-w-[1320px] scroll-mt-24 px-4 pt-28 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-20 -z-10 mx-auto h-[520px] max-w-4xl rounded-full bg-chakra-500/20 blur-[140px]" />
      <div className="mb-12 text-center">
        <p className="eyebrow">Real renders · sound on</p>
        <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] sm:text-6xl">
          {MODES.length} illusions.
          <br />
          <span className="bg-gradient-to-r from-chakra-300 via-chakra-500 to-spirit bg-clip-text text-transparent">Same take, new reality.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/55">
          Every clip below is untouched model output. Drag the handle to reveal the original, tap the speaker to hear it.
        </p>
      </div>
      <div className="space-y-10 sm:space-y-16">
        {MODES.map((m, i) => (
          <ModeCard key={m.id} mode={m} index={i} />
        ))}
      </div>
    </section>
  );
}

function ModeCard({ mode, index }: { mode: Mode; index: number }) {
  const ex = mode.example;
  const style = mode.presets?.[ex.preset ?? -1]?.label;
  const recipe = ex.prompt ?? (style ? `Style: ${style}` : undefined);
  const flip = index % 2 === 1;

  return (
    <article className="group relative">
      <div className="absolute -inset-px rounded-[32px] bg-gradient-to-br from-chakra-500/50 via-white/5 to-spirit/40 opacity-40 blur-sm transition duration-500 group-hover:opacity-100" />
      <div className="relative grid overflow-hidden rounded-[32px] border border-white/10 bg-ink-900 lg:grid-cols-[1.65fr_1fr]">
        <div className={cn("relative bg-black", flip && "lg:order-2")}>
          <CompareSlider
            before={ex.before}
            after={ex.after}
            poster={ex.poster}
            beforePoster={ex.beforePoster}
            afterLabel={mode.name}
            play="inview"
            soundId={`showcase-${mode.id}`}
            className="h-full w-full"
            style={{ aspectRatio: ex.aspect }}
          />
        </div>

        <div className="relative flex flex-col justify-between gap-6 overflow-hidden p-6 sm:p-8">
          <span className="pointer-events-none absolute -right-6 -top-10 select-none font-jp text-[200px] leading-none text-chakra-500/10 transition duration-700 group-hover:text-chakra-500/20">
            {mode.kanji}
          </span>
          <div className="relative">
            <p className="font-mono text-xs tracking-[0.3em] text-chakra-400">
              {String(index + 1).padStart(2, "0")} / {String(MODES.length).padStart(2, "0")}
            </p>
            <h3 className="mt-3 font-display text-3xl font-black sm:text-4xl">{mode.name}</h3>
            <p className="mt-1 text-lg text-chakra-300">{mode.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">{mode.description}</p>
          </div>

          <div className="relative space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">What went in</p>
            <div className="flex items-stretch gap-3">
              <img src={ex.beforePoster} alt="Source clip" className="h-24 w-32 flex-none rounded-xl object-cover ring-1 ring-white/15" />
              {ex.images.map((src) => (
                <img key={src} src={src} alt="Reference" className="h-24 w-20 flex-none rounded-xl object-cover ring-2 ring-chakra-500/70" />
              ))}
              {recipe && (
                <p className="line-clamp-4 flex-1 rounded-xl border border-white/10 bg-ink-950/60 p-3 text-xs italic leading-relaxed text-white/70">“{recipe}”</p>
              )}
            </div>
            <Link to={`/${mode.id}`} className="btn-primary mt-2 w-full sm:w-auto">
              Try {mode.name} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

const PIPELINE = [
  { icon: ScanLine, title: "Pose & camera tracking", body: "Skeleton, hands, head orientation and camera path are read from every frame." },
  { icon: Fingerprint, title: "Identity lock", body: "Face, hair, wardrobe and art style are embedded from your reference photos." },
  { icon: Layers, title: "Video diffusion", body: "New frames are synthesized, guided by the tracked motion and your direction." },
  { icon: Waves, title: "Temporal pass", body: "Flicker and drift are removed so the illusion holds from first frame to last." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">How it works</p>
      <h2 className="mt-3 text-center font-display text-3xl font-black sm:text-4xl">From footage to illusion in minutes</h2>
      <div className="relative mt-14 grid gap-4 md:grid-cols-4">
        {PIPELINE.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="card relative p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chakra-500/15 text-chakra-400">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-5 font-mono text-[11px] text-white/35">0{i + 1}</p>
            <h3 className="mt-1 font-display text-lg font-bold">{title}</h3>
            <p className="mt-2 text-sm text-white/55">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const USES = [
  { title: "Creators & short-form", body: "Jump on every dance trend without learning the choreography. Post your avatar doing the move the day it goes viral." },
  { title: "Brands & ads", body: "Swap the product, the spokesperson or the market — keep the pacing of the ad that already works." },
  { title: "VTubers & virtual idols", body: "Animate 2D and 3D characters from concept art. Prototype emotes and performances before hand animation." },
  { title: "Fashion & e-commerce", body: "Try several outfits on the same clip. Show how clothes move instead of a static pose." },
  { title: "Film & previs", body: "Block out with stand-ins, swap in final talent later, restyle a pitch film in an afternoon." },
  { title: "Music artists", body: "Turn one press photo into a performance clip or a fan challenge for every release." },
];

export function UseCases() {
  return (
    <section className="mx-auto max-w-[1320px] px-4 pt-28 sm:px-6">
      <p className="eyebrow">Use cases</p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-black sm:text-4xl">Built for people who ship video.</h2>
      <div className="mt-10 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {USES.map((u, i) => (
          <div key={u.title} className="group bg-ink-950 p-7 transition hover:bg-ink-900">
            <p className="font-mono text-xs text-chakra-400">0{i + 1}</p>
            <h3 className="mt-3 font-display text-xl font-bold">{u.title}</h3>
            <p className="mt-2 text-sm text-white/55">{u.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const COMPARE = [
  ["What changes", "The whole character performs new motion", "The whole performer", "Only the face"],
  ["What stays", "Identity & style from your photo", "Background, camera, lighting", "Body, clothes, scene, motion"],
  ["Input", "1 photo + motion clip", "1 photo + source video", "1 portrait + target video"],
  ["Best for", "Dance trends, avatars, mascots", "Re-casting, previs, localization", "Cameos, greetings, dubbing"],
];

export function Comparison() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">The guide</p>
      <h2 className="mt-3 text-center font-display text-3xl font-black sm:text-4xl">Motion transfer vs. character swap vs. face swap</h2>
      <div className="card mt-10 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-5 py-4" />
              {["Motion transfer", "Character swap", "Face swap"].map((h) => (
                <th key={h} className="px-5 py-4 font-display font-bold text-chakra-300">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE.map(([k, ...cells]) => (
              <tr key={k} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-4 font-mono text-[11px] uppercase tracking-widest text-white/45">{k}</td>
                {cells.map((c) => (
                  <td key={c} className="px-5 py-4 text-white/75">{c}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const TRUST = [
  { icon: Lock, title: "Consent first", body: "Every render requires confirming you have the right to use the likeness and footage." },
  { icon: Eye, title: "Labeled as AI", body: "Outputs carry invisible watermarks and content-credential metadata." },
  { icon: ShieldCheck, title: "Public-figure guard", body: "Well-known public figures and minors are blocked. Deceptive content is prohibited." },
  { icon: Sparkles, title: "Private by default", body: "Uploads are private, never used to train models, and deletable anytime." },
];

export function Responsible() {
  return (
    <section id="responsible" className="mx-auto max-w-[1320px] scroll-mt-24 px-4 pt-28 sm:px-6">
      <div className="rounded-[28px] border border-white/10 bg-ink-900 p-8 sm:p-10">
        <p className="eyebrow">Responsible AI</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-black sm:text-4xl">Powerful illusions need clear rules.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-5 w-5 text-chakra-400" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-white/55">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  { q: "What is Genjutsu AI?", a: "A video tool that transforms existing footage: transfer its motion to a new character, swap a person, object or face, or restyle the whole scene — while the original movement, camera and timing are preserved." },
  { q: "Is this the same as Higgsfield Genjutsu?", a: "No. Genjutsu AI is an independent product offering similar motion-transfer and swap workflows on top of Alibaba’s Wan 3.0 video model." },
  { q: "How long can my video be?", a: "Every mode takes source clips from 2 to 15 seconds. Longer footage? Split it into 15-second takes and render them one by one." },
  { q: "Does the result have sound?", a: "Yes. By default the model generates sound that matches the edited scene. In edit modes you can also keep your clip’s original audio instead." },
  { q: "Does it work with anime and 3D characters?", a: "Yes. The engine is style-preserving: photoreal stays photoreal, 3D stays 3D and anime keeps its line art and cel shading." },
  {
    q: "How much does it cost?",
    a: `New accounts get ${FREE_TRIAL.credits} free credits — one ${FREE_TRIAL.seconds}s ${FREE_TRIAL.resolution} clip (watermarked). After that it's one rate for every mode: ${creditsPerSecond("480p")} credits per second at 480p, ${creditsPerSecond("720p")} at 720p HD and ${creditsPerSecond("1080p")} at 1080p. Plans start at $${PLANS[0].monthly}/month with ${PLANS[0].credits} credits (save 20% yearly), and failed renders are refunded automatically.`,
  },
  {
    q: "Do credits expire?",
    a: "Plan credits are issued every billing month and expire at the end of that month — yearly plans get a fresh batch each month. Credit packs (for subscribers) never expire and are only used once your monthly credits run out.",
  },
  {
    q: "Can I upgrade or cancel?",
    a: "Upgrade anytime: you pay only the prorated difference and the extra credits land immediately. Cancel anytime and keep using your plan until the end of the billing period.",
  },
  { q: "Can I use the results commercially?", a: "Yes on Creator and Studio packs, as long as you own or have permission for every likeness and clip you upload." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">FAQ</p>
      <h2 className="mt-3 text-center font-display text-3xl font-black sm:text-4xl">Questions, answered.</h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="card overflow-hidden">
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold">
                {f.q}
                {isOpen ? <Minus className="h-4 w-4 flex-none text-chakra-400" /> : <Plus className="h-4 w-4 flex-none text-white/50" />}
              </button>
              <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <p className="overflow-hidden px-6 text-sm leading-relaxed text-white/60">
                  <span className="block pb-5">{f.a}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-[1320px] px-4 pt-28 sm:px-6">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-chakra-700 via-chakra-500 to-[#1fb6d4] px-6 py-14 text-center text-snow shadow-chakra">
        <h2 className="font-display text-3xl font-black leading-tight sm:text-5xl">Cast the illusion.</h2>
        <p className="mx-auto mt-4 max-w-md text-snow/85">One photo, one clip, one click. Your first {FREE_TRIAL.seconds}s clip is on us.</p>
        <a href="#studio" className="mt-7 inline-flex items-center gap-2 rounded-full bg-snow px-7 py-3.5 font-semibold text-[#0c0e20] transition hover:bg-snow/90">
          Open the studio
        </a>
      </div>
    </section>
  );
}
