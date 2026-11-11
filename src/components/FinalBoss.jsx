import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../App';
import { finalBossQuestions } from '../data/finalBossQuestions';
import { BLUEPRINT_CONFIG } from '../utils/blueprintSampler';
import { saveFinalBossResult, getCurrentStudent, saveQuestResult, updateBadgeStats } from '../utils/storage';
import { XP_RULES } from '../utils/scoring';
import SpeakButton from './SpeakButton';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../utils/audio';

const TOTAL_TIME = BLUEPRINT_CONFIG.timeLimitSeconds;

export default function FinalBoss() {
  const { student, navigate, addXP, setStudent, checkBadges } = useApp();

  const [started, setStarted]         = useState(false);
  const [startedAt, setStartedAt]     = useState(0);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [selected, setSelected]       = useState(null);
  const [answers, setAnswers]         = useState([]);
  const [timeLeft, setTimeLeft]       = useState(TOTAL_TIME);
  const [finished, setFinished]       = useState(false);
  const [results, setResults]         = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const finishHandlerRef = useRef(null);
  const finishedRef = useRef(false);

  const [questions, setQuestions]     = useState(finalBossQuestions);

  // Anti-peeking: Shuffle on mount
  useEffect(() => {
    const shuffled = [...finalBossQuestions].sort(() => Math.random() - 0.5).map(q => {
      const opts = q.options.map((text, originalIndex) => ({ text, originalIndex }));
      opts.sort(() => Math.random() - 0.5);
      const newAnswerIndex = opts.findIndex(o => o.originalIndex === q.answer);
      return {
        ...q,
        options: opts.map(o => o.text),
        answer: newAnswerIndex
      };
    });
    setQuestions(shuffled);
  }, []);

  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const q = questions[currentIdx];
  const { mediaStatus, onMediaFailure } = useQuestionMedia(questions);

  // Timer
  useEffect(() => {
    if (!started || finished || mediaStatus !== 'ready') return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((startedAt + TOTAL_TIME * 1000 - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        finishHandlerRef.current?.(undefined, true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [started, finished, startedAt, mediaStatus]);

  // Confetti effect
  useEffect(() => {
    if (finished && results?.pct >= 70) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [finished, results]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (idx) => {
    if (selected !== null || !started || finished) return;
    setSelected(idx);
    const isCorrect = idx === q.answer;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    // Time tracking for Ranking
    if (student && !student.isDemo) {
      const rStats = getCurrentStudent()?.rankingStats || {};
      const oldTotal = rStats.totalAnswered || 0;
      const newTotal = oldTotal + 1;
      const oldAvg = rStats.averageTimePerQuestion || 0;
      const newAvg = ((oldAvg * oldTotal) + timeSpent) / newTotal;

      const rUpdates = {
        totalAnswered: newTotal,
        averageTimePerQuestion: newAvg,
      };
      if (isCorrect) rUpdates.totalCorrect = (rStats.totalCorrect || 0) + 1;
      if (timeSpent < 3) rUpdates.fastGuessCount = (rStats.fastGuessCount || 0) + 1;

      import('../utils/storage').then(m => m.updateRankingStats(rUpdates));
    }
    
    
    if (isCorrect) playCorrectSound();
    else playWrongSound();

    setFeedbackCorrect(isCorrect);
    setShowFeedback(true);
  };

  const handleNext = useCallback((currentAnswers) => {
    const isCorrect = selected === q.answer;
    const newAnswers = [...(currentAnswers || answers), { q, selected, correct: isCorrect }];
    setAnswers(newAnswers);
    setShowFeedback(false);
    setSelected(null);

    if (currentIdx + 1 >= questions.length) {
      handleFinish(newAnswers);
    } else {
      setCurrentIdx(i => i + 1);
      setQuestionStartTime(Date.now());
    }
  }, [selected, q, answers, currentIdx, questions.length]);

  const handleFinish = useCallback(async (finalAnswers, timeout = false) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    let ans = finalAnswers || answers;
    if (timeout && selected !== null && ans.length === currentIdx) {
      ans = [...ans, { q, selected, correct: selected === q.answer }];
    }
    const score  = ans.filter(a => a.correct).length;
    const total  = questions.length;
    const pct    = Math.round((score / total) * 100);

    try {
      const result = student?.isDemo
        ? { score, total, pct, passed: pct >= 70 }
        : await saveFinalBossResult(student?.id, score, total);
      let updatedResults = { ...result, score, total, pct, timeout };
      
      // Record the Chapter 4 boss for Arena progression.
      if (student && !student.isDemo) {
         const qpResult = await saveQuestResult(student.id, 'finalboss', score, total);
         updatedResults.passed = qpResult.finalboss?.passed || updatedResults.passed;
         setStudent(getCurrentStudent());
      } else if (student?.isDemo) {
         setStudent(s => ({ ...s, finalBoss: result, questProgress: { ...s.questProgress, finalboss: result } }));
      }
      
      setResults(updatedResults);
    } catch (e) {
      console.error("Final Boss save error:", e);
      // Show results even if save fails
      setResults({ score, total, pct, timeout, passed: pct >= 70 });
    }

    // XP & Badge
    if (student && !student.isDemo) {
       await updateBadgeStats({ posttestScore: pct });
       if (pct >= 70) {
         await addXP(XP_RULES.FINALBOSS_PASS, 'ผ่าน Final Boss!');
         await updateBadgeStats({ bossPassed: 1, grammarBoss: Math.max(student.badgeStats?.grammarBoss || 0, pct) });
       }
       await checkBadges();
    }
  }, [answers, selected, currentIdx, q, questions.length, student, addXP, checkBadges, setStudent]);
  finishHandlerRef.current = handleFinish;

  const progress = Math.round(((currentIdx) / questions.length) * 100);
  const isTimeDanger = timeLeft <= 300;

  // ── Start Screen ──────────────────────────────────────────
  if (mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={() => navigate('map')} />;
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <div className="text-6xl mb-4 float-anim"><UIIcon value={"🏆"} /></div>
          <h1 className="text-3xl font-black text-gradient-gold mb-2">O-NET Final Boss</h1>
          <p className="text-slate-500 mb-6">แบบทดสอบจำลอง O-NET ป.6</p>

          <div className="glass-card p-4 mb-6 text-left space-y-2">
            {[
              `📝 ${questions.length} ข้อ ผสมทุกหมวด`,
              `⏱️ เวลา ${TOTAL_TIME / 60} นาที`,
              '🎯 ≥70% ผ่าน | ≥80% ได้ Badge',
              '💡 มี AI Tutor feedback',
              '🚫 เริ่มแล้วหยุดไม่ได้!',
            ].map((tip, i) => (
              <div key={i} className="flex gap-2 text-sm text-slate-800/80">
                <span className="shrink-0">{tip.split(' ')[0]}</span>
                <span>{tip.slice(tip.indexOf(' ') + 1)}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => navigate('map')}><UIIcon value={"←"} /> กลับ</button>
            <button className="btn-gold flex-1 text-lg py-4" onClick={() => { const now = Date.now(); setQuestionStartTime(now); setStartedAt(now); setStarted(true); }}>
              <UIIcon value={"⚔️"} /> เริ่มสอบ!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Results ───────────────────────────────────────────────
  if (finished && results) {
    const { score, total, pct, timeout } = results;
    const weakCategories = {};
    answers.forEach(a => {
      if (!a.correct) {
        const cat = a.q.quest || 'other';
        weakCategories[cat] = (weakCategories[cat] || 0) + 1;
      }
    });
    const weakSorted = Object.entries(weakCategories).sort(([, a], [, b]) => b - a);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="glass-card w-full max-w-md p-7 text-center">
          {/* Result icon */}
          <div className="text-6xl mb-3 float-anim"><UIIconText value={pct >= 70 ? '🏆' : '📚'} /></div>
          <h2 className="text-2xl font-black text-slate-800 mb-1">
            <UIIconText value={timeout ? '⏰ หมดเวลา!' : pct >= 70 ? '🎉 You are O-NET Legend!' : 'ยังไม่ผ่าน'} />
          </h2>
          {pct >= 70 && <p className="text-amber-400 font-bold mb-4">คุณพร้อมสำหรับ O-NET แล้ว! <UIIcon value={"🌟"} /></p>}

          {/* Score */}
          <div className="glass-card p-5 mb-5">
            <div className={`text-5xl font-black ${pct >= 70 ? 'text-gradient-gold' : 'text-rose-600'}`}>
              {score}/{total}
            </div>
            <div className="text-xl font-bold text-slate-500 mt-1">{pct}%</div>
            <div className="progress-track h-3 mt-3">
              <div
                className={`progress-fill ${pct >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                style={{ width: `${pct}%`, height: '100%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-800/30 mt-1">
              <span>0%</span>
              <span className="text-amber-400">70% ผ่าน</span>
              <span>100%</span>
            </div>
          </div>

          {/* Weak areas to review */}
          {weakSorted.length > 0 && pct < 70 && (
            <div className="glass-card p-4 mb-5 border border-amber-500/20 text-left">
              <h3 className="font-bold text-amber-400 text-sm mb-2"><UIIcon value={"📌"} /> ควรกลับไปฝึก:</h3>
              <div className="flex flex-wrap gap-2">
                {weakSorted.map(([cat, cnt]) => (
                  <span key={cat} className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {cat}: {cnt} ข้อผิด
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button className="btn-ghost flex-1 text-sm" onClick={() => navigate('map')}><UIIcon value={"🗺️"} /> Quest Map</button>
            <button className="btn-gold flex-1 text-sm" onClick={() => { finishedRef.current = false; setStarted(false); setCurrentIdx(0); setAnswers([]); setTimeLeft(TOTAL_TIME); setFinished(false); setResults(null); setSelected(null); }}>
              <UIIcon value={"🔁"} /> ทำใหม่
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-500 p-4 pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-slate-800"><UIIcon value={"🏆"} /> O-NET Final Boss</span>
          <span className={`font-mono text-lg font-black ${isTimeDanger ? 'timer-danger' : 'text-white'}`}>
            <UIIcon value={"⏱️"} /> {formatTime(timeLeft)}
          </span>
        </div>
        <div className="flex justify-between text-slate-800/80 text-sm mb-2">
          <span>ข้อ {currentIdx + 1}/{questions.length}</span>
          <span><UIIcon value={"✅"} /> {answers.filter(a => a.correct).length} ถูก</span>
        </div>
        <div className="progress-track h-2">
          <div className="progress-fill bg-white/60 transition-all duration-500" style={{ width: `${progress}%`, height: '100%' }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full">
        <div className="glass-card p-5 mb-4">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-500 font-bold mb-3 inline-block">
            {q.quest?.toUpperCase()} — ข้อ {currentIdx + 1}
          </span>
          <QuestionStimulus question={q} onFailure={onMediaFailure} />
          <div className="flex items-start gap-3">
            <p className="text-slate-800 font-bold text-lg leading-relaxed flex-1">{q.question}</p>
            <SpeakButton text={q.question} className="w-6 h-6 mt-1" />
          </div>
        </div>

        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (selected !== null) {
              if (i === q.answer) cls += ' show-correct';
              if (i === selected && i !== q.answer) cls += ' selected-wrong';
              if (i === selected && i === q.answer) cls += ' selected-correct';
            }
            return (
              <button key={i} className={`${cls} flex items-center justify-between`} onClick={() => handleSelect(i)} disabled={selected !== null}>
                <div className="flex items-center">
                  <span className="mr-3 text-slate-500 font-bold text-sm shrink-0">{String.fromCharCode(65 + i)}.</span>
                  <span className="text-left">{opt}</span>
                </div>
                <SpeakButton text={opt} className="w-5 h-5 ml-2" />
              </button>
            );
          })}
        </div>

        {/* Feedback & Next (inline for Final Boss) */}
        {showFeedback && selected !== null && (
          <div className={`mt-4 rounded-2xl p-4 animate-slide-up ${feedbackCorrect ? 'bg-emerald-900/40 border border-emerald-500/30' : 'bg-red-900/30 border border-red-500/30'}`}>
            <p className={`font-bold text-sm mb-1 ${feedbackCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
              <UIIconText value={feedbackCorrect ? '✅ ถูกต้อง!' : `❌ คำตอบที่ถูก: ${q.options[q.answer]}`} />
            </p>
            <p className="text-slate-500 text-xs leading-relaxed">
              {feedbackCorrect ? q.correctFeedback : q.wrongFeedback}
            </p>
            <button className="btn-primary w-full mt-3 text-sm py-2.5" onClick={() => handleNext()}>
              <UIIconText value={currentIdx + 1 >= questions.length ? '📊 ดูผลสอบ' : 'ข้อต่อไป →'} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
