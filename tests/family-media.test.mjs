import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const { familyQuestions } = await import('../src/data/questions.js');
const { restoreFamilyMedia } = await import('../src/data/familyMediaRepairs.js');
const { isPracticeQuestionReady, isMediaReleaseEligible, inspectQuestionMedia } = await import('../src/utils/questionMedia.js');

const repaired = familyQuestions.filter(q => q.itemVersion === 'family-media-v2');
test('owner approval enables exactly three repaired Family practice items, not official exams', () => {
  assert.equal(repaired.length, 3);
  assert.equal(familyQuestions.filter(isPracticeQuestionReady).length, 10);
  const hash = createHash('sha256').update(readFileSync(repaired[0].source.file)).digest('hex');
  assert.deepEqual(repaired.map(q => q.source.questionNumber), [1, 6, 9]);
  assert.deepEqual(repaired.map(q => q.source.questionPage), [4, 5, 6]);
  for (const q of repaired) {
    assert.equal(q.source.sha256, hash);
    assert.equal(q.source.answerPage, 7);
    assert.equal(q.reviewStatus, 'approved');
    assert.deepEqual(q.approvedModes, ['practice_assessment']);
    assert.equal(q.contentReview.approvedBy, 'workspace_owner');
    assert.equal(isPracticeQuestionReady(q), true);
    assert.equal(isMediaReleaseEligible(q), true);
    assert.equal(isMediaReleaseEligible(q, 'school_final_50'), false);
    assert.equal(isMediaReleaseEligible(q, 'onet_p6_2569'), false);
    assert.equal(new Set(q.options).size, 4);
  }
});
test('Family image assets have RGBA PNG data and persisted generation prompts', () => {
  const manifest = JSON.parse(readFileSync('md/Family Image Generation.json', 'utf8'));
  assert.equal(manifest.assets.length, 2);
  for (const q of repaired.filter(q => q.image)) {
    const png = readFileSync(`public${q.image}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(png[25], 6);
    assert.ok(png.readUInt32BE(16) >= 512);
    assert.equal(inspectQuestionMedia(q).status, 'verified');
    assert.ok(manifest.assets.find(a => a.file === `public${q.image}`)?.prompt.length > 200);
  }
});
test('Family relationship adaptation corrects the source defect and retains original options', () => {
  const q = repaired[2];
  assert.equal(q.options[q.answer], 'My aunt');
  assert.equal(q.legacySnapshot.options[q.legacySnapshot.answer], 'His aunt');
  assert.equal(q.legacySnapshot.reviewStatus, 'quarantined');
  assert.equal(inspectQuestionMedia(q).status, 'not_required');
  const original = { id: q.id, question: q.question, options: [...q.legacySnapshot.options], answer: 2 };
  const snapshot = structuredClone(original);
  restoreFamilyMedia(original);
  assert.deepEqual(original, snapshot);
  const untouched = { id: 'unrelated' };
  assert.equal(restoreFamilyMedia(untouched), untouched);
});
