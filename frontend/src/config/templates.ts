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
}

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
  seconds: 0,
  width: 16,
  height: 9,
  audio: false,
}));

let cache: Promise<VideoTemplate[]> | null = null;

/** 模板清单随构建打包（R2 上的 templates/manifest.json 是同一份），按需懒加载 */
export function loadTemplates() {
  cache ??= import("@/data/templates.json").then((m) => [...(m.default.templates as VideoTemplate[]), ...FEATURED]);
  return cache;
}
