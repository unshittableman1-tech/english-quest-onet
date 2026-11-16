import { QUESTS } from '../data/questions.js';
import { getNextQuestAction, isQuestPassed } from './questMapModel.js';

const SKILLS = [
  {
    id: 'present_simple',
    label: 'Present Simple',
    questIds: ['about_myself', 'school', 'tenses_arena'],
    match: /present simple|every day|usually|always|he\s|she\s|เติม s|verb|tense/i,
  },
  {
    id: 'daily_life_vocabulary',
    label: 'คำศัพท์ชีวิตประจำวัน',
    questIds: ['vocabulary', 'about_myself', 'family', 'school', 'food', 'market'],
    match: /vocab|word|meaning|family|school|food|market|daily|คำศัพท์|ความหมาย/i,
  },
  {
    id: 'reading_main_idea',
    label: 'Reading: Main Idea',
    questIds: ['reading', 'reading_detective'],
    match: /reading|main idea|passage|paragraph|เรื่องนี้กล่าวถึง|ใจความสำคัญ|keyword/i,
  },
];

const questById = new Map(QUESTS.map(quest => [quest.id, quest]));

function hasRecordedProgress(progress) {
  return Boolean(progress) && [progress.pct, progress.total, progress.attempts, progress.roundsPlayed, progress.lastAssessment]
    .some(value => value !== null && value !== undefined);
}

function mistakeText(mistake) {
  return [mistake?.quest, mistake?.skill, mistake?.question, mistake?.keyword, mistake?.wrongFeedback]
    .filter(Boolean).join(' ');
}

function skillForMistake(mistake) {
  return SKILLS.find(skill => skill.questIds.includes(mistake?.quest) || skill.match.test(mistakeText(mistake)));
}

function bestQuestForSkill(skill, progress, unlocked) {
  return skill.questIds
    .map(id => questById.get(id))
    .filter(quest => quest && unlocked[quest.id] && !isQuestPassed(progress[quest.id]))
    .sort((left, right) => {
      const leftPct = hasRecordedProgress(progress[left.id]) ? Number(progress[left.id]?.pct ?? 0) : 101;
      const rightPct = hasRecordedProgress(progress[right.id]) ? Number(progress[right.id]?.pct ?? 0) : 101;
      return leftPct - rightPct;
    })[0];
}

function activityForQuest(quest, skill, progress, reason) {
  const pct = Number(progress[quest.id]?.pct);
  const evidence = Number.isFinite(pct) ? `คะแนนล่าสุด ${Math.max(0, Math.min(100, Math.round(pct)))}%` : 'พบข้อผิดที่ยังต้องฝึก';
  return {
    id: `quest:${quest.id}`,
    destinationId: `quest:${quest.id}`,
    type: 'quest',
    questId: quest.id,
    title: quest.name,
    skill: skill?.label || quest.name,
    reason: reason || `ฝึก ${skill?.label || quest.description} จากข้อมูลการเรียนล่าสุด`,
    evidence,
  };
}

export function buildSmartLearningPath({ student = {}, progress = {}, unlocked = {} } = {}) {
  const unresolved = Object.values(student.mistakeBank || {}).filter(mistake => !mistake?.mastered);
  const scores = new Map(SKILLS.map(skill => [skill.id, { skill, score: 0, mistakes: 0, lowQuests: [] }]));

  for (const mistake of unresolved) {
    const skill = skillForMistake(mistake);
    if (!skill) continue;
    const entry = scores.get(skill.id);
    entry.mistakes += 1;
    entry.score += Math.max(1, Number(mistake.timesWrong) || 1) * 3;
  }

  for (const skill of SKILLS) {
    const entry = scores.get(skill.id);
    for (const questId of skill.questIds) {
      const questProgress = progress[questId];
      if (!hasRecordedProgress(questProgress) || isQuestPassed(questProgress)) continue;
      const pct = Math.max(0, Math.min(100, Number(questProgress.pct) || 0));
      entry.score += 1 + Math.ceil((70 - Math.min(70, pct)) / 10);
      entry.lowQuests.push({ questId, pct });
    }
  }

  const ranked = [...scores.values()].filter(entry => entry.score > 0).sort((a, b) => b.score - a.score);
  const recommendations = [];
  const usedDestinations = new Set();

  function addRecommendation(activity) {
    if (!activity || usedDestinations.has(activity.destinationId)) return false;
    usedDestinations.add(activity.destinationId);
    recommendations.push(activity);
    return true;
  }

  if (unresolved.length) {
    const top = ranked[0];
    addRecommendation({
      id: 'review:mistakes', destinationId: 'review', type: 'review', title: 'ทบทวนข้อที่ยังไม่แม่น',
      skill: top?.skill.label || 'Mistake Bank',
      reason: top ? `มีข้อผิดค้างในหัวข้อ ${top.skill.label} ควรทบทวนก่อนเพื่อแก้ความเข้าใจ` : 'ยังมีข้อผิดที่ต้องตอบถูกซ้ำเพื่อยืนยันความเข้าใจ',
      evidence: `${unresolved.length} ข้อที่ยังไม่ mastered`,
    });
  }

  for (const entry of ranked) {
    if (recommendations.length >= 3) break;
    const quest = bestQuestForSkill(entry.skill, progress, unlocked);
    if (!quest) continue;
    const reason = entry.mistakes
      ? `พบข้อผิดซ้ำในหัวข้อ ${entry.skill.label} จึงแนะนำด่านนี้เพื่อฝึกจากบริบทใหม่`
      : `คะแนนหัวข้อ ${entry.skill.label} ยังต่ำกว่าเกณฑ์ผ่าน 70%`;
    addRecommendation(activityForQuest(quest, entry.skill, progress, reason));
  }

  if (!ranked.length && !unresolved.length) {
    const next = getNextQuestAction(progress, unlocked, student);
    if (next.kind === 'quest') {
      addRecommendation(activityForQuest(next.quest, null, progress, 'ยังมีข้อมูลไม่พอสำหรับระบุจุดอ่อน จึงแนะนำด่านพื้นฐานถัดไป'));
    }
  }

  for (const quest of QUESTS) {
    if (recommendations.length >= 3) break;
    if (!unlocked[quest.id] || isQuestPassed(progress[quest.id])) continue;
    addRecommendation(activityForQuest(quest, null, progress, 'ด่านนี้เปิดให้เรียนแล้วและเหมาะสำหรับเดินหน้าตามเส้นทางปัจจุบัน'));
  }

  return {
    evidenceStatus: ranked.length || unresolved.length ? 'verified-learning-data' : 'insufficient-data',
    weaknesses: ranked.slice(0, 3).map(entry => ({ id: entry.skill.id, label: entry.skill.label, evidenceCount: entry.mistakes + entry.lowQuests.length })),
    recommendations: recommendations.slice(0, 3),
  };
}

export const SMART_PATH_SKILLS = SKILLS.map(({ id, label, questIds }) => ({ id, label, questIds: [...questIds] }));
