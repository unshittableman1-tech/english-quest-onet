import { QUESTS } from '../data/questions';
import { CHAPTER3_LOCAL_MISSIONS } from '../data/chapter3LocalMissions';

const localById = Object.fromEntries(CHAPTER3_LOCAL_MISSIONS.map(quest => [quest.id, quest]));
const orderedQuests = QUESTS.flatMap(quest => quest.id === 'tenses_arena'
  ? [localById.c3_labeling_lab, localById.c3_ordering_quest, quest]
  : quest.id === 'strategy_boss' ? [localById.c3_graph_comparison, quest] : [quest]);
const positions = new Map(orderedQuests.map((quest, index) => [quest.id, index]));

export function getPendingQuestReviews(student = {}) {
  const counts = new Map();
  for (const mistake of Object.values(student?.mistakeBank || {})) {
    if (!mistake || mistake.mastered === true || !positions.has(mistake.quest)) continue;
    counts.set(mistake.quest, (counts.get(mistake.quest) || 0) + 1);
  }
  return orderedQuests.filter(quest => counts.has(quest.id))
    .map(quest => ({ questId: quest.id, chapter: quest.chapter, name: quest.name, count: counts.get(quest.id) }));
}

export function getQuestReviewBlocker(questId, student = {}) {
  const position = questId === 'final_exam' ? orderedQuests.length : positions.get(questId);
  if (position === undefined) return null;
  return getPendingQuestReviews(student).find(item => positions.get(item.questId) < position) || null;
}

export function applyQuestReviewGate(unlocked, student = {}) {
  const result = { ...unlocked };
  for (const quest of orderedQuests) if (result[quest.id] === true && getQuestReviewBlocker(quest.id, student)) result[quest.id] = false;
  const firstExpansion = QUESTS.find(quest => quest.chapter === 5);
  if (getQuestReviewBlocker(firstExpansion.id, student)) {
    result.chapter4_unlocked = false;
    result.chapter5_unlocked = false;
  }
  return result;
}

export function recordQuestMistake(mistakeBank = {}, question, at = new Date().toISOString()) {
  if (!question?.id || !positions.has(question.quest)) return mistakeBank;
  const previous = mistakeBank[question.id];
  return { ...mistakeBank, [question.id]: { ...previous, ...question, devicePracticeReview: true,
    timesWrong: (Number(previous?.timesWrong) || 0) + 1, correctInReview: 0, mastered: false,
    addedAt: previous?.addedAt || at } };
}

export function reviewQuestMistake(mistakeBank = {}, questionId, correct) {
  const mistake = mistakeBank[questionId];
  if (!mistake || typeof correct !== 'boolean') return mistakeBank;
  const correctInReview = correct ? (Number(mistake.correctInReview) || 0) + 1 : 0;
  return { ...mistakeBank, [questionId]: { ...mistake, correctInReview, mastered: correctInReview >= 2,
    timesWrong: (Number(mistake.timesWrong) || 0) + (correct ? 0 : 1) } };
}
