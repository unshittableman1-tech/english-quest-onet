import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const base = process.env.APP_URL || 'http://127.0.0.1:5177/';
  for (const chapter of [2, 5]) {
    await page.goto(new URL(`/scratch/challenge-review.html?chapter=${chapter}`, base).href);
    await page.getByRole('heading', { name: `ตรวจด่านท้าทายท้ายบท ${chapter}` }).waitFor();
    await page.getByText('ตรวจรับแล้วตามขอบเขตที่ระบุ', { exact: false }).waitFor();
    await page.getByText('อนุมัติใช้ในด่านฝึกท้ายบทแล้ว', { exact: false }).waitFor();
    assert.equal(await page.locator('select[aria-label="ข้อที่ตรวจ"] option').count(), 10);
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      for (let index = 0; index < 10; index++) {
        await page.getByRole('combobox', { name: 'ข้อที่ตรวจ' }).selectOption(String(index));
        assert.equal(await page.locator('.review-answers > button').count(), 4);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Chapter ${chapter} item ${index + 1} overflows at ${width}px`);
      }
    }
    await page.getByRole('combobox', { name: 'ข้อที่ตรวจ' }).selectOption('6');
    const answers = page.locator('.review-answers > button');
    await answers.first().click();
    await page.getByRole('status').waitFor();
    await page.getByRole('button', { name: 'ลองข้อนี้ใหม่' }).click();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: Chapter 2 and 5 approved review pages render 10 questions at mobile and desktop widths.');
} finally {
  await browser.close();
}
