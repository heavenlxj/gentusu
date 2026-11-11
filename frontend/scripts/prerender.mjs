#!/usr/bin/env node
/**
 * Post-build: give every public route its own static HTML shell with a
 * self-referencing canonical, unique title/description and matching OG tags.
 *
 * Why: Genjutsu is a client-rendered SPA. All routes ship the same index.html,
 * so a crawler that does not execute JS sees the homepage canonical on every
 * subpage. Vercel serves real files before the SPA rewrite, so
 * dist/<route>/index.html is what those crawlers get.
 *
 * Run after the client build and the SSR manifest build:
 *   vite build && vite build --config vite.seo.config.ts && node scripts/prerender.mjs
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const seoDir = join(root, "dist-seo");

const { SITE, MODES, PLANS, FREE_TRIAL, TOPICS } = await import(
  pathToFileURL(join(seoDir, "seo-manifest.js")).href
);

const base = await readFile(join(dist, "index.html"), "utf8");

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function replace(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`[prerender] pattern not found: ${label}`);
  return html.replace(pattern, replacement);
}

const ROUTES = [
  ...MODES.map((mode) => ({
    path: `/${mode.id}`,
    title: mode.seoTitle,
    description: mode.seoDescription,
  })),
  ...TOPICS.map((topic) => ({
    path: `/${topic.slug}`,
    title: topic.title,
    description: topic.description,
  })),
  {
    path: "/pricing",
    title: `Genjutsu AI Pricing — Plans from $${PLANS[0].monthly}/mo | ${SITE.name}`,
    description: `Genjutsu AI plans from $${PLANS[0].monthly}/month for motion transfer, character swap, object swap, restyle and face swap. HD on every plan, 20% off yearly, a free ${FREE_TRIAL.seconds}s clip for new accounts.`,
  },
  {
    path: "/privacy",
    title: `Privacy Policy — ${SITE.name}`,
    description: `How ${SITE.name} collects, uses and protects your information when you edit videos and photos.`,
  },
  {
    path: "/terms",
    title: `Terms of Service — ${SITE.name}`,
    description: `The terms that govern your use of ${SITE.name}.`,
  },
];

function shell({ title, description, path }) {
  const canonical = `${SITE.url}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: `${SITE.url}/` },
  };

  let html = base;
  html = replace(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`, "title");
  html = replace(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" data-rh="true" content="${esc(description)}" />`,
    "description",
  );
  html = replace(
    html,
    /<link rel="canonical"[^>]*\/>/,
    `<link rel="canonical" data-rh="true" href="${esc(canonical)}" />`,
    "canonical",
  );
  html = replace(
    html,
    /<meta property="og:url"[^>]*\/>/,
    `<meta property="og:url" data-rh="true" content="${esc(canonical)}" />`,
    "og:url",
  );
  html = replace(
    html,
    /<meta property="og:title"[^>]*\/>/,
    `<meta property="og:title" data-rh="true" content="${esc(title)}" />`,
    "og:title",
  );
  html = replace(
    html,
    /<meta property="og:description"[^>]*\/>/,
    `<meta property="og:description" data-rh="true" content="${esc(description)}" />`,
    "og:description",
  );
  html = replace(
    html,
    /<meta name="twitter:title"[^>]*\/>/,
    `<meta name="twitter:title" data-rh="true" content="${esc(title)}" />`,
    "twitter:title",
  );
  html = replace(
    html,
    /<meta name="twitter:description"[^>]*\/>/,
    `<meta name="twitter:description" data-rh="true" content="${esc(description)}" />`,
    "twitter:description",
  );
  html = replace(
    html,
    /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" data-rh="true">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`,
    "json-ld",
  );
  return html;
}

for (const route of ROUTES) {
  const out = join(dist, route.path.replace(/^\//, ""), "index.html");
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, shell(route), "utf8");
}

await rm(seoDir, { recursive: true, force: true });
console.log(`[prerender] generated ${ROUTES.length} route shells`);
