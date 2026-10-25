#!/usr/bin/env node
// Verifies expressive controls in a real browser and writes evidence (report.json, summary.md, PNGs).
//
//   node scripts/verify.mjs <url|file> --selector ".nav a" [--selector ".cta"] [--max 3] [--context ".nav"]
//        [--click-first ".menu-toggle"]   (opens a menu or dialog before every check)
//        [--long-label] [--no-axe] [--out dir]
//
// Exit code 1 when any check fails. See references/workflows/verify.md for what each check means.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  artBox, assertAllowed, describeAnimations, diffRatio, filmstrip, freezeAnimations, launch, list,
  outDir, parseArgs, releaseFrozen, runAxe, seekFrozen, settle, shot, textContrast, toUrl,
} from "./lib/browser.mjs";

const DEFAULT_VIEWPORT = { width: 1440, height: 900 };

function parseViewport(value) {
  if (typeof value !== "string") return DEFAULT_VIEWPORT;
  const m = /^(\d{3,4})x(\d{3,4})$/.exec(value);
  if (!m) throw new Error(`--viewport must look like 1440x900, got "${value}"`);
  return { width: Number(m[1]), height: Number(m[2]) };
}
const MOBILE = { width: 390, height: 844 };
const MOVEMENT = /transform|translate|rotate|scale|left|top|right|bottom|inset|margin|offset|clip-path|width|height/;

const slug = (s) => s.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 40) || "control";
const pct = (r) => `${(r * 100).toFixed(2)}%`;

async function center(handle) {
  const b = await handle.boundingBox();
  return { x: b.x + b.width / 2, y: b.y + b.height / 2, box: b };
}

async function away(page) {
  await page.mouse.move(2, 2);
}

/** Clicks each visible --click-first selector (opens menus or dialogs) and waits for the page to settle. */
async function prepare(page, clickFirst = []) {
  for (const sel of clickFirst) {
    const loc = page.locator(sel).first();
    if (await loc.isVisible().catch(() => false)) {
      await loc.click();
      await page.waitForTimeout(50);
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().endTime === Infinity), null, { timeout: 3000 }).catch(() => {});
    }
  }
}

function union(a, b) {
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
  return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
}

async function clampClip(page, clip) {
  const { w, h } = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
  const x = Math.max(0, Math.floor(clip.x)), y = Math.max(0, Math.floor(clip.y));
  return { x, y, width: Math.max(1, Math.min(Math.ceil(clip.width), w - x)), height: Math.max(1, Math.min(Math.ceil(clip.height), h - y)) };
}

async function horizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Points outside the control's box that still hit the control: decoration or pseudo-elements catching the pointer. */
async function outsideHits(handle) {
  return handle.evaluate((el) => {
    const r = el.getBoundingClientRect();
    let max = 0;
    for (const d of [4, 12, 24, 40]) {
      for (const f of [0.1, 0.5, 0.9]) {
        const pts = [
          [r.left + r.width * f, r.top - d], [r.left + r.width * f, r.bottom + d],
          [r.left - d, r.top + r.height * f], [r.right + d, r.top + r.height * f],
        ];
        for (const [x, y] of pts) {
          if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
          const hit = document.elementFromPoint(x, y);
          if (hit && el.contains(hit)) max = Math.max(max, d);
        }
      }
    }
    return max;
  });
}

/**
 * Rests the pointer 3px inside and outside each edge with a 1px hand tremor, and counts :hover changes.
 * The tremor never crosses a static edge, so any change means the hit area itself is moving (flicker).
 * (Browsers only re-test hover when the pointer moves, which is why a perfectly still pointer can hide it.)
 */
async function flicker(page, handle) {
  const b = await handle.boundingBox();
  const points = [
    [b.x - 3, b.y + b.height / 2], [b.x + 3, b.y + b.height / 2],
    [b.x + b.width + 3, b.y + b.height / 2], [b.x + b.width - 3, b.y + b.height / 2],
    [b.x + b.width / 2, b.y - 3], [b.x + b.width / 2, b.y + 3],
    [b.x + b.width / 2, b.y + b.height + 3], [b.x + b.width / 2, b.y + b.height - 3],
  ];
  let worst = 0;
  for (const [x, y] of points) {
    await away(page);
    await page.waitForTimeout(60);
    await page.mouse.move(x, y, { steps: 4 });
    await page.waitForTimeout(120);
    let last = await handle.evaluate((el) => el.matches(":hover"));
    let changes = 0;
    for (let i = 0; i < 8; i++) {
      await page.mouse.move(x + (i % 2 ? 0.5 : -0.5), y);
      await page.waitForTimeout(90);
      const now = await handle.evaluate((el) => el.matches(":hover"));
      if (now !== last) { changes++; last = now; }
    }
    worst = Math.max(worst, changes);
  }
  return worst;
}

const COMPOSITE_ITEM = ["tab", "radio", "option", "menuitem", "menuitemradio", "gridcell", "treeitem"];

/**
 * Reaches the element the way a keyboard user would: Tab, and inside composite widgets
 * (tabs, radio groups, listboxes) with roving tabindex, the arrow keys.
 * Returns { presses, via } or null.
 */
async function tabTo(page, handle, limit = 400) {
  const isActive = () => handle.evaluate((el) => el === document.activeElement || el.contains(document.activeElement));
  // A roving item (ARIA composite role with tabindex -1, or an unchecked native radio) is reached
  // by tabbing into its group and then using the arrow keys.
  const composite = await handle.evaluate((el, roles) => {
    const isItem = (n) => n && (roles.includes(n.getAttribute?.("role")) || (n.tagName === "INPUT" && n.type === "radio"));
    const item = isItem(el) ? el : el.querySelector(['input[type="radio"]', ...roles.map((r) => `[role="${r}"]`)].join(","));
    if (!item) return false;
    const roving = item.tagName === "INPUT" ? !item.checked : item.tabIndex < 0;
    window.__verifyItem = item;
    return roving;
  }, COMPOSITE_ITEM);
  // Reset the sequential-focus starting point to the top of the document (Chromium otherwise
  // continues from the last clicked element).
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const b = document.body;
    const had = b.getAttribute("tabindex");
    b.setAttribute("tabindex", "-1");
    b.focus({ preventScroll: true });
    if (had === null) b.removeAttribute("tabindex"); else b.setAttribute("tabindex", had);
  });
  for (let i = 1; i <= limit; i++) {
    await page.keyboard.press("Tab");
    if (await isActive()) return { presses: i, via: "Tab" };
    if (composite) {
      const sameGroup = await page.evaluate((roles) => {
        const a = document.activeElement;
        const item = window.__verifyItem;
        const isItem = (n) => n && (roles.includes(n.getAttribute?.("role")) || (n.tagName === "INPUT" && n.type === "radio"));
        const group = (n) => (n.tagName === "INPUT" ? `radio:${n.name}`
          : n.closest('[role="tablist"],[role="radiogroup"],[role="listbox"],[role="menu"],[role="menubar"],[role="grid"],[role="tree"]') ?? n.parentElement);
        return Boolean(isItem(a) && group(a) === group(item));
      }, COMPOSITE_ITEM);
      if (sameGroup) {
        for (let j = 1; j <= 40; j++) {
          await page.keyboard.press("ArrowRight");
          if (await isActive()) return { presses: i + j, via: "Tab + arrow keys" };
        }
        for (let j = 1; j <= 40; j++) {
          await page.keyboard.press("ArrowDown");
          if (await isActive()) return { presses: i + 40 + j, via: "Tab + arrow keys" };
        }
        return null;
      }
    }
  }
  return null;
}

async function recordMotion(page, handle, browser, dir, clip, phase, trigger) {
  await trigger();
  const end = await freezeAnimations(handle);
  const frames = [];
  if (end > 0) {
    for (const f of [0, 0.15, 0.3, 0.5, 0.75, 1]) {
      await seekFrozen(page, end * f);
      frames.push({ label: `${phase} ${Math.round(end * f)}ms`, file: await shot(page, clip, path.join(dir, `${phase}-${String(Math.round(f * 100)).padStart(3, "0")}.png`)) });
    }
  }
  await releaseFrozen(page);
  await settle(page, handle);
  const strip = frames.length ? await filmstrip(browser, frames, path.join(dir, `${phase}-strip.png`), `${phase} (${Math.round(end)}ms)`) : null;
  return { end, strip };
}

async function verifyControl({ browser, page, url, selector, index, root, opts }) {
  const loc = page.locator(selector).nth(index);
  if (!(await loc.isVisible())) {
    const { width, height } = page.viewportSize();
    return {
      selector, index, name: "", status: "fail", shots: {},
      checks: [{ id: "visible", status: "fail", detail: `not visible at ${width}×${height}; use --viewport (e.g. 390x844) or --click-first to open its container` }],
    };
  }
  const handle = await loc.elementHandle();
  await handle.scrollIntoViewIfNeeded();
  const name = (await handle.evaluate((el) => el.getAttribute("aria-label") || el.innerText || el.value || el.tagName)).trim().replace(/\s+/g, " ").slice(0, 60);
  const dir = path.join(root, `${slug(selector)}-${index}`);
  fs.mkdirSync(dir, { recursive: true });
  const checks = [];
  const add = (id, status, detail) => checks.push({ id, status, detail });
  const shots = {};

  // Box covering rest and hover art.
  await away(page); await settle(page, handle);
  let clip = await artBox(handle);
  const c = await center(handle);
  await page.mouse.move(c.x, c.y); await settle(page, handle);
  clip = union(clip, await artBox(handle));
  // Change ratios are measured on the control's own art box; --context only widens the evidence images
  // (shared markers and previews live outside the control), so a big container can't dilute a small change.
  const ownClip = await clampClip(page, clip);
  if (opts.context) {
    const ctx = await handle.evaluateHandle((el, s) => el.closest(s) ?? document.querySelector(s), opts.context);
    if (await ctx.evaluate((n) => n !== null)) clip = union(clip, await artBox(ctx.asElement(), 8));
  }
  clip = await clampClip(page, clip);
  const own = {};
  const capture = async (state) => {
    shots[state] = await shot(page, clip, path.join(dir, `${state}.png`));
    own[state] = opts.context ? await shot(page, ownClip, path.join(dir, `${state}-own.png`)) : shots[state];
  };

  // States
  await away(page); await settle(page, handle);
  await capture("rest");
  await page.mouse.move(c.x, c.y); await settle(page, handle);
  await capture("hover");
  const hoverDiff = await diffRatio(page, own.rest, own.hover);
  add("hover-visible", hoverDiff > 0.002 ? "pass" : "warn", `hover changes ${pct(hoverDiff)} of the art box`);

  const hoverHits = await outsideHits(handle);
  await away(page); await settle(page, handle);
  const restHits = await outsideHits(handle);
  const hits = Math.max(hoverHits, restHits);
  add("decoration-pointer", hits > 12 ? "fail" : hits > 0 ? "warn" : "pass",
    hits ? `pointer still hits the control ${hits}px outside its box${hoverHits > restHits ? " (only while hovered)" : ""}` : "nothing outside the box captures the pointer");

  // Motion
  const enter = await recordMotion(page, handle, browser, dir, clip, "enter", () => page.mouse.move(c.x, c.y));
  const exit = await recordMotion(page, handle, browser, dir, clip, "exit", () => away(page));
  shots.enter_strip = enter.strip;
  shots.exit_strip = exit.strip;
  add("motion-captured", enter.end || exit.end ? "pass" : "info",
    enter.end || exit.end ? `entry ${Math.round(enter.end)}ms, exit ${Math.round(exit.end)}ms` : "no CSS or Web Animations found; motion may be instant or script-driven");
  if (enter.end > 700) add("entry-duration", "warn", `entry takes ${Math.round(enter.end)}ms; hover feedback over ~700ms feels sluggish`);

  // Interruption and rapid re-entry must land on the same settled pose as a clean hover.
  const enterWait = Math.max(40, enter.end * 0.4), exitWait = Math.max(40, exit.end * 0.4);
  await away(page); await settle(page, handle);
  await page.mouse.move(c.x, c.y); await page.waitForTimeout(enterWait);
  await away(page); await page.waitForTimeout(exitWait);
  for (let i = 0; i < 4; i++) {
    await page.mouse.move(c.x, c.y); await page.waitForTimeout(30);
    await away(page); await page.waitForTimeout(30);
  }
  await page.mouse.move(c.x, c.y); await settle(page, handle, 5000);
  // Only the control and its context count: unrelated page animation (a progress demo, a carousel) is not a stale queue.
  const running = await handle.evaluate((el, ctxSel) => {
    const ctx = ctxSel ? el.closest(ctxSel) ?? document.querySelector(ctxSel) : null;
    return document.getAnimations().filter((a) => {
      const t = a.effect?.target;
      return a.playState === "running" && a.effect.getComputedTiming().endTime !== Infinity
        && t && (el.contains(t) || ctx?.contains(t));
    }).length;
  }, opts.context ?? null);
  shots.interrupted = await shot(page, clip, path.join(dir, "interrupted.png"));
  let interruptDiff = await diffRatio(page, shots.hover, shots.interrupted);
  if (interruptDiff > 0.01 && !running) {
    // Re-baseline: compare against a fresh clean hover so drift from earlier steps can't fail the check.
    await away(page); await settle(page, handle);
    await page.mouse.move(c.x, c.y); await settle(page, handle);
    const fresh = await shot(page, clip, path.join(dir, "hover-rebaseline.png"));
    interruptDiff = Math.min(interruptDiff, await diffRatio(page, fresh, shots.interrupted));
  }
  add("interruption", running ? "fail" : interruptDiff > 0.01 ? "fail" : "pass",
    running ? `${running} animations still running after rapid re-entry (stale queue)` : `settled pose after interruption differs by ${pct(interruptDiff)} from a clean hover`);

  // Hover flicker at the edges
  const toggles = await flicker(page, handle);
  add("hover-flicker", toggles >= 2 ? "fail" : "pass", toggles >= 2 ? `:hover changed ${toggles} times while the pointer rested near an edge (the hit area moves on hover)` : "no flicker at the edges");

  // Press state (released away from the control so links don't navigate)
  await page.mouse.move(c.x, c.y); await settle(page, handle);
  await page.mouse.down(); await page.waitForTimeout(90);
  await capture("pressed");
  await away(page); await page.mouse.up();
  await page.evaluate(() => getSelection()?.removeAllRanges());   // the drag-away release can select text
  await settle(page, handle);
  // Releasing outside can land a click on a dialog backdrop and close it; reopen for the remaining checks.
  if (opts.clickFirst?.length && !(await handle.isVisible())) { await prepare(page, opts.clickFirst); await settle(page, handle); }
  const pressDiff = await diffRatio(page, own.hover, own.pressed);
  add("press-visible", pressDiff > 0.001 ? "pass" : "warn", `pressed differs ${pct(pressDiff)} from hover`);

  // Keyboard
  const reached = await tabTo(page, handle);
  if (reached === null) add("keyboard-reachable", "fail", "not reachable with Tab (or arrow keys inside its widget)");
  else {
    await settle(page, handle);
    await capture("focus");
    const focusDiff = await diffRatio(page, own.rest, own.focus);
    const visible = await handle.evaluate((el) => (el.matches(":focus-visible") || el.querySelector(":focus-visible") !== null));
    add("keyboard-reachable", "pass", `reached after ${reached.presses} key presses (${reached.via})`);
    add("focus-visible", focusDiff > 0.002 && visible ? "pass" : "fail", `focus changes ${pct(focusDiff)} of the art box; :focus-visible ${visible ? "matches" : "does not match"}`);
    await page.evaluate(() => document.activeElement?.blur?.());
  }

  // Target size
  const { box } = await center(handle);
  const small = Math.min(box.width, box.height);
  add("target-size", small < 24 ? "fail" : small < 44 ? "warn" : "pass", `${Math.round(box.width)}×${Math.round(box.height)}px (24px minimum, 44px recommended)`);

  // Contrast at rest and on hover
  for (const state of ["rest", "hover"]) {
    if (state === "rest") await away(page); else await page.mouse.move(c.x, c.y);
    await settle(page, handle);
    const ct = await textContrast(page, handle, path.join(dir, `text-${state}.png`));
    if (!ct || ct.ratio === null) { add(`contrast-${state}`, "info", "no text to measure"); continue; }
    const need = ct.large ? 3 : 4.5;
    add(`contrast-${state}`, ct.uncertain ? "warn" : ct.ratio >= need ? "pass" : "fail",
      `${ct.ratio}:1 against the dominant backdrop (needs ${need}:1)${ct.uncertain ? "; backdrop is busy, check by eye" : ""}`);
  }
  await away(page);

  // Long labels
  if (opts.longLabel) {
    const overflow = await handle.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 3) });
      const node = walker.nextNode();
      if (!node) return null;
      const original = node.textContent;
      node.textContent = `${original} ${original} ${original}`.trim();
      const clipped = [el, ...el.querySelectorAll("*")].some((n) => {
        const s = getComputedStyle(n);
        return /hidden|clip/.test(s.overflowX + s.overflowY) && n.scrollWidth > n.clientWidth + 1;
      });
      el.dataset.verifyOriginal = original;
      return { clipped, width: el.getBoundingClientRect().width };
    });
    if (overflow) {
      shots.long_label = await shot(page, await clampClip(page, await artBox(handle)), path.join(dir, "long-label.png"));
      add("long-label", overflow.clipped ? "warn" : "pass", overflow.clipped ? "tripled label is clipped" : `tripled label fits (${Math.round(overflow.width)}px wide)`);
      await handle.evaluate((el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.textContent.trim() ? 1 : 3) });
        walker.nextNode().textContent = el.dataset.verifyOriginal;
        delete el.dataset.verifyOriginal;
      });
    }
  }

  // Reduced motion: movement removed, state change kept.
  const rmContext = await browser.newContext({ viewport: page.viewportSize(), reducedMotion: "reduce" });
  try {
    const rm = await rmContext.newPage();
    await rm.goto(url, { waitUntil: "load" }); await prepare(rm, opts.clickFirst);
    const h = await rm.locator(selector).nth(index).elementHandle();
    await h.scrollIntoViewIfNeeded();
    await away(rm); await settle(rm, h);
    const rc = await center(h);
    const restFile = await shot(rm, clip, path.join(dir, "reduced-rest.png"));
    await rm.mouse.move(rc.x, rc.y);
    const anims = await describeAnimations(h);
    const moving = anims.filter((a) => a.props.some((p) => MOVEMENT.test(p)) && a.endTime > 150 && a.endTime !== Infinity);
    await settle(rm, h);
    shots.reduced_hover = await shot(rm, clip, path.join(dir, "reduced-hover.png"));
    const kept = await diffRatio(rm, restFile, shots.reduced_hover);
    add("reduced-motion-movement", moving.length ? "fail" : "pass",
      moving.length ? `${moving.length} movement animations still run over 150ms (${[...new Set(moving.flatMap((a) => a.props))].join(", ")})` : "no long movement under prefers-reduced-motion");
    if (hoverDiff > 0.002) {
      add("reduced-motion-state", kept > 0.002 ? "pass" : "fail", kept > 0.002 ? `state change kept (${pct(kept)})` : "reduced motion removes the hover state entirely");
    }
  } finally {
    await rmContext.close();
  }

  // Mobile
  const mobile = await browser.newContext({ viewport: MOBILE, hasTouch: true, isMobile: true });
  try {
    const mp = await mobile.newPage();
    await mp.goto(url, { waitUntil: "load" }); await prepare(mp, opts.clickFirst);
    const h = await mp.locator(selector).nth(index).elementHandle();
    const shown = await h.evaluate((el) => el.checkVisibility({ visibilityProperty: true, opacityProperty: true }));
    const b = shown ? (await h.scrollIntoViewIfNeeded(), await h.boundingBox()) : null;
    if (!shown) add("mobile-visible", "info", "hidden at 390px (for example inside a closed menu); verify the open state separately");
    else if (!b) add("mobile-visible", "warn", "not rendered at 390px");
    else {
      const offscreen = b.x < -1 || b.x + b.width > MOBILE.width + 1;
      add("mobile-visible", offscreen ? "fail" : "pass", offscreen ? "extends past the 390px viewport" : "fits the 390px viewport");
      const ms = Math.min(b.width, b.height);
      add("mobile-target", ms < 44 ? "warn" : "pass", `${Math.round(b.width)}×${Math.round(b.height)}px on touch`);
      shots.mobile = await shot(mp, await clampClip(mp, await artBox(h)), path.join(dir, "mobile.png"));
    }
  } finally {
    await mobile.close();
  }

  await filmstrip(browser, Object.entries(shots).filter(([k, f]) => f && !k.endsWith("strip")).map(([k, f]) => ({ label: k, file: f })),
    path.join(dir, "states-strip.png"), `${selector} [${index}] ${name}`);
  shots.states_strip = path.join(dir, "states-strip.png");

  const status = checks.some((x) => x.status === "fail") ? "fail" : checks.some((x) => x.status === "warn") ? "warn" : "pass";
  return { selector, index, name, status, checks, shots: Object.fromEntries(Object.entries(shots).map(([k, v]) => [k, v && path.relative(root, v)])) };
}

export async function verify(target, { selectors, max = 3, longLabel = false, axe = true, context, clickFirst, viewport = DEFAULT_VIEWPORT, out } = {}) {
  const url = toUrl(target);
  assertAllowed(url);
  const root = outDir("verify", out);
  const browser = await launch();
  const report = { url, created: new Date().toISOString(), page: [], controls: [] };
  try {
    const desktop = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    const page = await desktop.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
    await page.goto(url, { waitUntil: "load" });

    const overflow = await horizontalOverflow(page);
    report.page.push({ id: "horizontal-overflow-desktop", status: overflow > 0 ? "fail" : "pass", detail: overflow > 0 ? `page scrolls sideways by ${overflow}px` : "no sideways scroll" });
    if (axe) {
      const v = await runAxe(page);
      if (v === null) report.page.push({ id: "axe", status: "info", detail: "axe-core not installed; accessibility rules skipped" });
      else {
        const bad = v.filter((x) => ["serious", "critical"].includes(x.impact));
        report.page.push({ id: "axe", status: bad.length ? "fail" : v.length ? "warn" : "pass", detail: v.length ? v.map((x) => `${x.impact} ${x.id}: ${x.help} (${x.nodes.join(", ")})`).join("; ") : "no violations" });
      }
    }
    const mctx = await browser.newContext({ viewport: MOBILE, hasTouch: true, isMobile: true });
    const mpage = await mctx.newPage();
    await mpage.goto(url, { waitUntil: "load" });
    const mo = await horizontalOverflow(mpage);
    report.page.push({ id: "horizontal-overflow-mobile", status: mo > 0 ? "fail" : "pass", detail: mo > 0 ? `page scrolls sideways by ${mo}px at 390px` : "no sideways scroll at 390px" });
    await mctx.close();

    for (const selector of selectors) {
      const count = await page.locator(selector).count();
      if (!count) { report.controls.push({ selector, status: "fail", checks: [{ id: "found", status: "fail", detail: "selector matched nothing" }] }); continue; }
      for (let i = 0; i < Math.min(count, max); i++) {
        await page.reload({ waitUntil: "load" }); await prepare(page, clickFirst);
        report.controls.push(await verifyControl({ browser, page, url, selector, index: i, root, opts: { longLabel, context, clickFirst } }));
      }
    }
    report.page.push({ id: "console-errors", status: errors.length ? "warn" : "pass", detail: errors.length ? errors.slice(0, 10).join(" | ") : "none" });
    await desktop.close();
  } finally {
    await browser.close();
  }
  const all = [...report.page, ...report.controls.flatMap((c) => c.checks ?? [])];
  report.summary = Object.fromEntries(["pass", "warn", "fail", "info"].map((s) => [s, all.filter((x) => x.status === s).length]));
  fs.writeFileSync(path.join(root, "report.json"), JSON.stringify(report, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "summary.md"), summarize(report));
  return { root, report };
}

function summarize(report) {
  const icon = { pass: "✓", warn: "!", fail: "✗", info: "·" };
  const lines = [`# Verify: ${report.url}`, "", `${report.summary.fail} fail · ${report.summary.warn} warn · ${report.summary.pass} pass`, "", "## Page", ""];
  for (const c of report.page) lines.push(`- ${icon[c.status]} **${c.id}**: ${c.detail}`);
  for (const ctl of report.controls) {
    lines.push("", `## ${ctl.selector} [${ctl.index ?? 0}] ${ctl.name ?? ""} (${ctl.status})`, "");
    for (const c of ctl.checks ?? []) lines.push(`- ${icon[c.status]} **${c.id}**: ${c.detail}`);
    if (ctl.shots) lines.push("", `Evidence: ${Object.values(ctl.shots).filter(Boolean).filter((f) => f.endsWith("strip.png")).join(", ")}`);
  }
  return lines.join("\n") + "\n";
}

async function cli() {
  const args = parseArgs(process.argv.slice(2));
  const target = args._[0];
  const selectors = list(args.selector);
  if (!target || !selectors.length) {
    process.stdout.write("Usage: node scripts/verify.mjs <url|file> --selector <css> [--selector <css>] [--max 3] [--long-label] [--no-axe] [--out dir]\n");
    return 1;
  }
  const { root, report } = await verify(target, {
    selectors, max: Number(args.max ?? 3), longLabel: Boolean(args["long-label"]), axe: !args["no-axe"],
    context: typeof args.context === "string" ? args.context : undefined, clickFirst: list(args["click-first"]).filter((s) => typeof s === "string"), viewport: parseViewport(args.viewport), out: args.out === true ? undefined : args.out,
  });
  process.stdout.write(`${JSON.stringify({ out: root, summary: report.summary, failing: [...report.page, ...report.controls.flatMap((c) => (c.checks ?? []).map((x) => ({ ...x, control: `${c.selector}[${c.index ?? 0}]` })))].filter((x) => x.status === "fail") }, null, 2)}\n`);
  return report.summary.fail ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  cli().then((code) => { process.exitCode = code; }).catch((e) => {
    process.stderr.write(`verify error: ${process.env.DEBUG ? e.stack : e.message}\n`);
    process.exitCode = 1;
  });
}
