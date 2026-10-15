import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseUrl = process.env.APP_URL || 'http://127.0.0.1:5173/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(baseUrl);
  await page.clock.install();

  const mount = id => page.evaluate(async learnerId => (await import('/tests/browser-harness.jsx')).mountVocabHub(learnerId), id);
  const expected = { verbs: 12, daily_routine: 10, transport: 12, place: 8 };
  const sources = new Set();

  for (const [category, count] of Object.entries(expected)) {
    await mount('image_' + category);
    await page.locator('[data-category="' + category + '"]').click();
    await page.getByRole('button', { name: 'ทบทวนคำ (Flashcard)', exact: true }).click();

    for (let index = 0; index < count; index++) {
      await page.clock.fastForward(500);
      const image = page.locator('.vocab-action-image');
      await image.waitFor();
      await image.evaluate(element => element.decode());
      assert.equal(await page.locator('.vocab-card-symbol').count(), 0, category + ' must not duplicate the fallback symbol beside a loaded image');
      const source = await image.getAttribute('src');
      const alt = await image.getAttribute('alt');
      assert.ok(source?.endsWith('-v1.png'), category + ' source');
      assert.ok(alt?.trim(), category + ' alt');
      assert.ok(!sources.has(source), 'duplicate source ' + source);
      sources.add(source);
      const pixels = await image.evaluate(element => {
        const canvas = document.createElement('canvas');
        canvas.width = element.naturalWidth;
        canvas.height = element.naturalHeight;
        const context2d = canvas.getContext('2d');
        context2d.drawImage(element, 0, 0);
        const rgba = context2d.getImageData(0, 0, canvas.width, canvas.height).data;
        let transparent = 0;
        let visible = 0;
        for (let offset = 3; offset < rgba.length; offset += 4) {
          if (rgba[offset] === 0) transparent++;
          if (rgba[offset] > 32) visible++;
        }
        return { transparent, visible, width: element.naturalWidth, height: element.naturalHeight };
      });
      assert.ok(pixels.width >= 512 && pixels.height >= 512);
      assert.ok(pixels.transparent > 100 && pixels.visible > 1000);

      if (index === 0) {
        for (const width of [320, 390, 1366]) {
          await page.setViewportSize({ width, height: 900 });
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), category + ' overflow at ' + width);
        }
      }

      await page.getByTestId('vocab-flashcard').evaluate(element => element.click());
      await page.getByRole('button', { name: /อ่านคำตอบ/ }).waitFor();
      await page.clock.fastForward(1700);
      await page.getByRole('button', { name: /จำได้!/ }).click();
      await page.clock.fastForward(350);
    }
    await page.getByRole('heading', { name: 'จบแล้ว!' }).waitFor();
  }

  assert.equal(sources.size, 42);
  assert.deepEqual(errors, []);
  console.log('PASS: 42 unique transparent nonblank vocab illustrations decode with alt text; responsive checks pass at 320/390/1366.');
} finally {
  await browser.close();
}
