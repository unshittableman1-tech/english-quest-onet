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
  await page.clock.install();
  const mount = id => page.evaluate(async id => (await import('/tests/browser-harness.jsx')).mountVocabHub(id), id);
  await mount('learner_a');
  await page.locator('[data-category="daily_routine"]').click();
  await page.getByRole('button', { name: 'ทบทวนคำ (Flashcard)', exact: true }).click();
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (let i = 0; i < 10; i++) {
    const front = page.locator('[style*="perspective"]');
    await front.waitFor();
    if (i < 2) {
      await page.clock.fastForward(500);
      const img = page.locator('.vocab-action-image');
      await img.evaluate(el => el.decode());
      assert.match(await img.getAttribute('src'), i === 0 ? /wake-up-v1/ : /get-up-v1/);
      const pixels = await img.evaluate(el => {
        const canvas = document.createElement('canvas'); canvas.width = el.naturalWidth; canvas.height = el.naturalHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(el, 0, 0);
        const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = 0, opaque = 0;
        for (let j = 3; j < rgba.length; j += 4) { if (rgba[j] === 0) transparent++; if (rgba[j] > 200) opaque++; }
        return { transparent, opaque };
      });
      assert.ok(pixels.transparent > 100 && pixels.opaque > 1000);
      for (const width of [320, 390, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: `scratch/phase0-screenshots/routine-image-${i}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
    }
    await front.click();
    await page.clock.fastForward(1700);
    await page.getByRole('button', { name: /จำได้!/ }).click();
    await page.clock.fastForward(350);
  }
  await page.getByRole('heading', { name: 'จบแล้ว!' }).waitFor();
  await page.getByRole('button', { name: /รับ XP แล้วไปต่อ/ }).evaluate(button => { button.click(); button.click(); });
  await page.getByRole('dialog').waitFor();
  assert.equal((await page.evaluate(() => window.__vocabXP)).length, 1);
  assert.equal((await page.evaluate(() => window.__vocabXP))[0][0], 30);
  await page.keyboard.press('Escape');
  assert.match(await page.locator('[data-category="daily_routine"]').innerText(), /ฝึกแล้ว 1 รอบ/);
  await mount('learner_a');
  await page.waitForFunction(() => document.querySelector('[data-category="daily_routine"]')?.textContent.includes('ฝึกแล้ว 1 รอบ'));
  await mount('learner_b');
  await page.waitForFunction(() => document.querySelector('[data-category="daily_routine"]')?.textContent.includes('ยังไม่มีประวัติการฝึก'));
  assert.deepEqual(errors, []);
  console.log('PASS: 2 transparent nonblank routine images at 320/390/1366; 10-card completion, single XP/history write despite double click, reload and learner isolation.');
} finally { await browser.close(); }
