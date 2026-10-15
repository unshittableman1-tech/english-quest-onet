import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../../utils/audio';
import { useSpeech } from '../../utils/useSpeech';

export default function SpeedRushGame({ cards, title, onBack, onComplete }) {
  const { speak } = useSpeech();
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [feedbackEffect, setFeedbackEffect] = useState(null); // 'correct' | 'wrong'
  const timerRef = useRef(null);

  // High score key
  const highScoreKey = `onet_speedrush_high_${title}`;
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem(highScoreKey) || '0', 10);
  });

  // Start round
  useEffect(() => {
    nextPrompt();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleGameOver();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const handleGameOver = () => {
    setGameOver(true);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (onComplete) onComplete(Math.min(15, Math.max(5, Math.floor(score / 150))));
  };

  const nextPrompt = () => {
    if (!cards || cards.length === 0) return;

    // Pick 1 target card
    const card = cards[Math.floor(Math.random() * cards.length)];
    const isTrue = Math.random() > 0.45; // 55% chance to be True

    let displayedThai = card.backThai || card.leftThai;
    if (!isTrue) {
      // Pick a wrong card's meaning
      const otherCards = cards.filter(c => c.id !== card.id);
      if (otherCards.length > 0) {
        const wrongCard = otherCards[Math.floor(Math.random() * otherCards.length)];
        displayedThai = wrongCard.backThai || wrongCard.leftThai;
      }
    }

    setCurrentPrompt({
      card,
      displayedThai,
      isTrueAnswer: isTrue
    });

    if (card.frontLabel || card.back) {
      speak(card.frontLabel || card.back);
    }
  };

  const handleChoice = (userSaidTrue) => {
    if (gameOver || !currentPrompt) return;

    const correct = userSaidTrue === currentPrompt.isTrueAnswer;

    if (correct) {
      playCorrectSound();
      setFeedbackEffect('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);

      let newMult = 1;
      if (newStreak >= 10) newMult = 3;
      else if (newStreak >= 5) newMult = 2;
      setMultiplier(newMult);

      const addedScore = 100 * newMult;
      const nextScore = score + addedScore;
      setScore(nextScore);

      if (nextScore > highScore) {
        setHighScore(nextScore);
        localStorage.setItem(highScoreKey, String(nextScore));
      }
    } else {
      playWrongSound();
      setFeedbackEffect('wrong');
      setStreak(0);
      setMultiplier(1);
    }

    setTimeout(() => {
      setFeedbackEffect(null);
      nextPrompt();
    }, 300);
  };

  const restartGame = () => {
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setGameOver(false);
    nextPrompt();
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleGameOver();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  if (!currentPrompt) return null;

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex flex-col p-4 select-none relative overflow-hidden transition-colors duration-200 ${
      feedbackEffect === 'correct' ? 'bg-emerald-950/30' : feedbackEffect === 'wrong' ? 'bg-rose-950/30' : ''
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <UIIcon value={"←"} /> ออก
        </button>
        <div className="text-center">
          <span className="text-amber-400 font-black text-sm"><UIIcon value={"⏱️"} /> Speed Rush: {title}</span>
          <p className="text-[10px] text-slate-400">สถิติสูงสุด: {highScore} คะแนน</p>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black font-mono px-3 py-1 rounded-xl border ${
            timeLeft <= 10 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-ping' : 'bg-slate-900 text-amber-300 border-slate-800'
          }`}>
            <UIIcon value={"⏳"} /> {timeLeft}s
          </span>
        </div>
      </div>

      {/* Score & Streak Bar */}
      <div className="flex justify-between items-center max-w-sm mx-auto w-full mb-4 px-2">
        <div>
          <span className="text-xs text-slate-400 block">คะแนน</span>
          <span className="text-2xl font-black font-mono text-amber-400">{score}</span>
        </div>
        {streak > 1 && (
          <div className="text-center animate-bounce">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
              <UIIcon value={"🔥"} /> Streak x{streak} (Score x{multiplier})
            </span>
          </div>
        )}
      </div>

      {/* Main Flashcard Card */}
      <div className="my-auto max-w-sm w-full mx-auto bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 text-center shadow-2xl relative">
        {currentPrompt.card.frontType !== 'text' && <span className="text-5xl mb-3 block animate-float">{currentPrompt.card.front || '📖'}</span>}
        <h2 className="text-3xl font-black text-white font-mono tracking-wide mb-3">
          {currentPrompt.card.frontLabel || currentPrompt.card.back}
        </h2>

        <div className="my-4 border-t border-slate-800"></div>

        <p className="text-slate-400 text-xs mb-1">มีความหมายว่า:</p>
        <div className="text-2xl font-extrabold text-sky-300">
          "{currentPrompt.displayedThai}"
        </div>
        <p className="text-xs text-amber-300/80 mt-2 font-bold">ใช่ หรือ ไม่ใช่?</p>
      </div>

      {/* True / False Decision Buttons */}
      <div className="grid grid-cols-2 gap-4 max-w-sm w-full mx-auto pb-6">
        <button
          onClick={() => handleChoice(true)}
          className="py-5 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 active:scale-95 text-white font-black text-xl rounded-2xl shadow-xl flex items-center justify-center gap-2 border-2 border-emerald-400"
        >
          <span><UIIcon value={"✅"} /></span>
          <span>ใช่ (True)</span>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="py-5 bg-gradient-to-r from-rose-600 to-red-500 hover:brightness-110 active:scale-95 text-white font-black text-xl rounded-2xl shadow-xl flex items-center justify-center gap-2 border-2 border-rose-400"
        >
          <span><UIIcon value={"❌"} /></span>
          <span>ไม่ (False)</span>
        </button>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center max-w-sm w-full animate-bounce-in shadow-2xl space-y-4">
            <div className="text-6xl"><UIIcon value={"⏱️"} /></div>
            <h2 className="text-2xl font-black text-amber-400">หมดเวลา!</h2>
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
              <span className="text-slate-400 text-xs block">คะแนนที่คุณทำได้:</span>
              <span className="text-4xl font-black font-mono text-amber-400 my-1 block">{score}</span>
              <span className="text-xs text-emerald-400 block">สถิติสูงสุด: {highScore} คะแนน</span>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={restartGame}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl active:scale-95 transition-all"
              >
                <UIIcon value={"🔄"} /> ลองอีกครั้ง
              </button>
              <button onClick={onBack} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">
                กลับเมนู
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
