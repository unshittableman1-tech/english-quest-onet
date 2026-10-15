import { cloud } from './helpers/environment.mjs';
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const { addXP, getCurrentStudent, saveQuestResult, updateBadgeStats, awardBadge } = await import('../src/utils/storage.js');
const { saveFinalExamResult, getFinalExamResult, mergeArenaStatsFromCloud } = await import('../src/utils/arenaStorage.js');
const session = (student) => localStorage.setItem('eq_onet_current', JSON.stringify(student));

beforeEach(() => {
  localStorage.clear();
  cloud.data = null;
  cloud.error = null;
  cloud.writes.length = 0;
});

test('concurrent XP rewards accumulate without dropping saved quests, badges or badge stats', async () => {
  session({ id: 'local_test', xp: 90, level: 1, badges: [], questProgress: {} });
  await saveQuestResult('local_test', 'vocabulary', 9, 10);
  await updateBadgeStats({ posttestScore: 90 });
  await awardBadge('local_test', 'first_quest');
  await Promise.all([addXP('local_test', 5), addXP('local_test', 20), addXP('local_test', 100)]);
  const student = getCurrentStudent();
  assert.equal(student.xp, 215);
  assert.equal(student.level, 2);
  assert.equal(student.questProgress.vocabulary.passed, true);
  assert.equal(student.badgeStats.posttestScore, 90);
  assert.deepEqual(student.badges, ['first_quest']);
});

test('invalid rewards are rejected without corrupting XP and legacy string XP stays numeric', async () => {
  session({ id: 'local_test', xp: '90', level: 1 });
  await assert.rejects(addXP('local_test', undefined), TypeError);
  await assert.rejects(addXP('local_test', NaN), TypeError);
  await addXP('local_test', 15);
  assert.equal(getCurrentStudent().xp, 105);
  await addXP('local_test', -200);
  assert.equal(getCurrentStudent().xp, 0);
});

test('a second final exam submission returns the first result without overwriting it', () => {
  const first = saveFinalExamResult('local_test', { score: 40, total: 50, percent: 80, startedAt: 1000, timeUsed: 1200, skillScores: {}, wrongQuestions: [] });
  const retry = saveFinalExamResult('local_test', { score: 50, total: 50, percent: 100, startedAt: 2000 });
  assert.deepEqual(retry, first);
  assert.equal(getFinalExamResult('local_test').score, 40);
  assert.equal(first.points, 80);
  assert.equal(cloud.writes.length, 0);
});

test('a fresh device restores the cloud final exam and prevents a local retry', async () => {
  const original = { score: 35, total: 50, percent: 70, submittedAt: 1234 };
  cloud.data = { arenaStats: { finalExamResult: original, arenaBadges: ['arena_challenger'] } };
  const restored = await mergeArenaStatsFromCloud('student_test', { requireCloud: true });
  assert.deepEqual(restored.finalExamResult, original);
  const retry = saveFinalExamResult('student_test', { score: 50, total: 50, percent: 100 });
  assert.deepEqual(retry, original);
  assert.equal(cloud.writes.length, 0);
});

test('cloud result wins over a conflicting local result while offline cache can still be read', async () => {
  saveFinalExamResult('student_test', { score: 50, total: 50, percent: 100 });
  cloud.data = { arenaStats: { finalExamResult: { score: 30, total: 50, percent: 60 } } };
  await mergeArenaStatsFromCloud('student_test');
  assert.equal(getFinalExamResult('student_test').score, 30);
  cloud.error = new Error('Offline');
  await assert.rejects(mergeArenaStatsFromCloud('student_test', { requireCloud: true }), /Offline/);
  assert.equal(getFinalExamResult('student_test').score, 30);
});

test('a missing cloud student fails the mandatory exam status check', async () => {
  await assert.rejects(mergeArenaStatsFromCloud('student_test', { requireCloud: true }), /not found/);
});
