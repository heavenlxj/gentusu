import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

interface CompareSliderProps {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  autoSweep?: boolean;
}

export function CompareSlider({ before, after, beforeLabel = "Original", afterLabel = "Genjutsu", className, autoSweep = false }: CompareSliderProps) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLVideoElement>(null);
  const afterRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!autoSweep || touched) return;
    let t = 0;
    const id = window.setInterval(() => {
      t += 0.03;
      setPos(50 + Math.sin(t) * 32);
    }, 30);
    return () => window.clearInterval(id);
  }, [autoSweep, touched]);

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

  const move = useCallback((clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const onDown = (e: PointerEvent) => {
    setDragging(true);
    setTouched(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    move(e.clientX);
  };

  return (
    <div
      ref={box}
      className={cn("relative select-none overflow-hidden bg-ink-900", dragging ? "cursor-grabbing" : "cursor-ew-resize", className)}
      onPointerDown={onDown}
      onPointerMove={(e) => dragging && move(e.clientX)}
      onPointerUp={() => setDragging(false)}
    >
      <video ref={afterRef} src={after} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <video ref={beforeRef} src={before} className="h-full w-full object-cover" autoPlay muted loop playsInline />
      </div>

      <div className="pointer-events-none absolute inset-y-0 z-10 w-px bg-white/90 shadow-[0_0_20px_rgba(124,247,255,.9)]" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-ink-950/70 backdrop-blur">
          <MoveHorizontal className="h-4 w-4 text-spirit" />
        </div>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-ink-950/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/80 backdrop-blur">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-chakra-500 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
        {afterLabel}
      </span>
    </div>
  );
}
