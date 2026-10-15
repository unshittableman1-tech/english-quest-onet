import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const normalize = text => text.replace(/\s+/g, ' ').trim();
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const students = [
  { id: 'local_known20', name: 'Known20', class: '6/1', number: 1, preTest: { totalScore: 15, total: 20 } },
  { id: 'local_known30', name: 'Known30', class: '6/1', number: 2, preTest: { totalScore: 15, total: 30 } },
  { id: 'local_unknown', name: 'Unknown', class: '6/1', number: 3, preTest: { totalScore: 15 }, badgeStats: { pretestScore: 100 } },
];
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === 'http://127.0.0.1:5173') return route.continue();
    if (url.pathname === '/rest/v1/students' && request.method() === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(students) });
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5173/');
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const [index, student] of students.entries()) {
    await page.evaluate(async s => (await import('/tests/browser-harness.jsx')).mountStudentReport(s), student);
    await page.getByRole('heading', { name: /รายงานผลการเรียน/ }).waitFor();
    await page.getByText(index === 0 ? '15/20' : index === 1 ? '15/30' : '15/—', { exact: true }).waitFor();
    assert.ok(await page.getByText(index === 0 ? '75%' : index === 1 ? '50%' : 'ไม่ทราบจำนวนข้อเดิม', { exact: true }).isVisible());
    for (const width of [320, 390, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `scratch/phase0-screenshots/pretest-report-${index}-${width}.png`, fullPage: true });
    }
  }
  const download = page.waitForEvent('download');
  await page.evaluate(async () => (await import('/src/utils/storage.js')).exportStudentsCSV());
  const csv = await readFile(await (await download).path(), 'utf8');
  assert.ok(csv.includes('"Known20","6/1","1","0","1","0","Novice Trainee","0","75"'));
  assert.ok(csv.includes('"Known30","6/1","2","0","1","0","Novice Trainee","0","50"'));
  assert.ok(csv.includes('"Unknown","6/1","3","0","1","0","Novice Trainee","0",""'));
  console.log('PASS: Student reports and CSV use 20/30 totals, keep unknown legacy results blank and fit 320/390/1366.');

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountTwoStepReview());
  const item = await page.evaluate(() => window.__twoStepReviewItem);
  await page.getByRole('heading', { name: /Review Mistakes/ }).waitFor();
  const speak = page.getByRole('button', { name: 'ฟังเสียงอ่าน', exact: true }).last();
  if (await speak.count()) { await speak.click(); assert.equal(await page.locator('dialog[open]').count(), 0); }
  for (const [main, reason, key, count] of [
    [false, false, 'bothWrong', 0], [true, false, 'mainRightReasonWrong', 0], [false, true, 'mainWrongReasonRight', 0],
    [true, true, 'bothCorrect', 1], [true, true, 'bothCorrect', 2],
  ]) {
    await page.locator('.option-btn').nth(main ? item.answer : (item.answer + 1) % item.options.length).click();
    await page.getByText(item.reasonQuestion, { exact: true }).waitFor();
    if (main && reason && count === 1) {
      for (const width of [320, 390, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: `scratch/phase0-screenshots/two-step-review-${width}.png`, fullPage: true });
      }
    }
    const reasonIndex = item.correctReasonIndex ?? item.reasonAnswer;
    await page.locator('.option-btn').nth(reason ? reasonIndex : (reasonIndex + 1) % item.reasonChoices.length).evaluate(button => { button.click(); button.click(); });
    await page.locator('dialog[open] .feedback-explanation p').waitFor();
    assert.equal(normalize(await page.locator('dialog[open] .feedback-explanation p').innerText()), normalize(item.feedback[key]));
    const saved = await page.evaluate(id => JSON.parse(localStorage.getItem('eq_onet_current')).mistakeBank[id], item.id);
    assert.equal(saved.correctInReview, count);
    assert.equal(saved.mastered, count === 2);
    await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).click();
  }
  await page.getByText('คุณไม่มีข้อผิดค้างในระบบแล้ว เก่งมาก!', { exact: true }).waitFor();
  console.log('PASS: actual two-step review displays all four authored feedback branches; only both-correct answers count toward two-review mastery.');

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountSimulator());
  const parts = await page.evaluate(async () => (await import('/src/components/RealOnetSimulator.jsx')).SIMULATOR_PARTS);
  const expected = parts.flatMap(part => part.questions);
  assert.equal(expected.length, 45);
  await page.getByRole('heading', { name: 'ชุดฝึกภาษาอังกฤษ 5 ส่วน', exact: true }).waitFor();
  await page.getByRole('button', { name: /พร้อมแล้ว/ }).click();
  await page.getByRole('button', { name: /เข้าใจสูตรลัดแล้ว/ }).click();
  const positions = new Set();
  for (let index = 0; index < 45; index++) {
    const q = expected[index];
    const option = page.getByRole('button', { name: new RegExp(`^คำตอบ [A-D]: ${escape(q.opts[q.ans])}$`) });
    await option.waitFor();
    positions.add((await option.getAttribute('aria-label')).slice(6, 7));
    if (index === 0) {
      const audio = page.getByRole('button', { name: 'ฟังเสียงอ่าน', exact: true }).last();
      if (await audio.count()) { await audio.click(); assert.equal(await page.locator('[aria-pressed="true"][aria-label^="คำตอบ"]').count(), 0); }
    }
    if (index >= 20 && index <= 29) {
      const passage = await page.locator('.simulator-passage').innerText();
      assert.ok(passage.includes(index < 27 ? 'Mike' : 'Halloween'));
      if (index >= 27) assert.ok(!passage.includes('Mike'));
    }
    if ([0, 27].includes(index)) {
      for (const width of [320, 390, 1366]) {
        await page.setViewportSize({ width, height: 900 });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: `scratch/phase0-screenshots/simulator-${index}-${width}.png`, fullPage: true });
      }
    }
    await option.click();
    const next = page.getByRole('button', { name: /^(ข้อต่อไป →|ไป Part ถัดไป →|ส่งข้อสอบ 🏁)$/ });
    if (index === 44) await next.evaluate(button => { button.click(); button.click(); });
    else await next.click();
    if ([9, 19, 29, 39].includes(index)) await page.getByRole('button', { name: /เข้าใจสูตรลัดแล้ว/ }).click();
  }
  await page.getByRole('heading', { name: 'ผลชุดฝึกภาษาอังกฤษ 5 ส่วน', exact: true }).waitFor();
  assert.ok(await page.getByText('ตอบถูก 45 จาก 45 ข้อ', { exact: true }).isVisible());
  assert.ok(await page.getByText('100%', { exact: true }).isVisible());
  assert.ok(positions.size > 1, 'correct answers must not stay in one position');
  assert.equal((await page.evaluate(() => window.__simulatorXP)).length, 1);
  assert.equal((await page.evaluate(() => window.__simulatorXP))[0][0], 300);

  await page.clock.install();
  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountSimulator());
  await page.getByRole('button', { name: /พร้อมแล้ว/ }).click();
  await page.getByRole('button', { name: /เข้าใจสูตรลัดแล้ว/ }).click();
  const first = expected[0];
  await page.getByRole('button', { name: new RegExp(`^คำตอบ [A-D]: ${escape(first.opts[first.ans])}$`) }).click();
  await page.clock.fastForward(45 * 60 * 1000 + 1000);
  await page.getByRole('heading', { name: 'ผลชุดฝึกภาษาอังกฤษ 5 ส่วน', exact: true }).waitFor();
  assert.ok(await page.getByText('ตอบถูก 1 จาก 45 ข้อ', { exact: true }).isVisible());
  assert.equal((await page.evaluate(() => window.__simulatorXP)).length, 1);
  await page.clock.fastForward(10000);
  assert.equal((await page.evaluate(() => window.__simulatorXP)).length, 1);

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountSimulator());
  await page.getByRole('button', { name: /พร้อมแล้ว/ }).click();
  await page.getByRole('button', { name: /เข้าใจสูตรลัดแล้ว/ }).click();
  for (let index = 0; index < 10; index++) {
    await page.getByRole('button', { name: /^คำตอบ A:/ }).click();
    await page.getByRole('button', { name: /^(ข้อต่อไป →|ไป Part ถัดไป →)$/ }).click();
  }
  await page.getByRole('button', { name: /เข้าใจสูตรลัดแล้ว/ }).waitFor();
  await page.clock.fastForward(45 * 60 * 1000 + 1000);
  await page.getByRole('heading', { name: 'ผลชุดฝึกภาษาอังกฤษ 5 ส่วน', exact: true }).waitFor();
  assert.equal((await page.evaluate(() => window.__simulatorXP)).length, 1);
  console.log('PASS: 45-question practice, shuffled answer keys, correct reading passages, speech isolation, full score, duplicate-submit protection and timeout (including part tips) with one XP award.');

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountSimulator());
  await page.getByRole('button', { name: /พร้อมแล้ว/ }).click();
  await page.getByRole('button', { name: /เข้าใจสูตรลัดแล้ว/ }).click();
  await page.clock.fastForward(45 * 60 * 1000 + 1000);
  await page.getByRole('heading', { name: 'ผลชุดฝึกภาษาอังกฤษ 5 ส่วน', exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => window.__simulatorXP), []);

  await page.evaluate(async () => (await import('/tests/browser-harness.jsx')).mountUnsupportedMcqExam());
  await page.getByRole('heading', { name: 'ยังไม่สามารถเริ่มชุดนี้ได้' }).waitFor();
  await page.clock.fastForward(10000);
  assert.deepEqual(await page.evaluate(() => window.__submissions), []);
  assert.deepEqual(errors, []);
  console.log('PASS: MCQ shortage after rejecting two-step items cannot start a timer or submit an undersized paper.');
} finally { await browser.close(); }
