import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:5173/scratch/assessment-review.html');
  await page.getByRole('heading', { name: 'ตรวจข้อประเมิน 3 ด่าน' }).waitFor();
  assert.equal(await page.getByRole('combobox').locator('option').count(), 30);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (let i = 0; i < 30; i++) {
      await page.getByRole('combobox').selectOption(String(i));
      assert.equal(await page.locator('.review-answers > button').count(), 4);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      if (i < 10) {
        const img = page.locator('.question-stimulus-image img');
        await img.evaluate(el => el.decode());
        assert.ok(await img.evaluate(el => {
          const canvas = document.createElement('canvas'); canvas.width = 280; canvas.height = 180;
          const ctx = canvas.getContext('2d'); ctx.drawImage(el, 0, 0, 280, 180);
          const data = ctx.getImageData(0, 0, 280, 180).data;
          let colored = 0;
          for (let k = 0; k < data.length; k += 4) if (Math.max(data[k], data[k+1], data[k+2]) - Math.min(data[k], data[k+1], data[k+2]) > 50) colored++;
          return colored > 1000;
        }));
      }
      if ([0, 10, 20].includes(i)) await page.screenshot({ path: `scratch/phase0-screenshots/draft-assessment-${i}-${width}.png`, fullPage: true });
    }
  }
  await page.getByRole('combobox').selectOption('0');
  await page.locator('.review-answers > button').first().click();
  await page.getByRole('status').waitFor();
  await page.getByRole('button', { name: 'ลองข้อนี้ใหม่' }).click();
  assert.equal(await page.getByRole('status').count(), 0);
  await page.goto('http://127.0.0.1:5173/');
  // Pending behavior is exercised with an isolated copy, not by changing bank approval.
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).setPendingAssessmentFixture('tenses_arena', true));
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountMissionSelect('tenses_arena'));
  const previewLink = page.getByRole('link', { name: 'ลอง Quiz ชุดร่าง' });
  await previewLink.waitFor(); await previewLink.click();
  await page.getByRole('combobox').waitFor();
  assert.equal(await page.getByRole('combobox').locator('option').count(), 10);

  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(async () => {
    const harness = await import('/tests/browser-harness.jsx');
    harness.setPendingAssessmentFixture('tenses_arena', true);
    await harness.mountDraftAssessment('tenses_arena');
  });
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__assessmentCalls), []);

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).setPendingAssessmentFixture('tenses_arena', false));
  // All three scoring flows use actual approved data without approval overrides.
  for (const questId of ['shapes_colors', 'clothes_fashion', 'tenses_arena']) {
    await page.evaluate(async id => (await import('/tests/browser-harness.jsx')).mountDraftAssessment(id), questId);
    await page.locator('.quiz-question').waitFor();
    const items = await page.evaluate(() => window.__assessmentItems);
    for (let i = 0; i < 10; i++) {
      await page.getByRole('region', { name: `โจทย์ข้อ ${i+1}`, exact: true }).waitFor();
      if (i === 0 && questId === 'shapes_colors') {
        await page.locator('.quiz-answer').nth((items[i].answer + 1) % 4).click();
        const retry = page.getByRole('button', { name: /ลองอีกครั้ง/ });
        await retry.waitFor();
        await retry.waitFor({ state: 'visible' });
        await page.waitForFunction(() => [...document.querySelectorAll('dialog button')].some(b => b.textContent.includes('ลองอีกครั้ง') && !b.disabled));
        await retry.click();
      }
      await page.locator('.quiz-answer').nth(items[i].answer).click();
      await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).click();
    }
    await page.getByText('คะแนนคำตอบครั้งแรก', { exact: true }).waitFor();
    const calls = await page.evaluate(() => window.__assessmentCalls);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][1], questId === 'shapes_colors' ? 9 : 10);
    assert.equal(calls[0][2], 10);
    const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('eq_onet_current')).questProgress[id], questId);
    assert.equal(saved.lastAssessment.score, calls[0][1]);
    assert.equal(saved.lastAssessment.items.length, 10);
    if (questId === 'shapes_colors') {
      assert.equal(saved.lastAssessment.items[0].firstCorrect, false);
      assert.equal(saved.lastAssessment.items[0].finalCorrect, true);
      await page.getByRole('button', { name: 'เล่นอีกครั้ง' }).click();
      await page.getByRole('region', { name: 'โจทย์ข้อ 1', exact: true }).waitFor();
      assert.equal(await page.locator('.quiz-answer:disabled').count(), 0);
    }
  }
  const prerequisiteProgress = await page.evaluate(async () => Object.fromEntries(
    (await import('/src/data/questions.js')).QUESTS.map(q => [q.id, { passed: true, pct: 80, score: 8, total: 10, roundsPlayed: 1 }])
  ));
  for (const [questId, questName, chapter] of [['shapes_colors', 'Shapes & Colors', 1], ['clothes_fashion', 'Clothes & Fashion', 5], ['tenses_arena', 'Tense Mastery', 3]]) {
  const real = await context.newPage();
  real.on('pageerror', error => errors.push(error.message));
  await real.addInitScript(progress => localStorage.setItem('eq_onet_current', JSON.stringify({
    id: 'local_approval_flow', name: 'Approval Flow Test', role: 'student', xp: 0, level: 1,
    preTest: { totalScore: 10, total: 20 }, questProgress: progress, badges: [],
  })), Object.fromEntries(Object.entries(prerequisiteProgress).filter(([id]) => id !== questId)));
  await real.goto('http://127.0.0.1:5173/');
  await real.locator(`#qm-chapter-${chapter}`).click();
  await real.getByRole('button', { name: `เข้าเล่น ${questName}`, exact: true }).click();
  const actualQuiz = real.getByRole('button', { name: /Quiz Mode/ });
  await actualQuiz.waitFor();
  assert.ok(await actualQuiz.isEnabled());
  assert.equal(await real.getByRole('link', { name: 'ลอง Quiz ชุดร่าง' }).count(), 0);
  await actualQuiz.click();
  await real.getByRole('heading', { name: questName, exact: true }).waitFor();
  await real.locator('.quiz-question').waitFor();
  assert.equal(await real.locator('.quiz-answer').count(), 4);
  if (questId !== 'tenses_arena') await real.locator('.question-stimulus-image img').evaluate(img => img.decode());
  else assert.equal(await real.locator('.question-stimulus-image img').count(), 0);
  for (const width of [320, 390, 1366]) {
    await real.setViewportSize({ width, height: 900 });
    assert.ok(await real.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await real.screenshot({ path: `scratch/phase0-screenshots/${questId}-live-quiz-${width}.png`, fullPage: true });
  }
  await real.close();
  }
  assert.deepEqual(errors, []);
  console.log('PASS: all three actual approvals open from Quest Map through Quiz Mode; stimuli/options render at 320/390/1366; first-response evidence persists; isolated pending copies remain blocked.');
} finally { await browser.close(); }
