import UIIcon, { UIIconText } from './UIIcon';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ARENA_MISSIONS, FINAL_EXAM_CONFIG } from '../data/chapter4_config';
import {
  miniMockPool, speedMockPool, skillMixedPool, fullMockPool, finalSimPool,
  weaknessMockBySkill, getFinalExamPool, getOnetYearSimulationPool
} from '../data/chapter4_questions';
import { getOnetRealYearPool } from '../data/onetRealExamPools';
import { getArenaStats } from '../utils/arenaStorage';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';
import { isSingleStepMcq } from '../utils/questionFormat';

// Fisher-Yates shuffle
function shuffle(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function ExamMode({ missionId, student, onFinish, onCancel }) {
  const [questions, setQuestions] = useState([]);
  const { mediaStatus, onMediaFailure } = useQuestionMedia(questions);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [initError, setInitError] = useState(null);
  const submittedRef = useRef(false);
  const submitRef = useRef(null);

  const config = useMemo(() => {
    if (missionId === 'final_exam') return FINAL_EXAM_CONFIG;
    return ARENA_MISSIONS.find(m => m.id === missionId);
  }, [missionId]);

  // Initialize Exam
  useEffect(() => {
    if (!config) return;

    let pool = [];
    if (missionId === 'mini_mock_arena') pool = miniMockPool;
    else if (missionId === 'speed_mock_challenge') pool = speedMockPool;
    else if (missionId === 'skill_mixed_mock') pool = skillMixedPool;
    else if (missionId === 'full_mock_test') pool = fullMockPool;
    else if (missionId === 'final_exam_simulation') pool = finalSimPool;
    else if (missionId === 'final_exam') pool = getFinalExamPool(config.questions || 50);
    else if (missionId === 'onet_year_2565') pool = getOnetRealYearPool(2565);
    else if (missionId === 'onet_year_2566') pool = getOnetRealYearPool(2566);
    else if (missionId === 'onet_year_2567') pool = getOnetRealYearPool(2567);
    else if (missionId === 'onet_year_2568') pool = getOnetYearSimulationPool(2568);
    else if (missionId === 'weakness_mock') {
      // Build weakness mock from student's past data
      const stats = getArenaStats(student.id);
      let weakSkills = ['grammar', 'reading']; // Default if no data
      
      if (stats?.attempts?.length > 0) {
        // Find skills with lowest average score in past attempts
        const skillScores = {};
        const skillCounts = {};
        stats.attempts.forEach(att => {
          Object.keys(att.skillScores || {}).forEach(skill => {
            if (!skillScores[skill]) { skillScores[skill] = 0; skillCounts[skill] = 0; }
            skillScores[skill] += att.skillScores[skill].correct;
            skillCounts[skill] += att.skillScores[skill].total;
          });
        });
        
        const skillAverages = Object.keys(skillCounts).map(skill => ({
          skill,
          avg: skillScores[skill] / skillCounts[skill]
        })).sort((a, b) => a.avg - b.avg);
        
        if (skillAverages.length >= 2) {
          weakSkills = [skillAverages[0].skill, skillAverages[1].skill];
        }
      }

      // Pick questions from these weak skills
      weakSkills.forEach(skill => {
        if (weaknessMockBySkill[skill]) {
          pool = [...pool, ...weaknessMockBySkill[skill]];
        }
      });
      // Fallback if pool is still small
      if (pool.length < config.questions) {
        pool = [...pool, ...miniMockPool, ...skillMixedPool];
      }
    }

    pool = pool.filter(isSingleStepMcq);
    if (pool.length < config.questions) {
      setQuestions([]);
      setInitError(`ข้อสอบแบบเลือกคำตอบพร้อมใช้ไม่ครบ ${config.questions} ข้อ`);
      return;
    }
    setInitError(null);
    // Select questions (final_exam and authentic year simulations keep official question order)
    const selected = (missionId === 'final_exam' || config.isYearSim)
      ? pool.slice(0, config.questions)
      : shuffle(pool).slice(0, config.questions);
    
    // Add originalIndex to options to keep track of correct answer after shuffle
    const formattedQuestions = selected.map(q => {
      const optionsWithIndex = q.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
      const shuffledOptions = config.isYearSim ? optionsWithIndex : shuffle(optionsWithIndex);
      return { ...q, shuffledOptions };
    });

    setQuestions(formattedQuestions);
    setAnswers({});
    submittedRef.current = false;
    setIsSubmitting(false);
    setTimeLeft(config.timeLimit);
    setStartedAt(Date.now());
  }, [config, missionId, student.id]);

  // Timer Logic
  useEffect(() => {
    if (mediaStatus === 'ready') setStartedAt(Date.now());
  }, [mediaStatus]);

  useEffect(() => {
    if (questions.length === 0 || isSubmitting || mediaStatus !== 'ready') return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((startedAt + config.timeLimit * 1000 - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        submitRef.current?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [questions.length, isSubmitting, startedAt, config, mediaStatus]);

  const handleSubmit = useCallback(() => {
    if (submittedRef.current || questions.length === 0 || mediaStatus !== 'ready') return;
    submittedRef.current = true;
    setIsSubmitting(true);
    setShowConfirm(false);
    
    let score = 0;
    const skillScores = {};
    const wrongQuestions = [];

    questions.forEach((q, index) => {
      const selectedOptionOriginalIndex = answers[index];
      const isCorrect = selectedOptionOriginalIndex === q.answer;
      
      if (!skillScores[q.skill]) {
        skillScores[q.skill] = { correct: 0, total: 0 };
      }
      skillScores[q.skill].total++;

      if (isCorrect) {
        score++;
        skillScores[q.skill].correct++;
      } else {
        wrongQuestions.push({
          question: q,
          userAnswerIndex: selectedOptionOriginalIndex, // Can be undefined if skipped
          correctAnswerIndex: q.answer
        });
      }
    });

    const timeUsed = Math.min(config.timeLimit, Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    const percent = (score / questions.length) * 100;
    const isFinal = missionId === 'final_exam';
    const points = isFinal ? score * 2 : score;
    const maxPoints = isFinal ? 100 : questions.length;

    const attempt = {
      attemptId: `att_${Date.now()}`,
      mode: missionId,
      score,
      total: questions.length,
      points,
      maxPoints,
      percent,
      timeUsed,
      skillScores,
      wrongQuestions,
      startedAt,
      submittedAt: Date.now()
    };

    onFinish(attempt);
  }, [answers, questions, config, timeLeft, startedAt, missionId, onFinish, mediaStatus]);

  submitRef.current = handleSubmit;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (initError) return <main className="question-media-gate" role="alert"><h2>ยังไม่สามารถเริ่มชุดนี้ได้</h2><p>{initError}</p><button onClick={onCancel}>กลับ</button></main>;
  if (questions.length > 0 && mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={onCancel} />;
  if (!config || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-amber-700 font-bold">กำลังเตรียมข้อสอบ...</p>
        </div>
      </div>
    );
  }

  const isWarningTime = timeLeft <= 300 && config.timeLimit > 300; // 5 minutes warning
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen pb-32">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-200 px-4 py-3 flex justify-between items-center shadow-md">
        <button onClick={onCancel} className="text-slate-500 hover:text-slate-800 text-sm px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-bold">
          ออก
        </button>
        <div className="flex-1 text-center font-bold text-slate-800 truncate px-2">
          {config.name}
          {missionId === 'final_exam' && (
            <span className="text-[11px] text-amber-600 font-normal block">50 ข้อ · 100 คะแนนเต็ม (ข้อละ 2 คะแนน)</span>
          )}
        </div>
        <div className={`font-mono text-xl font-black px-3 py-1 rounded-lg border ${
          isWarningTime ? 'timer-danger' : 'bg-amber-50 text-amber-700 border-amber-300'
        }`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-track h-2 rounded-none">
        <div 
          className={`h-full transition-all duration-300 ${isWarningTime ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`} 
          style={{ width: `${(timeLeft / config.timeLimit) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-12">
        {questions.map((q, qIndex) => (
          <div key={q.id} className="glass-card p-6" id={`q-${qIndex}`}>
            <QuestionStimulus question={q} onFailure={onMediaFailure} />
            <div className="flex justify-between items-start mb-4 gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold border border-amber-300">
                {qIndex + 1}
              </span>
              <div className="flex-1 text-lg text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                {q.question}
              </div>
              {missionId === 'final_exam' && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 shrink-0 shadow-sm">
                  2 คะแนน
                </span>
              )}
            </div>

            <div className="space-y-3 mt-6 ml-12">
              {q.shuffledOptions.map((opt, i) => {
                const isSelected = answers[qIndex] === opt.originalIndex;
                return (
                  <button
                    key={i}
                    disabled={isSubmitting}
                    onClick={() => setAnswers(prev => ({ ...prev, [qIndex]: opt.originalIndex }))}
                    className={`option-btn w-full text-left ${isSelected ? 'selected-correct' : ''}`}
                  >
                    <div className="flex gap-3">
                      <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'border-amber-500 bg-amber-500 text-white' : 'border-slate-300 text-slate-500'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-slate-700">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-200 p-4 z-40 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="text-sm text-slate-500">
            ตอบแล้ว <span className="text-amber-700 font-black">{answeredCount}</span> / {questions.length} ข้อ
          </div>
          <button
            disabled={isSubmitting}
            onClick={() => setShowConfirm(true)}
            className="btn-primary px-8"
          >
            ส่งคำตอบ
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="glass-card p-6 max-w-sm w-full relative z-10 animate-bounce-in">
            <h3 className="text-xl font-black text-amber-800 mb-2">ยืนยันส่งคำตอบ?</h3>
            <p className="text-slate-600 mb-6 text-sm">
              คุณตอบไปแล้ว {answeredCount} จาก {questions.length} ข้อ
              <br/>
              {answeredCount < questions.length && (
                <span className="text-rose-600 mt-2 block font-bold"><UIIcon value={"⚠️"} /> ยังมีข้อที่ไม่ได้ตอบ!</span>
              )}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="btn-ghost flex-1"
              >
                ทำต่อ
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-success flex-1"
              >
                ส่งข้อสอบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
