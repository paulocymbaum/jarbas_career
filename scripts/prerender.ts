/// <reference lib="dom" />
// Build-time prerender: renders the built SPA in headless Chromium and writes the
// fully-populated HTML back to dist — so AI crawlers, answer-engine fetchers and
// no-JS clients (none of which execute JavaScript) can read the entire offer.
//
// Best-effort by design: any failure here warns and exits 0 — a deploy must never
// break because of the prerender (the page simply ships as the CSR build).
//
// Usage: npx vite build && npm run prerender   (wired into `npm run build`)

import fs from "node:fs";
import path from "node:path";
import { preview } from "vite";
import { chromium } from "playwright";

const DIST = path.resolve(process.cwd(), "dist");
// Random offset avoids clashing with a concurrently running `vite preview`.
const PORT = 4173 + 20 + Math.floor(Math.random() * 400);
// Explicit 127.0.0.1 bind + localhost fallback (CI resolves localhost to ::1).
const BASES = [`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`];

const targets = [
  { file: path.join(DIST, "freelance.html"), route: "/freelance" },
  { file: path.join(DIST, "index.html"), route: "/" },
];

const MIN_ARTIFACT_BYTES = 4000;

async function main(): Promise<void> {
  if (!fs.existsSync(DIST)) {
    console.warn("[prerender] dist/ not found — run `vite build` first. Skipping.");
    return;
  }

  const server = await preview({
    preview: { host: "127.0.0.1", port: PORT, strictPort: true },
  });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // Deterministic + offline-safe: local requests continue, everything external
  // (umami pageviews, Google Fonts) is aborted so analytics stay unpolluted.
  await context.route(/^https?:\/\//, (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === "127.0.0.1" || host === "localhost") return route.continue();
    return route.abort();
  });

  const renderPage = async (url: string): Promise<string | null> => {
    const page = await context.newPage();
    try {
      try {
        await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
      } catch {
        // Continuous client work (polling, animations) can keep the network busy —
        // settle for a moment and proceed with whatever has rendered.
        await page.waitForTimeout(2500);
      }

      // Force the reveal system to its final visible state so the serialized
      // artifact is complete for crawlers and readers (real browsers replay
      // the animations because React re-renders over this DOM on load).
      await page.evaluate(() => {
        document.querySelectorAll(".fx-reveal").forEach((el) => el.classList.add("fx-in-view"));
      });
      await page.waitForTimeout(300);

      const html = await page.evaluate(() => document.documentElement.outerHTML);

      // Sanity guard: refuse blank artifacts (about:blank after a refused
      // connection) — the original CSR file stays untouched instead.
      if (!html || html.length < MIN_ARTIFACT_BYTES || !html.includes("<body")) {
        console.warn(
          `[prerender] ${url} produced a ${html.length} B artifact — keeping the CSR file.`,
        );
        return null;
      }
      return html;
    } catch (error) {
      console.warn(`[prerender] ${url}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    } finally {
      await page.close();
    }
  };

  for (const target of targets) {
    let html: string | null = null;
    for (const base of BASES) {
      html = await renderPage(`${base}${target.route}`);
      if (html) break;
      console.warn(`[prerender] ${base}${target.route} failed — trying the next base…`);
    }
    if (html) {
      fs.writeFileSync(target.file, `<!doctype html>\n${html}\n`, "utf-8");
      console.info(
        `[prerender] ${path.basename(target.file)} — ${(html.length / 1024).toFixed(1)} kB ✓`,
      );
    } else {
      console.warn(`[prerender] ${target.file} kept as the CSR build (no valid render).`);
    }
  }

  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}

main().catch((error) => {
  console.warn(`[prerender] best-effort failed — shipping the CSR build: ${String(error)}`);
  process.exit(0);
});
