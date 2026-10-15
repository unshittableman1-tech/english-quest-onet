import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.APP_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'เปิดโหมดทดลอง', exact: true }).click();
  await page.getByRole('heading', { name: /Quest Map/ }).waitFor();
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.locator('.nav-bottom .ui-outline-icon').count(), 5);
    assert.ok(await page.locator('.qm-quest-icon .ui-outline-icon').count() > 0);
    assert.equal(await page.locator('.qm-quest-card').evaluateAll(nodes => new Set(nodes.map(el => el.dataset.tone)).size), 6);
    assert.ok(await page.locator('.qm-quest-icon').evaluateAll(nodes => nodes.every(el => el.getBoundingClientRect().width === 44 && el.getBoundingClientRect().height === 44)));
    assert.equal(await page.locator('.nav-bottom .nav-btn').evaluateAll(nodes => new Set(nodes.map(el => el.style.getPropertyValue('--nav-soft'))).size), 5);
    const note = page.locator('.qm-quest-card.is-recommended').first();
    assert.equal(await note.evaluate(el => getComputedStyle(el).backdropFilter), 'none');
    assert.notEqual(await note.evaluate(el => getComputedStyle(el, '::before').display), 'none');
    assert.notEqual(await note.evaluate(el => getComputedStyle(el, '::after').display), 'none');
    assert.match(await note.evaluate(el => getComputedStyle(el).boxShadow), /rgb/);
    assert.equal(await page.locator('.qm-quest-card:not(.is-recommended):not(.is-boss)').first().evaluate(el => getComputedStyle(el, '::before').display), 'none');
    assert.match(await page.locator('.nav-bottom').evaluate(el => getComputedStyle(el).backdropFilter), /blur\(12px\)/);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.ok(await page.locator('.ui-outline-icon').evaluateAll(nodes => nodes.every(el => el.getAttribute('fill') === 'none' && el.getAttribute('stroke-width') === '1.8' && el.getBoundingClientRect().width > 0)));
    assert.ok(!/\p{Extended_Pictographic}/u.test(await page.locator('.nav-bottom').innerText()));
    await page.screenshot({ path: `scratch/phase0-screenshots/outline-map-${width}.png`, fullPage: true });
  }
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-transparency', value: 'reduce' }] });
  assert.equal(await page.locator('.qm-quest-card:not(.is-locked)').first().evaluate(el => getComputedStyle(el).backdropFilter), 'none');
  assert.equal(await page.locator('.nav-bottom').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)');
  await cdp.send('Emulation.setEmulatedMedia', { features: [] });
  await page.locator('.nav-bottom').getByRole('button', { name: 'Badge', exact: true }).click();
  await page.getByRole('heading', { name: /My Badges/ }).waitFor();
  assert.ok(await page.locator('.ui-outline-icon').count() > 10);
  await page.screenshot({ path: 'scratch/phase0-screenshots/outline-badges-1366.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('PASS: outline navigation/quest icons, fixed stroke, nonzero dimensions, 320/390/1366 layouts and Badge navigation; no runtime errors.');
} finally { await browser.close(); }
