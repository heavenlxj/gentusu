import type { GenerationMeta } from "@/lib/kinkora";
import type { Mode } from "@/config/site";

export interface MetaInput {
  mode: Mode;
  seconds: number;
  options: Record<string, string>;
  poster?: string;
  thumbs: string[];
  template?: { slug: string; soundtrack: string | null } | null;
}

/**
 * 构造提交给后端的 meta。
 *
 * 关键规则：只有用户选了「模板配乐」(sound=bgm) 且模板确实有配乐时，
 * 才把 soundtrack 地址带上去。Silent / 原声 一律不带，
 * 后端就不会去混音（避免静音选项被配乐覆盖）。
 */
export function buildGenerationMeta({ mode, seconds, options, poster, thumbs, template }: MetaInput): GenerationMeta {
  const useBgm = options.sound === "bgm" && !!template?.soundtrack;
  return {
    mode: mode.id,
    title: mode.name,
    seconds,
    resolution: options.resolution,
    aspect: options.aspect,
    poster,
    thumbs,
    template: template?.slug,
    soundtrack: useBgm ? template!.soundtrack! : undefined,
    sound: options.sound,
  };
}
