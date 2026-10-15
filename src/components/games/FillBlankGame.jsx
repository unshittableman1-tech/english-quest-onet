import UIIcon, { UIIconText } from '../UIIcon';
import { useState } from 'react';
import VocabTooltip from '../VocabTooltip';

// ── FillBlankGame ─────────────────────────────────────────────
// Props:
//   mission: { questions: [{sentence, options, answer, hint, answerThai}], xpReward, title }
//   onComplete: (xpEarned) => void
//   onBack: () => void

export default function FillBlankGame({ mission, onComplete, onBack }) {
  const questions = mission.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [phase, setPhase] = useState('play'); // 'play' | 'done'

  const q = questions[currentIdx];
  const progress = Math.round((currentIdx / Math.max(questions.length, 1)) * 100);

  function handleSelect(idx) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);

    if (idx === q.answer) setCorrect(c => c + 1);
    else setWrong(w => w + 1);
  }

  function handleNext() {
    setSelected(null);
    setShowResult(false);
    const next = currentIdx + 1;
    if (next >= questions.length) setPhase('done');
    else setCurrentIdx(next);
  }

  function calcXP() {
    const pct = correct / Math.max(questions.length, 1);
    return Math.round(mission.xpReward * Math.max(0.3, pct));
  }

  // ── Done Screen ─────────────────────────────────────────────
  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 60 ? '😊' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">เสร็จแล้ว!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{correct}</div>
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

  // Render sentence with blank highlighted
  function renderSentence(sentence) {
    const parts = sentence.split('___');
    const filled = selected !== null;
    const answer = filled ? q.options[selected] : null;
    const isCorrect = filled && selected === q.answer;

    return (
      <div className="text-lg text-slate-800 leading-relaxed text-center">
        {parts.map((part, i) => (
          <span key={i}>
            <span><VocabTooltip text={part} /></span>
            {i < parts.length - 1 && (
              <span
                className={`inline-block min-w-[80px] px-3 py-0.5 mx-1 rounded-lg font-black border-b-2 transition-all ${
                  !filled
                    ? 'border-amber-400 text-amber-700'
                    : isCorrect
                      ? 'border-emerald-400 text-emerald-700 bg-emerald-100'
                      : 'border-rose-400 text-rose-700 bg-rose-100'
                }`}
              >
                {filled ? answer : '______'}
              </span>
            )}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-black text-base">{mission.title}</h2>
          <p className="text-slate-500 text-xs">{mission.subtitle}</p>
        </div>
        <div className="text-slate-500 text-sm">{currentIdx + 1}/{questions.length}</div>
      </div>

      {/* Progress */}
      <div className="progress-track h-2 mb-6">
        <div
          className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ width: `${progress}%`, height: '100%', transition: 'width 0.3s' }}
        />
      </div>

      {/* Question Card */}
      <div className="glass-card p-6 mb-6 flex-1">
        <p className="text-slate-500 text-xs text-center mb-4"><UIIcon value={"✏️"} /> เติมคำในช่องว่าง (ชี้ที่คำศัพท์เพื่อดูคำแปล <UIIcon value={"💡"} />)</p>

        {/* Sentence */}
        <div className="mb-6">
          {renderSentence(q.sentence)}
        </div>

        {/* Hint */}
        {q.hint && !showResult && (
          <div className="text-center">
            <span className="text-slate-500 text-xs"><UIIcon value={"💡"} /> {q.hint}</span>
          </div>
        )}

        {/* Result feedback */}
        {showResult && (
          <div className={`mt-4 p-4 rounded-2xl text-center border ${selected === q.answer ? 'bg-emerald-100 border-emerald-400' : 'bg-rose-100 border-rose-400'}`}>
            {selected === q.answer ? (
              <>
                <p className="text-emerald-800 font-black text-lg"><UIIcon value={"✅"} /> ถูกต้อง!</p>
                {q.answerThai && <p className="text-emerald-700 text-sm mt-1">{q.answerThai}</p>}
              </>
            ) : (
              <>
                <p className="text-rose-800 font-black text-lg"><UIIcon value={"❌"} /> ไม่ถูกต้อง</p>
                <p className="text-slate-600 text-sm mt-1">
                  คำตอบที่ถูก: <span className="text-emerald-700 font-bold">{q.options[q.answer]}</span>
                  {q.answerThai && ` (${q.answerThai})`}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      {!showResult && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className="py-4 px-3 rounded-2xl text-slate-800 font-bold text-sm bg-white border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 active:scale-95 transition-all shadow-sm"
            >
              <VocabTooltip text={opt} />
            </button>
          ))}
        </div>
      )}

      {/* Next Button */}
      {showResult && (
        <button
          onClick={handleNext}
          className="btn-primary w-full py-4 mt-auto"
        >
          <UIIconText value={currentIdx + 1 >= questions.length ? 'ดูผลลัพธ์ 🎊' : 'ข้อต่อไป →'} />
        </button>
      )}
    </div>
  );
}
