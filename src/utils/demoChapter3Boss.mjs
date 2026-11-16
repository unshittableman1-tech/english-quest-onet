import { freshBossDemo } from './freshBossDemo.mjs';
const excluded = new Set(['onet_2552_05_fred_home','onet_2552_06_fred_knife']);
export function demoChapter3BossPool(quests,demo) {
  if (demo !== true || !Array.isArray(quests)) return null;
  const boss=quests.find(q=>q.id==='strategy_boss'); if (!boss) return null;
  const pool=[...(boss.questions||[]).filter(q=>!excluded.has(q.id)),...(boss.supplementalBossQuestions||[]),...freshBossDemo.filter(q=>q.chapter==='ch3')];
  return pool.length===20 && new Set(pool.map(q=>q.id)).size===20 && pool.every(q=>Array.isArray(q.options||q.choices)&&Number.isInteger(q.answer??q.correctIndex)) ? pool : null;
}
