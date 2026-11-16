import { useEffect, useState } from 'react';
import { Gem, GraduationCap } from 'lucide-react';
import useVocabularyCreditAccount from '../../hooks/useVocabularyCreditAccount';
import { currentCreditStudentFixture, vocabularyCreditsPilotEnabled } from '../../utils/vocabularyCreditsPilot';
import VocabularyCreditTraining, { CreditSetProgress } from './VocabularyCreditTraining';
import CreditGlossary from './CreditGlossary';
import '../../styles/vocabularyCredits.css';

const POLICIES = { credits: 'ใช้แต้มช่วยอ่าน', free: 'ช่วยอ่านฟรี', off: 'ทำด้วยตนเอง' };
const FIXTURES = [['student_a', 'นักเรียนสมมติ A'], ['student_b', 'นักเรียนสมมติ B'], ['teacher_a', 'ครูสมมติ A'], ['student_c', 'นักเรียนสมมติ C · โรงเรียนอื่น'], ['teacher_b', 'ครูสมมติ B · โรงเรียนอื่น']];
const time = value => new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
function TeacherRow({ row, busy, save }) {
  const [policy, setPolicy] = useState(row.policy);
  useEffect(() => setPolicy(row.policy), [row.policy, row.policyRevision]);
  return <article className="credit-teacher-row"><h3>{row.actor.name}</h3><p>{row.balance} แต้ม · ฝึกครบ {row.sets.filter(set => set.complete).length} ชุด</p>
    <div className="credit-policy-control"><label>สิทธิ์คำแปลใน Quest<select aria-label={'สิทธิ์ ' + row.actor.name} value={policy} disabled={busy} onChange={event => setPolicy(event.target.value)}>{Object.entries(POLICIES).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label><button disabled={busy || policy === row.policy} onClick={() => save(row, policy)}>บันทึกสิทธิ์ {row.actor.name}</button></div>
    <details><summary>ชุดฝึกและคำที่ขอแปล</summary>
      {!row.attempts.length && !row.help.length && <p>ยังไม่มีข้อมูล</p>}
      {row.sets.filter(set => set.steps.some(step => step.count > 0)).map(set => <p key={set.id}>{set.title} · {set.steps.map(step => step.label + ' ' + step.count + '/' + set.total).join(' · ')}</p>)}
      {row.attempts.filter(attempt => attempt.step === 'check').map(attempt => <p key={attempt.id}>ตรวจความหมาย {attempt.correct}/{attempt.total} · {attempt.assisted ? 'ใช้เสียงช่วย' : 'ไม่ใช้เสียงช่วย'} · {time(attempt.completedAt)}</p>)}
      {row.help.map(help => <p key={help.id}>{help.label} · {help.kind === 'trained_word_review' ? 'ทบทวนคำที่ฝึกแล้ว' : 'ขอคำแปล'} · ใช้ {help.charged} แต้ม · {time(help.at)}</p>)}
      <p className="credit-note">ประวัติแปลรวมการส่งซ้ำเมื่อเชื่อมต่อสะดุด การขอคำแปลหนึ่งครั้งยังไม่ใช่ข้อสรุปความสามารถ</p>
    </details>
  </article>;
}
export default function VocabularyCreditsWorkspace({ onBack }) {
  const enabled = vocabularyCreditsPilotEnabled({ isDemo: true });
  const [fixture, setFixture] = useState(currentCreditStudentFixture);
  const [setId, setSetId] = useState('quest:vocabulary');
  const [training, setTraining] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const account = useVocabularyCreditAccount({ enabled, fixture });
  const teacher = fixture.startsWith('teacher_');
  const set = account.state?.sets.find(set => set.id === setId);
  useEffect(() => { if (!teacher) try { sessionStorage.setItem('eqai-credit-student-fixture-v2', fixture); } catch {} }, [fixture, teacher]);
  async function save(row, policy) {
    setBusy(true); account.setError(''); setNotice('');
    try {
      const saved = await account.client.call('policy', { studentId: row.actor.id, policy, expectedRevision: row.policyRevision });
      account.setRoster(rows => rows.map(item => item.actor.id === saved.actor.id ? saved : item)); setNotice('บันทึกสิทธิ์ของ ' + saved.actor.name + ' แล้ว');
    } catch (err) { account.setError(err.message); }
    finally { setBusy(false); }
  }
  if (!enabled) return <p>โหมดแต้มคำศัพท์ยังไม่เปิดใช้กับบัญชีจริง</p>;
  if (training) return <VocabularyCreditTraining fixture={fixture} setId={training.id} initialStep={training.step} onBack={() => { setTraining(null); account.refresh().catch(err => account.setError(err.message)); }} />;
  return <main className="credit-lab">
    <aside className="credit-pilot-notice">เดโม · ฝึกด้วยกิจกรรมเดิม · บัญชีสมมติ · ข้อมูลอยู่จนปิดเซิร์ฟเวอร์ทดลอง</aside>
    <header className="credit-header"><div><p className="credit-eyebrow">VOCABULARY POWER</p><h1><Gem/> ฝึกครบชุด รับแต้มช่วยแปล</h1><p>เรียน → จับคู่ → ตรวจความหมาย → รับแต้ม → เลือกแปลคำที่ต้องการ</p></div>{onBack && <button onClick={onBack}>← กลับ</button>}</header>
    <section className="credit-rolebar"><label>ลองสลับบทบาทในระบบทดลอง<select value={fixture} disabled={busy || account.loading} onChange={event => { setNotice(''); setFixture(event.target.value); }}>{FIXTURES.map(([key, name]) => <option value={key} key={key}>{name}</option>)}</select></label><button disabled={busy || account.loading} onClick={() => account.refresh().catch(err => account.setError(err.message))}>รีเฟรชข้อมูล</button></section>
    <p role="status" className="credit-status">{account.loading || busy ? 'กำลังโหลดและบันทึก…' : notice}</p>
    {account.error && <p role="alert" className="credit-error">{account.error}</p>}
    {teacher ? <section className="credit-panel"><h2><GraduationCap/> สิทธิ์คำแปลรายบุคคล</h2><p>เฉพาะนักเรียนสมมติที่ได้รับมอบหมาย · เรียนศัพท์พื้นฐานฟรีได้ทุกสิทธิ์</p>{account.roster.map(row => <TeacherRow row={row} key={row.actor.id} busy={busy} save={save} />)}</section> : account.state && <>
      <section className="credit-wallet"><strong>{account.state.balance} แต้มคำศัพท์</strong><p>{account.state.actor.name} · {POLICIES[account.state.policy]} · แยกจาก XP</p></section>
      <section className="credit-panel"><label>เลือกชุดคำศัพท์เดิม<select aria-label="เลือกชุดคำศัพท์เดิม" value={setId} onChange={event => setSetId(event.target.value)}>{['quest:', 'category:'].map(prefix => <optgroup key={prefix} label={prefix === 'quest:' ? 'ศัพท์เฉพาะ Quest' : 'หมวด Vocab Drill'}>{account.state.sets.filter(set => set.id.startsWith(prefix)).map(set => <option key={set.id} value={set.id}>{set.title} · {set.total} คำ</option>)}</optgroup>)}</select></label>
        {set && <CreditSetProgress set={set} onStart={step => setTraining({ id: set.id, step })} />}
        {set && <button onClick={() => setTraining({ id: set.id, step: null })}>ฝึกชุดนี้เพื่อรับแต้ม</button>}
      </section>
      <CreditGlossary key={fixture} fixture={fixture} />
      <section className="credit-panel"><p>กิจกรรมประเมินไม่เปิดให้ใช้แต้มซื้อคำแปล</p><button onClick={async () => { try { await account.client.call('quote', { activityId: 'travel-assessment-v2', glossId: 'any' }); } catch (err) { setNotice(err.message); } }}>ทดลองขอคำแปลในโหมดประเมิน</button></section>
      <details className="credit-panel"><summary>ประวัติแต้ม</summary>{!account.state.ledger.length ? <p>ยังไม่มีรายการ</p> : <ul>{account.state.ledger.map(row => <li key={row.id}>{row.delta > 0 ? '+1 ฝึกครบชุด' : '−1 แลกคำแปล'} · {row.label} · {time(row.at)}</li>)}</ul>}</details>
    </>}
  </main>;
}
