import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const students = [
  { id: 'demo_student', name: 'Smoke Student', class: 'ป.6/1', school_code: 'BNS01', xp: 175, level: 2, role: 'student', preTest: { totalScore: 0, total: 30 }, questProgress: { vocabulary: { pct: 0 } } },
  { id: 'smoke_2', name: 'Smoke Two', class: 'ป.6/1', school_code: 'BNS01', xp: 600, level: 4, role: 'student', preTest: { totalScore: 30, total: 30 }, questProgress: { vocabulary: { pct: 50 }, grammar: { pct: 100 } } },
  { id: 'smoke_3', name: 'Smoke Three', class: 'ป.6/2', school_code: 'BNS01', xp: 0, level: 1, role: 'student' },
];
const errors = [];
await mkdir('scratch/phase0-screenshots', { recursive: true });

const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, serviceWorkers: 'block' });
await context.route('**/*', async route => {
  const url = new URL(route.request().url());
  if (url.hostname === '127.0.0.1') return route.continue();
  if (url.hostname.endsWith('.supabase.co')) {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(students) });
  }
  return route.abort();
});
const page = await context.newPage();
page.on('pageerror', error => { errors.push(error.message); console.error('Browser error:', error.message); });
const baseURL = process.env.SMOKE_URL || 'http://127.0.0.1:5173';

try {
  await page.goto(baseURL);
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1366, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    const cta = await page.getByRole('button', { name: 'เริ่มเรียน', exact: true }).boundingBox();
    assert.ok(cta && cta.y + cta.height <= height, `Primary CTA visible at ${width}px`);
    const featureBand = await page.getByRole('region', { name: 'การเรียนรู้' }).boundingBox();
    assert.ok(featureBand.y < height, `Next section visible at ${width}px`);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `No overflow at ${width}px`);
    assert.equal(await page.getByText('0 XP', { exact: true }).count(), 0);
    await page.waitForFunction(() => {
      const img = document.querySelector('.landing-world');
      return img.complete && img.naturalWidth > 0 && img.currentSrc.includes(innerWidth <= 900 ? 'mobile-v2' : 'hero-v2');
    });
    assert.ok(await page.locator('.landing-world').evaluate(img => img.naturalWidth > 0 && img.currentSrc.includes(window.innerWidth <= 900 ? 'mobile-v2' : 'hero-v2')));
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#landing-title')).opacity === '1');
    await page.screenshot({ path: `scratch/phase0-screenshots/landing-${width}.png`, fullPage: false });
  }
  console.log('PASS: landing CTA, brand and next section visible across five viewports');
  for (const [width, height] of [[1366, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    const preview = page.getByRole('region', { name: 'เลือกภารกิจ แล้วเริ่มฝึก' });
    await preview.scrollIntoViewIfNeeded();
    await page.locator('.landing-quest-preview').evaluate(img => img.decode());
    assert.ok(await page.locator('.landing-quest-preview').evaluate(img => img.naturalWidth > 0 && img.getBoundingClientRect().right <= innerWidth));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await preview.screenshot({ path: `scratch/phase0-screenshots/quest-preview-${width}.png` });
  }
  await page.getByRole('button', { name: 'เปิดโหมดทดลอง', exact: true }).click();
  await page.getByRole('heading', { name: /Quest Map/ }).waitFor();
  await page.goto(baseURL);
  await page.setViewportSize({ width: 1366, height: 900 });
  console.log('PASS: real quest preview renders on desktop/mobile and opens demo');
  const primaryAction = page.getByRole('button', { name: 'เริ่มเรียน', exact: true });
  assert.equal(await page.locator('#landing-title').evaluate(el => getComputedStyle(el).animationIterationCount), '1');
  await primaryAction.hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.landing-primary-action')).transform === 'matrix(1, 0, 0, 1, 0, -2)');
  await primaryAction.focus();
  assert.equal(await primaryAction.evaluate(el => document.activeElement === el), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('#landing-title').evaluate(el => getComputedStyle(el).animationName), 'none');
  assert.equal(await primaryAction.evaluate(el => getComputedStyle(el).transform), 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForFunction(() => document.querySelector('.landing-page').dataset.motionPaused === 'true');
  assert.equal(await page.locator('#landing-title').evaluate(el => getComputedStyle(el).animationPlayState), 'paused');
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await primaryAction.click();
  await page.waitForFunction(() => !document.querySelector('.landing-hero'));
  await page.goto(baseURL);
  console.log('PASS: landing hover, focus, reduced motion, hidden-tab pause and primary navigation');
  await page.getByRole('button', { name: /ทดลองเล่น/ }).click();
  await page.getByRole('heading', { name: /Quest Map/ }).waitFor();
  assert.ok((await page.locator('body').innerText()).includes('Novice Trainee'));
  assert.ok(!(await page.locator('body').innerText()).match(/NaN|undefined/));
  assert.equal(await page.locator('.qm-quest-card').count(), 10);
  for (const [width, height] of [[320, 740], [390, 844], [768, 1024], [1366, 900], [1920, 1080]]) {
    await page.setViewportSize({ width, height });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Map fits ${width}px`);
  }
  await page.getByRole('tab', { name: /บท 5/ }).click();
  assert.equal(await page.locator('.qm-quest-card').count(), 6);
  assert.equal(await page.locator('.qm-card-play:disabled').count(), 6);
  await page.getByLabel('แสดงด่าน', { exact: true }).selectOption('passed');
  await page.getByText('ไม่มีด่านในสถานะนี้', { exact: false }).waitFor();
  await page.getByRole('button', { name: 'แสดงทุกด่าน', exact: true }).click();
  await page.getByRole('tab', { name: /บท 5/ }).focus();
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#qm-chapter-1').getAttribute('aria-selected'), 'true');
  await page.getByRole('tab', { name: 'สนามสอบ', exact: true }).click();
  assert.equal(await page.locator('.qm-exam-item').count(), 3);
  await page.getByRole('button', { name: 'รีเฟรชสถานะ', exact: true }).waitFor();
  await page.route('**/rest/v1/students?*', async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.get('id') === 'eq.__SYSTEM_EXAM_SESSION__') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ arenaStats: { isOpen: true, pin: '123456' } }) });
    }
    return route.fallback();
  });
  await page.getByRole('button', { name: 'รีเฟรชสถานะ', exact: true }).click();
  await page.getByRole('button', { name: 'ใส่ PIN เพื่อเข้าสอบ', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.getByLabel('รหัส PIN', { exact: true }).fill('000000');
  await page.getByRole('button', { name: 'เริ่มทำข้อสอบ', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'รหัส PIN ไม่ถูกต้อง' }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  await page.unroute('**/rest/v1/students?*');
  await page.getByRole('tab', { name: 'บทเรียน', exact: true }).click();
  await page.setViewportSize({ width: 1366, height: 900 });
  console.log('PASS: complete chapter catalog, locked cards, filters, keyboard tabs, exam separation and five viewport sizes');
  await page.locator('.xp-toast').waitFor({ state: 'hidden' });
  await page.screenshot({ path: 'scratch/phase0-screenshots/map-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'scratch/phase0-screenshots/map-mobile.png', fullPage: false });
  await page.locator('.qm-chapter-heading').first().scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'scratch/phase0-screenshots/map-mobile-lessons.png', fullPage: false });
  await page.getByRole('button', { name: /Ranking/ }).click();
  await page.getByRole('heading', { name: 'Leaderboard' }).waitFor();
  await page.getByRole('button', { name: /ดูแรงก์ทั้งหมด/ }).click();
  await page.getByText('ระดับ Tier ทั้งหมด', { exact: true }).waitFor();
  assert.ok((await page.locator('body').innerText()).includes('O-NET God'));
  await page.screenshot({ path: 'scratch/phase0-screenshots/ranking-mobile.png', fullPage: false });
  console.log('PASS: map and tier modal render at desktop/mobile without runtime errors');

  await page.goto(baseURL);
  await page.evaluate(() => {
    localStorage.setItem('eq_onet_current', JSON.stringify({ id: 'teacher_smoke', name: 'Smoke Teacher', role: 'teacher', school_code: 'BNS01', school_name: 'Smoke School' }));
  });
  await page.reload();
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.getByText('จำนวนนักเรียน', { exact: true }).waitFor();
  const preCard = page.getByText('Pre-test เฉลี่ย', { exact: true }).locator('..').locator('..');
  const currentCard = page.getByText('คะแนนปัจจุบัน', { exact: true }).locator('..').locator('..');
  await page.waitForFunction(() => document.body.innerText.includes('50%') && document.body.innerText.includes('38%'));
  assert.ok((await preCard.innerText()).includes('50%'));
  assert.ok((await currentCard.innerText()).includes('38%'));
  assert.ok((await page.getByRole('region', { name: 'ด่านที่ควรทบทวนก่อน' }).innerText()).includes('Vocab Village'));
  await page.screenshot({ path: 'scratch/phase0-screenshots/teacher-desktop.png', fullPage: false });
  console.log('PASS: teacher overview displays fixture-derived 50% / 38% and actual weak areas');
  await page.getByRole('button', { name: 'สร้างแผนทบทวน', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  assert.ok((await page.getByRole('dialog').innerText()).includes('Vocab Village'));
  const planDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ดาวน์โหลดแผน', exact: true }).click();
  assert.equal((await planDownload).suggestedFilename(), 'review-plan.txt');
  await page.getByRole('button', { name: 'ปิดแผนทบทวน', exact: true }).click();
  const csvDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ส่งออกรายชื่อนักเรียนที่ต้องติดตาม', exact: true }).click();
  assert.equal((await csvDownload).suggestedFilename(), 'early-warning.csv');
  await page.getByRole('button', { name: 'ดูรายชื่อ', exact: true }).click();
  await page.getByText('เฝ้าดู', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'ดูผลรายคน', exact: true }).click();
  await page.getByText('Chapter 1 — The Foundation', { exact: true }).waitFor();
  await page.keyboard.press('Escape');
  await page.goto(baseURL);
  await page.getByRole('button', { name: 'รายชื่อนักเรียน', exact: true }).click();
  await page.getByRole('button', { name: /Export รายงาน/ }).click();
  const reportDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export CSV.*ดาวน์โหลด/ }).click();
  const report = await reportDownload;
  const reportStream = await report.createReadStream();
  const chunks = [];
  for await (const chunk of reportStream) chunks.push(chunk);
  const reportText = Buffer.concat(chunks).toString('utf8');
  assert.ok(reportText.includes('Chapter 4 — Data Detective ผ่าน/ทั้งหมด'));
  assert.ok(reportText.includes('O-NET Arena ผ่าน/ทั้งหมด'));
  assert.ok(reportText.includes('"1/10"'));
  await page.getByRole('button', { name: 'ภาพรวมห้องเรียน', exact: true }).click();
  await page.getByRole('button', { name: 'ป.6/2', exact: true }).click();
  assert.ok((await page.getByText('คะแนนปัจจุบัน', { exact: true }).locator('..').locator('..').innerText()).includes('—'));
  await page.getByRole('button', { name: 'ทุกห้อง', exact: true }).click();
  await page.getByRole('button', { name: /ขาว/ }).click();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.teacher-light')).backgroundColor === 'rgb(248, 250, 252)');
  await page.screenshot({ path: 'scratch/phase0-screenshots/teacher-light.png', fullPage: false });
  for (const [width, height] of [[768, 1024], [390, 844]]) {
    await page.setViewportSize({ width, height });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    await page.getByRole('button', { name: 'เปิดเมนู', exact: true }).click();
    await page.getByRole('button', { name: 'รายชื่อนักเรียน', exact: true }).click();
    await page.getByRole('button', { name: 'เปิดเมนู', exact: true }).click();
    await page.getByRole('button', { name: 'ภาพรวมห้องเรียน', exact: true }).click();
    await page.screenshot({ path: `scratch/phase0-screenshots/teacher-${width}.png`, fullPage: false });
  }
  console.log('PASS: teacher filters, warning list, review plan, downloads, light theme and mobile drawer');

  // Mount the existing exam components in isolation to control time and inspect submitted results.
  async function mountExam(component, missionId) {
    await page.evaluate(async ({ component, missionId }) => {
      const harness = await import('/tests/browser-harness.jsx');
      await harness.mountExam(component, missionId, null, true);
    }, { component, missionId });
  }

  await page.clock.install();
  await mountExam('ExamMode', 'final_exam');
  await page.locator('#smoke-root #q-0 button').first().waitFor();
  await page.locator('#smoke-root #q-0 button').first().click();
  await page.clock.fastForward(4000);
  await page.waitForFunction(() => window.__submissions.length === 1);
  const autoAttempt = await page.evaluate(() => window.__submissions[0]);
  const answered = autoAttempt.score + autoAttempt.wrongQuestions.filter(q => q.userAnswerIndex !== undefined).length;
  assert.equal(answered, 1);
  assert.equal(autoAttempt.total, 50);
  assert.equal(autoAttempt.timeUsed, 3);
  assert.equal(autoAttempt.points, autoAttempt.score * 2);
  console.log('PASS: exam timeout submits the latest answer with correct timing and points');

  await mountExam('ExamMode', 'mini_mock_arena');
  await page.locator('#smoke-root #q-0 button').first().waitFor();
  await page.locator('#smoke-root').getByRole('button', { name: 'ส่งคำตอบ', exact: true }).click();
  await page.locator('#smoke-root').getByRole('button', { name: 'ส่งข้อสอบ', exact: true }).evaluate(button => { button.click(); button.click(); });
  assert.equal(await page.evaluate(() => window.__submissions.length), 1);
  console.log('PASS: rapid double-submit emits only one exam result');

  await mountExam('FinalBoss');
  await page.locator('#smoke-root').getByRole('button', { name: /เริ่มสอบ/ }).click();
  const correctOptions = await page.evaluate(() => window.__bossCorrectOptions);
  await page.locator('#smoke-root button.option-btn').nth(correctOptions[0]).click();
  await page.locator('#smoke-root').getByRole('button', { name: /ข้อต่อไป/ }).click();
  await page.locator('#smoke-root button.option-btn').nth(correctOptions[1]).click();
  await page.clock.fastForward(1801000);
  await page.waitForFunction(() => !!window.__smokeStudent.finalBoss);
  const boss = await page.evaluate(() => window.__smokeStudent);
  assert.equal(boss.finalBoss.score, 2);
  assert.equal(boss.questProgress.finalboss.total, boss.finalBoss.total);
  assert.equal(boss.questProgress.finalboss.pct, boss.finalBoss.pct);
  await page.locator('#smoke-root').getByText('หมดเวลา!', { exact: false }).waitFor();
  console.log('PASS: Final Boss timeout uses current answers and persists demo progress in memory');

  assert.deepEqual(errors, []);
  console.log('PASS: no uncaught browser errors; all network writes used mock responses');
} finally {
  await browser.close();
}
