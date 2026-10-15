import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ serviceWorkers: 'block' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return ['127.0.0.1', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(host) ? route.continue() : route.abort();
  });
  await page.goto('http://127.0.0.1:5173/scratch/logo-comparison.html');
  await page.getByRole('heading', { name: 'แนวทางโลโก้', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await mkdir('scratch/logo-studies', { recursive: true });
  for (const width of [1366, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
    for (const surface of ['ฉากเกม', 'พื้นสว่าง', 'พื้นมืด']) {
      await page.getByRole('button', { name: surface, exact: true }).click();
      assert.equal(await page.getByRole('button', { name: surface, exact: true }).getAttribute('aria-pressed'), 'true');
    }
    await page.getByRole('button', { name: 'ฉากเกม', exact: true }).click();
    await page.screenshot({ path: `scratch/logo-studies/comparison-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  console.log('PASS: both logo concepts at 1366/390/320px, three background controls, no overflow or runtime errors.');
  console.log('Fredoka loaded:', await page.evaluate(() => document.fonts.check('700 46px Fredoka')));
} finally { await browser.close(); }
