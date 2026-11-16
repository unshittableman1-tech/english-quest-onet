import { SKILL_PRACTICE_SCOPES } from '../data/skillPracticeScopes';
import { getQuestMissionSummary } from './questMissionPanel';

export function getSkillPracticeActions(quests = [], unlockedQuests = {}) {
  const catalog = Array.isArray(quests) ? quests : [];
  return Object.fromEntries(SKILL_PRACTICE_SCOPES.map(skill => {
    const candidates = skill.questIds.flatMap(id => {
      const matches = catalog.filter(quest => quest?.id === id);
      if (matches.length !== 1 || matches[0].isExam || matches[0].previewOnly) return [];
      const summary = getQuestMissionSummary(matches[0]);
      return summary.hasQuiz || summary.optionalActivities ? matches : [];
    });
    const quest = candidates.find(candidate => unlockedQuests?.[candidate.id] === true);
    return [skill.id, quest ? { kind: 'practice', questId: quest.id, page: quest.learningLive === true ? 'chapter3-learning' : 'mission-select',
      label: `ไปฝึก ${quest.name || quest.id}` }
      : { kind: 'map', label: 'ดูเส้นทางในแผนที่', hint: candidates.length ? 'ด่านฝึกยังล็อกตามเงื่อนไขเดิม' : 'ยังไม่มีด่านฝึกที่พร้อมเชื่อมในหมวดนี้' }];
  }));
}
