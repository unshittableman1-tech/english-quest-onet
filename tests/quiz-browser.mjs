import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.addInitScript(() => {
    let utterance;
    window.__spoken = [];
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [],
      cancel: () => { utterance?.onend?.(); utterance = null; },
      speak: value => { utterance = value; window.__spoken.push(value.text); value.onstart?.(); },
    } });
  });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173');
  const mount = async twoStep => {
    await page.evaluate(async value => (await import('/tests/browser-harness.jsx')).mountQuiz(value), twoStep);
    await page.getByRole('heading', { name: 'Family & Home' }).waitFor();
  };
  await mount(false);
  assert.deepEqual(await page.locator('.quiz-question .vocab-word').allTextContents(), ['your']);
  await page.getByRole('button', { name: 'ฟังตัวเลือก A', exact: true }).click();
  await page.getByRole('button', { name: 'หยุด ฟังตัวเลือก A', exact: true }).waitFor();
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal((await page.evaluate(() => window.__quizXP)).length, 0);
  await page.getByRole('button', { name: 'หยุด ฟังตัวเลือก A', exact: true }).click();
  assert.equal(await page.locator('.quiz-answer button').count(), 0);
  await page.getByRole('button', { name: 'ดูคำแปลภาษาไทย' }).click();
  await page.getByText('พ่อของพ่อเรียกว่าอะไร', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'ซ่อนคำแปล' }).click();
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1366, 900]]) {
    await page.setViewportSize({ width, height });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Quiz fits ${width}px`);
    assert.ok(await page.locator('.quiz-question-text').evaluate(el => el.scrollWidth <= el.clientWidth));
    await page.screenshot({ path: `scratch/phase0-screenshots/quiz-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'คำตอบ B: Cousin', exact: true }).evaluate(button => { button.click(); button.click(); });
  await page.getByRole('dialog', { name: 'ทบทวนคำตอบ' }).waitFor();
  assert.equal(await page.getByRole('button', { name: /ดูเฉลย/ }).count(), 0);
  await page.getByText('คำตอบที่ถูก', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog', { name: 'ทบทวนคำตอบ' }).count(), 1);
  await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).focus();
  await page.keyboard.press('Tab');
  assert.ok(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement)));
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `scratch/phase0-screenshots/feedback-free-${width}.png`, fullPage: false });
  }
  await page.getByRole('button', { name: /ข้อต่อไป/ }).evaluate(button => { button.click(); button.click(); });
  await page.getByRole('region', { name: 'โจทย์ข้อ 2', exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__quizXP.map(item => item[0])), [-5]);
  for (let i = 2; i <= 10; i++) {
    await page.getByRole('button', { name: 'คำตอบ A: Grandfather', exact: true }).click();
    await page.getByRole('dialog', { name: 'ผลคำตอบถูก' }).waitFor();
    await page.getByRole('button', { name: /ข้อต่อไป/ }).evaluate(button => { button.click(); button.click(); });
    if (i < 10) await page.getByRole('region', { name: `โจทย์ข้อ ${i + 1}`, exact: true }).waitFor();
  }
  await page.getByRole('heading', { name: 'ยอดเยี่ยม!' }).waitFor();
  const results = await page.evaluate(() => ({ results: window.__quizResults, xp: window.__quizXP }));
  assert.equal(results.results.length, 1);
  assert.deepEqual(results.results[0].slice(0, 3), ['family', 9, 10]);
  assert.equal(results.xp.filter(item => item[1] === 'ตอบถูก').length, 9);
  await page.getByText('Family & Home · ฝึกสะสม 63 รอบ', { exact: true }).waitFor();
  assert.equal(await page.locator('canvas').count(), 0);
  await page.screenshot({ path: 'scratch/phase0-screenshots/quiz-summary-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Quest Map', exact: true }).click();
  assert.deepEqual(await page.evaluate(() => window.__quizNavigation.at(-1)), ['map']);
  await page.getByRole('button', { name: 'เล่นอีกครั้ง', exact: true }).click();
  await page.getByRole('region', { name: 'โจทย์ข้อ 1', exact: true }).waitFor();
  await mount(true);
  await page.getByRole('button', { name: 'คำตอบ A: Grandfather', exact: true }).click();
  await page.getByText('ชั้นที่ 2/2', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'คำตอบ A: Father of a parent', exact: true }).click();
  const reasons = page.getByRole('region', { name: 'วิเคราะห์เหตุผล', exact: true });
  await reasons.waitFor();
  assert.ok((await reasons.locator('li.is-correct').innerText()).includes('Father of a parent'));
  await page.getByRole('button', { name: /ข้อต่อไป/ }).click();
  await page.getByRole('heading', { name: 'ยอดเยี่ยม!' }).waitFor();
  assert.equal((await page.evaluate(() => window.__quizResults))[0][3].twoStepBothCorrect, 1);
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountQuiz(false, false));
  await page.getByRole('button', { name: 'คำตอบ B: Cousin', exact: true }).click();
  const missingTranslation = page.getByRole('dialog', { name: 'ทบทวนคำตอบ' });
  await missingTranslation.getByText('ยังไม่มีคำแปลภาษาไทยสำหรับข้อนี้', { exact: true }).waitFor();
  assert.equal(await missingTranslation.getByText('แปลโจทย์ภาษาไทย:', { exact: true }).count(), 0);
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountBadgeRewards());
  await page.getByRole('dialog', { name: 'ได้รับ 2 Badge ใหม่!' }).waitFor();
  await page.getByText('+100 XP', { exact: true }).waitFor();
  assert.equal(await page.locator('canvas').count(), 0);
  await page.getByRole('button', { name: 'สุดยอด!', exact: true }).click();
  assert.equal(await page.evaluate(() => window.__badgeClosed), true);
  assert.deepEqual(errors, []);
  console.log('PASS: quiz layout, speech isolation/stop, translation, wrong/correct flow, duplicate-click guards, single completion, retry, two-step, combined rewards and reduced motion');
} finally { await browser.close(); }
