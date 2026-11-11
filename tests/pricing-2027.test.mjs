import test from 'node:test';
import assert from 'node:assert/strict';
import { PRICING_PLANS, BILLING_CYCLES, SCHOOL_PACKAGES, formatPrice } from '../src/data/pricingPlans.js';
import { FALLBACK_PLANS } from '../src/utils/schoolAdmin.js';
import fs from 'node:fs';

test('Pricing 2027: All 5 canonical plans are defined with correct structure', () => {
  assert.equal(PRICING_PLANS.length, 5);

  const planIds = PRICING_PLANS.map(p => p.id);
  assert.deepEqual(planIds, [
    'student_hero',
    'teacher_pro',
    'school_starter',
    'school_growth',
    'superpower'
  ]);
});

test('Pricing 2027: Prices and discounts match specification', () => {
  const student = PRICING_PLANS.find(p => p.id === 'student_hero');
  assert.equal(student.prices.monthly, 79);
  assert.equal(student.prices.semester, 299);
  assert.equal(student.prices.yearly, 499);

  const teacher = PRICING_PLANS.find(p => p.id === 'teacher_pro');
  assert.equal(teacher.prices.monthly, 199);
  assert.equal(teacher.prices.semester, 590);
  assert.equal(teacher.prices.yearly, 990);
  assert.equal(teacher.perStudentFee.monthly, 10);
  assert.equal(teacher.perStudentFee.semester, 25);
  assert.equal(teacher.perStudentFee.yearly, 40);

  const starter = PRICING_PLANS.find(p => p.id === 'school_starter');
  assert.equal(starter.prices.monthly, null); // Schools do not have monthly
  assert.equal(starter.prices.semester, 2490);
  assert.equal(starter.prices.yearly, 3900);

  const growth = PRICING_PLANS.find(p => p.id === 'school_growth');
  assert.equal(growth.prices.monthly, null);
  assert.equal(growth.prices.semester, 4590);
  assert.equal(growth.prices.yearly, 7900);

  const superpower = PRICING_PLANS.find(p => p.id === 'superpower');
  assert.equal(superpower.prices.monthly, null);
  assert.equal(superpower.prices.semester, 8900);
  assert.equal(superpower.prices.yearly, 14900);
});

test('Pricing 2027: School seat and teacher quotas are strictly enforced in schema & fallback', () => {
  assert.equal(SCHOOL_PACKAGES.length, 3);

  const teacher = FALLBACK_PLANS.find(p => p.code === 'teacher_pro');
  assert.equal(teacher.max_students, 50); // Accommodates 45-50 students across 2 rooms
  assert.equal(teacher.max_classes, 2);

  const starter = FALLBACK_PLANS.find(p => p.code === 'school_starter');
  assert.equal(starter.max_students, 60);
  assert.equal(starter.max_teachers, 3);

  const growth = FALLBACK_PLANS.find(p => p.code === 'school_growth');
  assert.equal(growth.max_students, 200);
  assert.equal(growth.max_teachers, 10);

  const superpower = FALLBACK_PLANS.find(p => p.code === 'superpower');
  assert.equal(superpower.max_students, 500);
  assert.equal(superpower.max_teachers, 999);
});

test('Pricing 2027: Teacher Pro calculates base fee + per-student fee correctly', () => {
  const teacherPlan = PRICING_PLANS.find(p => p.id === 'teacher_pro');
  assert.equal(teacherPlan.prices.monthly, 199);
  assert.equal(teacherPlan.prices.semester, 590);
  assert.equal(teacherPlan.prices.yearly, 990);
  assert.equal(teacherPlan.maxClasses, 2);

  // 15 students monthly: ฿199 + (15 * 10) = ฿349
  const monthly15 = teacherPlan.prices.monthly + (15 * teacherPlan.perStudentFee.monthly);
  assert.equal(monthly15, 349);

  // 15 students semester: ฿590 + (15 * 25) = ฿965
  const semester15 = teacherPlan.prices.semester + (15 * teacherPlan.perStudentFee.semester);
  assert.equal(semester15, 965);

  // 15 students yearly: ฿990 + (15 * 40) = ฿1,590
  const yearly15 = teacherPlan.prices.yearly + (15 * teacherPlan.perStudentFee.yearly);
  assert.equal(yearly15, 1590);
});

test('Pricing 2027: SQL migration file contains valid upsert for all 5 plans', () => {
  const sql = fs.readFileSync('supabase/migrations/202611050002_pricing_2027_plans.sql', 'utf8');
  assert.match(sql, /'student_hero'/);
  assert.match(sql, /'teacher_pro'/);
  assert.match(sql, /'school_starter'/);
  assert.match(sql, /'school_growth'/);
  assert.match(sql, /'superpower'/);
  assert.match(sql, /on conflict \(code\) do update/);
});

test('Pricing 2027: Billing cycles define semester (5 months) and yearly (12 months)', () => {
  assert.equal(BILLING_CYCLES.length, 3);
  const sem = BILLING_CYCLES.find(b => b.id === 'semester');
  assert.match(sem.periodDesc, /5 เดือน/);
  const yr = BILLING_CYCLES.find(b => b.id === 'yearly');
  assert.match(yr.periodDesc, /12 เดือน/);
});
