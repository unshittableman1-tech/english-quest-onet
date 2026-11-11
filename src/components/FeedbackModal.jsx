import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, CircleHelp, ArrowRight, RotateCcw, Volume2, Square, KeyRound } from 'lucide-react';
import { useSpeech } from '../utils/useSpeech';
import { getQuestionTranslation, getSpokenFeedbackText } from '../utils/questionTranslator';
import { getQuestionFeedback } from '../utils/questionFormat';
import AICompanionPanel from './AICompanionPanel';
import { getLearningFeedback } from '../utils/questionUnderstanding';

function HighlightKeyword({ text = '', keyword = '' }) {
  const words = (typeof keyword === 'string' ? keyword : '').split(/[|,=\n]/).map(word => word.trim()).filter(word => word.length > 2 && /[a-zA-Z]/.test(word));
  if (!words.length || !text) return <>{text}</>;
  const pattern = new RegExp(`(${words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.split(pattern).map((part, index) => index % 2
    ? <mark key={index}>{part}</mark> : <span key={index}>{part}</span>);
}

function ChoiceAnalysis({ options = [], answer, selected, title }) {
  return <section className="feedback-analysis" aria-label={title}>
    <h3>{title}</h3>
    <ul>{options.map((option, index) => {
      const correct = index === answer;
      const chosen = index === selected;
      return <li key={index} className={correct ? 'is-correct' : chosen ? 'is-wrong' : ''}>
        <span className="feedback-letter">{String.fromCharCode(65 + index)}.</span>
        <span className="feedback-option-text">{option}</span>
        {correct ? <span className="feedback-choice-state"><CheckCircle2 size={15} />คำตอบที่ถูก</span>
          : chosen ? <span className="feedback-choice-state"><CircleHelp size={15} />คำตอบที่เลือก</span> : null}
      </li>;
    })}</ul>
  </section>;
}

export default function FeedbackModal({ feedbackData, onNext, onRetry, aiVerificationPending = false }) {
  const { isCorrect, question, selectedIdx, reasonSelectedIdx } = feedbackData;
  const { speak, stop, speaking } = useSpeech();
  const [cooldown, setCooldown] = useState(isCorrect ? 0 : 2);
  const dialog = useRef(null);
  const explanationText = getQuestionFeedback(question, feedbackData);
  const translation = getQuestionTranslation(question);
  const keywords = (question.keyword || '').split(/[|,]/).map(word => word.trim()).filter(Boolean);
  const learning = getLearningFeedback(feedbackData.questionGuide);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    element.querySelector('h2').focus();
    return () => element.close();
  }, []);

  useEffect(() => {
    if (isCorrect) return;
    const speechTimer = setTimeout(() => speak(getSpokenFeedbackText(question, explanationText)), 350);
    return () => clearTimeout(speechTimer);
  }, [isCorrect, question, explanationText, speak]);

  useEffect(() => {
    if (isCorrect) return;
    const timer = setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearInterval(timer);
  }, [isCorrect]);

  const listen = text => { if (speaking) stop(); else speak(text); };
  function keepFocus(event) {
    if (event.key !== 'Tab') return;
    const buttons = [...dialog.current.querySelectorAll('button:not(:disabled)')];
    const first = buttons[0];
    const last = buttons.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current.querySelector('h2'))) {
      event.preventDefault(); last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first?.focus();
    }
  }
  return createPortal(
    <dialog ref={dialog} className={`feedback-dialog ${isCorrect ? 'is-correct' : 'is-wrong'}`}
      aria-label={isCorrect ? 'ผลคำตอบถูก' : 'ทบทวนคำตอบ'} onCancel={event => event.preventDefault()} onKeyDown={keepFocus}>
      <header className="feedback-header">
        {isCorrect ? <CheckCircle2 size={26} aria-hidden="true" /> : <CircleHelp size={26} aria-hidden="true" />}
        <div><h2 tabIndex={-1}>{isCorrect ? 'ถูกต้อง เก่งมาก!' : 'มาทบทวนคำตอบกัน'}</h2>
          <p>{isCorrect ? '+10 XP เมื่อไปข้อต่อไป' : 'อ่านเฉลย แล้วลองตอบใหม่หรือไปข้อต่อไปได้เลย'}</p></div>
        <button className="feedback-listen" aria-pressed={speaking} onClick={() => listen(isCorrect ? explanationText : getSpokenFeedbackText(question, explanationText))}>
          {speaking ? <Square size={16} /> : <Volume2 size={18} />}{speaking ? 'หยุดเสียงอ่าน' : 'ฟังคำอธิบาย'}
        </button>
      </header>
      <div className="feedback-body">
        {question.type === 'two_step' && <div className="feedback-steps">
          <span>{feedbackData.isMainCorrect ? 'คำตอบหลักถูก' : 'คำตอบหลักยังไม่ถูก'}</span>
          <span>{feedbackData.isReasonCorrect ? 'เหตุผลถูก' : 'เหตุผลยังไม่ถูก'}</span>
        </div>}
        <section className="feedback-translation" aria-label="คำแปลโจทย์">
          <h3>คำแปลโจทย์</h3>
          <p>{translation || 'ยังไม่มีคำแปลภาษาไทยสำหรับข้อนี้'}</p>
        </section>
        <section className="feedback-explanation" aria-label="คำอธิบาย">
          <h3>ทำไมจึงตอบข้อนี้</h3>
          <p><HighlightKeyword text={explanationText} keyword={question.keyword} /></p>
          {keywords.length > 0 && <ul className="feedback-keywords" aria-label="คำสำคัญ">{keywords.map((word, index) => <li key={index}><KeyRound size={13} aria-hidden="true" />{word}</li>)}</ul>}
        </section>
        {learning && <section className="feedback-explanation" aria-label="คำอธิบายเพื่อการเรียนรู้">
          <h3>เข้าใจโจทย์และลองใหม่</h3>
          {learning.meaning && <p><strong>โจทย์ถาม:</strong> {learning.meaning}</p>}
          {learning.vocabulary.length > 0 && <p><strong>คำสำคัญ:</strong> {learning.vocabulary.map(item => `${item.word} = ${item.meaningTh}`).join(' · ')}</p>}
          {learning.tip && <p><strong>ลองฝึกต่อ:</strong> {learning.tip}</p>}
        </section>}
        <ChoiceAnalysis title="วิเคราะห์ตัวเลือก" options={question.options} answer={question.answer} selected={selectedIdx} />
        {question.type === 'two_step' && <ChoiceAnalysis title="วิเคราะห์เหตุผล" options={question.reasonChoices} answer={question.correctReasonIndex ?? question.reasonAnswer} selected={reasonSelectedIdx} />}
        {!isCorrect && <AICompanionPanel questId={feedbackData.questId || question.quest} questionId={question.id} verificationPending={aiVerificationPending} />}
      </div>
      <footer className="feedback-actions">
        {!isCorrect && <button className="qm-secondary" disabled={cooldown > 0} onClick={onRetry}><RotateCcw size={18} />{cooldown > 0 ? `ลองอีกครั้ง (${cooldown} วิ)` : 'ลองอีกครั้ง'}</button>}
        <button className="qm-primary" onClick={onNext}>ข้อต่อไป<ArrowRight size={18} /></button>
      </footer>
    </dialog>, document.body
  );
}
