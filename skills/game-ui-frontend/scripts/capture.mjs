#!/usr/bin/env node
// Screenshots one or more pages at several widths and lays them side by side, so directions,
// mocks or before/after versions can be compared in a single image.
//
//   node scripts/capture.mjs <url|file> [<url|file> ...] [--viewports 1440,390] [--labels "A,B,C"] [--full] [--out dir]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertAllowed, filmstrip, launch, outDir, parseArgs, toUrl } from "./lib/browser.mjs";

export async function capture(targets, { viewports = [1440, 390], labels = [], full = false, out } = {}) {
  const urls = targets.map(toUrl);
  urls.forEach(assertAllowed);
  const root = outDir("capture", out);
  const browser = await launch();
  const strips = {};
  try {
    for (const width of viewports) {
      const items = [];
      for (const [i, url] of urls.entries()) {
        const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, isMobile: width < 600, hasTouch: width < 600 });
        const page = await ctx.newPage();
        try {
          await page.goto(url, { waitUntil: "load", timeout: 30000 });
          await page.waitForTimeout(500);
          const file = path.join(root, `${String(i + 1).padStart(2, "0")}-${width}.png`);
          await page.screenshot({ path: file, fullPage: full, animations: "disabled" });
          items.push({ label: labels[i] ?? `${i + 1}: ${new URL(url).pathname.split("/").pop() || url}`, file });
        } finally {
          await ctx.close();
        }
      }
      strips[width] = await filmstrip(browser, items, path.join(root, `compare-${width}.png`), `${width}px`,
        width < 600 ? { maxWidth: 400, maxHeight: 860 } : { maxWidth: 720, maxHeight: 460 });
    }
  } finally {
    await browser.close();
  }
  return { root, strips };
}

async function cli() {
  const args = parseArgs(process.argv.slice(2));
  if (!args._.length) {
    process.stdout.write("Usage: node scripts/capture.mjs <url|file> [...] [--viewports 1440,390] [--labels \"A,B\"] [--full] [--out dir]\n");
    return 1;
  }
  const result = await capture(args._, {
    viewports: typeof args.viewports === "string" ? args.viewports.split(",").map(Number) : undefined,
    labels: typeof args.labels === "string" ? args.labels.split(",") : [],
    full: Boolean(args.full),
    out: typeof args.out === "string" ? args.out : undefined,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  cli().then((code) => { process.exitCode = code; }).catch((e) => {
    process.stderr.write(`capture error: ${process.env.DEBUG ? e.stack : e.message}\n`);
    process.exitCode = 1;
  });
}
