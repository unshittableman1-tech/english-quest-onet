import { useEffect, useRef, useState } from 'react';
import FlashcardGame from '../games/FlashcardGame';
import MemoryMatchGame from '../games/MemoryMatchGame';
import VocabularyQuickCheck from '../games/VocabularyQuickCheck';
import useVocabularyCreditAccount from '../../hooks/useVocabularyCreditAccount';
import '../../styles/vocabularyCredits.css';

export function CreditSetProgress({ set, onStart, busy = false }) {
  return <section className="credit-set-progress" aria-label={`ความคืบหน้าชุด ${set.title}`}>
    <h3>{set.title}</h3><p>{set.total} คำ · {set.complete ? 'ฝึกครบชุดแล้ว' : `เมื่อฝึกครบทุกขั้น รับเพิ่มได้ ${set.newCredits} แต้ม`}</p>
    <ol>{set.steps.map((step, index) => <li key={step.id} data-credit-step={step.id} data-completed={step.completed}>
      <span>{step.completed ? '✓' : index + 1} {step.label} · {step.count}/{set.total}</span>
      <button disabled={busy || !set.eligible || set.steps.slice(0, index).some(previous => !previous.completed)} onClick={() => onStart(step.id)}>{step.completed ? 'ฝึกซ้ำ' : 'เริ่ม'} {step.label}</button>
    </li>)}</ol>
    <p className="credit-note">เครื่องหมาย ✓ แสดงว่าทำกิจกรรมครบ · รับแต้มคำเดิมครั้งเดียว · ยังทบทวนฟรีได้เสมอ</p>
  </section>;
}
export default function VocabularyCreditTraining({ setId, fixture, onBack, initialStep = null, onEvidence: forwardEvidence }) {
  const account = useVocabularyCreditAccount({ fixture });
  const [run, setRun] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const evidence = useRef([]);
  const lock = useRef(false);
  const autoStarted = useRef(false);
  const set = account.state?.sets.find(row => row.id === setId);
  useEffect(() => {
    if (initialStep && set && !autoStarted.current) { autoStarted.current = true; start(initialStep); }
  }, [initialStep, set?.id]);
  async function start(step) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const next = await account.client.call('begin', { setId, step });
      evidence.current = []; setRun(next); setResult(null);
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function finish() {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const value = await account.client.call('finish', { runId: run.id, events: evidence.current });
      account.setState(value.state); setResult(value); setRun(null);
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(false); }
  }
  function onEvidence(event) {
    forwardEvidence?.({ ...event, observationId: run.id + ':' + event.observationId });
    evidence.current.push(run.step === 'study' ? { cardId: event.card.id, selfReported: event.selfReported === true }
      : { cardId: event.card.id, selectedCardId: event.selectedCardId, usedAudio: event.assisted === true });
  }
  if (run) return <div className="credit-training-game">
    <div className="credit-game-banner">{set?.title} · ขั้น {run.step === 'study' ? 'เรียนการ์ด' : run.step === 'memory' ? 'จับคู่' : 'ตรวจความหมาย'} · รับแต้มเมื่อฝึกครบทั้งชุด</div>
    {error && <p role="alert" className="credit-error">{error} <button onClick={finish} disabled={busy}>ลองบันทึกอีกครั้ง</button></p>}
    {busy && <p role="status">กำลังบันทึกผลกิจกรรม…</p>}
    <fieldset disabled={busy} className="credit-game-fieldset">
      {run.step === 'study' ? <FlashcardGame key={run.id} mission={{ cards: run.cards, title: run.title, xpReward: 0 }} onEvidence={onEvidence} onComplete={finish} onBack={() => { setRun(null); setError(''); }} showXP={false} completionLabel="บันทึกขั้นเรียนการ์ด" />
        : run.step === 'memory' ? <MemoryMatchGame key={run.id} cards={run.cards} title={`${run.title} · รอบละไม่เกิน 6 คู่`} onMatch={event => evidence.current.push(event)} onComplete={finish} onBack={() => { setRun(null); setError(''); }} />
          : <VocabularyQuickCheck key={run.id} cards={run.cards} distractorCards={run.distractorCards} title={run.title} onEvidence={onEvidence} onComplete={finish} onBack={() => { setRun(null); setError(''); }} />}
    </fieldset>
  </div>;
  return <section className="credit-lab credit-training" aria-label="ฝึกคำศัพท์เพื่อรับแต้ม">
    <button onClick={onBack}>← กลับชุดคำศัพท์</button>
    {account.loading ? <p role="status">กำลังโหลดความคืบหน้า…</p> : !set ? <p role="alert">{account.error || 'ยังเปิดชุดนี้ไม่ได้'}</p> : <>
      <p className="credit-wallet"><strong>{account.state.balance} แต้มคำศัพท์</strong><span>แยกจาก XP</span></p>
      {result && <section className="credit-panel" role="status"><strong>{result.setComplete ? `ฝึกครบชุดแล้ว · ได้รับเพิ่ม ${result.earned} แต้ม` : result.remaining ? `บันทึกแล้ว · เหลือ ${result.remaining} คำในขั้นนี้` : '✓ ผ่านขั้นนี้แล้ว'}</strong>
        {result.remaining > 0 && <button onClick={() => start(result.step)} disabled={busy}>{result.step === 'memory' ? 'จับคู่รอบที่เหลือ' : 'ทบทวนคำที่ยังผิด'}</button>}
      </section>}
      <CreditSetProgress set={set} busy={busy} onStart={start} />
      <details><summary>ผลรายคำในชุดนี้</summary><ul>{set.words.map(word => <li key={word.id}>{word.label} · เรียน {word.studied ? '✓' : '—'} · จับคู่ {word.matched ? '✓' : '—'} · ตรวจความหมาย {word.checked ? '✓' : '—'}</li>)}</ul></details>
    </>}
    {(error || account.error) && <p role="alert" className="credit-error">{error || account.error}</p>}
    <p className="credit-note">ฝึกคำศัพท์และดูคำแปลได้ฟรีระหว่างเรียน ไม่ต้องรอ 24 ชั่วโมงเพื่อรับแต้มการฝึกครบชุด</p>
  </section>;
}
