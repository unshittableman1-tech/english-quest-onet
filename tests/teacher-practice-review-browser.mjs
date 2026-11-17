import assert from 'node:assert/strict';
import { setupSyntheticTeacher, SYNTHETIC_TEACHER } from '../scripts/local-staging/setup-synthetic-teacher.mjs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

await setupSyntheticTeacher();
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'เข้าสู่ระบบครู', exact: true }).first().click();
  await page.getByPlaceholder('teacher@school.ac.th').fill(SYNTHETIC_TEACHER.email);
  await page.getByPlaceholder('••••').fill(SYNTHETIC_TEACHER.password);
  await page.getByRole('button', { name: /เข้าสู่ Teacher Dashboard/ }).click();
  const menuButton = page.getByRole('button', { name: 'เปิดเมนู' });
  await menuButton.waitFor({ timeout: 15000 });
  await menuButton.click();
  await page.getByRole('button', { name: /ตรวจชุดฝึก AI/ }).click();
  await page.getByRole('heading', { name: /ตรวจชุดฝึก/ }).waitFor();
  assert.match(await page.locator('main').innerText(), /Teacher Review Required/);
  assert.match(await page.locator('main').innerText(), /ระบบตรวจชุดฝึก AI พร้อมใช้งาน/);
  assert.ok(await page.getByRole('button', { name: /สร้างชุดฝึก AI ใหม่/ }).isVisible());
  assert.ok(await page.getByRole('button', { name: /อนุมัติชุดฝึก/ }).count() > 0);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 2));
  console.log('PASS: Teacher Review page is complete, active, and responsive.');
} finally { await browser.close(); }
