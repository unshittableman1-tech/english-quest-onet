import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { ArrowLeft, ChartColumn, Check, Layers, RotateCcw, X } from 'lucide-react';
import QuestionChart from '../QuestionChart';
import { inspectQuestionMedia } from '../../utils/questionMedia';
import { createOrderingState, orderingReducer } from '../../utils/orderingGame';
import '../../question-stimulus.css';
import '../../styles/graphComparison.css';

const isLocal = () => import.meta.env.DEV && ['127.0.0.1', 'localhost', '[::1]'].includes(window.location.hostname);
const validProgress = progress => ['graph', 'comparison'].every(activity => Number.isInteger(progress?.[activity]?.correct) && Number.isInteger(progress[activity].total) && progress[activity].total > 0 && progress[activity].correct >= 0 && progress[activity].correct <= progress[activity].total);
const validView = view => {
  if (!view?.previewOnly || view.type !== 'graph_comparison' || typeof view.runId !== 'string' || view.rewardsAwarded !== false || !validProgress(view.progress)) return false;
  if (view.previewFinished) return view.question === null && Object.values(view.progress).every(activity => activity.correct === activity.total);
  const question = view.question;
  return question && typeof question.id === 'string' && ['graph', 'comparison'].includes(question.activity) && !inspectQuestionMedia({ stimuli: [question.chart] }).blocked
    && (question.interaction === 'cards' ? Array.isArray(question.tokens) && question.tokens.length > 0 : ['choice', 'multi'].includes(question.interaction) && Array.isArray(question.options) && question.options.length > 1);
};

async function requestGraph(path, payload) {
  const response = await fetch(`/__local/graph/${path}`, payload ? { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) } : { credentials: 'same-origin', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('graph_request_failed');
  return response.json();
}

export default function GraphComparisonGame({ mission, onBack }) {
  if (!isLocal() || !validView(mission)) return <section className="graph-challenge"><p role="alert">Graph & Comparison ยังไม่เปิดใช้งานกับบัญชีนักเรียนจริง</p><button type="button" onClick={onBack}>กลับไปเลือกภารกิจ</button></section>;
  return <GraphSession key={mission.runId} initial={mission} onBack={onBack} />;
}

function GraphWordCards({ question, disabled, onChange, checkRef }) {
  const [state, dispatch] = useReducer(orderingReducer, { id: 'words', rounds: [{ words: question.tokens.map(token => token.text) }] }, createOrderingState);
  const remainingRef = useRef(null);
  const arrangedRef = useRef(null);
  useEffect(() => {
    if (state.focusTarget === 'remaining') (remainingRef.current?.querySelector('button') || checkRef.current)?.focus({ preventScroll: true });
    if (state.focusTarget === 'arranged') (arrangedRef.current?.querySelector('button') || remainingRef.current?.querySelector('button'))?.focus({ preventScroll: true });
  }, [state, checkRef]);
  const moveToken = (token, chosen) => {
    const action = { type: chosen ? 'remove' : 'add', id: token.id };
    const next = orderingReducer(state, action);
    dispatch(action);
    onChange(next.arranged.map(item => item.id));
  };
  const tokenButton = (token, chosen) => <button type="button" key={token.id} data-token-id={token.id} disabled={disabled} aria-label={`${chosen ? 'นำออก' : 'เพิ่ม'} ${token.text} ชิ้นที่ ${token.position}`} onClick={() => moveToken(token, chosen)}>{token.text}</button>;
  return <div className="graph-word-cards"><section ref={arrangedRef} aria-label="ประโยคที่เรียงแล้ว"><h3>ประโยคของคุณ</h3>{!state.arranged.length && <p>เลือกคำด้านล่างตามลำดับ แตะคำที่เลือกแล้วเพื่อนำออก</p>}<div>{state.arranged.map(token => tokenButton(token, true))}</div></section><section ref={remainingRef} aria-label="คำที่ยังไม่ได้เลือก"><h3>คำให้เลือก</h3><div>{state.remaining.map(token => tokenButton(token, false))}</div></section></div>;
}

function GraphSession({ initial, onBack }) {
  const [view, setView] = useState(initial);
  const [answer, setAnswer] = useState([]);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState('play');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [inspected, setInspected] = useState(null);
  const inFlight = useRef(false);
  const attempt = useRef(null);
  const mounted = useRef(true);
  const questionRef = useRef(null);
  const feedbackRef = useRef(null);
  const checkRef = useRef(null);
  const summaryRef = useRef(null);
  const question = view.question;
  const locked = phase !== 'play';
  const updateAnswer = useCallback(value => { setAnswer(value); attempt.current = null; }, []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (result) feedbackRef.current?.focus(); }, [result]);
  useEffect(() => { if (view.previewFinished) summaryRef.current?.focus(); else questionRef.current?.focus(); }, [view]);

  const reset = next => { setView(next); setAnswer([]); setResult(null); setError(''); setInspected(null); setPhase('play'); attempt.current = null; setRetry(value => value + 1); };
  async function check() {
    if (inFlight.current || locked || !question || !answer.length || (question.interaction === 'cards' && answer.length !== question.tokens.length)) return;
    inFlight.current = true; setPhase('checking'); setError('');
    const attemptId = attempt.current || crypto.randomUUID(); attempt.current = attemptId;
    try {
      const response = await requestGraph('check', { runId: view.runId, attemptId, questionId: question.id, response: question.interaction === 'choice' ? answer[0] : answer });
      if (typeof response.correct !== 'boolean' || response.rewardsAwarded !== false || !validProgress(response.progress) || typeof response.feedback !== 'string' || typeof response.explanation !== 'string') throw new Error('invalid_response');
      if (mounted.current) { setResult(response); setPhase('review'); }
    } catch { if (mounted.current) { setError('ตรวจคำตอบไม่สำเร็จ คำตอบยังอยู่ ลองกดตรวจอีกครั้ง'); setPhase('play'); } }
    finally { inFlight.current = false; }
  }
  async function next() {
    if (inFlight.current || !result?.correct) return;
    inFlight.current = true; setPhase('next'); setError('');
    try {
      const response = await requestGraph('next', { runId: view.runId, questionId: question.id });
      if (!validView(response)) throw new Error('invalid_view');
      if (mounted.current) reset(response);
    } catch { if (mounted.current) { setError('เปิดข้อถัดไปไม่สำเร็จ ลองกดอีกครั้ง'); setPhase('review'); } }
    finally { inFlight.current = false; }
  }
  async function restart() {
    if (inFlight.current) return;
    inFlight.current = true; setError('');
    try { const response = await requestGraph('mission'); if (!validView(response)) throw new Error('invalid_view'); if (mounted.current) reset(response); }
    catch { if (mounted.current) setError('เริ่มชุดใหม่ไม่สำเร็จ กรุณาลองอีกครั้ง'); }
    finally { inFlight.current = false; }
  }

  const progress = result?.progress || view.progress;
  const completed = progress.graph.correct + progress.comparison.correct;
  const total = progress.graph.total + progress.comparison.total;
  return <section className="graph-challenge" aria-label="เกมอ่านกราฟและเปรียบเทียบ">
    <header className="graph-game-header"><button type="button" aria-label="กลับไปหน้าทดลอง" onClick={onBack}><ArrowLeft /></button><div><span><ChartColumn /> GRAPH & COMPARISON</span><h1>{view.title}</h1><p>อ่านข้อมูลให้เข้าใจ แล้วใช้ภาษาอังกฤษเปรียบเทียบ</p></div></header>
    <p className="graph-preview-note">ข้อมูลตัวอย่างสังเคราะห์ ยังไม่ใช่เนื้อหาที่ครูรับรอง · โหมดทดลองไม่ให้ XP ดาว หรือบันทึกความคืบหน้า · ตอบถูกทุกข้อในทั้งสองกิจกรรมเพื่อจบชุดทดลอง</p>
    <div className="graph-activities" aria-label="ความคืบหน้าสองกิจกรรม"><span className={question?.activity === 'graph' ? 'is-active' : ''}>A · Graph Detective <b>{progress.graph.correct}/{progress.graph.total}</b></span><span className={question?.activity === 'comparison' ? 'is-active' : ''}>B · Comparison Challenge <b>{progress.comparison.correct}/{progress.comparison.total}</b></span></div>
    <progress aria-label="จำนวนข้อที่ตอบถูก" value={completed} max={total} />
    {view.previewFinished ? <section className="graph-summary" ref={summaryRef} tabIndex={-1} aria-label="สรุปภารกิจทดลอง"><Check /><h2>ครบทั้งสองกิจกรรมแล้ว!</h2><p>Graph Detective {progress.graph.correct}/{progress.graph.total} ข้อ</p><p>Comparison Challenge {progress.comparison.correct}/{progress.comparison.total} ข้อ</p><p>ผลนี้เป็นการฝึกในเครื่อง ไม่ได้รับ XP หรือปลดล็อก Boss</p><button type="button" className="graph-primary" onClick={restart}><RotateCcw />เริ่มฝึกชุดใหม่</button></section>
      : <div className="graph-play-layout">
        <section className="graph-world" aria-label="กราฟและข้อมูล"><QuestionChart stimulus={question.chart} /><div className="graph-inspector" aria-label="สำรวจค่าจากกราฟ">{question.chart.points.map(point => <button type="button" key={point.id} aria-pressed={inspected === point.id} onClick={() => setInspected(point.id)}>{point.label}</button>)}</div><p role="status">{inspected ? `${question.chart.points.find(point => point.id === inspected)?.label}: ${question.chart.points.find(point => point.id === inspected)?.value} ${question.chart.yLabel}` : 'แตะชื่อเพื่ออ่านค่า หรือเปิดตารางข้อมูลใต้กราฟ'}</p></section>
        <section className="graph-question" aria-label="คำถามและคำตอบ"><span className="graph-question-activity"><Layers />{question.activity === 'graph' ? 'Graph Detective' : 'Comparison Challenge'}</span><h2 ref={questionRef} tabIndex={-1}>{question.prompt}</h2><p>{question.learningObjective}</p><p className="graph-instructions">{question.interaction === 'cards' ? 'เลือกการ์ดเรียงเป็นประโยค ใช้ Tab และ Enter/Space ได้' : question.interaction === 'multi' ? 'เลือกทุกคำตอบที่ถูกต้อง แล้วกดตรวจ' : 'เลือกหนึ่งคำตอบ แล้วกดตรวจคำตอบ'}</p>
          {question.interaction === 'cards' ? <GraphWordCards key={`${question.id}:${retry}`} question={question} disabled={locked} onChange={updateAnswer} checkRef={checkRef} />
            : <div className="graph-options">{question.options.map(option => <button type="button" key={option.id} data-option-id={option.id} disabled={locked} aria-pressed={answer.includes(option.id)} onClick={() => updateAnswer(question.interaction === 'multi' ? answer.includes(option.id) ? answer.filter(id => id !== option.id) : [...answer, option.id] : [option.id])}>{option.text}</button>)}</div>}
          {result && <section ref={feedbackRef} tabIndex={-1} className={`graph-feedback ${result.correct ? 'is-correct' : 'is-incorrect'}`} aria-label="ผลคำตอบ" role="status"><h3>{result.correct ? <Check /> : <X />}{result.feedback}</h3><p>{result.explanation}</p></section>}
          {result ? result.correct ? <button type="button" className="graph-primary" disabled={phase === 'next'} onClick={next}>{phase === 'next' ? 'กำลังเปิดข้อถัดไป' : 'ไปต่อ'}</button> : <button type="button" className="graph-primary" onClick={() => { setResult(null); setAnswer([]); setPhase('play'); attempt.current = null; setRetry(value => value + 1); questionRef.current?.focus(); }}>ลองข้อนี้ใหม่</button>
            : <button type="button" className="graph-primary" ref={checkRef} disabled={locked || !answer.length || (question.interaction === 'cards' && answer.length !== question.tokens.length)} onClick={check}>{phase === 'checking' ? 'กำลังตรวจคำตอบ' : 'ตรวจคำตอบ'}</button>}
        </section>
      </div>}
    {error && <p className="graph-error" role="alert">{error}</p>}
  </section>;
}
