import test from 'node:test';
import assert from 'node:assert/strict';
import { BLUEPRINT_2569_STRUCTURE, blueprint32Questions } from '../src/data/pretestBlueprint32.js';
import { POSTTEST_BLUEPRINT_2569_STRUCTURE, posttest32Questions } from '../src/data/posttestBlueprint32.js';

test('post-test blueprint has exactly 32 questions and 100 total score', () => {
  assert.equal(posttest32Questions.length, 32);
  assert.equal(POSTTEST_BLUEPRINT_2569_STRUCTURE.totalItems, 32);
  assert.equal(POSTTEST_BLUEPRINT_2569_STRUCTURE.totalScore, 100);
  assert.equal(POSTTEST_BLUEPRINT_2569_STRUCTURE.scorePerItem, 3.125);
});

test('post-test items parallel pre-test blueprint 1-to-1 in standards and candidate indicators', () => {
  assert.equal(posttest32Questions.length, blueprint32Questions.length);

  for (let i = 0; i < 32; i++) {
    const postItem = posttest32Questions[i];
    const preItem = blueprint32Questions[i];

    assert.equal(postItem.standard, preItem.standard, `Item ${i + 1} standard mismatch`);
    assert.equal(postItem.candidateIndicator, preItem.candidateIndicator, `Item ${i + 1} candidateIndicator mismatch`);
    assert.equal(postItem.status, 'draft_pending_teacher_review', `Item ${i + 1} should be draft pending teacher review`);
    assert.ok(postItem.prompt && postItem.prompt.length > 5, `Item ${i + 1} missing prompt`);
    assert.equal(postItem.options.length, 4, `Item ${i + 1} must have exactly 4 choices`);
    assert.ok(Number.isInteger(postItem.answer) && postItem.answer >= 0 && postItem.answer <= 3, `Item ${i + 1} answer must be 0..3`);
    assert.ok(postItem.explanation && postItem.explanation.length > 5, `Item ${i + 1} missing explanation`);
  }
});

test('post-test standards distribution matches the official O-NET P.6 blueprint specification', () => {
  const counts = posttest32Questions.reduce((acc, q) => {
    acc[q.standard] = (acc[q.standard] || 0) + 1;
    return acc;
  }, {});

  assert.equal(counts['ต 1.1'], 6, 'ต 1.1 should have 6 items (18.75 pts)');
  assert.equal(counts['ต 1.2'], 10, 'ต 1.2 should have 10 items (31.25 pts)');
  assert.equal(counts['ต 1.3'], 6, 'ต 1.3 should have 6 items (18.75 pts)');
  assert.equal(counts['ต 2.1'], 2, 'ต 2.1 should have 2 items (6.25 pts)');
  assert.equal(counts['ต 2.2'], 4, 'ต 2.2 should have 4 items (12.50 pts)');
  assert.equal(counts['ต 4.1'], 4, 'ต 4.1 should have 4 items (12.50 pts)');

  const totalScore = Object.values(counts).reduce((sum, count) => sum + count * 3.125, 0);
  assert.equal(totalScore, 100);
});
