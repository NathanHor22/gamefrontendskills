import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { join } from 'node:path';
let chromium;
let skip;
try {
  ({ chromium } = await import('playwright'));
  await (await chromium.launch()).close();
} catch {
  skip = 'Playwright Chromium unavailable';
}

const url = new URL('../skills/game-ui-frontend/templates/title-screen.html', import.meta.url).href;

test('title entrance holds its controls still and supports keyboard, touch, and static fallback', { skip }, async () => {
  const browser = await chromium.launch();
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktop.goto(url);
    const chart = desktop.getByRole('link', { name: 'Browse sea charts' });
    const logs = desktop.getByRole('link', { name: 'Read watch logs' });
    const stage = desktop.locator('.stage');
    const position = await chart.boundingBox();
    await chart.hover();
    assert.equal(await stage.getAttribute('data-scene'), 'charts');
    assert.deepEqual(await chart.boundingBox(), position);
    await desktop.mouse.move(1100, 420);
    await desktop.keyboard.press('Tab');
    assert.equal(await chart.evaluate(el => el === document.activeElement), true);
    await desktop.keyboard.press('Tab');
    assert.equal(await stage.getAttribute('data-scene'), 'logs');
    assert.equal(await logs.evaluate(el => el === document.activeElement), true);
    await desktop.keyboard.press('Enter');
    await desktop.waitForFunction(() => document.activeElement.id === 'logs');
    assert.ok(desktop.url().endsWith('#logs'));
    await desktop.locator('#logs [data-return]').click();
    await desktop.waitForFunction(() => document.activeElement.dataset.aim === 'logs');
    await desktop.getByRole('button', { name: 'Pause background' }).click();
    assert.equal(await desktop.locator('.haze').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    await desktop.getByRole('button', { name: 'Resume background' }).click();
    assert.equal(await desktop.locator('.haze').evaluate(el => getComputedStyle(el).animationPlayState), 'running');
    if (process.env.TITLE_SCREEN_CAPTURE) await desktop.screenshot({path:join(process.env.TITLE_SCREEN_CAPTURE,'game-title-desktop.png')});

    const phone = await browser.newPage({ viewport: { width: 320, height: 720 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
    await phone.goto(url);
    assert.equal(await phone.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await phone.getByRole('button', { name: 'Pause background' }).isVisible(), false);
    assert.equal(await phone.locator('.haze').evaluate(el => getComputedStyle(el).animationName), 'none');
    assert.equal(await phone.locator('.lamp').evaluate(el => getComputedStyle(el).transitionDuration), '0s');
    if (process.env.TITLE_SCREEN_CAPTURE) await phone.screenshot({path:join(process.env.TITLE_SCREEN_CAPTURE,'game-title-mobile.png')});
    await phone.getByRole('link', { name: 'Browse sea charts' }).tap();
    await phone.waitForFunction(() => document.activeElement.id === 'charts');
    assert.ok(phone.url().endsWith('#charts'));

    const staticPage = await browser.newPage({ javaScriptEnabled: false });
    await staticPage.goto(url + '#logs');
    assert.ok(await staticPage.getByRole('heading', { name: 'Watch logs', exact: true }).isVisible());
    assert.equal(await staticPage.locator('.haze').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
    assert.equal(await staticPage.getByRole('button', { name: 'Pause background' }).isVisible(), false);
    await staticPage.locator('#logs [data-return]').click();
    assert.ok(staticPage.url().endsWith('#entrance'));
  } finally {
    await browser.close();
  }
});
