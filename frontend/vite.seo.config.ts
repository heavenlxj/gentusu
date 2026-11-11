import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Build-time-only SSR bundle. scripts/prerender.mjs imports it to read the
 * same SITE / MODES / TOPICS the React app uses, so the static head cannot
 * drift from the runtime <Seo> values.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
    },
  },
  build: {
    ssr: "src/seo-manifest.ts",
    outDir: "dist-seo",
    emptyOutDir: true,
  },
});
