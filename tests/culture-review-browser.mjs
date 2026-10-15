import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.env.APP_URL || 'http://127.0.0.1:5177/';
  await page.goto(new URL('/scratch/media-review.html?batch=culture', base).href);

  await page.getByRole('heading', { name: 'ตรวจข้อ Culture & Festivals' }).waitFor();
  assert.equal(await page.locator('select[aria-label="ข้อที่ตรวจ"] option').count(), 12);
  await page.getByText('ตรวจรับแล้วตามขอบเขตที่ระบุ', { exact: false }).first().waitFor();
  await page.getByText('อนุมัติสำหรับ Blueprint และ Chapter 5 Quiz แล้ว', { exact: false }).waitFor();
  assert.ok((await page.locator('.review-evidence').innerText()).includes('ต 2.1'));

  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `scratch/phase0-screenshots/culture-review-${width}.png`, fullPage: true });
  }

  assert.deepEqual(errors, []);
  console.log('PASS: 12 owner-approved Culture items render with evidence at 320/390/1366.');
} finally {
  await browser.close();
}
