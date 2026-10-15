import UIIcon, { UIIconText } from './UIIcon';
import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Languages, RotateCcw, Map, CheckCircle2 } from 'lucide-react';
import { useApp } from '../App';
import { QUESTS } from '../data/questions';
import { XP_RULES } from '../utils/scoring';
import FeedbackModal from './FeedbackModal';
import SpeakButton from './SpeakButton';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';
import VocabTooltip from './VocabTooltip';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../utils/audio';
import { updateBadgeStats } from '../utils/storage';
import { getQuestionTranslation } from '../utils/questionTranslator';
import { isPracticeQuestionReady } from '../utils/questionMedia';

export default function QuizPage({ questId }) {
  const { navigate, addXP, completeQuest, student, showToast, saveMistake, checkBadges } = useApp();

  const quest     = QUESTS.find(q => q.id === questId);
  const selectionLock = useRef(false);
  const nextLock = useRef(false);
  const firstResponses = useRef({});
  const firstResponseScoring = Boolean(quest?.questions?.length && quest.questions.every(item => item.scoringPolicy === 'first_response_v1'));
  const isExamMode = questId === 'finalboss' || quest?.isExam;
  const practicePool = isExamMode ? (quest?.questions || []) : (quest?.questions?.filter(isPracticeQuestionReady) || []);
  const heldItems = (quest?.questions?.length || 0) - practicePool.length;

  const [questions] = useState(() => {
    const allQ = practicePool;
    return [...allQ].sort(() => Math.random() - 0.5).slice(0, 10).map(q => {
      // Shuffle options (support both options and choices key)
      const rawOptions = q.options || q.choices || [];
      const opts = rawOptions.map((text, originalIndex) => ({ text, originalIndex }));
      opts.sort(() => Math.random() - 0.5);
      const correctIdx = q.answer !== undefined ? q.answer : q.correctIndex;
      const newAnswerIndex = opts.findIndex(o => o.originalIndex === correctIdx);
      
      let newQ = {
        ...q,
        options: opts.map(o => o.text),
        answer: newAnswerIndex
      };
      
      if (q.type === 'two_step') {
         const rOpts = q.reasonChoices.map((text, originalIndex) => ({ text, originalIndex }));
         rOpts.sort(() => Math.random() - 0.5);
         newQ.reasonChoices = rOpts.map(o => o.text);
         const targetReasonIdx = q.correctReasonIndex !== undefined ? q.correctReasonIndex : q.reasonAnswer;
         newQ.correctReasonIndex = rOpts.findIndex(o => o.originalIndex === targetReasonIdx);
      }
      
      return newQ;
    });
  });

  const [currentIdx, setCurrentIdx]         = useState(0);
  const [selected, setSelected]             = useState(null);
  const [answers, setAnswers]               = useState([]);
  const [combo, setCombo]                   = useState(0);
  const [showFeedback, setShowFeedback]     = useState(false);
  const [feedbackData, setFeedbackData]     = useState(null);
  const [showSummary, setShowSummary]       = useState(false);
  const [shakeKey, setShakeKey]             = useState(0);
  const [wrongAttempts, setWrongAttempts]   = useState([]);
  const [roundResult, setRoundResult]       = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // For Two-Step Questions
  const [currentStep, setCurrentStep]       = useState(1);
  const [mainSelected, setMainSelected]     = useState(null);
  const [twoStepSessionStats]               = useState({ mainCorrect: 0, reasonCorrect: 0, bothCorrect: 0, fastGuessCount: 0 });
  const [showTranslation, setShowTranslation] = useState(false);
  const [globalTranslate, setGlobalTranslate] = useState(() => {
    return localStorage.getItem('globalTranslate') === 'true';
  });

  const toggleGlobalTranslate = () => {
    setGlobalTranslate(prev => {
      const newVal = !prev;
      localStorage.setItem('globalTranslate', newVal);
      return newVal;
    });
  };

  useEffect(() => {
    setShowTranslation(false);
    selectionLock.current = false;
    nextLock.current = false;
  }, [currentIdx, currentStep]);

  const xp = student?.xp || 0;
  const level = student?.level || 1;
  const q = questions[currentIdx];
  const { mediaStatus, onMediaFailure } = useQuestionMedia(questions);
  const translation = getQuestionTranslation(q);

  const studentPermission = student?.translatePermission || 'full';
  // Effective Translate Mode: 'full' | 'vocab_only' | 'off'
  const effectiveTranslateMode = isExamMode ? 'off' : studentPermission;

  const totalCorrect = answers.filter(a => a.correct).length;
  const progress = Math.round(((currentIdx) / questions.length) * 100);

  const handleSelect = useCallback((idx) => {
    // FIX: At step 2 of two_step questions, do NOT check wrongAttempts because those contain
    // indices from step 1 (main answer choices). Step 1 index 0 is a DIFFERENT button from
    // step 2 index 0 (reason choices). Mixing them blocks the correct reason from being clicked.
    const isBlockedByWrongAttempt = currentStep === 1 && wrongAttempts.includes(idx);
    if (selectionLock.current || selected !== null || showFeedback || isBlockedByWrongAttempt) return;
    selectionLock.current = true;
    
    // Time tracking
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    if (firstResponseScoring && currentStep === 1 && !firstResponses.current[currentIdx]) {
      firstResponses.current[currentIdx] = { selected: idx, correct: idx === q.answer, choice: q.options[idx] };
    }
    
    // Check Fast Guess
    if (timeSpent < 3) {
       twoStepSessionStats.fastGuessCount++;
       if (twoStepSessionStats.fastGuessCount > 3) {
          showToast('อ่านโจทย์ก่อนนะนักผจญภัยน้อย', 'warning');
       }
       setCombo(0); // Break combo if too fast
    }
    
    if (q.type === 'two_step' && currentStep === 1) {
      setMainSelected(idx);
      setCurrentStep(2);
      setWrongAttempts([]); // FIX: Clear step-1 wrong attempts so they don't contaminate step-2 reason indices
      setQuestionStartTime(Date.now()); // Reset timer for step 2
      return;
    }

    setSelected(idx);
    
    let isCorrect = false;
    let isMainCorrect = false;
    let isReasonCorrect = false;
    
    if (q.type === 'two_step') {
      isMainCorrect = mainSelected === q.answer;
      isReasonCorrect = idx === q.correctReasonIndex;
      isCorrect = isMainCorrect && isReasonCorrect; // For two-step, both must be right to be completely 'correct' for combo
      
      // Update stats
      if (isMainCorrect) twoStepSessionStats.mainCorrect++;
      if (isReasonCorrect) twoStepSessionStats.reasonCorrect++;
      if (isCorrect) twoStepSessionStats.bothCorrect++;
    } else {
      isCorrect = idx === q.answer;
    }

    if (!isCorrect) {
      playWrongSound();
      setShakeKey(k => k + 1);
      setCombo(0);
      
      if (q.type === 'two_step') {
        if (!isMainCorrect) {
          setWrongAttempts(prev => prev.includes(mainSelected) ? prev : [...prev, mainSelected]);
        }
      } else {
        setWrongAttempts(prev => [...prev, idx]);
      }
      
      addXP(-5, 'ตอบผิด');
      if (student && !student.isDemo) {
        saveMistake(student.id, q);
      }
    } else {
      playCorrectSound();
      // Add Strategy Bonus if two-step
      if (q.type === 'two_step') {
        addXP(5, 'Strategy Bonus! 🌟');
      }
    }

    setFeedbackData({
      isCorrect,
      selectedIdx: q.type === 'two_step' ? mainSelected : idx,
      reasonSelectedIdx: q.type === 'two_step' ? idx : null,
      isMainCorrect,
      isReasonCorrect,
      question: q,
      timeSpent // pass to handleNext
    });
    setShowFeedback(true);
  }, [selected, showFeedback, wrongAttempts, q, questionStartTime, addXP, student, saveMistake, currentStep, mainSelected, showToast, twoStepSessionStats, firstResponseScoring, currentIdx]);

  const handleNext = useCallback((retrying = false) => {
    if (nextLock.current) return;
    nextLock.current = true;
    if (retrying) {
      // Retry: reset selection
      setSelected(null);
      if (q.type === 'two_step') {
         if (feedbackData?.isMainCorrect) {
            setCurrentStep(2);
         } else {
            setCurrentStep(1);
            setMainSelected(null);
         }
      }
      setShowFeedback(false);
      setFeedbackData(null);
      selectionLock.current = false;
      nextLock.current = false;
      setQuestionStartTime(Date.now());
      return;
    }

    if (!feedbackData) { nextLock.current = false; return; }
    const { isCorrect } = feedbackData;

    const timeSpent = feedbackData.timeSpent || 0;

    // Record answer
    const firstResponse = firstResponses.current[currentIdx];
    const newAnswers = [...answers, { q, selected, correct: firstResponseScoring ? firstResponse?.correct === true : isCorrect,
      ...(firstResponseScoring ? { firstResponse, practiceCorrect: isCorrect } : {}) }];
    setAnswers(newAnswers);

    // Update Stats & XP
    if (isCorrect) {
      addXP(10, 'ตอบถูก');
      
      const newCombo = combo + 1;
      setCombo(newCombo);
      
      // Update maxCombo and correctBySkill
      if (student && !student.isDemo) {
        const statsUpdates = {};
        const currentMax = student.badgeStats?.maxCombo || 0;
        if (newCombo > currentMax) statsUpdates.maxCombo = newCombo;
        
        const category = quest?.category || questId; // Default to questId if category not set
        statsUpdates.correctBySkill = {
           [category]: (student.badgeStats?.correctBySkill?.[category] || 0) + 1
        };
        
        if (wrongAttempts.length > 0) {
           statsUpdates.retryCorrectCount = (student.badgeStats?.retryCorrectCount || 0) + 1;
        }

        updateBadgeStats(statsUpdates).then(() => checkBadges());
      }
      
      if (newCombo === 3)  { addXP(XP_RULES.COMBO_3,  'Combo x3! 🔥'); showToast('🔥 Combo x3! +5 XP'); }
      if (newCombo === 5)  { addXP(XP_RULES.COMBO_5,  'Combo x5! ⚡'); showToast('⚡ Combo x5! +15 XP Amazing!'); }
      if (newCombo === 10) { addXP(XP_RULES.COMBO_10, 'Combo x10! 💎'); showToast('💎 Combo x10! +30 XP LEGENDARY!'); }
      // Milestone XP
      if ((currentIdx + 1) % 10 === 0) addXP(XP_RULES.COMPLETE_10, 'ครบ 10 ข้อ');
    } else {
      setCombo(0);
    }

    // Record ranking stats
    if (student && !student.isDemo) {
       const rStats = student.rankingStats || {};
       const oldTotal = rStats.totalAnswered || 0;
       const newTotal = oldTotal + 1;
       const oldAvg = rStats.averageTimePerQuestion || 0;
       const newAvg = ((oldAvg * oldTotal) + timeSpent) / newTotal;
       
       const rUpdates = {
          totalAnswered: newTotal,
          averageTimePerQuestion: newAvg,
       };
       if (isCorrect) {
          rUpdates.totalCorrect = (rStats.totalCorrect || 0) + 1;
       }
       if (timeSpent < 3) {
          rUpdates.fastGuessCount = (rStats.fastGuessCount || 0) + 1;
       }
       
       import('../utils/storage').then(m => m.updateRankingStats(rUpdates));
    }

    setShowFeedback(false);
    setFeedbackData(null);
    setSelected(null);
    if (q.type === 'two_step') {
      setCurrentStep(1);
      setMainSelected(null);
    }
    setWrongAttempts([]);

    if (currentIdx + 1 >= questions.length) {
      // Done!
      const totalRight = newAnswers.filter(a => a.correct).length;
      
      // Update reading passages completed if it's reading quest
      if (!student?.isDemo && (quest?.category === 'reading' || questId === 'reading')) {
         updateBadgeStats({
            readingPassagesCompleted: (student.badgeStats?.readingPassagesCompleted || 0) + 1
         });
      }

      completeQuest(questId, totalRight, questions.length, {
         ...(firstResponseScoring ? { assessmentEvidence: {
           policy: 'first_response_v1', score: totalRight, total: questions.length,
           items: newAnswers.map(a => ({ id: a.q.id, version: a.q.itemVersion, firstCorrect: a.correct, firstChoice: a.firstResponse.choice, finalCorrect: a.practiceCorrect })),
         } } : {}),
         twoStepBothCorrect: twoStepSessionStats.bothCorrect,
         mainCorrect: twoStepSessionStats.mainCorrect,
         reasonCorrect: twoStepSessionStats.reasonCorrect,
         noGuessEarned: twoStepSessionStats.fastGuessCount === 0 && (totalRight / questions.length >= 0.8) // Only if 0 fast guesses and >80% accuracy
      }).then((result) => {
        if (result && result[questId]) {
          setRoundResult(result[questId]);
        }
      }).catch(e => {
        console.error("Failed to complete quest:", e);
      }).finally(() => {
        setShowSummary(true);
        checkBadges(); // Check badges after quest completion
      });
    } else {
      setCurrentIdx(i => i + 1);
      setQuestionStartTime(Date.now());
    }
  }, [feedbackData, answers, q, selected, combo, currentIdx, questions.length, addXP, completeQuest, questId, showToast, student, wrongAttempts, checkBadges, firstResponseScoring]);

  if (quest?.questions?.length && !questions.length) return <QuestionMediaGate status="error" onBack={() => navigate('map')} />;
  if (mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={() => navigate('map')} />;
  if (!quest || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center">
          <p className="text-slate-600 mb-4">ไม่พบข้อมูลด่านนี้</p>
          <button className="btn-primary" onClick={() => navigate('map')}><UIIcon value={"←"} /> กลับ</button>
        </div>
      </div>
    );
  }

  if (showSummary) {
    return <QuestSummary quest={quest} answers={answers} roundResult={roundResult} firstResponseScoring={firstResponseScoring} onBack={() => navigate('map')} onRetry={() => { firstResponses.current = {}; setCurrentIdx(0); setAnswers([]); setCombo(0); setWrongAttempts([]); setRoundResult(null); setCurrentStep(1); setMainSelected(null); setSelected(null); setQuestionStartTime(Date.now()); selectionLock.current = false; nextLock.current = false; Object.assign(twoStepSessionStats, { mainCorrect: 0, reasonCorrect: 0, bothCorrect: 0, fastGuessCount: 0 }); setShowSummary(false); }} />;
  }

  return (
    <div className="quiz-workspace min-h-screen flex flex-col">
      {/* Top HUD */}
      <header className="quiz-hud">
        <div className="quiz-hud-inner">
        <div className="quiz-title-row">
          <button className="quiz-back" aria-label="กลับ Quest Map" onClick={() => navigate('map')}><ArrowLeft size={18} />กลับ</button>
          <h1>{quest.name}</h1>
          <div className="flex items-center gap-2">
            {combo >= 2 && (
              <span key={combo} className="combo-badge bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                <UIIcon value={"🔥"} /> x{combo}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="quiz-stats-row">
          <span>Lv.{level} · {xp} XP</span>
          <span className="quiz-correct-count"><CheckCircle2 size={15} />ถูก {totalCorrect}/{answers.length} ข้อ</span>
          
          <div className="ml-auto flex items-center gap-3">
             {effectiveTranslateMode === 'full' && (
               <button 
                  onClick={toggleGlobalTranslate}
                  className="quiz-translate-toggle" aria-pressed={globalTranslate} aria-label="แปลภาษาไทย"
               >
                  <Languages size={16} />{globalTranslate ? 'เปิดแปล' : 'ปิดแปล'}
               </button>
             )}
             <span className="font-bold">ข้อ {currentIdx + 1}/{questions.length}</span>
          </div>
        </div>

        {/* Progress bar */}
        <progress className="quiz-progress" value={progress} max="100" aria-label="ความคืบหน้ารอบนี้" />
        </div>
      </header>

      {/* Question */}
      <div className="quiz-content">
        {heldItems > 0 && <p className="text-sm text-slate-600" role="status">ชุดฝึก {questions.length} ข้อ · พักข้อที่ยังไม่พร้อม {heldItems} ข้อ</p>}
        {q.type === 'two_step' && (
           <div className="mb-2 text-center text-xs font-bold text-slate-500 tracking-wider uppercase">
             ชั้นที่ {currentStep}/2
           </div>
        )}
        <section key={shakeKey + currentStep} className="quiz-question" aria-label={`โจทย์ข้อ ${currentIdx + 1}`}>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-500 mb-3 inline-block">
            ข้อ {currentIdx + 1}
          </span>

          <QuestionStimulus question={q} allowSpeech={!isExamMode} onFailure={onMediaFailure} />
          
          {currentStep === 2 && (
             <div className="mb-4 p-3 bg-white/5 rounded-xl border border-amber-200 text-sm opacity-80">
                <div className="text-slate-500 text-xs mb-1">คำถามหลัก:</div>
                <div className="text-slate-800/80">{q.question}</div>
                <div className="text-emerald-400 mt-1">คำตอบที่เลือก: {q.options[mainSelected]}</div>
             </div>
          )}

          <div className="flex items-start gap-3">
            <p className="quiz-question-text">
              <VocabTooltip 
                text={currentStep === 1 ? q.question : (q.reasonQuestion || "ทำไมคำตอบนี้จึงถูก?")} 
                vocab={q.vocab} 
                targetedOnly keyword={q.keyword}
                disabled={effectiveTranslateMode === 'off'}
              />
            </p>
            {currentStep === 1 && <SpeakButton text={q.question} label="ฟังโจทย์" />}
          </div>

          {currentStep === 1 && translation && effectiveTranslateMode === 'full' && (
            globalTranslate ? (
              <div className="mt-4 p-3 bg-white/5 border border-amber-200 rounded-xl transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-bold text-emerald-400">
                    🇹🇭 คำแปลภาษาไทย
                  </span>
                </div>
                <div className="text-sky-200 text-sm whitespace-pre-wrap">
                  {translation}
                </div>
              </div>
            ) : (
              <div className="quiz-translation">
                <button className="quiz-translation-button" aria-expanded={showTranslation} aria-controls="quiz-question-translation" onClick={() => setShowTranslation(!showTranslation)}><Languages size={16} />{showTranslation ? 'ซ่อนคำแปล' : 'ดูคำแปลภาษาไทย'}</button>
                {showTranslation && <p id="quiz-question-translation">{translation}</p>}
              </div>
            )
          )}
        </section>

        {/* Options */}
        <div className="quiz-choices" aria-label="ตัวเลือกคำตอบ">
          {(currentStep === 1 ? q.options : q.reasonChoices).map((opt, i) => {
            let cls = 'option-btn';
            const isWrongAttempt = currentStep === 1 ? wrongAttempts.includes(i) : false; // We don't track wrong attempts for step 2 retry since it shows feedback immediately
            const isCompleted = answers.length >= questions.length;
            
            // For step 1, if it's already selected and we are in step 2, we wouldn't be rendering step 1 options. 
            // In step 2, 'selected' is the reason choice.
            
            if (isWrongAttempt && selected !== i) {
               cls += ' opacity-50 bg-red-500/10 border-red-500/30 cursor-not-allowed';
            }

            if (selected !== null && currentStep === 1 && q.type !== 'two_step') {
              if (i === q.answer)               cls += ' show-correct';
              if (i === selected && i !== q.answer) cls += ' selected-wrong';
              if (i === selected && i === q.answer) cls += ' selected-correct';
            } else if (selected !== null && currentStep === 2) {
              if (i === q.correctReasonIndex)   cls += ' show-correct';
              if (i === selected && i !== q.correctReasonIndex) cls += ' selected-wrong';
              if (i === selected && i === q.correctReasonIndex) cls += ' selected-correct';
            }
            
            return (
              <div key={i} className="quiz-choice-row">
              <button className={`${cls} quiz-answer`} aria-label={`คำตอบ ${String.fromCharCode(65 + i)}: ${opt}`} onClick={() => handleSelect(i)} disabled={selected !== null || isWrongAttempt || isCompleted}>
                <div className="flex items-start w-full">
                  <span className="mr-3 text-slate-500 font-bold text-sm shrink-0 mt-0.5">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-left flex-1 break-words leading-tight">
                    <VocabTooltip text={opt} vocab={q.vocab} targetedOnly keyword={q.keyword} disabled={effectiveTranslateMode === 'off'} />
                  </span>
                </div>
              </button>
              {currentStep === 1 && <SpeakButton text={opt} label={`ฟังตัวเลือก ${String.fromCharCode(65 + i)}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback Modal */}
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

// ── Quest Summary ─────────────────────────────────────────────
function QuestSummary({ quest, answers, roundResult, onBack, onRetry, firstResponseScoring = false }) {
  const score = answers.filter(a => a.correct).length;
  const total = answers.length;
  const pct   = Math.round((score / total) * 100);
  
  let star = 0;
  if (pct >= 85) star = 3;
  else if (pct >= 70) star = 2;
  else if (pct >= 50) star = 1;

  const passedRound = pct >= 70;
  const roundsPlayed = roundResult?.roundsPlayed || 1;
  const questPassed = roundResult?.passed || false;
  const totalStars = (roundResult?.stars || []).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (passedRound && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      confetti({
        particleCount: star === 3 ? 60 : 35,
        disableForReducedMotion: true,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [passedRound, star]);

  return (
    <div className="quiz-workspace quiz-summary min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <section className="quiz-summary-inner w-full p-7 text-center" aria-labelledby="quiz-summary-title">
        <div className="text-5xl mb-3" aria-label={`ได้รับ ${star} ดาวในรอบนี้`}>
          <UIIconText value={star === 3 ? '⭐⭐⭐' : star === 2 ? '⭐⭐' : star === 1 ? '⭐' : '☆'} />
        </div>
        <h2 id="quiz-summary-title" className="text-2xl font-black text-slate-800 mb-1">
          {star === 3 ? 'ยอดเยี่ยม!' : passedRound ? 'ผ่านรอบนี้แล้ว!' : 'ลองใหม่อีกครั้ง!'}
        </h2>
        <p className="text-slate-500 text-sm mb-5">{quest.name} · ฝึกสะสม {roundsPlayed} รอบ</p>

        {/* Score */}
        <div className="quiz-summary-score p-5 mb-5">
          <p className="text-sm mb-3">{firstResponseScoring ? 'คะแนนคำตอบครั้งแรก' : 'คะแนนรอบนี้'}</p>
          <div className={`text-5xl font-black ${passedRound ? 'text-emerald-700' : 'text-rose-700'}`}>
            {score}/{total}
          </div>
          <div className="text-xl font-bold text-slate-500 mt-1">{pct}%</div>
          <div className="progress-track h-3 mt-3">
            <div
              className={`progress-fill ${star === 3 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : passedRound ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
              style={{ width: `${pct}%`, height: '100%' }}
            />
          </div>
        </div>

        <div className="quiz-summary-totals p-3 mb-5 flex justify-between items-center px-6">
          <div className="text-center">
            <div className="text-2xl font-black text-amber-700">{totalStars}</div>
            <div className="text-xs text-slate-500">ดาวสะสม</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-sky-700">{roundResult?.pct ?? pct}%</div>
            <div className="text-xs text-slate-500">คะแนนเฉลี่ย</div>
          </div>
        </div>

        {questPassed && (
          <div className="p-3 mb-5">
            <p className="text-emerald-700 font-black">ผ่านเกณฑ์ของด่านนี้แล้ว</p>
          </div>
        )}

        {!passedRound && (
          <div className="p-3 mb-5">
            <p className="text-rose-700 text-sm">ทบทวนข้อที่ยังไม่เข้าใจ แล้วลองอีกครั้งได้เลย</p>
          </div>
        )}

        {/* Buttons */}
        <div className="quiz-summary-actions">
          <button className="qm-secondary" onClick={onBack}><Map size={18} />Quest Map</button>
          <button className="qm-primary" onClick={onRetry}><RotateCcw size={18} />เล่นอีกครั้ง</button>
        </div>
      </section>
    </div>
  );
}
