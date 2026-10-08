import { cn } from "@/lib/cn";

export function ChakraRing({ className, spinning = true, progress }: { className?: string; spinning?: boolean; progress?: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative", className)}>
      <div className={cn("absolute inset-0 rounded-full border border-chakra-500/30", spinning && "animate-pulsering")} />
      <svg viewBox="0 0 100 100" className={cn("absolute inset-0", spinning && "animate-spin3")}>
        <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,31,75,.25)" strokeWidth="1" strokeDasharray="2 4" />
        {[0, 120, 240].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 50)`}>
            <path d="M50 14 a7 7 0 1 1 -0.1 0 z" fill="#ff1f4b" />
            <path d="M50 14 q12 2 14 14" fill="none" stroke="#ff1f4b" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
        {progress !== undefined && (
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#7cf7ff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            className="transition-[stroke-dashoffset] duration-500"
          />
        )}
      </svg>
      <div className="absolute inset-[38%] rounded-full bg-chakra-500 shadow-glow" />
    </div>
  );
}
