import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { QUESTS, preTestQuestions } = await import('../src/data/questions.js');
const { isPracticeQuestionReady, isMediaReleaseEligible, preloadQuestionMedia } = await import('../src/utils/questionMedia.js');
const { savePreTest, getCurrentStudent } = await import('../src/utils/storage.js');
const { getStudentPreTestPercent } = await import('../src/utils/scoring.js');

test('the unchanged 20-item pre-test has complete renderable text and passage media without official approval', async () => {
  assert.equal(preTestQuestions.length, 20);
  await preloadQuestionMedia(preTestQuestions, async () => {});
  const reading = preTestQuestions.filter(q => q.quest === 'reading');
  assert.deepEqual(reading.map(q => q.options[q.answer]), ['To the fruit market', 'Apples, oranges, and bananas', 'A fruit salad']);
  for (const q of reading) {
    assert.equal(q.passage, 'Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!');
    assert.equal(q.mediaReview.reviewer, 'Codex');
    assert.equal(q.mediaReview.scope, 'legacy_pretest_rendering');
    assert.equal(isMediaReleaseEligible(q, 'onet_p6_2569'), false);
  }
});

test('every chapter 1 quest has a usable practice pool and blocked media never enters it', async () => {
  for (const quest of QUESTS.filter(q => q.chapter === 1)) {
    const eligible = quest.questions.filter(isPracticeQuestionReady);
    assert.ok(eligible.length > 0, quest.id);
    await preloadQuestionMedia(eligible, async () => {});
  }
  const family = QUESTS.find(q => q.id === 'family');
  assert.equal(family.questions.filter(isPracticeQuestionReady).length, 10);
  assert.ok(!isPracticeQuestionReady({ ...family.questions[1], reviewStatus: 'pending_teacher' }));
  assert.ok(!isPracticeQuestionReady({ ...family.questions[1], approvedModes: ['school_final_50'] }));
  assert.ok(isPracticeQuestionReady(family.questions.find(q => q.id === 'pdf_1.2_ครอบครัว_9')));
});

test('pre-test saves the actual denominator and version and rejects inconsistent totals', async () => {
  localStorage.setItem('eq_onet_current', JSON.stringify({ id: 'local_new_learner', questProgress: {} }));
  const categories = { vocabulary: { correct: 2, total: 3 }, reading: { correct: 3, total: 3 }, rest: { correct: 10, total: 14 } };
  const data = await savePreTest('local_new_learner', categories, 15);
  assert.equal(data.total, 20);
  assert.equal(data.version, 'pretest-v1');
  assert.equal(getStudentPreTestPercent(getCurrentStudent()), 75);
  const snapshot = localStorage.getItem('eq_onet_current');
  await assert.rejects(savePreTest('local_new_learner', categories, 16), /Invalid pre-test score/);
  await assert.rejects(savePreTest('local_new_learner', { reading: { total: 0, correct: 0 } }, 0), /Invalid pre-test category/);
  assert.equal(localStorage.getItem('eq_onet_current'), snapshot);
});
