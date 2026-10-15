import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectQuestionMedia, getQuestionStimuli, isMediaReleaseEligible, preloadQuestionMedia } from '../src/utils/questionMedia.js';

test('legacy image and passage survive together without being marked verified', () => {
  const q = { image: '/images/test.svg', passage: 'Read this.' };
  assert.equal(getQuestionStimuli(q).length, 2);
  assert.equal(inspectQuestionMedia(q).status, 'present_unverified');
  assert.equal(isMediaReleaseEligible(q), false);
});
test('explicit stimuli supersede legacy fields without duplicating media', () => {
  assert.deepEqual(getQuestionStimuli({ image: '/old.svg', stimuli: [{ type: 'passage', text: 'New' }] }), [{ type: 'passage', text: 'New' }]);
});
test('known symbolic placeholders and explicit missing requirements block attempts', () => {
  for (const question of ['What does this symbol mean? (Recycle symbol)', 'This symbol means: 💉', 'What does this symbol mean? (สัญลักษณ์เตียง/ตึกที่มีกากบาทแดง)', 'What does this symbol mean? (Sun)', 'What does this symbol mean? (Rainy cloud)', 'What activity uses this symbol (Game controller)?', 'What does this symbol mean? (Shopping cart)']) {
    assert.equal(inspectQuestionMedia({ question }).status, 'placeholder');
  }
  assert.equal(inspectQuestionMedia({ mediaRequired: true }).status, 'missing');
  assert.equal(inspectQuestionMedia({ question: 'A sign says NO PARKING. What should you do?' }).blocked, false);
});
test('tables keep exact values; ragged rows and unsupported renderers fail closed', () => {
  const stimuli = [{ type: 'table', columns: ['Day', 'Tickets'], rows: [['Mon', 12], ['Tue', 18]] }];
  assert.equal(inspectQuestionMedia({ stimuli }).blocked, false);
  assert.equal(getQuestionStimuli({ stimuli })[0].rows[1][1], 18);
  assert.equal(inspectQuestionMedia({ stimuli: [{ ...stimuli[0], rows: [['Mon']] }] }).blocked, true);
  assert.equal(inspectQuestionMedia({ stimuli: [{ type: 'chart' }] }).blocked, true);
});
test('release approval requires content approval and versioned reviewer signoff', () => {
  const q = { image: '/x.svg', reviewStatus: 'approved', mediaReview: { status: 'verified', reviewer: 'teacher', version: 'v1' } };
  assert.equal(isMediaReleaseEligible(q), true);
  assert.equal(isMediaReleaseEligible({ ...q, mediaReview: { status: 'verified' } }), false);
});
test('preflight deduplicates images and rejects failed assets without replacing questions', async () => {
  const loaded = [];
  const mediaReview = { status: 'verified', reviewer: 'test-fixture', version: 'synthetic-v1' };
  await preloadQuestionMedia([{ image: '/a.svg', mediaReview }, { image: '/a.svg', passage: 'Hello', mediaReview }], async src => loaded.push(src));
  assert.deepEqual(loaded, ['/a.svg']);
  await assert.rejects(preloadQuestionMedia([{ image: '/missing.svg', mediaReview }], async () => { throw new Error('404'); }), /404/);
  await assert.rejects(preloadQuestionMedia([{ image: '/unreviewed.svg' }], async () => assert.fail()), /Incomplete/);
  await assert.rejects(preloadQuestionMedia([{ id: 'bad', mediaRequired: true }], async () => assert.fail()));
});
