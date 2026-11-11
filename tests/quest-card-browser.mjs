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
    if (url.origin === new URL(process.env.APP_URL || 'http://127.0.0.1:5173').origin) return route.continue();
    if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173');
  await page.getByRole('heading', { name: 'Quest Map', exact: true }).waitFor();
  const mapPosition = await page.evaluate(() => {
    const map = document.querySelector('.qm-adventure-map');
    const smart = document.querySelector('.qm-smart-path');
    return Boolean(map && smart && (map.compareDocumentPosition(smart) & Node.DOCUMENT_POSITION_FOLLOWING));
  });
  assert.equal(mapPosition, true);
  assert.equal(await page.locator('.qm-map-avatar').count(), 1);
  assert.match(await page.locator('.qm-map-avatar').innerText(), /คุณอยู่ที่นี่/);
  assert.equal(await page.getByRole('button', { name: /ดู Boss Gate/ }).count(), 1);
  await page.getByRole('tab', { name: /บท 3/ }).click();
  assert.match(await page.getByRole('tab', { name: /บท 3/ }).innerText(), /ผ่าน 0\/7 ด่าน/);
  assert.equal(await page.locator('.qm-map-node').count(), 7);
  for (const missionId of ['c3_labeling_lab', 'c3_ordering_quest', 'c3_graph_comparison']) {
    assert.equal(await page.locator(`.qm-map-node[data-map-quest-id="${missionId}"]`).count(), 1);
  }
  assert.equal(await page.getByText(/Local Staging · Mission ใหม่/).count(), 1);
  await page.getByRole('tab', { name: /บท 1/ }).click();
  assert.equal(await page.locator('.qm-quest-detail').count(), 1);
  assert.match(await page.locator('.qm-quest-detail').innerText(), /Family & Home/);
  assert.match(await page.locator('.qm-mission-objectives').innerText(), /เรียนรู้คำเรียกสมาชิกในครอบครัว/);
  assert.equal(await page.locator('.qm-mission-art').getAttribute('aria-label'), 'ด่านที่ 2');
  await page.locator('.qm-map-viewport').dispatchEvent('wheel');
  assert.equal(await page.getByRole('button', { name: 'กลับไปด่านปัจจุบัน' }).count(), 1);
  const returnBounds = await page.getByRole('button', { name: 'กลับไปด่านปัจจุบัน' }).boundingBox();
  const viewportBounds = await page.locator('.qm-map-viewport').boundingBox();
  assert.ok(returnBounds.y + returnBounds.height <= viewportBounds.y);
  await page.getByRole('button', { name: 'กลับไปด่านปัจจุบัน' }).click();
  await page.getByRole('button', { name: 'กลับไปด่านปัจจุบัน' }).waitFor({ state: 'detached' });
  await page.getByRole('button', { name: /ดู Boss Gate/ }).click();
  assert.equal(await page.locator('.qm-map-node.is-boss button:focus').count(), 1);
  await page.locator('.qm-map-node.is-boss button').click();
  assert.match(await page.locator('.qm-quest-detail').innerText(), /O-NET Blueprint Boss/);
  assert.match(await page.locator('.qm-mission-objectives').innerText(), /ทำแบบทดสอบท้ายบท/);
  assert.doesNotMatch(await page.locator('.qm-mission-objectives').innerText(), /สมาชิกในครอบครัว/);
  assert.equal(await page.locator('.qm-quest-detail .qm-detail-action').count(), 1);
  await page.locator('.qm-map-node[data-map-quest-id="vocabulary"] button').click();
  assert.equal(await page.locator('.qm-mission-art img').getAttribute('src'), '/learning/places/airport-v1.png');
  assert.match(await page.locator('.qm-mission-rewards').innerText(), /186 ดาว/);
  assert.match(await page.locator('.qm-detail-action').innerText(), /เล่นอีกครั้ง/);
  assert.doesNotMatch(await page.locator('.qm-mission-objectives').innerText(), /สมาชิกในครอบครัว/);
  await page.locator('.qm-map-node[data-map-quest-id="about_myself"] button').click();
  assert.match(await page.locator('.qm-detail-action').innerText(), /เริ่มภารกิจ/);
  assert.match(await page.locator('.qm-mission-rewards').innerText(), /ยังไม่มีประวัติดาว/);
  assert.doesNotMatch(await page.locator('.qm-mission-rewards').innerText(), /0 ดาว/);
  assert.doesNotMatch(await page.locator('.qm-mission-rewards').innerText(), /เหรียญ|ไอเทม|\+50/);
  await page.locator('.qm-map-node[data-map-quest-id="family"] button').click();
  await page.locator('.qm-map-node[data-map-quest-id="family"] button').click();
  assert.match(await page.locator('.qm-quest-detail').innerText(), /Family & Home/);
  assert.equal(await page.locator('.qm-quest-detail .qm-detail-action').count(), 1);
  assert.ok((await page.locator('.qm-map-viewport').boundingBox()).height >= 390);
  assert.ok((await page.locator('.qm-xp').innerText()).includes('เหลืออีก 75 XP'));
  assert.equal(await page.getByRole('button', { name: /ผจญภัยต่อ/ }).count(), 1);
  assert.equal(await page.locator('.qm-quest-card').count(), 0);
  await page.getByRole('button', { name: /ดูภารกิจทั้งหมด/ }).click();
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
  await challenge.getByRole('heading', { name: 'O-NET Blueprint Boss' }).waitFor();
  const bossButton = challenge.locator('.qm-card-play');
  await bossButton.waitFor();
  assert.match(await bossButton.getAttribute('aria-label'), /^(ล็อก|ท้าทายบอส) O-NET Blueprint Boss$/);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const missionPanel = page.locator('.qm-mission-panel');
    const missionAction = missionPanel.locator('.qm-detail-action');
    await missionAction.scrollIntoViewIfNeeded();
    const missionMetrics = await missionPanel.evaluate(panel => ({
      columns: getComputedStyle(panel).gridTemplateColumns.split(' ').length,
      objectiveFont: parseFloat(getComputedStyle(panel.querySelector('.qm-mission-objectives li')).fontSize),
      artworkWidth: panel.querySelector('.qm-mission-art').getBoundingClientRect().width,
    }));
    assert.equal(missionMetrics.columns, width < 700 ? 1 : width < 1100 ? 2 : 4);
    assert.ok(missionMetrics.objectiveFont >= 15);
    assert.ok(missionMetrics.artworkWidth >= 170);
    const actionBounds = await missionAction.boundingBox();
    assert.ok(actionBounds.height >= 80);
    const bottomNav = await page.locator('.nav-bottom').boundingBox();
    assert.ok(actionBounds.y + actionBounds.height <= bottomNav.y);
    const navigation = page.locator('.qm-toolbar');
    assert.equal(await navigation.getByRole('tab', { name: 'บทเรียน' }).count(), 1);
    assert.equal(await navigation.getByRole('tab', { name: 'สนามสอบ' }).count(), 1);
    assert.equal(await navigation.locator('button').count(), 2);
    for (const button of await navigation.locator('button').all()) assert.ok((await button.boundingBox()).height >= 44);
    await passed.scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await passed.screenshot({ path: `scratch/phase0-screenshots/quest-card-${width}.png` });
    await recommended.screenshot({ path: `scratch/phase0-screenshots/recommended-card-${width}.png` });
    await challenge.scrollIntoViewIfNeeded();
    await challenge.screenshot({ path: `scratch/phase0-screenshots/challenge-${width}.png` });
  }
  await page.getByRole('tab', { name: /บท 5/ }).click();
  await page.locator('.qm-map-node.is-locked button').first().click();
  assert.equal(await page.locator('.qm-quest-detail .qm-detail-action').count(), 0);
  await page.getByRole('button', { name: 'ดูเงื่อนไขปลดล็อก' }).click();
  assert.match(await page.locator('.qm-quest-detail').innerText(), /ทบทวนข้อผิด|ผ่านทุกด่าน/);
  await page.getByRole('button', { name: /ดูภารกิจทั้งหมด/ }).click();
  assert.equal(await page.locator('.qm-quest-card.is-locked').count(), 8);
  await page.getByRole('region', { name: 'ด่านท้าทายท้ายบท' }).getByRole('heading', { name: 'Knowledge Challenge' }).waitFor();
  await page.getByRole('tab', { name: /บท 2/ }).click();
  await page.getByRole('button', { name: /ดูภารกิจทั้งหมด/ }).click();
  await page.getByRole('region', { name: 'ด่านท้าทายท้ายบท' }).getByRole('heading', { name: 'Social Challenge' }).waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS: lifetime stars/rounds, passed/ready/locked states and responsive cards; mocked network only');
} finally { await browser.close(); }
