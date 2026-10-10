import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { Film, ImagePlus, Plus, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Asset } from "@/hooks/useStudioGeneration";
import { useToast } from "@/components/providers/ToastProvider";

const MB = 1024 * 1024;
export const UPLOAD_LIMITS = {
  image: { maxMB: 10, minSide: 300, maxSide: 8192, maxRatio: 3, ext: ["jpg", "jpeg", "png", "webp"] },
  video: { maxMB: 100, minSeconds: 2, maxSeconds: 60, minSide: 360, maxSide: 4096, maxRatio: 3, ext: ["mp4", "mov", "webm", "m4v"] },
};

const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";
const ratioOf = (w: number, h: number) => Math.max(w, h) / Math.min(w, h);

function readImageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = url;
  });
}

/** 返回错误文案；通过时返回 null */
export async function checkVideo(file: File, url: string): Promise<string | null> {
  const L = UPLOAD_LIMITS.video;
  if (!file.type.startsWith("video/") && !L.ext.includes(extOf(file.name))) return "Please choose an MP4, MOV or WebM clip";
  if (file.size > L.maxMB * MB) return `Videos must be under ${L.maxMB}MB — export at 1080p or lower`;
  const { duration, width, height } = await readVideoMeta(url);
  if (!width || !height || !duration) return "This video can't be read — export it as H.264 MP4 and try again";
  if (duration < L.minSeconds) return `Clips must be at least ${L.minSeconds}s long`;
  if (duration > L.maxSeconds) return `Clips must be under ${L.maxSeconds}s — trim to the part you need (up to 15s is rendered)`;
  if (Math.min(width, height) < L.minSide) return `Video resolution is too low (min ${L.minSide}p)`;
  if (Math.max(width, height) > L.maxSide) return "4K+ footage isn't supported — export at 1080p";
  if (ratioOf(width, height) > L.maxRatio) return "Aspect ratio is too extreme — use 16:9, 9:16, 1:1 or similar";
  return null;
}

export async function checkImage(file: File, url: string): Promise<string | null> {
  const L = UPLOAD_LIMITS.image;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) && !L.ext.includes(extOf(file.name))) return "Please use a JPG, PNG or WebP photo";
  if (file.size > L.maxMB * MB) return `Images must be under ${L.maxMB}MB`;
  const { width, height } = await readImageSize(url);
  if (!width || !height) return "This image can't be read — save it as JPG or PNG";
  if (Math.min(width, height) < L.minSide) return `Image is too small (min ${L.minSide}px on the short side)`;
  if (Math.max(width, height) > L.maxSide) return `Image is too large (max ${L.maxSide}px)`;
  if (ratioOf(width, height) > L.maxRatio) return "Aspect ratio is too extreme — crop closer to the subject";
  return null;
}

export function readVideoDuration(url: string): Promise<number> {
  return readVideoMeta(url).then((m) => m.duration);
}

export function readVideoMeta(url: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve({ duration: v.duration || 0, width: v.videoWidth, height: v.videoHeight });
    v.onerror = () => resolve({ duration: 0, width: 0, height: 0 });
    v.src = url;
  });
}

const ASPECTS = ["16:9", "9:16", "1:1", "4:3", "3:4"] as const;

/** Closest output aspect ratio supported by the model. */
export function nearestAspect(width: number, height: number) {
  if (!width || !height) return "16:9";
  const r = width / height;
  const ratio = (a: string) => {
    const [w, h] = a.split(":").map(Number);
    return w / h;
  };
  return ASPECTS.reduce((best, a) => (Math.abs(Math.log(ratio(a) / r)) < Math.abs(Math.log(ratio(best) / r)) ? a : best), ASPECTS[0]);
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

  const accept = async (file?: File) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    const problem = await checkVideo(file, previewUrl);
    if (problem) {
      URL.revokeObjectURL(previewUrl);
      return toast(problem, "error");
    }
    onChange({ file, previewUrl });
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
          over && "border-chakra-400 bg-chakra-500/10",
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
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-chakra-500/15 text-chakra-400 transition group-hover:bg-chakra-500 group-hover:text-white">
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

  const accept = async (files: File[]) => {
    const next = max === 1 ? [] : [...value];
    let added = 0;
    for (const file of files.slice(0, max - next.length)) {
      const previewUrl = URL.createObjectURL(file);
      const problem = await checkImage(file, previewUrl);
      if (problem) {
        URL.revokeObjectURL(previewUrl);
        toast(problem, "error");
        continue;
      }
      next.push({ file, previewUrl });
      added++;
    }
    if (added) onChange(next.slice(0, max));
  };
  const { over, handlers } = useDrop(accept, disabled);
  const single = max === 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{label}</span>
        {!single && <span className="font-mono text-[10px] text-white/40">{value.length}/{max}</span>}
      </div>
      <div {...handlers} className={cn("grid gap-2 rounded-2xl transition", single ? "grid-cols-1" : "grid-cols-4", over && "ring-2 ring-chakra-400")}>
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
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-chakra-500/15 text-chakra-400 transition group-hover:bg-chakra-500 group-hover:text-white">
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
