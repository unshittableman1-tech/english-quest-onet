import { useEffect, useRef, useState } from 'react';
import { ZoomIn, X } from 'lucide-react';
import { inspectQuestionMedia } from '../utils/questionMedia';
import SpeakButton from './SpeakButton';
import QuestionChart from './QuestionChart';
import AssessmentDocument from './AssessmentDocument';
import AssessmentTable from './AssessmentTable';
import { hasDocumentPresentation, assessmentVisualTreatment } from '../utils/assessmentStimulusDesign';
import { assessmentStimulusPresentation } from '../data/assessmentStimulusPresentation';
import '../question-stimulus.css';

function ImageStimulus({ stimulus, onFailure }) {
  const art = stimulus.art || assessmentStimulusPresentation[stimulus.src];
  const structured = hasDocumentPresentation(art) || art?.kind === 'table' || art?.kind === 'bars';
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
  return <figure data-visual-treatment={assessmentVisualTreatment(art)} className={'question-stimulus-image' + (structured ? ' question-stimulus-image--document' : '')}>
    {hasDocumentPresentation(art)
      ? <AssessmentDocument art={art} />
      : art?.kind === 'table' ? <AssessmentTable stimulus={art} />
      : art?.kind === 'bars' ? <QuestionChart stimulus={{title:art.title,chartType:'bar',points:art.labels.map((label,index)=>({label,value:art.values[index]})),maximum:art.maximum,step:art.maximum%10===0&&art.maximum/10<=6?10:art.maximum/4,xLabel:'',yLabel:''}} />
      : <img src={stimulus.src} alt={stimulus.alt || 'สื่อประกอบโจทย์'} onError={fail} />}
    {stimulus.caption && <figcaption>{stimulus.caption}</figcaption>}
    <button ref={trigger} type="button" onClick={() => setExpanded(true)} aria-label="ขยายภาพโจทย์" title="ขยายภาพโจทย์"><ZoomIn size={20} /></button>
    {expanded && <dialog ref={dialog} className="question-stimulus-dialog" aria-label="ภาพประกอบโจทย์ขนาดใหญ่" onCancel={event => { event.preventDefault(); close(); }}>
      <button type="button" autoFocus onClick={close} aria-label="ปิดภาพขยาย"><X size={22} /></button>
      <img src={stimulus.src} alt={stimulus.alt || 'สื่อประกอบโจทย์'} onError={fail} />
    </dialog>}
  </figure>;
}

export default function QuestionStimulus({ question, allowSpeech = false, onFailure, renderText = text => text }) {
  const { stimuli, blocked } = inspectQuestionMedia(question);
  if (blocked) return <p className="question-stimulus-error" role="alert">ข้อนี้มีสื่อไม่ครบหรือยังใช้ข้อความแทนภาพ ต้องตรวจต้นฉบับก่อนนำมาประเมิน</p>;
  return <div className="question-stimuli">
    {stimuli.map((s, index) => <div key={`${question.id || ''}:${index}:${s.src || s.text || s.type}`}>
      {s.type === 'image' && <ImageStimulus stimulus={s} onFailure={onFailure} />}
      {s.type === 'chart' && <QuestionChart stimulus={s} />}
      {s.type === 'sequence' && <AssessmentDocument art={{kind:'process',title:s.title || '',steps:s.steps}} renderText={renderText} />}
      {s.type === 'passage' && <section className="question-stimulus-passage" aria-label="บทอ่านประกอบโจทย์">
        {allowSpeech && <SpeakButton text={s.text} label="ฟังบทอ่าน" />}
        {s.title && <h3>{renderText(s.title)}</h3>}<p>{renderText(s.text)}</p>
      </section>}
      {s.type === 'table' && <AssessmentTable stimulus={s} renderText={renderText} />}
    </div>)}
  </div>;
}
