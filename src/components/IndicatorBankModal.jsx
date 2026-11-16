import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, RotateCcw, Sparkles, BookOpen, Zap, Trophy, Volume2 } from 'lucide-react';
import { ONET_INDICATOR_MOCK_BANK } from '../data/onetIndicatorMockBank';
import SpeakButton from './SpeakButton';

export default function IndicatorBankModal({ initialSet = 1, onBack, onAddXP }) {
  // Normalize initialSet to number 1-13
  const parseSetNum = (val) => {
    if (typeof val === 'number') return Math.max(1, Math.min(13, val));
    if (typeof val === 'string') {
      const match = val.match(/\d+/);
      if (match) return Math.max(1, Math.min(13, parseInt(match[0], 10)));
    }
    return 1;
  };

  const [activeSetNum, setActiveSetNum] = useState(() => parseSetNum(initialSet));
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [awardedXP, setAwardedXP] = useState(false);

  const currentSet = ONET_INDICATOR_MOCK_BANK.find(s => s.setNumber === activeSetNum) || ONET_INDICATOR_MOCK_BANK[0];
  const questions = currentSet?.questions || [];
  const currentQuestion = questions[currentQIndex];

  // Reset question index and answers when changing set
  function switchSet(num) {
    setActiveSetNum(num);
    setCurrentQIndex(0);
    setAnswers({});
    setCompleted(false);
    setAwardedXP(false);
  }

  function handleSelectOption(optIdx) {
    if (answers[currentQIndex] !== undefined) return;
    const isCorrect = optIdx === currentQuestion.answerIndex;
    setAnswers(prev => ({
      ...prev,
      [currentQIndex]: {
        selected: optIdx,
        isCorrect,
      }
    }));
  }

  function handleNext() {
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  }

  function handleRestart() {
    setCurrentQIndex(0);
    setAnswers({});
    setCompleted(false);
    setAwardedXP(false);
  }

  const score = Object.values(answers).filter(a => a.isCorrect).length;
  const answeredCount = Object.keys(answers).length;

  // Award XP upon completion
  useEffect(() => {
    if (completed && !awardedXP && score > 0) {
      setAwardedXP(true);
      if (onAddXP) {
        const bonus = Math.round((score / questions.length) * 50);
        onAddXP(bonus, `ผ่านคลังข้อสอบตัวชี้วัด ชุดที่ ${activeSetNum}: ${score}/${questions.length} ข้อ`);
      }
    }
  }, [completed, awardedXP, score, questions.length, activeSetNum, onAddXP]);

  return (
    <div className="py-6 px-4 max-w-4xl mx-auto pb-20 select-none" spellCheck={false}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 shadow-md flex items-center gap-3.5 mb-5">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 text-slate-950 shadow-sm flex items-center justify-center font-black text-lg border-2 border-amber-300 transition-all active:scale-95 shrink-0"
            title="กลับไปหน้าเทคนิค & ศัพท์"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-width-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
              O-NET 13 ตัวชี้วัด สทศ.
            </span>
            <span className="text-xs font-bold text-slate-500">275 ข้อมาตรฐาน</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-slate-950 mt-1 truncate">
            📝 คลังข้อสอบจำลองรายตัวชี้วัด (Indicator Exam Bank)
          </h1>
        </div>
      </div>

      {/* ── Sets 1-13 Selector Bar ─────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none" role="tablist" aria-label="เลือกชุดข้อสอบ">
        {ONET_INDICATOR_MOCK_BANK.map(s => {
          const isActive = s.setNumber === activeSetNum;
          return (
            <button
              key={s.setNumber}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => switchSet(s.setNumber)}
              className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-black whitespace-nowrap transition-all border-2 shadow-sm ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300 scale-[1.02]'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300 hover:border-amber-400'
              }`}
            >
              <span>ชุดที่ {s.setNumber}</span>
              {isActive && <span className="ml-1 text-[10px] bg-amber-600 text-white px-1.5 py-0.2 rounded-full">เลือกอยู่</span>}
            </button>
          );
        })}
      </div>

      {/* ── Active Set Info Banner ─────────────────────── */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 mb-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                ชุดที่ {currentSet.setNumber}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-300">
                มาตรฐาน {currentSet.indicator}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-black text-slate-950">
              {currentSet.title}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-600 block">จำนวนข้อในชุด</span>
            <span className="text-lg font-black text-amber-900 font-mono">{questions.length} ข้อ</span>
          </div>
        </div>
      </div>

      {/* ── Question Interactive Card ──────────────────── */}
      {!completed && currentQuestion ? (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-5 md:p-6 shadow-md">
          {/* Progress row */}
          <div className="flex items-center justify-between gap-3 mb-3 text-xs md:text-sm font-bold text-slate-600">
            <span>
              ข้อที่ <strong className="text-amber-900 font-black text-base">#{currentQIndex + 1}</strong> จาก {questions.length}
            </span>
            <span className="font-mono bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300">
              คะแนนสะสม: {score}/{answeredCount}
            </span>
          </div>

          <div className="h-2 rounded-full bg-slate-100 mb-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Stem / Question Text */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-base md:text-lg font-black text-slate-950 leading-relaxed">
                {currentQuestion.stem || currentQuestion.correctChoiceText || `ข้อที่ ${currentQuestion.questionNumber}: จงเลือกคำตอบที่ถูกต้องตามมาตรฐาน ${currentQuestion.indicator}`}
              </div>
              {currentQuestion.stem && /[a-zA-Z]/.test(currentQuestion.stem) && (
                <SpeakButton text={currentQuestion.stem} className="p-1.5 text-amber-800 hover:bg-amber-100 rounded-lg shrink-0" />
              )}
            </div>
          </div>

          {/* 4 Choices */}
          <div className="space-y-2.5 mb-5" role="radiogroup" aria-label="ตัวเลือกคำตอบ">
            {currentQuestion.options && currentQuestion.options.length > 0 ? (
              currentQuestion.options.map((opt, oIdx) => {
                const isSelected = answers[currentQIndex]?.selected === oIdx;
                const isAnswered = answers[currentQIndex] !== undefined;
                const isCorrectChoice = oIdx === currentQuestion.answerIndex;

                let btnStyle = 'border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-900';
                if (isAnswered) {
                  if (isCorrectChoice) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                  } else {
                    btnStyle = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`w-full text-left p-3.5 rounded-2xl border-2 font-bold transition-all flex items-start gap-3 ${btnStyle}`}
                  >
                    <span className="w-7 h-7 rounded-full bg-slate-200/80 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {oIdx + 1}
                    </span>
                    <span className="flex-1 text-sm md:text-base leading-snug">{opt}</span>
                    {isAnswered && isCorrectChoice && <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />}
                    {isAnswered && isSelected && !isCorrectChoice && <XCircle className="text-rose-500 shrink-0" size={20} />}
                  </button>
                );
              })
            ) : (
              // Fallback single verified answer option if stem was not split
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={answers[currentQIndex] !== undefined}
                  onClick={() => handleSelectOption(currentQuestion.answerIndex)}
                  className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all flex items-start gap-3 ${
                    answers[currentQIndex] !== undefined ? 'border-emerald-500 bg-emerald-50 text-emerald-950' : 'border-amber-300 bg-white hover:bg-amber-50'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-black text-xs flex items-center justify-center shrink-0 font-mono">
                    {currentQuestion.correctAnswer}
                  </span>
                  <div className="flex-1">
                    <span className="block text-xs text-slate-500 font-bold mb-0.5">เฉลยข้อที่ถูกต้อง (ตัวเลือกที่ {currentQuestion.correctAnswer}):</span>
                    <strong className="text-sm md:text-base">{currentQuestion.correctChoiceText}</strong>
                  </div>
                  {answers[currentQIndex] !== undefined && <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />}
                </button>
              </div>
            )}
          </div>

          {/* Answer Explanation & Fast Trick (Shown after answering) */}
          {answers[currentQIndex] !== undefined && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-5 space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-2 py-0.5 rounded">
                  {answers[currentQIndex].isCorrect ? '🎉 ถูกต้อง!' : '💡 เฉลยละเอียด & ทริค'}
                </span>
                <span className="text-xs font-bold text-slate-600">คำตอบที่ถูกคือ ตัวเลือก {currentQuestion.correctAnswer}</span>
              </div>

              {currentQuestion.explanation && (
                <p className="text-sm text-slate-800 font-medium leading-relaxed">
                  📖 {currentQuestion.explanation}
                </p>
              )}

              {currentQuestion.decisiveKeyword && (
                <div className="bg-white border border-amber-200 rounded-xl p-2.5 text-xs font-bold text-amber-900 flex items-center gap-2">
                  <span className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 font-black">คีย์ชี้ขาด:</span>
                  <span>{currentQuestion.decisiveKeyword}</span>
                </div>
              )}

              {currentQuestion.fastTrick && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-emerald-900 flex items-start gap-2">
                  <Zap size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-emerald-800">ทริคตอบไว: </span>
                    <span>{currentQuestion.fastTrick}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs md:text-sm hover:bg-slate-100 disabled:opacity-40"
            >
              ← ย้อนกลับ
            </button>

            {answers[currentQIndex] !== undefined ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black text-sm md:text-base shadow-md flex items-center gap-2 active:scale-95 transition-all"
              >
                <span>{currentQIndex === questions.length - 1 ? 'ดูผลการทดสอบ' : 'ข้อถัดไป'}</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-400">เลือกตัวเลือกเพื่อดูเฉลย</span>
            )}
          </div>
        </div>
      ) : (
        /* ── Completion & Results Card ──────────────────── */
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 md:p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center mx-auto mb-4 text-3xl">
            <Trophy className="text-amber-600" size={32} />
          </div>

          <h3 className="text-xl md:text-2xl font-black text-slate-950 mb-2">
            ฝึกทำโจทย์ชุดที่ {activeSetNum} สำเร็จ!
          </h3>
          <p className="text-slate-600 font-bold text-sm mb-6">
            มาตรฐาน {currentSet.indicator} · {currentSet.title}
          </p>

          <div className="max-w-xs mx-auto bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
            <div className="text-3xl font-black text-amber-950 font-mono mb-1">
              {score} / {questions.length}
            </div>
            <div className="text-xs font-bold text-slate-600">
              คิดเป็น {Math.round((score / questions.length) * 100)}%
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>ทำชุดนี้ใหม่อีกครั้ง</span>
            </button>

            {activeSetNum < 13 && (
              <button
                type="button"
                onClick={() => switchSet(activeSetNum + 1)}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm flex items-center gap-2 shadow-md"
              >
                <span>ลุยชุดถัดไป (ชุดที่ {activeSetNum + 1})</span>
                <ArrowRight size={18} />
              </button>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm"
              >
                กลับสู่แผนที่หลัก
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
