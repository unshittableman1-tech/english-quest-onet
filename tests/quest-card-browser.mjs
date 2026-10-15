import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const student = {
    id: 'card_test', name: 'Practice Test', role: 'student', isDemo: true, class: 'ป.6/1', number: 1,
    preTest: { totalScore: 40 }, xp: 175, level: 2, badges: [],
    questProgress: { vocabulary: { passed: true, pct: 100, roundsPlayed: 62, stars: Array(62).fill(3) }, family: { pct: 0, attempts: 1 } },
  };
  await context.addInitScript(student => localStorage.setItem('eq_onet_current', JSON.stringify(student)), student);
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
  await page.getByRole('heading', { name: 'Quest Map', exact: true }).waitFor();
  const passed = page.locator('.qm-quest-card').filter({ has: page.getByRole('heading', { name: 'Vocab Village', exact: true }) });
  assert.ok((await passed.innerText()).includes('ฝึกสะสม 62 รอบ'));
  assert.ok((await passed.innerText()).includes('ระดับดาว 3/3'));
  assert.ok((await passed.innerText()).includes('ผ่านเกณฑ์แล้ว'));
  assert.equal(await passed.locator('progress').count(), 0);
  assert.ok(await page.locator('.qm-quest-card.is-ready').count() > 0);
  const recommended = page.locator('.qm-quest-card.is-recommended');
  assert.equal(await recommended.count(), 1);
  assert.ok((await recommended.innerText()).includes('Family & Home'));
  assert.ok((await recommended.innerText()).includes('ยังไม่ผ่าน'));
  assert.ok((await recommended.innerText()).includes('แนะนำ'));
  assert.ok((await page.locator('.qm-quest-card').filter({ has: page.getByRole('heading', { name: 'School & Classroom', exact: true }) }).innerText()).includes('ยังไม่เริ่ม'));
  const challenge = page.getByRole('region', { name: 'ด่านท้าทายท้ายบท' });
  assert.equal(await challenge.locator('.qm-quest-card').count(), 1);
  await challenge.getByRole('heading', { name: 'Grammar Boss' }).waitFor();
  const bossButton = challenge.locator('.qm-card-play');
  await bossButton.waitFor();
  assert.match(await bossButton.getAttribute('aria-label'), /^(ล็อก|ท้าทายบอส) Grammar Boss$/);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await passed.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await passed.screenshot({ path: `scratch/phase0-screenshots/quest-card-${width}.png` });
    await recommended.screenshot({ path: `scratch/phase0-screenshots/recommended-card-${width}.png` });
    await challenge.scrollIntoViewIfNeeded();
    await challenge.screenshot({ path: `scratch/phase0-screenshots/challenge-${width}.png` });
  }
  await page.getByRole('tab', { name: /บท 5/ }).click();
  assert.equal(await page.locator('.qm-quest-card.is-locked').count(), 8);
  await page.getByRole('region', { name: 'ด่านท้าทายท้ายบท' }).getByRole('heading', { name: 'Knowledge Challenge' }).waitFor();
  await page.getByRole('tab', { name: /บท 2/ }).click();
  await page.getByRole('region', { name: 'ด่านท้าทายท้ายบท' }).getByRole('heading', { name: 'Social Challenge' }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: lifetime stars/rounds, passed/ready/locked states and responsive cards; mocked network only');
} finally { await browser.close(); }
