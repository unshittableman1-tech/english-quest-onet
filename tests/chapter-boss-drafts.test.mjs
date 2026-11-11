import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

const { CHAPTER_BOSS_DRAFTS, CHAPTER_BOSS_QUESTIONS } = await import('../src/data/chapterBossDrafts.js');
const { QUESTS } = await import('../src/data/questions.js');
const { inspectQuestionMedia, isMediaReleaseEligible, isPracticeQuestionReady } = await import('../src/utils/questionMedia.js');
const { getFinalExamPool } = await import('../src/data/chapter4_questions.js');

test('owner-approved challenges release only the reviewed version for practice', () => {
  const seen = new Set();
  for (const chapter of [2, 5]) {
    const items = CHAPTER_BOSS_DRAFTS[chapter];
    assert.equal(items.length, 10);
    assert.ok(items.some(item => item.difficulty === 'introductory'));
    assert.ok(items.some(item => item.difficulty === 'interpretation'));
    assert.ok(items.some(item => item.stimuli?.some(stimulus => stimulus.type === 'table')));
    for (const item of items) {
      assert.equal(item.quest, `chapter${chapter}_boss`);
      assert.equal(item.itemVersion, 'boss-review-v1');
      assert.equal(item.reviewStatus, 'pending_teacher');
      assert.deepEqual(item.approvedModes, []);
      assert.equal(item.scoringPolicy, 'first_response_v1');
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options.map(option => option.trim().toLowerCase())).size, 4);
      assert.ok(Number.isInteger(item.answer) && item.answer >= 0 && item.answer < 4);
      assert.ok(item.question && item.explanation && item.source.relatedQuests.length);
      assert.ok(item.source.relatedQuests.every(id => QUESTS.some(quest => quest.id === id && quest.chapter === chapter)));
      assert.ok(!inspectQuestionMedia(item).blocked);
      assert.equal(isPracticeQuestionReady(item), false);
      assert.equal(isMediaReleaseEligible(item), false);
      assert.ok(!seen.has(item.id)); seen.add(item.id);
      const released = CHAPTER_BOSS_QUESTIONS[chapter][items.indexOf(item)];
      assert.notEqual(released, item);
      assert.equal(released.itemVersion, item.itemVersion);
      assert.equal(released.reviewStatus, 'approved');
      assert.deepEqual(released.approvedModes, ['practice_assessment']);
      assert.equal(released.contentReview.approvedBy, 'workspace_owner');
      assert.equal(released.contentReview.approvalSource, `explicit_user_chat_after_chapter${chapter}_challenge_review`);
      assert.equal(released.contentReview.version, released.itemVersion);
      assert.equal(released.mediaReview.status, item.stimuli ? 'verified' : 'not_required');
      assert.equal(released.mediaReview.version, released.itemVersion);
      assert.equal(isPracticeQuestionReady(released), true);
      assert.equal(isMediaReleaseEligible(released), true);
      assert.equal(isMediaReleaseEligible(released, 'school_final_50'), false);
      assert.equal(isMediaReleaseEligible(released, 'onet_blueprint_32'), false);
    }
    assert.notEqual(QUESTS.find(quest => quest.id === `chapter${chapter}_boss`).questions, CHAPTER_BOSS_QUESTIONS[chapter]);
  }
  assert.equal(seen.size, 20);
  assert.ok(getFinalExamPool(70).every(item => !seen.has(item.id)));
});
