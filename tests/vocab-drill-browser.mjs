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
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173/');
  const mount = () => page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountVocabHub());
  await mount();
  await page.getByRole('heading', { name: 'Vocab Adventure' }).waitFor();
  assert.equal(await page.locator('.vocab-category').count(), 23);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.equal(await page.locator('.vocab-category-grid').first().evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length), width < 700 ? 2 : width <= 1000 ? 3 : 4);
    await page.screenshot({ path: `scratch/phase0-screenshots/vocab-hub-${width}.png`, fullPage: true });
  }
  for (const id of ['verbs', 'daily_routine']) {
    for (const mode of ['ฟังคำศัพท์ (Audio Detective)', 'จับคู่คำ (Memory Match)', 'สปีดรัน 60 วิ (Speed Rush)', 'ดวล 2 คน (1v1 Duel)', 'ใบ้คำ (Heads-Up)']) {
      await mount();
      await page.setViewportSize({ width: 320, height: 900 });
      await page.locator(`[data-category="${id}"]`).click();
      await page.getByRole('button', { name: mode, exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('.vocab-hub'));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${id}: ${mode}`);
      assert.deepEqual(await page.evaluate(() => window.__vocabXP), []);
    }
  }
  await mount();
  const search = page.getByRole('searchbox', { name: 'ค้นหาหมวดคำศัพท์' });
  await search.fill('routine'); assert.equal(await page.locator('.vocab-category').count(), 1);
  await search.fill('zzzz'); await page.getByRole('status').waitFor();
  await page.getByRole('button', { name: 'ล้างการค้นหา' }).click();
  assert.equal(await page.locator('.vocab-category').count(), 23);
  for (const id of await page.locator('.vocab-category').evaluateAll(nodes => nodes.map(n => n.dataset.category))) {
    const category = page.locator(`[data-category="${id}"]`);
    await category.click(); await page.getByRole('dialog').waitFor();
    assert.equal(await page.locator('.vocab-mode-list > button').count(), 6);
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.equal(await category.evaluate(el => el === document.activeElement), true);
  }
  for (const id of ['verbs', 'daily_routine', 'culture_festivals']) {
    await mount();
    await page.locator(`[data-category="${id}"]`).click();
    await page.getByRole('button', { name: 'ทบทวนคำ (Flashcard)', exact: true }).click();
    await page.locator('[style*="perspective"]').click();
    await page.getByRole('region', { name: 'ประโยคตัวอย่าง' }).waitFor();
    await page.locator('[style*="preserve-3d"]').evaluate(async el => { await Promise.all(el.getAnimations().map(a => a.finished)); });
    const expectedExample = id === 'verbs' ? 'I eat rice.' : id === 'daily_routine' ? 'I wake up at six.' : 'Halloween is on October 31st.';
    assert.ok((await page.getByRole('region', { name: 'ประโยคตัวอย่าง' }).innerText()).includes(expectedExample));
    assert.ok(await page.getByRole('button', { name: 'ฟังประโยคตัวอย่าง' }).count() > 0);
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `scratch/phase0-screenshots/vocab-${id}-${width}.png`, fullPage: true });
    }
  }
  assert.deepEqual(await page.evaluate(() => window.__vocabXP), []);
  assert.deepEqual(errors, []);
  console.log('PASS: 23 exact categories, 2/3/4-column layouts, search, dialogs/Escape/focus and bilingual new-deck flashcards with speech; no XP for opening/closing.');
} finally { await browser.close(); }
