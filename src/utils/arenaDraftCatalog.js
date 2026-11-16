import { getFinalExamPool, weaknessMockBySkill } from '../data/chapter4_questions';
import { QUESTS } from '../data/questions';
import { isSingleStepMcq } from './questionFormat';
import { isPracticeQuestionReady } from './questionMedia';

// A random paper is not the canonical catalog: another sample on reload may
// omit the saved questions. Validate against eligible source items instead.
export function arenaDraftCatalog(mode,currentPool) {
  if(mode==='final_exam')return getFinalExamPool(Number.MAX_SAFE_INTEGER);
  if(mode==='onet_year_2568'||mode==='weakness_mock')return [
    ...currentPool,...getFinalExamPool(Number.MAX_SAFE_INTEGER),
    ...QUESTS.flatMap(quest=>quest.questions || []),...Object.values(weaknessMockBySkill).flat(),
  ].filter(q=>isSingleStepMcq(q)&&isPracticeQuestionReady(q));
  return currentPool;
}
