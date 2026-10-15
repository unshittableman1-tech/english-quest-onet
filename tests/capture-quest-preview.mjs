import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    if (url.hostname.endsWith('.supabase.co')) return route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    return route.abort();
  });
  await page.goto(process.env.SMOKE_URL || 'http://127.0.0.1:5173');
  await page.getByRole('button', { name: 'ทดลองเล่น', exact: true }).click();
  await page.setViewportSize({ width: 528, height: 1200 });
  const chapter = page.getByText('Chapter 1 — The Foundation', { exact: true });
  await chapter.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.fonts.ready);
  const box = await page.locator('.qm-chapter-panel').evaluate(el => {
    const first = el.getBoundingClientRect();
    const last = el.querySelectorAll('.qm-quest-card')[2].getBoundingClientRect();
    return { x: first.left, y: first.top + scrollY, width: first.width, height: last.bottom - first.top };
  });
  await page.waitForFunction(() => [...document.images].filter(img => img.getBoundingClientRect().top < innerHeight).every(img => img.complete));
  await mkdir('public/assets/previews', { recursive: true });
  await page.screenshot({ path: 'public/assets/previews/quest-demo.png', clip: box, animations: 'disabled' });
  console.log(`Image dimensions: ${box.width * 2} x ${box.height * 2}`);
  console.log('Captured actual Chapter 1 and first three quests from the isolated demo.');
} finally { await browser.close(); }
