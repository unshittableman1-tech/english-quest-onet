import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5177/');

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountMissionSelect('culture_festivals'));
  await page.getByRole('button', { name: /Quiz Mode/ }).waitFor();
  assert.equal(await page.getByText('หรือ', { exact: true }).count(), 0);
  await page.getByRole('button', { name: /Quiz Mode/ }).click();
  assert.deepEqual(await page.evaluate(() => window.__missionNavigation.at(-1)), ['lesson', 'culture_festivals']);

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountDraftAssessment('culture_festivals'));
  await page.locator('.quiz-question').waitFor();
  const items = await page.evaluate(() => window.__assessmentItems);
  assert.equal(items.length, 12);
  for (let index = 0; index < 10; index++) {
    await page.getByRole('region', { name: `โจทย์ข้อ ${index + 1}`, exact: true }).waitFor();
    await page.locator('.quiz-answer').nth(items[index].answer).click();
    await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).click();
  }
  await page.getByText('คะแนนคำตอบครั้งแรก', { exact: true }).waitFor();
  const calls = await page.evaluate(() => window.__assessmentCalls);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].slice(0, 3), ['culture_festivals', 10, 10]);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('eq_onet_current')).questProgress.culture_festivals);
  assert.equal(saved.lastAssessment.items.length, 10);
  assert.equal(saved.passed, true);
  assert.deepEqual(errors, []);
  console.log('PASS: Chapter 5 Culture Quiz opens, scores ten first responses, and records progress.');
} finally {
  await browser.close();
}
