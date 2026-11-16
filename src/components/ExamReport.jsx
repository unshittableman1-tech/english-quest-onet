import ArenaDeliveryStatus from './report/ArenaDeliveryStatus';
import UIIcon, { UIIconText } from './UIIcon';
import React, { useState } from 'react';

export default function ExamReport({ attempt, student, onBackToArena }) {
  const [reviewMode, setReviewMode] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} นาที ${s} วินาที`;
  };

  const getScoreColor = (percent) => {
    if (percent >= 80) return 'text-emerald-600';
    if (percent >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (reviewMode) {
    return (
      <div className="min-h-screen pb-32">
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-200 px-4 py-3 flex items-center shadow-md">
          <button onClick={() => setReviewMode(false)} className="btn-ghost text-sm px-3 py-1 mr-4">
            <UIIcon value={"←"} /> กลับหน้าสรุป
          </button>
          <h2 className="font-black text-amber-800">ทบทวนข้อที่ผิด ({attempt.wrongQuestions.length} ข้อ)</h2>
        </div>
        
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {attempt.wrongQuestions.length === 0 ? (
            <div className="text-center py-20 text-emerald-600 text-xl font-black">
              สุดยอด! คุณไม่ตอบผิดเลย <UIIcon value={"🎉"} />
            </div>
          ) : (
            attempt.wrongQuestions.map((wq, idx) => {
              const q = wq.question;
              return (
                <div key={idx} className="glass-card p-6 border-l-4 border-l-rose-400">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-black border border-rose-300">
                      {idx + 1}
                    </span>
                    <div className="flex-1 text-lg text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                      {q.question}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4 ml-12">
                    {q.options.map((opt, i) => {
                      const isUserAnswer = wq.userAnswerIndex === i;
                      const isCorrectAnswer = wq.correctAnswerIndex === i;
                      
                      let btnClass = 'bg-slate-50 border-slate-200 text-slate-500 opacity-60';
                      if (isCorrectAnswer) btnClass = 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm';
                      else if (isUserAnswer) btnClass = 'bg-rose-50 border-rose-400 text-rose-800';
                      
                      return (
                        <div key={i} className={`w-full text-left p-4 rounded-xl border flex gap-3 items-center ${btnClass}`}>
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 ${
                            isCorrectAnswer ? 'bg-emerald-500 border-emerald-400 text-white' : 
                            isUserAnswer ? 'bg-rose-500 border-rose-400 text-white' : 'border-slate-300 text-slate-500'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectAnswer && <span className="text-xl"><UIIcon value={"✅"} /></span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="text-xl"><UIIcon value={"❌"} /></span>}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 ml-12 p-4 bg-amber-50 rounded-xl border border-amber-200 text-sm">
                    <div className="text-amber-700 font-black mb-1">คำอธิบาย:</div>
                    <div className="text-slate-700">{q.wrongFeedback || q.correctFeedback}</div>
                    {q.keyword && (
                      <div className="mt-2 text-xs text-sky-700 bg-sky-50 inline-block px-2 py-1 rounded border border-sky-200">
                        <UIIcon value={"💡"} /> จำคีย์เวิร์ด: {q.keyword}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Find strongest and weakest skills
  const skills = Object.keys(attempt.skillScores || {}).map(s => ({
    name: s,
    ...attempt.skillScores[s],
    percent: (attempt.skillScores[s].correct / attempt.skillScores[s].total) * 100
  })).sort((a, b) => b.percent - a.percent);
  
  const bestSkill = skills.length > 0 ? skills[0] : null;
  const worstSkill = skills.length > 0 ? skills[skills.length - 1] : null;

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden flex flex-col items-center pt-10 px-4">
      <ArenaDeliveryStatus student={student} attemptId={attempt.attemptId} />
      <div className="w-full max-w-xl relative z-10">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl"><UIIcon value={"📊"} /></span>
          <h1 className="text-3xl font-black text-amber-800">
            สรุปผลการทำข้อสอบ
          </h1>
        </div>
        
        {/* Main Score Card */}
        <div className="glass-card p-8 mb-8 text-center flex flex-col items-center">
          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">คะแนนรวม</div>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-6xl font-black ${getScoreColor(attempt.percent)}`}>
              {attempt.score}
            </span>
            <span className="text-2xl text-slate-500 font-bold pb-2">/ {attempt.total}</span>
          </div>
          <div className={`text-xl font-black ${getScoreColor(attempt.percent)} bg-slate-50 px-4 py-1 rounded-full mb-6 border border-slate-200`}>
            {Math.round(attempt.percent)}%
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs text-sm">
            <div className="bg-sky-50 rounded-xl p-3 border border-sky-200">
              <div className="text-slate-500 mb-1">เวลาที่ใช้</div>
              <div className="font-mono text-sky-700 font-black">{formatTime(attempt.timeUsed)}</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-3 border border-rose-200">
              <div className="text-slate-500 mb-1">ตอบผิด</div>
              <div className="text-rose-600 font-black">{attempt.wrongQuestions.length} ข้อ</div>
            </div>
          </div>
        </div>

        {/* Skill Breakdown */}
        {skills.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h3 className="text-lg font-black text-amber-800 mb-4"><UIIcon value={"📈"} /> การวิเคราะห์ทักษะ (Skill Analysis)</h3>
            <div className="space-y-4">
              {skills.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-bold capitalize">{s.name}</span>
                    <span className="font-mono text-slate-500">
                      {s.correct}/{s.total} <span className={getScoreColor(s.percent)}>({Math.round(s.percent)}%)</span>
                    </span>
                  </div>
                  <div className="progress-track h-2">
                    <div 
                      className={`h-full rounded-full ${s.percent >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : s.percent >= 50 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              {bestSkill && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="text-emerald-600 text-xs font-bold mb-1"><UIIcon value={"🌟"} /> ทักษะที่ทำได้ดีสุด</div>
                  <div className="text-emerald-700 font-black capitalize">{bestSkill.name}</div>
                </div>
              )}
              {worstSkill && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                  <div className="text-rose-600 text-xs font-bold mb-1"><UIIcon value={"⚠️"} /> ทักษะที่ควรฝึกเพิ่ม</div>
                  <div className="text-rose-700 font-black capitalize">{worstSkill.name}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setReviewMode(true)}
            disabled={attempt.wrongQuestions.length === 0}
            className="btn-ghost p-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UIIcon value={"🔍"} /> ทบทวนข้อที่ผิด
          </button>
          <button 
            onClick={onBackToArena}
            className="btn-primary p-4"
          >
            <UIIcon value={"←"} /> กลับ O-NET Arena
          </button>
        </div>
      </div>
    </div>
  );
}
