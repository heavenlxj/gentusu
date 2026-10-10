import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LayoutGrid, Loader2, Play, Search, Volume2, X } from "lucide-react";
import { TEMPLATE_CATEGORIES, loadTemplates, type VideoTemplate } from "@/config/templates";
import type { Mode, ModeId } from "@/config/site";
import { cn } from "@/lib/cn";

const PAGE = 30;

function useModeTemplates(modeId: ModeId) {
  const [all, setAll] = useState<VideoTemplate[] | null>(null);
  useEffect(() => {
    loadTemplates().then(setAll);
  }, []);
  const list = useMemo(() => all && all.filter((t) => t.modes.includes(modeId)), [all, modeId]);
  return list;
}

interface LauncherProps {
  modeId: ModeId;
  disabled?: boolean;
  onOpen: () => void;
}

export function TemplateLauncher({ modeId, disabled, onOpen }: LauncherProps) {
  const list = useModeTemplates(modeId);
  const covers = list?.slice(0, 3) ?? [];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onOpen}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-chakra-500/40 bg-gradient-to-r from-chakra-500/15 via-chakra-500/[0.07] to-spirit/10 p-3 text-left transition hover:border-chakra-400 hover:shadow-glow disabled:opacity-60"
    >
      <span className="relative flex h-14 w-[4.5rem] flex-none">
        {covers.length ? (
          covers.map((t, i) => (
            <img
              key={t.slug}
              src={t.poster}
              alt=""
              className="absolute top-0 h-14 w-10 rounded-lg border-2 border-ink-900 object-cover shadow-lg transition group-hover:-translate-y-0.5"
              style={{ left: i * 16, zIndex: 3 - i, transform: `rotate(${(i - 1) * 6}deg)` }}
            />
          ))
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-chakra-500/20 text-chakra-400">
            <LayoutGrid className="h-6 w-6" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold">
          Browse {list ? `${list.length}+ ` : ""}video templates
        </span>
        <span className="block truncate text-xs text-white/55">No clip? Pick a viral effect, action shot or aura edit in one click</span>
      </span>
      <span className="flex flex-none items-center gap-1 rounded-full bg-chakra-500 px-3.5 py-2 text-xs font-semibold text-snow transition group-hover:bg-chakra-400">
        <span className="hidden sm:inline">Browse</span> <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

interface ModalProps {
  mode: Mode;
  selected?: string;
  onPick: (t: VideoTemplate) => void;
  onClose: () => void;
}

export function TemplateModal({ mode, selected, onPick, onClose }: ModalProps) {
  const forMode = useModeTemplates(mode.id);
  const [category, setCategory] = useState<string>(TEMPLATE_CATEGORIES[0].id);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [preview, setPreview] = useState<VideoTemplate | null>(null);

  const categories = useMemo(() => TEMPLATE_CATEGORIES.filter((c) => (forMode ?? []).some((t) => t.category === c.id)), [forMode]);
  const active = categories.some((c) => c.id === category) ? category : categories[0]?.id;
  const q = query.trim().toLowerCase();
  const list = useMemo(
    () => (forMode ?? []).filter((t) => (q ? `${t.title} ${t.description}`.toLowerCase().includes(q) : t.category === active)),
    [forMode, active, q],
  );

  useEffect(() => setLimit(PAGE), [active, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (preview) setPreview(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div
        className="panel relative flex h-full w-full max-w-[1400px] flex-col overflow-hidden border-chakra-500/25 bg-ink-900 shadow-chakra sm:h-[90vh] sm:rounded-[28px] sm:border"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-none border-b border-white/10 px-4 pb-3 pt-4 sm:px-6 sm:pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-black sm:text-2xl">Video templates</h2>
              <p className="mt-1 text-xs text-white/55 sm:text-sm">
                {forMode ? `${forMode.length} ready-made clips for ${mode.name}` : "Loading…"} · preview any clip before you use it
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-white/5 p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCategory(c.id);
                    setQuery("");
                  }}
                  className={cn(
                    "flex-none rounded-full px-4 py-2 text-sm font-semibold transition",
                    !q && active === c.id ? "bg-chakra-500 text-snow" : "bg-white/[0.04] text-white/65 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <label className="flex flex-none items-center gap-2 rounded-full border border-white/10 bg-ink-950/60 px-3.5 py-2 focus-within:border-chakra-500 sm:w-64">
              <Search className="h-4 w-4 flex-none text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search templates"
                className="w-full bg-transparent text-sm text-white placeholder-white/35 outline-none"
              />
            </label>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {!forMode ? (
            <div className="flex h-full items-center justify-center text-white/50">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {list.slice(0, limit).map((t) => (
                <TemplateCard key={t.slug} t={t} active={selected === t.video} onPreview={() => setPreview(t)} onPick={() => onPick(t)} />
              ))}
              {list.length > limit && (
                <button
                  type="button"
                  onClick={() => setLimit((n) => n + PAGE)}
                  className="col-span-full rounded-2xl border border-white/10 py-3 text-sm font-semibold text-white/65 hover:border-white/25 hover:text-white"
                >
                  Show more ({list.length - limit})
                </button>
              )}
              {!list.length && <p className="col-span-full py-16 text-center text-sm text-white/45">No templates match “{query}”</p>}
            </div>
          )}
        </div>

        {preview && <TemplatePreview t={preview} active={selected === preview.video} onBack={() => setPreview(null)} onPick={() => onPick(preview)} />}
      </div>
    </div>
  );
}

function TemplateCard({ t, active, onPreview, onPick }: { t: VideoTemplate; active: boolean; onPreview: () => void; onPick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border-2 bg-ink-950/60 transition",
        active ? "border-chakra-500" : "border-transparent hover:border-chakra-400/60",
      )}
    >
      <button type="button" onClick={onPreview} className="relative aspect-[3/4] w-full overflow-hidden bg-ink-800" aria-label={`Preview ${t.title}`}>
        <img src={t.poster} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        {hover && <video src={t.video} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-snow/90 backdrop-blur">
          {t.seconds > 0 && `${Math.round(t.seconds)}s`}
          {t.audio && <Volume2 className="h-3 w-3" />}
        </span>
        {active && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-chakra-500 px-2 py-0.5 text-[10px] font-semibold text-snow">
            <Check className="h-3 w-3" /> In use
          </span>
        )}
        {!hover && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
            <Play className="h-8 w-8 fill-snow text-snow drop-shadow" />
          </span>
        )}
      </button>
      <div className="flex items-center gap-2 p-2.5">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold" title={t.description || t.title}>
          {t.title}
        </p>
        <button
          type="button"
          onClick={onPick}
          className="hidden flex-none rounded-full bg-chakra-500/15 px-3 py-1 text-xs font-semibold text-chakra-300 transition hover:bg-chakra-500 hover:text-snow sm:block"
        >
          Use
        </button>
      </div>
    </div>
  );
}

function TemplatePreview({ t, active, onBack, onPick }: { t: VideoTemplate; active: boolean; onBack: () => void; onPick: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-ink-900/95 backdrop-blur-md">
      <div className="flex flex-none items-center px-4 pt-4 sm:px-6 sm:pt-5">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> All templates
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4 sm:p-6 lg:flex-row lg:items-center lg:gap-10">
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <video
            key={t.video}
            src={t.video}
            poster={t.poster}
            className="h-[58vh] w-auto max-w-full rounded-2xl bg-black shadow-chakra lg:h-[70vh]"
            controls
            autoPlay
            loop
            playsInline
          />
        </div>
        <div className="flex-none lg:w-80">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-chakra-300">
            {TEMPLATE_CATEGORIES.find((c) => c.id === t.category)?.label}
          </p>
          <h3 className="mt-2 font-display text-2xl font-black">{t.title}</h3>
          {t.description && <p className="mt-3 text-sm leading-relaxed text-white/65">{t.description}</p>}
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
            {t.seconds > 0 && <span className="rounded-full bg-white/5 px-2.5 py-1">{t.seconds.toFixed(1)}s</span>}
            {t.width > 0 && <span className="rounded-full bg-white/5 px-2.5 py-1">{t.width}×{t.height}</span>}
            <span className="rounded-full bg-white/5 px-2.5 py-1">{t.audio ? "With audio" : "No audio"}</span>
          </div>
          <button type="button" onClick={onPick} className="btn-primary mt-6 w-full py-3.5">
            {active ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />} {active ? "In use — back to studio" : "Use this template"}
          </button>
        </div>
      </div>
    </div>
  );
}
