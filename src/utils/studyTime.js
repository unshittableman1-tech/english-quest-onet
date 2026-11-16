import { arenaOwner } from './arenaProgress';
const keyFor=student=>`eq_study_seconds_v1:${arenaOwner(student)}`;
export function readStudySeconds(student,storage=globalThis.localStorage){
 if(!arenaOwner(student))return null;
 try{const raw=storage.getItem(keyFor(student));if(!raw)return null;const data=JSON.parse(raw);return data.version===1&&Number.isSafeInteger(data.seconds)&&data.seconds>=0?data.seconds:null;}catch{return null;}
}
export function addStudySeconds(student,seconds,storage=globalThis.localStorage){
 if(!arenaOwner(student)||!Number.isInteger(seconds)||seconds<1||seconds>15)return;
 const next=(readStudySeconds(student,storage)||0)+seconds;
 try{storage.setItem(keyFor(student),JSON.stringify({version:1,seconds:next}));}catch{return;}
}
export function formatStudyTime(seconds){return seconds===null?'—':`${Math.floor(seconds/3600)} ชม. ${Math.floor(seconds%3600/60)} นาที`;}
