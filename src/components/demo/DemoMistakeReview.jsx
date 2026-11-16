import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Sparkles, BookOpen } from 'lucide-react';

export default function DemoMistakeReview({ session, onBack, onResolveMistake, onAddXP }) {
  const mistakeBank = session?.mistakeBank || {};
  const mistakes = Object.values(mistakeBank).filter(m => !m.mastered);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [feedback, setFeedback] = useState({});

  const handleSelect = (m, optionIdx) => {
    if (selectedAnswers[m.id] !== undefined) return;
    const isCorrect = optionIdx === m.answer;
    setSelectedAnswers(prev => ({ ...prev, [m.id]: optionIdx }));
    setFeedback(prev => ({ ...prev, [m.id]: isCorrect }));

    if (isCorrect) {
      if (onAddXP) onAddXP(15, 'แก้ข้อผิดสำเร็จ!');
      if (onResolveMistake) onResolveMistake(m.id, true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-2xl border border-amber-200 shadow-sm mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> กลับ Demo Hub
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black text-slate-800 dark:text-white">
            ทบทวนข้อผิด (Error Review)
          </h2>
          <span className="text-xs text-slate-500">
            ข้อผิดเฉพาะในเซสชันทดลองนี้ ({mistakes.length} ข้อที่ต้องฝึกซ้ำ)
          </span>
        </div>

        <div className="w-20" /> {/* Spacer */}
      </div>

      {mistakes.length === 0 ? (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur p-12 rounded-3xl border-2 border-amber-300 text-center shadow-lg">
          <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
            ไม่มีข้อผิดค้างอยู่เลย!
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-md mx-auto">
            คุณตอบถูกครบทุกข้อ หรือทบทวนข้อผิดครบหมดแล้ว ลองทดสอบ Mini Mock หรือฝึกคำศัพท์เพิ่มเติมได้เลย
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow"
          >
            กลับสู่ Demo Hub
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {mistakes.map((m, idx) => {
            const hasAnswered = selectedAnswers[m.id] !== undefined;
            const isCorrect = feedback[m.id];
            return (
              <div
                key={m.id || idx}
                className="bg-white/95 dark:bg-slate-800/95 backdrop-blur p-6 rounded-3xl border-2 border-amber-300 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    ข้อผิดที่ {idx + 1}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">หมวด: {m.skill || 'ทั่วไป'}</span>
                </div>

                <div className="text-base font-bold text-slate-800 dark:text-white whitespace-pre-wrap leading-relaxed mb-4">
                  {m.question}
                </div>

                {m.options && Array.isArray(m.options) && (
                  <div className="space-y-2 mb-4">
                    {m.options.map((opt, oIdx) => {
                      const isSelected = selectedAnswers[m.id] === oIdx;
                      const isKey = oIdx === m.answer;
                      let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 dark:bg-slate-700 dark:text-white';

                      if (hasAnswered) {
                        if (isKey) {
                          btnStyle = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                        } else if (isSelected) {
                          btnStyle = 'bg-rose-500 text-white border-rose-600';
                        } else {
                          btnStyle = 'opacity-40 bg-slate-100 border-slate-200';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={hasAnswered}
                          onClick={() => handleSelect(m, oIdx)}
                          className={`w-full p-3 rounded-xl text-left font-medium text-xs border-2 transition ${btnStyle}`}
                        >
                          <span className="inline-block w-5 font-black opacity-60">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {hasAnswered && (
                  <div className={`p-3 rounded-xl text-xs border ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                  }`}>
                    <div className="font-bold mb-0.5">
                      {isCorrect ? '🎉 ถูกต้อง! ลบออกจากรายการข้อผิดแล้ว' : '💡 ยังไม่ถูกต้อง ลองศึกษาคำอธิบายด้านล่าง:'}
                    </div>
                    <div>{m.explanation || m.correctFeedback || 'ทบทวนคำศัพท์และบริบทของคำถาม'}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
