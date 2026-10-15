import UIIcon, { UIIconText } from '../UIIcon';
import { useState } from 'react';

// ── ConvoGame ─────────────────────────────────────────────────
// Props:
//   mission: { scenes: [{context, speaker, speakerEmoji, text, options, correct, explanation}], xpReward, title }
//   onComplete: (xpEarned) => void
//   onBack: () => void

export default function ConvoGame({ mission, onComplete, onBack }) {
  const scenes = mission.scenes || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState('play'); // 'play' | 'done'

  const scene = scenes[currentIdx];
  const progress = Math.round(((currentIdx) / Math.max(scenes.length, 1)) * 100);

  function handleSelect(idx) {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === scene.correct) setCorrect(c => c + 1);
  }

  function handleNext() {
    setSelected(null);
    setShowResult(false);
    const next = currentIdx + 1;
    if (next >= scenes.length) setPhase('done');
    else setCurrentIdx(next);
  }

  function calcXP() {
    const pct = correct / Math.max(scenes.length, 1);
    return Math.round(mission.xpReward * Math.max(0.3, pct));
  }

  // ── Done Screen ─────────────────────────────────────────────
  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((correct / scenes.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 60 ? '👍' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">บทสนทนาจบแล้ว!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{correct}/{scenes.length}</div>
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

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-xl"><UIIcon value={"←"} /></button>
        <div className="flex-1">
          <h2 className="text-slate-800 font-black text-base">{mission.title}</h2>
          <p className="text-slate-500 text-xs">{mission.subtitle}</p>
        </div>
        <div className="text-slate-500 text-sm">{currentIdx + 1}/{scenes.length}</div>
      </div>

      {/* Progress */}
      <div className="progress-track h-2 mb-4">
        <div
          className="progress-fill bg-gradient-to-r from-sky-400 to-sky-500"
          style={{ width: `${progress}%`, height: '100%', transition: 'width 0.3s' }}
        />
      </div>

      {/* Context Banner */}
      {scene.context && (
        <div className="mb-4 px-4 py-2 rounded-2xl bg-sky-50 border border-sky-200 text-center">
          <p className="text-sky-700 text-sm font-bold">{scene.context}</p>
        </div>
      )}

      {/* Chat Bubble — Speaker (NPC, left) */}
      <div className="flex items-end gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl shrink-0 shadow-lg">
          {scene.speakerEmoji}
        </div>
        <div className="flex-1">
          <p className="text-amber-700 font-bold text-xs mb-1">{scene.speaker}</p>
          <div className="bg-white border-2 border-amber-200 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm">
            <p className="text-slate-800 text-lg font-bold leading-relaxed">{scene.text}</p>
          </div>
        </div>
      </div>

      {/* Your Reply Label */}
      <p className="text-slate-500 text-xs text-right mb-3"><UIIcon value={"💬"} /> คุณจะตอบว่า...</p>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {scene.options.map((opt, i) => {
          let style = 'bg-amber-50 border-amber-200 text-slate-800 hover:bg-amber-100 hover:border-amber-400';
          if (showResult) {
            if (i === scene.correct) style = 'bg-emerald-100 border-emerald-400 text-emerald-800';
            else if (i === selected) style = 'bg-rose-100 border-rose-400 text-rose-800';
            else style = 'bg-white border-slate-200 text-slate-500 opacity-50';
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full p-4 rounded-2xl text-sm font-bold text-left transition-all duration-200 border-2 ${style} ${!showResult ? 'active:scale-98' : ''}`}
            >
              <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <div className={`mt-4 p-4 rounded-2xl border ${selected === scene.correct ? 'bg-emerald-100 border-emerald-400' : 'bg-rose-100 border-rose-400'}`}>
          <p className={`font-black ${selected === scene.correct ? 'text-emerald-800' : 'text-rose-800'}`}>
            <UIIconText value={selected === scene.correct ? '✅ ถูกต้อง!' : '❌ ไม่ถูกต้อง'} />
          </p>
          {scene.explanation && (
            <p className="text-slate-600 text-sm mt-1"><UIIcon value={"💡"} /> {scene.explanation}</p>
          )}
        </div>
      )}

      {/* Next */}
      {showResult && (
        <button
          onClick={handleNext}
          className="btn-primary w-full py-4 mt-4"
        >
          <UIIconText value={currentIdx + 1 >= scenes.length ? 'ดูผลลัพธ์ 🎊' : 'บทต่อไป →'} />
        </button>
      )}
    </div>
  );
}
