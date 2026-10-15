import { getPreTestResult } from './preTestResult';

// --- Constants ---
export const XP_RULES = {
  COMPLETE_QUEST: 50,
  CORRECT_ANSWER: 10,
  COMBO_3: 5,
  COMBO_5: 15,
  COMBO_10: 30,
  COMPLETE_10: 20,
  PASS_70: 50,
  PASS_90: 100,
  PRETEST_DONE: 15,
  FINALBOSS_PASS: 150
};

const nonNegative = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const percent = (value) => Math.min(100, nonNegative(value));

// --- Leveling ---
export function calcLevel(xp) {
  xp = nonNegative(xp);
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  if (xp < 1000) return 4;
  if (xp < 2000) return 5;
  if (xp < 3500) return 6;
  if (xp < 5000) return 7;
  if (xp < 7000) return 8;
  if (xp < 10000) return 9;
  return 10;
}

export function xpToNextLevel(xp) {
  xp = nonNegative(xp);
  const thresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5000, 7000, 10000];
  const level = calcLevel(xp);
  if (level === 10) return { current: 0, needed: 0, pct: 100, next: 10000, progress: 100, maxLevel: true };
  const next = thresholds[level];
  const prev = thresholds[level - 1];
  const progress = Math.max(0, Math.min(100, ((xp - prev) / (next - prev)) * 100));
  return { current: xp - prev, needed: next - prev, pct: progress, next, progress, maxLevel: false };
}

// --- Progression & Unlocks ---
import { QUESTS } from '../data/questions';

export function getUnlockedQuests(questProgress = {}, student = {}) {
  const progress = questProgress || {};
  const passed = (id) => progress[id]?.passed === true || percent(progress[id]?.pct) >= 70;
  const chapterQuests = (chapter) => QUESTS.filter(q => q.chapter === chapter);
  const completed = (chapter) => chapterQuests(chapter).every(q => passed(q.id));
  const hasMistakes = (chapter) => Object.values(student?.mistakeBank || {}).some(m =>
    !m.mastered && QUESTS.find(q => q.id === m.quest)?.chapter === chapter
  );
  const hasProgress = (chapter) => chapterQuests(chapter).some(q => {
    const p = progress[q.id];
    return p && (p.passed || nonNegative(p.attempts) > 0 || nonNegative(p.roundsPlayed) > 0 || nonNegative(p.total) > 0 || percent(p.pct) > 0);
  });

  // Keep chapters already played by existing students accessible after migration.
  const arenaStarted = !!(student?.arenaStats?.attempts?.length || student?.arenaStats?.finalExamResult);
  const opened = { 1: true };
  for (let chapter = 2; chapter <= 5; chapter++) {
    const previouslyOpened = arenaStarted || QUESTS.some(q => q.chapter >= chapter && hasProgress(q.chapter));
    opened[chapter] = previouslyOpened || (opened[chapter - 1] && completed(chapter - 1) && !hasMistakes(chapter - 1));
  }

  const unlocked = Object.fromEntries(QUESTS.map(q => [q.id, opened[q.chapter] || false]));
  for (const [bossId, chapter] of [['chapter2_boss', 2], ['strategy_boss', 3], ['finalboss', 4], ['chapter5_boss', 5]]) {
    const bossStarted = progress[bossId] != null;
    unlocked[bossId] = opened[chapter] && (bossStarted || chapterQuests(chapter).filter(q => q.id !== bossId).every(q => passed(q.id)));
  }
  for (let chapter = 1; chapter <= 3; chapter++) {
    unlocked[`ch${chapter}_review_gate`] = opened[chapter] && completed(chapter);
  }
  unlocked.chapter4_unlocked = opened[5]; // Legacy key used by the Arena entry.
  unlocked.chapter5_unlocked = opened[5];
  return unlocked;
}

// ── Weak/Strong Areas ─────────────────────────────────────────
export function getWeakAreas(questProgress) {
  const questNames = {
    vocabulary: 'Vocabulary',
    signs: 'Signs',
    directions: 'Directions',
    market: 'Market',
    reading: 'Reading'
  };

  const areas = Object.keys(questNames).map(id => ({
    id,
    name: questNames[id],
    pct: questProgress[id]?.pct || 0,
    played: !!questProgress[id]
  })).filter(a => a.played);

  areas.sort((a, b) => a.pct - b.pct);
  return areas.slice(0, 2);
}

export function getStrongAreas(questProgress) {
  const questNames = {
    vocabulary: 'Vocabulary',
    signs: 'Signs',
    directions: 'Directions',
    market: 'Market',
    reading: 'Reading'
  };

  const areas = Object.keys(questNames).map(id => ({
    id,
    name: questNames[id],
    pct: questProgress[id]?.pct || 0,
    played: !!questProgress[id]
  })).filter(a => a.played);

  areas.sort((a, b) => b.pct - a.pct);
  return areas.slice(0, 2);
}


// --- Ranking ---
export function calculateRankScore(student, rawFastGuessCount) {
  if (typeof student === 'number') return Math.round(nonNegative(student));
  if (!student) return 0;

  const quests = Object.values(student.questProgress || {});
  const stats = student.rankingStats || {};
  const badgeStats = student.badgeStats || {};
  const reviewCredits = Object.values(student.mistakeBank || {}).reduce((sum, m) =>
    sum + nonNegative(m.correctInReview) + (m.mastered ? 2 : 0), 0);
  const rawFastGuess = nonNegative(rawFastGuessCount ?? stats.fastGuessCount);
  const adjustedFastGuess = rawFastGuessCount === undefined
    ? Math.max(0, rawFastGuess - reviewCredits * 5)
    : nonNegative(stats.fastGuessCount);
  const legitimateAnswers = Math.max(0, nonNegative(stats.totalAnswered) - rawFastGuess);
  const cappedXP = Math.min(nonNegative(student.xp), legitimateAnswers * 50 + 2000);
  const stars = quests.reduce((sum, q) => sum + Math.min(15,
    (Array.isArray(q.stars) ? q.stars : []).reduce((count, star) => count + Math.min(3, nonNegative(star)), 0)), 0);
  const missions = quests.reduce((sum, q) => sum + Math.min(5, nonNegative(q.roundsPlayed ?? q.attempts)), 0);
  const completedQuests = quests.filter(q => q.passed || percent(q.pct) >= 70).length;
  const badges = new Set(Array.isArray(student.badges) ? student.badges : []).size;
  const baseline = getStudentPreTestPercent(student);
  const growth = baseline === null ? 0 : Math.max(0, percent(badgeStats.posttestScore) - baseline);

  return Math.max(0, Math.round(cappedXP + stars * 20 + badges * 50 + missions * 80 +
    completedQuests * 150 + Math.max(nonNegative(badgeStats.mistakesFixed), reviewCredits) * 10 +
    growth * 15 + percent(student.finalBoss?.pct) * 5 - adjustedFastGuess * 30));
}

export const RANKING_TIERS = [
  { min: 0, name: 'Novice Trainee', icon: '🌱', color: 'text-emerald-600' },
  { min: 500, name: 'Bronze Adventurer', icon: '🪵', color: 'text-amber-600' },
  { min: 1500, name: 'Silver Explorer', icon: '🥈', color: 'text-slate-500' },
  { min: 4000, name: 'Gold Scholar', icon: '🥇', color: 'text-yellow-600' },
  { min: 8000, name: 'Platinum Guardian', icon: '🛡️', color: 'text-teal-600' },
  { min: 15000, name: 'Diamond Master', icon: '💎', color: 'text-sky-600' },
  { min: 30000, name: 'Grandmaster', icon: '🐉', color: 'text-violet-600' },
  { min: 50000, name: 'O-NET Legend', icon: '👑', color: 'text-rose-600' },
  { min: 75000, name: 'Mythic Conqueror', icon: '🏆', color: 'text-fuchsia-600' },
  { min: 100000, name: 'O-NET God', icon: '🌟', color: 'text-amber-500' },
];

export function getRankingTier(score) {
  const value = nonNegative(score);
  const index = RANKING_TIERS.findLastIndex(tier => value >= tier.min);
  const tier = RANKING_TIERS[index];
  return { ...tier, next: RANKING_TIERS[index + 1]?.min ?? null };
}


export function getLevelTitle(level) {
  const titles = [
    'Newbie Explorer',
    'Curious Learner',
    'Word Hunter',
    'Grammar Knight',
    'Sentence Master',
    'Language Scholar',
    'O-NET Challenger',
    'Elite Student',
    'Master of English',
    'Legendary Wizard'
  ];
  return titles[level - 1] || titles[0];
}


export const STREAK_REWARDS = [
  { xp: 10,  icon: '⭐',  color: '#fbbf24', label: 'Day 1 Bonus',        isMilestone: false },
  { xp: 15,  icon: '🔥',  color: '#f97316', label: 'Day 2 Bonus',        isMilestone: false },
  { xp: 20,  icon: '💪',  color: '#ef4444', label: 'Day 3 Bonus',        isMilestone: true  },
  { xp: 25,  icon: '🎯',  color: '#8b5cf6', label: 'Day 4 Bonus',        isMilestone: false },
  { xp: 35,  icon: '🚀',  color: '#3b82f6', label: 'Day 5 Bonus',        isMilestone: true  },
  { xp: 45,  icon: '💎',  color: '#06b6d4', label: 'Day 6 Bonus',        isMilestone: false },
  { xp: 80,  icon: '👑',  color: '#10b981', label: 'Weekly Champion!',    isMilestone: true  },
];

export function getStreakReward(streakDays) {
  const dayIndex = ((Math.max(1, streakDays) - 1) % 7);
  return STREAK_REWARDS[dayIndex];
}


// --- Class Analytics ---
export function getClassWeakAreas(students = []) {
  return QUESTS.map(q => {
    const scores = students.map(s => s.questProgress?.[q.id]?.pct).filter(isScore);
    return { id: q.id, quest: q.name, name: q.name, count: scores.filter(score => score < 70).length, pct: average(scores) };
  }).filter(q => q.count > 0).sort((a, b) => b.count - a.count || a.pct - b.pct).slice(0, 3);
}

const isScore = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
const average = (scores) => scores.length ? Math.round(scores.reduce((sum, score) => sum + percent(score), 0) / scores.length) : 0;

export function getStudentPreTestPercent(student) {
  return getPreTestResult(student).percent;
}

export function getStudentCurrentPercent(student) {
  const scores = Object.entries(student.questProgress || {}).filter(([id]) => id !== 'finalboss')
    .map(([, q]) => q.pct).filter(isScore);
  return scores.length ? average(scores) : getStudentPreTestPercent(student);
}

export function getClassGrowth(students = []) {
  const changes = students.flatMap(student => {
    const pre = getStudentPreTestPercent(student);
    const hasCurrent = Object.entries(student.questProgress || {}).some(([id, result]) => id !== 'finalboss' && isScore(result.pct));
    return pre !== null && hasCurrent ? [getStudentCurrentPercent(student) - pre] : [];
  });
  return changes.length ? Math.round(changes.reduce((sum, value) => sum + value, 0) / changes.length) : null;
}

export function getClassPreTestAverage(students = []) {
  return average(students.map(getStudentPreTestPercent).filter(isScore));
}

export function getClassCurrentAverage(students = []) {
  return average(students.map(getStudentCurrentPercent).filter(isScore));
}
