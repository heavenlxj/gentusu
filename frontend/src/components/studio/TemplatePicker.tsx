import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { TEMPLATE_CATEGORIES, loadTemplates, type VideoTemplate } from "@/config/templates";
import type { ModeId } from "@/config/site";
import { cn } from "@/lib/cn";

const PAGE = 24;

interface TemplatePickerProps {
  modeId: ModeId;
  selected?: string;
  onPick: (t: VideoTemplate) => void;
}

export function TemplatePicker({ modeId, selected, onPick }: TemplatePickerProps) {
  const [all, setAll] = useState<VideoTemplate[] | null>(null);
  const [category, setCategory] = useState<string>(TEMPLATE_CATEGORIES[0].id);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  useEffect(() => {
    loadTemplates().then(setAll);
  }, []);

  const forMode = useMemo(() => (all ?? []).filter((t) => t.modes.includes(modeId)), [all, modeId]);
  const categories = useMemo(() => TEMPLATE_CATEGORIES.filter((c) => forMode.some((t) => t.category === c.id)), [forMode]);
  const active = categories.some((c) => c.id === category) ? category : categories[0]?.id;
  const q = query.trim().toLowerCase();
  const list = useMemo(
    () => forMode.filter((t) => (q ? `${t.title} ${t.description}`.toLowerCase().includes(q) : t.category === active)),
    [forMode, active, q],
  );

  useEffect(() => setLimit(PAGE), [active, q, modeId]);

  if (!all) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-white/10 bg-ink-950/60 text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-950/60 p-2">
      <div className="mb-2 flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategory(c.id);
                setQuery("");
              }}
              className={cn(
                "flex-none rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                !q && active === c.id ? "bg-chakra-500 text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <label className="flex w-28 flex-none items-center gap-1 rounded-full border border-white/10 px-2 py-1 focus-within:border-chakra-500">
          <Search className="h-3 w-3 flex-none text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-[11px] text-white placeholder-white/30 outline-none"
          />
        </label>
      </div>

      <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-0.5 sm:grid-cols-4">
        {list.slice(0, limit).map((t) => (
          <TemplateCard key={t.slug} t={t} active={selected === t.video} onPick={() => onPick(t)} />
        ))}
        {list.length > limit && (
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE)}
            className="col-span-full rounded-xl border border-white/10 py-2 text-[11px] font-semibold text-white/60 hover:text-white"
          >
            Show more ({list.length - limit})
          </button>
        )}
        {!list.length && <p className="col-span-full py-6 text-center text-xs text-white/40">No templates match</p>}
      </div>
    </div>
  );
}

function TemplateCard({ t, active, onPick }: { t: VideoTemplate; active: boolean; onPick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      title={t.description || t.title}
      onClick={onPick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn("relative aspect-[3/4] overflow-hidden rounded-xl border-2 bg-ink-900", active ? "border-chakra-500" : "border-transparent hover:border-white/30")}
    >
      <img src={t.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
      {hover && <video src={t.video} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />}
      {t.seconds > 0 && (
        <span className="absolute right-1 top-1 rounded bg-ink-950/75 px-1 font-mono text-[9px] text-white/80">{Math.round(t.seconds)}s</span>
      )}
      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink-950 to-transparent px-1.5 pb-1 pt-4 text-left text-[10px] font-semibold">
        {t.title}
      </span>
    </button>
  );
}
