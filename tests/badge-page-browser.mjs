import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5177/');
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountBadgePage());
  await page.getByRole('heading', { name: 'เหรียญรางวัล' }).waitFor();
  await page.getByText('4 / 42 เหรียญ').waitFor();
  await page.getByRole('button', { name: 'ยังล็อก' }).click();
  assert.equal(await page.locator('.badge-card.earned').count(), 0);
  await page.getByRole('button', { name: 'ทั้งหมด' }).click();
  await page.locator('.badge-category-select select').selectOption('Arena');
  assert.equal(await page.locator('.badge-card').count(), 8);
  assert.equal(await page.locator('.badge-card.earned').count(), 2);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `horizontal overflow at ${width}`);
    await page.screenshot({ path: `scratch/phase0-screenshots/badge-page-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: Badge count, filters, Arena awards, and responsive widths 320/390/1366.');
} finally {
  await browser.close();
}
