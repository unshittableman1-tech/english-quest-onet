import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const { QUEST_CHAPTERS, getNextQuestAction, getChapterMistakes, getQuestPracticeStats, getQuestLearningState, isChapterChallenge } = await import('../src/utils/questMapModel.js');
const { QUESTS } = await import('../src/data/questions.js');
const { CHAPTER3_LOCAL_MISSIONS } = await import('../src/data/chapter3LocalMissions.js');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('learning states distinguish new lessons, recorded failures, passed and locked lessons', () => {
  assert.equal(getQuestLearningState(undefined, true), 'new');
  assert.equal(getQuestLearningState({ roundsPlayed: 0, stars: [] }, true), 'new');
  for (const progress of [{ pct: 0 }, { attempts: 1 }, { roundsPlayed: 1 }, { stars: [0] }, { total: 5 }]) {
    assert.equal(getQuestLearningState(progress, true), 'unfinished');
  }
  assert.equal(getQuestLearningState({ passed: true, pct: 0 }, true), 'passed');
  assert.equal(getQuestLearningState({ pct: 80 }, true), 'passed');
  assert.equal(getQuestLearningState({ passed: true }, false), 'locked');
});

test('chapter challenges group all five bosses without losing lessons', () => {
  assert.deepEqual(QUESTS.filter(isChapterChallenge).map(q => q.id), ['grammar', 'chapter2_boss', 'strategy_boss', 'finalboss', 'chapter5_boss']);
  for (const chapter of QUEST_CHAPTERS) {
    const groups = [...chapter.quests.filter(q => !isChapterChallenge(q)), ...chapter.quests.filter(isChapterChallenge)];
    assert.equal(new Set(groups.map(q => q.id)).size, chapter.quests.length);
  }
});

test('practice totals preserve lifetime rounds and stars without a five-round cap', () => {
  const progress = { roundsPlayed: 62, stars: Array(62).fill(3) };
  assert.deepEqual(getQuestPracticeStats(progress), { rounds: 62, stars: 186 });
  assert.equal(progress.stars.length, 62);
  assert.deepEqual(getQuestPracticeStats({ attempts: 1, stars: [3] }), { rounds: 1, stars: 3 });
  assert.deepEqual(getQuestPracticeStats(), { rounds: null, stars: 0 });
  assert.deepEqual(getQuestPracticeStats({ roundsPlayed: null, stars: [NaN, Infinity, -2, 3] }), { rounds: null, stars: 3 });
});

test('chapter navigation covers the entire catalog including eight expansion quests', () => {
  assert.deepEqual(QUEST_CHAPTERS.flatMap(c => c.quests), QUESTS);
  assert.equal(QUEST_CHAPTERS.find(c => c.id === 5).quests.length, 8);
  assert.equal(QUEST_CHAPTERS.find(c => c.id === 5).quests.at(-1).id, 'chapter5_boss');
});

test('next activity uses the same extended chapter catalog as the report', () => {
  const chapters = QUEST_CHAPTERS.map(chapter => chapter.id === 3
    ? { ...chapter, quests: [...chapter.quests, ...CHAPTER3_LOCAL_MISSIONS] } : chapter);
  const progress = Object.fromEntries(QUESTS.map(quest => [quest.id, { passed: true }]));
  const unlocked = Object.fromEntries(CHAPTER3_LOCAL_MISSIONS.map(quest => [quest.id, true]));
  assert.equal(getNextQuestAction(progress, unlocked, {}, chapters).quest.id, CHAPTER3_LOCAL_MISSIONS[0].id);
  assert.equal(getNextQuestAction(progress, {}, {}, chapters).kind, 'locked');
});

test('next activity prefers a started, unlocked, unfinished lesson', () => {
  const [first, second, third] = QUEST_CHAPTERS[0].quests;
  const progress = { [second.id]: { roundsPlayed: 2 }, [third.id]: { roundsPlayed: 3 } };
  const unlocked = { [first.id]: true, [second.id]: true };
  assert.equal(getNextQuestAction(progress, unlocked).quest.id, second.id);
  assert.equal(getNextQuestAction({}, unlocked).quest.id, first.id);
  assert.equal(getNextQuestAction({}, {}).kind, 'locked');
});

test('completed chapter recommends unresolved review before later chapters', () => {
  const chapter = QUEST_CHAPTERS[0];
  const progress = Object.fromEntries(chapter.quests.map(q => [q.id, { pct: 80 }]));
  const unlocked = Object.fromEntries(QUESTS.map(q => [q.id, true]));
  const student = { mistakeBank: {
    a: { quest: chapter.quests[0].id, mastered: false },
    b: { quest: chapter.quests[0].id, mastered: true },
    c: { quest: 'not-a-quest', mastered: false },
  } };
  assert.equal(getChapterMistakes(student, 1), 1);
  assert.equal(getNextQuestAction(progress, unlocked, student).kind, 'review');
  assert.equal(getNextQuestAction(progress, unlocked, {}).chapter, 2);
});

test('all passed quests recommend the exam area', () => {
  const progress = Object.fromEntries(QUESTS.map(q => [q.id, { passed: true }]));
  const unlocked = Object.fromEntries(QUESTS.map(q => [q.id, true]));
  assert.equal(getNextQuestAction(progress, unlocked).kind, 'complete');
});

test('quest map UX exposes the validated next action, remaining XP and distinct route states', () => {
  const questMap = readFileSync(path.join(root, 'src/components/QuestMap.jsx'), 'utf8');
  const adventureMap = readFileSync(path.join(root, 'src/components/quest/AdventureQuestMap.jsx'), 'utf8');
  const lessonCard = readFileSync(path.join(root, 'src/components/quest/QuestLessonCard.jsx'), 'utf8');
  const styles = readFileSync(path.join(root, 'src/index.css'), 'utf8');

  assert.match(questMap, /needed - xpInfo\.current/);
  assert.match(questMap, /เหลืออีก \$\{xpRemaining\} XP/);
  assert.match(questMap, /qm-primary qm-continue/);
  assert.match(questMap, /ผจญภัยต่อ/);
  assert.match(adventureMap, /qm-map-state-label/);
  assert.match(adventureMap, /<ChapterWorldBackground chapterId=\{chapter.id\}/);
  assert.match(adventureMap, /qm-map-avatar/);
  assert.match(adventureMap, /qm-map-path \$\{state === 'completed' \? 'is-travelled'/);
  assert.match(lessonCard, /qm-completion-reward/);
  assert.match(styles, /\.qm-map-node\.is-completed/);
  assert.match(styles, /\.qm-map-node\.is-current/);
  assert.match(styles, /\.qm-map-node\.is-locked/);
  assert.match(styles, /\.qm-world-sky/);
  assert.match(styles, /min-height: 490px/);
  assert.match(styles, /@media \(max-width: 420px\)/);
});
