import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useEffect } from 'react';
import SpeakButton from '../SpeakButton';

// ── MatchingGame ──────────────────────────────────────────────
// Props:
//   mission: { pairs: [{id, left, right, leftThai}], xpReward, title, subtitle }
//   onComplete: (xpEarned) => void
//   onBack: () => void

export default function MatchingGame({ mission, onComplete, onBack }) {
  const pairs = mission.pairs || [];
  const [leftSelected, setLeftSelected] = useState(null);
  const [rightSelected, setRightSelected] = useState(null);
  const [matched, setMatched] = useState(new Set()); // Set of pair ids
  const [wrong, setWrong] = useState(false);
  const [correct, setCorrect] = useState(null); // pair id just matched
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState('play'); // 'play' | 'done'

  // Shuffle right column once
  const [shuffledRight] = useState(() =>
    [...pairs].map(p => ({ id: p.id, text: p.right })).sort(() => Math.random() - 0.5)
  );

  useEffect(() => {
    if (leftSelected && rightSelected) {
      const pair = pairs.find(p => p.id === leftSelected);
      if (pair && pair.right === rightSelected.text) {
        // Correct match
        const newMatched = new Set(matched);
        newMatched.add(leftSelected);
        setMatched(newMatched);
        setCorrect(leftSelected);
        setScore(s => s + 1);
        setTimeout(() => {
          setCorrect(null);
          setLeftSelected(null);
          setRightSelected(null);
          if (newMatched.size >= pairs.length) setPhase('done');
        }, 700);
      } else {
        // Wrong
        setWrong(true);
        setMistakes(m => m + 1);
        setTimeout(() => {
          setWrong(false);
          setLeftSelected(null);
          setRightSelected(null);
        }, 600);
      }
    }
  }, [leftSelected, rightSelected]);

  function calcXP() {
    const accuracy = score / Math.max(score + mistakes, 1);
    return Math.round(mission.xpReward * Math.max(0.4, accuracy));
  }

  // ── Done Screen ─────────────────────────────────────────────
  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((score / Math.max(score + mistakes, 1)) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 90 ? '🌟' : pct >= 70 ? '😊' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">จับคู่ครบแล้ว!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{score}/{pairs.length}</div>
              <div className="text-slate-500 text-xs">ถูก</div>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-rose-600">{mistakes}</div>
              <div className="text-slate-500 text-xs">ผิด</div>
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
  const unmatched = pairs.filter(p => !matched.has(p.id));
  const unmatchedRight = shuffledRight.filter(r => !matched.has(r.id));

  // Helper to extract clean English text without emojis for TTS
  function getSpeakText(str) {
    if (!str) return '';
    return str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
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
        <div className="text-slate-500 text-sm font-bold">{matched.size}/{pairs.length}</div>
      </div>

      {/* Progress */}
      <div className="progress-track h-2 mb-4">
        <div
          className="progress-fill bg-gradient-to-r from-emerald-400 to-emerald-500"
          style={{ width: `${(matched.size / pairs.length) * 100}%`, height: '100%', transition: 'width 0.3s' }}
        />
      </div>

      {/* Instruction */}
      <p className="text-slate-500 text-xs text-center mb-4">
        <UIIcon value={"🔗"} /> แตะด้านซ้าย แล้วแตะรูปด้านขวาที่ตรงกัน (กด <UIIcon value={"🔊"} /> ฟังเสียงได้)
      </p>

      {/* Wrong flash */}
      {wrong && (
        <div className="text-center text-rose-600 font-bold text-sm mb-2 animate-pulse"><UIIcon value={"❌"} /> ไม่ตรงกัน ลองใหม่!</div>
      )}

      {/* Matching Grid */}
      <div className="flex gap-3 flex-1">
        {/* Left Column */}
        <div className="flex-1 space-y-2">
          {unmatched.map(pair => {
            const cleanText = getSpeakText(pair.left);
            return (
              <div
                key={pair.id}
                onClick={() => setLeftSelected(pair.id === leftSelected ? null : pair.id)}
                className={`w-full p-3 rounded-2xl text-sm font-bold text-left transition-all duration-200 border-2 cursor-pointer flex items-center justify-between gap-2 ${
                  correct === pair.id
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-95'
                    : leftSelected === pair.id
                      ? 'bg-sky-50 border-sky-400 text-sky-800 scale-105 shadow-lg shadow-sky-200'
                      : wrong && leftSelected === pair.id
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-white border-amber-200 text-slate-800 hover:bg-amber-50 hover:border-amber-400'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div>{pair.left}</div>
                  {pair.leftThai && <span className="text-slate-500 text-xs block font-normal">{pair.leftThai}</span>}
                </div>
                {cleanText && (
                  <SpeakButton text={cleanText} className="p-1 hover:bg-amber-100 rounded-lg shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column (Enlarged Emojis / Images +50%+) */}
        <div className="flex-1 space-y-2">
          {unmatchedRight.map(r => (
            <button
              key={r.id}
              onClick={() => setRightSelected(r.id === rightSelected?.id ? null : r)}
              className={`w-full p-3 rounded-2xl font-black text-center transition-all duration-200 border-2 flex items-center justify-center min-h-[56px] ${
                // Enlarge text/emoji size by 50%+ (text-3xl / text-4xl)
                r.text.length <= 4 ? 'text-3xl sm:text-4xl' : 'text-base sm:text-lg'
              } ${
                correct === r.id
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800 scale-95'
                  : rightSelected?.id === r.id
                    ? 'bg-sky-50 border-sky-400 text-sky-800 scale-105 shadow-lg shadow-sky-200'
                    : wrong && rightSelected?.id === r.id
                      ? 'bg-rose-50 border-rose-400 text-rose-800'
                      : 'bg-white border-amber-200 text-slate-800 hover:bg-amber-50 hover:border-amber-400'
              }`}
            >
              {r.text}
            </button>
          ))}
        </div>
      </div>

      {/* Matched count */}
      <div className="mt-4 text-center text-slate-500 text-xs">
        <UIIcon value={"✅"} /> จับคู่แล้ว {matched.size} / {pairs.length} คู่
      </div>
    </div>
  );
}
