import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  const writes = [];
  await context.route('**/*', route => {
    const req = route.request();
    if (!['GET', 'HEAD'].includes(req.method())) writes.push(req.url());
    return new URL(req.url()).hostname === '127.0.0.1' ? route.continue() : route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/scratch/media-review.html?batch=family');
  await page.getByRole('heading', { name: 'ตรวจสื่อ Family — 3 ข้อ' }).waitFor();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  const select = page.getByRole('combobox', { name: 'ข้อที่ตรวจ' });
  assert.equal(await select.locator('option').count(), 3);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (let i = 0; i < 3; i++) {
      await select.selectOption(String(i));
      assert.equal(await page.locator('.question-stimulus-error').count(), 0);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (i < 2) {
        const img = page.locator('.question-stimulus-image > img');
        await img.evaluate(image => image.decode());
        const pixels = await img.evaluate(image => {
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          let transparent = 0, visible = 0;
          for (let j = 3; j < data.length; j += 4) { if (data[j] === 0) transparent++; if (data[j] > 200) visible++; }
          return { transparent, visible };
        });
        assert.ok(pixels.transparent > 1000 && pixels.visible > 1000);
        await page.getByRole('button', { name: 'ขยายภาพโจทย์' }).click();
        await page.getByRole('dialog').waitFor();
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('dialog').count(), 0);
        assert.equal(await page.getByRole('button', { name: 'ขยายภาพโจทย์' }).evaluate(el => el === document.activeElement), true);
      } else assert.equal(await page.locator('.question-stimulus-image').count(), 0);
      await page.locator('.review-answers > button').nth(2).click();
      assert.match(await page.getByRole('status').textContent(), /ตรงกับเฉลยชุดร่าง/);
      const source = await page.getByRole('link', { name: /^ต้นฉบับหน้า/ }).getAttribute('href');
      assert.equal((await page.request.get(`http://127.0.0.1:5173${source}`)).status(), 200);
      await page.screenshot({ path: `scratch/phase0-screenshots/family-media-${i}-${width}.png`, fullPage: true });
    }
  }
  assert.equal(await page.evaluate(() => JSON.stringify(localStorage)), before);
  assert.deepEqual(writes, []);
  assert.deepEqual(errors, []);
  console.log('PASS: Family 3 items, transparent nonblank illustrations, source links, answers, zoom/Escape/focus, 320/390/1366 layouts; no storage/network writes.');
} finally { await browser.close(); }
