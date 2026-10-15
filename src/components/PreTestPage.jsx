import UIIcon, { UIIconText } from './UIIcon';
import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../App';
import { preTestQuestions } from '../data/questions';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';

const CATEGORY_MAP = {
  vocabulary:   'Vocabulary',
  signs:        'Signs',
  directions:   'Directions',
  market:       'Market',
  conversation: 'Conversation',
  reading:      'Reading',
  grammar:      'Grammar',
};

export default function PreTestPage() {
  const { student, completePreTest, navigate } = useApp();
  const [questions, setQuestions]     = useState([]);
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [selected, setSelected]       = useState(null);
  const [answers, setAnswers]         = useState([]);
  const [showResult, setShowResult]   = useState(false);
  const [results, setResults]         = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    try {
      if (!preTestQuestions) throw new Error('preTestQuestions is undefined');
      const shuffled = [...preTestQuestions].sort(() => Math.random() - 0.5).map((q, idx) => {
        if (!q) throw new Error(`Question at index ${idx} is undefined`);
        if (!q.options) throw new Error(`Question at index ${idx} (id: ${q.id}) has no options`);
        const opts = q.options.map((text, originalIndex) => ({ text, originalIndex }));
        opts.sort(() => Math.random() - 0.5);
        const newAnswerIndex = opts.findIndex(o => o.originalIndex === q.answer);
        return {
          ...q,
          options: opts.map(o => o.text),
          answer: newAnswerIndex,
        };
      });
      setQuestions(shuffled);
    } catch (e) {
      console.error('PreTest initialization error:', e);
      setInitError(e.message || String(e));
    }
  }, []);

  // ── All hooks must be ABOVE any early returns ──────────────────
  const q = questions[currentIdx] || null;
  const { mediaStatus, onMediaFailure } = useQuestionMedia(questions);

  const handleSelect = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
  }, [selected]);

  const handleNext = useCallback(() => {
    if (!q) return;
    const isCorrect = selected === q.answer;
    const timeSpent = (Date.now() - questionStartTime) / 1000;

    if (student && !student.isDemo) {
      const rStats = student.rankingStats || {};
      const oldTotal = rStats.totalAnswered || 0;
      const newTotal = oldTotal + 1;
      const oldAvg = rStats.averageTimePerQuestion || 0;
      const newAvg = ((oldAvg * oldTotal) + timeSpent) / newTotal;
      const rUpdates = { totalAnswered: newTotal, averageTimePerQuestion: newAvg };
      if (isCorrect) rUpdates.totalCorrect = (rStats.totalCorrect || 0) + 1;
      if (timeSpent < 3) rUpdates.fastGuessCount = (rStats.fastGuessCount || 0) + 1;
      import('../utils/storage').then(m => m.updateRankingStats(rUpdates));
    }

    const newAnswers = [...answers, { q, selected, correct: isCorrect }];
    setAnswers(newAnswers);

    if (currentIdx + 1 >= questions.length) {
      const categoryScores = {};
      newAnswers.forEach(a => {
        const cat = a.q.quest;
        if (!categoryScores[cat]) categoryScores[cat] = { correct: 0, total: 0 };
        categoryScores[cat].total++;
        if (a.correct) categoryScores[cat].correct++;
      });
      const totalScore = newAnswers.filter(a => a.correct).length;
      setResults({ categoryScores, totalScore });
      setShowResult(true);
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setQuestionStartTime(Date.now());
    }
  }, [selected, q, answers, currentIdx, questions.length, questionStartTime, student]);

  const handleContinue = useCallback(() => {
    if (!results) return;
    completePreTest(results.categoryScores, results.totalScore);
  }, [results, completePreTest]);

  // ── Early returns AFTER all hooks ─────────────────────────────
  if (questions.length && mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={() => navigate('landing')} />;
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card border border-rose-300 p-8 max-w-lg w-full">
          <h2 className="text-xl font-bold mb-4 text-rose-600"><UIIcon value={"🚨"} /> พบข้อผิดพลาดในการโหลดข้อสอบ</h2>
          <p className="font-mono text-sm text-slate-700">{initError}</p>
          <button className="mt-6 px-4 py-2 btn-danger rounded font-bold" onClick={() => window.location.reload()}>ลองใหม่</button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce"><UIIcon value={"📝"} /></div>
          <p className="text-slate-500">กำลังโหลดข้อสอบ Pre-test...</p>
        </div>
      </div>
    );
  }

  if (showResult && results) {
    const pct = Math.round((results.totalScore / questions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="glass-card w-full max-w-md p-7 text-center">
          <div className="text-5xl mb-3"><UIIcon value={"📊"} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-1">ผลการทดสอบก่อนเรียน</h2>
          <p className="text-slate-500 text-sm mb-5">Pre-test — {questions.length} ข้อ</p>

          <div className="glass-card p-4 mb-5">
            <div className="text-5xl font-black text-gradient-gold">{results.totalScore}/{questions.length}</div>
            <div className="text-lg font-bold text-slate-600 mt-1">{pct}% คะแนนรวม</div>
            <div className="progress-track h-3 mt-3">
              <div className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${pct}%`, height: '100%' }} />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-bold text-slate-700 text-left text-sm">คะแนนรายหมวด:</h3>
            {Object.entries(results.categoryScores).map(([cat, s]) => {
              const catPct = Math.round((s.correct / s.total) * 100);
              const color = catPct >= 70 ? 'from-emerald-400 to-green-400' : catPct >= 50 ? 'from-amber-400 to-yellow-400' : 'from-rose-400 to-red-400';
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 text-right shrink-0">{CATEGORY_MAP[cat] || cat}</span>
                  <div className="progress-track h-2 flex-1">
                    <div className={`progress-fill bg-gradient-to-r ${color}`} style={{ width: `${catPct}%`, height: '100%' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-12 shrink-0">{s.correct}/{s.total}</span>
                </div>
              );
            })}
          </div>

          <button className="btn-primary w-full text-lg py-4" onClick={handleContinue}>
            <UIIcon value={"🗺️"} /> ไป Quest Map!
          </button>
        </div>
      </div>
    );
  }

  // ── Main quiz UI ───────────────────────────────────────────────
  const progress = Math.round((currentIdx / questions.length) * 100);

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      {/* Header */}
      <div className="glass-card p-4 mb-5 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="font-black text-amber-800 text-lg"><UIIcon value={"📝"} /> Pre-test</h1>
            <p className="text-slate-500 text-xs">ข้อ {currentIdx + 1} จาก {questions.length}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gradient-gold">{currentIdx + 1}</div>
            <div className="text-slate-500 text-xs">/{questions.length}</div>
          </div>
        </div>
        <div className="progress-track h-2.5">
          <div
            className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%`, height: '100%' }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="glass-card p-5 mb-4">
          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 mb-3">
            {CATEGORY_MAP[q.quest] || q.quest}
          </span>

          <QuestionStimulus question={q} onFailure={onMediaFailure} />

          <p className="text-slate-800 font-bold text-lg leading-relaxed">{q.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (selected !== null) {
              if (i === q.answer)   cls += ' show-correct';
              if (i === selected && selected !== q.answer) cls += ' selected-wrong';
              if (i === selected && selected === q.answer) cls += ' selected-correct';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
              >
                <span className="mr-3 text-slate-500 font-bold">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button
            className="btn-primary w-full text-lg py-4 animate-slide-up"
            onClick={handleNext}
          >
            <UIIconText value={currentIdx + 1 >= questions.length ? '📊 ดูผลการทดสอบ' : 'ข้อต่อไป →'} />
          </button>
        )}

        {selected !== null && (
          <p className="text-center text-slate-500 text-xs mt-3">
            <UIIconText value={selected === q.answer ? '✅ ถูกต้อง!' : `❌ คำตอบที่ถูกคือ: ${q.options[q.answer]}`} />
          </p>
        )}
      </div>
    </div>
  );
}
