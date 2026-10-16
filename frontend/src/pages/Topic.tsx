import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Seo, breadcrumbJsonLd, faqJsonLd } from "@/components/seo/Seo";
import { CompareSlider } from "@/components/studio/CompareSlider";
import { MODES, SITE } from "@/config/site";
import { TOPICS, getTopic, type TopicSection } from "@/config/topics";
import { cn } from "@/lib/cn";

export default function Topic({ slug }: { slug: string }) {
  const t = getTopic(slug);
  const path = `/${t.slug}`;
  const related = TOPICS.filter((x) => x.slug !== t.slug);

  return (
    <article className="mx-auto max-w-4xl px-4 pt-36 sm:px-6">
      <Seo
        title={t.title}
        description={t.description}
        path={path}
        type="article"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: t.title,
            description: t.description,
            mainEntityOfPage: `${SITE.url}${path}`,
            image: SITE.ogImage,
            dateModified: "2026-10-14",
            author: { "@type": "Organization", name: SITE.name, url: SITE.url },
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          },
          faqJsonLd(t.faqs),
          breadcrumbJsonLd([[t.nav, path]]),
        ]}
      />

      <p className="eyebrow">{t.eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">{t.h1}</h1>
      <p className="mt-6 text-lg text-white/65">{t.intro}</p>
      <a href="/#studio" className="btn-primary mt-8">
        Open the studio <ArrowUpRight className="h-4 w-4" />
      </a>

      {t.sections.map((s) => (
        <Section key={s.h2} section={s} />
      ))}

      <section className="pt-16">
        <h2 className="font-display text-2xl font-black sm:text-3xl">FAQ</h2>
        <dl className="mt-6 space-y-3">
          {t.faqs.map((f) => (
            <div key={f.q} className="card p-5">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-white/60">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav className="pt-16" aria-label="Related guides">
        <p className="eyebrow">Keep reading</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((r) => (
            <li key={r.slug}>
              <Link to={`/${r.slug}`} className="card flex items-center justify-between gap-3 p-4 text-sm font-semibold transition hover:border-chakra-500/50">
                {r.nav}
                <ArrowUpRight className="h-4 w-4 flex-none text-white/40" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </article>
  );
}

function Section({ section: s }: { section: TopicSection }) {
  const modes = s.modes?.map((id) => MODES.find((m) => m.id === id)!) ?? [];
  return (
    <section className="space-y-4 pt-16 text-white/70">
      <h2 className="font-display text-2xl font-black text-white sm:text-3xl">{s.h2}</h2>
      {s.body?.map((p) => <p key={p}>{p}</p>)}
      {s.list && (
        <ul className="list-disc space-y-2 pl-5">
          {s.list.map((li) => (
            <li key={li}>{li}</li>
          ))}
        </ul>
      )}
      {s.prompts?.map((p) => <PromptBlock key={p.label} {...p} />)}
      {s.table && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                {s.table.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-display font-bold text-chakra-300">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row) => (
                <tr key={row[0]} className="border-b border-white/5 last:border-0">
                  {row.map((c, i) => (
                    <td key={i} className={cn("px-4 py-3 align-top", i === 0 ? "font-semibold text-white/85" : "text-white/65")}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modes.length > 0 && (
        <div className={cn("grid gap-5", modes.length > 1 && "md:grid-cols-2")}>
          {modes.map((m) => (
            <figure key={m.id} className="card overflow-hidden">
              <CompareSlider
                before={m.example.before}
                after={m.example.after}
                poster={m.example.poster}
                beforePoster={m.example.beforePoster}
                afterLabel={m.name}
                play="inview"
                soundId={`topic-${m.id}`}
                className="w-full"
                style={{ aspectRatio: m.example.aspect }}
              />
              <figcaption className="flex items-center justify-between gap-3 p-4 text-sm">
                <span className="text-white/60">
                  {m.name} — {m.example.caption}
                </span>
                <Link to={`/${m.id}`} className="flex flex-none items-center gap-1 font-semibold text-chakra-300 hover:text-chakra-200">
                  Try it <ArrowUpRight className="h-4 w-4" />
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

function PromptBlock({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () =>
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-chakra-400">{label}</p>
        <button type="button" onClick={copy} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-xs text-white/70 hover:border-chakra-500">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/75">{text}</p>
    </div>
  );
}
