import {supabase} from '../config/supabase';
const fail=code=>Object.assign(Error(code),{code});
const uuid=v=>typeof v==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(v);
export function validateOfficialExamSnapshot(r,actor,version){
 if(r?.contractVersion!=='onet-exam-v1'||!uuid(r.runId)||r.examId!=='onet-p6-2569'||r.version!==version||r.studentId!==actor.id||r.schoolId!==actor.school_id||!Array.isArray(r.answers)||r.answers.length!==32||r.answers.some(v=>v!==null&&(!Number.isInteger(v)||v<1||v>4))||!Number.isFinite(Date.parse(r.startedAt))||!Number.isFinite(Date.parse(r.expiresAt)))throw fail('exam_session_invalid');
 if(JSON.stringify(r).match(/"(?:answer_key|proposed_option|correct_option)"/))throw fail('exam_session_invalid');
 if(r.completedAt===null){
  if(r.result!==null||!Array.isArray(r.questions)||r.questions.length!==32||!Array.isArray(r.stimuli?.passages)||!r.stimuli?.assets||typeof r.stimuli.assets!=='object'||Array.isArray(r.stimuli.assets))throw fail('exam_session_invalid');
  const ids=new Set();for(const[i,q]of r.questions.entries()){if(!q.question_id||ids.has(q.question_id)||q.question_number!==i+1||typeof q.stem!=='string'||!Array.isArray(q.options)||q.options.length!==4||q.options.some((o,j)=>o.id!==String(j+1)||typeof o.text!=='string'))throw fail('exam_session_invalid');ids.add(q.question_id);}
 }else{
  const s=r.result;if(!Number.isFinite(Date.parse(r.completedAt))||s?.kind!=='independent_exam'||s.isDemo!==false||s.gradedBy!=='server'||s.examId!==r.examId||s.version!==version||s.total!==32||!Number.isInteger(s.correctCount)||s.correctCount<0||s.correctCount>32||s.score100!==s.correctCount*100/32)throw fail('exam_session_invalid');
 }
 return r;
}
// Fail closed by default. Callers explicitly enable only after selecting a verified transport.
export function createOfficialExamSession(actor,{client=supabase,enabled=false,version,exam}={}){
 let savedContent=null;
 const metadata={...exam,exam_id:'onet-p6-2569',version};
 const request=async(action,body={})=>{
  if(!enabled)throw fail('exam_session_blocked');
  if(!actor?.authVerified||actor.isDemo||actor.role!=='student'||!actor.auth_user_id||!actor.id||!actor.school_id||!version)throw fail('exam_session_forbidden');
  const verify=async()=>{const{data,error}=await client.auth.getUser();if(error||data?.user?.id!==actor.auth_user_id)throw fail('exam_session_forbidden');};await verify();
  if(action==='package')return{exam:metadata,questions:[],passages:[],assets:{}};
  const routes={start:['student_onet2569_start',{p_version:version,p_request:body.requestId}],resume:['student_onet2569_current',{p_run:body.runId}],save:['student_onet2569_save',{p_run:body.runId,p_answers:body.answers}],submit:['student_onet2569_submit',{p_run:body.runId,p_answers:body.answers,p_request:body.requestId}]};
  const route=routes[action];if(!route||action!=='start'&&!uuid(body.runId)||['start','submit'].includes(action)&&!uuid(body.requestId))throw fail('exam_session_invalid');
  if(['save','submit'].includes(action)&&(!Array.isArray(body.answers)||body.answers.length!==32||body.answers.some(v=>v!==null&&(!Number.isInteger(v)||v<1||v>4))))throw fail('exam_session_invalid');
  const{data,error}=await client.rpc(...route);if(error)throw fail(error.code==='42501'?'exam_session_forbidden':['PGRST202','42883','55000'].includes(error.code)?'exam_session_blocked':'exam_session_unavailable');await verify();
  const r=validateOfficialExamSnapshot(data,actor,version);
  if(r.completedAt===null)savedContent={exam:metadata,questions:r.questions.map(q=>({...q,visual_asset_ids:q.visual_asset_ids||[]})),passages:r.stimuli.passages,assets:r.stimuli.assets};
  return{...r,content:savedContent||{exam:metadata,questions:[],passages:[],assets:{}}};
 };
 return{request,storageKey:`eqai_onet2569_session:${actor?.auth_user_id}:${version}`,kind:'authenticated'};
}
