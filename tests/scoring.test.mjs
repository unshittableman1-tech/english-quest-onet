import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const scoring = await import('../src/utils/scoring.js');
const { QUESTS } = await import('../src/data/questions.js');
const { XP_RULES, calcLevel, xpToNextLevel, calculateRankScore, getRankingTier, getTotalStars,
  RANKING_TIERS, getUnlockedQuests, getClassPreTestAverage, getClassCurrentAverage,
  getClassWeakAreas } = scoring;

test('ranking star total safely aggregates every completed practice round', () => {
  assert.equal(getTotalStars({ a: { stars: [3, 2, 1] }, b: { stars: [3, NaN, -2, 8] } }), 12);
  assert.equal(getTotalStars(), 0);
});

test('rewards used by pre-test, quest completion and Final Boss remain numeric', () => {
  assert.deepEqual([XP_RULES.PRETEST_DONE, XP_RULES.PASS_70, XP_RULES.PASS_90, XP_RULES.FINALBOSS_PASS], [15, 50, 100, 150]);
  assert.equal(calcLevel(null), 1);
  assert.equal(calcLevel(NaN), 1);
  assert.equal(calcLevel(10000), 10);
});

test('XP progress uses within-level values expected by the map and report', () => {
  assert.deepEqual(xpToNextLevel(175), { current: 75, needed: 150, pct: 50, next: 250, progress: 50, maxLevel: false });
  assert.equal(xpToNextLevel(250).current, 0);
  assert.equal(xpToNextLevel(250).pct, 0);
  assert.equal(xpToNextLevel(12000).maxLevel, true);
  assert.equal(xpToNextLevel(NaN).pct, 0);
});

test('ranking uses authoritative XP as its single score everywhere', () => {
  const student = {
    xp: 3000,
    badges: ['a', 'b', 'a'],
    questProgress: {
      vocabulary: { passed: true, roundsPlayed: 8, stars: [3, 3, 3, 3, 3, 3] },
      grammar: { pct: 50, roundsPlayed: 1, stars: [1] },
    },
    rankingStats: { totalAnswered: 100, fastGuessCount: 10 },
    badgeStats: { mistakesFixed: 4, pretestScore: 40, posttestScore: 80 },
    finalBoss: { pct: 80 },
  };
  assert.equal(calculateRankScore(student), 3000);
  assert.equal(calculateRankScore(null), 0);
  assert.equal(calculateRankScore({ xp: Infinity }), 0);
  assert.equal(calculateRankScore(500), 500);
  assert.equal(calculateRankScore({ xp: 1000000, rankingStats: { totalAnswered: 100, fastGuessCount: 100 } }), 1000000);
});

test('stars, badges, attempts, and penalties do not create a second ranking currency', () => {
  const student = {
    xp: 10000,
    rankingStats: { totalAnswered: 10, fastGuessCount: 10 },
    mistakeBank: { q1: { mastered: true, correctInReview: 0 } },
  };
  const adjusted = { ...student, rankingStats: { ...student.rankingStats, fastGuessCount: 0 } };
  assert.equal(calculateRankScore(student), 10000);
  assert.equal(calculateRankScore(adjusted, 10), calculateRankScore(student));
});

test('all ten tiers expose the fields required by the tier modal and transition exactly at thresholds', () => {
  for (const [index, tier] of RANKING_TIERS.entries()) {
    const actual = getRankingTier(tier.min);
    assert.equal(actual.name, tier.name);
    assert.equal(actual.min, tier.min);
    assert.ok(actual.icon && actual.color);
    assert.equal(actual.next, RANKING_TIERS[index + 1]?.min ?? null);
    if (index > 0) assert.equal(getRankingTier(tier.min - 1).name, RANKING_TIERS[index - 1].name);
  }
  assert.equal(getRankingTier(NaN).name, 'Novice Trainee');
});

test('all ranking tiers use an existing illustrated badge asset', async () => {
  assert.equal(RANKING_TIERS.length, 10);
  assert.equal(new Set(RANKING_TIERS.map(tier => tier.artwork)).size, 10);
  for (const tier of RANKING_TIERS) {
    assert.match(tier.artwork, /^\/assets\/ranking\/tiers\/.+\.svg$/);
    await access(fileURLToPath(new URL(`../public${tier.artwork}`, import.meta.url)));
  }
});

const completedChapters = (...chapters) => Object.fromEntries(QUESTS.filter(q => chapters.includes(q.chapter)).map(q => [q.id, { passed: true, pct: 70, attempts: 1 }]));

test('new students begin with Chapter 1 and every quest has an explicit unlock decision', () => {
  const unlocked = getUnlockedQuests();
  for (const quest of QUESTS) assert.equal(unlocked[quest.id], quest.chapter === 1, quest.id);
  assert.equal(unlocked.chapter5_unlocked, false);
  assert.equal(unlocked.ch1_review_gate, false);
});

test('finishing a chapter unlocks its review gate, then requires mistakes to be mastered', () => {
  const progress = completedChapters(1);
  const mistake = { quest: 'vocabulary', mastered: false };
  const blocked = getUnlockedQuests(progress, { mistakeBank: { q1: mistake } });
  assert.equal(blocked.ch1_review_gate, true);
  assert.equal(blocked.conversation, false);
  assert.equal(getUnlockedQuests(progress, { mistakeBank: { q1: { ...mistake, mastered: true } } }).conversation, true);
  delete progress.family;
  assert.equal(getUnlockedQuests(progress).conversation, false);
});

test('chapter bosses and Arena require completion of their actual prerequisites', () => {
  const progress = completedChapters(1, 2);
  assert.equal(getUnlockedQuests(progress).question_words, true);
  assert.equal(getUnlockedQuests(progress).strategy_boss, false);
  Object.assign(progress, completedChapters(3));
  assert.equal(getUnlockedQuests(progress).signs, true);
  assert.equal(getUnlockedQuests(progress).finalboss, false);
  Object.assign(progress, completedChapters(4));
  assert.equal(getUnlockedQuests(progress).chapter5_unlocked, true);
  assert.equal(getUnlockedQuests(progress).chapter4_unlocked, true);
});

test('new chapter 2 and 5 bosses unlock after their lessons and gate new learners by first-response pass', () => {
  const throughChapter1 = completedChapters(1);
  const chapter2Lessons = Object.fromEntries(QUESTS.filter(q => q.chapter === 2 && q.id !== 'chapter2_boss').map(q => [q.id, { passed: true, pct: 70 }]));
  const beforeChapter2 = { ...throughChapter1, ...chapter2Lessons };
  assert.equal(getUnlockedQuests({ ...beforeChapter2, market: { pct: 60 } }).chapter2_boss, false);
  assert.equal(getUnlockedQuests(beforeChapter2).chapter2_boss, true);
  assert.equal(getUnlockedQuests(beforeChapter2).question_words, false);
  assert.equal(getUnlockedQuests({ ...beforeChapter2, chapter2_boss: { pct: 60, attempts: 1 } }).question_words, false);
  const throughChapter4 = { ...completedChapters(1, 2, 3, 4) };
  const chapter5Lessons = Object.fromEntries(QUESTS.filter(q => q.chapter === 5 && q.id !== 'chapter5_boss').map(q => [q.id, { passed: true, pct: 70 }]));
  const beforeChapter5 = { ...throughChapter4, ...chapter5Lessons };
  assert.equal(getUnlockedQuests({ ...beforeChapter5, culture_festivals: { pct: 60 } }).chapter5_boss, false);
  assert.equal(getUnlockedQuests(beforeChapter5).chapter5_boss, true);
  assert.equal(getUnlockedQuests(beforeChapter5).ch3_review_gate, true);
});

test('existing students keep access to chapters they had already started', () => {
  const progress = { directions: { pct: 0, attempts: 1 } };
  const unlocked = getUnlockedQuests(progress);
  assert.equal(unlocked.conversation, true);
  assert.equal(unlocked.question_words, true);
  assert.equal(unlocked.reading, true);
  assert.equal(unlocked.chapter5_unlocked, false);
  const priorProgress = { ...completedChapters(1), ...Object.fromEntries(QUESTS.filter(q => q.chapter === 2 && q.id !== 'chapter2_boss').map(q => [q.id, { passed: true, pct: 80 }])), question_words: { pct: 0, attempts: 1 } };
  assert.equal(getUnlockedQuests(priorProgress).question_words, true);
});

test('teacher averages use real results, include zero scores and omit untested students', () => {
  const students = [
    { preTest: { totalScore: 0, total: 30 }, questProgress: { vocabulary: { pct: 0 } } },
    { preTest: { totalScore: 30, total: 30 }, questProgress: { vocabulary: { pct: 50 }, grammar: { pct: 100 }, finalboss: { pct: 0 } } },
    {},
  ];
  assert.equal(getClassPreTestAverage(students), 50);
  assert.equal(getClassCurrentAverage(students), 38);
  const weak = getClassWeakAreas(students);
  assert.equal(weak[0].quest, 'Vocab Village');
  assert.equal(weak[0].count, 2);
  assert.equal(weak[0].pct, 25);
  assert.equal(getClassPreTestAverage([]), 0);
  assert.equal(getClassCurrentAverage([]), 0);
  assert.deepEqual(getClassWeakAreas([]), []);
});
