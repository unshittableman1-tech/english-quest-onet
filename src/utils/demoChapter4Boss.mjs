import { freshBossDemo } from './freshBossDemo.mjs';
export function demoChapter4BossPool(quests,demo,isReady,random=Math.random) {
  if(demo!==true||!Array.isArray(quests)||typeof isReady!=='function') return null;
  const skills=['signs','sign_detective','directions','prepositions','map_escape','reading','reading_detective'];
  const ids=['signs','sign_detective','directions','prepositions_hub','map_escape','reading','reading_detective'];
  if(ids.some(id=>!quests.some(q=>q.id===id))) return null;
  const pool=freshBossDemo.filter(q=>q.chapter==='ch4');
  if(pool.length!==20||new Set(pool.map(q=>q.id)).size!==20||skills.some((s,i)=>pool.filter(q=>q.skill===s).length!==(i===6?2:3))||pool.some(q=>!isReady(q)||!Array.isArray(q.options)||!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)) return null;
  const result=[...pool];for(let i=result.length-1;i>0;i--){const n=Math.floor(random()*(i+1));if(!Number.isInteger(n)||n<0||n>i)return null;[result[i],result[n]]=[result[n],result[i]];}return result;
}
