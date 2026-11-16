import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { listPracticeDrafts, reviewPracticeDraft } from '../../utils/personalizedPracticeReview';

const STATUS = {
  pending_review: ['รอตรวจ', 'bg-amber-400/10 text-amber-300 border-amber-400/30'],
  approved: ['อนุมัติแล้ว', 'bg-emerald-400/10 text-emerald-300 border-emerald-400/30'],
  rejected: ['ไม่อนุมัติ', 'bg-rose-400/10 text-rose-300 border-rose-400/30'],
};

export default function TeacherPracticeReview({ schoolId, showToast }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPracticeDrafts(schoolId);
      setDrafts(Array.isArray(result?.drafts) ? result.drafts : []);
      setUnavailable(false);
    } catch {
      setDrafts([]);
      setUnavailable(true);
    } finally { setLoading(false); }
  }, [schoolId]);

  useEffect(() => { load(); }, [load]);

  async function decide(draft, decision) {
    const reason = decision === 'rejected' ? window.prompt('ระบุเหตุผลสั้น ๆ เพื่อให้ตรวจสอบย้อนหลังได้') : '';
    if (decision === 'rejected' && !reason?.trim()) return;
    setBusyId(draft.id);
    try {
      await reviewPracticeDraft(schoolId, draft.id, decision, reason);
      showToast?.(decision === 'approved' ? 'อนุมัติชุดฝึกแล้ว (ไม่มี XP)' : 'บันทึกการไม่อนุมัติแล้ว', 'success');
      await load();
    } catch (error) { showToast?.(error.message || 'ไม่สามารถบันทึกผลตรวจได้', 'error'); }
    finally { setBusyId(null); }
  }

  return <section className="space-y-5" aria-labelledby="practice-review-title">
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-sky-400">AI Personalized Practice</p><h3 id="practice-review-title" className="mt-1 text-xl font-black text-white">ตรวจชุดฝึกก่อนส่งให้นักเรียน</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">ตรวจโจทย์ ตัวเลือก เฉลย คำอธิบาย และระดับความยากทุกข้อ เนื้อหาจะไม่ถึงนักเรียนจนกว่าครูในโรงเรียนเดียวกันจะอนุมัติ และชุดฝึกนี้ไม่ให้ XP</p></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-300"><ShieldCheck size={16}/>Teacher Review Required</span>
      </div>
    </div>
    {unavailable && <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100" role="status"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0"/><div><h4 className="font-black">พื้นที่จัดเก็บ Draft ยังไม่เปิดใช้</h4><p className="mt-1 text-sm leading-6 text-amber-100/80">หน้า Review พร้อมแล้ว แต่ระบบจะไม่แสดงหรืออนุมัติเนื้อหาจนกว่า migration และ RLS proposal จะได้รับอนุมัติและติดตั้งใน Local Staging</p></div></div></div>}
    <div className="flex justify-end"><button onClick={load} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''}/>รีเฟรชรายการ</button></div>
    {!loading && !unavailable && drafts.length === 0 && <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">ยังไม่มีชุดฝึกที่รอตรวจสำหรับโรงเรียนนี้</div>}
    {drafts.map(draft => <article key={draft.id} className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h4 className="font-black text-white">{draft.skillLabel || draft.skill}</h4><p className="mt-1 text-xs text-slate-400">{draft.questions.length} ข้อ · สร้าง {new Date(draft.createdAt).toLocaleString('th-TH')}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS[draft.status]?.[1] || STATUS.pending_review[1]}`}>{STATUS[draft.status]?.[0] || draft.status}</span></div>
      <ol className="mt-5 space-y-4">{draft.questions.map((question, index) => <li key={question.id} className="rounded-xl border border-slate-700/80 bg-slate-950/70 p-4"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-white">ข้อ {index + 1}: {question.prompt}</strong><span className="text-xs font-bold text-sky-300">{question.difficulty}</span></div>{question.passage && <p className="mt-2 rounded-lg bg-slate-800 p-3 text-sm leading-6 text-slate-300">{question.passage}</p>}<ul className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option, optionIndex) => <li key={optionIndex} className={`rounded-lg border px-3 py-2 text-sm ${optionIndex === question.answerIndex ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 text-slate-300'}`}>{String.fromCharCode(65 + optionIndex)}. {option}</li>)}</ul><p className="mt-3 text-sm leading-6 text-slate-300"><span className="font-bold text-violet-300">คำอธิบาย:</span> {question.explanation}</p></li>)}</ol>
      {draft.status === 'pending_review' && <div className="mt-5 flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:justify-end"><button disabled={busyId === draft.id} onClick={() => decide(draft, 'rejected')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-500/40 px-4 font-bold text-rose-300 hover:bg-rose-500/10"><XCircle size={18}/>ไม่อนุมัติ</button><button disabled={busyId === draft.id} onClick={() => decide(draft, 'approved')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 font-black text-slate-950 hover:bg-emerald-400"><CheckCircle2 size={18}/>อนุมัติชุดฝึก</button></div>}
    </article>)}
  </section>;
}
