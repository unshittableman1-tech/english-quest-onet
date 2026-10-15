import { useEffect, useRef, useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import { inspectQuestionMedia } from '../utils/questionMedia';
import SpeakButton from './SpeakButton';
import QuestionChart from './QuestionChart';
import '../question-stimulus.css';

function ImageStimulus({ stimulus, onFailure }) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialog = useRef(null);
  const trigger = useRef(null);
  useEffect(() => {
    if (expanded) dialog.current?.showModal();
  }, [expanded]);
  const close = () => { dialog.current?.close(); setExpanded(false); trigger.current?.focus(); };
  const fail = () => { setFailed(true); onFailure?.(); };
  if (failed) return <p role="alert">ไม่สามารถโหลดสื่อของข้อนี้ได้ กรุณากลับไปเลือกบทเรียน</p>;
  return <figure className="question-stimulus-image">
    <img src={stimulus.src} alt={stimulus.alt || 'สื่อประกอบโจทย์'} onError={fail} />
    {stimulus.caption && <figcaption>{stimulus.caption}</figcaption>}
    <button ref={trigger} type="button" onClick={() => setExpanded(true)} aria-label="ขยายภาพโจทย์" title="ขยายภาพโจทย์"><ZoomIn size={20} /></button>
    {expanded && <dialog ref={dialog} className="question-stimulus-dialog" aria-label="ภาพประกอบโจทย์ขนาดใหญ่" onCancel={event => { event.preventDefault(); close(); }}>
      <button type="button" autoFocus onClick={close} aria-label="ปิดภาพขยาย"><X size={22} /></button>
      <img src={stimulus.src} alt={stimulus.alt || 'สื่อประกอบโจทย์'} onError={fail} />
    </dialog>}
  </figure>;
}

export default function QuestionStimulus({ question, allowSpeech = false, onFailure }) {
  const { stimuli, blocked } = inspectQuestionMedia(question);
  if (blocked) return <p className="question-stimulus-error" role="alert">ข้อนี้มีสื่อไม่ครบหรือยังใช้ข้อความแทนภาพ ต้องตรวจต้นฉบับก่อนนำมาประเมิน</p>;
  return <div className="question-stimuli">
    {stimuli.map((s, index) => <div key={`${question.id || ''}:${index}:${s.src || s.text || s.type}`}>
      {s.type === 'image' && <ImageStimulus stimulus={s} onFailure={onFailure} />}
      {s.type === 'chart' && <QuestionChart stimulus={s} />}
      {s.type === 'sequence' && <figure className="question-stimulus-sequence"><figcaption>{s.title}</figcaption>
        <ol>{s.steps.map((step, i) => <li key={i}><span>{i + 1}</span>{step}</li>)}</ol>
      </figure>}
      {s.type === 'passage' && <section className="question-stimulus-passage" aria-label="บทอ่านประกอบโจทย์">
        {allowSpeech && <SpeakButton text={s.text} label="ฟังบทอ่าน" />}
        {s.title && <h3>{s.title}</h3>}<p>{s.text}</p>
      </section>}
      {s.type === 'table' && <div className="question-stimulus-table" role="region" aria-label={s.title || 'ตารางประกอบโจทย์'} tabIndex={0}>
        <table><caption>{s.title || 'ตารางประกอบโจทย์'}</caption>
          <thead><tr>{s.columns.map((cell, i) => <th scope="col" key={i}>{cell}</th>)}</tr></thead>
          <tbody>{s.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>}
    </div>)}
  </div>;
}
