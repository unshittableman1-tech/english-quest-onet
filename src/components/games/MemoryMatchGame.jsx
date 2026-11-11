import UIIcon, { UIIconText } from '../UIIcon';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../../utils/audio';
import { useSpeech } from '../../utils/useSpeech';

export default function MemoryMatchGame({ cards, title, onBack, onComplete, onMatch }) {
  const { speak } = useSpeech();
  const [deck, setDeck] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [combo, setCombo] = useState(0);

  // Initialize deck (Pick 6 pairs = 12 cards)
  useEffect(() => {
    startNewGame();
  }, [cards]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isWon]);

  const startNewGame = () => {
    if (!cards || cards.length === 0) return;

    // Pick up to 6 unique cards
    const sample = [...cards].sort(() => Math.random() - 0.5).slice(0, 6);

    // Create 2 tiles for each: one English and one Thai
    const tiles = [];
    sample.forEach((c, idx) => {
      // Tile A: English + Emoji
      tiles.push({
        pairId: c.id || `pair_${idx}`,
        type: 'en',
        text: c.frontLabel || c.back,
        emoji: c.frontType === 'text' ? '' : c.front,
        image: c.image,
        imageAlt: c.imageAlt,
        speechText: c.frontLabel || c.back
      });
      // Tile B: Thai Meaning
      tiles.push({
        pairId: c.id || `pair_${idx}`,
        type: 'th',
        text: c.backThai || c.leftThai || c.frontLabel,
        emoji: '🇹🇭',
        speechText: c.frontLabel || c.back
      });
    });

    // Shuffle the 12 tiles
    setDeck(tiles.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMatchedIds(new Set());
    setMoves(0);
    setSeconds(0);
    setIsWon(false);
    setCombo(0);
  };

  const handleCardClick = (index) => {
    if (flippedIndices.length >= 2 || flippedIndices.includes(index)) return;
    if (matchedIds.has(deck[index].pairId)) return;

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    // Speak word on flip
    if (deck[index].speechText) {
      speak(deck[index].speechText);
    }

    if (nextFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const card1 = deck[firstIdx];
      const card2 = deck[secondIdx];

      // Match check: same pairId but different types (en vs th)
      if (card1.pairId === card2.pairId && card1.type !== card2.type) {
        onMatch?.({ cardId: card1.pairId, otherCardId: card2.pairId });
        // MATCH!
        playCorrectSound();
        setCombo(c => c + 1);
        setMatchedIds(prev => {
          const nextSet = new Set(prev).add(card1.pairId);
          if (nextSet.size === deck.length / 2) {
            // All matched!
            setTimeout(() => {
              setIsWon(true);
              confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
              if (onComplete) onComplete(10);
            }, 500);
          }
          return nextSet;
        });
        setFlippedIndices([]);
      } else {
        // NO MATCH
        playWrongSound();
        setCombo(0);
        setTimeout(() => {
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-4 select-none relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <UIIcon value={"←"} /> ออก
        </button>
        <div className="text-center">
          <h2 className="text-amber-400 font-black text-sm"><UIIcon value={"🃏"} /> Memory Match: {title}</h2>
          <p className="text-[10px] text-slate-400">จับคู่คำศัพท์ภาษาอังกฤษกับคำแปลภาษาไทย</p>
        </div>
        <div className="flex gap-2 text-xs font-mono font-bold">
          <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-amber-300">
            <UIIcon value={"⏱️"} /> {seconds}s
          </span>
          <span className="bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-sky-300">
            <UIIcon value={"🎯"} /> {moves} ครั้ง
          </span>
        </div>
      </div>

      {combo > 1 && (
        <div className="text-center mb-2 animate-bounce">
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
            <UIIcon value={"🔥"} /> Combo Streak x{combo}!
          </span>
        </div>
      )}

      {/* Grid of 12 Cards (3 cols on mobile, 4 cols on tablet) */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2.5 max-w-md mx-auto w-full my-auto">
        {deck.map((card, idx) => {
          const isFlipped = flippedIndices.includes(idx) || matchedIds.has(card.pairId);
          const isMatched = matchedIds.has(card.pairId);

          return (
            <button
              key={idx}
              aria-label={isFlipped ? card.text : `เปิดการ์ด ${idx + 1}`}
              onClick={() => handleCardClick(idx)}
              className={`h-24 md:h-28 rounded-2xl p-2 flex flex-col items-center justify-center text-center transition-all duration-300 transform border-2 ${
                isMatched
                  ? 'bg-emerald-950/40 border-emerald-500/60 opacity-80 scale-95'
                  : isFlipped
                  ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-indigo-400 scale-100 shadow-xl'
                  : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-amber-400/50 hover:scale-[1.03] active:scale-95 shadow-md'
              }`}
            >
              {isFlipped ? (
                <div className="animate-scale-in flex flex-col items-center">
                  {card.image ? <img className="vocab-memory-image" src={card.image} alt={card.imageAlt || ''} /> : <span className="text-2xl mb-1">{card.emoji}</span>}
                  <span className={`text-xs font-black leading-tight ${card.type === 'en' ? 'text-amber-300 font-mono' : 'text-sky-200'}`}>
                    {card.text}
                  </span>
                </div>
              ) : (
                <div className="text-2xl text-slate-600 font-black select-none">
                  <UIIcon value={"❓"} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Modal */}
      {isWon && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 text-center max-w-sm w-full animate-bounce-in shadow-2xl space-y-4">
            <div className="text-6xl"><UIIcon value={"🎉"} /></div>
            <h2 className="text-2xl font-black text-emerald-400">ยอดเยี่ยมมาก!</h2>
            <p className="text-slate-300 text-sm">จับคู่คำศัพท์ครบ {deck.length / 2} คู่เรียบร้อย!</p>
            <div className="bg-slate-800/80 rounded-2xl p-4 flex justify-around font-mono text-sm border border-slate-700">
              <div>
                <span className="text-slate-400 text-xs block">เวลาที่ใช้</span>
                <span className="text-amber-300 font-bold text-lg">{seconds} วินาที</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">เปิดทั้งหมด</span>
                <span className="text-sky-300 font-bold text-lg">{moves} ครั้ง</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={startNewGame}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl active:scale-95 transition-all"
              >
                <UIIcon value={"🔄"} /> เล่นรอบใหม่
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
