import UIIcon, { UIIconText } from './UIIcon';
import { useState, useCallback } from 'react';
import { useApp } from '../App';
import { pretestV2Questions } from '../data/pretestV2';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';
import { playClickSound, playLevelUpSound } from '../utils/audio';

const questions = pretestV2Questions.map((item, index) => ({
  ...item,
  id: `pretest-v2-${index + 1}`,
  question: item.prompt,
  quest: item.standard,
  itemVersion: 'pretest-v2',
  mediaReview: { status: 'verified', reviewer: 'teacher', version: 'pretest-v2' },
}));

export default function PreTestPage() {
  const { completePreTest, navigate, handleLogout } = useApp();
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [selected, setSelected]       = useState(null);
  const [answers, setAnswers]         = useState([]);
  const [showResult, setShowResult]   = useState(false);
  const [results, setResults]         = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── All hooks must be ABOVE any early returns ──────────────────
  const q = questions[currentIdx] || null;
  const { mediaStatus, onMediaFailure } = useQuestionMedia(questions);

  const handleSelect = useCallback((idx) => {
    playClickSound();
    setSelected(idx);
  }, []);

  const handleNext = useCallback(() => {
    if (!q) return;
    playClickSound();
    const isCorrect = selected === q.answer;
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
      playLevelUpSound();
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    }
  }, [selected, q, answers, currentIdx]);

  const handleContinue = useCallback(async () => {
    if (!results || saving) return;
    playClickSound();
    setSaving(true);
    setSaveError(null);
    try {
      await completePreTest(results.categoryScores, results.totalScore);
    } catch (error) {
      setSaveError(error.message || 'ไม่สามารถบันทึกผลสอบได้');
      setSaving(false);
    }
  }, [results, saving, completePreTest]);

  // ── Early returns AFTER all hooks ─────────────────────────────
  if (questions.length && mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={() => navigate('landing')} />;
  if (showResult && results) {
    const pct = Math.round((results.totalScore / questions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="glass-card w-full max-w-md p-7 text-center">
          <div className="text-5xl mb-3"><UIIcon value={"📊"} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-1">ผลการทดสอบก่อนเรียน</h2>
          <p className="text-slate-500 text-sm mb-5">Pre-test อิง Blueprint — {questions.length} ข้อ</p>

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
                  <span className="text-xs text-slate-500 w-24 text-right shrink-0">{cat}</span>
                  <div className="progress-track h-2 flex-1">
                    <div className={`progress-fill bg-gradient-to-r ${color}`} style={{ width: `${catPct}%`, height: '100%' }} />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-12 shrink-0">{s.correct}/{s.total}</span>
                </div>
              );
            })}
          </div>

          {saveError && <p role="alert" className="text-rose-700 mb-3">{saveError}</p>}
          <button className="btn-primary w-full text-lg py-4" onClick={handleContinue} disabled={saving}>
            <UIIcon value={"🗺️"} /> {saving ? 'กำลังบันทึก...' : 'ไป Quest Map!'}
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
            <h1 className="font-black text-amber-800 text-lg"><UIIcon value={"📝"} /> Pre-test อิง Blueprint</h1>
            <p className="text-slate-500 text-xs">ข้อ {currentIdx + 1} จาก {questions.length}</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleLogout} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              ออกจากระบบ
            </button>
            <div className="text-right">
              <div className="text-2xl font-black text-gradient-gold">{currentIdx + 1}</div>
              <div className="text-slate-500 text-xs">/{questions.length}</div>
            </div>
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
            {q.quest}
          </span>

          <QuestionStimulus question={q} onFailure={onMediaFailure} />

          <p className="text-slate-800 font-bold text-lg leading-relaxed">{q.question}</p>
        </div>

        {/* Options */}
        <div className={q.options.some(option => typeof option !== 'string') ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6' : 'space-y-3 mb-6'}>
          {q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (i === selected) cls += ' border-amber-400 bg-amber-50';
            return (
              <button
                key={i}
                type="button"
                className={cls}
                onClick={() => handleSelect(i)}
                aria-pressed={i === selected}
              >
                <span className="mr-3 text-slate-500 font-bold">{String.fromCharCode(65 + i)}.</span>
                {typeof opt === 'string' ? opt : <img src={opt.image} alt={opt.alt} className="block w-full rounded-lg mt-2" onError={onMediaFailure} />}
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

      </div>
    </div>
  );
}
