// Shared Playwright helpers for audit.mjs, capture.mjs and verify.mjs.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { SKILL_ROOT, loadPreferences, paths } from "../library.mjs";

const INSTALL_HINT = `Playwright is not installed. Follow the browser setup in "${path.join(SKILL_ROOT, "SKILL.md")}". Install dependencies beside this skill copy, including when skills use supplied a temporary directory.`;

function resolveFrom(dir, name) {
  try {
    return createRequire(path.join(dir, "noop.js")).resolve(name);
  } catch {
    return null;
  }
}

/** Finds a package next to the skill first, then in the current project. */
export function findPackage(name) {
  return resolveFrom(SKILL_ROOT, name) ?? resolveFrom(process.cwd(), name);
}

export async function loadPlaywright() {
  const entry = findPackage("playwright");
  if (!entry) throw new Error(INSTALL_HINT);
  const mod = await import(pathToFileURL(entry).href);
  return mod.default ?? mod;
}

export async function launch() {
  const { chromium } = await loadPlaywright();
  try {
    return await chromium.launch();
  } catch (e) {
    if (/Executable doesn't exist/.test(e.message)) throw new Error(`Chromium is missing. Follow the browser setup in "${path.join(SKILL_ROOT, "SKILL.md")}".`);
    throw e;
  }
}

/**
 * The URL the user passed is allowed. Pages reached by crawling must share its origin.
 * Domains the preferences mark as excluded or no_automated_access are always refused.
 */
export function assertAllowed(url) {
  const u = new URL(url);
  if (!["http:", "https:", "file:"].includes(u.protocol)) throw new Error(`Refusing non-web URL: ${url}`);
  const policy = loadPreferences(paths()).source_policy ?? {};
  const host = u.hostname.replace(/^www\./, "");
  for (const [domain, rule] of Object.entries(policy)) {
    if ((host === domain || host.endsWith(`.${domain}`)) && ["excluded", "no_automated_access", "link_only"].includes(rule)) {
      throw new Error(`${domain} is "${rule}" in source_policy; browser automation is not allowed there`);
    }
  }
  return u;
}

export function toUrl(target) {
  if (/^[a-z]+:\/\//i.test(target)) return target;
  const file = path.resolve(target);
  if (!fs.existsSync(file)) throw new Error(`Not a URL or existing file: ${target}`);
  return pathToFileURL(file).href;
}

export function outDir(kind, explicit) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const dir = path.resolve(explicit ?? path.join(".game-ui-frontend", "runs", `${stamp}-${kind}`));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const k = a.slice(2);
    const v = argv[i + 1] === undefined || argv[i + 1].startsWith("--") ? true : argv[++i];
    if (k in out) out[k] = [].concat(out[k], v);
    else out[k] = v;
  }
  return out;
}

export const list = (v) => (v === undefined ? [] : [].concat(v));

/** Injects axe-core if installed. Returns serious/critical violations, or null when axe is unavailable. */
export async function runAxe(page, context = null) {
  const axePath = findPackage("axe-core/axe.min.js");
  if (!axePath) return null;
  await page.addScriptTag({ path: axePath });
  const result = await page.evaluate(async (ctx) => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(ctx ? document.querySelector(ctx) : document, { resultTypes: ["violations"], preload: false });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.slice(0, 5).map((n) => n.target.join(" ")) }));
  }, context);
  return result;
}

// ---------- in-page helpers (serialised into the page by evaluate) ----------

// Animation helpers look at the whole document, not just the control: shared markers, previews and
// other context art that respond to the control are part of its gesture.

/** Waits until no finite animation on the page is running. */
export async function settle(page, handle, timeout = 4000) {
  await page.waitForFunction(
    () => document.getAnimations().every((a) => {
      const t = a.effect?.getComputedTiming?.();
      return a.playState !== "running" || !t || t.endTime === Infinity;
    }),
    handle,
    { timeout, polling: 50 },
  ).catch(() => {});
  await page.waitForTimeout(32);
}

/** Pauses every finite animation on the page and returns their longest end time (ms). */
export async function freezeAnimations(handle) {
  return handle.evaluate(() => {
    const anims = document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
    for (const a of anims) a.pause();
    window.__frozen = anims;
    return anims.reduce((m, a) => Math.max(m, a.effect.getComputedTiming().endTime), 0);
  });
}

export async function seekFrozen(page, ms) {
  await page.evaluate((t) => {
    for (const a of window.__frozen ?? []) a.currentTime = Math.min(t, a.effect.getComputedTiming().endTime);
  }, ms);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

export async function releaseFrozen(page) {
  await page.evaluate(() => { for (const a of window.__frozen ?? []) a.play(); window.__frozen = []; });
}

/** Describes animations currently running on the page (used for reduced-motion checks). */
export async function describeAnimations(handle) {
  return handle.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").map((a) => {
    const t = a.effect?.getComputedTiming?.() ?? {};
    let props = [];
    if (a.transitionProperty) props = [a.transitionProperty];
    else {
      try { props = [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)))].filter((p) => !["offset", "easing", "composite", "computedOffset"].includes(p)); } catch { /* ignore */ }
    }
    return { type: a.constructor.name, props, duration: t.duration, endTime: t.endTime };
  }));
}

/** Box of the element plus every descendant, so screenshots include art outside the control. */
export async function artBox(handle, pad = 40) {
  const box = await handle.evaluate((el) => {
    const rects = [el, ...el.querySelectorAll("*")].map((n) => n.getBoundingClientRect()).filter((r) => r.width && r.height);
    const x1 = Math.min(...rects.map((r) => r.left)), y1 = Math.min(...rects.map((r) => r.top));
    const x2 = Math.max(...rects.map((r) => r.right)), y2 = Math.max(...rects.map((r) => r.bottom));
    return { x: x1 + scrollX, y: y1 + scrollY, width: x2 - x1, height: y2 - y1 };
  });
  return { x: Math.max(0, box.x - pad), y: Math.max(0, box.y - pad), width: box.width + pad * 2, height: box.height + pad * 2 };
}

/**
 * Screenshots a page-coordinate box. Never uses fullPage: a full-page capture resizes the viewport,
 * which fires resize observers and media queries and changes the very state being captured.
 */
export async function shot(page, clip, file) {
  const v = await page.evaluate(() => ({ sx: scrollX, sy: scrollY, w: innerWidth, h: innerHeight }));
  const x = Math.max(0, clip.x - v.sx), y = Math.max(0, clip.y - v.sy);
  const box = {
    x, y,
    width: Math.max(1, Math.min(clip.x - v.sx + clip.width, v.w) - x),
    height: Math.max(1, Math.min(clip.y - v.sy + clip.height, v.h) - y),
  };
  await page.screenshot({ path: file, clip: box, animations: "allow", caret: "hide" });
  return file;
}

/** Fraction of pixels that differ by more than a small tolerance. Runs in the browser, no image library needed. */
export async function diffRatio(page, fileA, fileB) {
  const [a, b] = [fs.readFileSync(fileA).toString("base64"), fs.readFileSync(fileB).toString("base64")];
  const scratch = await page.context().newPage();
  try {
    return await scratch.evaluate(async ([a64, b64]) => {
      const load = async (s) => createImageBitmap(await (await fetch(`data:image/png;base64,${s}`)).blob());
      const [ia, ib] = await Promise.all([load(a64), load(b64)]);
      const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
      const read = (img) => {
        const c = new OffscreenCanvas(w, h);
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, w, h).data;
      };
      const da = read(ia), db = read(ib);
      let diff = 0;
      for (let i = 0; i < da.length; i += 4) {
        if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 48) diff++;
      }
      const sizePenalty = ia.width !== ib.width || ia.height !== ib.height ? 0.01 : 0;
      return diff / (w * h) + sizePenalty;
    }, [a, b]);
  } finally {
    await scratch.close();
  }
}

/** Lays several screenshots side by side into one image, so an agent can read a sequence in one view. */
export async function filmstrip(browser, items, file, title = "", { maxWidth = 360, maxHeight = 300 } = {}) {
  const page = await browser.newPage({ viewport: { width: Math.max(1600, (maxWidth + 16) * Math.min(items.length, 4)), height: 400 } });
  try {
    const cells = items.map(({ label, file: f }) =>
      `<figure><img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}"><figcaption>${label}</figcaption></figure>`).join("");
    await page.setContent(`<!doctype html><style>
      body{margin:0;padding:12px;background:#222;color:#eee;font:13px system-ui}
      h1{font-size:14px;margin:0 0 8px} .row{display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap}
      figure{margin:0;background:#000;padding:4px} img{display:block;max-width:${maxWidth}px;max-height:${maxHeight}px}
      figcaption{padding-top:4px;text-align:center}</style><h1>${title}</h1><div class="row">${cells}</div>`);
    await page.locator("body").screenshot({ path: file });
    return file;
  } finally {
    await page.close();
  }
}

/**
 * WCAG contrast of the control's text colour against the dominant colour actually rendered behind it.
 * Game-style controls paint their plates on child layers and pseudo-elements, so the DOM background
 * chain is unreliable; this reads the pixels of a screenshot of the label's box instead.
 */
export async function textContrast(page, handle, file) {
  const info = await handle.evaluate((el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 3) });
    const node = walker.nextNode();
    if (!node) return null;
    const host = node.parentElement;
    const cs = getComputedStyle(host);
    const range = document.createRange();
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    return { color: cs.color, size: parseFloat(cs.fontSize), weight: Number(cs.fontWeight), box: { x: r.left + scrollX, y: r.top + scrollY, width: r.width, height: r.height } };
  });
  if (!info || info.box.width < 1) return null;
  await shot(page, info.box, file);
  const b64 = fs.readFileSync(file).toString("base64");
  const scratch = await page.context().newPage();
  try {
    const result = await scratch.evaluate(async ([png, color]) => {
      const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${png}`)).blob());
      const c = new OffscreenCanvas(img.width, img.height);
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height).data;
      const [fr, fg, fb] = color.match(/[\d.]+/g).map(Number);
      const counts = new Map();
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (Math.abs(r - fr) + Math.abs(g - fg) + Math.abs(b - fb) < 90) continue;   // text and its antialiasing
        // 16 levels per channel: subtle gradients fall into one bin, real image detail does not.
        const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        counts.set(k, (counts.get(k) ?? 0) + 1);
        total++;
      }
      if (!total) return { ratio: null, share: 0 };
      const [k, n] = [...counts].sort((x, y) => y[1] - x[1])[0];
      const bg = [(k >> 8) << 4, ((k >> 4) & 15) << 4, (k & 15) << 4].map((v) => v + 8);
      const lum = ([r, g, b]) => {
        const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const [l1, l2] = [lum([fr, fg, fb]), lum(bg)].sort((x, y) => y - x);
      return { ratio: Math.round(((l1 + 0.05) / (l2 + 0.05)) * 100) / 100, share: n / total };
    }, [b64, info.color]);
    return {
      ...result,
      large: info.size >= 24 || (info.weight >= 700 && info.size >= 18.66),
      uncertain: result.share < 0.35,   // busy backgrounds (images, gradients) have no single dominant colour
    };
  } finally {
    await scratch.close();
  }
}
