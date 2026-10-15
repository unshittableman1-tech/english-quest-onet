import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });

try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5177/');

  for (const questId of ['chapter2_boss', 'chapter5_boss']) {
    await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).mountMissionSelect(id), questId);
    await page.getByRole('heading', { name: 'ด่านท้าทายท้ายบท' }).waitFor();
    assert.equal(await page.getByText('หรือ', { exact: true }).count(), 0);
    await page.getByRole('button', { name: /เริ่มท้าทายบอส/ }).click();
    assert.deepEqual(await page.evaluate(() => window.__missionNavigation.at(-1)), ['lesson', questId]);

    await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).mountDraftAssessment(id), questId);
    await page.locator('.quiz-question').waitFor();
    const items = await page.evaluate(() => window.__assessmentItems);
    assert.equal(items.length, 10);
    for (let index = 0; index < 10; index++) {
      await page.getByRole('region', { name: `โจทย์ข้อ ${index + 1}`, exact: true }).waitFor();
      if (index === 0) {
        await page.locator('.quiz-answer').nth((items[index].answer + 1) % 4).click();
        const retry = page.getByRole('button', { name: /ลองอีกครั้ง/ });
        await retry.waitFor();
        await retry.click();
      }
      await page.locator('.quiz-answer').nth(items[index].answer).click();
      await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).click();
    }
    await page.getByText('คะแนนคำตอบครั้งแรก', { exact: true }).waitFor();
    const calls = await page.evaluate(() => window.__assessmentCalls);
    assert.equal(calls.length, 1);
    assert.deepEqual(calls[0].slice(0, 3), [questId, 9, 10]);
    const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('eq_onet_current')).questProgress[id], questId);
    assert.equal(saved.lastAssessment.items.length, 10);
    assert.equal(saved.lastAssessment.score, 9);
    assert.equal(saved.passed, true);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: both chapter bosses open, preserve first-response scoring, and save progress.');
} finally {
  await browser.close();
}
