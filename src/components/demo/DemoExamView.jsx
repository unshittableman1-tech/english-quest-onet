import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Award, RotateCcw, AlertCircle } from 'lucide-react';
import { DEMO_EXAM_QUESTIONS } from '../../data/demoContent';

export default function DemoExamView({ onBack, onAddXP, onRecordExamAttempt, onRecordMistake }) {
  const questions = DEMO_EXAM_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [submitted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelectOption = (qId, optionIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitExam = () => {
    clearInterval(timerRef.current);
    setSubmitted(true);

    let correctCount = 0;
    const wrongQuestions = [];

    questions.forEach(q => {
      const userAns = answers[q.id];
      if (userAns === q.answer) {
        correctCount++;
      } else {
        wrongQuestions.push({
          question: q,
          userAnswerIndex: userAns !== undefined ? userAns : -1
        });
        if (onRecordMistake) {
          onRecordMistake(q);
        }
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);
    const attempt = {
      missionId: 'mini_mock_arena',
      missionName: 'Mini Mock Arena (Demo)',
      score: correctCount,
      total: questions.length,
      percent,
      timeSpent: 600 - timeLeft,
      submittedAt: new Date().toISOString(),
      wrongQuestions,
    };

    if (onRecordExamAttempt) {
      onRecordExamAttempt(attempt);
    }

    if (onAddXP) {
      const earnedXP = 30 + (correctCount * 5);
      onAddXP(earnedXP, `ทำข้อสอบจำลองได้ ${correctCount}/${questions.length} ข้อ`);
    }
  };

  const retakeExam = () => {
    setAnswers({});
    setTimeLeft(600);
    setCurrentIndex(0);
    setSubmitted(false);
    setReviewMode(false);
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Calculation for results
  const score = questions.reduce((acc, q) => (answers[q.id] === q.answer ? acc + 1 : acc), 0);
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white/90 dark:bg-slate-800/90 backdrop-blur p-4 rounded-2xl border border-amber-200 shadow-sm mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> กลับ Demo Hub
        </button>

        <div className="text-center">
          <h2 className="text-lg font-black text-slate-800 dark:text-white">
            Mini Mock Exam (10 ข้อ)
          </h2>
          <span className="text-xs text-slate-500">
            {submitted ? 'ตรวจผลสอบแล้ว' : `ตอบแล้ว ${answeredCount} / ${questions.length} ข้อ`}
          </span>
        </div>

        {!submitted ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-mono font-bold text-sm rounded-lg border border-rose-200">
            <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
          </div>
        ) : (
          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
            <CheckCircle2 className="w-4 h-4" /> เสร็จสิ้น
          </div>
        )}
      </div>

      {!submitted ? (
        /* Exam In-Progress Mode */
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur p-6 rounded-3xl border-2 border-amber-300 shadow-lg">
          {/* Question Indicator Strip */}
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg font-bold text-xs transition ${
                    isCurrent
                      ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Body */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                ข้อที่ {currentIndex + 1} · หมวด: {currentQ.skill}
              </span>
              <span className="text-xs text-slate-400">1 คะแนน</span>
            </div>

            <div className="text-lg font-bold text-slate-800 dark:text-white whitespace-pre-wrap leading-relaxed mb-6">
              {currentQ.question}
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = answers[currentQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    className={`w-full p-4 rounded-xl text-left font-medium text-sm border-2 transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 hover:border-amber-300 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                      }`}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40"
            >
              ข้อก่อนหน้า
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white shadow"
              >
                ข้อถัดไป
              </button>
            ) : (
              <button
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl text-sm font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              >
                ส่งข้อสอบ
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur p-6 rounded-3xl border-2 border-amber-300 shadow-xl">
          {!reviewMode ? (
            <div className="text-center py-6">
              <Award className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-bounce" />
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-1">
                สรุปผลคะแนน Mini Mock Exam
              </h3>
              <p className="text-sm text-slate-500 mb-6">โหมดทดลองสอบ O-NET ภาษาอังกฤษ ป.6</p>

              <div className="max-w-xs mx-auto bg-amber-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-amber-200 mb-6">
                <div className="text-5xl font-black text-amber-600 mb-1">
                  {score} <span className="text-2xl text-slate-400 font-bold">/ {questions.length}</span>
                </div>
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  คิดเป็น {percentage}% ({percentage >= 60 ? 'ผ่านเกณฑ์มาตรฐาน' : 'ควรฝึกซ้อมเพิ่มเติม'})
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  เวลาที่ใช้: {formatTime(600 - timeLeft)}
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setReviewMode(true)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4" /> ดูเฉลยและทบทวนข้อที่ผิด
                </button>
                <button
                  onClick={retakeExam}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> ทำใหม่อีกรอบ
                </button>
                <button
                  onClick={onBack}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white font-bold text-sm"
                >
                  กลับหน้า Demo Hub
                </button>
              </div>
            </div>
          ) : (
            /* Review Wrong Questions */
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b">
                <button
                  onClick={() => setReviewMode(false)}
                  className="text-sm font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  ← กลับหน้าสรุปคะแนน
                </button>
                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                  เฉลยข้อสอบครบทั้ง 10 ข้อ
                </span>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {questions.map((q, idx) => {
                  const userAns = answers[q.id];
                  const isCorrect = userAns === q.answer;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border-2 ${
                        isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20'
                          : 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1 text-sm font-bold text-slate-800 dark:text-white whitespace-pre-wrap">
                          {q.question}
                        </div>
                        {isCorrect ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> ถูกต้อง
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> ตอบผิด
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 ml-10 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isKey = oIdx === q.answer;
                          const wasChosen = oIdx === userAns;
                          return (
                            <div
                              key={oIdx}
                              className={`p-2 rounded-lg font-medium flex items-center justify-between ${
                                isKey
                                  ? 'bg-emerald-200/60 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 font-bold'
                                  : wasChosen
                                  ? 'bg-rose-200/60 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 font-bold'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                              {isKey && <span className="text-[11px] text-emerald-700 font-black">(คำตอบที่ถูกต้อง)</span>}
                              {!isKey && wasChosen && <span className="text-[11px] text-rose-700 font-bold">(คำตอบของคุณ)</span>}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-3 ml-10 p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-amber-700 dark:text-amber-400">คำอธิบาย: </span>
                        {q.correctFeedback || q.explanation || q.wrongFeedback}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={onBack}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow"
                >
                  กลับหน้า Demo Hub
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
