import { CH1_MISSIONS } from '../data/missions/ch1_missions';
import { CH2_MISSIONS } from '../data/missions/ch2_missions';
import { CH3_MISSIONS } from '../data/missions/ch3_missions';
import { CH5_MISSIONS } from '../data/missions/ch5_missions';
import { isPracticeQuestionReady } from './questionMedia';

const catalogs = [CH1_MISSIONS, CH2_MISSIONS, CH3_MISSIONS, CH5_MISSIONS];
const activities = {
  flashcard: { collection: 'cards', skill: 'เรียนรู้คำศัพท์', objective: 'พลิกการ์ดเรียนรู้คำศัพท์' },
  matching: { collection: 'pairs', skill: 'จับคู่คำ', objective: 'จับคู่คำกับความหมาย' },
  fill_blank: { collection: 'questions', skill: 'เติมคำ', objective: 'เติมคำในประโยค' },
  conversation: { collection: 'scenes', skill: 'บทสนทนา', objective: 'เลือกคำตอบในบทสนทนา' },
  story_tap: { collection: 'passages', skill: 'อ่านจับใจความ', objective: 'อ่านเรื่องแล้วตอบคำถาม' },
  rearrange: { collection: 'wordSentences', skill: 'เรียงประโยค', objective: 'เรียงคำให้เป็นประโยค' },
  spell: { collection: 'items', skill: 'สะกดคำ', objective: 'ฝึกสะกดคำศัพท์' },
  voice: { collection: 'sentences', skill: 'ฝึกออกเสียง', objective: 'ฝึกออกเสียงประโยค' },
};

export function getQuestMissionSummary(quest, missionCatalogs = catalogs) {
  if (!quest) return { objectives: [], skills: [], hasQuiz: false, optionalActivities: false };
  const source = missionCatalogs.find(catalog => Array.isArray(catalog[quest.id]))?.[quest.id] || [];
  const missions = quest.isExam ? [] : source.filter(mission => {
    const activity = activities[mission.type];
    return activity && ((Array.isArray(mission[activity.collection]) && mission[activity.collection].length > 0)
      || (mission.type === 'rearrange' && Array.isArray(mission.sentences) && mission.sentences.length > 0));
  });
  const objectives = [...new Set(missions.map(mission => mission.subtitle?.trim() || activities[mission.type].objective))].slice(0, 3);
  const skills = [...new Set(missions.map(mission => activities[mission.type].skill))].slice(0, 3);
  const hasQuiz = Array.isArray(quest.questions) && (quest.isExam
    ? quest.questions.length > 0
    : quest.questions.some(isPracticeQuestionReady));
  if (!objectives.length && hasQuiz) objectives.push(quest.isExam ? 'ทำแบบทดสอบท้ายบท' : 'ฝึกตอบคำถามของด่าน');
  if (!skills.length && hasQuiz) skills.push('ตอบคำถาม');
  return { objectives, skills, hasQuiz, optionalActivities: missions.length > 0 };
}
