import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/scratch/assessment-review.html?quest=clothes_fashion');
  await page.getByRole('combobox').waitFor();
  assert.equal(await page.getByRole('combobox').locator('option').count(), 10);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (let i = 0; i < 10; i++) {
      await page.getByRole('combobox').selectOption(String(i));
      const img = page.locator('.question-stimulus-image > img');
      await img.evaluate(el => el.decode());
      assert.ok(await img.evaluate(el => {
        const c = document.createElement('canvas'); c.width = 100; c.height = 100;
        const ctx = c.getContext('2d'); ctx.drawImage(el, 0, 0, 100, 100);
        const pixels = ctx.getImageData(0, 0, 100, 100).data;
        let solid = 0, transparent = 0;
        for (let k = 3; k < pixels.length; k += 4) { if (pixels[k] > 200) solid++; if (pixels[k] === 0) transparent++; }
        return solid > 500 && transparent > 100;
      }));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert.equal(await page.locator('.review-answers > button').count(), 4);
      if ([0, 1, 6, 8].includes(i)) await page.screenshot({ path: `scratch/phase0-screenshots/clothing-image-${i + 1}-${width}.png`, fullPage: true });
      await page.getByRole('button', { name: 'ขยายภาพโจทย์' }).click();
      const dialog = page.getByRole('dialog'); await dialog.waitFor();
      assert.equal(await dialog.locator('img').getAttribute('src'), await img.getAttribute('src'));
      await page.keyboard.press('Escape');
      assert.equal(await page.getByRole('dialog').count(), 0);
      assert.ok(await page.getByRole('button', { name: 'ขยายภาพโจทย์' }).evaluate(el => el === document.activeElement));
    }
  }
  await page.getByRole('combobox').selectOption('1');
  await page.getByRole('button', { name: 'B. Socks', exact: true }).click();
  await page.getByText('ตรงกับเฉลยชุดร่าง', { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: 10 clothing images decode and have nonblank/transparent pixels; 4 options intact; zoom/Escape/focus works for each item at 320/390/1366; Socks answer unchanged.');
} finally { await browser.close(); }
