import { Check, Loader2 } from "lucide-react";
import { ChakraRing } from "./ChakraRing";
import type { Phase } from "@/hooks/useStudioGeneration";
import { cn } from "@/lib/cn";

const STEPS: { key: Phase; label: string; jp: string }[] = [
  { key: "uploading", label: "Sealing your references", jp: "封" },
  { key: "queued", label: "Tracking pose & camera", jp: "眼" },
  { key: "rendering", label: "Weaving the illusion", jp: "幻" },
  { key: "done", label: "Temporal pass", jp: "結" },
];
const ORDER: Phase[] = ["uploading", "queued", "rendering", "done"];

export function RenderOverlay({ phase, progress }: { phase: Phase; progress: number }) {
  const current = ORDER.indexOf(phase);
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center overflow-hidden bg-ink-950/70 backdrop-blur-sm">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-chakra-500/20 to-transparent" />
      <div className="relative">
        <ChakraRing className="h-32 w-32" progress={progress} />
        <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 font-display text-2xl">{Math.round(progress * 100)}%</span>
      </div>
      <ul className="relative mt-14 w-[80%] max-w-[300px] space-y-1.5">
        {STEPS.map((s, i) => {
          const done = i < current || phase === "done";
          const active = i === current && phase !== "done";
          return (
            <li
              key={s.key}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition",
                active ? "bg-white/10 text-white" : done ? "text-white/70" : "text-white/30",
              )}
            >
              <span className={cn("font-jp text-base", active || done ? "text-chakra-400" : "text-white/20")}>{s.jp}</span>
              <span className="flex-1">{s.label}</span>
              {done ? <Check className="h-3.5 w-3.5 text-spirit" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin text-spirit" /> : null}
            </li>
          );
        })}
      </ul>
      <p className="relative mt-4 font-mono text-[10px] uppercase tracking-widest text-white/40">Usually 2–5 min · safe to leave this tab</p>
    </div>
  );
}
