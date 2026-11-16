import { QUESTS } from '../data/questions';
import { CH1_MISSIONS } from '../data/missions/ch1_missions';
import { CH2_MISSIONS } from '../data/missions/ch2_missions';
import { CH3_MISSIONS } from '../data/missions/ch3_missions';
import { CH5_MISSIONS } from '../data/missions/ch5_missions';

export function getQuestMissions(questId) {
  return [CH1_MISSIONS, CH2_MISSIONS, CH3_MISSIONS, CH5_MISSIONS]
    .find(catalog => Array.isArray(catalog[questId]))?.[questId] || [];
}

export function isQuestAccessible(questId, unlocked) {
  return QUESTS.some(quest => quest.id === questId) && unlocked?.[questId] === true;
}

export function getAccessibleGameMission(questId, missionId, unlocked) {
  const quest = QUESTS.find(item => item.id === questId);
  if (!quest || quest.isExam || unlocked?.[questId] !== true) return null;
  return getQuestMissions(questId).find(mission => mission.id === missionId) || null;
}
