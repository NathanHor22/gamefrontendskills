// Browser checks against the reference templates and a deliberately generic fixture site.
// Skipped when Playwright or Chromium is unavailable (run `npx playwright install chromium`).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { test } from "node:test";
import { findPackage, outDir } from "../skills/game-ui-frontend/scripts/lib/browser.mjs";

const T = path.resolve("skills/game-ui-frontend/templates");
let skip = false;
if (!findPackage("playwright")) skip = "playwright not installed";
else {
  try {
    const { chromium } = await import("playwright");
    await (await chromium.launch()).close();
  } catch {
    skip = "chromium not installed";
  }
}
const out = () => fs.mkdtempSync(path.join(os.tmpdir(), "guf-browser-"));

test("browser runs get distinct system temporary directories and honor explicit output", () => {
  const project = out();
  const cwd = process.cwd();
  try {
    process.chdir(project);
    const first = outDir("audit");
    const second = outDir("audit");
    assert.equal(path.dirname(first), path.resolve(os.tmpdir()));
    assert.notEqual(first, second);
    assert.deepEqual(fs.readdirSync(project), []);
    assert.equal(outDir("capture", "proofs"), path.join(project, "proofs"));
    assert.deepEqual(fs.readdirSync(project), ["proofs"]);
    for (const dir of [first, second]) fs.rmdirSync(dir);
  } finally {
    process.chdir(cwd);
    fs.rmSync(project, { recursive: true, force: true });
  }
});

test("print room transfers the chosen inks and exports the visible proof", { skip }, async () => {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 800 }, reducedMotion: "reduce" });
    await page.goto(pathToFileURL(path.join(T, "print-room.html")).href);
    await page.getByRole("radio", { name: "Heron" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("radio", { name: "Vermilion" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Set the screen" }).click();
    // Physical position of the handle on the near-overhead press view (600 × 400 design surface).
    const room = await page.locator("#room").boundingBox();
    const scale = Math.max(room.width / 600, room.height / 400);
    const y = room.y + room.height / 2 - 44 * scale;
    const start = room.x + room.width / 2 - 110 * scale;
    await page.mouse.move(start, y);
    await page.mouse.down();
    await page.mouse.move(start + 82 * scale, y + 11 * scale, { steps: 5 });
    const partial = Number(await page.getByRole("slider", { name: "Squeegee position" }).inputValue());
    assert.ok(partial > 35 && partial < 65, "dragging transfers colour under the physical handle");
    await page.mouse.move(start + 180 * scale, y + 25 * scale, { steps: 5 });
    await page.mouse.up();
    const save = page.getByRole("link", { name: "Save print as PNG" });
    const downloadPromise = page.waitForEvent("download");
    await save.click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "shoal-prussian.png");
    const bytes = fs.readFileSync(await download.path());
    assert.deepEqual([bytes.readUInt32BE(16), bytes.readUInt32BE(20)], [720, 960]);
    const firstProof = await page.locator("#proof").getAttribute("src");
    assert.equal(firstProof, "data:image/png;base64," + bytes.toString("base64"));

    await page.getByRole("button", { name: "Back to the press" }).click();
    assert.equal(await page.getByRole("radio", { name: "Shoal" }).isChecked(), true);
    await page.getByRole("radio", { name: "Prussian" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.getByRole("button", { name: "Set the screen" }).click();
    await page.getByRole("slider", { name: "Squeegee position" }).press("End");
    await save.waitFor();
    assert.notEqual(await save.getAttribute("href"), firstProof, "the new ink produces new pixels");
  } finally {
    await browser.close();
  }
});
const failing = (report) => [...report.page, ...report.controls.flatMap((c) => (c.checks ?? []).map((x) => ({ ...x, control: `${c.selector}[${c.index}]` })))]
  .filter((x) => x.status === "fail");

// Every template must pass its own verification: the reference code is held to the same bar as user code.
const cases = [
  ["buttons.html", { selectors: [".breakout", ".band:not([aria-current])", ".keycap-action", ".hold"], max: 1, longLabel: true }],
  ["navigation.html", { selectors: [".menu__link", ".tabs__tab"], max: 2, context: ".menu" }],
  ["navigation.html", { selectors: [".menu__link"], max: 1, viewport: { width: 390, height: 844 }, clickFirst: [".menu-toggle"] }],
  ["selector.html", { selectors: [".cell"], max: 2, context: ".select" }],
  ["overlay.html", { selectors: ["#open-pause", ".switch", ".stepper button"], max: 1, context: ".settings__row" }],
  ["overlay.html", { selectors: [".pause__item"], max: 2, clickFirst: ["#open-pause"], context: ".pause__menu" }],
];

for (const [file, opts] of cases) {
  test(`template ${file} passes verify (${opts.selectors.join(", ")}${opts.viewport ? " @390" : ""})`, { skip, timeout: 300000 }, async () => {
    const { verify } = await import("../skills/game-ui-frontend/scripts/verify.mjs");
    const { report } = await verify(path.join(T, file), { ...opts, out: out() });
    assert.deepEqual(failing(report), []);
  });
}

test("verify catches hover flicker and decoration stealing the pointer", { skip, timeout: 300000 }, async () => {
  const dir = out();
  const page = path.join(dir, "bad.html");
  fs.writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>
    body{font:16px sans-serif;padding:80px}
    .shift{display:inline-block;padding:12px 20px;background:#036;color:#fff;transition:translate .15s}
    .shift:hover{translate:12px 0}
    .greedy{position:relative;display:inline-block;margin-left:120px;padding:12px 20px;background:#036;color:#fff}
    .greedy::after{content:"";position:absolute;inset:-40px}
  </style><a class="shift" href="#a">Shifting link</a><a class="greedy" href="#b">Greedy art</a>`);
  const { verify } = await import("../skills/game-ui-frontend/scripts/verify.mjs");
  const { report } = await verify(page, { selectors: [".shift", ".greedy"], max: 1, axe: false, out: dir });
  const fails = failing(report).map((f) => `${f.control}:${f.id}`);
  assert.ok(fails.includes(".shift[0]:hover-flicker"), fails.join(", "));
  assert.ok(fails.includes(".greedy[0]:decoration-pointer"), fails.join(", "));
});

test("audit detects generic-UI signals on the fixture site and few on a template", { skip, timeout: 300000 }, async () => {
  const { audit } = await import("../skills/game-ui-frontend/scripts/audit.mjs");
  const generic = await audit(path.resolve("tests/fixtures/generic-site/index.html"), { pages: 2, viewports: [390, 1440], axe: false, out: out() });
  const ids = generic.report.signals.map((s) => s.id);
  for (const id of ["single-typeface", "uniform-rounded-rectangles", "transition-all", "uniform-card-grid", "no-reduced-motion", "hover-colour-only"]) {
    assert.ok(ids.includes(id), `expected ${id} in ${ids.join(", ")}`);
  }
  assert.equal(generic.report.pages.length, 2, "followed the same-origin link");
  const authored = await audit(path.join(T, "buttons.html"), { pages: 1, viewports: [1440], axe: false, out: out() });
  assert.deepEqual(authored.report.signals.map((s) => s.id), []);
});

test("browser scripts refuse sites marked no_automated_access", { skip }, async () => {
  const { verify } = await import("../skills/game-ui-frontend/scripts/verify.mjs");
  await assert.rejects(verify("https://gameuidatabase.com/index.php", { selectors: ["a"], out: out() }), /no_automated_access/);
});
