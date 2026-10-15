import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect } from 'react';
import { useApp } from '../App';
import confetti from 'canvas-confetti';
import { playCorrectSound, playWrongSound } from '../utils/audio';

const DEFAULT_CATEGORIES = {
  vocab: [
    { word: 'BICYCLE', thai: 'รถจักรยาน' },
    { word: 'HOSPITAL', thai: 'โรงพยาบาล' },
    { word: 'AIRPORT', thai: 'สนามบิน' },
    { word: 'MARKET', thai: 'ตลาด' },
    { word: 'TEACHER', thai: 'ครู' },
    { word: 'POLICE', thai: 'ตำรวจ' },
    { word: 'STRAWBERRY', thai: 'สตรอเบอร์รี่' },
    { word: 'RESTAURANT', thai: 'ร้านอาหาร' },
    { word: 'LIBRARY', thai: 'ห้องสมุด' },
    { word: 'WEATHER', thai: 'สภาพอากาศ' }
  ],
  actions: [
    { word: 'SWIMMING', thai: 'ว่ายน้ำ' },
    { word: 'SLEEPING', thai: 'นอนหลับ' },
    { word: 'EATING', thai: 'กิน' },
    { word: 'DRIVING', thai: 'ขับรถ' },
    { word: 'READING', thai: 'อ่านหนังสือ' },
    { word: 'RUNNING', thai: 'วิ่ง' },
    { word: 'CRYING', thai: 'ร้องไห้' }
  ]
};

export default function HeadsUpCharades({ cards, title, onBack, onComplete }) {
  const { navigate } = useApp();
  const [phase, setPhase] = useState('menu'); // menu, countdown, play, result
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWords, setCurrentWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]); // { word, status: 'pass' | 'correct' }

  const handleBack = () => {
    if (onBack) onBack();
    else navigate('map');
  };

  const startGameWithList = (wordList) => {
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    setCurrentWords(shuffled);
    setWordIndex(0);
    setScore(0);
    setResults([]);
    setTimeLeft(60);
    setPhase('countdown');
    setTimeout(() => setPhase('play'), 3000);
  };

  const startCategoryGame = () => {
    if (cards && cards.length > 0) {
      const mapped = cards.map(c => ({
        word: (c.frontLabel || c.back || '').toUpperCase(),
        thai: c.backThai || c.leftThai || '',
        emoji: c.frontType === 'text' ? '' : c.front || '📱'
      }));
      startGameWithList(mapped);
    } else {
      startGameWithList(DEFAULT_CATEGORIES.vocab);
    }
  };

  useEffect(() => {
    let timer;
    if (phase === 'play' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (phase === 'play' && timeLeft === 0) {
      setPhase('result');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onComplete) onComplete(Math.min(10, Math.floor(score)));
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, score, onComplete]);

  const handleAnswer = (isCorrect) => {
    const word = currentWords[wordIndex];
    if (!word) return;

    setResults(r => [...r, { ...word, status: isCorrect ? 'correct' : 'pass' }]);

    if (isCorrect) {
      playCorrectSound();
      setScore(s => s + 1);
    } else {
      playWrongSound();
    }

    if (wordIndex + 1 >= currentWords.length) {
      setPhase('result');
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      if (onComplete) onComplete(Math.min(10, Math.floor(score + (isCorrect ? 1 : 0))));
    } else {
      setWordIndex(i => i + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-4 relative overflow-hidden select-none">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

      {phase === 'menu' && (
        <div className="flex-1 flex flex-col z-10 relative">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={handleBack} className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <UIIcon value={"←"} /> กลับ
            </button>
            <span className="text-amber-400 font-bold text-xs">
              {title ? `หมวด: ${title}` : 'เกมใบ้คำหรรษา'}
            </span>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl mb-2 animate-bounce"><UIIcon value={"📱"} /></div>
            <h1 className="text-4xl font-black mb-1 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              Heads-Up Charades!
            </h1>
            <p className="text-slate-400 text-sm">เกมวางเครื่องบนหน้าผากแล้วให้เพื่อนใบ้คำ</p>
          </div>

          <div className="glass-card bg-slate-800/80 border-slate-700 p-5 mb-6 text-center max-w-md mx-auto rounded-3xl">
            <p className="text-amber-400 font-bold mb-2 text-sm"><UIIcon value={"💡"} /> วิธีเล่น</p>
            <div className="text-xs text-slate-300 space-y-1.5 text-left bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/60">
              <p>1. คนถือเครื่อง <strong>หันหน้าจอไปทางเพื่อน</strong> (หรือวางทาบไว้บนหน้าผาก)</p>
              <p>2. เพื่อนๆ ในกลุ่มช่วยกัน <strong>"ใบ้คำศัพท์"</strong> เป็นภาษาอังกฤษหรือท่าทาง</p>
              <p>3. ถ้าทายถูก กดปุ่มสีเขียว <strong><UIIcon value={"✅"} /> CORRECT</strong> (ขวา)</p>
              <p>4. ถ้าคิดไม่ออก กดปุ่มสีแดง <strong><UIIcon value={"❌"} /> PASS (ข้าม)</strong> (ซ้าย)</p>
            </div>
          </div>

          <div className="space-y-3 max-w-md mx-auto w-full">
            {cards && cards.length > 0 ? (
              <button
                onClick={startCategoryGame}
                className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-2xl py-4 font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(2,132,199,0.4)] border border-sky-400/40"
              >
                <UIIcon value={"🚀"} /> เริ่มทายหมวด: {title || 'คำศัพท์'} ({cards.length} คำ)!
              </button>
            ) : (
              <>
                <button
                  onClick={() => startGameWithList(DEFAULT_CATEGORIES.vocab)}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl py-4 font-black text-lg hover:scale-105 transition-transform shadow-lg"
                >
                  หมวด O-NET Vocab <UIIcon value={"📚"} />
                </button>
                <button
                  onClick={() => startGameWithList(DEFAULT_CATEGORIES.actions)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 font-black text-lg hover:scale-105 transition-transform shadow-lg"
                >
                  หมวด Action (ท่าทาง) <UIIcon value={"🏃"} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {phase === 'countdown' && (
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <h2 className="text-2xl text-slate-400 mb-6 font-bold">เอาเครื่องวางบนหน้าผากให้เพื่อนดู...</h2>
          <div className="text-9xl font-black text-amber-400 animate-ping"><UIIcon value={"⏳"} /></div>
        </div>
      )}

      {phase === 'play' && (
        <div className="flex-1 flex flex-col z-10">
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="text-2xl font-black text-sky-400">{score} <UIIcon value={"🌟"} /></div>
            <div className={`text-3xl font-black font-mono ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl md:text-7xl font-black text-center break-words text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] leading-tight">
              {currentWords[wordIndex]?.word}
            </h1>
            {currentWords[wordIndex]?.emoji && (
              <span className="text-4xl mt-3 block">{currentWords[wordIndex]?.emoji}</span>
            )}
          </div>

          {/* Action buttons: Left = PASS, Right = CORRECT */}
          <div className="flex h-36 w-full gap-3 mt-auto pb-4">
            <button 
              onClick={() => handleAnswer(false)} 
              className="flex-1 bg-rose-600/80 active:bg-rose-500 rounded-3xl border-4 border-rose-400 text-2xl font-black flex flex-col items-center justify-center gap-1 shadow-lg"
            >
              <span><UIIcon value={"❌"} /></span>
              <span className="text-xs uppercase tracking-wider">PASS (ข้าม)</span>
            </button>
            <button 
              onClick={() => handleAnswer(true)} 
              className="flex-1 bg-emerald-600/80 active:bg-emerald-500 rounded-3xl border-4 border-emerald-400 text-2xl font-black flex flex-col items-center justify-center gap-1 shadow-lg"
            >
              <span><UIIcon value={"✅"} /></span>
              <span className="text-xs uppercase tracking-wider">CORRECT (ถูก)</span>
            </button>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="flex-1 flex flex-col z-10 relative pb-6 max-w-md mx-auto w-full">
          <div className="text-center mt-6 mb-4">
            <h2 className="text-xl text-slate-400">หมดเวลา!</h2>
            <h1 className="text-5xl font-black text-emerald-400 mt-1">{score} <span className="text-2xl text-white">คะแนน</span></h1>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-800/60 rounded-3xl p-4 max-h-[50vh] border border-slate-700">
            <h3 className="font-bold text-center mb-3 text-slate-300 text-sm">สรุปผลการทายคำศัพท์</h3>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-2xl ${r.status === 'correct' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100' : 'bg-rose-950/40 border border-rose-500/30 text-rose-200 opacity-70'}`}>
                  <div>
                    <div className={`font-black text-base ${r.status === 'correct' ? 'text-emerald-400' : 'text-rose-400'}`}>{r.word}</div>
                    <div className="text-xs opacity-70">{r.thai}</div>
                  </div>
                  <div className="text-xl">
                    <UIIconText value={r.status === 'correct' ? '✅' : '❌'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2.5 mt-4">
            <button onClick={handleBack} className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm">
              <UIIcon value={"←"} /> กลับเมนู
            </button>
            <button onClick={startCategoryGame} className="flex-1 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm shadow-lg">
              <UIIcon value={"🔄"} /> เล่นอีกครั้ง!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
