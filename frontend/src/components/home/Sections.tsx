import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Eye, Fingerprint, Layers, Lock, Minus, Plus, ScanLine, ShieldCheck, Sparkles, Waves } from "lucide-react";
import { MODES } from "@/config/site";
import { cn } from "@/lib/cn";

export function Ticker() {
  const words = ["Motion transfer", "Character swap", "Object swap", "Restyle", "Face swap", "Identity lock", "Up to 1080p", "Photoreal · 3D · Anime"];
  const row = [...words, ...words];
  return (
    <div className="mt-24 border-y border-white/5 bg-white/[0.02] py-4">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-lg font-bold uppercase tracking-wide text-white/70">
            {w} <span className="text-chakra-500">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ModesShowcase() {
  return (
    <section id="showcase" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Five illusions</p>
          <h2 className="mt-3 font-display text-4xl font-black leading-tight sm:text-5xl">
            One engine.<br />Every kind of illusion.
          </h2>
        </div>
        <p className="max-w-sm text-white/55">All modes share the same identity-preserving core, so switching never costs you quality.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-6">
        {MODES.map((m, i) => (
          <Link
            key={m.id}
            to={`/${m.id}`}
            className={cn("group relative overflow-hidden rounded-[28px] border border-white/10 bg-ink-900", i < 2 ? "md:col-span-3 aspect-[16/10]" : "md:col-span-2 aspect-[4/5]")}
          >
            <video
              src={m.cover}
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
              muted
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
            <span className="absolute right-5 top-4 font-jp text-6xl font-black text-white/15 transition group-hover:text-chakra-500/60">{m.kanji}</span>
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-chakra-300">{m.tagline}</p>
              <p className="mt-1 flex items-center gap-2 font-display text-2xl font-bold">
                {m.name} <ArrowUpRight className="h-5 w-5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </p>
              <p className="mt-2 line-clamp-2 max-w-md text-sm text-white/60">{m.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
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
    <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">How it works</p>
      <h2 className="mt-3 text-center font-display text-4xl font-black sm:text-5xl">From footage to illusion in minutes</h2>
      <div className="relative mt-14 grid gap-4 md:grid-cols-4">
        <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-chakra-500/50 to-transparent md:block" />
        {PIPELINE.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="card relative p-6">
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-chakra-500/40 bg-ink-900 text-chakra-400">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-white/40">Stage 0{i + 1}</p>
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
    <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
      <p className="eyebrow">Use cases</p>
      <h2 className="mt-3 max-w-2xl font-display text-4xl font-black sm:text-5xl">Built for people who ship video.</h2>
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
    <section id="responsible" className="mx-auto max-w-7xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <div className="grain relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-ink-800 to-ink-950 p-8 sm:p-12">
        <p className="eyebrow">Responsible AI</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-black sm:text-4xl">Powerful illusions need clear rules.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-spirit" />
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
  { q: "Is this the same as Higgsfield Genjutsu?", a: "No. Genjutsu AI is an independent product offering similar motion-transfer and swap workflows on top of leading video models (Kling, Wan and others)." },
  { q: "How long can my video be?", a: "Motion Transfer supports 3–30s clips (10s when following the photo orientation). Character Swap up to 30s, Object Swap and Restyle 3–10s, Face Swap up to 10 minutes." },
  { q: "Does it work with anime and 3D characters?", a: "Yes. The engine is style-preserving: photoreal stays photoreal, 3D stays 3D and anime keeps its line art and cel shading." },
  { q: "How much does it cost?", a: "Credits are charged per second of output and depend on the mode — Face Swap from 1 credit/s, Motion Transfer from 4 credits/s. Failed renders are refunded automatically." },
  { q: "Can I use the results commercially?", a: "Yes on Creator and Studio packs, as long as you own or have permission for every likeness and clip you upload." },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 pt-28 sm:px-6">
      <p className="eyebrow text-center">FAQ</p>
      <h2 className="mt-3 text-center font-display text-4xl font-black sm:text-5xl">Questions, answered.</h2>
      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={cn("card overflow-hidden transition", isOpen && "border-chakra-500/40")}>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold">
                {f.q}
                <span className={cn("flex h-7 w-7 flex-none items-center justify-center rounded-full transition", isOpen ? "bg-chakra-500" : "bg-white/5")}>
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
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
    <section className="mx-auto max-w-7xl px-4 pt-28 sm:px-6">
      <div className="grain relative overflow-hidden rounded-[40px] bg-chakra-500 px-6 py-16 text-center sm:py-20">
        <span className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none font-jp text-[200px] font-black leading-none text-ink-950/15">幻術</span>
        <h2 className="relative font-display text-4xl font-black leading-tight sm:text-6xl">Cast the illusion.</h2>
        <p className="relative mx-auto mt-4 max-w-md text-white/85">One photo, one clip, one click. Your first render is on us.</p>
        <a href="#studio" className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-ink-950 px-8 py-4 font-semibold transition hover:scale-[1.03]">
          Open the studio
        </a>
      </div>
    </section>
  );
}
