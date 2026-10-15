import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { getPreTestResult } = await import('../src/utils/preTestResult.js');
const { getClassPreTestAverage, getClassGrowth, calculateRankScore } = await import('../src/utils/scoring.js');
const { checkUnlockedBadges } = await import('../src/data/badges.js');

test('pre-test results use recorded totals, complete old category totals or a known version', () => {
  assert.equal(getPreTestResult({ preTest: { totalScore: 15, total: 20 } }).percent, 75);
  assert.equal(getPreTestResult({ preTest: { totalScore: 15, total: 30 } }).percent, 50);
  assert.deepEqual(getPreTestResult({ preTest: { totalScore: 12, categoryScores: { a: { correct: 7, total: 10 }, b: { correct: 5, total: 10 } } } }),
    { score: 12, total: 20, percent: 60, basis: 'category_totals' });
  assert.equal(getPreTestResult({ preTest: { totalScore: 0, version: 'pretest-v1' } }).percent, 0);
});

test('unknown or contradictory legacy results remain unknown without writing or using stale badge percentages', () => {
  for (const preTest of [{ totalScore: 15 }, { totalScore: 30 }, { totalScore: 15, total: 0 }, { totalScore: 21, total: 20 },
    { totalScore: 5, categoryScores: { a: { correct: 4, total: 10 } } }, { totalScore: false, total: 20 }]) {
    const student = { preTest, badgeStats: { pretestScore: 100 } };
    const before = JSON.stringify(student);
    assert.equal(getPreTestResult(student).percent, null);
    assert.equal(JSON.stringify(student), before);
  }
  assert.equal(getPreTestResult({}).percent, null);
  assert.equal(getPreTestResult({ badgeStats: { pretestScore: 40 } }).percent, 40);
  assert.equal(getClassPreTestAverage([{ preTest: { totalScore: 15 } }, { preTest: { totalScore: 10, total: 20 } }]), 50);
});

test('growth compares the same measured students and does not award points or badges from an unknown baseline', () => {
  const known = { preTest: { totalScore: 15, total: 20 }, questProgress: { family: { pct: 85 } }, badgeStats: { pretestScore: 50, posttestScore: 80 } };
  const unknown = { preTest: { totalScore: 15 }, questProgress: { family: { pct: 0 } }, badgeStats: { pretestScore: 0, posttestScore: 100 } };
  assert.equal(getClassGrowth([known, unknown]), 10);
  assert.equal(getClassGrowth([unknown]), null);
  assert.ok(!checkUnlockedBadges(unknown).includes('growth_hero'));
  assert.ok(!checkUnlockedBadges(known).includes('growth_starter'));
  assert.equal(calculateRankScore(unknown), calculateRankScore({ ...unknown, badgeStats: { ...unknown.badgeStats, posttestScore: 0 } }));
});
