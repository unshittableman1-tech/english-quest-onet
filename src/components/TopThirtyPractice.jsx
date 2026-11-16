import { useEffect, useState } from 'react';
import { readTopThirtyHistory, saveTopThirtyHistory, topThirtyRequest } from '../utils/topThirtyPractice';
import TopThirtyQuestion from './TopThirtyQuestion';
import '../top-thirty-practice.css';

const forms = [
  { id: 'A', title: 'ก่อนเรียน', description: 'เริ่มก่อนเปิดตัวอย่างบทเรียน' },
  { id: 'B', title: 'หลังเรียน', description: 'ทำหลังฝึก โดยไม่ดูคำแปลหรือเฉลย' },
  { id: 'C', title: 'ติดตามผล', description: 'แนะนำหลังเรียน 7–14 วัน บันทึกหากทำเร็วกว่านั้น' },
];

export default function TopThirtyPractice({ learnerId, onBack }) {
  const [history, setHistory] = useState(() => readTopThirtyHistory(learnerId));
  const [priorExposure, setPriorExposure] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [units, setUnits] = useState(null);
  const [learningAt, setLearningAt] = useState('');
  const active = history.runs.find(run => run.attemptId === history.activeId);
  const item = active?.items[active.responses.length];
  useEffect(() => { setHistory(readTopThirtyHistory(learnerId)); }, [learnerId]);
  const commit = next => { setHistory(next); setSaveFailed(!saveTopThirtyHistory(learnerId, next)); };
  const updateRun = next => commit({ ...history, runs: history.runs.map(run => run.attemptId === next.attemptId ? next : run) });
  const showError = failure => setError(failure.code === 'attempt_expired' ? 'รอบนี้หมดอายุหรือเซิร์ฟเวอร์เริ่มใหม่แล้ว คำตอบร่างยังอยู่ในเครื่อง กรุณากลับไปเริ่มรอบใหม่ และระบุว่าเคยเห็นข้อสอบแล้ว' : failure.code === 'first_response_locked' ? 'คำตอบหลักนี้ล็อกแล้ว เปลี่ยนย้อนหลังไม่ได้' : 'เชื่อมต่อชุดข้อสอบไม่สำเร็จ กรุณาลองอีกครั้ง เว็บต้องเปิดผ่าน localhost บนเครื่องนี้');
  const start = async form => {
    setBusy(true); setError('');
    try {
      const run = await topThirtyRequest('start', { form, responseMode: 'recognition-v1' });
      const earlier = history.runs.some(previous => previous.form === form);
      commit({ ...history, activeId: run.attemptId, runs: [...history.runs, { ...run, responses: [], pending: null, result: null, priorExposure: priorExposure || earlier, learningAt: learningAt || null }] });
      setUnits(null);
    } catch (failure) { showError(failure); }
    finally { setBusy(false); }
  };
  const submit = async () => {
    setBusy(true); setError('');
    try {
      const result = await topThirtyRequest('submit', { attemptId: active.attemptId, responses: active.responses });
      updateRun({ ...active, result });
    } catch (failure) { showError(failure); }
    finally { setBusy(false); }
  };
  const openLessons = async () => {
    setBusy(true); setError('');
    try { setUnits((await topThirtyRequest('units')).units); }
    catch (failure) { showError(failure); }
    finally { setBusy(false); }
  };
  const exitRun = () => { setError(''); commit({ ...history, activeId: null }); };
  const exportHistory = () => {
    const download = new Blob([JSON.stringify({ ...history, activeId: null, includesAnswerKeys: false, localOnly: true }, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(download);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'top30-local-attempts.json'; anchor.click(); URL.revokeObjectURL(url);
  };
  const resultMode = active?.result?.responseMode || 'free-text-v1';
  return <main className="top30-page">
    <header className="top30-header"><button type="button" onClick={active ? exitRun : units ? () => setUnits(null) : onBack}>← {active || units ? 'กลับหน้าชุดฝึก' : 'กลับ Vocab'}</button><div><p>ชุดที่เจ้าของโครงการอนุมัติ · ใช้บนเครื่องนี้</p><h1>Top 30 · อ่านโจทย์ให้เข้าใจ</h1></div></header>
    <p className="top30-notice">A / B / C แบบละ 30 ข้อ · ไม่เพิ่ม XP/ดาวและไม่เปลี่ยนการปลดล็อก · คะแนนนี้ไม่ใช่การรับรองความเชี่ยวชาญ</p>
    {saveFailed && <p role="alert" className="top30-warning">บันทึกในเครื่องไม่สำเร็จ อย่าปิดหน้านี้ก่อนส่งออกประวัติ</p>}
    {error && <p role="alert" className="top30-warning">{error}</p>}
    {active ? active.result ? <section className="top30-panel" aria-label="ผลการทำข้อสอบ">
      <h2>บันทึกผล Form {active.form} แล้ว</h2><p className="top30-score">ถูก {active.result.correct} / {active.result.answered} ข้อที่ตอบ</p>
      <p>ทั้งหมด 30 ข้อ · ไม่ตอบ {active.result.missing} ข้อ · ความถูกต้อง {active.result.accuracyPercent === null ? 'ไม่มีข้อมูล' : `${active.result.accuracyPercent}%`}</p>
      <p>รูปแบบเหตุผล: <strong>{resultMode === 'recognition-v1' ? 'เลือกตอบ' : resultMode === 'mixed' ? 'ผสมแบบพิมพ์เดิมกับเลือกตอบ' : 'แบบพิมพ์เดิม'}</strong> · ไม่เทียบคะแนนเหตุผลต่างรูปแบบโดยตรง</p>
      <p>ความเข้าใจคำถาม: <strong>รอผู้สอนตรวจ</strong><br />หลักฐานจากข้อความ: <strong>รอผู้สอนตรวจ</strong></p>
      <p>ไม่ได้รวมสามมิติเป็นคะแนน mastery และยังไม่แสดงเฉลยเพื่อไม่รบกวนการทำรอบถัดไป</p>
      {active.form === 'C' && <p>รวมข้างต้นเป็นเพียงความถูกต้องของทั้งแบบ C; ข้อ C08 เป็น extension แยกต่างหาก ไม่ใช้คำนวณพัฒนาการจาก A/B และระบบนี้ไม่คำนวณ gain</p>}
      {active.result.unresolvedItemIds.length > 0 && <p className="top30-warning">หน่วย 16 ยังมีข้อสังเกตเรื่องผู้ให้ยืมกับเจ้าของ คะแนนเป็นไปตามเฉลยฉบับที่อนุมัติ ไม่ควรใช้ข้อนี้ตัดสินความสามารถโดยลำพัง</p>}
      <p>{active.priorExposure ? 'ระบุว่าเคยเห็นแบบนี้แล้ว / เป็นรอบซ้ำ' : 'ไม่ได้ระบุว่าเคยเห็นแบบนี้ ไม่ถือเป็นการยืนยันว่าไม่เคยเห็นจริง'} · ใช้ความช่วยเหลือ {active.result.assistedResponses} ข้อ</p>
      <button type="button" className="top30-primary" onClick={exportHistory}>ส่งออกคำตอบและผลให้ผู้สอน</button><button type="button" onClick={exitRun}>กลับหน้าชุดฝึก</button>
    </section> : item ? <TopThirtyQuestion key={`${active.attemptId}-${item.id}`} run={active} item={item} onPending={pending => updateRun({ ...active, pending })} onRecord={answer => updateRun({ ...active, pending: null, responses: [...active.responses, answer] })} onError={showError} /> : <section className="top30-panel">
      <h2>บันทึกครบ 30 ข้อแล้ว</h2><p>ส่งตรวจความถูกต้องบนเซิร์ฟเวอร์ในเครื่อง เหตุผลทั้งสองส่วนยังรอผู้สอนตรวจ</p><button type="button" className="top30-primary" disabled={busy} onClick={submit}>{busy ? 'กำลังตรวจ…' : 'ส่งแบบทดสอบ'}</button><button type="button" onClick={exportHistory}>ส่งออกฉบับร่าง</button>
    </section> : units ? <section className="top30-panel"><h2>ตัวอย่างเรียนรู้ 30 หน่วย</h2><p>เปิดส่วนนี้หลังทำ A และก่อน B · เป็นตัวอย่าง Discover ไม่ใช่กิจกรรม Recognize ที่ผ่านการตรวจครบแล้ว</p>{units.map(unit => <details key={unit.id}><summary>{unit.unit}. {unit.target}</summary><p>{unit.meaning_th}</p><p>{unit.scope_th}</p>{unit.examples.map((example, index) => <div className="top30-example" key={index}><strong>{example.en}</strong><details><summary>ดูความหมายภาษาไทย</summary><p>{example.th}</p></details></div>)}</details>)}</section> : <>
      <section className="top30-panel"><h2>เลือกช่วงการเรียน</h2><p>เก็บประวัติและคำตอบแยกตามนักเรียนในเบราว์เซอร์นี้เท่านั้น ไม่ส่งขึ้นระบบโรงเรียน</p><p>รูปแบบใหม่: ล็อกคำตอบหลัก → เลือกสิ่งที่โจทย์ถาม → เลือกหลักฐาน · มี “ยังไม่แน่ใจ” และไม่บังคับพิมพ์</p><label className="top30-check"><input type="checkbox" checked={priorExposure} onChange={event => setPriorExposure(event.target.checked)} />เคยเห็นข้อสอบหรือเฉลยชุดนี้มาก่อน</label><label>วันที่เรียนสำหรับการติดตาม C (ถ้าทราบ)<input type="date" value={learningAt} max={new Date().toLocaleDateString('en-CA')} onChange={event => setLearningAt(event.target.value)} /></label><div className="top30-form-grid">{forms.map(form => <article key={form.id}><span className="top30-form-badge">{form.id}</span><h3>{form.title}</h3><p>{form.description}</p><button type="button" className="top30-primary" disabled={busy} onClick={() => start(form.id)}>เริ่ม Form {form.id} · 30 ข้อ</button></article>)}</div><button type="button" disabled={busy} onClick={openLessons}>เปิดตัวอย่างเรียนรู้ทั้ง 30 หน่วย</button><p>ยังมีข้อสังเกตทางเนื้อหาบางข้อ การอนุมัติของเจ้าของไม่เท่ากับการพิสูจน์ความยากเท่ากันหรือประสิทธิผลทางการศึกษา</p></section>
      <section className="top30-panel"><h2>รอบที่บันทึกในเครื่อง</h2>{history.runs.length === 0 ? <p>ยังไม่มีรอบที่บันทึก</p> : <><button type="button" onClick={exportHistory}>ส่งออกประวัติให้ผู้สอน</button>{[...history.runs].reverse().map(run => <div className="top30-history" key={run.attemptId}><span>Form {run.form} · {run.result ? `ถูก ${run.result.correct}/${run.result.answered} · รอผู้สอนตรวจเหตุผล` : `ร่าง ${run.responses.length}/30 ข้อ`}<small>{new Date(run.startedAt).toLocaleString('th-TH')}{run.priorExposure ? ' · รอบซ้ำ/เคยเห็น' : ''}</small></span><button type="button" onClick={() => commit({ ...history, activeId: run.attemptId })}>{run.result ? 'ดูผล' : 'ทำต่อ'}</button></div>)}</>}</section>
    </>}
  </main>;
}
