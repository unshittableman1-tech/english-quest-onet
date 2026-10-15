import UIIcon, { UIIconText } from './UIIcon';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../App';
import FeedbackModal from './FeedbackModal';
import SpeakButton from './SpeakButton';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../utils/audio';

export default function ReviewMistakePage() {
  const { navigate, addXP, student, processReviewAnswer, checkBadges } = useApp();

  const mistakeBank = student?.mistakeBank || {};
  const allMistakes = useMemo(() => {
    return Object.values(mistakeBank).filter(q => !q.mastered);
  }, [mistakeBank]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [mainSelected, setMainSelected] = useState(null);
  const selectionLock = useRef(false);
  
  const q = feedbackData?.question || allMistakes[currentIdx] || allMistakes[0];
  const { mediaStatus, onMediaFailure } = useQuestionMedia(q ? [q] : []);
  useEffect(() => { selectionLock.current = false; }, [currentStep, q?.id]);

  const handleSelect = useCallback(async (idx) => {
    if (selectionLock.current || selected !== null || showFeedback || wrongAttempts.includes(idx)) return;
    selectionLock.current = true;
    if (q.type === 'two_step' && currentStep === 1) {
      setMainSelected(idx);
      setCurrentStep(2);
      setWrongAttempts([]);
      return;
    }
    setSelected(idx);
    
    const isMainCorrect = q.type === 'two_step' ? mainSelected === q.answer : idx === q.answer;
    const isReasonCorrect = q.type === 'two_step' ? idx === (q.correctReasonIndex ?? q.reasonAnswer) : false;
    const isCorrect = q.type === 'two_step' ? isMainCorrect && isReasonCorrect : isMainCorrect;

    if (!isCorrect) {
      playWrongSound();
      setShakeKey(k => k + 1);
      setWrongAttempts(prev => [...prev, idx]);
      if (student && !student.isDemo) {
        await processReviewAnswer(student.id, q.id, false);
      }
    } else {
      playCorrectSound();
      if (student && !student.isDemo) {
        const willBeMastered = (q.correctInReview || 0) >= 1;
        await processReviewAnswer(student.id, q.id, true);
        await addXP(10, '🧠 ทบทวนถูกต้อง (XP x5!)');
        if (willBeMastered) {
          await addXP(50, '🎉 ปราบข้อผิดสำเร็จ! (+50 XP)');
        }
        if (checkBadges) await checkBadges(); // Check & award badges upon fixing mistakes
      }
    }

    setFeedbackData({
      isCorrect,
      selectedIdx: q.type === 'two_step' ? mainSelected : idx,
      reasonSelectedIdx: q.type === 'two_step' ? idx : null,
      isMainCorrect, isReasonCorrect,
      question: q,
    });
    setShowFeedback(true);
  }, [selected, showFeedback, q, wrongAttempts, student, processReviewAnswer, addXP, checkBadges, currentStep, mainSelected]);

  const handleNext = useCallback((retrying = false) => {
    if (!feedbackData) return;
    selectionLock.current = false;
    
    if (retrying) {
      if (feedbackData.question.type === 'two_step' && !feedbackData.isMainCorrect) {
        setCurrentStep(1);
        setMainSelected(null);
        setWrongAttempts([]);
      }
      setSelected(null);
      setShowFeedback(false);
      setFeedbackData(null);
      return;
    }

    setShowFeedback(false);
    setFeedbackData(null);
    setSelected(null);
    setWrongAttempts([]);
    setCurrentStep(1);
    setMainSelected(null);

    const reviewedIndex = allMistakes.findIndex(item => item.id === feedbackData.question.id);
    // A mastered item disappears; its successor shifts into the same queue position.
    setCurrentIdx(allMistakes.length ? (reviewedIndex < 0 ? currentIdx : reviewedIndex + 1) % allMistakes.length : 0);
  }, [feedbackData, allMistakes, currentIdx]);

  if (q && mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={() => navigate('map')} />;
  if (allMistakes.length === 0 && !showFeedback) {
    return (
      <div className="review-page min-h-screen flex flex-col pb-24">
        <div className="review-header">
          <h1 className="text-2xl font-black text-gradient-gold"><UIIcon value={"🧠"} /> Review Mistakes</h1>
          <p className="text-slate-500 text-sm">ทบทวนข้อผิดของคุณ</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center max-w-sm w-full">
            <div className="text-5xl mb-4"><UIIcon value={"🎉"} /></div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">ยอดเยี่ยมมาก!</h2>
            <p className="text-slate-500 mb-6 text-sm">คุณไม่มีข้อผิดค้างในระบบแล้ว เก่งมาก!</p>
            <button className="btn-primary w-full" onClick={() => navigate('map')}>กลับไปที่ Quest Map</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-page min-h-screen flex flex-col pb-24">
      <header className="review-header">
        <button type="button" className="review-back" onClick={() => navigate('map')} aria-label="กลับ Quest Map"><UIIcon value="←" /></button>
        <div className="review-title"><h1><UIIcon value={"🧠"} /> Review Mistakes</h1><p>ตอบให้ถูก 2 ครั้งเพื่อลบออกจากรายการ</p></div>
        <strong className="review-count">เหลือ {allMistakes.length} ข้อ</strong>
        <progress value={Math.min(currentIdx + 1, allMistakes.length)} max={Math.max(allMistakes.length, 1)} aria-label={`ข้อ ${Math.min(currentIdx + 1, allMistakes.length)} จาก ${allMistakes.length}`} />
      </header>

      <div className="review-stage flex-1 px-4 py-2 mx-auto w-full">
        <div key={shakeKey} className="review-question-card glass-card p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-rose-600 inline-block border border-red-500/30">
              ตอบผิดไปแล้ว {q.timesWrong || 1} ครั้ง
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 inline-block">
              ถูกรอบทบทวน: {q.correctInReview || 0}/2
            </span>
          </div>

          <QuestionStimulus question={q} allowSpeech onFailure={onMediaFailure} />
          {q.type === 'two_step' && <p className="text-sm text-slate-500 mb-2">ขั้นที่ {currentStep}/2</p>}
          {currentStep === 2 && <div className="border-b border-amber-200 pb-3 mb-3 text-sm text-slate-600"><p>{q.question}</p><p className="font-bold mt-2">คำตอบที่เลือก: {q.options[mainSelected]}</p></div>}

          <div className="flex items-start gap-3">
            <p className="text-slate-800 font-bold text-lg leading-relaxed flex-1">{currentStep === 2 ? q.reasonQuestion || 'ทำไมคำตอบนี้จึงถูก?' : q.question}</p>
            <SpeakButton text={currentStep === 2 ? q.reasonQuestion || 'ทำไมคำตอบนี้จึงถูก?' : q.question} className="w-6 h-6 mt-1" />
          </div>
        </div>

        <div className="space-y-3">
          {(currentStep === 2 ? q.reasonChoices : q.options).map((opt, i) => {
            let cls = 'option-btn';
            const isWrongAttempt = wrongAttempts.includes(i);
            
            if (isWrongAttempt && selected !== i) {
               cls += ' opacity-50 bg-red-500/10 border-red-500/30 cursor-not-allowed';
            }

            if (selected !== null) {
              const key = currentStep === 2 ? q.correctReasonIndex ?? q.reasonAnswer : q.answer;
              if (i === key) cls += ' show-correct';
              if (i === selected && i !== key) cls += ' selected-wrong';
              if (i === selected && i === key) cls += ' selected-correct';
            }
            return (
              <div key={i} className="review-option-row">
              <button className={`${cls} review-option-main flex-1 flex items-center justify-between`} aria-label={`คำตอบ ${String.fromCharCode(65 + i)}: ${opt}`} onClick={() => handleSelect(i)} disabled={selected !== null || isWrongAttempt}>
                <div className="flex items-center">
                  <span className="mr-3 text-slate-500 font-bold text-sm shrink-0">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-left">{opt}</span>
                </div>
              </button>
              <SpeakButton text={opt} className="review-option-audio" />
              </div>
            );
          })}
        </div>
      </div>

      {showFeedback && feedbackData && (
        <FeedbackModal
          feedbackData={feedbackData}
          onNext={() => handleNext(false)}
          onRetry={() => handleNext(true)}
        />
      )}
    </div>
  );
}
