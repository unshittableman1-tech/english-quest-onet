import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

const {
  BLUEPRINT_CONFIG,
  sampleBlueprintExam,
  calculateBlueprintScore,
  getAllBlueprintEligibleQuestions,
  resolveQuestionStandard,
  isBlueprintEligible,
  getQuestionSignature,
  shuffleQuestionOptions,
} = await import('../src/utils/blueprintSampler.js');
const { cultureQuestions } = await import('../src/data/cultureQuestions.js');
const { QUESTS } = await import('../src/data/questions.js');
const { isPracticeQuestionReady } = await import('../src/utils/questionMedia.js');

test('blueprint configuration matches the documented project specification', () => {
  assert.equal(BLUEPRINT_CONFIG.totalQuestions, 32);
  assert.equal(BLUEPRINT_CONFIG.timeLimitSeconds, 3600);
  assert.equal(BLUEPRINT_CONFIG.pointsPerQuestion, 3.125);
  assert.equal(BLUEPRINT_CONFIG.totalPoints, 100);
  assert.equal(BLUEPRINT_CONFIG.passingPercent, 70);

  const quotaSum = Object.values(BLUEPRINT_CONFIG.quota).reduce((a, b) => a + b, 0);
  assert.equal(quotaSum, 32);

  assert.deepEqual(BLUEPRINT_CONFIG.quota, {
    'ต 1.1': 6,
    'ต 1.2': 10,
    'ต 1.3': 6,
    'ต 2.1': 2,
    'ต 2.2': 4,
    'ต 4.1': 4,
  });
});

test('owner approval releases the reviewed Culture version to Blueprint and Chapter 5 practice only', () => {
  assert.ok(cultureQuestions.length >= 10);
  for (const q of cultureQuestions) {
    assert.equal(q.standard, 'ต 2.1');
    assert.equal(q.options.length, 4);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
    assert.equal(q.reviewStatus, 'approved');
    assert.deepEqual(q.approvedModes, ['onet_blueprint_32', 'practice_assessment']);
    assert.ok(!q.approvedModes.includes('school_final_50'));
    assert.equal(q.contentReview.status, 'approved_for_blueprint');
    assert.equal(q.contentReview.approvedBy, 'workspace_owner');
    assert.equal(q.contentReview.approvalSource, 'explicit_user_chat_after_culture_review');
    assert.equal(q.contentReview.practiceApprovalSource, 'explicit_user_chat_after_chapter5_quiz_proposal');
    assert.equal(q.contentReview.version, q.itemVersion);
    assert.equal(isBlueprintEligible(q), true);
    assert.equal(resolveQuestionStandard(q), 'ต 2.1');
  }
  const releasedIds = new Set(getAllBlueprintEligibleQuestions().map(q => q.id));
  assert.ok(cultureQuestions.every(q => releasedIds.has(q.id)));
});

test('Chapter 5 Culture Quiz uses the reviewed items and first-response scoring', () => {
  const quest = QUESTS.find(q => q.id === 'culture_festivals');
  assert.equal(quest.chapter, 5);
  assert.equal(quest.questions.length, 12);
  assert.ok(quest.questions.every(q => q.quest === quest.id && isPracticeQuestionReady(q)));
  assert.ok(quest.questions.every(q => q.scoringPolicy === 'first_response_v1'));
});

function approvedPool() {
  return Object.entries(BLUEPRINT_CONFIG.quota).flatMap(([standard, count]) =>
    Array.from({ length: count + 2 }, (_, index) => ({
      id: `fixture_${standard}_${index}`,
      question: `Reviewed fixture ${standard} item ${index}`,
      options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
      answer: index % 4,
      standard,
      indicator: `${standard} ป.6/fixture`,
      difficulty: index % 2 ? 'application' : 'foundation',
      reviewStatus: 'approved',
      approvedModes: ['onet_blueprint_32'],
      contentReview: { status: 'approved_for_blueprint', approvedBy: 'test_owner' },
      mediaReview: { status: 'not_required', version: 'fixture-v1', reviewer: 'test_owner' },
      itemVersion: 'fixture-v1',
    }))
  );
}

test('approved production bank supplies a complete blueprint paper', () => {
  const paper = sampleBlueprintExam({ seed: 1 });
  const counts = paper.reduce((result, question) => {
    result[question.standard] = (result[question.standard] || 0) + 1;
    return result;
  }, {});

  assert.equal(paper.length, 32);
  assert.deepEqual(counts, BLUEPRINT_CONFIG.quota);
});

test('sampleBlueprintExam generates exactly 32 questions from an explicitly reviewed fixture pool', () => {
  const questionPool = approvedPool();
  for (let run = 0; run < 25; run++) {
    const paper = sampleBlueprintExam({ questionPool });
    assert.equal(paper.length, 32);

    const counts = {};
    const signatures = new Set();

    for (const q of paper) {
      assert.ok(q.standard);
      assert.equal(q.scoreWeight, 3.125);
      assert.equal(q.options.length, 4);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);

      // Verify zero duplicates
      const sig = getQuestionSignature(q);
      assert.ok(!signatures.has(sig), `Duplicate question signature in run ${run}: ${sig}`);
      signatures.add(sig);

      counts[q.standard] = (counts[q.standard] || 0) + 1;
    }

    assert.deepEqual(counts, {
      'ต 1.1': 6,
      'ต 1.2': 10,
      'ต 1.3': 6,
      'ต 2.1': 2,
      'ต 2.2': 4,
      'ต 4.1': 4,
    });
  }
});

test('deterministic seed generates reproducible papers', () => {
  const questionPool = approvedPool();
  const paperA = sampleBlueprintExam({ seed: 42, questionPool });
  const paperB = sampleBlueprintExam({ seed: 42, questionPool });
  const paperC = sampleBlueprintExam({ seed: 99, questionPool });

  assert.deepEqual(
    paperA.map(q => q.id),
    paperB.map(q => q.id)
  );

  assert.notDeepEqual(
    paperA.map(q => q.id),
    paperC.map(q => q.id)
  );
});

test('shuffleQuestionOptions remaps correct answer index correctly without mutating original', () => {
  const original = {
    id: 'test_q',
    question: 'Sample Question',
    options: ['Alpha', 'Beta', 'Gamma', 'Delta'],
    answer: 0,
  };

  const shuffled = shuffleQuestionOptions(original);
  assert.equal(original.options[0], 'Alpha');
  assert.equal(original.answer, 0);

  // Correct text in shuffled options should equal original answer text
  assert.equal(shuffled.options[shuffled.answer], 'Alpha');
  assert.equal(shuffled._originalAnswer, 0);
  assert.equal(shuffled.options.length, 4);
});

test('calculateBlueprintScore calculates accurate weights and standard breakdowns', () => {
  const paper = sampleBlueprintExam({ seed: 101, shuffleOptions: false, questionPool: approvedPool() });
  assert.equal(paper.length, 32);

  // 1. Perfect score
  const perfectAnswers = {};
  paper.forEach((q, idx) => { perfectAnswers[idx] = q.answer; });
  const perfectScore = calculateBlueprintScore(paper, perfectAnswers);

  assert.equal(perfectScore.correctCount, 32);
  assert.equal(perfectScore.points, 100);
  assert.equal(perfectScore.percent, 100);
  assert.equal(perfectScore.passed, true);
  assert.equal(perfectScore.byStandard['ต 1.1'].correct, 6);
  assert.equal(perfectScore.byStandard['ต 1.2'].correct, 10);
  assert.equal(perfectScore.byStandard['ต 2.1'].correct, 2);

  // 2. Zero score
  const zeroAnswers = {};
  paper.forEach((q, idx) => { zeroAnswers[idx] = (q.answer + 1) % 4; });
  const zeroScore = calculateBlueprintScore(paper, zeroAnswers);

  assert.equal(zeroScore.correctCount, 0);
  assert.equal(zeroScore.points, 0);
  assert.equal(zeroScore.percent, 0);
  assert.equal(zeroScore.passed, false);

  // 3. 50% score (16 correct * 3.125 = 50.0 pts)
  const halfAnswers = {};
  paper.forEach((q, idx) => {
    halfAnswers[idx] = idx < 16 ? q.answer : (q.answer + 1) % 4;
  });
  const halfScore = calculateBlueprintScore(paper, halfAnswers);

  assert.equal(halfScore.correctCount, 16);
  assert.equal(halfScore.points, 50);
  assert.equal(halfScore.percent, 50);
  assert.equal(halfScore.passed, false);
});
