import { useMemo, useRef } from 'react';
import { Users, ChartNoAxesCombined, ClipboardCheck, TriangleAlert, ArrowRight, Download, BookOpenCheck, X } from 'lucide-react';
import { getTeacherOverview, getReviewTasks } from '../../utils/teacherAnalytics';
import { getStudentCurrentPercent, getStudentPreTestPercent, getClassGrowth } from '../../utils/scoring';

function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob(['\ufeff', content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportRiskStudents(students) {
  const rows = [['ชื่อ', 'ชั้น', 'เลขที่', 'ระดับ', 'เหตุผล'], ...students.map(s => [s.name, s.class, s.number, s.severity, s.reasons.join('; ')])];
  const csv = rows.map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
  downloadFile('early-warning.csv', csv, 'text/csv;charset=utf-8');
}

export default function TeacherOverview({ students, preTestAvg, currentAvg, riskStudents, Chart, onWarning, onExam, onStudent }) {
  const summary = useMemo(() => getTeacherOverview(students), [students]);
  const reviewDialog = useRef(null);
  const measured = students.filter(s => getStudentCurrentPercent(s) !== null).length;
  const pretested = students.filter(s => getStudentPreTestPercent(s) !== null).length;
  const growth = getClassGrowth(students);
  const stats = [
    { label: 'คะแนนปัจจุบัน', value: measured ? `${currentAvg}%` : '—', sub: growth !== null ? `${growth >= 0 ? '+' : ''}${growth} จุดจาก Pre-test` : 'ยังไม่มีคะแนนเปรียบเทียบ', Icon: ChartNoAxesCombined, primary: true },
    { label: 'จำนวนนักเรียน', value: students.length, sub: `${measured} คนมีผลการเรียน`, Icon: Users },
    { label: 'Pre-test เฉลี่ย', value: pretested ? `${preTestAvg}%` : '—', sub: `คำนวณได้ ${pretested} คน`, Icon: ClipboardCheck },
    { label: 'กลุ่มที่ต้องติดตาม', value: riskStudents.length, sub: `ความเสี่ยงสูง ${riskStudents.filter(s => s.severity === 'high').length} คน`, Icon: TriangleAlert },
  ];
  const downloadReviewPlan = () => {
    const content = riskStudents.map(s => `${s.name} · ${s.class} · เลขที่ ${s.number || '-'}\n${s.reasons.join(', ')}\n${getReviewTasks(s).map((t, i) => `${i + 1}. ${t}`).join('\n')}`).join('\n\n');
    downloadFile('review-plan.txt', content, 'text/plain;charset=utf-8');
  };
  return (
    <div className="teacher-overview space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, sub, Icon, primary }) => (
          <div key={label} className={`teacher-kpi rounded-lg border p-4 ${primary ? 'teacher-kpi-primary border-emerald-500/40' : 'border-slate-700'}`}>
            <div className="flex items-start justify-between gap-2"><p className="text-xs font-medium text-slate-400">{label}</p><Icon size={17} className={primary ? 'text-emerald-400' : 'text-slate-400'} aria-hidden="true" /></div>
            <p className={`mt-3 text-3xl font-bold ${primary ? 'text-emerald-400' : 'text-white'}`}>{value}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{sub}</p>
          </div>
        ))}
      </div>

      <section className="teacher-insight flex flex-col justify-between gap-4 border-y border-slate-700 py-5 sm:flex-row sm:items-center" aria-labelledby="follow-up-title">
        <div>
          <h3 id="follow-up-title" className="text-base font-semibold text-white">{riskStudents.length ? `ติดตามนักเรียน ${riskStudents.length} คน` : 'ยังไม่พบนักเรียนกลุ่มเสี่ยงจากข้อมูลที่มี'}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{riskStudents[0]?.reasons[0] || `${students.length - measured} คนยังไม่มีผลการเรียน`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onWarning} className="teacher-action inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-600 px-3 text-sm font-semibold text-slate-200">ดูรายชื่อ <ArrowRight size={16} aria-hidden="true" /></button>
          <button disabled={!riskStudents.length} onClick={() => reviewDialog.current.showModal()} className="teacher-action inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-600 px-3 text-sm font-semibold text-slate-200 disabled:opacity-40"><BookOpenCheck size={16} aria-hidden="true" />สร้างแผนทบทวน</button>
          <button disabled={!riskStudents.length} onClick={() => exportRiskStudents(riskStudents)} className="teacher-action inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600 text-slate-200 disabled:opacity-40" title="ส่งออกรายชื่อนักเรียนที่ต้องติดตาม" aria-label="ส่งออกรายชื่อนักเรียนที่ต้องติดตาม"><Download size={17} /></button>
        </div>
      </section>

      {students.length === 0 ? (
        <div className="py-8 text-center"><Users className="mx-auto mb-3 text-slate-500" size={28} /><p className="text-sm text-slate-400">ยังไม่มีนักเรียนในห้องนี้</p><button onClick={onStudent} className="mt-4 text-sm font-semibold text-sky-400">จัดการรายชื่อนักเรียน</button></div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1.15fr]">
          <section aria-labelledby="score-distribution-title" className="min-w-0">
            <h3 id="score-distribution-title" className="mb-4 text-sm font-semibold text-white">ระดับผลการเรียน</h3>
            <div className="flex flex-wrap items-center gap-5 xl:flex-col xl:items-start">
              <Chart data={summary.distribution} size={124} thickness={18} label={`${students.length}`} sublabel="คน" />
              <ul className="min-w-0 flex-1 space-y-2.5 text-xs xl:w-full">
                {summary.distribution.map(d => <li key={d.label} className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2 text-slate-300"><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />{d.label}</span><span className="font-semibold text-slate-200">{d.value} คน</span></li>)}
              </ul>
            </div>
          </section>
          <section aria-labelledby="quest-completion-title" className="min-w-0 border-t border-slate-700 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <h3 id="quest-completion-title" className="mb-4 text-sm font-semibold text-white">ความก้าวหน้าการเรียน</h3>
            <p className="text-3xl font-bold text-emerald-400">{summary.completionPct}%</p>
            <div className="my-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-emerald-500" style={{ width: `${summary.completionPct}%` }} /></div>
            <p className="text-sm text-slate-300">ผ่านแล้ว {summary.completed.toLocaleString()} จาก {summary.total.toLocaleString()} ด่าน</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">รวม Quest และสนามฝึกสอบของนักเรียนทุกคนในห้องที่เลือก</p>
            <button onClick={onExam} className="teacher-action mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-600 px-3 text-sm font-semibold text-slate-200">ศูนย์สอบปลายภาค <ArrowRight size={16} aria-hidden="true" /></button>
          </section>
          <section aria-labelledby="weak-quests-title" className="min-w-0 border-t border-slate-700 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
            <h3 id="weak-quests-title" className="mb-1 text-sm font-semibold text-white">ด่านที่ควรทบทวนก่อน</h3>
            <p className="mb-4 text-xs text-slate-400">ผู้ที่ทำแล้วและยังไม่ผ่าน 70%</p>
            {summary.weakQuests.length ? <ol className="space-y-4">{summary.weakQuests.slice(0, 5).map((q, index) => (
              <li key={q.id}>
                <div className="flex items-start justify-between gap-3 text-xs"><span className="min-w-0 break-words text-slate-200"><span className="mr-2 text-slate-500">{index + 1}.</span>{q.name}</span><span className="shrink-0 font-semibold text-amber-400">{q.count} คน</span></div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-amber-500" style={{ width: `${q.count / students.length * 100}%` }} /></div>
              </li>
            ))}</ol> : <p className="py-5 text-sm text-slate-400">ยังไม่มีด่านที่ต้องทบทวนจากผลที่บันทึกไว้</p>}
          </section>
        </div>
      )}

      <dialog ref={reviewDialog} className="teacher-review-dialog max-h-[85svh] max-w-2xl overflow-y-auto rounded-lg border border-slate-600 bg-slate-900 p-0 text-slate-100" aria-labelledby="review-plan-title" onClick={event => { if (event.target === reviewDialog.current) reviewDialog.current.close(); }}>
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-900 p-4"><h3 id="review-plan-title" className="font-semibold">แผนทบทวน · {riskStudents.length} คน</h3><button onClick={() => reviewDialog.current.close()} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-800" aria-label="ปิดแผนทบทวน" title="ปิด"><X size={18} /></button></div>
        <div className="divide-y divide-slate-700 px-5">{riskStudents.map(s => <section key={s.id} className="py-5"><h4 className="text-sm font-bold">{s.name} <span className="font-normal text-slate-400">· {s.class} · เลขที่ {s.number || '-'}</span></h4><ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-300">{getReviewTasks(s).map(task => <li key={task}>{task}</li>)}</ol></section>)}</div>
        <div className="border-t border-slate-700 p-4"><button onClick={downloadReviewPlan} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-sky-700 px-4 text-sm font-semibold text-white"><Download size={16} />ดาวน์โหลดแผน</button></div>
      </dialog>
    </div>
  );
}
