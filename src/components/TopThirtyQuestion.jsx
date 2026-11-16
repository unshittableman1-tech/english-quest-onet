import { useState } from 'react';
import { parseTopThirtyContext, topThirtyRequest } from '../utils/topThirtyPractice';

function Context({ value }) {
  const context = parseTopThirtyContext(value);
  if (!context.table) return <div className="top30-context">{context.text}</div>;
  return <><div className="top30-table-wrap"><table><caption>Information for this question</caption><thead><tr>{context.table.headers.map((header, index) => <th scope="col" key={index}>{header}</th>)}</tr></thead><tbody>{context.table.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => column === 0 ? <th scope="row" key={column}>{cell}</th> : <td key={column}>{cell}</td>)}</tr>)}</tbody></table></div>{context.trailing && <p>{context.trailing}</p>}</>;
}

export default function TopThirtyQuestion({ run, item, onPending, onRecord, onError }) {
  const pending = run.pending?.id === item.id ? run.pending : null;
  const [selected, setSelected] = useState(null);
  const [understandingChoice, setUnderstandingChoice] = useState(null);
  const [evidenceChoices, setEvidenceChoices] = useState([]);
  const [additionalExplanation, setAdditionalExplanation] = useState('');
  const [assisted, setAssisted] = useState(pending?.assisted ?? false);
  const [busy, setBusy] = useState(false);
  const locked = Boolean(pending);
  const choice = locked ? pending.choice : selected;
  const record = (guidance, chosen, understandingId, evidenceIds, note = '') => onRecord({
    id: item.id, choice: chosen, responseMode: 'recognition-v1', guidanceVersion: guidance.version,
    understandingChoice: understandingId, evidenceChoices: evidenceIds, additionalExplanation: note, assisted,
    understanding: guidance.understanding.find(option => option.id === understandingId)?.label ?? '',
    evidence: evidenceIds.map(id => guidance.evidence.find(option => option.id === id)?.label ?? '').join('\n'),
  });
  const lock = async skip => {
    if (!skip && selected === null || busy) return;
    setBusy(true);
    try {
      const result = await topThirtyRequest('reasoning', { attemptId: run.attemptId, itemId: item.id, choice: skip ? null : selected });
      if (skip) record(result.guidance, null, 'unsure', ['unsure']);
      else onPending({ id: item.id, choice: result.lockedChoice, guidance: result.guidance, assisted });
    } catch (failure) { onError(failure); }
    finally { setBusy(false); }
  };
  const toggleEvidence = id => setEvidenceChoices(previous => id === 'unsure' ? ['unsure'] : previous.includes(id) ? previous.filter(value => value !== id) : [...previous.filter(value => value !== 'unsure'), id]);
  return <section className="top30-panel" aria-label="ข้อสอบ">
    <div className="top30-progress"><strong>Form {run.form} · ข้อ {run.responses.length + 1}/30</strong><progress value={run.responses.length} max={30} aria-label="จำนวนข้อที่บันทึกแล้ว" /></div>
    <Context value={item.context_en} />
    <fieldset disabled={locked || busy}><legend>{item.question_en}</legend><div className="top30-options">{item.options.map((option, index) => <label key={index} className={choice === index ? 'is-selected' : ''}><input type="radio" name={item.id} checked={choice === index} onChange={() => setSelected(index)} /><span className="top30-letter">{'ABCD'[index]}</span><span>{option}</span></label>)}</div></fieldset>
    {locked ? <div className="top30-explanations">
      <p role="status">ล็อกคำตอบหลักแล้ว เปลี่ยนย้อนหลังไม่ได้ ต่อไปลองเลือกสิ่งที่โจทย์ถามและหลักฐาน ไม่ต้องพิมพ์ก็ได้</p>
      <fieldset><legend>โจทย์กำลังถามอะไร?</legend><div className="top30-options">{pending.guidance.understanding.map(option => <label key={option.id} className={understandingChoice === option.id ? 'is-selected' : ''}><input type="radio" name={`${item.id}-understanding`} checked={understandingChoice === option.id} onChange={() => setUnderstandingChoice(option.id)} /><span>{option.label}</span></label>)}</div></fieldset>
      <fieldset><legend>ข้อความส่วนไหนสนับสนุนคำตอบ?</legend><p>เลือกได้มากกว่าหนึ่งข้อความ หากต้องใช้หลายส่วนร่วมกัน</p><div className="top30-options">{pending.guidance.evidence.map(option => <label key={option.id} className={evidenceChoices.includes(option.id) ? 'is-selected' : ''}><input type="checkbox" checked={evidenceChoices.includes(option.id)} onChange={() => toggleEvidence(option.id)} /><span>{option.label}</span></label>)}</div></fieldset>
      <details><summary>อธิบายเพิ่มเติม — ไม่บังคับ</summary><label>เกี่ยวข้องกับคำตอบอย่างไร?<textarea maxLength={1200} value={additionalExplanation} onChange={event => setAdditionalExplanation(event.target.value)} /></label></details>
      <label className="top30-check"><input type="checkbox" checked={assisted} onChange={event => setAssisted(event.target.checked)} />ข้อนี้มีคนช่วยอ่าน แปล หรือให้คำใบ้</label>
      <p><small>ส่วนนี้เป็นการเลือกเหตุผลที่มีให้ ไม่ใช่การอธิบายเอง คะแนนยังรอผู้สอนตรวจ และไม่เทียบกับแบบพิมพ์เดิมโดยตรง</small></p>
      <button type="button" className="top30-primary" disabled={understandingChoice === null || evidenceChoices.length === 0} onClick={() => record(pending.guidance, pending.choice, understandingChoice, evidenceChoices, additionalExplanation)}>บันทึกเหตุผลและไปต่อ →</button>
    </div> : <>
      <label className="top30-check"><input type="checkbox" checked={assisted} onChange={event => setAssisted(event.target.checked)} />ข้อนี้มีคนช่วยอ่าน แปล หรือให้คำใบ้</label>
      <div className="top30-actions"><button type="button" className="top30-primary" disabled={selected === null || busy} onClick={() => lock(false)}>{busy ? 'กำลังบันทึก…' : 'ล็อกคำตอบ แล้วเลือกเหตุผล →'}</button><button type="button" disabled={busy} onClick={() => lock(true)}>ข้าม / ยังไม่ตอบ</button></div>
      <small>เลือกคำตอบหลักก่อน จึงจะเห็นตัวเลือกเหตุผล เพื่อไม่ให้ตัวช่วยใบ้คำตอบหลัก</small>
    </>}
  </section>;
}
