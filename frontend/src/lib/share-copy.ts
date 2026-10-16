import { MODES, SITE } from "@/config/site";
import type { Generation } from "@/lib/kinkora";

/** 每种模式一句推广「钩子」——描述这次生成改了什么，保持动作/运镜不变的主卖点 */
const HOOKS: Record<string, string> = {
  "motion-transfer": "one photo performed the whole clip, move for move",
  "character-swap": "the performer changed, the shot stayed exactly as filmed",
  "outfit-swap": "the outfit changed while the face, motion and camera stayed identical",
  "object-swap": "the product swapped mid-clip, hands and all",
  "background-swap": "the same performance walked into a whole new world",
  "restyle": "the whole scene was repainted in a different art style, frame for frame",
  "face-swap": "the face was swapped frame by frame, expressions intact",
};

const TAGS = ["#GenjutsuAI", "#AIVideo", "#VideoEditing"];

const modeOf = (item: Generation) => MODES.find((m) => m.id === item.meta.mode);

export const shareFilename = (item: Generation) => `genjutsu-${item.shareId || item.id}.jpg`;

function spec(item: Generation) {
  return [item.resolution, item.seconds ? `${item.seconds}s` : null].filter(Boolean).join(" · ");
}

export function shareCaption(item: Generation, url: string): string {
  const hook = HOOKS[item.meta.mode ?? ""] ?? "the clip was rebuilt while every move stayed the same";
  return [
    "Same motion, new reality.",
    "",
    `In this one, ${hook}. Made with ${SITE.name} — it keeps the moves, camera and timing of the original clip and changes only what you ask for: no timeline, no editing skills, one photo or one sentence.`,
    "",
    `My first clip was free, yours can be too: ${url}`,
    "",
    TAGS.join(" "),
  ].join("\n");
}

/** X 只有 280 字符（链接按 23 计），超长时给一版紧凑文案 */
export function shareCaptionForX(item: Generation, url: string, caption: string): string {
  if (caption.length <= 280) return caption;
  const mode = modeOf(item)?.name ?? "Genjutsu AI";
  return [
    `Same motion, new reality: ${mode} with ${SITE.name}.`,
    `Keep every move, camera and cut — change only what you ask for. First clip free:`,
    url,
    "#GenjutsuAI #AIVideo",
  ].join(" ");
}

/** Reddit 只要标题，不用正文 */
export function shareTitle(item: Generation) {
  const hook = HOOKS[item.meta.mode ?? ""] ?? "the clip rebuilt with its motion intact";
  return `Same motion, new reality — ${hook} (made with ${SITE.name})`;
}

export function shareDescription(item: Generation) {
  const mode = modeOf(item);
  return [mode?.name ?? "Genjutsu AI", spec(item)].filter(Boolean).join(" · ");
}

/** 各平台 intent 地址；不支持正文接口的（Instagram / TikTok）返回 null */
export function platformIntent(platform: string, url: string, caption: string, item: Generation) {
  const link = encodeURIComponent(url);
  const text = encodeURIComponent(caption);
  switch (platform) {
    case "x":
      return `https://twitter.com/intent/tweet?text=${text}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${text}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${link}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${link}&title=${encodeURIComponent(shareTitle(item))}`;
    case "telegram":
      return `https://t.me/share/url?url=${link}&text=${text}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(`${caption}`)}`;
    default:
      return null;
  }
}
