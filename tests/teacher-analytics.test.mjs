import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';

const { getRiskStudents, getTeacherOverview, getReviewTasks, ARENA_MODES, TEACHER_CHAPTERS } = await import('../src/utils/teacherAnalytics.js');
const { QUESTS } = await import('../src/data/questions.js');
const now = Date.UTC(2026, 9, 12, 12);

test('teacher chapter definitions cover every catalog quest exactly once and label all Arena modes', () => {
  const ids = TEACHER_CHAPTERS.flatMap(ch => ch.quests);
  assert.equal(ids.length, new Set(ids).size);
  assert.deepEqual(new Set(ids), new Set(QUESTS.map(q => q.id)));
  assert.ok(TEACHER_CHAPTERS.find(ch => ch.ch === 4).quests.includes('finalboss'));
  const arena = TEACHER_CHAPTERS.find(ch => ch.useArena);
  for (const id of arena.arenaMocks) assert.ok(arena.arenaLabels[id]);
});

test('missing pre-test and activity dates do not automatically classify new students as at risk', () => {
  assert.deepEqual(getRiskStudents([{ id: 'new', questProgress: {} }], now), []);
});

test('risk classification distinguishes low results, inactivity, guessing and repeated mistakes', () => {
  const students = [
    { id: 'watch', preTest: { totalScore: 0, total: 20 } },
    { id: 'guess', rankingStats: { totalAnswered: 10, fastGuessCount: 3 } },
    { id: 'inactive', badgeStats: { lastLoginDate: '2026-10-01' } },
    { id: 'low', questProgress: { vocabulary: { pct: 20 }, food: { pct: 30 }, grammar: { pct: 40 } } },
    { id: 'repeat', mistakeBank: { q: { mastered: false, timesWrong: 3 } } },
    { id: 'mastered', mistakeBank: { q: { mastered: true, timesWrong: 3 } } },
  ];
  const risk = getRiskStudents(students, now);
  assert.equal(risk.length, 5);
  assert.equal(risk.find(s => s.id === 'watch').severity, 'watch');
  assert.equal(risk.find(s => s.id === 'guess').severity, 'medium');
  assert.equal(risk.find(s => s.id === 'inactive').severity, 'high');
  assert.equal(risk.find(s => s.id === 'low').severity, 'high');
  assert.equal(risk.find(s => s.id === 'repeat').severity, 'medium');
  assert.equal(risk[0].severity, 'high');
});

test('class summary separates missing results and uses the full catalog for a stable completion denominator', () => {
  const students = [
    { questProgress: { vocabulary: { pct: 0 }, grammar: { pct: 100 } }, arenaStats: { bestMiniMock: { percent: 50 } } },
    {},
  ];
  const summary = getTeacherOverview(students);
  assert.equal(summary.distribution[2].value, 1);
  assert.equal(summary.distribution[4].value, 1);
  assert.equal(summary.completed, 1);
  assert.equal(summary.total, 2 * (QUESTS.length + ARENA_MODES.length));
  assert.equal(summary.weakQuests.find(q => q.id === 'vocabulary').count, 1);
  assert.equal(summary.weakQuests.find(q => q.id === 'bestMiniMock').count, 1);
  assert.ok(!summary.weakQuests.find(q => q.id === 'grammar'));
});

test('review plans prioritize actual failed quests and unresolved mistakes', () => {
  const tasks = getReviewTasks({ questProgress: { vocabulary: { pct: 0 }, grammar: { pct: 100 } }, mistakeBank: { q: { mastered: false } } });
  assert.equal(tasks.length, 2);
  assert.ok(tasks[0].includes('Vocab Village'));
  assert.ok(tasks[1].includes('1 ข้อ'));
  assert.equal(getReviewTasks({})[0], 'เริ่มทบทวน Chapter 1 และทำแบบฝึกพื้นฐาน');
});
