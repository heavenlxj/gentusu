import { useCallback, useState } from "react";
import type { Mode } from "@/config/site";
import { kinkora } from "@/lib/kinkora";
import { buildGenerationMeta } from "@/lib/generationMeta";

export type Phase = "idle" | "uploading" | "queued" | "error";

export interface Asset {
  file?: File;
  previewUrl: string;
  remoteUrl?: string;
  poster?: string;
}

export interface StudioJob {
  mode: Mode;
  video: Asset;
  images: Asset[];
  prompt: string;
  options: Record<string, string>;
  seconds: number;
  demoOutput?: string;
  /** 从模板库选的模板（带上 slug 和配乐，后端 finalize 要用） */
  template?: { slug: string; soundtrack: string | null } | null;
}

const isRemote = (url?: string) => !!url && !url.startsWith("blob:");

/** 只负责上传 + 提交；渲染在后台进行，进度在结果库查看 */
export function useStudioGeneration() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  const resolve = async (asset: Asset, kind: "images" | "videos") => {
    if (asset.remoteUrl) return asset.remoteUrl;
    if (!asset.file) return asset.previewUrl;
    return kinkora.upload(asset.file, kind);
  };

  const generate = useCallback(async ({ mode, video, images, prompt, options, seconds, demoOutput, template }: StudioJob): Promise<string> => {
    setError(null);
    setPhase("uploading");
    try {
      const [videoUrl, ...imageUrls] = await Promise.all([resolve(video, "videos"), ...images.map((i) => resolve(i, "images"))]);
      setPhase("queued");

      // 只有「模板配乐」策略才把配乐地址交给后端；Silent / 原声 都不传
      const meta = buildGenerationMeta({
        mode,
        seconds,
        options,
        poster: isRemote(video.poster) ? video.poster : undefined,
        thumbs: imageUrls.filter(isRemote).slice(0, 2),
        template,
      });

      const id = await kinkora.submitVideo({
        providerId: mode.providerId,
        modelId: mode.modelId,
        params: mode.buildParams({ video: videoUrl, images: imageUrls, prompt, options, seconds }),
        meta,
        demoOutput,
      });
      setPhase("idle");
      return id;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("error");
      throw e;
    }
  }, []);

  return { phase, error, generate, reset };
}
