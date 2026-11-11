/**
 * Build-time-only entry: bundled by Vite SSR so scripts/prerender.mjs can read
 * the same SEO copy the React app uses. Never imported by the client bundle.
 */
export { SITE, MODES, PLANS, FREE_TRIAL } from "./config/site";
export { TOPICS } from "./config/topics";
