import { useEffect, useRef, useState } from 'react';
import { useApp } from '../App';
import QuizPage from './QuizPage';
import { CHAPTER3_LOCAL_MISSIONS } from '../data/chapter3LocalMissions';
import { supabase } from '../utils/supabase';
import { supabaseConfig } from '../config/runtimeMode';
import { updateCurrentStudent } from '../utils/storage';
import { readChapter3Response } from '../utils/chapter3Response.mjs';
import { runClientChapter3Command } from '../utils/chapter3ClientRunner';
import QuestionChart from './QuestionChart';
import '../styles/bossExam.css';
import '../styles/labelingLab.css';
import '../question-stimulus.css';

async function command(body) {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session && supabaseConfig.url && supabaseConfig.anonKey) {
      const response = await fetch(`${supabaseConfig.url}/functions/v1/chapter3-missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseConfig.anonKey,
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) return await readChapter3Response(response);
    }
  } catch {}
  return runClientChapter3Command(body);
}

export default function Chapter3LearningPage({ missionId }) {
  return <LiveChapter3LearningPage missionId={missionId} />;
}

function LiveChapter3LearningPage({ missionId }) {
  const { student, setStudent, navigate } = useApp();
  const [run, setRun] = useState(null);
  const [selection, setSelection] = useState([]);
  const [placements, setPlacements] = useState({});
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [retry, setRetry] = useState(0);
  const request = useRef(null);
  const lock = useRef(false);
  const storageKey = `eq_c3_run:${student.id}:${missionId}`;
  const item = run?.questions.find(question => !question.answered);
  const view = item?.view;
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError('');
    const requestId = sessionStorage.getItem(storageKey) || crypto.randomUUID();
    sessionStorage.setItem(storageKey, requestId);
    command({ action: 'start', missionId, requestId }).then(() => command({ action: 'view', runId: requestId }))
      .then(payload => { if (active) setRun(payload); }).catch(caught => { if (active) setError(caught.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [missionId, storageKey, retry]);

  async function submit() {
    if (lock.current || !item) return;
    lock.current = true; setBusy(true); setError('');
    request.current ||= crypto.randomUUID();
    try {
      const responseIds = item.kind === 'labeling' ? Object.entries(placements).map(([spot, label]) => `${spot}:${label}`) : selection;
      await command({ action: 'submit', runId: run.runId, attemptId: request.current, activityId: item.activityId, itemId: item.id, responseIds });
      const updated = await command({ action: 'view', runId: run.runId });
      setRun(updated); setSelection([]); setPlacements({}); setSelectedLabel(null); request.current = null;
    } catch (caught) { setError(caught.message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function finish() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const payload = await command({ action: 'finalize', runId: run.runId });
      setStudent(await updateCurrentStudent(payload.student));
      setResult(payload); sessionStorage.removeItem(storageKey);
    } catch (caught) { setError(caught.message); }
    finally { lock.current = false; setBusy(false); }
  }
  const valid = item && (item.kind === 'labeling' ? Object.keys(placements).length === view.hotspots.length : item.kind === 'sequence' ? selection.length === view.tokens.length : selection.length > 0);
  return <main className="boss-exam-page"><div className="quiz-content"><section className="boss-question-card">
    <button className="btn-ghost" onClick={() => navigate('map')}>กลับ Quest Map</button>
    <h1 className="boss-question-title">Chapter 3 · ภารกิจเก็บคะแนน</h1>
    <p>ผ่านแต่ละกิจกรรมอย่างน้อย 70% · รับ 50 XP เมื่อผ่านด่านครั้งแรก</p>
    {error && <p role="alert">{error}</p>}
    {result ? <><h2>{result.passed ? 'ผ่านภารกิจแล้ว' : 'ลองฝึกแล้วทำใหม่ได้ครับ'}</h2><p>คะแนน {result.score}/{result.total} · ได้รับ {result.earnedXP} XP · {result.earnedStars || 0} ดาว</p>{result.passed && result.earnedXP === 0 && <p>ด่านนี้ได้รับ 50 XP สำหรับการผ่านครั้งแรกแล้ว การเล่นซ้ำไม่เพิ่ม XP</p>}<button className="btn-primary boss-confirm" onClick={() => navigate('map')}>กลับ Quest Map</button></>
      : !run ? busy ? <p>กำลังเปิดภารกิจ…</p> : <button className="btn-primary boss-confirm" onClick={() => setRetry(previous => previous + 1)}>ลองใหม่</button>
      : !item ? <button className="btn-primary boss-confirm" disabled={busy} onClick={finish}>สรุปคะแนนและบันทึกผล</button>
      : <><p>ตอบแล้ว {run.questions.filter(question => question.answered).length}/{run.questions.length}</p><h2 className="boss-dialogue">{view.prompt}</h2>
        {view.chart && <QuestionChart stimulus={view.chart} />}
        {view.image && <div className="labeling-scene" style={{ position: 'relative' }}><img src={view.image} alt={view.imageAlt} style={{ width: '100%' }}/>{view.hotspots?.map((spot, index) => <button key={spot.id} className="labeling-hotspot" style={{ left: `${spot.x * 100}%`, top: `${spot.y * 100}%` }} disabled={busy || !selectedLabel} onClick={() => setPlacements(previous => {
          const updated = Object.fromEntries(Object.entries(previous).filter(([key, label]) => key !== spot.id && label !== selectedLabel));
          return { ...updated, [spot.id]: selectedLabel };
        })}>{index + 1}. {view.labels.find(label => label.id === placements[spot.id])?.text}</button>)}</div>}
        {item.kind === 'labeling' && <div className="boss-answer-list">{view.labels.map(label => <button key={label.id} className={`answer-option ${selectedLabel === label.id ? 'selected' : ''}`} onClick={() => setSelectedLabel(label.id)}>{label.text}</button>)}</div>}
        {item.kind === 'sequence' && <><p>เลือกการ์ดตามลำดับ แตะการ์ดที่เลือกแล้วเพื่อนำออก</p><div className="boss-dialogue">{selection.map(id => <button className="btn-ghost" key={id} disabled={busy} onClick={() => { setSelection(previous => previous.filter(token => token !== id)); request.current = null; }}>{view.tokens.find(token => token.id === id)?.text}</button>)}</div><div className="boss-answer-list">{view.tokens.filter(token => !selection.includes(token.id)).map(token => <button className="answer-option" key={token.id} disabled={busy} onClick={() => { setSelection(previous => [...previous, token.id]); request.current = null; }}>{token.text}</button>)}</div></>}
        {['choice', 'set'].includes(item.kind) && <div className="boss-answer-list">{view.options.map(option => <button className={`answer-option ${selection.includes(option.id) ? 'selected' : ''}`} aria-pressed={selection.includes(option.id)} key={option.id} disabled={busy} onClick={() => { setSelection(previous => item.kind === 'choice' ? [option.id] : previous.includes(option.id) ? previous.filter(id => id !== option.id) : [...previous, option.id]); request.current = null; }}>{option.text}</button>)}</div>}
        <button className="btn-primary boss-confirm" disabled={busy || !valid} onClick={submit}>{busy ? 'กำลังบันทึก…' : 'ยืนยันคำตอบแรก'}</button>
      </>}
  </section></div></main>;
}
