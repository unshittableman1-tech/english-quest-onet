import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
}

const {
  listPracticeDrafts,
  reviewPracticeDraft,
  createPracticeDraft,
  deletePracticeDraft,
  updateDraftQuestion,
  PRACTICE_SKILLS,
} = await import('../src/utils/personalizedPracticeReview.js');

test('listPracticeDrafts returns standard seed drafts and never throws when offline', async () => {
  const result = await listPracticeDrafts('BNS69');
  assert.ok(Array.isArray(result.drafts));
  assert.ok(result.drafts.length >= 3);
  assert.equal(result.drafts[0].schoolId, 'BNS69');
  assert.ok(result.drafts.some((d) => d.status === 'pending_review'));
  assert.ok(result.drafts.some((d) => d.status === 'approved'));
});

test('reviewPracticeDraft can approve a draft without awarding XP', async () => {
  const list = await listPracticeDrafts('BNS69');
  const pending = list.drafts.find((d) => d.status === 'pending_review');
  assert.ok(pending);

  const reviewResult = await reviewPracticeDraft('BNS69', pending.id, 'approved', '', 'ครูสมศรี');
  assert.equal(reviewResult.ok, true);
  assert.equal(reviewResult.status, 'approved');

  const updatedList = await listPracticeDrafts('BNS69');
  const target = updatedList.drafts.find((d) => d.id === pending.id);
  assert.equal(target.status, 'approved');
  assert.equal(target.reviewedBy, 'ครูสมศรี');
  assert.equal(target.awardsXP, false);
});

test('reviewPracticeDraft requires a reason when rejecting', async () => {
  const list = await listPracticeDrafts('BNS69');
  const first = list.drafts[0];

  await assert.rejects(
    async () => {
      await reviewPracticeDraft('BNS69', first.id, 'rejected', '');
    },
    /กรุณาระบุเหตุผล/
  );

  const validReject = await reviewPracticeDraft('BNS69', first.id, 'rejected', 'โจทย์ซ้ำกับบทเรียนเดิม');
  assert.equal(validReject.ok, true);
  assert.equal(validReject.status, 'rejected');
});

test('createPracticeDraft generates questions tailored to the requested skill and standard', async () => {
  const result = await createPracticeDraft({
    schoolId: 'BNS69',
    skill: 'signs_and_notices',
    difficulty: 'ง่าย (Easy)',
    count: 3,
    targetClass: 'ป.6/1',
    topic: 'ป้ายเตือนในโรงเรียน',
  });

  assert.equal(result.ok, true);
  assert.ok(result.draft.id.startsWith('draft-'));
  assert.equal(result.draft.status, 'pending_review');
  assert.equal(result.draft.awardsXP, false);
  assert.equal(result.draft.targetClass, 'ป.6/1');
  assert.equal(result.draft.questions.length, 3);
  assert.ok(result.draft.questions.every((q) => q.prompt && q.options.length === 4 && q.explanation));
});

test('updateDraftQuestion updates prompt, options and explanation cleanly', async () => {
  const list = await listPracticeDrafts('BNS69');
  const draftId = list.drafts[0].id;

  const updateResult = await updateDraftQuestion('BNS69', draftId, 0, {
    prompt: 'Updated Prompt for testing?',
    explanation: 'Updated explanation in Thai',
  });

  assert.equal(updateResult.ok, true);
  assert.equal(updateResult.draft.questions[0].prompt, 'Updated Prompt for testing?');
  assert.equal(updateResult.draft.questions[0].explanation, 'Updated explanation in Thai');
});

test('deletePracticeDraft removes target draft from school store', async () => {
  const listBefore = await listPracticeDrafts('BNS69');
  const targetId = listBefore.drafts[0].id;

  await deletePracticeDraft('BNS69', targetId);

  const listAfter = await listPracticeDrafts('BNS69');
  assert.equal(listAfter.drafts.some((d) => d.id === targetId), false);
});
