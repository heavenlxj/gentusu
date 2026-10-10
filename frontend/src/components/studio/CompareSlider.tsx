import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { MoveHorizontal } from "lucide-react";
import { SoundButton, useSound } from "@/components/ui/Sound";
import { cn } from "@/lib/cn";

interface CompareSliderProps {
  before: string;
  after: string;
  poster?: string;
  beforePoster?: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  style?: CSSProperties;
  /** "auto": always playing · "hover": first frame until hovered · "inview": plays while on screen */
  play?: "auto" | "hover" | "inview";
  /** Enables the sound toggle; the soundtrack comes from the "after" clip. */
  soundId?: string;
}

export function CompareSlider({
  before,
  after,
  poster,
  beforePoster,
  beforeLabel = "Original",
  afterLabel = "Result",
  className,
  style,
  play = "auto",
  soundId,
}: CompareSliderProps) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);
  const sound = useSound(soundId ?? `compare-${after}`);

  useEffect(() => {
    const a = afterRef.current;
    const b = beforeRef.current;
    if (!a || !b) return;
    const sync = () => {
      if (Math.abs(a.currentTime - b.currentTime) > 0.15) b.currentTime = a.currentTime;
    };
    a.addEventListener("timeupdate", sync);
    return () => a.removeEventListener("timeupdate", sync);
  }, [before, after]);

  const setPlaying = useCallback((on: boolean) => {
    for (const v of [afterRef.current, beforeRef.current]) {
      if (!v) continue;
      if (on) v.play().catch(() => {});
      else v.pause();
    }
  }, []);

  useEffect(() => {
    if (play !== "inview" || !box.current) return;
    const io = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), { threshold: 0.35 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [play, setPlaying]);

  useEffect(() => {
    if (sound.on) setPlaying(true);
  }, [sound.on, setPlaying]);

  const move = useCallback((clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onDown = (e: PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    move(e.clientX);
  };

  const shared = {
    autoPlay: play === "auto",
    loop: true,
    playsInline: true,
    preload: play === "auto" ? "auto" : play === "inview" ? "metadata" : "none",
  } as const;

  return (
    <div
      ref={box}
      className={cn("relative select-none overflow-hidden bg-black", dragging ? "cursor-grabbing" : "cursor-ew-resize", className)}
      style={style}
      onPointerDown={onDown}
      onPointerMove={(e) => dragging && move(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onMouseEnter={() => play === "hover" && setPlaying(true)}
      onMouseLeave={() => play === "hover" && !sound.on && setPlaying(false)}
    >
      <video ref={afterRef} src={after} poster={poster} muted={!soundId || !sound.on} className="absolute inset-0 h-full w-full object-cover" {...shared} />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <video ref={beforeRef} src={before} poster={beforePoster} muted className="h-full w-full object-cover" {...shared} />
      </div>

      <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-950 shadow-lg">
          <MoveHorizontal className="h-4 w-4" />
        </div>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-ink-950/70 px-2.5 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-chakra-500 px-2.5 py-1 text-[11px] font-medium text-white">
        {afterLabel}
      </span>
      {soundId && <SoundButton on={sound.on} onToggle={sound.toggle} className="absolute bottom-3 right-3" />}
    </div>
  );
}
