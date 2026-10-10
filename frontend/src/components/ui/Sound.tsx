import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/cn";

interface SoundContextValue {
  activeId: string | null;
  setActive: (id: string | null) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

/** Browsers only autoplay muted video, so everything starts silent and at most one clip is audible at a time. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [activeId, setActive] = useState<string | null>(null);
  return <SoundContext.Provider value={{ activeId, setActive }}>{children}</SoundContext.Provider>;
}

export function useSound(id: string) {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used inside SoundProvider");
  const on = ctx.activeId === id;
  const toggle = useCallback(() => ctx.setActive(on ? null : id), [ctx, id, on]);
  return { on, toggle };
}

export function SoundButton({ on, onToggle, className }: { on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={on ? "Mute" : "Unmute"}
      title={on ? "Mute" : "Sound on"}
      className={cn(
        "z-20 flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold backdrop-blur transition",
        on ? "bg-white text-ink-950" : "bg-ink-950/70 text-white/90 hover:bg-ink-950/90",
        className,
      )}
    >
      {on ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      {on ? "Sound on" : "Tap for sound"}
    </button>
  );
}
