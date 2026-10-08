import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Film, ImagePlus, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Asset } from "@/hooks/useStudioGeneration";
import { useToast } from "@/components/providers/ToastProvider";

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 100;

export function readVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve(v.duration || 0);
    v.onerror = () => resolve(0);
    v.src = url;
  });
}

function useDrop(onFiles: (files: File[]) => void, disabled?: boolean) {
  const [over, setOver] = useState(false);
  return {
    over,
    handlers: {
      onDragOver: (e: DragEvent) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFiles(Array.from(e.dataTransfer.files ?? []));
      },
    },
  };
}

interface VideoDropProps {
  label: string;
  hint: string;
  value: Asset | null;
  duration: number;
  onChange: (a: Asset | null) => void;
  disabled?: boolean;
  extra?: ReactNode;
}

export function VideoDrop({ label, hint, value, duration, onChange, disabled, extra }: VideoDropProps) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const accept = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) return toast("Please choose an MP4 or MOV clip", "error");
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return toast(`Videos must be under ${MAX_VIDEO_MB}MB`, "error");
    onChange({ file, previewUrl: URL.createObjectURL(file) });
  };
  const { over, handlers } = useDrop((f) => accept(f[0]), disabled);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{label}</span>
        {extra}
      </div>
      <div
        {...handlers}
        role="button"
        tabIndex={0}
        onClick={() => !disabled && !value && input.current?.click()}
        className={cn(
          "group relative flex h-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition",
          value ? "border-transparent bg-ink-900" : "cursor-pointer border-white/15 bg-white/[0.02] hover:border-chakra-400/70 hover:bg-chakra-500/5",
          over && "border-spirit bg-spirit/5",
          disabled && "opacity-60",
        )}
      >
        {value ? (
          <>
            <video src={value.previewUrl} className="h-full w-full object-contain" muted loop autoPlay playsInline />
            {duration > 0 && (
              <span className="absolute bottom-2 left-2 rounded-md bg-ink-950/80 px-2 py-0.5 font-mono text-[10px] text-white/80">{duration.toFixed(1)}s</span>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-ink-950/70 p-1.5 text-white/80 hover:text-white"
                aria-label="Remove video"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-chakra-500/15 text-chakra-400 transition group-hover:scale-110 group-hover:bg-chakra-500 group-hover:text-white">
              <Film className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold">Drop a video</p>
            <p className="text-[11px] text-white/45">{hint}</p>
          </div>
        )}
        <input
          ref={input}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="hidden"
          onChange={(e) => {
            accept(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

interface ImageDropProps {
  label: string;
  hint: string;
  max: number;
  value: Asset[];
  onChange: (a: Asset[]) => void;
  disabled?: boolean;
}

export function ImageDrop({ label, hint, max, value, onChange, disabled }: ImageDropProps) {
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const accept = (files: File[]) => {
    const ok = files.filter((f) => {
      if (!f.type.startsWith("image/")) return false;
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast(`Images must be under ${MAX_IMAGE_MB}MB`, "error");
        return false;
      }
      return true;
    });
    if (!ok.length) return;
    const next = max === 1 ? [] : [...value];
    ok.slice(0, max - next.length).forEach((f) => next.push({ file: f, previewUrl: URL.createObjectURL(f) }));
    onChange(next.slice(0, max));
  };
  const { over, handlers } = useDrop(accept, disabled);
  const single = max === 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{label}</span>
        {!single && <span className="font-mono text-[10px] text-white/40">{value.length}/{max}</span>}
      </div>
      <div {...handlers} className={cn("grid gap-2 rounded-2xl transition", single ? "grid-cols-1" : "grid-cols-4", over && "ring-2 ring-spirit")}>
        {value.map((a, i) => (
          <div key={a.previewUrl} className={cn("group relative overflow-hidden rounded-2xl bg-ink-900", single ? "h-40" : "aspect-square")}>
            <img src={a.previewUrl} alt="" className={cn("h-full w-full", single ? "object-contain" : "object-cover")} />
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 rounded-full bg-ink-950/70 p-1 text-white/80 opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => input.current?.click()}
            className={cn(
              "group flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] text-center transition hover:border-chakra-400/70 hover:bg-chakra-500/5",
              single ? "h-40" : "aspect-square",
            )}
          >
            {single ? (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-chakra-500/15 text-chakra-400 transition group-hover:scale-110 group-hover:bg-chakra-500 group-hover:text-white">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">Drop a photo</p>
                <p className="px-4 text-[11px] text-white/45">{hint}</p>
              </>
            ) : (
              <Plus className="h-5 w-5 text-white/50" />
            )}
          </button>
        )}
      </div>
      {!single && <p className="mt-1.5 text-[11px] text-white/40">{hint}</p>}
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={!single}
        className="hidden"
        onChange={(e) => {
          accept(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
