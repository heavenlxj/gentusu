import { FREE_TRIAL, PLANS, SITE, creditsPerSecond, type ModeId } from "./site";

export interface TopicSection {
  h2: string;
  body?: string[];
  list?: string[];
  prompts?: { label: string; text: string }[];
  table?: { head: string[]; rows: string[][] };
  /** 展示这些模式的 before/after 示例并链接到模式页 */
  modes?: ModeId[];
}

export interface Topic {
  slug: string;
  nav: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: TopicSection[];
  faqs: { q: string; a: string }[];
}

export const TOPICS: Topic[] = [
  {
    slug: "what-is-genjutsu-ai",
    nav: "What is Genjutsu AI?",
    title: "What Is Genjutsu AI? The Viral Video Illusion Trend Explained (2026)",
    description:
      "Genjutsu AI explained: the Naruto-inspired video-to-video trend popularized by Higgsfield Genjutsu. How motion transfer and object swap work, and how to make your own genjutsu video.",
    eyebrow: "Explainer",
    h1: "What is Genjutsu AI?",
    intro:
      "Genjutsu AI is video-to-video generation that rewrites what the viewer sees while keeping the original motion. You keep a clip’s choreography, camera move and timing — and change who is in it, what they wear, where they are or the whole art style.",
    sections: [
      {
        h2: "Where the name comes from",
        body: [
          "In Naruto, a genjutsu (幻術, “illusion technique”) traps the target in a false reality. In 2026 Higgsfield borrowed the name for its video transformation tool, and “genjutsu” quickly became shorthand for any AI edit that recasts or restyles a real clip while the movement stays perfectly in sync.",
        ],
      },
      {
        h2: "The two core techniques",
        table: {
          head: ["", "Motion transfer", "Object swap"],
          rows: [
            ["What stays", "Motion, camera path, timing", "The whole shot except one element"],
            ["What changes", "Character, outfit, location or style", "A person, product, outfit, prop or background"],
            ["Typical use", "Dance trends, fight scenes, avatars", "Product ads, outfit try-on, cameos"],
          ],
        },
        modes: ["motion-transfer", "object-swap"],
      },
      {
        h2: "The genjutsu trend on TikTok",
        body: [
          "The viral format is a before/after: the original clip, then the same moves performed by an anime character, a celebrity look-alike, a pet or the creator themselves. The illusion lands because every step and camera shake matches the original.",
          `${SITE.name} gives you seven genjutsu techniques in one studio — motion transfer, character swap, outfit swap, object swap, background swap, restyle and face swap.`,
        ],
        modes: ["character-swap", "restyle"],
      },
      {
        h2: "How to make a genjutsu video",
        list: [
          "Pick a 2–15 second clip with a steady camera and a clearly visible subject.",
          "Choose a technique: motion transfer for a new character, a swap for one element, restyle for a new look.",
          "Add a reference photo or a one-line prompt.",
          "Generate, drag the compare slider to check the illusion, and download the MP4.",
        ],
      },
    ],
    faqs: [
      { q: "What is Genjutsu AI?", a: "An AI video technique that keeps a clip’s original motion, camera and timing while replacing the character, an object, the location or the visual style." },
      { q: "Is Genjutsu AI made by Higgsfield?", a: `Higgsfield launched a tool called Genjutsu. ${SITE.name} is an independent product offering similar motion-transfer and swap workflows and is not affiliated with Higgsfield.` },
      { q: "Is Genjutsu AI free?", a: `New ${SITE.name} accounts get ${FREE_TRIAL.credits} free credits — one ${FREE_TRIAL.seconds}-second ${FREE_TRIAL.resolution} clip.` },
    ],
  },
  {
    slug: "higgsfield-genjutsu-alternative",
    nav: "Higgsfield Genjutsu alternative",
    title: "Higgsfield Genjutsu Alternative — Motion Transfer, Object Swap & 5 More Modes",
    description:
      "Looking for a Higgsfield Genjutsu alternative? Compare features, clip length, references and pricing — Genjutsu AI adds character, outfit, background, restyle and face swap modes with one per-second rate.",
    eyebrow: "Comparison",
    h1: "The Higgsfield Genjutsu alternative",
    intro:
      "Higgsfield Genjutsu popularized two workflows: motion transfer and object swap. Genjutsu AI covers both and splits the most common edits into dedicated one-click modes, with the credit cost shown before every render.",
    sections: [
      {
        h2: "Genjutsu AI vs. Higgsfield Genjutsu",
        table: {
          head: ["", SITE.name, "Higgsfield Genjutsu"],
          rows: [
            ["Modes", "Motion transfer, character swap, outfit swap, object swap, background swap, restyle, face swap", "Motion Transfer, Object Swap"],
            ["Source clip", "2–15 s", "4–30 s"],
            ["References", "Up to 3 photos per mode, or a text prompt", "Multiple reference images + prompt"],
            ["Output", "480p, 720p, 1080p", "480p, 720p, 1080p"],
            ["Pricing", `One rate for every mode: ${creditsPerSecond("480p")} credits/s at 480p, plans from $${PLANS[0].monthly}/mo`, "Higgsfield credits, varies by plan"],
          ],
        },
      },
      {
        h2: "When to pick which",
        list: [
          `Pick ${SITE.name} for short-form edits (TikTok, Reels, ads) where a one-click mode and a fixed per-second rate matter.`,
          "Pick Higgsfield Genjutsu for clips longer than 15 seconds or when you need many reference images in one generation.",
          "Both keep the original motion and camera — compare the before/after examples below.",
        ],
        modes: ["motion-transfer", "outfit-swap", "background-swap"],
      },
    ],
    faqs: [
      { q: "Is there a free Higgsfield Genjutsu alternative?", a: `${SITE.name} gives new accounts ${FREE_TRIAL.credits} free credits — enough for a ${FREE_TRIAL.seconds}-second ${FREE_TRIAL.resolution} clip in any mode.` },
      { q: `Is ${SITE.name} affiliated with Higgsfield?`, a: "No. It is an independent product built on Alibaba’s Wan video models." },
      { q: "Does it support object swap like Higgsfield Genjutsu?", a: "Yes, plus dedicated outfit-swap, background-swap and face-swap modes so you don’t have to describe those edits from scratch." },
    ],
  },
];

export const getTopic = (slug: string) => TOPICS.find((t) => t.slug === slug)!;
