import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
const { QUEST_ASSESSMENTS } = await import('../src/data/questAssessments.js');
const { QUESTS } = await import('../src/data/questions.js');
const { preloadQuestionMedia, isMediaReleaseEligible, inspectQuestionMedia } = await import('../src/utils/questionMedia.js');
const { getFinalExamPool } = await import('../src/data/chapter4_questions.js');
const { saveQuestResult, getCurrentStudent } = await import('../src/utils/storage.js');
const { getUnlockedQuests } = await import('../src/utils/scoring.js');
const { validateAssessmentEvidence } = await import('../src/utils/assessmentEvidence.js');

test('three formerly empty banks contain 10 valid versioned approved practice MCQs each', async () => {
  const ids = new Set();
  const keys = {
    shapes_colors: ['Circle','Square','Triangle','Rectangle','Oval','Diamond','Blue','Red','Green','A blue circle'],
    clothes_fashion: ['Raincoat','Socks','Shoes','Cap','Raincoat','Sunglasses','Gloves','Swimsuit','A school uniform','A belt'],
    tenses_arena: ['plays','Does','do not','is cooking','are','am doing','visited','Did','will','Will'],
  };
  for (const [quest, items] of Object.entries(QUEST_ASSESSMENTS)) {
    assert.equal(items.length, 10);
    assert.equal(QUESTS.find(q => q.id === quest).questions, items);
    for (const [index, q] of items.entries()) {
      assert.equal(q.quest, quest);
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options.map(option => option.toLowerCase())).size, 4);
      assert.equal(q.options[q.answer], keys[quest][index]);
      assert.ok(q.correctFeedback && q.wrongFeedback && q.source.file && q.source.missionIds.length);
      assert.equal(q.reviewStatus, 'approved');
      assert.equal(q.scoringPolicy, 'first_response_v1');
      assert.ok(!ids.has(q.id)); ids.add(q.id);
      if (q.image) { await access(`public${q.image}`); assert.ok(q.imageAlt); }
    }
    await preloadQuestionMedia(items, async () => {});
  }
  assert.equal(ids.size, 30);
});

test('human approvals apply only to the three previewed versions for practice Quiz', () => {
  const approvalSources = {
    shapes_colors: 'explicit_user_chat_after_shapes_preview',
    clothes_fashion: 'explicit_user_chat_after_clothes_illustrated_preview',
    tenses_arena: 'explicit_user_chat_after_tenses_preview',
  };
  for (const q of Object.values(QUEST_ASSESSMENTS).flat()) {
    assert.equal(q.contentReview.approvedBy, 'workspace_owner');
    assert.equal(q.contentReview.approvalSource, approvalSources[q.quest]);
    assert.equal(q.itemVersion, q.quest === 'clothes_fashion' ? 'practice-illustrated-v2' : 'practice-draft-v1');
    assert.deepEqual(q.approvedModes, ['practice_assessment']);
    assert.equal(q.mediaReview.version, q.itemVersion);
    assert.equal(inspectQuestionMedia(q).status, q.quest === 'tenses_arena' ? 'not_required' : 'verified');
    assert.equal(isMediaReleaseEligible(q), true);
    assert.equal(isMediaReleaseEligible(q, 'school_final_50'), false);
    assert.equal(isMediaReleaseEligible(q, 'onet_p6_2569'), false);
  }
  for (let run = 0; run < 20; run++) {
    const paper = getFinalExamPool(70);
    assert.equal(paper.length, 70);
    assert.ok(paper.every(q => !q.id?.includes('_assessment_')));
  }
});

test('pending copies of approved items still fail release and preflight without mutating the bank', async () => {
  const pending = QUEST_ASSESSMENTS.tenses_arena.map(q => ({ ...q, reviewStatus: 'pending_teacher', approvedModes: [] }));
  assert.ok(pending.every(q => !isMediaReleaseEligible(q)));
  await assert.rejects(preloadQuestionMedia(pending), /Incomplete/);
  assert.ok(QUEST_ASSESSMENTS.tenses_arena.every(q => q.reviewStatus === 'approved'));
});

test('all ten approved clothing questions have the reviewed versioned real PNG stimuli', async () => {
  const assets = new Set();
  for (const [index, q] of QUEST_ASSESSMENTS.clothes_fashion.entries()) {
    assert.equal(q.itemVersion, 'practice-illustrated-v2');
    assert.equal(q.mediaReview.version, q.itemVersion);
    assert.equal(q.reviewStatus, 'approved');
    assert.equal(isMediaReleaseEligible(q), true);
    assert.equal(q.mediaRequired, true);
    assert.match(q.image, /^\/assessment\/clothes\/c\d{2}-v1\.png$/);
    assert.equal(q.mediaSource.tool, 'built_in_image_gen');
    if (index < 4) assert.equal(q.question, 'Which word matches the picture?');
    if (!assets.has(q.image)) {
      const png = await readFile(`public${q.image}`);
      assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
      assert.ok(png.readUInt32BE(16) >= 512 && png.readUInt32BE(20) >= 512);
      assert.equal(png[25], 6, 'RGBA preserves generated transparency');
      assets.add(q.image);
    }
  }
  assert.equal(assets.size, 9);
  assert.equal(QUEST_ASSESSMENTS.clothes_fashion[0].image, QUEST_ASSESSMENTS.clothes_fashion[4].image);
});

function evidence(quest, correct) {
  return { policy: 'first_response_v1', score: correct, total: 10,
    items: QUEST_ASSESSMENTS[quest].map((q, i) => ({ id: q.id, version: q.itemVersion, firstChoice: q.options[i < correct ? q.answer : (q.answer + 1) % 4], firstCorrect: i < correct, finalCorrect: true })) };
}
test('evidence rejects inflated retry scores, duplicate identities and malformed answers', () => {
  const e = evidence('shapes_colors', 6);
  assert.equal(validateAssessmentEvidence(e, 6, 10), e);
  assert.throws(() => validateAssessmentEvidence(e, 10, 10), TypeError);
  assert.throws(() => validateAssessmentEvidence({ ...e, items: e.items.map(() => e.items[0]) }, 6, 10), TypeError);
  assert.throws(() => validateAssessmentEvidence({ ...e, items: e.items.map(q => ({ ...q, firstCorrect: 'true' })) }, 6, 10), TypeError);
});
test('a 60% first-response score does not become a pass after correction or from high XP', async () => {
  localStorage.setItem('eq_onet_current', JSON.stringify({ id: 'local_assessment', xp: 100000, questProgress: {} }));
  await saveQuestResult('local_assessment', 'shapes_colors', 6, 10, { assessmentEvidence: evidence('shapes_colors', 6) });
  const student = getCurrentStudent();
  assert.equal(student.questProgress.shapes_colors.passed, false);
  assert.equal(student.questProgress.shapes_colors.lastAssessment.items.filter(q => q.finalCorrect).length, 10);
  assert.equal(student.questProgress.shapes_colors.lastAssessment.score, 6);
  assert.equal(getUnlockedQuests(student.questProgress, student).conversation, false);
});
test('passing first-response fixture results closes chapter gates without altering old scores', async () => {
  for (const [quest, chapter, nextKey] of [['shapes_colors', 1, 'conversation'], ['tenses_arena', 3, 'strategy_boss'], ['clothes_fashion', 5, null]]) {
    const progress = Object.fromEntries(QUESTS.filter(q => q.chapter <= chapter && q.id !== quest && q.id !== nextKey).map(q => [q.id, { passed: true, pct: 80, score: 8, total: 10, roundsPlayed: 1, stars: [2] }]));
    const snapshot = JSON.stringify(progress);
    localStorage.setItem('eq_onet_current', JSON.stringify({ id: 'local_assessment', questProgress: progress, xp: 0 }));
    if (nextKey) assert.equal(getUnlockedQuests(progress)[nextKey], false);
    await saveQuestResult('local_assessment', quest, 7, 10, { assessmentEvidence: evidence(quest, 7) });
    const student = getCurrentStudent();
    assert.equal(student.questProgress[quest].passed, true);
    if (nextKey) assert.equal(getUnlockedQuests(student.questProgress, student)[nextKey], true);
    assert.equal(JSON.stringify(Object.fromEntries(Object.entries(student.questProgress).filter(([id]) => id !== quest))), snapshot);
  }
});
test('invalid evidence fails before writing progress and legacy aggregate scores remain intact', async () => {
  const legacy = { passed: true, pct: 80, score: 8, total: 10, roundsPlayed: 2, stars: [2, 2], legacyNote: 'preserve' };
  localStorage.setItem('eq_onet_current', JSON.stringify({ id: 'local_assessment', questProgress: { shapes_colors: legacy } }));
  const before = localStorage.getItem('eq_onet_current');
  await assert.rejects(saveQuestResult('local_assessment', 'shapes_colors', 10, 10, { assessmentEvidence: evidence('shapes_colors', 6) }), TypeError);
  assert.equal(localStorage.getItem('eq_onet_current'), before);
  await saveQuestResult('local_assessment', 'shapes_colors', 6, 10, { assessmentEvidence: evidence('shapes_colors', 6) });
  const result = getCurrentStudent().questProgress.shapes_colors;
  assert.equal(result.score, 14);
  assert.equal(result.total, 20);
  assert.equal(result.passed, true);
  assert.equal(result.legacyNote, 'preserve');
  assert.deepEqual(result.stars.slice(0, 2), [2, 2]);
});
