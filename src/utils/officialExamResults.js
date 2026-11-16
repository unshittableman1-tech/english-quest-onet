import {supabase} from '../config/supabase';
export const officialExamResultsEnabled=import.meta.env?.VITE_ONET_2569_RESULTS==='true';
const fail=code=>Object.assign(Error(code),{code});
export function validateExamResults(data,{schoolId,studentId=null}){
 if(data?.contractVersion!=='onet-teacher-v1'||data.schoolId!==schoolId||data.studentId!==studentId||data.truncated!==false||data.reportingPolicy!=='first_independent_attempt_per_student_exam_version'||!Array.isArray(data.attempts))throw fail('exam_results_invalid');
 const ids=new Set();for(const a of data.attempts){const r=a.result;
  if(!a.attemptId||ids.has(a.attemptId)||a.schoolId!==schoolId||!a.studentId||studentId&&a.studentId!==studentId||a.examId!=='onet-p6-2569'||typeof a.version!=='string'||!Number.isFinite(Date.parse(a.completedAt))
   ||r?.kind!=='independent_exam'||r.isDemo!==false||r.gradedBy!=='server'||r.examId!==a.examId||r.version!==a.version||r.total!==32||!Number.isInteger(r.correctCount)||r.correctCount<0||r.correctCount>32||r.score100!==r.correctCount*100/32||!Array.isArray(r.items)||r.items.length!==32)throw fail('exam_results_invalid');
  const numbers=new Set();for(const item of r.items){if(!Number.isInteger(item.questionNumber)||item.questionNumber<1||item.questionNumber>32||numbers.has(item.questionNumber)||typeof item.correct!=='boolean'||item.selectedOption!==null&&(!Number.isInteger(item.selectedOption)||item.selectedOption<1||item.selectedOption>4)||!Array.isArray(item.skillTags)||item.skillTags.some(tag=>typeof tag!=='string'))throw fail('exam_results_invalid');numbers.add(item.questionNumber);}
  if(r.items.filter(i=>i.correct).length!==r.correctCount)throw fail('exam_results_invalid');ids.add(a.attemptId);
 }return data;
}
export async function fetchExamResults(actor,{schoolId,studentId=null},client=supabase,{enabled=officialExamResultsEnabled}={}){
 if(!enabled)throw fail('exam_results_blocked');
 if(!actor?.authVerified||actor.isDemo||!actor.user_id||!['teacher','super_admin'].includes(actor.role)||!schoolId)throw fail('exam_results_forbidden');
 const verify=async()=>{const{data,error}=await client.auth.getUser();if(error||data?.user?.id!==actor.user_id)throw fail('exam_results_forbidden');};await verify();
 const{data,error}=await client.rpc('staff_onet2569_results',{p_school:schoolId,p_student:studentId});
 if(error)throw fail(error.code==='42501'?'exam_results_forbidden':['PGRST202','42883','55000'].includes(error.code)?'exam_results_blocked':'exam_results_unavailable');await verify();return validateExamResults(data,{schoolId,studentId});
}
export function buildExamReport(snapshot,{version,studentIds}={}){
 const data=validateExamResults(snapshot,{schoolId:snapshot.schoolId,studentId:snapshot.studentId});
 const history=data.attempts.filter(a=>(!version||a.version===version)&&(!studentIds||studentIds.includes(a.studentId))).sort((a,b)=>a.completedAt.localeCompare(b.completedAt)||a.attemptId.localeCompare(b.attemptId));
 const first=new Map();for(const a of history){const key=[a.studentId,a.examId,a.version].join(':');if(!first.has(key))first.set(key,a);}
 const rows=[...first.values()],histogram=[0,0,0,0,0];for(const a of rows)histogram[Math.min(4,Math.floor(a.result.score100/20))]++;
 return {history,rows,attempted:rows.length,average:rows.length?rows.reduce((s,a)=>s+a.result.score100,0)/rows.length:null,histogram,
  questions:Array.from({length:32},(_,i)=>({number:i+1,correct:rows.filter(a=>a.result.items.find(q=>q.questionNumber===i+1).correct).length,incorrect:rows.filter(a=>!a.result.items.find(q=>q.questionNumber===i+1).correct).length})),
  needingReview:rows.filter(a=>a.result.correctCount<32).map(a=>a.studentId)};
}
