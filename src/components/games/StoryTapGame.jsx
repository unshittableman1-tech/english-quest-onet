import UIIcon, { UIIconText } from '../UIIcon';
import { useState } from 'react';

// ── StoryTapGame ──────────────────────────────────────────────
// Props:
//   mission: { storyText?, passages: [{text?, question, options, answer, explanation}], xpReward, title }
//   onComplete: (xpEarned) => void
//   onBack: () => void

export default function StoryTapGame({ mission, onComplete, onBack }) {
  const passages = mission.passages || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('story'); // 'story' | 'play' | 'done'

  const hasStory = !!mission.storyText;
  const passage = passages[currentIdx];
  const progress = Math.round((currentIdx / Math.max(passages.length, 1)) * 100);

  function handleSelect(idx) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === passage.answer) setCorrect(c => c + 1);
  }

  function handleNext() {
    setSelected(null);
    setShowResult(false);
    const next = currentIdx + 1;
    if (next >= passages.length) setPhase('done');
    else setCurrentIdx(next);
  }

  function calcXP() {
    const pct = correct / Math.max(passages.length, 1);
    return Math.round(mission.xpReward * Math.max(0.3, pct));
  }

  // ── Story Intro Screen ─────────────────────────────────────
  if (phase === 'story' && hasStory) {
    return (
      <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
          <div className="flex-1">
            <h2 className="text-slate-800 font-black text-base">{mission.title}</h2>
            <p className="text-slate-500 text-xs"><UIIcon value={"📖"} /> อ่านบทความก่อนตอบคำถาม</p>
          </div>
        </div>

        <div className="glass-card p-6 flex-1 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl"><UIIcon value={"📖"} /></span>
            <h3 className="text-amber-800 font-black">Read the passage</h3>
          </div>
          <p className="passage-box">{mission.storyText}</p>
        </div>

        <div className="mb-3 px-4 py-2 rounded-xl bg-amber-100 border border-amber-300 text-center">
          <p className="text-amber-800 text-xs font-bold"><UIIcon value={"💡"} /> เทคนิค: อ่านคำถามก่อน แล้วค่อย Scan หาคำตอบ</p>
        </div>

        <button
          onClick={() => setPhase('play')}
          className="btn-primary w-full py-4"
        >
          อ่านจบแล้ว <UIIcon value={"→"} /> ตอบคำถาม! <UIIcon value={"✅"} />
        </button>
      </div>
    );
  }

  // ── Done Screen ─────────────────────────────────────────────
  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((correct / passages.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 60 ? '🔍' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">ยอดเยี่ยม!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{correct}/{passages.length}</div>
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

  // ── Play Screen ─────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-black text-base">{mission.title}</h2>
        </div>
        <div className="text-slate-500 text-sm">{currentIdx + 1}/{passages.length}</div>
      </div>

      {/* Progress */}
      <div className="progress-track h-2 mb-4">
        <div
          className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ width: `${progress}%`, height: '100%', transition: 'width 0.3s' }}
        />
      </div>

      {/* Story Reference button */}
      {hasStory && (
        <button
          onClick={() => setPhase('story')}
          className="mb-4 text-xs text-amber-600 hover:text-amber-800 underline text-right"
        >
          <UIIcon value={"📖"} /> กลับไปอ่านบทความ
        </button>
      )}

      {/* Passage text (for per-question text) */}
      {passage.text && (
        <div className="glass-card p-5 mb-4 border border-amber-200">
          <p className="passage-box whitespace-pre-line">{passage.text}</p>
        </div>
      )}

      {/* Question */}
      <div className="glass-card p-5 mb-6">
        <p className="text-slate-500 text-xs mb-2"><UIIcon value={"❓"} /> คำถาม</p>
        <p className="text-slate-800 font-bold text-lg">{passage.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {passage.options.map((opt, i) => {
          let style = 'bg-white border-amber-200 text-slate-800 hover:bg-amber-50 hover:border-amber-400';
          if (showResult) {
            if (i === passage.answer) style = 'bg-emerald-100 border-emerald-400 text-emerald-800';
            else if (i === selected) style = 'bg-rose-100 border-rose-400 text-rose-800';
            else style = 'bg-white border-slate-200 text-slate-500 opacity-50';
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full p-4 rounded-2xl text-sm font-bold text-left transition-all duration-200 border-2 ${style}`}
            >
              <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={`mt-4 p-4 rounded-2xl border ${selected === passage.answer ? 'bg-emerald-100 border-emerald-400' : 'bg-rose-100 border-rose-400'}`}>
          <p className={`font-black ${selected === passage.answer ? 'text-emerald-800' : 'text-rose-800'}`}>
            <UIIconText value={selected === passage.answer ? '✅ ถูกต้อง!' : '❌ ไม่ถูกต้อง'} />
          </p>
          {passage.explanation && (
            <p className="text-slate-600 text-sm mt-1"><UIIcon value={"💡"} /> {passage.explanation}</p>
          )}
        </div>
      )}

      {showResult && (
        <button
          onClick={handleNext}
          className="btn-primary w-full py-4 mt-4"
        >
          <UIIconText value={currentIdx + 1 >= passages.length ? 'ดูผลลัพธ์ 🎊' : 'ข้อต่อไป →'} />
        </button>
      )}
    </div>
  );
}
