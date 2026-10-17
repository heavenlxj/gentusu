import { MOTION_LIBRARY, type ModeId } from "./site";

export interface VideoTemplate {
  slug: string;
  title: string;
  description: string;
  category: string;
  modes: ModeId[];
  video: string;
  poster: string;
  seconds: number;
  width: number;
  height: number;
  audio: boolean;
  /**
   * 该模板的配乐（只有无音轨的模板才有；有音轨的模板用自带原声）。
   * 从 video 的 URL 推导：<base>/templates/<cat>/<slug>.mp4 → <base>/templates/bgm/<cat>/<slug>.m4a
   */
  soundtrack: string | null;
}

/** 由模板视频地址推导配乐地址——不依赖额外清单字段，templates.json 不用改 */
const soundtrackOf = (t: { slug: string; video: string; audio: boolean }): string | null => {
  if (t.audio) return null; // 自带音轨，不叠配乐
  const m = /^(.*)\/templates\/([^/]+)\/([^/]+)\.mp4$/.exec(t.video);
  return m ? `${m[1]}/templates/bgm/${m[2]}/${m[3]}.m4a` : null;
};

export const TEMPLATE_CATEGORIES = [
  { id: "trending", label: "Trending" },
  { id: "effects", label: "Viral effects" },
  { id: "action", label: "Action" },
  { id: "edits", label: "Aura edits" },
  { id: "camera", label: "Camera moves" },
  { id: "featured", label: "Classics" },
] as const;

const ALL_MODES: ModeId[] = ["motion-transfer", "character-swap", "outfit-swap", "object-swap", "background-swap", "restyle", "face-swap"];

const FEATURED: VideoTemplate[] = MOTION_LIBRARY.map((m) => ({
  slug: m.id,
  title: m.name,
  description: "",
  category: "featured",
  modes: ALL_MODES,
  video: m.url,
  poster: m.poster,
  // 实测参数，不要写死 0 / 16:9 —— 卡片要显示真实时长和分辨率
  seconds: m.seconds,
  width: m.width,
  height: m.height,
  audio: m.audio,
  soundtrack: null,
}));

/** 声音选项：静音模板给「模板配乐 + 静音」，其余沿用 mode 自带选项（Original / Silent）。
 *  让用户不用自己判断"这个模板有没有声音"——默认就选对。 */
export function soundChoicesFor(t: VideoTemplate | null, fallback: { value: string; label: string; sub?: string }[]) {
  if (t?.soundtrack) {
    return [
      { value: "bgm", label: "Soundtrack", sub: "Included" },
      { value: "mute", label: "Silent", sub: "No audio" },
    ];
  }
  return fallback;
}

/** 选中模板时应该落到哪个声音选项 */
export const defaultSoundFor = (t: VideoTemplate | null) =>
  t?.soundtrack ? "bgm" : "keep";

let cache: Promise<VideoTemplate[]> | null = null;

/** 模板清单随构建打包（R2 上的 templates/manifest.json 是同一份），按需懒加载 */
export function loadTemplates() {
  cache ??= import("@/data/templates.json").then((m) => {
    const baked = (m.default.templates as Omit<VideoTemplate, "soundtrack">[]).map((t) => ({ ...t, soundtrack: soundtrackOf(t) }));
    return [...baked, ...FEATURED];
  });
  return cache;
}
