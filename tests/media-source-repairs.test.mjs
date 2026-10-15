import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const { set7Questions, QUESTS } = await import('../src/data/questions.js');
const { scoreTable, restoreSourceMedia } = await import('../src/data/mediaRepairs.js');
const { inspectQuestionMedia, preloadQuestionMedia, isMediaReleaseEligible } = await import('../src/utils/questionMedia.js');
const q = index => set7Questions.find(item => item.id === `pdf_set7_${index}`);

test('ten repaired items are versioned and linked to actual source hashes/pages, without teacher approval', async () => {
  const hashes = new Map();
  for (let i = 15; i <= 24; i++) {
    const item = q(i);
    if (!hashes.has(item.source.file)) hashes.set(item.source.file, createHash('sha256').update(await readFile(item.source.file)).digest('hex'));
    assert.equal(hashes.get(item.source.file), item.source.sha256);
    assert.ok(item.source.stimulusPage && item.source.questionPage && item.source.answerPage);
    assert.equal(item.reviewStatus, 'pending_teacher');
    assert.equal(inspectQuestionMedia(item).status, 'present_unverified');
    assert.equal(isMediaReleaseEligible(item), false);
    await assert.rejects(preloadQuestionMedia([item]));
    assert.equal(item.image, undefined);
    assert.equal(item.itemVersion, 'media-repair-v2');
    assert.ok(QUESTS.find(quest => quest.id === 'reading').questions.includes(item));
  }
});
test('source table values and all five unique keyed answers agree numerically', () => {
  assert.deepEqual(scoreTable.rows, [['2562', 27.5, 28.8], ['2563', 27.8, 38.5], ['2564', 34.5, 33.1]]);
  const [[, m62, e62], [, m63, e63], [, m64, e64]] = scoreTable.rows;
  const truths = [
    [e64 > e63, e63 > e62, e63 === e64, e62 > Math.max(e63, e64)],
    [Math.abs(m64 - m63) > Math.abs(e64 - e63), Math.abs(e64 - e63) > Math.abs(m64 - m63), Math.abs(m64 - m63) === Math.abs(e64 - e63), m64 === m63 && e64 === e63],
    [6, 7, 5, 10].map(value => Math.abs(m64 - m62 - value) < 1e-9),
    [m64 < m63, m64 < Math.min(m62, m63), m64 - m63 > m63 - m62, m62 === m63],
    [false, true, false, false],
  ];
  truths.forEach((values, i) => {
    assert.equal(values.filter(Boolean).length, 1, `Single correct answer ${i + 20}`);
    assert.equal(values.indexOf(true), q(i + 20).answer);
    assert.equal(q(i + 20).stimuli[0].id, scoreTable.id);
    assert.equal(q(i + 20).stimuli[0].version, scoreTable.version);
  });
});
test('source color chart fixes the previous two-correct-answer visual', () => {
  const { points } = q(15).stimuli[0];
  assert.deepEqual(points.map(p => [p.label, p.value]), [['Blue', 100], ['Red', 80], ['Green', 120]]);
  const [b, r, g] = points.map(p => p.value);
  const truth = [r > Math.max(b, g), r > b, b > g, b < g];
  assert.deepEqual(truth, [false, false, false, true]);
  assert.equal(truth.indexOf(true), q(15).answer);
});
test('ambiguous source line-chart item has a documented adapted distractor', () => {
  const item = q(16);
  assert.equal(item.stimuli[0].chartType, 'line');
  const [v20, v21, v22] = item.stimuli[0].points.map(p => p.value);
  assert.deepEqual([v20, v21, v22], [50, 60, 55]);
  const truth = [v21 > Math.max(v20, v22), v22 > v21, v20 > v22, v20 > Math.max(v21, v22)];
  assert.deepEqual(truth, [true, false, false, false]);
  assert.equal(item.answer, 0);
  assert.match(item.change, /original A and D are both true/);
});
test('missing timeline and source graph values are restored without guessed values', () => {
  assert.deepEqual(q(17).stimuli[0].steps, ['Morning', 'Class', 'Lunch', 'After school', 'Home']);
  assert.equal(q(17).answer, 1);
  assert.deepEqual(q(18).stimuli[0].points.map(p => p.value), [28.8, 38.5, 33.1]);
  assert.deepEqual(q(19).stimuli[0].points.map(p => p.value), [66.3, 66.05, 65.93]);
  assert.ok(q(19).stimuli[0].points.every((p, i, points) => i === 0 || p.value < points[i - 1].value));
});
test('restoration does not mutate historical objects and old review versions cannot approve new stimuli', () => {
  const original = { id: 'pdf_set7_20', image: '/images/table_scores.svg', options: ['A. One'], answer: 1 };
  const before = JSON.stringify(original);
  restoreSourceMedia(original);
  assert.equal(JSON.stringify(original), before);
  assert.equal(inspectQuestionMedia({ ...q(20), mediaReview: { status: 'verified', reviewer: 'teacher-fixture', version: 'v1' } }).status, 'present_unverified');
});
test('invalid chart bounds/data and malformed tables are rejected before rendering', () => {
  const chart = q(15).stimuli[0];
  for (const delta of [{ maximum: 0 }, { step: 0 }, { step: 0.01 }, { chartType: 'unknown' }, { precision: 100 }, { points: [{ label: 'A', value: 1000 }, { label: 'B', value: 1 }] }]) {
    assert.equal(inspectQuestionMedia({ stimuli: [{ ...chart, ...delta }] }).blocked, true);
  }
  assert.equal(inspectQuestionMedia({ stimuli: [{ ...scoreTable, rows: [['2562', {}, 2]] }] }).blocked, true);
});
