import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Check, Coins, LayoutGrid, Loader2, Play, Wand2 } from "lucide-react";
import { MODES, CONFIG, FREE_TRIAL, billableSeconds, estimateCredits, getMode, type Mode, type ModeId } from "@/config/site";
import type { VideoTemplate } from "@/config/templates";
import { useStudioGeneration, type Asset, type Phase } from "@/hooks/useStudioGeneration";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Segmented } from "@/components/ui/Segmented";
import { ImageDrop, VideoDrop, nearestAspect, readVideoMeta } from "./MediaDrop";
import { CompareSlider } from "./CompareSlider";
import { TemplatePicker } from "./TemplatePicker";
import { cn } from "@/lib/cn";

const defaultsOf = (id: ModeId) => Object.fromEntries(getMode(id).options.map((o) => [o.key, o.default]));
const absolute = (path: string) => new URL(path, window.location.origin).href;
const asset = (path: string, poster?: string): Asset => ({ previewUrl: path, remoteUrl: absolute(path), poster: poster && absolute(poster) });

interface StudioProps {
  initialMode?: ModeId;
  routeOnSwitch?: boolean;
  title: React.ReactNode;
  subtitle: string;
}

export function Studio({ initialMode = "motion-transfer", routeOnSwitch = false, title, subtitle }: StudioProps) {
  const navigate = useNavigate();
  const [modeId, setModeId] = useState<ModeId>(initialMode);
  const mode = getMode(modeId);
  const [video, setVideo] = useState<Asset | null>(null);
  const [duration, setDuration] = useState(0);
  const [aspect, setAspect] = useState("16:9");
  const [images, setImages] = useState<Asset[]>([]);
  const [prompt, setPrompt] = useState("");
  const [preset, setPreset] = useState(0);
  const [options, setOptions] = useState<Record<string, string>>(defaultsOf(initialMode));
  const [libraryOpen, setLibraryOpen] = useState(false);
  const { phase, error, generate, reset } = useStudioGeneration();
  const { user, credits, billing, openAuth, spendDemoCredits, refreshCredits } = useAuth();
  const toast = useToast();
  const subscribed = !!billing.subscription;
  const toPricing = () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => setModeId(initialMode), [initialMode]);

  useEffect(() => {
    setOptions(defaultsOf(modeId));
    setVideo(null);
    setImages([]);
    setPrompt("");
    setPreset(0);
    setLibraryOpen(false);
    reset();
  }, [modeId, reset]);

  useEffect(() => {
    if (!video) return setDuration(0);
    readVideoMeta(video.previewUrl).then((m) => {
      setDuration(m.duration);
      setAspect(nearestAspect(m.width, m.height));
    });
  }, [video]);

  const busy = phase === "uploading" || phase === "queued";
  const maxSec = mode.maxSeconds;
  const tooLong = duration > maxSec;
  const cost = useMemo(() => estimateCredits(mode, options, duration), [mode, options, duration]);
  const finalPrompt = mode.id === "restyle" ? [mode.presets?.[preset]?.prompt, prompt.trim()].filter(Boolean).join(", ") : prompt.trim();
  const usingExample = video?.previewUrl === mode.example.before;
  const missing =
    !video ? "Add a video" : images.length < mode.images.min ? `Add ${mode.images.label.toLowerCase()}` : mode.prompt?.required && !prompt.trim() ? "Describe the change" : null;

  const switchMode = (id: ModeId) => {
    if (busy || id === modeId) return;
    if (routeOnSwitch) navigate(`/${id}`);
    else setModeId(id);
  };

  const loadExample = () => {
    if (busy) return;
    reset();
    const ex = mode.example;
    setVideo(asset(ex.before, ex.beforePoster));
    setImages(ex.images.map((src) => asset(src)));
    setPrompt(ex.prompt ?? "");
    setPreset(ex.preset ?? 0);
    setLibraryOpen(false);
  };

  const onGenerate = async () => {
    if (missing) return toast(missing, "error");
    if (tooLong) return toast(`Trim your clip to ${maxSec}s or less for ${mode.name}`, "error");
    if (!user) return openAuth();
    if (credits < cost) {
      toast(
        subscribed
          ? "Not enough credits — top up with a credit pack"
          : `Your free credits cover a ${FREE_TRIAL.seconds}s ${FREE_TRIAL.resolution} clip — trim your video or pick a plan`,
        "error",
      );
      return toPricing();
    }
    try {
      const id = await generate({
        mode,
        video: video!,
        images,
        prompt: finalPrompt,
        options: { ...options, aspect },
        seconds: billableSeconds(mode, duration),
        demoOutput: mode.example.after,
      });
      if (CONFIG.demoMode) spendDemoCredits(cost);
      refreshCredits();
      toast("Rendering started — it keeps going even if you leave", "success");
      navigate(`/library?new=${encodeURIComponent(id)}`);
    } catch (e: any) {
      if (e?.code === "AUTH_REQUIRED") openAuth();
      if (e?.code === "INSUFFICIENT_CREDITS") {
        toast(subscribed ? "Not enough credits — top up with a credit pack" : "Not enough credits — pick a plan to keep going", "error");
        toPricing();
      }
      if (e?.code === "TOO_MANY_RUNNING") {
        toast(e.message, "info");
        navigate("/library");
      }
    }
  };

  const setOption = (key: string, value: string) => {
    if (key === "resolution" && value !== "480p" && !subscribed && !CONFIG.demoMode) {
      toast("HD is included with every plan", "info");
      return toPricing();
    }
    setOptions((s) => ({ ...s, [key]: value }));
  };

  const pickTemplate = (t: VideoTemplate) => {
    if (busy) return;
    reset();
    setVideo(asset(t.video, t.poster));
    setLibraryOpen(false);
  };

  const imageBlock = mode.images.max > 0 && (
    <ImageDrop label={mode.images.label} hint={mode.images.hint} max={mode.images.max} value={images} onChange={setImages} disabled={busy} />
  );
  const videoBlock = (
    <VideoDrop
      label={mode.video.label}
      hint={mode.video.hint}
      value={video}
      duration={duration}
      onChange={setVideo}
      disabled={busy}
      extra={
        <button
          type="button"
          disabled={busy}
          onClick={() => setLibraryOpen((o) => !o)}
          className="flex items-center gap-1 text-[11px] font-semibold text-chakra-300 hover:text-white"
        >
          <LayoutGrid className="h-3.5 w-3.5" /> {libraryOpen ? "Hide templates" : "Browse templates"}
        </button>
      }
    />
  );
  const sideBySide = mode.images.max === 1;

  return (
    <section id="studio" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-24 sm:px-6 sm:pt-28">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-black leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-white/60">{subtitle}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-chakra-500/25 bg-ink-900/90 p-3 shadow-chakra sm:p-4">
        <div className="no-scrollbar grid auto-cols-[minmax(140px,1fr)] grid-flow-col gap-1.5 overflow-x-auto rounded-2xl bg-white/[0.03] p-1.5">
          {MODES.map((m) => {
            const active = m.id === modeId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => switchMode(m.id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                  active ? "bg-chakra-500 text-white" : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <span className={cn("font-jp text-xl leading-none", active ? "text-white" : "text-chakra-400")}>{m.kanji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{m.name}</span>
                  <span className={cn("block truncate text-[11px]", active ? "text-white/75" : "text-white/40")}>{m.tagline}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="space-y-5 p-2 sm:p-3">
            <p className="text-sm text-white/55">{mode.description}</p>

            <button
              type="button"
              onClick={loadExample}
              disabled={busy}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-2 text-left transition",
                usingExample ? "border-chakra-500/60 bg-chakra-500/10" : "border-white/10 hover:border-white/25",
              )}
            >
              <img src={mode.example.beforePoster} alt="" className="h-11 w-16 flex-none rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{usingExample ? "Example inputs loaded" : "Try with the example"}</span>
                <span className="block truncate text-[11px] text-white/45">{mode.example.caption}</span>
              </span>
              {usingExample ? <Check className="mr-2 h-4 w-4 text-chakra-400" /> : <Play className="mr-2 h-4 w-4 text-white/50" />}
            </button>

            <div className={cn("grid gap-3", sideBySide && "sm:grid-cols-2")}>
              {mode.id === "motion-transfer" ? (
                <>
                  {imageBlock}
                  {videoBlock}
                </>
              ) : (
                <>
                  {videoBlock}
                  {imageBlock}
                </>
              )}
            </div>

            {libraryOpen && <TemplatePicker modeId={mode.id} selected={video?.previewUrl} onPick={pickTemplate} />}

            {mode.presets && (
              <div>
                <p className="mb-2 text-xs text-white/50">{mode.id === "restyle" ? "Style" : "Quick start"}</p>
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
                          active ? "border-chakra-500 bg-chakra-500/15 text-white" : "border-white/10 text-white/65 hover:border-white/30",
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
                <p className="mb-2 text-xs text-white/50">
                  {mode.prompt.label} {mode.prompt.required && <span className="text-chakra-400">*</span>}
                </p>
                <textarea
                  value={prompt}
                  disabled={busy}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode.prompt.placeholder}
                  rows={2}
                  maxLength={1000}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-ink-950/60 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-chakra-500"
                />
              </div>
            )}

            {mode.options.length > 0 && (
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(mode.options.length, 3)}, minmax(0, 1fr))` }}>
                {mode.options.map((o) => (
                  <div key={o.key}>
                    <p className="mb-1.5 text-xs text-white/50">{o.label}</p>
                    <Segmented
                      value={options[o.key]}
                      disabled={busy}
                      onChange={(v) => setOption(o.key, v)}
                      options={o.choices.map((c) => ({
                        ...c,
                        locked: o.key === "resolution" && c.value !== "480p" && !subscribed && !CONFIG.demoMode,
                      }))}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              {tooLong && (
                <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 flex-none" /> {mode.name} supports up to {maxSec}s — trim your clip first.
                </p>
              )}
              <button type="button" onClick={onGenerate} disabled={busy || !!missing} className="btn-primary w-full py-4 text-lg">
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> {phase === "uploading" ? "Uploading…" : "Submitting…"}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" /> {missing ?? (user ? `Generate ${mode.name}` : "Sign in & generate")}
                    {!missing && (
                      <span className="ml-1 flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-sm">
                        <Coins className="h-3.5 w-3.5" /> {cost}
                      </span>
                    )}
                  </>
                )}
              </button>
              <p className="mt-2.5 text-center text-[11px] text-white/40">
                {duration ? `${billableSeconds(mode, duration)}s billed · ` : ""}
                {user ? `Balance: ${credits} credits · ` : ""}Credits are held while rendering · failed renders are refunded
              </p>
            </div>
          </div>

          <Canvas
            mode={mode}
            phase={phase}
            error={error}
            source={video?.previewUrl}
            character={images[0]?.previewUrl}
            onReset={reset}
          />
        </div>
      </div>
    </section>
  );
}

const STEPS: { key: Phase; label: string }[] = [
  { key: "uploading", label: "Uploading footage" },
  { key: "queued", label: "Queuing the render" },
];

interface CanvasProps {
  mode: Mode;
  phase: Phase;
  error: string | null;
  source?: string;
  character?: string;
  onReset: () => void;
}

function Canvas({ mode, phase, error, source, character, onReset }: CanvasProps) {
  const busy = phase === "uploading" || phase === "queued";
  const order = STEPS.findIndex((s) => s.key === phase);
  const ex = mode.example;

  return (
    <div className="flex flex-col lg:sticky lg:top-24 lg:self-start">
      <div className="relative aspect-video overflow-hidden rounded-[20px] bg-black lg:aspect-[4/3.3]">
        {source ? (
          <video key={source} src={source} className="absolute inset-0 h-full w-full object-contain" autoPlay muted loop playsInline />
        ) : (
          <>
            <CompareSlider
              key={ex.before}
              before={ex.before}
              after={ex.after}
              poster={ex.poster}
              beforePoster={ex.beforePoster}
              soundId="studio-example"
              className="absolute inset-0 h-full w-full"
            />
            <p className="pointer-events-none absolute bottom-3 left-3 right-44 rounded-xl bg-ink-950/70 px-3 py-2 text-xs text-white/75 backdrop-blur">
              <b className="text-white">Example ·</b> {ex.caption}. Drag the handle to compare.
            </p>
          </>
        )}

        {character && (
          <div className="absolute bottom-3 left-3 z-10 w-16 overflow-hidden rounded-xl border-2 border-white/80 shadow-2xl">
            <img src={character} alt="" className="aspect-[4/5] w-full object-cover" />
          </div>
        )}

        {busy && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink-950/75 backdrop-blur-md">
            <Loader2 className="h-10 w-10 animate-spin text-chakra-400" />
            <ul className="mt-5 space-y-1.5">
              {STEPS.map((s, i) => (
                <li key={s.key} className={cn("flex items-center gap-2 text-xs", i < order ? "text-white/60" : i === order ? "text-white" : "text-white/30")}>
                  {i < order ? <Check className="h-3.5 w-3.5 text-chakra-400" /> : i === order ? <Loader2 className="h-3.5 w-3.5 animate-spin text-chakra-400" /> : <span className="h-3.5 w-3.5" />}
                  {s.label}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] text-white/40">Next: track the render in My videos</p>
          </div>
        )}
      </div>

      {phase === "error" && (
        <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-100">
          <p className="font-semibold">Couldn't start the render</p>
          <p className="mt-1 text-red-100/70">{error}</p>
          <button type="button" onClick={onReset} className="mt-2 text-xs font-semibold underline underline-offset-4">Try again</button>
        </div>
      )}
    </div>
  );
}
