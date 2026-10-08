import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG, type Mode } from "@/config/site";
import { extractVideoUrl, kinkora } from "@/lib/kinkora";

export type Phase = "idle" | "uploading" | "queued" | "rendering" | "done" | "error";

export interface Asset {
  file?: File;
  previewUrl: string;
  remoteUrl?: string;
}

export interface StudioJob {
  mode: Mode;
  video: Asset;
  images: Asset[];
  prompt: string;
  options: Record<string, string>;
}

export interface StudioResult {
  videoUrl?: string;
  sourceUrl: string;
  modeId: string;
  createdAt: number;
}

export function useStudioGeneration() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StudioResult | null>(null);
  const poller = useRef<number | null>(null);
  const ticker = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (poller.current) window.clearInterval(poller.current);
    if (ticker.current) window.clearInterval(ticker.current);
    poller.current = null;
    ticker.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const reset = useCallback(() => {
    stop();
    setPhase("idle");
    setProgress(0);
    setError(null);
    setResult(null);
  }, [stop]);

  const resolve = async (asset: Asset, kind: "images" | "videos") => {
    if (asset.remoteUrl) return asset.remoteUrl;
    if (!asset.file) return asset.previewUrl;
    return kinkora.upload(asset.file, kind);
  };

  const generate = useCallback(
    async ({ mode, video, images, prompt, options }: StudioJob) => {
      stop();
      setError(null);
      setResult(null);
      setProgress(0.02);
      setPhase("uploading");

      try {
        const [videoUrl, ...imageUrls] = await Promise.all([resolve(video, "videos"), ...images.map((i) => resolve(i, "images"))]);
        setProgress(0.08);
        setPhase("queued");

        const taskId = await kinkora.submitVideo({
          providerId: mode.providerId,
          modelId: mode.resolveModel(options),
          params: mode.buildParams({ video: videoUrl, images: imageUrls, prompt, options }),
          demoOutput: mode.demoResult,
        });

        const startedAt = Date.now();
        const etaMs = (CONFIG.demoMode ? 12 : mode.etaSeconds) * 1000;
        ticker.current = window.setInterval(() => {
          const t = (Date.now() - startedAt) / etaMs;
          setProgress((p) => Math.max(p, Math.min(0.94, 0.1 + t * 0.84)));
        }, 400);

        const poll = async () => {
          try {
            const state = await kinkora.getTask(taskId, mode.providerId);
            if (state.status === "processing") setPhase("rendering");
            if (state.status === "succeeded") {
              stop();
              setProgress(1);
              setResult({ videoUrl: extractVideoUrl(state.output), sourceUrl: video.previewUrl, modeId: mode.id, createdAt: Date.now() });
              setPhase("done");
            } else if (["failed", "canceled", "error", "timeout"].includes(state.status)) {
              stop();
              setError(state.error || "The render failed. Your credits were returned.");
              setPhase("error");
            }
          } catch (e) {
            stop();
            setError(e instanceof Error ? e.message : "Lost connection to the render queue");
            setPhase("error");
          }
        };
        poll();
        poller.current = window.setInterval(poll, CONFIG.demoMode ? 1000 : 4000);
      } catch (e) {
        stop();
        setError(e instanceof Error ? e.message : "Something went wrong");
        setPhase("error");
        throw e;
      }
    },
    [stop],
  );

  return { phase, progress, error, result, generate, reset };
}
