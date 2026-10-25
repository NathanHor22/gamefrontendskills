#!/usr/bin/env node
// Audits an existing site before redesign work: screenshots, interactive inventory, computed style
// fingerprint, generic-UI signals, accessibility. Read-only: it follows same-origin links with GET
// navigation and never submits forms or clicks anything.
//
//   node scripts/audit.mjs <url|file> [--pages 6] [--viewports 390,768,1440] [--out dir] [--no-axe]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { assertAllowed, launch, outDir, parseArgs, runAxe, toUrl } from "./lib/browser.mjs";

const INTERACTIVE = 'a[href], button, [role="button"], [role="link"], [role="tab"], input:not([type="hidden"]), select, textarea, summary';
const SKIP_LINK = /logout|log-out|signout|sign-out|delete|remove|unsubscribe|cart\/(add|clear)|\.(pdf|zip|png|jpe?g|gif|mp4|webm)$/i;

/** Runs inside the page: inventory + style fingerprint for every visible interactive element. */
function inventory(selector) {
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
  };
  const pick = (s) => ({
    font: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
    size: s.fontSize, weight: s.fontWeight, transform: s.textTransform, tracking: s.letterSpacing,
    color: s.color, background: s.backgroundColor, image: s.backgroundImage !== "none",
    radius: s.borderRadius, border: s.borderStyle !== "none" && s.borderWidth !== "0px" ? `${s.borderWidth} ${s.borderStyle} ${s.borderColor}` : "none",
    shadow: s.boxShadow !== "none", clip: s.clipPath !== "none", rotate: s.transform !== "none",
    transition: s.transitionProperty === "all" && s.transitionDuration === "0s" ? "none" : `${s.transitionProperty} ${s.transitionDuration} ${s.transitionTimingFunction}`,
  });
  const items = [...document.querySelectorAll(selector)].filter(visible).slice(0, 300).map((el) => {
    const r = el.getBoundingClientRect();
    const name = (el.getAttribute("aria-label") || el.innerText || el.value || el.getAttribute("title") || "").trim().replace(/\s+/g, " ").slice(0, 60);
    const before = getComputedStyle(el, "::before"), after = getComputedStyle(el, "::after");
    return {
      tag: el.tagName.toLowerCase(), role: el.getAttribute("role"), name,
      box: { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) },
      in_nav: Boolean(el.closest("nav, header")), pseudo_art: before.content !== "none" || after.content !== "none",
      style: pick(getComputedStyle(el)),
    };
  });
  const textEls = [...document.querySelectorAll("h1, h2, h3, p, li, a, button, label")].filter(visible);
  const families = {};
  for (const el of textEls) {
    const f = getComputedStyle(el).fontFamily.split(",")[0].replace(/["']/g, "").trim();
    families[f] = (families[f] ?? 0) + 1;
  }
  const headings = [...document.querySelectorAll("h1, h2")].filter(visible).slice(0, 6).map((h) => {
    const s = getComputedStyle(h);
    return { tag: h.tagName.toLowerCase(), text: h.innerText.trim().slice(0, 60), size: s.fontSize, font: s.fontFamily.split(",")[0].replace(/["']/g, ""), weight: s.fontWeight };
  });
  // Repeated equal-size siblings with identical radius = a uniform card grid.
  const grids = [];
  for (const parent of document.querySelectorAll("main *, body > *")) {
    const kids = [...parent.children].filter(visible);
    if (kids.length < 3) continue;
    const sig = (k) => { const r = k.getBoundingClientRect(); const s = getComputedStyle(k); return `${Math.round(r.width)}x${Math.round(r.height)}|${s.borderRadius}|${s.backgroundColor}`; };
    const first = sig(kids[0]);
    if (kids.every((k) => sig(k) === first) && kids[0].getBoundingClientRect().height > 120) {
      grids.push({ count: kids.length, size: first.split("|")[0], radius: first.split("|")[1] });
    }
  }
  let reducedMotionRule = false;
  for (const sheet of document.styleSheets) {
    try {
      const walk = (rules) => { for (const r of rules) { if (r.media && /prefers-reduced-motion/.test(r.media.mediaText)) reducedMotionRule = true; if (r.cssRules) walk(r.cssRules); } };
      walk(sheet.cssRules);
    } catch { /* cross-origin sheet */ }
  }
  const links = [...document.querySelectorAll("a[href]")].map((a) => a.href);
  return {
    title: document.title, items, families, headings, grids: grids.slice(0, 5), reducedMotionRule, links,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
}

function signals(pages) {
  const items = pages.flatMap((p) => p.desktop.items);
  // Buttons, plus links styled as buttons (they have a filled background).
  const buttons = items.filter((i) => i.tag === "button" || i.role === "button" || (i.tag === "a" && i.style.background !== "rgba(0, 0, 0, 0)"));
  const out = [];
  const share = (list, pred) => (list.length ? list.filter(pred).length / list.length : 0);
  const families = {};
  for (const p of pages) for (const [f, n] of Object.entries(p.desktop.families)) families[f] = (families[f] ?? 0) + n;
  const famList = Object.keys(families);
  if (famList.length <= 1) out.push({ id: "single-typeface", detail: `all text uses ${famList[0] ?? "one font"}; no display/body contrast` });
  const radii = buttons.map((b) => b.style.radius);
  const topRadius = radii.sort((a, b) => radii.filter((x) => x === b).length - radii.filter((x) => x === a).length)[0];
  if (buttons.length >= 3 && share(buttons, (b) => b.style.radius === topRadius && !b.style.clip && !b.pseudo_art) >= 0.8 && /^([4-9]|1[0-6])px$/.test(topRadius ?? "")) {
    out.push({ id: "uniform-rounded-rectangles", detail: `${Math.round(share(buttons, (b) => b.style.radius === topRadius) * 100)}% of buttons are ${topRadius}-radius rectangles with no drawn art` });
  }
  if (share(items, (i) => /^all /.test(i.style.transition)) >= 0.5) out.push({ id: "transition-all", detail: "most controls use `transition: all`; entry and exit are the same gesture" });
  const authored = items.some((i) => i.style.clip || i.style.rotate || i.pseudo_art);
  // Rest-state styles only show exit timing, so one shared duration is only a signal on un-authored UI.
  const durations = new Set(items.map((i) => i.style.transition.split(" ")[1]).filter((d) => d && d !== "0s"));
  if (durations.size === 1 && !authored) out.push({ id: "single-duration", detail: `every transition uses ${[...durations][0]}` });
  if (!authored) out.push({ id: "no-authored-shape", detail: "no control uses clip-path, transforms or pseudo-element art" });
  const grids = pages.flatMap((p) => p.desktop.grids);
  if (grids.length) out.push({ id: "uniform-card-grid", detail: grids.map((g) => `${g.count} × ${g.size} (radius ${g.radius})`).join("; ") });
  if (!pages.some((p) => p.desktop.reducedMotionRule)) out.push({ id: "no-reduced-motion", detail: "no prefers-reduced-motion rule found in readable stylesheets" });
  if (pages.some((p) => p.hoverOnlyColor >= 0.8)) out.push({ id: "hover-colour-only", detail: "sampled hovers change only colour/opacity" });
  return out;
}

/** Samples up to 10 controls: does hover change anything besides colour? */
async function hoverProfile(page) {
  const handles = await page.$$(`${INTERACTIVE.split(", ").filter((s) => !s.startsWith("input") && s !== "select" && s !== "textarea").join(", ")}`);
  let colourOnly = 0, sampled = 0;
  for (const h of handles.slice(0, 40)) {
    if (sampled >= 10) break;
    const box = await h.boundingBox();
    if (!box || box.width < 8 || box.y > 4000) continue;
    const snap = () => h.evaluate((el) => {
      const s = getComputedStyle(el);
      const kids = [...el.querySelectorAll("*")].slice(0, 20).map((k) => getComputedStyle(k).transform + getComputedStyle(k).opacity).join("|");
      const pb = getComputedStyle(el, "::before"), pa = getComputedStyle(el, "::after");
      return { shape: [s.transform, s.clipPath, s.boxShadow, s.borderRadius, s.outlineStyle, kids, pb.transform, pb.opacity, pa.transform, pa.opacity, s.textDecorationLine].join("#"), colour: [s.color, s.backgroundColor, s.borderColor, s.opacity].join("#") };
    });
    await h.scrollIntoViewIfNeeded().catch(() => {});
    await page.mouse.move(2, 2);
    const a = await snap();
    const b2 = await h.boundingBox();
    if (!b2) continue;
    await page.mouse.move(b2.x + b2.width / 2, b2.y + b2.height / 2);
    await page.waitForTimeout(450);
    const b = await snap();
    if (a.shape === b.shape && a.colour === b.colour) continue;   // no hover state at all is a different problem
    sampled++;
    if (a.shape === b.shape) colourOnly++;
  }
  await page.mouse.move(2, 2);
  return sampled ? colourOnly / sampled : 0;
}

export async function audit(target, { pages: maxPages = 6, viewports = [390, 768, 1440], axe = true, out } = {}) {
  const start = toUrl(target);
  const origin = new URL(start).origin;
  assertAllowed(start);
  const root = outDir("audit", out);
  const browser = await launch();
  const queue = [start];
  const seen = new Set();
  const pages = [];
  try {
    while (queue.length && pages.length < maxPages) {
      const url = queue.shift().split("#")[0];
      if (seen.has(url)) continue;
      seen.add(url);
      const tail = new URL(url).pathname.split("/").filter(Boolean).slice(-2).join("-");
      const slug = `${String(pages.length + 1).padStart(2, "0")}-${(tail.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home").slice(0, 40)}`;
      const record = { url, slug, shots: {}, console: [] };
      for (const width of viewports) {
        const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 }, isMobile: width < 600, hasTouch: width < 600 });
        const page = await ctx.newPage();
        page.on("console", (m) => { if (m.type() === "error") record.console.push(m.text()); });
        page.on("pageerror", (e) => record.console.push(e.message));
        try {
          const res = await page.goto(url, { waitUntil: "load", timeout: 30000 });
          record.status = res?.status() ?? null;
          await page.waitForTimeout(400);
          const file = path.join(root, `${slug}-${width}.png`);
          const height = await page.evaluate(() => document.documentElement.scrollHeight);
          await page.screenshot({ path: file, fullPage: height < 9000, animations: "disabled" });
          record.shots[width] = path.relative(root, file);
          const data = await page.evaluate(inventory, INTERACTIVE);
          if (width === Math.max(...viewports)) {
            record.desktop = data;
            record.hoverOnlyColor = await hoverProfile(page);
            if (axe) record.axe = await runAxe(page);
            for (const link of data.links) {
              try {
                const u = new URL(link);
                if (u.origin === origin && !SKIP_LINK.test(u.pathname) && !seen.has(u.href.split("#")[0])) queue.push(u.href);
              } catch { /* ignore */ }
            }
          } else {
            record[`overflow_${width}`] = data.overflow;
            record[`items_${width}`] = data.items.length;
          }
        } catch (e) {
          record.error = e.message;
        } finally {
          await ctx.close();
        }
      }
      if (record.desktop) {
        delete record.desktop.links;
        pages.push(record);
      }
    }
  } finally {
    await browser.close();
  }
  const report = { start, created: new Date().toISOString(), pages, signals: signals(pages) };
  fs.writeFileSync(path.join(root, "report.json"), JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "summary.md"), summarize(report));
  return { root, report };
}

function summarize(report) {
  const lines = [`# Audit: ${report.start}`, "", `${report.pages.length} pages · ${report.pages.reduce((n, p) => n + p.desktop.items.length, 0)} interactive elements`, "", "## Generic-UI signals", ""];
  if (!report.signals.length) lines.push("None detected by the automated pass. Still review the screenshots by eye.");
  for (const s of report.signals) lines.push(`- **${s.id}**: ${s.detail}`);
  lines.push("", "## Pages", "");
  for (const p of report.pages) {
    const fams = Object.entries(p.desktop.families).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `${f} (${n})`).join(", ");
    lines.push(`### ${p.desktop.title || p.url}`, "", `- URL: ${p.url}`, `- Screenshots: ${Object.values(p.shots).join(", ")}`,
      `- Typefaces: ${fams || "n/a"}`, `- Headings: ${p.desktop.headings.map((h) => `${h.tag} ${h.size} ${h.font} "${h.text}"`).join("; ") || "none"}`,
      `- Interactive elements: ${p.desktop.items.length} (${p.desktop.items.filter((i) => i.in_nav).length} in nav/header)`);
    for (const [k, v] of Object.entries(p)) if (k.startsWith("overflow_") && v > 0) lines.push(`- Sideways scroll at ${k.slice(9)}px: ${v}px`);
    if (p.axe?.length) lines.push(`- Accessibility: ${p.axe.map((v) => `${v.impact} ${v.id}`).join(", ")}`);
    if (p.console.length) lines.push(`- Console errors: ${p.console.slice(0, 3).join(" | ")}`);
    if (p.error) lines.push(`- Error: ${p.error}`);
    lines.push("");
  }
  lines.push("Next: map each page section to a screen type (references/layout/screen-map.md) and prioritise.", "");
  return lines.join("\n");
}

async function cli() {
  const args = parseArgs(process.argv.slice(2));
  if (!args._[0]) {
    process.stdout.write("Usage: node scripts/audit.mjs <url|file> [--pages 6] [--viewports 390,768,1440] [--no-axe] [--out dir]\n");
    return 1;
  }
  const { root, report } = await audit(args._[0], {
    pages: Number(args.pages ?? 6),
    viewports: typeof args.viewports === "string" ? args.viewports.split(",").map(Number) : undefined,
    axe: !args["no-axe"],
    out: typeof args.out === "string" ? args.out : undefined,
  });
  process.stdout.write(`${JSON.stringify({ out: root, pages: report.pages.length, signals: report.signals }, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  cli().then((code) => { process.exitCode = code; }).catch((e) => {
    process.stderr.write(`audit error: ${process.env.DEBUG ? e.stack : e.message}\n`);
    process.exitCode = 1;
  });
}
