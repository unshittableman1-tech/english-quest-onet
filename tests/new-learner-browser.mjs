import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const output = 'scratch/phase0-screenshots';
const normalize = text => text.replace(/\s+/g, ' ').trim();
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
let record = {
  id: 'std_onboarding_browser_fixture', name: 'New Learner Browser Test', class: '6/2', number: '59',
  school_code: 'BNS01', school_id: 'sch_bns_01', role: 'student', xp: 0, level: 1,
  questProgress: {}, mistakeBank: {}, badges: [], preTest: null,
};
const writes = [];
const errors = [];
try {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce' });
  // Every remote request is intercepted. The roster and writes exist only in this process.
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === 'http://127.0.0.1:5173') return route.continue();
    if (url.pathname === '/rest/v1/students') {
      const matches = [...url.searchParams].every(([key, value]) =>
        !value.startsWith('eq.') || String(record[key]) === value.slice(3));
      if (request.method() !== 'GET' && matches) {
        const payload = request.postDataJSON();
        const update = Array.isArray(payload) ? payload[0] : payload;
        assert.ok(!update.id || update.id === record.id);
        record = { ...record, ...update };
        writes.push(structuredClone(update));
      }
      const rows = matches ? [record] : [];
      const single = request.headers().accept?.includes('vnd.pgrst.object');
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(single ? rows[0] || null : rows) });
    }
    if (url.pathname.startsWith('/rest/v1/')) return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.abort();
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const name of [/รับรางวัล!/, /^เยี่ยมยอด!$/, /^สุดยอด!$/, /เริ่มผจญภัยต่อ/]) {
    await page.addLocatorHandler(page.locator('body:not(:has(dialog[open]))').getByRole('button', { name }).first(), async button => {
      if (await button.isEnabled()) await button.click();
    });
  }
  await mkdir(output, { recursive: true });
  await page.goto('http://127.0.0.1:5173/?route=student-login');
  assert.equal(await page.evaluate(() => localStorage.getItem('eq_onet_current')), null);
  await page.getByRole('heading', { name: 'กรอกข้อมูลนักเรียน' }).waitFor();
  await page.getByRole('combobox').selectOption('6/2');
  await page.getByPlaceholder('เช่น 1', { exact: true }).fill('59');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).click();

  await page.getByRole('heading', { name: /Pre-test/ }).waitFor();
  const catalog = await page.evaluate(async () => {
    const { QUESTS } = await import('/src/data/questions.js');
    const { pretestV2Questions } = await import('/src/data/pretestV2.js');
    const { isPracticeQuestionReady } = await import('/src/utils/questionMedia.js');
    return { pretest: pretestV2Questions, quests: QUESTS.map(q => ({ id: q.id, name: q.name, chapter: q.chapter, questions: q.questions, roundSize: Math.min(10, q.questions.filter(isPracticeQuestionReady).length) })) };
  });
  assert.equal(catalog.pretest.length, 20);
  for (let index = 0; index < 20; index++) {
    const stem = normalize(await page.locator('p.text-slate-800.font-bold.text-lg').innerText());
    const item = catalog.pretest.find(q => normalize(q.prompt) === stem);
    assert.ok(item, stem);
    if (item.passage) assert.equal(normalize(await page.locator('.question-stimulus-passage').innerText()), normalize(item.passage));
    await page.locator('.option-btn').nth(item.answer).click();
    await page.getByRole('button', { name: index === 19 ? /ดูผลการทดสอบ/ : /ข้อต่อไป/ }).click();
  }
  await page.getByRole('heading', { name: 'ผลการทดสอบก่อนเรียน' }).waitFor();
  assert.ok(await page.getByText('20/20', { exact: true }).isVisible());
  await page.getByRole('button', { name: /ไป Quest Map/ }).click();
  await page.getByRole('heading', { name: 'Quest Map', exact: true }).waitFor();
  let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('eq_onet_current')));
  assert.deepEqual(saved.questProgress, {});
  assert.equal(saved.preTest.total, 20);
  assert.equal(saved.preTest.version, 'pretest-v2');
  assert.equal(saved.badgeStats.pretestScore, 100);
  console.log('PASS: fresh roster login and full 20-item Pre-test saved with actual total and 100%.');

  async function assertChapter2Locked() {
    await page.locator('#qm-chapter-2').click();
    assert.equal(await page.getByRole('button', { name: 'เข้าเล่น Conversation Café', exact: true }).count(), 0);
    await page.locator('#qm-chapter-1').click();
  }
  await assertChapter2Locked();
  const chapter1 = catalog.quests.filter(q => q.chapter === 1);
  const report = { login: 'mock roster via actual StudentLoginPage', initialProgress: {}, pretest: { score: 20, total: 20 }, quests: [], network: 'all remote calls intercepted' };
  for (const quest of chapter1) {
    await page.locator('#qm-chapter-1').click();
    await page.getByRole('button', { name: `เข้าเล่น ${quest.name}`, exact: true }).click();
    await page.getByRole('button', { name: /Quiz Mode/ }).click();
    const start = page.getByRole('button', { name: /เริ่ม Quiz!/ });
    if (await start.isVisible()) await start.click();
    await page.locator('.quiz-question').waitFor();
    for (let count = 0; count < quest.roundSize; count++) {
      await page.getByRole('region', { name: `โจทย์ข้อ ${count + 1}`, exact: true }).waitFor();
      const stem = normalize(await page.locator('.quiz-question-text').innerText());
      const options = await page.locator('.quiz-answer').evaluateAll(buttons => buttons.map(b => b.getAttribute('aria-label').replace(/^คำตอบ [A-D]: /, '')));
      const image = await page.locator('.question-stimulus-image img').evaluateAll(images => images[0]?.getAttribute('src') || null);
      const item = quest.questions.find(q => normalize(q.question) === stem && q.options.every(option => options.includes(option)) && (q.image || null) === image);
      assert.ok(item, `${quest.id}: ${stem}`);
      const correct = page.getByRole('button', { name: new RegExp(`^คำตอบ [A-D]: ${escape(item.options[item.answer])}$`) });
      if (quest.id === 'shapes_colors' && count < 3) {
        const correctIndex = options.indexOf(item.options[item.answer]);
        await page.locator('.quiz-answer').nth((correctIndex + 1) % options.length).click();
        const retry = page.getByRole('button', { name: /ลองอีกครั้ง/ });
        await page.waitForFunction(() => [...document.querySelectorAll('dialog button')].some(b => b.textContent.includes('ลองอีกครั้ง') && !b.disabled));
        await retry.click();
      }
      await correct.click();
      await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).click();
    }
    await page.locator('.quiz-summary-score').waitFor();
    saved = await page.evaluate(() => JSON.parse(localStorage.getItem('eq_onet_current')));
    const progress = saved.questProgress[quest.id];
    assert.ok(progress?.passed, quest.id);
    assert.equal(progress.roundsPlayed, 1);
    if (quest.id === 'shapes_colors') {
      assert.equal(progress.lastAssessment.score, 7);
      assert.equal(Object.keys(saved.mistakeBank).length, 3);
    }
    report.quests.push({ id: quest.id, score: progress.score, total: progress.total });
    console.log(`PASS: ${quest.id} ${progress.score}/${progress.total}, first round persisted.`);
    await page.getByRole('button', { name: 'Quest Map', exact: true }).click();
    await page.getByRole('heading', { name: 'Quest Map', exact: true }).waitFor();
    await assertChapter2Locked();
  }
  assert.equal(Object.keys(saved.questProgress).length, 10);
  await page.getByRole('button', { name: 'ทบทวนข้อผิด', exact: true }).click();
  const mistakes = Object.values(saved.mistakeBank);
  for (let index = 0; index < 6; index++) {
    const stem = normalize(await page.locator('p.text-slate-800.font-bold.text-lg').innerText());
    const image = await page.locator('.question-stimulus-image img').evaluateAll(images => images[0]?.getAttribute('src') || null);
    const item = mistakes.find(q => normalize(q.question) === stem && (q.image || null) === image);
    assert.ok(item, stem);
    await page.locator('.option-btn').filter({ hasText: new RegExp(`^[A-D]\\.\\s*${escape(item.options[item.answer])}$`) }).click();
    await page.getByRole('button', { name: 'ข้อต่อไป', exact: true }).click();
  }
  await page.getByText('คุณไม่มีข้อผิดค้างในระบบแล้ว เก่งมาก!', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'กลับไปที่ Quest Map', exact: true }).click();
  await page.locator('#qm-chapter-2').click();
  await page.getByRole('button', { name: 'เข้าเล่น Conversation Café', exact: true }).waitFor();
  saved = await page.evaluate(() => JSON.parse(localStorage.getItem('eq_onet_current')));
  assert.ok(Object.values(saved.mistakeBank).every(q => q.mastered && q.correctInReview === 2));
  report.mistakes = Object.values(saved.mistakeBank).map(q => ({ id: q.id, mastered: q.mastered, correctInReview: q.correctInReview }));
  const snapshot = JSON.stringify(saved.questProgress);
  await page.goto('http://127.0.0.1:5173/');
  await page.getByRole('heading', { name: 'Quest Map', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem('eq_onet_current')).questProgress)), snapshot);
  await page.locator('#qm-chapter-2').click();
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${output}/new-learner-chapter2-${width}.png`, fullPage: true });
  }
  await page.getByRole('button', { name: 'เข้าเล่น Conversation Café', exact: true }).click();
  await page.getByRole('button', { name: /Quiz Mode/ }).click();
  const start = page.getByRole('button', { name: /เริ่ม Quiz!/ });
  if (await start.isVisible()) await start.click();
  await page.locator('.quiz-question').waitFor();
  assert.equal(await page.locator('.quiz-answer').count(), 4);
  assert.deepEqual(errors, []);
  report.chapter2Entered = true;
  report.refreshPreservedProgress = true;
  report.mockWrites = writes.length;
  await writeFile('scratch/new-learner-report.json', JSON.stringify(report, null, 2));
  console.log('PASS: empty session -> actual login with mock roster -> 20-item Pre-test -> all 10 Chapter 1 quests -> three mistakes reviewed twice -> Chapter 2 Quiz; refresh persists progress; 320/390/1366 layouts; no real cloud writes.');
} finally { await browser.close(); }
