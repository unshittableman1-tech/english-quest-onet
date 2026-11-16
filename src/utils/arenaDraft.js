import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { arenaOwner } from './arenaProgress';
const fail=()=>new Error('arena_draft_unavailable');
const key=(student,mode)=>`eq_arena_draft_v1:${arenaOwner(student)}:${mode}`;
const fingerprint=q=>bytesToHex(sha256(new TextEncoder().encode(JSON.stringify([
 q.id,q.itemVersion || q.version || null,q.question,q.options,q.answer,q.passage || null,q.image || null,q.stimuli || null,
]))));
export function saveArenaDraft(student,mode,{questions,answers,startedAt,timeLimit,attemptId,finalizedAt=null},storage=globalThis.localStorage){
 if(!arenaOwner(student))return;
 if(!startedAt||!questions.length)return;
 const draft={version:1,mode,attemptId,startedAt,timeLimit,finalizedAt,answers,
  items:questions.map(q=>({id:q.id,fingerprint:fingerprint(q),order:q.shuffledOptions.map(o=>o.originalIndex)}))};
 try{storage.setItem(key(student,mode),JSON.stringify(draft));}catch{throw fail();}
}
export function loadArenaDraft(student,mode,pool,timeLimit,count,storage=globalThis.localStorage){
 if(!arenaOwner(student))return null;
 try{
  const raw=storage.getItem(key(student,mode));if(!raw)return null;
  const d=JSON.parse(raw);
  if(d.version!==1||d.mode!==mode||typeof d.attemptId!=='string'||!/^att_[a-zA-Z0-9-]+$/.test(d.attemptId)||
   !Number.isFinite(d.startedAt)||d.startedAt<=0||d.timeLimit!==timeLimit||!Number.isInteger(timeLimit)||timeLimit<=0||
   d.finalizedAt!==null&&(!Number.isFinite(d.finalizedAt)||d.finalizedAt<d.startedAt)||
   !Array.isArray(d.items)||d.items.length!==count||new Set(d.items.map(i=>i.id+':'+i.fingerprint)).size!==count||
   !d.answers||Array.isArray(d.answers)||typeof d.answers!=='object')throw fail();
  const available=new Map();
  for(const q of pool){if(!available.has(q.id))available.set(q.id,[]);available.get(q.id).push(q);}
  const questions=d.items.map(item=>{
   const q=available.get(item.id)?.find(candidate=>fingerprint(candidate)===item.fingerprint);
   if(!q||fingerprint(q)!==item.fingerprint||!Array.isArray(item.order)||item.order.length!==4||
    [...item.order].sort().join(',')!=='0,1,2,3')throw fail();
   return {...q,shuffledOptions:item.order.map(originalIndex=>({text:q.options[originalIndex],originalIndex}))};
  });
  if(Object.entries(d.answers).some(([i,answer])=>!/^\d+$/.test(i)||Number(i)>=count||!Number.isInteger(answer)||answer<0||answer>3))throw fail();
  return {...d,questions};
 }catch{throw fail();}
}
export function clearArenaDraft(student,mode,storage=globalThis.localStorage){
 if(!arenaOwner(student))return;
 try{storage.removeItem(key(student,mode));}catch{/* A persisted queue receipt still prevents duplicate delivery. */}
}
