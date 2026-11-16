import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { checkComprehension, nextHintIndex } from '../utils/questionUnderstanding';

export default function QuestionDecoder({ guide, questionId }) {
  const [visible, setVisible] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const [comprehensionChoice, setComprehensionChoice] = useState(null);
  useEffect(() => { setVisible(false); setHintCount(0); setComprehensionChoice(null); }, [questionId]);
  if (!guide) return null;
  const check = guide.comprehensionCheck;
  const result = checkComprehension(guide, comprehensionChoice);
  return <section className="question-decoder" aria-label="ช่วยทำความเข้าใจโจทย์">
    <button type="button" className="quiz-translation-button" aria-expanded={visible} onClick={() => setVisible(value => !value)}><BookOpen size={18} />ช่วยทำความเข้าใจโจทย์</button>
    {visible && <div className="question-decoder-content">
      <p>เปิดคำใบ้ทีละขั้น ไม่บอกคำตอบ</p>
      <ol>{guide.progressiveHints.slice(0, hintCount).map((hint, index) => <li key={index}><strong>ขั้น {index + 1}</strong> {hint}</li>)}</ol>
      {hintCount < guide.progressiveHints.length && <button type="button" onClick={() => setHintCount(value => nextHintIndex(value, guide))}>ดูคำใบ้ขั้นต่อไป</button>}
      {check && hintCount > 0 && <fieldset><legend>{check.promptTh}</legend>{check.choices.map((choice, index) => <button type="button" key={choice} aria-pressed={comprehensionChoice === index} onClick={() => setComprehensionChoice(index)}>{choice}</button>)}{result !== null && <p role="status">{result ? check.correctFeedbackTh : check.incorrectFeedbackTh}</p>}</fieldset>}
      {result !== null && <p className="question-decoder-note">การตรวจความเข้าใจนี้ไม่คิดคะแนนหรือ XP</p>}
    </div>}
  </section>;
}
