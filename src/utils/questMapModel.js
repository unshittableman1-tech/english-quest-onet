import { QUESTS } from '../data/questions';
import { getPendingQuestReviews } from './questReviewGate';

const titles = {
  1: ['The Foundation', 'พื้นฐานใกล้ตัว'],
  2: ['Social Interactions', 'สื่อสารในชีวิตประจำวัน'],
  3: ['The Interrogation Room', 'ไขปริศนาคำถาม'],
  4: ['Data Detective', 'นักสืบการอ่าน'],
  5: ['Expansion', 'ขยายคลังความรู้'],
};

export const QUEST_CHAPTERS = [...new Set(QUESTS.map(q => q.chapter))].sort((a, b) => a - b)
  .map(id => ({ id, name: titles[id]?.[0] || `Chapter ${id}`, label: titles[id]?.[1] || `บท ${id}`, quests: QUESTS.filter(q => q.chapter === id) }));

export const isQuestPassed = (progress) => progress?.verifiedLearningRun ? progress.passed === true : progress?.passed === true || Number(progress?.pct) >= 70;

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
  return getPendingQuestReviews(student).filter(item => item.chapter === chapter).reduce((total, item) => total + item.count, 0);
}

export function getNextQuestAction(progress = {}, unlocked = {}, student = {}, chapters = QUEST_CHAPTERS) {
  const pending = getPendingQuestReviews(student);
  if (pending.length) return { kind: 'review', chapter: pending[0].chapter, questId: pending[0].questId,
    mistakes: pending.filter(item => item.chapter === pending[0].chapter).reduce((total, item) => total + item.count, 0) };
  for (const chapter of chapters) {
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
  return { kind: chapters.flatMap(chapter => chapter.quests).every(q => isQuestPassed(progress[q.id])) ? 'complete' : 'locked', chapter: 1 };
}
