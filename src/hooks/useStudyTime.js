import { useEffect } from 'react';
import { arenaOwner } from '../utils/arenaProgress';
import { addStudySeconds } from '../utils/studyTime';
const pages=new Set(['map','lesson','quiz','vocab-drill','exam','final-exam','arena','real-simulator']);
export default function useStudyTime(student,page){
 const owner=arenaOwner(student);
 useEffect(()=>{
  if(!owner||!pages.has(page))return;
  let previous=performance.now(),lastInput=previous;
  const touch=()=>{lastInput=performance.now();};
  const tick=()=>{const now=performance.now(),elapsed=now-previous;previous=now;
   if(document.visibilityState==='visible'&&document.hasFocus()&&now-lastInput<60000&&elapsed>0&&elapsed<=15000)addStudySeconds(student,Math.floor(elapsed/1000));};
  const pause=()=>{previous=performance.now();};
  const timer=window.setInterval(tick,10000);
  window.addEventListener('pointerdown',touch);window.addEventListener('keydown',touch);
  window.addEventListener('focus',pause);document.addEventListener('visibilitychange',pause);
  return()=>{tick();window.clearInterval(timer);window.removeEventListener('pointerdown',touch);window.removeEventListener('keydown',touch);window.removeEventListener('focus',pause);document.removeEventListener('visibilitychange',pause);};
 },[owner,page]);
}
