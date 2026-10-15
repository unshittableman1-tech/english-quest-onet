import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useEffect } from 'react';

export default function SpellGame({ mission, onComplete, onBack }) {
  const items = mission.items || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState('play'); // play, done
  const [correctCount, setCorrectCount] = useState(0);
  
  const [typed, setTyped] = useState([]);
  const [scrambled, setScrambled] = useState([]);
  
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0 = none, 1 = show first letter, 2 = show length/blanks

  const current = items[currentIdx] || {};
  const answer = (current.answer || '').toUpperCase();

  // Initialize scrambled letters when current item changes
  useEffect(() => {
    if (!answer) return;
    const letters = answer.split('');
    // Shuffle letters
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    // Give them unique IDs so duplicate letters (like 'O' in 'SCHOOL') can be managed
    const letterObjs = shuffled.map((char, i) => ({ id: `char-${i}`, char }));
    setScrambled(letterObjs);
    setTyped([]);
    setShowResult(false);
    setIsCorrect(false);
    setHintLevel(0);
  }, [currentIdx, answer]);

  function handleTapLetter(letterObj) {
    if (showResult) return;
    setTyped(prev => [...prev, letterObj]);
    setScrambled(prev => prev.filter(l => l.id !== letterObj.id));
  }

  function handleRemoveLetter(letterObj) {
    if (showResult) return;
    setTyped(prev => prev.filter(l => l.id !== letterObj.id));
    setScrambled(prev => [...prev, letterObj]);
  }

  function handleCheck() {
    const word = typed.map(t => t.char).join('');
    if (word === answer) {
      setIsCorrect(true);
      setCorrectCount(c => c + 1);
    } else {
      setIsCorrect(false);
    }
    setShowResult(true);
  }

  function handleNext() {
    if (currentIdx + 1 >= items.length) {
      setPhase('done');
    } else {
      setCurrentIdx(c => c + 1);
    }
  }

  function useHint() {
    setHintLevel(h => Math.min(2, h + 1));
  }

  function calcXP() {
    return Math.round(mission.xpReward * Math.max(0.3, correctCount / Math.max(items.length, 1)));
  }

  if (phase === 'done') {
    const xpEarned = calcXP();
    const pct = Math.round((correctCount / items.length) * 100);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4"><UIIconText value={pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'} /></div>
          <h2 className="text-2xl font-black text-amber-800 mb-2">สะกดคำสำเร็จ!</h2>
          <p className="text-slate-500 mb-6">{mission.title}</p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-2xl font-black text-emerald-600">{correctCount}/{items.length}</div>
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
          <button onClick={() => onComplete(xpEarned)} className="btn-success w-full py-3">รับ XP แล้วไปต่อ!</button>
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
          <h2 className="text-slate-800 font-black text-base">{mission.title || 'Spell & Guess'}</h2>
          <p className="text-slate-500 text-xs">{mission.subtitle || 'เรียงตัวอักษรให้เป็นคำที่ถูกต้อง'}</p>
        </div>
        <div className="text-slate-500 text-sm">{currentIdx + 1}/{items.length}</div>
      </div>

      <div className="progress-track h-2 mb-6">
        <div 
          className="progress-fill bg-gradient-to-r from-amber-400 to-amber-500"
          style={{ width: `${(currentIdx / Math.max(items.length, 1)) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center">
        {/* Visual / Hints */}
        <div className="w-full bg-white/60 border-2 border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center mb-6 min-h-[160px] shadow-sm relative">
          
          <button 
            onClick={useHint}
            disabled={hintLevel >= 2 || showResult}
            className="absolute top-4 right-4 text-xl w-10 h-10 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-600 border border-amber-300 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all"
          >
            <UIIcon value={"💡"} />
          </button>

          {current.image ? (
            <div className="text-8xl animate-fade-in">{current.image}</div>
          ) : current.hints ? (
            <div className="space-y-3 w-full text-center">
              <div className="text-3xl mb-2"><UIIcon value={"🕵️‍♂️"} /></div>
              {current.hints.map((hint, i) => (
                <p key={i} className="text-slate-700 font-bold bg-slate-100 py-2 px-4 rounded-xl text-sm border border-slate-200 shadow-sm animate-fade-in">
                  "{hint}"
                </p>
              ))}
            </div>
          ) : (
            <div className="text-5xl"><UIIcon value={"❓"} /></div>
          )}
        </div>

        {/* Typed Area */}
        <div className="w-full flex justify-center flex-wrap gap-2 mb-8 min-h-[60px] bg-slate-100/50 p-4 rounded-2xl border-2 border-dashed border-slate-300">
          {typed.length === 0 && hintLevel === 0 && (
            <span className="text-slate-400 text-sm py-2">แตะตัวอักษรด้านล่าง</span>
          )}
          
          {/* If hintLevel 2, show blank slots */}
          {typed.length === 0 && hintLevel >= 1 && (
            <div className="flex gap-2">
              {answer.split('').map((char, i) => (
                <div key={i} className={`w-10 h-12 rounded-lg border-b-4 border-slate-300 flex items-center justify-center text-xl font-black ${i === 0 && hintLevel >= 1 ? 'text-amber-500 border-amber-300' : 'text-slate-300'}`}>
                  {i === 0 && hintLevel >= 1 ? char : '_'}
                </div>
              ))}
            </div>
          )}

          {typed.length > 0 && typed.map(t => (
            <button
              key={t.id}
              onClick={() => handleRemoveLetter(t)}
              className="w-10 h-12 bg-sky-500 border-b-4 border-sky-700 rounded-lg text-white font-black text-xl flex items-center justify-center hover:bg-sky-400 hover:-translate-y-1 transition-all active:translate-y-0 active:border-b-0"
            >
              {t.char}
            </button>
          ))}
        </div>

        {/* Scrambled Letters (Keyboard) */}
        <div className="w-full flex justify-center flex-wrap gap-2 mb-8">
          {scrambled.map(s => (
            <button
              key={s.id}
              onClick={() => handleTapLetter(s)}
              className="w-10 h-12 bg-white border-b-4 border-slate-300 rounded-lg text-slate-700 font-black text-xl flex items-center justify-center hover:bg-slate-50 hover:-translate-y-1 transition-all active:translate-y-0 active:border-b-0 shadow-sm"
            >
              {s.char}
            </button>
          ))}
        </div>

        {/* Result Area */}
        {showResult && (
          <div className={`w-full p-4 rounded-2xl text-center mb-6 border-2 animate-fade-in ${isCorrect ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-rose-100 border-rose-400 text-rose-800'}`}>
            <p className="font-black text-xl mb-1"><UIIconText value={isCorrect ? '✅ ยอดเยี่ยม!' : '❌ เกือบแล้ว!'} /></p>
            {!isCorrect && (
              <p className="text-sm">คำที่ถูกคือ: <span className="font-black text-lg underline tracking-widest ml-2">{answer}</span></p>
            )}
            {current.thai && <p className="text-xs opacity-80 mt-1">แปลว่า: {current.thai}</p>}
          </div>
        )}

        {/* Action Button */}
        <div className="w-full mt-auto">
          {!showResult ? (
            <button 
              onClick={handleCheck}
              disabled={typed.length !== answer.length}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${typed.length === answer.length ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              ตรวจคำตอบ
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary w-full py-4 text-lg">
              <UIIconText value={currentIdx + 1 >= items.length ? 'ดูผลลัพธ์ 🎊' : 'ข้อต่อไป →'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
