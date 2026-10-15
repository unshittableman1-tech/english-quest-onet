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
  await page.goto('http://127.0.0.1:5173/scratch/media-review.html');
  await page.getByRole('heading', { name: 'ตรวจสื่อ SET7' }).waitFor();
  assert.equal(await page.getByRole('combobox', { name: 'ข้อที่ตรวจ' }).locator('option').count(), 10);
  await mkdir('scratch/phase0-screenshots', { recursive: true });
  for (const width of [320, 390, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    for (let index = 0; index < 10; index++) {
      await page.getByRole('combobox', { name: 'ข้อที่ตรวจ' }).selectOption(String(index));
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px item ${index}`);
      const title = await page.locator('main > h2').textContent();
      assert.ok(title.length);
      assert.equal(await page.locator('.question-stimulus-error').count(), 0);
      if (index <= 4 && index !== 2) {
        const svg = page.locator('.question-chart-scroll svg');
        await svg.waitFor();
        assert.ok(await svg.locator('text').count() >= 8);
        const bars = svg.locator('rect');
        if (index === 1) assert.equal(await svg.locator('polyline').count(), 1);
        else assert.ok(await bars.evaluateAll(nodes => nodes.every(node => Number(node.getAttribute('height')) > 0)));
        await page.locator('.question-chart-data summary').click();
        assert.equal(await page.locator('.question-chart-data tbody tr').count(), 3);
      } else if (index === 2) {
        assert.deepEqual(await page.locator('.question-stimulus-sequence li').allTextContents(), ['1Morning', '2Class', '3Lunch', '4After school', '5Home']);
      } else {
        assert.equal(await page.locator('.question-stimulus-table tbody tr').count(), 3);
        assert.ok((await page.locator('.question-stimulus-table').textContent()).includes('38.5'));
      }
      if ([0, 1, 2, 5].includes(index)) await page.screenshot({ path: `scratch/phase0-screenshots/media-source-${index}-${width}.png`, fullPage: true });
    }
  }
  await page.getByRole('combobox', { name: 'ข้อที่ตรวจ' }).selectOption('5');
  await page.getByText('เฉลยและเหตุผล', { exact: true }).click();
  assert.match(await page.locator('main > details').textContent(), /28.8.*38.5.*33.1/);
  const source = await page.getByRole('link', { name: 'ต้นฉบับหน้า 5' }).getAttribute('href');
  assert.equal((await page.request.get(`http://127.0.0.1:5173${source}`)).status(), 200);
  await page.getByRole('button', { name: 'ข้อถัดไป' }).click();
  assert.equal(await page.getByRole('combobox').inputValue(), '6');
  await page.getByRole('button', { name: 'ข้อก่อนหน้า' }).click();
  assert.equal(await page.getByRole('combobox').inputValue(), '5');
  assert.equal(await page.getByRole('button', { name: /อนุมัติ|บันทึกคะแนน/ }).count(), 0);
  assert.deepEqual(errors, []);
  console.log('PASS: all 10 source repairs preview correctly at 320/390/768/1366; chart marks, table values, timeline order, source links and review navigation; no grade/approval writes.');
} finally { await browser.close(); }
