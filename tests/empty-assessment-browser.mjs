import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173/');
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const questId of ['tenses_arena']) {
    await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).setPendingAssessmentFixture(id, true), questId);
    await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).mountMissionSelect(id), questId);
    const quiz = page.getByRole('button', { name: /แบบประเมินยังไม่พร้อม|Quiz รอตรวจรับ/ });
    await quiz.waitFor();
    assert.ok(await quiz.isDisabled());
    assert.ok(await page.getByRole('status').isVisible());
    await quiz.evaluate(button => button.click());
    assert.deepEqual(await page.evaluate(() => window.__missionNavigation), []);
    const mission = page.getByRole('button').filter({ hasText: 'MISSION 1' });
    assert.ok(await mission.isEnabled());
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `scratch/phase0-screenshots/assessment-empty-${questId}-${width}.png`, fullPage: true });
    }
    await mission.click();
    assert.equal(await page.evaluate(() => window.__missionNavigation[0][0]), 'game');
    await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).setPendingAssessmentFixture(id, false), questId);
  }
  for (const questId of ['shapes_colors', 'clothes_fashion', 'tenses_arena']) {
  await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).mountMissionSelect(id), questId);
  const shapesQuiz = page.getByRole('button', { name: /Quiz Mode/ });
  await shapesQuiz.waitFor();
  assert.ok(await shapesQuiz.isEnabled());
  assert.equal(await page.getByRole('link', { name: 'ลอง Quiz ชุดร่าง' }).count(), 0);
  await shapesQuiz.click();
  assert.deepEqual(await page.evaluate(() => window.__missionNavigation), [['lesson', questId]]);
  }
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountMissionSelect('family'));
  const normal = page.getByRole('button', { name: /Quiz Mode/ });
  await normal.waitFor();
  assert.ok(await normal.isEnabled());
  assert.equal(await page.getByRole('link', { name: 'ลอง Quiz ชุดร่าง' }).count(), 0);
  assert.equal(await page.locator('a[href*="assessment-review"]').count(), 0);
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `scratch/phase0-screenshots/family-no-draft-${width}.png`, fullPage: true });
  }
  await normal.click();
  assert.deepEqual(await page.evaluate(() => window.__missionNavigation), [['lesson', 'family']]);
  assert.deepEqual(errors, []);
  console.log('PASS: all three approved Quiz entries enabled; isolated pending copy stays blocked with learning games available; existing quiz entry preserved; 320/390/1366 layouts.');
} finally { await browser.close(); }
