import { useEffect, useMemo, useRef, useState } from 'react';
import { createVocabularyAssignment, fetchAssignmentCatalog, fetchStaffAssignments } from '../../utils/vocabPracticeCloud';

const labels = { assigned: 'ยังไม่เริ่ม', in_progress: 'กำลังทำ', submitted: 'ส่งแล้ว' };
export default function TeacherVocabularyAssignments({ schoolId, student, evidenceRows }) {
  const [catalog, setCatalog] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [title, setTitle] = useState('ทบทวนคำศัพท์เฉพาะตัว');
  const [instructions, setInstructions] = useState('เรียนคำศัพท์ แล้วตรวจความหมายให้ครบทุกคำ');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [revision, setRevision] = useState(0);
  const request = useRef(null);
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    Promise.all([fetchAssignmentCatalog(), fetchStaffAssignments(schoolId, student.id)]).then(([words, assignments]) => {
      if (!cancelled) { setCatalog(words); setTasks(assignments); setStatus('ready'); }
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [schoolId, student.id, revision]);
  const groups = useMemo(() => [...new Set(catalog.flatMap(word => word.groups))].sort(), [catalog]);
  const filtered = catalog.filter(word => (!group || word.groups.includes(group)) && `${word.word} ${word.meaningTh}`.toLowerCase().includes(query.toLowerCase().trim()));
  const changeSelected = next => { request.current = null; setSelected(next); };
  const weakIds = new Set(evidenceRows.filter(row => row.latest_independent_correct === false).map(row => row.word_id));
  async function assign(event) {
    event.preventDefault();
    const payload = { title: title.trim(), instructions, dueDate, wordIds: [...selected].sort() };
    const fingerprint = JSON.stringify(payload);
    if (request.current?.fingerprint !== fingerprint) request.current = { fingerprint, id: crypto.randomUUID() };
    setStatus('saving'); setMessage('');
    try {
      await createVocabularyAssignment(schoolId, student.id, { ...payload, id: request.current.id });
      setMessage(`มอบหมายให้ ${student.name} แล้ว ${selected.size} คำ/วลี`);
      setSelected(new Set()); request.current = null; setRevision(previous => previous + 1);
    } catch { setStatus('ready'); setMessage('ยังยืนยันการมอบหมายไม่ได้ กดลองอีกครั้งได้โดยไม่สร้างงานซ้ำ'); }
  }
  return <section className="rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100" aria-label="มอบหมายคำศัพท์รายบุคคล">
    <h4 className="text-lg font-bold">มอบหมายซ่อมเสริมให้ {student.name}</h4>
    <p className="my-2 text-sm text-slate-300">เลือกได้จากศัพท์ทุกหมวดและศัพท์เฉพาะ Quest · ส่งแล้วหมายถึงตอบครบ ไม่ใช่ผ่านเกณฑ์หรือเชี่ยวชาญ · ไม่คิด XP</p>
    {status === 'loading' && <p role="status">กำลังโหลดคลังศัพท์และงาน…</p>}
    {status === 'error' && <p role="alert">ยังโหลดคลังศัพท์ไม่ได้ <button type="button" onClick={() => setRevision(previous => previous + 1)}>ลองใหม่</button></p>}
    {(status === 'ready' || status === 'saving') && <form onSubmit={assign} className="space-y-3">
      <fieldset disabled={status === 'saving'} className="space-y-3">
      <label className="block">ชื่องาน<input className="block w-full rounded border border-slate-600 bg-slate-800 p-2" value={title} maxLength={120} required onChange={event => setTitle(event.target.value)} /></label>
      <label className="block">คำแนะนำ<textarea className="block w-full rounded border border-slate-600 bg-slate-800 p-2" value={instructions} maxLength={2000} onChange={event => setInstructions(event.target.value)} /></label>
      <label className="block">กำหนดส่ง (ไม่บังคับ)<input type="date" className="ml-2 rounded border border-slate-600 bg-slate-800 p-2" value={dueDate} onChange={event => setDueDate(event.target.value)} /></label>
      <label className="block">ค้นหาคำศัพท์<input className="ml-2 rounded border border-slate-600 bg-slate-800 p-2" value={query} onChange={event => setQuery(event.target.value)} /></label>
      <label className="block">หมวดศัพท์<select className="ml-2 max-w-full rounded border border-slate-600 bg-slate-800 p-2" value={group} onChange={event => setGroup(event.target.value)}><option value="">ทุกหมวด ({catalog.length} คำ/ความหมาย)</option>{groups.map(name => <option key={name}>{name}</option>)}</select></label>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={() => changeSelected(new Set([...selected, ...filtered.map(word => word.id)]))}>เลือกทั้งหมดที่แสดง ({filtered.length})</button><button type="button" onClick={() => changeSelected(new Set(catalog.filter(word => weakIds.has(word.id)).map(word => word.id)))}>เลือกคำที่ควรทบทวน</button><button type="button" onClick={() => changeSelected(new Set())}>ล้างที่เลือก</button></div>
      <fieldset className="max-h-64 overflow-y-auto rounded border border-slate-600 p-3"><legend>เลือกแล้ว {selected.size} จาก {catalog.length} คำ/ความหมาย</legend>{filtered.map(word => <label key={word.id} className="flex items-start gap-3 py-2"><input type="checkbox" checked={selected.has(word.id)} onChange={() => { const next = new Set(selected); if (next.has(word.id)) next.delete(word.id); else next.add(word.id); changeSelected(next); }} /><span><strong lang="en">{word.word}</strong> — {word.meaningTh}</span></label>)}</fieldset>
      <button type="submit" disabled={!selected.size || !title.trim() || status === 'saving'} className="rounded-lg bg-sky-600 px-4 py-3 font-bold disabled:opacity-50">{status === 'saving' ? 'กำลังมอบหมาย…' : `มอบหมาย ${selected.size} คำให้นักเรียนคนนี้`}</button>
      </fieldset>
    </form>}
    {message && <p role="status" className="my-3">{message}</p>}
    <h5 className="mt-5 font-bold">งานที่มอบหมายแล้ว <button type="button" onClick={() => setRevision(previous => previous + 1)} disabled={status === 'saving'}>รีเฟรชงาน</button></h5>
    {status === 'ready' && !tasks.length && <p>ยังไม่มีงานมอบหมาย</p>}
    <VocabularyAssignmentHistory tasks={tasks} />
  </section>;
}

export function VocabularyAssignmentHistory({ tasks }) {
  return <ul>{tasks.map(task => <li key={task.id} className="my-3 rounded border border-slate-600 p-3"><strong>{task.title}</strong> · {labels[task.status] || 'ยังยืนยันสถานะไม่ได้'} · ตอบ {task.answered}/{task.total} คำ<div>ไม่ใช้ตัวช่วยตามบันทึก: ถูก {task.independentCorrect}/{task.independentAttempts} · ใช้ตัวช่วย: ถูก {task.assistedCorrect}/{task.assistedAttempts}</div>{task.dueAt && <div>กำหนดส่ง {new Date(task.dueAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}</div>}<details><summary>ดูศัพท์ที่มอบหมาย</summary><ul>{(Array.isArray(task.words) ? task.words : []).map(word => <li key={word.id}>{word.word} — {word.meaningTh} · {task.answeredWordIds?.includes(word.id) ? 'ส่งคำตอบแล้ว' : 'ยังไม่ส่งคำตอบ'}</li>)}</ul></details></li>)}</ul>;
}
