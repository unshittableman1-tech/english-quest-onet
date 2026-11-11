import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { getPreTestResult } = await import('../src/utils/preTestResult.js');
const { getClassPreTestAverage, getClassGrowth, calculateRankScore } = await import('../src/utils/scoring.js');
const { checkUnlockedBadges } = await import('../src/data/badges.js');
const { getReportPreTest, buildReportQuestProgress } = await import('../src/utils/reportDataIntegrity.js');
const { createDemoStudent } = await import('../src/data/demoFixtures.js');
const { QUEST_CHAPTERS } = await import('../src/utils/questMapModel.js');
const { withLocalChapter3Missions } = await import('../src/data/chapter3LocalMissions.js');

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

test('Report reads the existing Demo pre-test alias without changing shared grading or stored data', () => {
  const student = createDemoStudent();
  const before = structuredClone(student);
  const sharedBefore = getPreTestResult(student);
  const result = getReportPreTest(student);
  assert.equal(result.state, 'recorded');
  assert.equal(result.score, 14); assert.equal(result.total, 20); assert.equal(result.percent, 70);
  assert.deepEqual(student, before);
  assert.deepEqual(getPreTestResult(student), sharedBefore);
  assert.equal(getReportPreTest({ preTest: { totalScore: 0, total: 20 } }).percent, 0);
  assert.equal(getReportPreTest({ preTest: { totalScore: 0, total: 20 } }).state, 'recorded');
});

test('Report distinguishes missing, unknown, partial and conflicting pre-test records from a completed score', () => {
  assert.equal(getReportPreTest({}).state, 'unknown');
  assert.equal(getReportPreTest({ preTest: null }).state, 'no_record');
  const legacy = getReportPreTest({ badgeStats: { pretestScore: 70 } });
  assert.equal(legacy.state, 'legacy_percent_only'); assert.equal(legacy.total, null);
  for (const preTest of [{}, [], false, { score: 1 }, { score: false, total: 20 }, { score: 21, total: 20 },
    { score: 1, total: 20, percent: false }, { score: 1, total: 20, percent: 101 }]) {
    const result = getReportPreTest({ preTest });
    assert.equal(result.state, 'incomplete'); assert.equal(result.percent, null);
  }
  for (const preTest of [{ score: 14, totalScore: 13, total: 20 }, { score: 14, total: 20, percent: 100 }]) {
    const result = getReportPreTest({ preTest });
    assert.equal(result.state, 'conflict'); assert.equal(result.percent, null);
  }
  assert.equal(getReportPreTest({ preTest: { score: 14, totalScore: '14', total: 20 } }).percent, 70);
});

test('Report chapter and overall totals use the same countable Quest set without unlocking or mutating anything', () => {
  const chapters = [{ id: 1, quests: [{ id: 'a' }, { id: 'preview', previewOnly: true }] },
    { id: 2, quests: [{ id: 'b' }, { id: 'c' }, { id: 'a' }] }];
  const progress = { a: { pct: 75 }, preview: { passed: true }, b: { pct: 100, verifiedLearningRun: true, passed: false },
    c: { passed: true }, orphan: { passed: true } };
  const before = structuredClone({ chapters, progress });
  const result = buildReportQuestProgress(chapters, progress);
  assert.equal(result.total, 3); assert.equal(result.completed, 2); assert.equal(result.percent, 67);
  assert.deepEqual(result.chapters.map(chapter => [chapter.completed, chapter.total]), [[1, 1], [1, 2]]);
  assert.deepEqual(result.duplicateQuestIds, ['a']);
  assert.deepEqual({ chapters, progress }, before);
});

test('actual public and local Quest catalogs reconcile top-level and per-chapter Report totals', () => {
  const previousWindow = globalThis.window;
  try {
    // The local catalog includes three Chapter 3 activities unavailable publicly.
    for (const [hostname, expectedTotal] of [['example.invalid', 36], ['127.0.0.1', 39]]) {
      globalThis.window = { location: { hostname } };
      const chapters = QUEST_CHAPTERS.map(withLocalChapter3Missions);
      const progress = Object.fromEntries(chapters.flatMap(chapter => chapter.quests).map(quest => [quest.id, { passed: true }]));
      const result = buildReportQuestProgress(chapters, progress);
      assert.equal(result.total, expectedTotal, `countable quests for ${hostname}`);
      assert.equal(result.completed, result.total);
      assert.equal(result.completed, result.chapters.reduce((sum, chapter) => sum + chapter.completed, 0));
      assert.equal(result.total, result.chapters.reduce((sum, chapter) => sum + chapter.total, 0));
      assert.deepEqual(result.duplicateQuestIds, []);
    }
  } finally { globalThis.window = previousWindow; }
});
