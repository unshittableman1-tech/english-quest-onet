import { supabase } from '../config/supabase';
import { canManageSchoolStudents } from './roleAccess';

const fail = code => Object.assign(new Error(code), { code });
const modes = new Set(['mini_mock_arena','speed_mock_challenge','skill_mixed_mock','weakness_mock','full_mock_test','final_exam_simulation','onet_year_2565','onet_year_2566','onet_year_2567','onet_year_2568','final_exam']);
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => (typeof value === 'string' || typeof value === 'number') && Number.isFinite(new Date(value).getTime());
export const canSyncArena = student => Boolean(student?.authVerified && !student.isDemo && student.role === 'student' && student.id && student.auth_user_id && student.school_id);
export const arenaOwner = student => canSyncArena(student) ? JSON.stringify([student.school_id,student.auth_user_id,student.id]) : null;
const keyFor = student => `eq_arena_outbox_v1:${arenaOwner(student)}`;
const notify = name => globalThis.window?.dispatchEvent(new Event(name));

export function makeArenaSubmission(attempt) {
  if (!attempt || !text(attempt.attemptId) || !/^[a-zA-Z0-9:_-]+$/.test(attempt.attemptId) || !modes.has(attempt.mode) ||
      !Number.isInteger(attempt.total) || attempt.total < 1 || attempt.total > 200 ||
      !Number.isInteger(attempt.score) || attempt.score < 0 || attempt.score > attempt.total ||
      !Number.isFinite(attempt.percent) || Math.abs(attempt.percent-attempt.score/attempt.total*100) > 0.51 ||
      !Number.isInteger(attempt.timeUsed) || attempt.timeUsed < 0 || attempt.timeUsed > 14400 ||
      !date(attempt.startedAt) || !date(attempt.submittedAt) || new Date(attempt.startedAt) > new Date(attempt.submittedAt) ||
      !text(attempt.version || 'legacy-runtime-v1')) throw fail('arena_attempt_invalid');
  return { attemptId:attempt.attemptId, mode:attempt.mode, version:attempt.version || 'legacy-runtime-v1',
    score:attempt.score,total:attempt.total,percent:attempt.score/attempt.total*100,timeUsed:attempt.timeUsed,
    startedAt:new Date(attempt.startedAt).toISOString(),submittedAt:new Date(attempt.submittedAt).toISOString() };
}

export function readArenaQueue(student, storage = globalThis.localStorage) {
  if (!arenaOwner(student)) return [];
  try {
    const raw=storage.getItem(keyFor(student));
    if (!raw) return [];
    const value=JSON.parse(raw);
    if(value.version!==1 || !Array.isArray(value.entries) || value.entries.length>200 ||
      value.entries.some(e=>!e || !['pending','synced','conflict'].includes(e.state) || !e.submission || !e.submission.attemptId) ||
      new Set(value.entries.map(e=>e.submission.attemptId)).size!==value.entries.length) throw fail('arena_storage_invalid');
    value.entries.forEach(e=>makeArenaSubmission(e.submission));
    return value.entries;
  } catch { throw fail('arena_storage_unavailable'); }
}
function writeQueue(student, entries, storage) {
  try {storage.setItem(keyFor(student),JSON.stringify({version:1,entries}));}
  catch {throw fail('arena_storage_unavailable');}
  notify('arena-progress-changed');
}
export function queueArenaAttempt(student, attempt, storage = globalThis.localStorage) {
  if (!canSyncArena(student)) return null;
  const submission=makeArenaSubmission(attempt), entries=readArenaQueue(student,storage);
  const existing=entries.find(e=>e.submission.attemptId===submission.attemptId);
  if(existing){if(JSON.stringify(existing.submission)!==JSON.stringify(submission)) throw fail('arena_request_conflict');return existing;}
  if(entries.filter(e=>e.state!=='synced').length>=100) throw fail('arena_queue_full');
  const next={submission,state:'pending',receipt:null,lastError:null};
  writeQueue(student,[...entries.filter(e=>e.state==='synced').slice(-99),...entries.filter(e=>e.state!=='synced'),next],storage);
  notify('arena-progress-queued');return next;
}

export function validateArenaProgress(data,{schoolId,studentId=null}) {
  if(data?.contractVersion!=='arena-progress-v1' || data.schoolId!==schoolId || data.studentId!==studentId ||
     typeof data.truncated!=='boolean' || !Array.isArray(data.attempts) || data.attempts.length>1000) throw fail('arena_results_invalid');
  const seen=new Set();
  const attempts=data.attempts.map(row=>{
    if(!row || row.schoolId!==schoolId || !text(row.studentId) || studentId && row.studentId!==studentId ||
      !['server','client_reported'].includes(row.grading) || !date(row.receivedAt)) throw fail('arena_results_invalid');
    let value;
    try {
      value=makeArenaSubmission({...row,mode:['chapter2_boss','strategy_boss','finalboss'].includes(row.mode)?'mini_mock_arena':row.mode});
      if(!modes.has(row.mode) && !(['chapter2_boss','strategy_boss','finalboss'].includes(row.mode)&&row.grading==='server'))throw Error();
    }catch{throw fail('arena_results_invalid');}
    const key=`${row.studentId}:${value.attemptId}`;
    if(seen.has(key)) throw fail('arena_results_invalid');seen.add(key);
    return {...value,mode:row.mode,schoolId,studentId:row.studentId,receivedAt:row.receivedAt,grading:row.grading};
  });
  return {...data,attempts};
}
async function verify(client,id) {
  const {data,error}=await client.auth.getUser();
  if(error || data?.user?.id!==id) throw fail('arena_session_changed');
}
async function studentRpc(student,name,args,client) {
  if(!canSyncArena(student)) throw fail('arena_student_forbidden');
  await verify(client,student.auth_user_id);
  const {data,error}=await client.rpc(name,{...args,expected_auth_user_id:student.auth_user_id});
  if(error)throw Object.assign(fail(['PGRST202','42883'].includes(error.code)?'arena_sync_blocked':'arena_sync_failed'),{cause:error});
  await verify(client,student.auth_user_id);
  return validateArenaProgress(data,{schoolId:student.school_id,studentId:student.id});
}
export const fetchStudentArenaProgress = (student,client=supabase) => studentRpc(student,'student_arena_progress',{},client);
export async function fetchTeacherArenaProgress(actor,schoolId,studentId=null,client=supabase) {
  if(!actor?.authVerified || actor.isDemo || !actor.user_id || !canManageSchoolStudents(actor,schoolId))throw fail('arena_staff_forbidden');
  await verify(client,actor.user_id);
  const {data,error}=await client.rpc('staff_arena_progress',{p_school:schoolId,p_student:studentId});
  if(error)throw fail(['PGRST202','42883'].includes(error.code)?'arena_sync_blocked':'arena_results_unavailable');
  await verify(client,actor.user_id);
  return validateArenaProgress(data,{schoolId,studentId});
}
const inFlight=new Map();
export async function flushArenaQueue(student,client=supabase,storage=globalThis.localStorage) {
  const owner=arenaOwner(student);if(!owner)return;
  if(inFlight.has(owner))return inFlight.get(owner);
  const work=(async()=>{
    const pending=readArenaQueue(student,storage).filter(e=>e.state==='pending').slice(0,20);
    for(const entry of pending){
      let receipt=null,error=null;
      try {
        const result=await studentRpc(student,'student_record_arena_attempt',{p_attempt:entry.submission},client);
        receipt=result.attempts.find(r=>r.attemptId===entry.submission.attemptId);
        if(!receipt || receipt.grading!=='client_reported' || JSON.stringify(makeArenaSubmission(receipt))!==JSON.stringify(entry.submission))throw fail('arena_receipt_invalid');
      }catch(e){error=e;}
      if(error?.code==='arena_session_changed')throw error;
      const current=readArenaQueue(student,storage);
      writeQueue(student,current.map(e=>e.submission.attemptId===entry.submission.attemptId?{
        ...e,state:receipt&&!error?'synced':error?.cause?.code==='23505'?'conflict':'pending',
        receipt:error?null:receipt,lastError:error?.message || null,
      }:e),storage);
      if(error)break;
    }
  })();
  inFlight.set(owner,work);
  try{return await work;}finally{inFlight.delete(owner);}
}

export function buildArenaProgressOverview(snapshot,queue=[]) {
  const byId=new Map();
  for(const e of queue){
    const p=e.state==='synced'&&e.receipt?e.receipt:e.submission;
    byId.set(p.attemptId,{...p,grading:'client_reported',syncState:e.state,lastError:e.lastError});
  }
  for(const row of snapshot?.attempts || [])byId.set(row.attemptId,{...row,syncState:'synced'});
  const attempts=[...byId.values()].sort((a,b)=>Date.parse(b.submittedAt)-Date.parse(a.submittedAt)||a.attemptId.localeCompare(b.attemptId));
  return {attempts,latest:attempts[0] || null,pending:attempts.filter(a=>a.syncState==='pending').length,
    conflicts:attempts.filter(a=>a.syncState==='conflict').length,truncated:snapshot?.truncated===true};
}
