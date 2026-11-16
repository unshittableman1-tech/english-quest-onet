import React, { useState, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { DEMO_VOCABULARY_WORDS } from '../../data/demoContent';

export default function DemoVocabDrill({ onBack, onAddXP, onRecordMistake }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [mode, setMode] = useState('cards'); // 'cards' | 'quiz'
  const [flippedCards, setFlippedCards] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Filtered words
  const words = useMemo(() => {
    if (activeCategory === 'all') return DEMO_VOCABULARY_WORDS;
    return DEMO_VOCABULARY_WORDS.filter(w => w.category === activeCategory);
  }, [activeCategory]);

  const toggleFlip = (id) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const speak = (text) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Generate 4 options for the current quiz question
  const currentQuizWord = words[quizIndex];
  const quizOptions = useMemo(() => {
    if (!currentQuizWord) return [];
    const correct = currentQuizWord.thai;
    const distractors = DEMO_VOCABULARY_WORDS
      .filter(w => w.id !== currentQuizWord.id)
      .map(w => w.thai)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    return [correct, ...distractors].sort(() => 0.5 - Math.random());
  }, [currentQuizWord]);

  const handleQuizAnswer = (option) => {
    if (selectedOption !== null || !currentQuizWord) return;
    setSelectedOption(option);
    const isCorrect = option === currentQuizWord.thai;

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      if (onAddXP) onAddXP(10, 'ตอบศัพท์ถูกต้อง');
    } else {
      if (onRecordMistake) {
        onRecordMistake({
          id: `vocab_mistake_${currentQuizWord.id}`,
          question: `คำศัพท์ "${currentQuizWord.word}" หมายความว่าอย่างไร?`,
          options: quizOptions,
          answer: quizOptions.indexOf(currentQuizWord.thai),
          explanation: `คำว่า "${currentQuizWord.word}" แปลว่า "${currentQuizWord.thai}" ตัวอย่าง: ${currentQuizWord.example}`,
          skill: 'vocabulary'
        });
      }
    }

    setTimeout(() => {
      if (quizIndex + 1 < words.length) {
        setQuizIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        setQuizCompleted(true);
        if (onAddXP) onAddXP(30, 'จบชุดแบบฝึกคำศัพท์');
      }
    }, 1200);
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-2xl shadow-sm border border-amber-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> กลับสู่ Demo Hub
        </button>
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 justify-center">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Vocabulary Drill (คลังศัพท์ 30 คำ)
          </h2>
          <p className="text-xs text-slate-500">คำศัพท์หลัก ป.6 สอดคล้องข้อสอบ O-NET</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setMode('cards'); restartQuiz(); }}
            className={`px-3 py-1.5 rounded-lg font-bold text-sm transition ${
              mode === 'cards'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            การ์ดคำศัพท์
          </button>
          <button
            onClick={() => { setMode('quiz'); restartQuiz(); }}
            className={`px-3 py-1.5 rounded-lg font-bold text-sm transition ${
              mode === 'quiz'
                ? 'bg-amber-500 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            แบบทดสอบสั้น
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          { id: 'all', label: 'ทั้งหมด (30 คำ)' },
          { id: 'profile', label: 'ข้อมูลส่วนตัว (10)' },
          { id: 'classroom', label: 'ห้องเรียน & อุปกรณ์ (10)' },
          { id: 'verbs', label: 'กิจวัตร & กริยา (10)' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => { setActiveCategory(cat.id); restartQuiz(); }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              activeCategory === cat.id
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Flashcards */}
      {mode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((w, index) => {
            const isFlipped = Boolean(flippedCards[w.id]);
            return (
              <div
                key={w.id}
                onClick={() => toggleFlip(w.id)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 min-h-[170px] flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isFlipped
                    ? 'bg-amber-50/90 dark:bg-slate-800/90 border-amber-300'
                    : 'bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      #{index + 1} · {w.categoryName}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); speak(w.word); }}
                      className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-200 transition"
                      title="ฟังเสียงอ่าน"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!isFlipped ? (
                    <div className="mt-2 text-center py-4">
                      <div className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-wide">
                        {w.word}
                      </div>
                      <div className="text-xs text-slate-400">({w.partOfSpeech}) · คลิกเพื่อดูความหมาย</div>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mb-1">
                        {w.thai}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 italic mb-1">
                        "{w.example}"
                      </div>
                      <div className="text-xs text-slate-400">
                        {w.exampleThai}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-[11px] text-slate-400">
                  <span>{w.hint}</span>
                  <span className="text-amber-600 font-semibold">{isFlipped ? 'ซ่อน' : 'คลิกเพื่อพลิก'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Quick Quiz */}
      {mode === 'quiz' && (
        <div className="max-w-xl mx-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur p-6 rounded-3xl border-2 border-amber-300 shadow-lg">
          {!quizCompleted && currentQuizWord ? (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4 pb-2 border-b">
                <span>ข้อที่ {quizIndex + 1} จาก {words.length}</span>
                <span className="font-bold text-amber-600">คะแนน: {quizScore}</span>
              </div>

              <div className="text-center my-6">
                <div className="text-xs uppercase tracking-wider text-amber-600 font-bold mb-1">
                  คำศัพท์นี้แปลว่าอะไร?
                </div>
                <div className="flex items-center justify-center gap-3">
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white">
                    {currentQuizWord.word}
                  </h3>
                  <button
                    onClick={() => speak(currentQuizWord.word)}
                    className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-800"
                    title="ฟังเสียง"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 italic">
                  ตัวอย่าง: "{currentQuizWord.example}"
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 my-6">
                {quizOptions.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrect = opt === currentQuizWord.thai;
                  let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white';

                  if (selectedOption !== null) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-500 text-white border-rose-600';
                    } else {
                      btnStyle = 'opacity-40 bg-slate-100 border-slate-200 text-slate-600';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedOption !== null}
                      onClick={() => handleQuizAnswer(opt)}
                      className={`w-full py-3 px-4 rounded-xl text-left font-bold text-sm border-2 transition ${btnStyle}`}
                    >
                      <span className="inline-block w-6 text-slate-400 font-black">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Sparkles className="w-12 h-12 text-yellow-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                ฝึกคำศัพท์เสร็จสมบูรณ์!
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
                คุณทำคะแนนได้ <span className="font-black text-amber-600 text-lg">{quizScore}</span> จาก {words.length} คะแนน
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={restartQuiz}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> เริ่มใหม่อีกครั้ง
                </button>
                <button
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm"
                >
                  กลับหน้าหลัก Demo
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
