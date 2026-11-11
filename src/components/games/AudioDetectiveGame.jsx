import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../../utils/audio';
import { useSpeech } from '../../utils/useSpeech';

export default function AudioDetectiveGame({ cards, title, onBack, onComplete, onEvidence }) {
  const { speak, speaking } = useSpeech();
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [qIndex, setQIndex] = useState(0);

  const [currentCard, setCurrentCard] = useState(null);
  const [choices, setChoices] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);

  useEffect(() => {
    if (!cards || cards.length === 0) return;
    loadQuestion(qIndex);
  }, [qIndex, cards]);

  const loadQuestion = (idx) => {
    const card = cards[idx % cards.length];
    setCurrentCard(card);
    setRevealed(false);
    setSelectedChoiceId(null);

    // Create 4 choices
    const others = cards.filter(c => c.id !== card.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [card, ...shuffledOthers].sort(() => Math.random() - 0.5);
    setChoices(all);

    // Play sound
    setTimeout(() => {
      const speechPrompt = (card.frontLabel && /[A-Za-z]/.test(card.frontLabel) && !/[\u0E00-\u0E7F]/.test(card.frontLabel))
        ? card.frontLabel
        : (card.front && /[A-Za-z]/.test(card.front) && !/[\u0E00-\u0E7F]/.test(card.front))
          ? card.front
          : (card.back || card.frontLabel || card.front || '');
      speak(speechPrompt);
    }, 200);
  };

  const handleSelect = (choice) => {
    if (revealed) return;

    setSelectedChoiceId(choice.id);
    setRevealed(true);

    const isCorrect = choice.id === currentCard.id;
    onEvidence?.({ card: currentCard, mode: 'audio', correct: isCorrect, assisted: false, observationId: String(qIndex) });

    if (isCorrect) {
      playCorrectSound();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => s + 10);

      if (newStreak === 10) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        if (onComplete) onComplete(10);
      }
    } else {
      playWrongSound();
      setStreak(0);
    }

    setTimeout(() => {
      setQIndex(prev => prev + 1);
    }, 1800);
  };

  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 select-none relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <UIIcon value={"←"} /> ออก
        </button>
        <div className="text-center">
          <span className="text-amber-400 font-black text-sm"><UIIcon value={"🔊"} /> นักสืบหูทองคำ: {title}</span>
          <p className="text-[10px] text-slate-400">ฟังเสียงฝรั่งแล้วเลือกความหมายที่ถูกต้อง</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            คะแนน: {score}
          </span>
        </div>
      </div>

      {streak > 1 && (
        <div className="text-center mb-2 animate-bounce">
          <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
            <UIIcon value={"🔥"} /> ฟังถูกต่อเนื่อง x{streak}!
          </span>
        </div>
      )}

      {/* Audio Speaker Box */}
      <div className="my-auto max-w-sm w-full mx-auto bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative flex flex-col items-center">
        <button
          onClick={() => speak(currentCard.frontLabel || currentCard.back)}
          className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl border-4 ${
            speaking
              ? 'bg-amber-500 border-amber-300 scale-110 animate-pulse text-slate-950'
              : 'bg-gradient-to-tr from-indigo-600 to-sky-500 border-sky-400 hover:scale-105 active:scale-95 text-white'
          }`}
        >
          <span className="text-4xl"><UIIconText value={speaking ? '🔊' : '🎧'} /></span>
          <span className="text-[11px] font-black mt-1 uppercase tracking-wider">
            {speaking ? 'กำลังพูด...' : 'กดฟังเสียง'}
          </span>
        </button>

        <p className="text-slate-400 text-xs mt-4">ได้ยินคำว่าอะไร? เลือกคำตอบด้านล่าง</p>

        {/* Reveal word after answering */}
        {revealed && (
          <div className="mt-4 p-3 bg-slate-800/80 rounded-2xl border border-slate-700 animate-scale-in">
            <span className="text-2xl mb-1 block">{currentCard.front}</span>
            <span className="text-lg font-black font-mono text-amber-400">
              {currentCard.frontLabel || currentCard.back}
            </span>
          </div>
        )}
      </div>

      {/* Choice Buttons */}
      <div className="grid grid-cols-2 gap-3 max-w-sm w-full mx-auto pb-6">
        {choices.map((c, i) => {
          const isSelected = selectedChoiceId === c.id;
          const isCorrect = c.id === currentCard.id;

          let btnClass = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-sky-400';
          if (revealed) {
            if (isCorrect) {
              btnClass = 'bg-emerald-600 border-emerald-400 text-white font-black scale-[1.02] shadow-lg';
            } else if (isSelected) {
              btnClass = 'bg-rose-600 border-rose-400 text-white line-through';
            } else {
              btnClass = 'bg-slate-900/50 border-slate-800 text-slate-600';
            }
          }

          return (
            <button
              key={i}
              disabled={revealed}
              onClick={() => handleSelect(c)}
              className={`p-4 rounded-2xl border-2 font-bold text-sm flex flex-col items-center justify-center transition-all active:scale-95 shadow-md ${btnClass}`}
            >
              <span className="text-2xl mb-1">{c.front || '🇹🇭'}</span>
              <span>{c.backThai || c.leftThai || c.frontLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
