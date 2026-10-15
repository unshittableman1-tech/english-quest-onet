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
  const fixture = { mediaReview: { status: 'verified', reviewer: 'browser-test-fixture', version: 'synthetic-v1' }, stimuli: [
    { type: 'passage', text: 'Read the timetable.\nCompare Monday and Tuesday.' },
    { type: 'image', src: '/images/bar_colors.svg', alt: 'Chart supplied with this practice item' },
    { type: 'table', title: 'Tickets', columns: ['Day', 'Tickets'], rows: [['Monday', 12], ['Tuesday', 18]] },
  ] };
  // These are synthetic renderer fixtures, not approved production questions.
  await page.evaluate(async q => (await import('/tests/browser-harness.jsx')).mountQuiz(false, true, q), fixture);
  await page.locator('.quiz-question').waitFor();
  assert.equal(await page.locator('.question-stimulus-table tbody tr').count(), 2);
  assert.equal(await page.locator('.question-stimulus-table tbody tr').last().locator('td').textContent(), '18');
  assert.ok(await page.locator('.question-stimulus-image img').evaluate(img => img.complete && img.naturalWidth > 0));
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `scratch/phase0-screenshots/question-media-inline-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'ขยายภาพโจทย์' }).click();
    await page.getByRole('dialog', { name: 'ภาพประกอบโจทย์ขนาดใหญ่' }).waitFor();
    await page.screenshot({ path: `scratch/phase0-screenshots/question-media-${width}.png` });
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert.ok(await page.getByRole('button', { name: 'ขยายภาพโจทย์' }).evaluate(el => el === document.activeElement));
  }
  await page.locator('.question-stimulus-image img').evaluate(img => img.dispatchEvent(new Event('error')));
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__quizResults), []);
  assert.deepEqual(await page.evaluate(() => window.__quizXP), []);
  await page.evaluate(async q => (await import('/tests/browser-harness.jsx')).mountExam('ExamMode', 'mini_mock_arena', q), fixture);
  await page.locator('.question-stimulus-table').first().waitFor();
  assert.ok(await page.locator('.question-stimulus-passage').count() > 0);
  await page.clock.install();
  await page.locator('.question-stimulus-image img').first().evaluate(img => img.dispatchEvent(new Event('error')));
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  await page.clock.fastForward(3600000);
  assert.deepEqual(await page.evaluate(() => window.__submissions), []);
  await page.clock.resume();
  await page.evaluate(async review => (await import('/tests/browser-harness.jsx')).mountExam('ExamMode', 'mini_mock_arena', { mediaReview: review, stimuli: [{ type: 'image', src: '/images/nonexistent-audit-fixture.png' }] }), fixture.mediaReview);
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__submissions), []);
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountQuiz(false, true, { stimuli: [], mediaRequired: true }));
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  assert.equal(await page.locator('.quiz-answer').count(), 0);
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountQuiz(false, true, { image: '/images/bar_colors.svg', mediaReview: null }));
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  assert.equal(await page.locator('.quiz-answer').count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS: media table/image/passage, zoom + focus at 320/390/1366, Quiz runtime failure, Exam preflight failure without submission.');
} finally { await browser.close(); }
