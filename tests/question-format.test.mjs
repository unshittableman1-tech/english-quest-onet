import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { isSingleStepMcq, getQuestionFeedback } = await import('../src/utils/questionFormat.js');
const { getFinalExamPool, finalSimPool } = await import('../src/data/chapter4_questions.js');
const { strategyBossQuestions } = await import('../src/data/chapter3_questions.js');

test('real two-step feedback covers all four answer/reason outcomes with the authored explanations', () => {
  for (const question of strategyBossQuestions) {
    for (const [main, reason, key] of [[true, true, 'bothCorrect'], [true, false, 'mainRightReasonWrong'], [false, true, 'mainWrongReasonRight'], [false, false, 'bothWrong']]) {
      assert.ok(question.feedback[key]);
      assert.equal(getQuestionFeedback(question, { isMainCorrect: main, isReasonCorrect: reason, isCorrect: main && reason }), question.feedback[key]);
    }
  }
});

test('MCQ-only final exam never drops the reason from a two-step item or promotes practice approvals', () => {
  assert.ok(strategyBossQuestions.every(q => !isSingleStepMcq(q)));
  for (let run = 0; run < 30; run++) {
    const paper = getFinalExamPool(50);
    assert.equal(paper.length, 50);
    assert.ok(paper.every(isSingleStepMcq));
    assert.ok(paper.every(q => !['quarantined', 'pending_teacher', 'rejected'].includes(q.reviewStatus)));
    assert.ok(paper.every(q => !q.approvedModes || q.approvedModes.includes('school_final_50')));
    assert.ok(paper.every(q => !q.id?.startsWith('cult_')));
  }
});

test('the corrected average-score answer agrees with the arithmetic and feedback', () => {
  const question = finalSimPool.find(q => q.id === 'fs15');
  assert.equal(question.itemVersion, 'fs15-key-v2');
  assert.equal(Number(question.options[question.answer]), (85 + 78 + 91 + 70) / 4);
  assert.equal(question.sourceCheck.result, 81);
});
