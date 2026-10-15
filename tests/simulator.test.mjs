import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareSimulatorParts, getSimulatorResults } from '../src/utils/simulator.js';

test('option permutations preserve the answer, passage and source without mutating authored items', () => {
  const input = [{ title: 'Reading', passage: 'Default passage', questions: [{ q: 'A?', opts: ['correct', 'b', 'c', 'd'], ans: 0 }, { q: 'B?', opts: ['a', 'correct', 'c', 'd'], ans: 1, passage: 'Specific passage' }] }];
  const before = JSON.stringify(input);
  const positions = new Set();
  for (let seed = 1; seed <= 100; seed++) {
    let state = seed;
    const parts = prepareSimulatorParts(input, () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296));
    parts[0].questions.forEach(q => { assert.equal(q.opts[q.ans], 'correct'); positions.add(q.ans); });
    assert.equal(parts[0].questions[1].passage, 'Specific passage');
    assert.equal(getSimulatorResults(parts, { '0_0': parts[0].questions[0].ans, '0_1': parts[0].questions[1].ans }).realScore, 100);
  }
  assert.equal(positions.size, 4);
  assert.equal(JSON.stringify(input), before);
});

test('unanswered questions count toward the denominator and an empty timeout grants no bonus', () => {
  const parts = [{ title: 'Part', questions: [{ opts: ['a', 'b'], ans: 0 }, { opts: ['a', 'b'], ans: 1 }] }];
  assert.equal(getSimulatorResults(parts, {}).bonusXP, 0);
  const result = getSimulatorResults(parts, { '0_0': 0 });
  assert.equal(result.totalCorrect, 1);
  assert.equal(result.totalQuestions, 2);
  assert.equal(result.realScore, 50);
});
