import UIIcon, { UIIconText } from '../UIIcon';
import { useState } from 'react';

// ── RearrangeGame ─────────────────────────────────────────────
// รองรับ 2 โหมด:
//   1. wordSentences: [{words, correct}] — เรียงคำ
//   2. sentences: [{steps, correctOrder}] — เรียงประโยค (Recipe / Events)

export default function RearrangeGame({ mission, onComplete, onBack }) {
  const wordSentences = mission.wordSentences || [];
  const stepSentences = mission.sentences || [];
  const mode = stepSentences.length > 0 ? 'steps' : 'words';

  const [currentIdx, setCurrentIdx] = useState(0);
  const [arranged, setArranged] = useState([]);
  const [remaining, setRemaining] = useState(() => {
    if (mode === 'words') return [...wordSentences[0]?.words || []].sort(() => Math.random() - 0.5);
    if (mode === 'steps') return [...(stepSentences[0]?.steps || [])].sort(() => Math.random() - 0.5);
    return [];
  });
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('play'); // 'play' | 'done'
  const total = mode === 'words' ? wordSentences.length : stepSentences.length;

  function getCurrent() {
    return mode === 'words' ? wordSentences[currentIdx] : stepSentences[currentIdx];
  }

  function checkAnswer() {
    const current = getCurrent();
    let isRight = false;
    if (mode === 'words') {
      isRight = arranged.join(' ') === current.correct;
    } else {
      const orderedIds = arranged.map(s => s.id);
      isRight = JSON.stringify(orderedIds) === JSON.stringify(current.correctOrder);
    }
    setIsCorrect(isRight);
    setShowResult(true);
    if (isRight) setCorrect(c => c + 1);
  }

  function handleNext() {
    const next = currentIdx + 1;
    if (next >= total) {
      setPhase('done');
      return;
    }
    setCurrentIdx(next);
    setShowResult(false);
    setIsCorrect(false);
    setArranged([]);
    if (mode === 'words') {
      setRemaining([...(wordSentences[next]?.words || [])].sort(() => Math.random() - 0.5));
    } else {
      setRemaining([...(stepSentences[next]?.steps || [])].sort(() => Math.random() - 0.5));
    }
  }

  function addToArranged(item) {
    setArranged(a => [...a, item]);
    setRemaining(r => r.filter(x => (mode === 'words' ? x !== item : x.id !== item.id)));
  }

  function removeFromArranged(item, idx) {
    setArranged(a => a.filter((_, i) => i !== idx));
    setRemaining(r => [...r, item]);
  }

  function calcXP() {
    return Math.round(mission.xpReward * Math.max(0.3, correct / Math.max(total, 1)));
  }

  // ── Done Screen ─────────────────────────────────────────────
  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">เรียงประโยคเสร็จ!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{correct}/{total}</div>
              <div className="text-slate-500 text-xs">ถูก</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-amber-600">{pct}%</div>
              <div className="text-slate-500 text-xs">คะแนน</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-yellow-600">+{xpEarned}</div>
              <div className="text-slate-500 text-xs">XP</div>
            </div>
          </div>
          <button
            onClick={() => onComplete(xpEarned)}
            className="btn-success w-full py-3"
          >
            รับ XP แล้วไปต่อ! <UIIcon value={"🎉"} />
          </button>
        </div>
      </div>
    );
  }

  const current = getCurrent();

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-black text-base">{mission.title}</h2>
          <p className="text-slate-500 text-xs">{mission.subtitle || 'เรียงให้ถูกต้อง'}</p>
        </div>
        <div className="text-slate-500 text-sm">{currentIdx + 1}/{total}</div>
      </div>

      {/* Progress */}
      <div className="progress-track h-2 mb-4">
        <div
          className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ width: `${(currentIdx / Math.max(total, 1)) * 100}%`, height: '100%', transition: 'width 0.3s' }}
        />
      </div>

      {/* Hint */}
      {mission.techniqueHint && (
        <div className="mb-4 px-4 py-2 rounded-xl bg-amber-100 border border-amber-300">
          <p className="text-amber-800 text-xs text-center"><UIIcon value={"💡"} /> {mission.techniqueHint}</p>
        </div>
      )}

      {/* Title for step mode */}
      {mode === 'steps' && current.title && (
        <div className="glass-card p-3 mb-4 text-center">
          <p className="text-slate-800 font-bold">{current.title}</p>
        </div>
      )}

      {/* Arranged Area */}
      <div className="bg-white/70 border-2 border-dashed border-amber-300 rounded-xl p-4 mb-4 min-h-[100px]">
        <p className="text-slate-500 text-xs mb-2"><UIIcon value={"👆"} /> แตะเพื่อเอาออก:</p>
        {arranged.length === 0 && (
          <p className="text-slate-500 text-sm text-center mt-4">แตะคำ/ประโยคด้านล่างเพื่อเพิ่ม</p>
        )}
        {mode === 'words' ? (
          <div className="flex flex-wrap gap-2">
            {arranged.map((word, i) => (
              <button
                key={i}
                onClick={() => removeFromArranged(word, i)}
                className="px-3 py-2 rounded-xl bg-sky-100 border-2 border-sky-400 text-sky-900 text-sm font-bold hover:bg-sky-200 active:scale-95 transition-all"
              >
                {word}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {arranged.map((step, i) => (
              <button
                key={step.id}
                onClick={() => removeFromArranged(step, i)}
                className="w-full px-4 py-3 rounded-xl bg-sky-100 border-2 border-sky-400 text-sky-900 text-sm font-bold text-left hover:bg-sky-200 active:scale-98 transition-all flex items-center gap-2"
              >
                <span className="text-sky-600 font-black text-xs w-5">{i + 1}.</span>
                {step.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Available words/steps */}
      <div className="mb-4">
        <p className="text-slate-500 text-xs mb-2"><UIIcon value={"👇"} /> เลือกเพื่อเพิ่ม:</p>
        {mode === 'words' ? (
          <div className="flex flex-wrap gap-2">
            {remaining.map((word, i) => (
              <button
                key={i}
                onClick={() => addToArranged(word)}
                className="px-3 py-2 rounded-xl bg-amber-100 border-2 border-amber-300 text-amber-900 text-sm font-bold hover:bg-amber-200 active:scale-95 transition-all"
              >
                {word}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {remaining.map(step => (
              <button
                key={step.id}
                onClick={() => addToArranged(step)}
                className="w-full px-4 py-3 rounded-xl bg-amber-100 border-2 border-amber-300 text-amber-900 text-sm font-bold text-left hover:bg-amber-200 active:scale-98 transition-all"
              >
                {step.text}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Result feedback */}
      {showResult && (
        <div className={`mt-2 p-4 rounded-2xl mb-4 border ${isCorrect ? 'bg-emerald-100 border-emerald-400' : 'bg-rose-100 border-rose-400'}`}>
          <p className={`font-black ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
            <UIIconText value={isCorrect ? '✅ ถูกต้อง! เรียงได้สมบูรณ์' : '❌ ยังไม่ถูก'} />
          </p>
          {!isCorrect && mode === 'words' && (
            <p className="text-slate-600 text-xs mt-1">
              คำตอบที่ถูก: <span className="text-emerald-700 font-bold">{current.correct}</span>
            </p>
          )}
        </div>
      )}

      {/* Check / Next */}
      {!showResult ? (
        <button
          onClick={checkAnswer}
          disabled={arranged.length === 0}
          className={`w-full py-4 rounded-2xl font-black text-white transition-all mt-auto ${
            arranged.length > 0
              ? 'btn-primary'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          ตรวจคำตอบ <UIIcon value={"✅"} />
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="btn-primary w-full py-4"
        >
          <UIIconText value={currentIdx + 1 >= total ? 'ดูผลลัพธ์ 🎊' : 'ข้อต่อไป →'} />
        </button>
      )}
    </div>
  );
}
