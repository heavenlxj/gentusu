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
};

/** 1 站点积分 = 10 kinkora coins；扣费与余额都以 kinkora coins 为准 */
export const COINS_PER_CREDIT = 10;

/** demo / 模板素材都在 R2，不随代码提交 */
const ASSETS = ((env.VITE_ASSETS_BASE_URL as string | undefined) || "https://storage.genjutsusi.app").replace(/\/$/, "");
const D = `${ASSETS}/demo`;

export const MOTION_LIBRARY = [
  { id: "karate", name: "Dojo fight", url: `${D}/mt-before.mp4`, poster: `${D}/mt-before.jpg` },
  { id: "dance", name: "Loft dance", url: `${D}/cs-before.mp4`, poster: `${D}/cs-before.jpg` },
  { id: "group", name: "Group routine", url: `${D}/group-before.mp4`, poster: `${D}/group-before.jpg` },
  { id: "walk", name: "Gallery run", url: `${D}/hall-before.mp4`, poster: `${D}/hall-before.jpg` },
  { id: "skate", name: "Snow skate", url: `${D}/snow-before.mp4`, poster: `${D}/snow-before.jpg` },
  { id: "skydive", name: "Skydive", url: `${D}/skydive.mp4`, poster: `${D}/skydive.jpg` },
];

export interface ModeExample {
  before: string;
  after: string;
  poster: string;
  beforePoster: string;
  images: string[];
  prompt?: string;
  preset?: number;
  caption: string;
  /** CSS aspect-ratio of the demo footage */
  aspect: string;
}

const example = (key: string, caption: string, extra: Partial<ModeExample> = {}, source = key): ModeExample => ({
  before: `${D}/${source}-before.mp4`,
  after: `${D}/${key}-after.mp4`,
  poster: `${D}/${key}-after.jpg`,
  beforePoster: `${D}/${source}-before.jpg`,
  images: [],
  caption,
  aspect: "16 / 9",
  ...extra,
});

export type ModeId = "motion-transfer" | "character-swap" | "outfit-swap" | "object-swap" | "background-swap" | "restyle" | "face-swap";

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
  /** 源视频秒数（已截断到 maxSeconds） */
  seconds: number;
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
  modelId: string;
  video: { label: string; hint: string };
  images: { label: string; hint: string; min: number; max: number };
  prompt?: { label: string; placeholder: string; required?: boolean };
  presets?: { label: string; prompt: string }[];
  options: ModeOption[];
  minSeconds: number;
  maxSeconds: number;
  etaSeconds: number;
  example: ModeExample;
  buildParams: (input: ModeInput) => Record<string, unknown>;
}

const PROVIDER = "ai-provider-2";
const EDIT_MODEL = "studio/wan-3.0/video-edit";
const REF_MODEL = "studio/wan-3.0/reference-to-video";

export type Resolution = "480p" | "720p" | "1080p";

/** kinkora coins/s：video-edit 按输入秒 × 2（输入 + 输出），ref2v 按 (参考秒 + 输出秒) */
const COINS_PER_SOURCE_SECOND: Record<Resolution, number> = { "480p": 46, "720p": 90, "1080p": 180 };

const RESOLUTION_OPTION: ModeOption = {
  key: "resolution",
  label: "Quality",
  default: "480p",
  choices: [
    { value: "480p", label: "480p", sub: "Fast" },
    { value: "720p", label: "720p", sub: "HD" },
    { value: "1080p", label: "1080p", sub: "Full HD" },
  ],
};

const SOUND_OPTION: ModeOption = {
  key: "sound",
  label: "Sound",
  default: "ai",
  choices: [
    { value: "ai", label: "AI sound", sub: "Matches the edit" },
    { value: "keep", label: "Original", sub: "Keep source audio" },
  ],
};

const MOTION_SOUND_OPTION: ModeOption = {
  key: "sound",
  label: "Sound",
  default: "ai",
  choices: [
    { value: "ai", label: "AI sound" },
    { value: "mute", label: "Silent" },
  ],
};

const KEEP_REST = "Keep everything else exactly as it is: faces, hands, motion, camera path, timing, lighting and the rest of the scene.";
const NO_CUTOUT = "Edges blend naturally with the scene, no cutout artifacts.";

const join = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");

const editParams = (prompt: string, { video, images, options }: ModeInput) => ({
  prompt,
  video,
  reference_images: images,
  resolution: options.resolution,
  generate_audio: options.sound !== "keep",
});

const STYLE_PRESETS = [
  { label: "90s anime", prompt: "1990s hand-drawn cel animation: flat bold colors, clean black ink outlines, painted backgrounds, anime faces with large eyes" },
  { label: "Claymation", prompt: "stop-motion claymation: plasticine textures, fingerprints in the clay, soft studio light" },
  { label: "Cyberpunk", prompt: "a neon cyberpunk film: rain, wet reflections, magenta and cyan lights" },
  { label: "Toy city", prompt: "a colorful toy-brick world: glossy plastic blocks, tilt-shift miniature look" },
  { label: "3D toon", prompt: "a glossy 3D animated feature film: soft global illumination, expressive stylized characters" },
  { label: "Ink wash", prompt: "a Japanese sumi-e ink wash painting: paper texture, minimal palette, brush strokes" },
  { label: "Live-action", prompt: "a photorealistic live-action film: natural skin, 35mm cinematic lighting" },
];

const BACKGROUND_PRESETS = [
  { label: "Neon Tokyo", prompt: "a neon-lit Tokyo street at night with wet reflective pavement" },
  { label: "Mars", prompt: "the red dusty surface of Mars under a pale sky" },
  { label: "Beach sunset", prompt: "a tropical beach at golden-hour sunset" },
  { label: "Snowy forest", prompt: "a quiet snowy pine forest with falling snow" },
];

export const MODES: Mode[] = [
  {
    id: "motion-transfer",
    name: "Motion Transfer",
    kanji: "転",
    tagline: "Make anyone move",
    description: "Upload one character photo and a motion clip. Every kick, spin and hand gesture is transferred while face, outfit and style stay locked.",
    seoTitle: "AI Motion Transfer — Make Any Photo Dance",
    seoDescription: "Transfer dance moves, fights and gestures from any reference video onto a character photo. Photoreal, 3D and anime supported.",
    providerId: PROVIDER,
    modelId: REF_MODEL,
    video: { label: "Motion clip", hint: "2–15s · steady camera" },
    images: { label: "Character", hint: "Full body, clear pose", min: 1, max: 1 },
    prompt: { label: "Scene direction", placeholder: "Optional — e.g. neon rooftop at night, light rain" },
    options: [RESOLUTION_OPTION, MOTION_SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example("mt", "Original fight clip + one character photo", { images: [`${D}/mt-character.jpg`] }),
    buildParams: ({ video, images, prompt, options, seconds }) => ({
      prompt: join(
        "The motion, positions, timing and camera come only from Video 1.",
        "The character performing it is the character in Image 1: same face, hair, outfit and art style as Image 1.",
        prompt ? `Scene: ${prompt}.` : "Keep the setting of Video 1.",
        "No captions.",
      ),
      reference_images: images,
      reference_videos: [video],
      reference_video_seconds: seconds,
      duration: Math.max(2, Math.ceil(seconds)),
      aspect_ratio: options.aspect ?? "16:9",
      resolution: options.resolution,
      generate_audio: options.sound !== "mute",
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
    providerId: PROVIDER,
    modelId: EDIT_MODEL,
    video: { label: "Source video", hint: "2–15s · the person you want to replace" },
    images: { label: "New character", hint: "Face clearly visible, full body is best", min: 1, max: 1 },
    prompt: { label: "Guidance", placeholder: "Optional — e.g. keep the original outfit" },
    options: [RESOLUTION_OPTION, SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example("cs", "Dancer recast from one photo", { images: [`${D}/cs-character.jpg`], aspect: "4 / 3" }),
    buildParams: (input) =>
      editParams(
        join(
          "Edit the video: seamlessly replace the main person in Video 1 with the person from Image 1 — face, hair, body and outfit come only from Image 1.",
          "They perform exactly the same movements, poses and timing.",
          input.prompt,
          "Keep the background, lighting and camera movement unchanged.",
          NO_CUTOUT,
        ),
        input,
      ),
  },
  {
    id: "outfit-swap",
    name: "Outfit Swap",
    kanji: "装",
    tagline: "Re-dress any take",
    description: "Describe a costume or drop a product shot — the clothes change, while the face, moves and scene stay exactly as filmed.",
    seoTitle: "AI Outfit Swap — Change Clothes in Any Video",
    seoDescription: "Change what someone is wearing in a video from a text prompt or a product photo. Face, motion and camera stay identical.",
    providerId: PROVIDER,
    modelId: EDIT_MODEL,
    video: { label: "Source video", hint: "2–15s · person clearly visible" },
    images: { label: "Outfit reference", hint: "Optional · product or look photo", min: 0, max: 2 },
    prompt: { label: "New outfit", placeholder: "e.g. a full-body yellow banana costume", required: true },
    presets: [
      { label: "Banana suit", prompt: "a full-body yellow banana costume that covers the torso and arms, face stays visible" },
      { label: "Samurai armor", prompt: "black and red lacquered samurai armor" },
      { label: "Tuxedo", prompt: "a sharp black tuxedo with a bow tie" },
      { label: "From photo", prompt: "the outfit shown in Image 1" },
    ],
    options: [RESOLUTION_OPTION, SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example("os", "Only the outfit changes — the whole scene stays", {
      prompt: "a full-body yellow banana costume that covers the torso and arms, face stays visible",
    }),
    buildParams: (input) =>
      editParams(join(`Edit the video: the person in Video 1 now wears ${input.prompt}.`, "Their face, hair, hands, motion and the camera remain unchanged.", KEEP_REST), input),
  },
  {
    id: "object-swap",
    name: "Object Swap",
    kanji: "換",
    tagline: "Change one thing",
    description: "Point at a product or prop and say what it should become. Hands interact with the new object; everything else stays untouched.",
    seoTitle: "AI Object Swap — Replace Products & Props in Video",
    seoDescription: "Replace a product or prop in existing footage with a reference image and a short instruction.",
    providerId: PROVIDER,
    modelId: EDIT_MODEL,
    video: { label: "Source video", hint: "2–15s works best" },
    images: { label: "References", hint: "Optional · up to 3 product shots", min: 0, max: 3 },
    prompt: { label: "What changes?", placeholder: "e.g. Replace the laptop with a vintage typewriter", required: true },
    presets: [
      { label: "Swap product", prompt: "Replace the product in the hand with the product from Image 1, matching lighting and reflections." },
      { label: "Retro tech", prompt: "Replace the laptop with a cream-colored vintage mechanical typewriter of similar size, fingers typing on its keys." },
    ],
    options: [RESOLUTION_OPTION, SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example(
      "obj",
      "Laptop becomes a vintage typewriter",
      { prompt: "Replace the laptop with a cream-colored vintage mechanical typewriter of similar size, fingers typing on its keys." },
      "os",
    ),
    buildParams: (input) => editParams(join(`Edit the video: ${input.prompt}`, KEEP_REST), input),
  },
  {
    id: "background-swap",
    name: "Background Swap",
    kanji: "景",
    tagline: "Teleport the scene",
    description: "Keep the performer, move the world. Light, reflections and shadows from the new location wrap around them in every frame.",
    seoTitle: "AI Background Swap — Change Any Video Location",
    seoDescription: "Move any clip to a new location: neon streets, Mars, beaches. The person, motion and camera stay exactly the same.",
    providerId: PROVIDER,
    modelId: EDIT_MODEL,
    video: { label: "Source video", hint: "2–15s · any footage" },
    images: { label: "Location reference", hint: "Optional · a photo of the place", min: 0, max: 1 },
    prompt: { label: "New location", placeholder: "e.g. a neon-lit Tokyo street at night", required: true },
    presets: BACKGROUND_PRESETS,
    options: [RESOLUTION_OPTION, SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example("hall", "Palace gallery to neon Tokyo", { prompt: BACKGROUND_PRESETS[0].prompt }),
    buildParams: (input) =>
      editParams(
        join(
          `Edit the video: change the location in Video 1 to ${input.prompt}.`,
          "The people, their outfits, their motion and the camera path stay exactly the same.",
          "They receive the light of the new scene.",
          NO_CUTOUT,
        ),
        input,
      ),
  },
  {
    id: "restyle",
    name: "Restyle",
    kanji: "彩",
    tagline: "Same take, new reality",
    description: "Turn live-action into anime, anime into live-action, or a phone clip into claymation — motion, timing and camera stay in sync.",
    seoTitle: "AI Video Restyle — Anime to Live-Action & Back",
    seoDescription: "Restyle any video into anime, claymation, cyberpunk or live-action while preserving the original motion and camera.",
    providerId: PROVIDER,
    modelId: EDIT_MODEL,
    video: { label: "Source video", hint: "2–15s · any footage" },
    images: { label: "Style reference", hint: "Optional · up to 2 frames", min: 0, max: 2 },
    prompt: { label: "Extra direction", placeholder: "Optional — e.g. golden hour, keep the red jacket" },
    presets: STYLE_PRESETS,
    options: [RESOLUTION_OPTION, SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example("snow", "Snow skater turned 90s anime", { preset: 0 }),
    buildParams: (input) =>
      editParams(
        join(
          `Edit the video: convert the entire scene of Video 1 into ${input.prompt}.`,
          "Keep the same characters, outfits, motion, timing and camera path in every frame.",
        ),
        input,
      ),
  },
  {
    id: "face-swap",
    name: "Face Swap",
    kanji: "顔",
    tagline: "Only the face changes",
    description: "Replace a face in any clip while keeping expressions, lip movement and head turns. Skin tone and lighting are re-blended per frame.",
    seoTitle: "AI Video Face Swap — Swap Faces in Any Clip",
    seoDescription: "Swap a face in any video with a single portrait. Expressions, blinks and lip sync are preserved frame by frame.",
    providerId: PROVIDER,
    modelId: EDIT_MODEL,
    video: { label: "Target video", hint: "2–15s · face clearly visible" },
    images: { label: "New face", hint: "Front-facing portrait, good light", min: 1, max: 1 },
    options: [RESOLUTION_OPTION, SOUND_OPTION],
    minSeconds: 2,
    maxSeconds: 15,
    etaSeconds: 600,
    example: example("fs", "Same shot, a different person", { images: [`${D}/fs-face.jpg`] }),
    buildParams: (input) =>
      editParams(
        join(
          "Edit the video: replace the face of the person in Video 1 with the face from Image 1 — same identity, skin tone, eyes, nose and mouth.",
          "Keep the hair, head shape, expressions, lip movements, head turns, lighting and camera exactly as in Video 1.",
          "Seamless blend at the jawline and hairline, no mask edges. Keep everything else unchanged.",
        ),
        input,
      ),
  },
];

export const getMode = (id?: string) => MODES.find((m) => m.id === id) ?? MODES[0];

export function billableSeconds(mode: Mode, seconds: number) {
  return Math.min(Math.max(Math.ceil(seconds || mode.minSeconds), mode.minSeconds), mode.maxSeconds);
}

export function estimateCredits(mode: Mode, options: Record<string, string>, seconds: number) {
  const res = (options.resolution as Resolution) ?? "480p";
  return Math.ceil((billableSeconds(mode, seconds) * COINS_PER_SOURCE_SECOND[res]) / COINS_PER_CREDIT);
}

export const creditsPerSecond = (res: Resolution) => COINS_PER_SOURCE_SECOND[res] / COINS_PER_CREDIT;

export type BillingInterval = "month" | "year";
export type PlanId = "starter" | "pro" | "studio";

export interface Plan {
  id: PlanId;
  name: string;
  rank: number;
  /** 每月发放的站点积分（年付同样按月发放，当月未用完即过期） */
  credits: number;
  monthly: number;
  /** 年付总价 = 月价 × 12 × 0.8 */
  yearly: number;
  highlight?: boolean;
  perks: string[];
}

export const YEARLY_DISCOUNT = 0.2;

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    rank: 1,
    credits: 500,
    monthly: 24.99,
    yearly: 239.9,
    perks: ["~1 min of HD video every month", "All 7 modes", "No watermark", "Top up with credit packs"],
  },
  {
    id: "pro",
    name: "Pro",
    rank: 2,
    credits: 1500,
    monthly: 69.99,
    yearly: 671.9,
    highlight: true,
    perks: ["~3 min of HD video every month", "1080p unlocked", "Priority queue", "Commercial use"],
  },
  {
    id: "studio",
    name: "Studio",
    rank: 3,
    credits: 3000,
    monthly: 129.99,
    yearly: 1247.9,
    perks: ["~5.5 min of HD video every month", "1080p everywhere", "Fastest queue", "Commercial use"],
  },
];

export const planLookup = (plan: PlanId, interval: BillingInterval) => `genjutsu_${plan}_${interval}`;

export function planFromLookup(lookup?: string | null): { plan: Plan; interval: BillingInterval } | null {
  const m = /^genjutsu_(starter|pro|studio)_(month|year)$/.exec(lookup ?? "");
  const plan = m && PLANS.find((p) => p.id === m[1]);
  return plan ? { plan, interval: m![2] as BillingInterval } : null;
}

export interface CreditPack {
  credits: number;
  price: number;
  lookup: string;
}

/** 永久积分包，仅限有效订阅用户购买 */
export const CREDIT_PACKS: CreditPack[] = [
  { credits: 500, price: 34.99, lookup: "genjutsu_pack_500" },
  { credits: 1500, price: 89.99, lookup: "genjutsu_pack_1500" },
  { credits: 3000, price: 169.99, lookup: "genjutsu_pack_3000" },
];

/** 注册赠送：够一条 5 秒 480p 体验视频（需通过设备指纹 / 邮箱风控） */
export const FREE_TRIAL = { credits: 23, seconds: 5, resolution: "480p" as Resolution };
