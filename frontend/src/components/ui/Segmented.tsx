import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  sub?: string;
  locked?: boolean;
  disabled?: boolean;
}

interface SegmentedProps<T extends string | number> {
  value: T;
  options: SegmentOption<T>[];
  onChange: (v: T) => void;
  disabled?: boolean;
}

export function Segmented<T extends string | number>({ value, options, onChange, disabled }: SegmentedProps<T>) {
  return (
    <div className="grid gap-1.5 rounded-2xl bg-white/[0.04] p-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            disabled={disabled || o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl px-2 py-2 text-sm font-semibold transition",
              active ? "bg-chakra-500 text-ink-950 shadow-[0_6px_24px_-6px_rgba(255,31,75,.8)]" : "text-white/70 hover:bg-white/5 hover:text-white",
              (disabled || o.disabled) && "cursor-not-allowed opacity-35 hover:bg-transparent",
            )}
          >
            <span className="flex items-center gap-1">
              {o.label}
              {o.locked && <Lock className="h-3 w-3 opacity-70" />}
            </span>
            {o.sub && <span className={cn("text-[10px] font-medium", active ? "text-ink-950/70" : "text-white/40")}>{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}
