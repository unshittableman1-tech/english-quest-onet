import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readVocabPractice, nextVocabPractice, saveVocabPractice } from '../src/utils/vocabPractice.js';
test('local vocabulary history is learner-scoped and independent of reward XP', () => {
  localStorage.clear();
  const first = nextVocabPractice(readVocabPractice('first'), 'verbs', 'flashcard', new Date('2026-10-13T04:00:00Z'));
  assert.equal(first.categories.verbs.sessions, 1);
  assert.equal(first.categories.verbs.mode, 'flashcard');
  assert.equal(saveVocabPractice('first', first), true);
  assert.deepEqual(readVocabPractice('first'), first);
  assert.deepEqual(readVocabPractice('second').categories, {});
  const next = nextVocabPractice(first, 'verbs', 'audio', new Date('2026-10-14T04:00:00Z'));
  assert.equal(next.categories.verbs.sessions, 2);
  assert.equal(first.categories.verbs.sessions, 1);
  assert.ok(!('xp' in next.categories.verbs));
  assert.ok(!('mastered' in next.categories.verbs));
  assert.equal(saveVocabPractice(null, next), true);
  assert.deepEqual(readVocabPractice(null).categories, {});
});
test('corrupt practice data and storage failures do not invent progress', () => {
  const bad = { getItem: () => JSON.stringify({ version: 1, categories: { bad: { sessions: -1, lastPracticedAt: 'invalid' }, ok: { sessions: 1, lastPracticedAt: '2026-10-13T00:00:00Z' } } }) };
  assert.deepEqual(Object.keys(readVocabPractice('test', bad).categories), ['ok']);
  assert.deepEqual(readVocabPractice('test', { getItem: () => '{' }).categories, {});
  assert.equal(saveVocabPractice('test', { version: 1, categories: {} }, { setItem: () => { throw Error('quota'); } }), false);
});
