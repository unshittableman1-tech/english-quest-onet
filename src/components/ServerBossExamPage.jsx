import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../App';
import { updateCurrentStudent } from '../utils/storage';
import {
  callBossExam,
  clearBossRequestId,
  getOrCreateBossAnswerRequestId,
  getOrCreateBossRequestId,
} from '../utils/bossExam';
import QuestionStimulus from './QuestionStimulus';
import '../styles/bossExam.css';

const messageFor = code => ({
  boss_exam_not_activated: 'สนามสอบกำลังเตรียมความพร้อม กรุณากลับไปที่แผนที่',
  boss_exam_denied: 'ยังไม่ผ่านเงื่อนไขของด่านนี้ หรือสิทธิ์การเข้าใช้งานหมดอายุ',
  boss_exam_expired: 'รอบสอบหมดเวลาแล้ว กรุณาเริ่มรอบใหม่',
  boss_exam_conflict: 'คำตอบแรกถูกบันทึกแล้วและไม่สามารถเปลี่ยนได้',
  session_unavailable: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง',
}[code] || 'ไม่สามารถเชื่อมต่อสนามสอบได้ กรุณาลองอีกครั้ง');

export default function ServerBossExamPage({ questId }) {
  const { navigate, student, setStudent } = useApp();
  const [run, setRun] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const questions = run?.questions || [];
  const answered = useMemo(() => questions.filter(item => Number.isInteger(item.selectedChoice)).length, [questions]);
  const question = questions[currentIndex];

  const start = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const requestId = getOrCreateBossRequestId(student.id, questId);
      const payload = await callBossExam({ action: 'start', bossId: questId, requestId });
      setRun(payload);
      const next = payload.questions.findIndex(item => !Number.isInteger(item.selectedChoice));
      setCurrentIndex(next < 0 ? Math.max(0, payload.questions.length - 1) : next);
    } catch (caught) {
      setError(messageFor(caught.code));
    } finally {
      setLoading(false);
    }
  }, [student.id, questId]);

  useEffect(() => { start(); }, [start]);

  const finish = useCallback(async runId => {
    const payload = await callBossExam({ action: 'finalize', runId });
    const updated = await updateCurrentStudent({
      questProgress: payload.questProgress,
      xp: payload.xp,
      level: payload.level,
      badgeStats: payload.badgeStats,
      rankingStats: payload.rankingStats,
      badges: payload.badges,
    });
    setStudent(updated);
    clearBossRequestId(student.id, questId);
    setResult(payload);
  }, [questId, setStudent, student.id]);

  const submit = async () => {
    if (!run?.runId || !question || !Number.isInteger(selected) || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const requestId = getOrCreateBossAnswerRequestId(run.runId, question.id);
      await callBossExam({ action: 'answer', runId: run.runId, itemId: question.id,
        choiceIndex: selected, requestId });
      const updatedQuestions = questions.map((item, index) => index === currentIndex
        ? { ...item, selectedChoice: selected }
        : item);
      const next = updatedQuestions.findIndex(item => !Number.isInteger(item.selectedChoice));
      setRun(previous => ({ ...previous, questions: updatedQuestions, answered: answered + 1 }));
      setSelected(null);
      if (next < 0) await finish(run.runId);
      else setCurrentIndex(next);
    } catch (caught) {
      setError(messageFor(caught.code));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center p-6"><div className="glass-card p-8 text-center">
    <LoaderCircle className="mx-auto mb-3 animate-spin" aria-hidden="true" /><p className="font-bold">กำลังเปิดสนามสอบที่ปลอดภัย…</p>
  </div></div>;

  if (error && !run) return <div className="min-h-screen grid place-items-center p-6"><div className="glass-card max-w-lg p-8 text-center" role="alert">
    <ShieldCheck className="mx-auto mb-3" size={36} /><h1 className="text-xl font-black mb-2">ยังเข้าสนามสอบไม่ได้</h1><p className="text-slate-600 mb-5">{error}</p>
    <button className="btn-primary" onClick={() => navigate('map')}>กลับ Quest Map</button>
  </div></div>;

  if (result) {
    const score = result.assessmentEvidence?.score ?? result.questProgress?.[questId]?.lastAssessment?.score ?? 0;
    return <div className="min-h-screen grid place-items-center p-6"><section className="glass-card max-w-xl w-full p-8 text-center" aria-live="polite">
      <CheckCircle2 className="mx-auto text-emerald-600 mb-3" size={48} /><h1 className="text-2xl font-black">ส่งข้อสอบสำเร็จ</h1>
      <p className="text-lg mt-3">คะแนน {score}/{result.assessmentEvidence?.total ?? result.questProgress?.[questId]?.lastAssessment?.total ?? questions.length}</p><p className="text-slate-600 mt-1">ได้รับ {result.earnedXP ?? 0} XP จากผลที่ตรวจโดยเซิร์ฟเวอร์</p>
      <button className="btn-primary mt-6" onClick={() => navigate('map')}>กลับ Quest Map</button>
    </section></div>;
  }

  return <div className="quiz-workspace boss-exam-page min-h-screen flex flex-col">
    <header className="quiz-hud"><div className="quiz-hud-inner"><div className="quiz-title-row">
      <button className="quiz-back" onClick={() => navigate('map')}><ArrowLeft size={18} />กลับ</button>
      <h1>Boss Exam</h1><span className="font-bold">{Math.min(answered + 1, questions.length)}/{questions.length}</span>
    </div><div className="h-2 rounded-full bg-slate-200 overflow-hidden" aria-label={`ตอบแล้ว ${answered} จาก ${questions.length} ข้อ`}>
      <div className="h-full bg-amber-500" style={{ width: `${answered / Math.max(1, questions.length) * 100}%` }} />
    </div></div></header>
    <main className="quiz-content flex-1"><section className="boss-question-card" aria-labelledby="boss-question-title">
      <div className="boss-question-meta"><span>ข้อ {currentIndex + 1} จาก {questions.length}</span><span><ShieldCheck size={16} aria-hidden="true" />บันทึกคำตอบอย่างปลอดภัย</span></div>
      <h2 id="boss-question-title" className="boss-question-title">เลือกคำตอบที่เหมาะสมที่สุด</h2>
      <QuestionStimulus question={{ ...question, question: question?.prompt }} />
      <div className="boss-dialogue" lang="en">{question?.prompt?.split('\n').map((line, index) => {
        const speaker = /^([^:]{1,32}):\s*(.*)$/.exec(line);
        return <p key={`${question.id}:line:${index}`}>{speaker ? <><strong className="boss-speaker">{speaker[1]}</strong><span>{speaker[2]}</span></> : <span>{line}</span>}</p>;
      })}</div>
      <div className="boss-answer-list" role="group" aria-label="ตัวเลือกคำตอบ">{question?.options?.map((option, index) => <button key={`${question.id}:${index}`} type="button"
        className={`answer-option text-left ${selected === index ? 'selected' : ''}`} aria-pressed={selected === index}
        disabled={submitting} onClick={() => setSelected(index)}><span className="answer-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span lang="en">{option}</span><span className="boss-choice-indicator" aria-hidden="true">{selected === index && <CheckCircle2 size={21} />}</span></button>)}</div>
      {error && <p className="mt-4 text-red-700 font-bold" role="alert">{error}</p>}
      <button className="btn-primary boss-confirm" disabled={!Number.isInteger(selected) || submitting} onClick={submit}>
        {submitting ? 'กำลังบันทึกคำตอบแรก…' : answered === questions.length - 1 ? 'ส่งคำตอบและสรุปผล' : 'ยืนยันคำตอบแรก'}
      </button>
      <p className="text-xs text-slate-500 text-center mt-3">คำตอบแรกจะถูกล็อกและไม่แสดงเฉลยก่อนส่งครบ {questions.length} ข้อ</p>
    </section></main>
  </div>;
}
