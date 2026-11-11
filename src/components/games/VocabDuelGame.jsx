import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../../utils/audio';
import { useSpeech } from '../../utils/useSpeech';

export default function VocabDuelGame({ cards, title, onBack, onComplete }) {
  const { speak } = useSpeech();
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const targetScore = 10;

  const [qIndex, setQIndex] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [choices, setChoices] = useState([]);
  const [winner, setWinner] = useState(null);
  const [lockedRound, setLockedRound] = useState(false);
  const [roundWinner, setRoundWinner] = useState(null);
  const [p1Locked, setP1Locked] = useState(false);
  const [p2Locked, setP2Locked] = useState(false);
  const [p1WrongChoice, setP1WrongChoice] = useState(null);
  const [p2WrongChoice, setP2WrongChoice] = useState(null);
  const [bothFailed, setBothFailed] = useState(false);

  const getChoiceText = (c) => c?.backThai || c?.leftThai || c?.back || c?.frontLabel || '';

  // Setup round
  useEffect(() => {
    if (cards.length === 0 || winner) return;

    const card = cards[qIndex % cards.length];
    setCurrentCard(card);

    // สร้างตัวเลือก 4 ช้อยส์ (1 ถูก, 3 ผิด)
    const otherCards = cards.filter(c => c.id !== card.id);
    const shuffledOthers = [...otherCards].sort(() => Math.random() - 0.5).slice(0, 3);
    const allChoices = [card, ...shuffledOthers].sort(() => Math.random() - 0.5);

    setChoices(allChoices);
    setLockedRound(false);
    setRoundWinner(null);
    setP1Locked(false);
    setP2Locked(false);
    setP1WrongChoice(null);
    setP2WrongChoice(null);
    setBothFailed(false);

    // อ่านออกเสียงคำศัพท์
    if (card.frontLabel || card.back) {
      speak(card.frontLabel || card.back);
    }
  }, [qIndex, cards, winner, speak]);

  const handlePlayerTap = (player, choice) => {
    if (lockedRound || winner) return;
    if (player === 'P1' && p1Locked) return;
    if (player === 'P2' && p2Locked) return;

    const isCorrect = choice.id === currentCard.id;

    if (isCorrect) {
      playCorrectSound();
      setLockedRound(true);
      setRoundWinner(player);

      if (player === 'P1') {
        const next = p1Score + 1;
        setP1Score(next);
      } else {
        const next = p2Score + 1;
        setP2Score(next);
      }

      setTimeout(() => {
        advanceRound(p1Score + (player === 'P1' ? 1 : 0), p2Score + (player === 'P2' ? 1 : 0));
      }, 1200);
    } else {
      playWrongSound();
      if (player === 'P1') {
        setP1Locked(true);
        setP1WrongChoice(choice.id);
        if (p2Locked) {
          // ผู้เล่น 2 ก็เคยตอบผิดไปแล้ว -> ผิดทั้งคู่ จบรอบนี้ทันที
          setBothFailed(true);
          setLockedRound(true);
          setTimeout(() => {
            advanceRound(p1Score, p2Score);
          }, 1600);
        }
      } else {
        setP2Locked(true);
        setP2WrongChoice(choice.id);
        if (p1Locked) {
          // ผู้เล่น 1 ก็เคยตอบผิดไปแล้ว -> ผิดทั้งคู่ จบรอบนี้ทันที
          setBothFailed(true);
          setLockedRound(true);
          setTimeout(() => {
            advanceRound(p1Score, p2Score);
          }, 1600);
        }
      }
    }
  };

  const advanceRound = (firstScore, secondScore) => {
    if (qIndex + 1 < targetScore) {
      setQIndex(prev => prev + 1);
      return;
    }
    triggerWin(firstScore === secondScore ? 'เสมอกัน!' : firstScore > secondScore ? 'ผู้เล่น 1 (สีน้ำเงิน) 🔵' : 'ผู้เล่น 2 (สีแดง) 🔴');
  };

  const triggerWin = (winName) => {
    setWinner(winName);
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
    if (onComplete) onComplete(10);
  };

  if (!currentCard) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-2 select-none overflow-hidden relative">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <UIIcon value={"←"} /> ออก
        </button>
        <div className="text-center">
          <span className="text-amber-400 font-black text-sm"><UIIcon value={"⚔️"} /> 1v1 Vocab Duel: {title}</span>
          <p className="text-[10px] text-slate-400">ข้อ {qIndex + 1}/{targetScore} · เล่นครบ 10 ข้อ ผู้ได้คะแนนมากกว่าชนะ (ตอบผิดจะโดนล็อกรอบนี้)</p>
        </div>
        <button onClick={() => speak(currentCard.frontLabel || currentCard.back)} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-lg">
          <UIIcon value={"🔊"} /> ฟังเสียง
        </button>
      </div>

      {/* Target Word in the Middle */}
      <div className="my-auto py-4 bg-slate-900/90 border-y-2 border-amber-400/50 shadow-2xl flex flex-col items-center justify-center relative z-10">
        {currentCard.frontType !== 'text' && <div className="text-4xl mb-1">{currentCard.front || '📖'}</div>}
        <div className="text-2xl font-black text-white tracking-wide">{currentCard.frontLabel || currentCard.back}</div>
        <p className="text-xs text-amber-300 mt-1 font-bold">หาคำแปลภาษาไทยให้ถูกต้อง!</p>

        {roundWinner && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center animate-scale-in">
            <span className={`text-xl font-black px-6 py-2 rounded-2xl shadow-xl ${roundWinner === 'P1' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}>
              <UIIcon value={"⚡"} /> {roundWinner === 'P1' ? 'ผู้เล่น 1 ตอบถูกและไวกว่า! (+1)' : 'ผู้เล่น 2 ตอบถูกและไวกว่า! (+1)'}
            </span>
          </div>
        )}

        {bothFailed && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center animate-scale-in">
            <span className="text-lg font-black px-5 py-2 rounded-2xl bg-rose-600 text-white shadow-xl">
              <UIIcon value={"❌"} /> ตอบผิดทั้งสองคน!
            </span>
            <p className="text-xs text-amber-200 mt-1.5 font-bold">
              เฉลย: {getChoiceText(currentCard)}
            </p>
          </div>
        )}
      </div>

      {/* Split Battleground (P1 on Left / P2 on Right) */}
      <div className="grid grid-cols-2 gap-3 flex-1 pb-4">
        {/* Player 1 (Blue) */}
        <div className={`border-2 rounded-3xl p-3 flex flex-col justify-between transition-all ${p1Locked ? 'bg-blue-950/20 border-blue-500/20' : 'bg-blue-950/40 border-blue-500/40'}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-blue-400 font-black text-xs"><UIIcon value={"🔵"} /> ผู้เล่น 1</span>
              {p1Locked && (
                <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                  <UIIcon value={"❌"} /> โดนล็อกรอบนี้
                </span>
              )}
            </div>
            <span className="text-lg font-black font-mono text-blue-300">{p1Score} / {targetScore}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 my-auto">
            {choices.map((c, i) => {
              const isSelectedWrong = p1WrongChoice === c.id;
              const isCorrectAnswer = lockedRound && c.id === currentCard.id;

              let btnTheme = 'bg-blue-900/70 hover:bg-blue-600 border-blue-500/30 text-blue-100';
              if (isSelectedWrong) {
                btnTheme = 'bg-rose-600/90 border-rose-400 text-white line-through animate-shake';
              } else if (isCorrectAnswer) {
                btnTheme = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/30';
              }

              return (
                <button
                  key={i}
                  disabled={lockedRound || p1Locked}
                  onClick={() => handlePlayerTap('P1', c)}
                  className={`py-3 px-2 active:scale-95 font-bold rounded-xl text-xs md:text-sm border transition-all text-center relative ${btnTheme} ${p1Locked && !isSelectedWrong && !isCorrectAnswer ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span>{getChoiceText(c)}</span>
                  {isSelectedWrong && <span className="ml-1.5"><UIIcon value={"❌"} /></span>}
                  {isCorrectAnswer && <span className="ml-1.5"><UIIcon value={"✔️"} /></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Player 2 (Red) */}
        <div className={`border-2 rounded-3xl p-3 flex flex-col justify-between transition-all ${p2Locked ? 'bg-rose-950/20 border-rose-500/20' : 'bg-rose-950/40 border-rose-500/40'}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 font-black text-xs"><UIIcon value={"🔴"} /> ผู้เล่น 2</span>
              {p2Locked && (
                <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40 animate-pulse">
                  <UIIcon value={"❌"} /> โดนล็อกรอบนี้
                </span>
              )}
            </div>
            <span className="text-lg font-black font-mono text-rose-300">{p2Score} / {targetScore}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 my-auto">
            {choices.map((c, i) => {
              const isSelectedWrong = p2WrongChoice === c.id;
              const isCorrectAnswer = lockedRound && c.id === currentCard.id;

              let btnTheme = 'bg-rose-900/70 hover:bg-rose-600 border-rose-500/30 text-rose-100';
              if (isSelectedWrong) {
                btnTheme = 'bg-rose-600/90 border-rose-400 text-white line-through animate-shake';
              } else if (isCorrectAnswer) {
                btnTheme = 'bg-emerald-600 border-emerald-400 text-white font-black shadow-lg shadow-emerald-500/30';
              }

              return (
                <button
                  key={i}
                  disabled={lockedRound || p2Locked}
                  onClick={() => handlePlayerTap('P2', c)}
                  className={`py-3 px-2 active:scale-95 font-bold rounded-xl text-xs md:text-sm border transition-all text-center relative ${btnTheme} ${p2Locked && !isSelectedWrong && !isCorrectAnswer ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span>{getChoiceText(c)}</span>
                  {isSelectedWrong && <span className="ml-1.5"><UIIcon value={"❌"} /></span>}
                  {isCorrectAnswer && <span className="ml-1.5"><UIIcon value={"✔️"} /></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 text-center max-w-sm w-full animate-bounce-in shadow-2xl space-y-4">
            <div className="text-6xl"><UIIcon value={"🏆"} /></div>
            <h2 className="text-2xl font-black text-amber-400">จบการดวล 10 ข้อ!</h2>
            <p className="text-lg font-bold text-white">{winner}</p>
            <p className="text-xs text-slate-400">ผู้เล่น 1: {p1Score} แต้ม · ผู้เล่น 2: {p2Score} แต้ม</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setP1Score(0);
                  setP2Score(0);
                  setWinner(null);
                  setQIndex(0);
                  setP1Locked(false);
                  setP2Locked(false);
                  setP1WrongChoice(null);
                  setP2WrongChoice(null);
                  setBothFailed(false);
                }}
                className="flex-1 py-3 bg-amber-500 text-slate-950 font-black rounded-xl"
              >
                <UIIcon value={"🔄"} /> ดวลอีกรอบ
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
