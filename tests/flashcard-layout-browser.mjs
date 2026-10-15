import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ reducedMotion: 'reduce', serviceWorkers: 'block' });
  await mkdir('scratch/flashcard-layout', { recursive: true });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5177/');
  for (const width of [390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ['signs', 'jobs', 'countries', 'greeting', 'question_words', 'culture_festivals', 'tenses', 'pronouns']) {
      await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountVocabHub('layout-check'));
      await page.locator(`[data-category="${id}"]`).click();
      await page.getByRole('button', { name: 'ทบทวนคำ (Flashcard)', exact: true }).click();
      const card = page.getByTestId('vocab-flashcard');
      await card.waitFor();
      await page.locator('.vocab-action-image').evaluate(el => el.decode());
      if (id === 'signs') {
        for (let i = 0; i < 3; i++) {
          await card.click({ position: { x: 15, y: 70 } });
          await page.getByRole('button', { name: 'จำได้!', exact: false }).click();
          await page.waitForTimeout(350);
        }
        await page.locator('.vocab-action-image').evaluate(el => el.decode());
        assert.match(await card.innerText(), /SCHOOL/);
        await page.screenshot({ path: `scratch/flashcard-layout/school-zone-${width}.png` });
      }
      assert.ok((await card.locator('.vocab-flashcard-copy').first().innerText()).trim(), `${id} visible front label`);
      await card.click({ position: { x: 15, y: 70 } });
      await page.waitForTimeout(500);
      const box = await card.boundingBox();
      const textBox = await card.locator('.vocab-flashcard-copy').last().boundingBox();
      assert.ok(textBox.x >= box.x - 2 && textBox.x + textBox.width <= box.x + box.width + 2, `${id} back stays inside card`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${id} no page overflow`);
      if (id === 'tenses') await page.screenshot({ path: `scratch/flashcard-layout/tenses-${width}.png` });
    }
  }
  console.log('Front labels and back text fit across seven categories at mobile and desktop widths.');
} finally { await browser.close(); }
