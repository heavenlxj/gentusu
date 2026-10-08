export const SITE = {
  name: "Genjutsu AI",
  kanji: "幻術",
  domain: "genjutsu.example",
  supportEmail: "support@genjutsu.example",
};

const env = import.meta.env;

export const CONFIG = {
  demoMode: env.VITE_DEMO_MODE !== "false",
  apiBaseUrl: (env.VITE_API_BASE_URL as string | undefined) ?? "https://api.kinkora.fun",
  supabaseUrl: (env.VITE_SUPABASE_URL as string | undefined) ?? "",
  supabaseAnonKey: (env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "",
  showcaseVideoUrl: (env.VITE_SHOWCASE_VIDEO_URL as string | undefined) ?? "",
};

const CDN = "https://storage.conut.ai/public_assets/conut_apps";

export const HERO_DEMO = {
  source: `${CDN}/motion_control_std/input.mp4`,
  result: `${CDN}/motion_control_std/output.mp4`,
  character: `${CDN}/motion_control_std/input.webp`,
};

const PRESET_BASE = `${CDN}/motion_control_presets`;
const PRESET_IDS = [
  "062dcd0d-2b81-4e82-8757-8bb1cd491581",
  "1ad056fe-79aa-4347-afdc-2b4e360fbed1",
  "1c1ad507-fd7e-45eb-8f20-5436d3e3f238",
  "1c4f77b2-0eb4-481a-b415-1765aaf4f866",
  "1f72d445-36d9-4df6-90e2-b09c299b9de9",
  "22287793-7664-4802-b0a3-ba8c0f65f994",
  "23dd378e-e15a-4bf8-9d53-f2ecd5641e9d",
  "289b7f9f-27be-4457-b767-62e4a6aa8b71",
  "459929b4-b2a9-467b-80d2-ab5939cb2654",
  "45d2f4ad-e6db-44d2-81a9-5187ac245eae",
  "46e7c5cb-1791-4419-bb79-da0cf0fabf96",
  "53241da3-ea51-4303-a52c-16cfba8aa94e",
];
export const MOTION_LIBRARY = PRESET_IDS.map((id, i) => ({
  id,
  name: `Move ${String(i + 1).padStart(2, "0")}`,
  url: `${PRESET_BASE}/${id}.mp4`,
}));

export type ModeId = "motion-transfer" | "character-swap" | "object-swap" | "restyle" | "face-swap";

export interface ModeChoice {
  value: string;
  label: string;
  sub?: string;
}

export interface ModeOption {
  key: string;
  label: string;
  choices: ModeChoice[];
  default: string;
}

export interface ModeInput {
  video: string;
  images: string[];
  prompt: string;
  options: Record<string, string>;
}

export interface Mode {
  id: ModeId;
  name: string;
  kanji: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  providerId: string;
  resolveModel: (options: Record<string, string>) => string;
  video: { label: string; hint: string; library?: boolean };
  images: { label: string; hint: string; min: number; max: number };
  prompt?: { label: string; placeholder: string; required?: boolean };
  presets?: { label: string; prompt: string }[];
  options: ModeOption[];
  /** 对外展示的 credits 单价，真实扣费以 kinkora 定价为准 */
  creditsPerSecond: (options: Record<string, string>) => number;
  minSeconds: number;
  maxSeconds: (options: Record<string, string>) => number;
  etaSeconds: number;
  cover: string;
  demoResult?: string;
  buildParams: (input: ModeInput) => Record<string, unknown>;
}

const STYLE_PRESETS = [
  { label: "Anime", prompt: "hand-drawn 2D anime, clean line art, cel shading, vivid colors" },
  { label: "Claymation", prompt: "stop-motion claymation, plasticine textures, soft studio light" },
  { label: "Cyberpunk", prompt: "neon cyberpunk city at night, rain reflections, magenta and cyan lights" },
  { label: "Live-action", prompt: "photorealistic live-action film, natural skin, 35mm cinematic lighting" },
  { label: "Ink wash", prompt: "Japanese sumi-e ink wash painting, paper texture, minimal palette" },
  { label: "3D toon", prompt: "glossy 3D animated feature film style, soft global illumination" },
];

export const MODES: Mode[] = [
  {
    id: "motion-transfer",
    name: "Motion Transfer",
    kanji: "転",
    tagline: "Make anyone move",
    description: "Upload one character photo and a motion clip. Every step, spin and hand gesture is transferred while face, outfit and style stay locked.",
    seoTitle: "AI Motion Transfer — Make Any Photo Dance",
    seoDescription: "Transfer dance moves, actions and gestures from any reference video onto a character photo. Photoreal, 3D and anime supported.",
    providerId: "wavespeed",
    resolveModel: (o) => (o.quality === "pro" ? "kwaivgi/kling-v2.6-pro/motion-control" : "kwaivgi/kling-v2.6-std/motion-control"),
    video: { label: "Motion clip", hint: "3–30s · one performer · steady camera", library: true },
    images: { label: "Character", hint: "Full body, clear pose", min: 1, max: 1 },
    prompt: { label: "Scene direction", placeholder: "Optional — e.g. neon rooftop at night, light rain" },
    options: [
      { key: "quality", label: "Quality", default: "std", choices: [{ value: "std", label: "Standard" }, { value: "pro", label: "Pro", sub: "Sharper" }] },
      { key: "orientation", label: "Follow", default: "video", choices: [{ value: "video", label: "Video", sub: "≤30s" }, { value: "image", label: "Photo", sub: "≤10s" }] },
      { key: "sound", label: "Audio", default: "keep", choices: [{ value: "keep", label: "Keep" }, { value: "mute", label: "Mute" }] },
    ],
    creditsPerSecond: (o) => (o.quality === "pro" ? 6 : 4),
    minSeconds: 3,
    maxSeconds: (o) => (o.orientation === "image" ? 10 : 30),
    etaSeconds: 180,
    cover: `${CDN}/motion_control_std/cover.mp4`,
    demoResult: `${CDN}/motion_control_std/output.mp4`,
    buildParams: ({ video, images, prompt, options }) => ({
      image: images[0],
      video,
      character_orientation: options.orientation,
      keep_original_sound: options.sound === "keep",
      prompt,
      negative_prompt: "",
    }),
  },
  {
    id: "character-swap",
    name: "Character Swap",
    kanji: "替",
    tagline: "Recast the performer",
    description: "Replace the person in your clip with anyone from a single photo. Background, camera move, lighting and timing stay exactly as filmed.",
    seoTitle: "AI Character Swap — Replace Anyone in a Video",
    seoDescription: "Swap the whole performer in any video from one photo while keeping the original background, camera and lighting.",
    providerId: "ai-provider-2",
    resolveModel: () => "wavespeed-ai/wan-2.2/animate",
    video: { label: "Source video", hint: "4–30s · the person you want to replace" },
    images: { label: "New character", hint: "Full body, plain background works best", min: 1, max: 1 },
    prompt: { label: "Guidance", placeholder: "Optional — e.g. preserve outfit, natural expression" },
    options: [
      { key: "resolution", label: "Resolution", default: "480p", choices: [{ value: "480p", label: "480p" }, { value: "720p", label: "720p" }] },
    ],
    creditsPerSecond: (o) => (o.resolution === "720p" ? 6 : 3),
    minSeconds: 4,
    maxSeconds: () => 30,
    etaSeconds: 240,
    cover: `${CDN}/motion_control_pro/output.mp4`,
    demoResult: `${CDN}/motion_control_pro/output.mp4`,
    buildParams: ({ video, images, prompt, options }) => ({
      image: images[0],
      video,
      mode: "replace",
      resolution: options.resolution,
      prompt,
    }),
  },
  {
    id: "object-swap",
    name: "Object Swap",
    kanji: "換",
    tagline: "Change one thing",
    description: "Point at a product, prop, outfit or location and say what it should become. Everything else in the shot stays untouched.",
    seoTitle: "AI Object Swap — Replace Products & Props in Video",
    seoDescription: "Replace a product, outfit, prop or location in existing footage with a reference image and a short instruction.",
    providerId: "ai-provider-2",
    resolveModel: () => "kwaivgi/kling-video-o3-pro/video-edit",
    video: { label: "Source video", hint: "3–10s works best" },
    images: { label: "References", hint: "Up to 4 · product, outfit, prop", min: 0, max: 4 },
    prompt: { label: "What changes?", placeholder: "e.g. Replace the soda can with the bottle from the reference", required: true },
    presets: [
      { label: "Swap product", prompt: "Replace the product in the hand with the product from the reference image, matching lighting and reflections." },
      { label: "New outfit", prompt: "Change the person's outfit to the outfit from the reference image. Keep face, pose and movement identical." },
      { label: "New location", prompt: "Move the scene to the location from the reference image while keeping the person and motion identical." },
    ],
    options: [{ key: "sound", label: "Audio", default: "keep", choices: [{ value: "keep", label: "Keep" }, { value: "mute", label: "Mute" }] }],
    creditsPerSecond: () => 20,
    minSeconds: 3,
    maxSeconds: () => 10,
    etaSeconds: 240,
    cover: `${CDN}/video_editor/cover.mp4`,
    demoResult: `${CDN}/video_editor/cover.mp4`,
    buildParams: ({ video, images, prompt, options }) => ({
      video,
      images,
      prompt,
      keep_original_sound: options.sound === "keep",
    }),
  },
  {
    id: "restyle",
    name: "Restyle",
    kanji: "彩",
    tagline: "Same take, new reality",
    description: "Turn live-action into anime, anime into live-action, or a phone clip into a polished commercial — motion, timing and camera stay in sync.",
    seoTitle: "AI Video Restyle — Anime to Live-Action & Back",
    seoDescription: "Restyle any video into anime, claymation, cyberpunk or live-action while preserving the original motion and camera.",
    providerId: "ai-provider-2",
    resolveModel: () => "kwaivgi/kling-video-o3-pro/video-edit",
    video: { label: "Source video", hint: "3–10s · any footage" },
    images: { label: "Style reference", hint: "Optional · up to 4 frames", min: 0, max: 4 },
    prompt: { label: "Extra direction", placeholder: "Optional — e.g. golden hour, keep the red jacket" },
    presets: STYLE_PRESETS,
    options: [{ key: "sound", label: "Audio", default: "keep", choices: [{ value: "keep", label: "Keep" }, { value: "mute", label: "Mute" }] }],
    creditsPerSecond: () => 20,
    minSeconds: 3,
    maxSeconds: () => 10,
    etaSeconds: 240,
    cover: `${CDN}/video_editor/cover.mp4`,
    demoResult: `${CDN}/video_editor/cover.mp4`,
    buildParams: ({ video, images, prompt, options }) => ({
      video,
      images,
      prompt: `Restyle the entire video as ${prompt}. Keep every movement, camera move, timing and composition identical to the original.`,
      keep_original_sound: options.sound === "keep",
    }),
  },
  {
    id: "face-swap",
    name: "Face Swap",
    kanji: "顔",
    tagline: "Only the face changes",
    description: "Replace a face in any clip while keeping expressions, lip movement and head turns. Skin tone and lighting are re-blended per frame.",
    seoTitle: "AI Video Face Swap — Swap Faces in Any Clip",
    seoDescription: "Swap a face in any video with a single portrait. Expressions, blinks and lip sync are preserved frame by frame.",
    providerId: "wavespeed",
    resolveModel: () => "wavespeed-ai/video-face-swap",
    video: { label: "Target video", hint: "Up to 10 min · faces clearly visible" },
    images: { label: "New face", hint: "Front-facing portrait, good light", min: 1, max: 1 },
    options: [
      { key: "target", label: "Which face", default: "0", choices: [{ value: "0", label: "1st" }, { value: "1", label: "2nd" }, { value: "2", label: "3rd" }] },
    ],
    creditsPerSecond: () => 1,
    minSeconds: 5,
    maxSeconds: () => 600,
    etaSeconds: 120,
    cover: `${CDN}/swap/video_face_swap/cover.mp4`,
    demoResult: `${CDN}/swap/video_face_swap/cover.mp4`,
    buildParams: ({ video, images, options }) => ({
      video,
      face_image: images[0],
      target_index: Number(options.target),
    }),
  },
];

export const getMode = (id?: string) => MODES.find((m) => m.id === id) ?? MODES[0];

export function estimateCredits(mode: Mode, options: Record<string, string>, seconds: number) {
  const billable = Math.min(Math.max(seconds || mode.minSeconds, mode.minSeconds), mode.maxSeconds(options));
  return Math.ceil(billable * mode.creditsPerSecond(options));
}

export interface PricePack {
  id: string;
  name: string;
  price: number;
  credits: number;
  stripeLookup: string;
  highlight?: boolean;
  perks: string[];
}

export const PRICE_PACKS: PricePack[] = [
  {
    id: "starter",
    name: "Starter",
    price: 4.99,
    credits: 50,
    stripeLookup: "genjutsu_starter_50",
    perks: ["≈ 12s of Motion Transfer", "All 5 modes", "720p output", "No watermark"],
  },
  {
    id: "creator",
    name: "Creator",
    price: 9.99,
    credits: 120,
    stripeLookup: "genjutsu_creator_120",
    highlight: true,
    perks: ["≈ 30s of Motion Transfer", "Pro quality unlocked", "Priority queue", "Commercial use"],
  },
  {
    id: "studio",
    name: "Studio",
    price: 39.99,
    credits: 600,
    stripeLookup: "genjutsu_studio_600",
    perks: ["≈ 150s of Motion Transfer", "1080p & Pro everywhere", "Fastest queue", "Batch-ready API access"],
  },
];
