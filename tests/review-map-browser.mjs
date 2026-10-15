import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountReviewMap());
  await page.getByRole('heading', { name: 'ทบทวนข้อผิดในบท 1' }).waitFor();
  assert.equal(await page.getByText('ผ่านครบทุกด่านแล้ว · เสริมความชำนาญต่อ', { exact: true }).count(), 1);
  assert.match(await page.locator('.qm-next-copy').textContent(), /บท 1 ยังมี 1 ข้อที่ต้องทบทวนเพื่อเสริมความชำนาญ/);
  assert.equal(await page.locator('.qm-review-gate').count(), 0);
  await page.getByRole('button', { name: 'ทบทวนข้อผิด', exact: true }).click();
  assert.deepEqual(await page.evaluate(() => window.__reviewMapNavigation), [['review']]);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.locator('.qm-quest-description').first().evaluate(el => getComputedStyle(el).fontSize), '14px');
    assert.equal(await page.locator('.qm-card-metrics').first().evaluate(el => getComputedStyle(el).fontSize), '13px');
    await page.screenshot({ path: `scratch/phase0-screenshots/review-map-${width}.png`, fullPage: true });
  }
  await page.locator('#qm-chapter-2').click();
  await page.locator('.qm-review-gate').waitFor();
  assert.match(await page.locator('.qm-review-gate').textContent(), /บท 2.*1 ข้อ/);
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountReviewMap(false));
  await page.getByRole('heading', { name: 'ทบทวนข้อผิดในบท 1' }).waitFor();
  assert.equal(await page.getByText('ทบทวนก่อนเดินทางต่อ', { exact: true }).count(), 1);
  assert.equal(await page.getByText('ผ่านครบทุกด่านแล้ว · เสริมความชำนาญต่อ', { exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS: primary review shown once; other chapter review gate retained; navigation, readable type and 320/390/1366 layouts.');
} finally { await browser.close(); }
