import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, Coins, Download, Library, Loader2, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { MODES, MOTION_LIBRARY, CONFIG, estimateCredits, getMode, type ModeId } from "@/config/site";
import { useStudioGeneration, type Asset, type Phase } from "@/hooks/useStudioGeneration";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Segmented } from "@/components/ui/Segmented";
import { ImageDrop, VideoDrop, readVideoDuration } from "./MediaDrop";
import { CompareSlider } from "./CompareSlider";
import { ChakraRing } from "./ChakraRing";
import { cn } from "@/lib/cn";

const defaultsOf = (id: ModeId) => Object.fromEntries(getMode(id).options.map((o) => [o.key, o.default]));

interface StudioProps {
  initialMode?: ModeId;
  routeOnSwitch?: boolean;
}

export function Studio({ initialMode = "motion-transfer", routeOnSwitch = false }: StudioProps) {
  const navigate = useNavigate();
  const [modeId, setModeId] = useState<ModeId>(initialMode);
  const mode = getMode(modeId);
  const [video, setVideo] = useState<Asset | null>(null);
  const [duration, setDuration] = useState(0);
  const [images, setImages] = useState<Asset[]>([]);
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState(0);
  const [options, setOptions] = useState<Record<string, string>>(defaultsOf(initialMode));
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { phase, progress, error, result, generate, reset } = useStudioGeneration();
  const { user, credits, openAuth, spendDemoCredits } = useAuth();
  const toast = useToast();

  useEffect(() => setModeId(initialMode), [initialMode]);

  useEffect(() => {
    setOptions(defaultsOf(modeId));
    setImages((imgs) => imgs.slice(0, getMode(modeId).images.max));
    setPrompt("");
    setPreset(0);
    setLibraryOpen(false);
    reset();
  }, [modeId, reset]);

  useEffect(() => {
    if (!video) return setDuration(0);
    readVideoDuration(video.previewUrl).then(setDuration);
  }, [video]);

  const busy = phase === "uploading" || phase === "queued" || phase === "rendering";
  const maxSec = mode.maxSeconds(options);
  const tooLong = duration > maxSec + 0.5;
  const cost = useMemo(() => estimateCredits(mode, options, duration), [mode, options, duration]);
  const finalPrompt = mode.id === "restyle" ? [mode.presets?.[preset]?.prompt, prompt].filter(Boolean).join(", ") : prompt;
  const missing =
    !video ? "Add a video" : images.length < mode.images.min ? `Add ${mode.images.label.toLowerCase()}` : mode.prompt?.required && !prompt.trim() ? "Describe the change" : null;

  const switchMode = (id: ModeId) => {
    if (busy) return;
    if (routeOnSwitch) navigate(`/${id}`);
    else setModeId(id);
  };

  const onGenerate = async () => {
    if (missing) return toast(missing, "error");
    if (tooLong) return toast(`Trim your clip to ${maxSec}s or less for ${mode.name}`, "error");
    if (!user) return openAuth();
    if (CONFIG.demoMode && credits < cost) {
      toast("Not enough credits — grab a pack to keep going", "error");
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    try {
      await generate({ mode, video: video!, images, prompt: finalPrompt, options });
      if (CONFIG.demoMode) spendDemoCredits(cost);
    } catch (e: any) {
      if (e?.code === "AUTH_REQUIRED") openAuth();
    }
  };

  const pickLibrary = (url: string) => {
    setVideo({ previewUrl: url, remoteUrl: url });
    setLibraryOpen(false);
  };

  const imageBlock = mode.images.max > 0 && (
    <ImageDrop label={mode.images.label} hint={mode.images.hint} max={mode.images.max} value={images} onChange={setImages} disabled={busy} />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[440px_minmax(0,1fr)]">
      <div className="card space-y-6 p-5 sm:p-6">
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => switchMode(m.id)}
              className={cn(
                "flex flex-none items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition",
                m.id === modeId ? "border-chakra-500 bg-chakra-500 text-white" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white",
              )}
            >
              <span className="font-jp text-base leading-none">{m.kanji}</span>
              {m.name}
            </button>
          ))}
        </div>

        <div>
          <p className="font-display text-xl font-bold">{mode.tagline}</p>
          <p className="mt-1 text-sm text-white/55">{mode.description}</p>
        </div>

        {mode.id === "motion-transfer" && imageBlock}

        <VideoDrop
          label={mode.video.label}
          hint={mode.video.hint}
          value={video}
          duration={duration}
          onChange={setVideo}
          disabled={busy}
          extra={
            mode.video.library ? (
              <button type="button" onClick={() => setLibraryOpen((o) => !o)} className="flex items-center gap-1 text-[11px] font-semibold text-spirit hover:text-white">
                <Library className="h-3.5 w-3.5" /> Motion library
              </button>
            ) : null
          }
        />

        {libraryOpen && (
          <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto rounded-2xl border border-white/10 bg-ink-900 p-2">
            {MOTION_LIBRARY.map((m) => (
              <button key={m.id} type="button" onClick={() => pickLibrary(m.url)} className={cn("group relative aspect-[9/16] overflow-hidden rounded-xl border-2", video?.previewUrl === m.url ? "border-spirit" : "border-transparent")}>
                <video
                  src={m.url}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => e.currentTarget.pause()}
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950 to-transparent p-1 text-[9px] font-semibold">{m.name}</span>
              </button>
            ))}
          </div>
        )}

        {mode.id !== "motion-transfer" && imageBlock}

        {mode.presets && (
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">{mode.id === "restyle" ? "Style" : "Quick start"}</p>
            <div className="flex flex-wrap gap-1.5">
              {mode.presets.map((p, i) => {
                const active = mode.id === "restyle" ? preset === i : prompt === p.prompt;
                return (
                  <button
                    key={p.label}
                    type="button"
                    disabled={busy}
                    onClick={() => (mode.id === "restyle" ? setPreset(i) : setPrompt(p.prompt))}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active ? "border-spirit bg-spirit/10 text-spirit" : "border-white/10 text-white/65 hover:border-white/30",
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode.prompt && (
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
              {mode.prompt.label} {mode.prompt.required && <span className="text-chakra-400">*</span>}
            </p>
            <textarea
              value={prompt}
              disabled={busy}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode.prompt.placeholder}
              rows={3}
              maxLength={1000}
              className="w-full resize-none rounded-2xl border border-white/10 bg-ink-900 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-chakra-500"
            />
          </div>
        )}

        {mode.options.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(mode.options.length, 3)}, minmax(0, 1fr))` }}>
            {mode.options.map((o) => (
              <div key={o.key}>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">{o.label}</p>
                <Segmented value={options[o.key]} disabled={busy} onChange={(v) => setOptions((s) => ({ ...s, [o.key]: v }))} options={o.choices} />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-ink-900/80 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/60">
              <Coins className="h-4 w-4 text-chakra-400" />
              {duration ? `${Math.min(duration, maxSec).toFixed(1)}s billed` : "Estimated cost"}
            </span>
            <span>
              <b className="font-display text-2xl">{cost}</b>
              <span className="ml-1 text-white/50">credits</span>
            </span>
          </div>
          {tooLong && (
            <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <AlertTriangle className="h-4 w-4 flex-none" /> {mode.name} supports up to {maxSec}s — trim your clip first.
            </p>
          )}
          <button type="button" onClick={onGenerate} disabled={busy || !!missing} className="btn-primary w-full py-4 text-base">
            {busy ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Casting the illusion…
              </>
            ) : (
              <>
                <Wand2 className="h-5 w-5" /> {missing ?? (user ? `Cast ${mode.name}` : "Sign in & cast")}
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-white/40">
            {user ? `Balance: ${credits} credits · ` : "Free credits for new accounts · "}Failed renders are refunded.
          </p>
        </div>
      </div>

      <Canvas
        phase={phase}
        progress={progress}
        error={error}
        modeCover={mode.cover}
        modeName={mode.name}
        source={video?.previewUrl}
        character={images[0]?.previewUrl}
        resultUrl={result?.videoUrl}
        onReset={reset}
        onDownload={() => (result?.videoUrl ? window.open(result.videoUrl, "_blank", "noopener") : toast("Demo render — connect kinkora for a real MP4"))}
      />
    </div>
  );
}

const STEPS: { key: Phase; label: string }[] = [
  { key: "uploading", label: "Uploading footage" },
  { key: "queued", label: "Tracking pose & camera" },
  { key: "rendering", label: "Weaving the illusion" },
  { key: "done", label: "Temporal pass" },
];

interface CanvasProps {
  phase: Phase;
  progress: number;
  error: string | null;
  modeCover: string;
  modeName: string;
  source?: string;
  character?: string;
  resultUrl?: string;
  onReset: () => void;
  onDownload: () => void;
}

function Canvas({ phase, progress, error, modeCover, modeName, source, character, resultUrl, onReset, onDownload }: CanvasProps) {
  const busy = phase === "uploading" || phase === "queued" || phase === "rendering";
  const order = STEPS.map((s) => s.key).indexOf(phase);

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      <div className="grain relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-ink-900 shadow-chakra sm:aspect-video lg:aspect-[4/3.4]">
        <div className="grid-bg absolute inset-0" />

        {phase === "done" && resultUrl && source ? (
          <CompareSlider before={source} after={resultUrl} className="absolute inset-0 h-full w-full" />
        ) : phase === "done" && resultUrl ? (
          <video src={resultUrl} className="absolute inset-0 h-full w-full object-contain" controls autoPlay loop playsInline />
        ) : source ? (
          <video src={source} className={cn("absolute inset-0 h-full w-full object-contain transition", busy && "scale-[1.02] blur-[2px] saturate-150")} autoPlay muted loop playsInline />
        ) : (
          <>
            <video src={modeCover} className="absolute inset-0 h-full w-full object-cover opacity-60" autoPlay muted loop playsInline />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white/70 backdrop-blur">Example · {modeName}</span>
              <p className="mt-3 max-w-sm font-display text-2xl font-bold">Drop your footage on the left to begin.</p>
            </div>
          </>
        )}

        {character && phase !== "done" && (
          <div className="absolute bottom-4 left-4 z-10 w-20 overflow-hidden rounded-xl border-2 border-white/70 shadow-2xl">
            <img src={character} alt="" className="aspect-[3/4] w-full object-cover" />
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink-950/50">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 animate-scan bg-gradient-to-b from-transparent via-chakra-500/20 to-transparent" />
            <ChakraRing className="h-28 w-28" progress={progress} />
            <p className="mt-4 font-display text-3xl font-bold">{Math.round(progress * 100)}%</p>
            <ul className="mt-4 space-y-1.5">
              {STEPS.map((s, i) => (
                <li key={s.key} className={cn("flex items-center gap-2 text-xs", i < order ? "text-white/70" : i === order ? "text-white" : "text-white/30")}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", i < order ? "bg-spirit" : i === order ? "animate-pulse bg-chakra-500" : "bg-white/20")} />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {phase === "done" && !resultUrl && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink-950/70 text-center">
            <Sparkles className="h-8 w-8 text-spirit" />
            <p className="mt-3 font-display text-2xl font-bold">Demo render complete</p>
            <p className="mt-1 text-sm text-white/60">Connect the kinkora backend to receive the real video.</p>
          </div>
        )}
      </div>

      {phase === "done" && (
        <div className="mt-4 flex animate-rise flex-wrap justify-center gap-3">
          <button type="button" onClick={onDownload} className="btn-primary">
            <Download className="h-4 w-4" /> Download MP4
          </button>
          <button type="button" onClick={onReset} className="btn-ghost">
            <RotateCcw className="h-4 w-4" /> New cast
          </button>
        </div>
      )}

      {phase === "error" && (
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-100">
          <p className="font-semibold">Render failed</p>
          <p className="mt-1 text-red-100/70">{error}</p>
          <button type="button" onClick={onReset} className="mt-2 text-xs font-semibold underline underline-offset-4">Try again</button>
        </div>
      )}
    </div>
  );
}
