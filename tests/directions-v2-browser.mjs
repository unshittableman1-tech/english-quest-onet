import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const page = await browser.newPage({ reducedMotion: 'reduce', serviceWorkers: 'block' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5177/');
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountVocabHub('directions-v2-check'));
  await page.locator('[data-category="directions"]').click();
  await page.getByRole('button', { name: 'ทบทวนคำ (Flashcard)', exact: true }).click();

  const card = page.getByTestId('vocab-flashcard');
  const image = page.locator('.vocab-action-image');
  const seen = [];

  for (let index = 0; index < 12; index += 1) {
    await image.waitFor();
    await image.evaluate((element) => element.decode());
    const src = await image.getAttribute('src');
    const label = (await card.locator('.vocab-flashcard-copy').first().innerText()).trim();
    const dimensions = await image.evaluate((element) => ({
      naturalWidth: element.naturalWidth,
      naturalHeight: element.naturalHeight,
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
    }));

    assert.match(src, /\/learning\/directions\/.+-v2\.png$/);
    assert.ok(dimensions.naturalWidth > 0 && dimensions.naturalHeight > 0);
    assert.ok(dimensions.clientWidth <= 320 && dimensions.clientHeight <= 174);
    seen.push({ index: index + 1, label, src });

    if (index < 11) {
      await card.click({ position: { x: 15, y: 70 } });
      await page.getByRole('button', { name: 'จำได้!', exact: false }).click();
      await page.waitForTimeout(350);
    }
  }

  assert.equal(new Set(seen.map(({ src }) => src)).size, 12);
  console.log(JSON.stringify(seen, null, 2));
} finally {
  await browser.close();
}
