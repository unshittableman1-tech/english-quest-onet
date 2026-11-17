import { useEffect, useMemo, useState } from 'react';
import { fetchAssignmentCatalog, fetchStudentAssignments } from '../utils/vocabPracticeCloud';
import VocabularyQuickCheck from './games/VocabularyQuickCheck';
import { useSpeech } from '../utils/useSpeech';

const cardFor = word => ({ id: word.id, front: word.word, frontLabel: word.word, back: word.word, backThai: word.meaningTh, frontType: 'text' });
const labels = { assigned: 'ยังไม่เริ่ม', in_progress: 'กำลังทำ', submitted: 'ส่งแล้ว' };
export default function StudentVocabularyAssignments({ student, wordHistory, onEvidence }) {
  const [tasks, setTasks] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [status, setStatus] = useState('loading');
  const [revision, setRevision] = useState(0);
  const [activeTask, setActiveTask] = useState(null);
  const [checking, setChecking] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const { speak, stop, supported } = useSpeech();
  const receivedCount = wordHistory.events.filter(event => event.assignmentId && !event.cloudPending).length;
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    Promise.all([fetchStudentAssignments(), fetchAssignmentCatalog()]).then(([assignments, words]) => {
      if (!cancelled) { setTasks(assignments); setCatalog(words); setStatus('ready'); }
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; };
  }, [student.auth_user_id, revision, receivedCount]);
  const distractorCards = useMemo(() => catalog.map(cardFor), [catalog]);
  const close = () => { stop(); setActiveTask(null); setChecking(false); setRevision(previous => previous + 1); };
  const pendingFor = task => wordHistory.events.filter(event => event.assignmentId === task.id && event.cloudPending);
  const remainingFor = task => {
    const answered = new Set([...task.answeredWordIds, ...wordHistory.events.filter(event => event.assignmentId === task.id).map(event => event.wordId)]);
    return task.words.filter(word => !answered.has(word.id));
  };
  if (activeTask && checking) return <VocabularyQuickCheck embedded key={activeTask.attemptId} title={activeTask.title} cards={activeTask.remaining.map(cardFor)} distractorCards={distractorCards} onBack={close} onEvidence={observation => onEvidence({ ...observation, observationId: `${activeTask.attemptId}:${observation.observationId}`, assignmentId: activeTask.id })} />;
  return <section className="vocab-word-progress vocab-assignments" aria-label="งานจากครู">
    <div className="vocab-assignments-heading"><div><span>📬 มุมงานของฉัน</span><h2>งานจากครู</h2></div>{status === 'ready' && <button type="button" onClick={() => setRevision(previous => previous + 1)}>รีเฟรช</button>}</div>
    {status === 'loading' && <p role="status">กำลังโหลดงานจากครู…</p>}
    {status === 'error' && <div className="vocab-assignments-error" role="alert"><p>ยังโหลดงานจากครูไม่ได้ กรุณาลองใหม่ งานที่บันทึกในคิวจะไม่ถูกลบ</p><button type="button" onClick={() => setRevision(previous => previous + 1)}>ลองอีกครั้ง</button></div>}
    {status === 'ready' && !tasks.length && <p>ยังไม่มีงานจากครู</p>}
    {status === 'ready' && tasks.length > 0 && <p className="vocab-evidence-note">ตอบครบทุกคำแล้วระบบจะส่งงานเมื่อเชื่อมต่อสำเร็จ · ผลเป็นการฝึก ไม่คิด XP และไม่เปลี่ยน Boss</p>}
    {!activeTask && tasks.map(task => <article key={task.id} className="my-3 rounded-xl border p-3">
      <h3>{task.title}</h3><p>{labels[task.status]} · ครูได้รับ {task.answered}/{task.total} คำ</p>
      {task.dueAt && <p>กำหนดส่ง {new Date(task.dueAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}</p>}
      {pendingFor(task).length > 0 && <p role="status">มี {pendingFor(task).length} คำรอส่ง กรุณาเปิดหน้านี้ไว้จนส่งสำเร็จ</p>}
      <button type="button" onClick={() => { setPageSize(20); setActiveTask(task); }}>{task.status === 'submitted' ? 'ดูงานที่ส่งแล้ว' : 'เริ่มทำงาน / ดูชุดเรียน'}</button>
    </article>)}
    {activeTask && <article>
      <h3>{activeTask.title}</h3><p>{activeTask.instructions}</p>
      <p>เรียนรู้ความหมายก่อน แล้วกดตรวจเฉพาะคำที่ยังไม่ส่งได้</p>
      <ul>{activeTask.words.slice(0, pageSize).map(word => <li key={word.id}><span><strong lang="en">{word.word}</strong> — {word.meaningTh}</span>{supported && <button type="button" aria-label={`ฟังเสียง ${word.word}`} onClick={() => speak(word.word, { lang: 'en-US' })}>🔊 ฟังเสียง</button>}</li>)}</ul>
      {pageSize < activeTask.words.length && <button type="button" onClick={() => setPageSize(previous => previous + 20)}>แสดงศัพท์เพิ่ม 20 คำ</button>}
      <button type="button" disabled={!remainingFor(activeTask).length || !catalog.length} onClick={() => { stop(); setActiveTask({ ...activeTask, remaining: remainingFor(activeTask), attemptId: crypto.randomUUID() }); setChecking(true); }}>ตรวจความหมายและส่งงาน ({remainingFor(activeTask).length} คำที่ยังไม่ตอบ)</button>
      <button type="button" onClick={close}>กลับรายการงาน</button>
    </article>}
  </section>;
}
