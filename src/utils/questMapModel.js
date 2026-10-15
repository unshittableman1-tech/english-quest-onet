import { QUESTS } from '../data/questions';

const titles = {
  1: ['The Foundation', 'พื้นฐานใกล้ตัว'],
  2: ['Social Interactions', 'สื่อสารในชีวิตประจำวัน'],
  3: ['The Interrogation Room', 'ไขปริศนาคำถาม'],
  4: ['Data Detective', 'นักสืบการอ่าน'],
  5: ['Expansion', 'ขยายคลังความรู้'],
};

export const QUEST_CHAPTERS = [...new Set(QUESTS.map(q => q.chapter))].sort((a, b) => a - b)
  .map(id => ({ id, name: titles[id]?.[0] || `Chapter ${id}`, label: titles[id]?.[1] || `บท ${id}`, quests: QUESTS.filter(q => q.chapter === id) }));

export const isQuestPassed = (progress) => progress?.passed === true || Number(progress?.pct) >= 70;

export const isChapterChallenge = quest => ['grammar', 'chapter2_boss', 'strategy_boss', 'finalboss', 'chapter5_boss'].includes(quest.id);

export function getQuestLearningState(progress, unlocked) {
  if (!unlocked) return 'locked';
  if (isQuestPassed(progress)) return 'passed';
  const started = Number(progress?.roundsPlayed) > 0 || Number(progress?.attempts) > 0
    || Number(progress?.total) > 0 || (Array.isArray(progress?.stars) && progress.stars.length > 0)
    || (progress?.pct !== null && progress?.pct !== undefined && Number.isFinite(Number(progress.pct)));
  return started ? 'unfinished' : 'new';
}

export function getQuestPracticeStats(progress) {
  const value = progress?.roundsPlayed ?? progress?.attempts;
  const rounds = value !== null && value !== undefined && Number.isFinite(Number(value))
    ? Math.max(0, Math.floor(Number(value))) : null;
  const stars = (Array.isArray(progress?.stars) ? progress.stars : []).reduce((sum, value) => {
    const star = Number(value);
    return sum + (Number.isFinite(star) ? Math.min(3, Math.max(0, star)) : 0);
  }, 0);
  return { rounds, stars };
}

export function getChapterMistakes(student, chapter) {
  return Object.values(student?.mistakeBank || {}).filter(m => !m.mastered && QUESTS.find(q => q.id === m.quest)?.chapter === chapter).length;
}

export function getNextQuestAction(progress = {}, unlocked = {}, student = {}) {
  for (const chapter of QUEST_CHAPTERS) {
    const available = chapter.quests.filter(q => unlocked[q.id]);
    if (!available.length) continue;
    const remaining = available.filter(q => !isQuestPassed(progress[q.id]));
    if (remaining.length) {
      const started = remaining.find(q => Number(progress[q.id]?.roundsPlayed ?? progress[q.id]?.attempts) > 0);
      return { kind: 'quest', chapter: chapter.id, quest: started || remaining[0] };
    }
    const mistakes = getChapterMistakes(student, chapter.id);
    if (chapter.quests.every(q => isQuestPassed(progress[q.id])) && mistakes) {
      return { kind: 'review', chapter: chapter.id, mistakes };
    }
  }
  return { kind: QUESTS.every(q => isQuestPassed(progress[q.id])) ? 'complete' : 'locked', chapter: 1 };
}
