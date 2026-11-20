import assert from "node:assert/strict";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { findPackage } from "../skills/game-ui-frontend/scripts/lib/browser.mjs";

const template = pathToFileURL(path.resolve("skills/game-ui-frontend/templates/buttons.html")).href;
let chromium;
let skip;
if (!findPackage("playwright")) skip = "playwright not installed";
else {
  ({ chromium } = await import("playwright"));
  try { await (await chromium.launch()).close(); }
  catch { skip = "chromium not installed"; }
}

test("changing rooms moves a single directional sight and opens the matching two-sided object", { skip }, async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(template);
    await page.getByRole("radio", { name: "Booth" }).focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.getByRole("button", { name: "Locate Rewind room" }).getAttribute("aria-pressed"), "true");
    assert.match(await page.locator("#room-bearing").innerText(), /north-east/);
    // Switch while the first move is in flight. The final sight must converge on the chosen pin.
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => {
      const pin = document.querySelector('.map-pin[aria-pressed="true"]').getBoundingClientRect();
      const sight = document.querySelector(".sight").getBoundingClientRect();
      return Math.abs(sight.x - pin.x) < .5 && Math.abs(sight.y - pin.y) < .5;
    });
    assert.match(await page.locator("#room-bearing").innerText(), /south\./);
    const angle = await page.locator(".sight-arm").evaluate(arm => {
      const matrix = new DOMMatrix(getComputedStyle(arm).transform);
      return Math.atan2(matrix.b, matrix.a) * 180 / Math.PI;
    });
    assert.ok(Math.abs(angle - Math.atan2(18, 4) * 180 / Math.PI) < .1, "foyer arrow follows the bearing");
    assert.equal(await page.locator(".sight-arrow").count(), 1);
    const inspect = page.getByRole("button", { name: "Inspect reel can" });
    await inspect.focus();
    await page.keyboard.press("Enter");
    assert.equal(await page.getByRole("dialog", { name: "Reel can" }).isVisible(), true);
    assert.match(await page.locator("#front-ink").getAttribute("href"), /reel-face$/);
    const turn = page.getByRole("button", { name: "Show reverse" });
    await turn.press("Space");
    assert.match(await page.locator("figcaption").innerText(), /pressed rings/);
    assert.match(await page.locator("#back-ink").getAttribute("href"), /reel-back$/);
    await turn.press("Space");
    assert.match(await page.locator("figcaption").innerText(), /masking tape/);
    await page.keyboard.press("Escape");
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await inspect.evaluate(el => document.activeElement === el), true);
    await page.goForward();
    await page.getByRole("dialog", { name: "Reel can" }).waitFor();
    await page.goBack();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await page.getByRole("radio", { name: "Stalls" }).isChecked(), true);
  } finally { await browser.close(); }
});

test("touch can locate and inspect from a cold start or a deep link with motion reduced", { skip }, async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ isMobile: true, hasTouch: true, viewport: { width: 320, height: 560 }, reducedMotion: "reduce" });
    await page.goto(template + "#object-rewind");
    await page.getByRole("dialog", { name: "Splice block" }).waitFor();
    await page.getByRole("button", { name: "Back to floor plan" }).tap();
    assert.equal(page.url(), template);
    const pin = page.getByRole("button", { name: "Locate Booth", exact: true });
    await pin.tap();
    assert.equal(await page.getByRole("radio", { name: "Booth" }).isChecked(), true);
    assert.match(await page.locator("#room-bearing").innerText(), /north-west/);
    assert.equal(await page.locator(".scope").evaluate(el => el.getAnimations({ subtree: true }).length), 0);
    await page.getByRole("button", { name: "Inspect aperture plate" }).tap();
    await page.getByRole("button", { name: "Show reverse" }).tap();
    assert.match(await page.locator("figcaption").innerText(), /raised rails/);
    assert.equal(await page.locator(".object-drawing").evaluate(el => el.getAnimations().length), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole("button", { name: "Back to floor plan" }).tap();
    await page.getByRole("dialog").waitFor({ state: "hidden" });
    assert.equal(await pin.getAttribute("aria-pressed"), "true");
  } finally { await browser.close(); }
});
