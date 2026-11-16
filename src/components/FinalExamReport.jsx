import ArenaDeliveryStatus from './report/ArenaDeliveryStatus';
import UIIcon, { UIIconText } from './UIIcon';
import React, { useState, useEffect } from 'react';

export default function FinalExamReport({ attempt, student, onBack }) {
  const [reviewMode, setReviewMode] = useState(false);
  const [confettiDone, setConfettiDone] = useState(false);

  const passed = attempt.percent >= 70;

  // Confetti animation on pass
  useEffect(() => {
    if (passed && !confettiDone) {
      setConfettiDone(true);
      try {
        import('canvas-confetti').then(({ default: confetti }) => {
          confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 } });
          setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0 } }), 400);
          setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1 } }), 600);
        });
      } catch { /* no-op */ }
    }
  }, [passed, confettiDone]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} นาที ${s} วินาที`;
  };

  const formatDate = (ts) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getScoreColor = (pct) => {
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 70) return 'text-blue-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-rose-600';
  };

  const getGradientClass = (pct) => {
    if (pct >= 80) return 'from-emerald-600/30 via-emerald-900/10 to-slate-900';
    if (pct >= 70) return 'from-blue-600/30 via-blue-900/10 to-slate-900';
    if (pct >= 50) return 'from-amber-600/20 via-amber-900/10 to-slate-900';
    return 'from-red-700/20 via-red-900/10 to-slate-900';
  };

  const getGrade = (pct) => {
    if (pct >= 80) return { label: 'ดีมาก', emoji: '🏆', color: 'text-emerald-400' };
    if (pct >= 70) return { label: 'ผ่าน', emoji: '✅', color: 'text-blue-400' };
    if (pct >= 50) return { label: 'พอใช้', emoji: '📖', color: 'text-amber-400' };
    return { label: 'ต้องปรับปรุง', emoji: '💪', color: 'text-rose-600' };
  };

  const skills = Object.keys(attempt.skillScores || {}).map(s => ({
    name: s,
    ...attempt.skillScores[s],
    percent: (attempt.skillScores[s].correct / attempt.skillScores[s].total) * 100
  })).sort((a, b) => b.percent - a.percent);

  const grade = getGrade(attempt.percent);

  // ── Review mode ──────────────────────────────────────────────
  if (reviewMode) {
    return (
      <div className="min-h-screen bg-slate-900 pb-32 text-slate-200">
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-200 px-4 py-3 flex items-center shadow-lg">
          <button onClick={() => setReviewMode(false)} className="text-slate-500 hover:text-white px-3 py-1 bg-white/5 rounded-lg mr-4">
            <UIIcon value={"←"} /> กลับหน้าผล
          </button>
          <h2 className="font-bold text-slate-800">ทบทวนข้อที่ผิด ({attempt.wrongQuestions.length} ข้อ)</h2>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
          {attempt.wrongQuestions.length === 0 ? (
            <div className="text-center py-20 text-emerald-400 text-xl font-bold">สุดยอด! คุณไม่ตอบผิดเลย <UIIcon value={"🎉"} /></div>
          ) : (
            attempt.wrongQuestions.map((wq, idx) => {
              const q = wq.question;
              return (
                <div key={idx} className="glass-card p-6 border-red-500/20">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center font-bold border border-red-500/30">{idx + 1}</span>
                    <div className="flex-1 text-lg text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">{q.question}</div>
                  </div>
                  <div className="space-y-3 mt-4 ml-12">
                    {q.options.map((opt, i) => {
                      const isUserAnswer = wq.userAnswerIndex === i;
                      const isCorrectAnswer = wq.correctAnswerIndex === i;
                      let btnClass = 'bg-slate-50/50 border-amber-200 text-slate-500 opacity-50';
                      if (isCorrectAnswer) btnClass = 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
                      else if (isUserAnswer) btnClass = 'bg-red-600/20 border-red-500 text-red-300';
                      return (
                        <div key={i} className={`w-full text-left p-4 rounded-xl border flex gap-3 items-center ${btnClass}`}>
                          <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 ${isCorrectAnswer ? 'bg-emerald-500 border-emerald-400 text-white' : isUserAnswer ? 'bg-red-500 border-red-400 text-white' : 'border-slate-600 text-slate-500'}`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {isCorrectAnswer && <span className="text-xl"><UIIcon value={"✅"} /></span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="text-xl"><UIIcon value={"❌"} /></span>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 ml-12 p-4 bg-slate-50/80 rounded-xl border border-amber-200 text-sm">
                    <div className="text-amber-400 font-bold mb-1">คำอธิบาย:</div>
                    <div className="text-slate-600">{q.wrongFeedback || q.correctFeedback}</div>
                    {q.keyword && (
                      <div className="mt-2 text-xs text-blue-300 bg-blue-900/30 inline-block px-2 py-1 rounded">
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

  // ── Main result page ─────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-b ${getGradientClass(attempt.percent)} pb-20 relative overflow-hidden`}>
      <ArenaDeliveryStatus student={student} attemptId={attempt.attemptId} />
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[120px] opacity-30 pointer-events-none bg-blue-500" />

      <div className="relative z-10 max-w-xl mx-auto px-4 pt-10 flex flex-col items-center">

        {/* ── Top Badge ── */}
        <div className="text-7xl mb-2 drop-shadow-lg animate-bounce">
          <UIIcon value={grade.emoji} />
        </div>
        <h1 className="text-3xl font-black text-center text-slate-800 mb-1">ผลสอบปลายภาค</h1>
        <div className="text-slate-500 text-sm mb-8">
          {student?.name && <span className="text-slate-600 font-semibold">{student.name}</span>}
          {' '}· {formatDate(attempt.submittedAt)}
        </div>

        {/* ── Score Card ── */}
        <div className="w-full glass-card p-8 mb-6 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
          
          <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">คะแนนรวม</div>
          <div className="flex items-end justify-center gap-2 mb-1">
            <span className={`text-7xl font-black ${getScoreColor(attempt.percent)}`} style={{ lineHeight: 1 }}>
              {attempt.points !== undefined ? attempt.points : (attempt.score * 2)}
            </span>
            <span className="text-2xl text-slate-500 font-bold pb-2">/ {attempt.maxPoints || 100} คะแนน</span>
          </div>
          <div className="text-xs text-slate-500 mb-3 font-medium">
            (ตอบถูก {attempt.score} จาก {attempt.total} ข้อ · ข้อละ 2 คะแนน)
          </div>
          <div className={`inline-block text-2xl font-black px-6 py-1 rounded-full mb-5 border ${
            passed
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-rose-600'
          }`}>
            {Math.round(attempt.percent)}%
          </div>

          <div className={`text-xl font-black ${grade.color} mb-6`}>{grade.label}</div>

          {/* Progress bar */}
          <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden mb-6">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                attempt.percent >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                attempt.percent >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                attempt.percent >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                'bg-gradient-to-r from-red-600 to-orange-500'
              }`}
              style={{ width: `${attempt.percent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/60 rounded-xl p-3 border border-white/5">
              <div className="text-slate-500 mb-1"><UIIcon value={"⏱️"} /> เวลาที่ใช้</div>
              <div className="font-mono text-blue-300 font-bold">{formatTime(attempt.timeUsed)}</div>
            </div>
            <div className="bg-white/60 rounded-xl p-3 border border-white/5">
              <div className="text-slate-500 mb-1"><UIIcon value={"❌"} /> ตอบผิด</div>
              <div className="text-rose-600 font-bold">{attempt.wrongQuestions.length} ข้อ</div>
            </div>
          </div>
        </div>

        {/* ── Certificate Banner (on pass) ── */}
        {passed && (
          <div className="w-full mb-6 rounded-2xl overflow-hidden border-2 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.2)] bg-gradient-to-br from-yellow-900/30 via-slate-900 to-amber-900/20">
            <div className="p-6 text-center">
              <div className="text-4xl mb-2"><UIIcon value={"🏅"} /></div>
              <div className="text-amber-600 font-black text-xl mb-1">ผ่านการสอบปลายภาค</div>
              <div className="text-yellow-300/60 text-sm">
                {student?.name || 'นักเรียน'} ได้รับคะแนน {attempt.points !== undefined ? attempt.points : (attempt.score * 2)} / {attempt.maxPoints || 100} คะแนน ({Math.round(attempt.percent)}%) — ผ่านเกณฑ์ 70%
              </div>
              <div className="mt-3 text-xs text-yellow-500/50">O-NET Adventure · สอบปลายภาค ป.6</div>
            </div>
          </div>
        )}

        {/* ── Not passed note ── */}
        {!passed && (
          <div className="w-full mb-6 rounded-2xl border border-red-500/30 bg-red-900/10 p-5 text-center">
            <div className="text-2xl mb-1"><UIIcon value={"📖"} /></div>
            <div className="text-red-300 font-bold">คะแนนยังไม่ถึงเกณฑ์ 70%</div>
            <div className="text-rose-600/60 text-sm mt-1">กลับไปฝึกฝนเพิ่มเติมในส่วน Arena และกลับมาถามครูเพื่อเปิดสอบใหม่</div>
          </div>
        )}

        {/* ── Skill Breakdown ── */}
        {skills.length > 0 && (
          <div className="w-full glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4"><UIIcon value={"🔍"} /> วิเคราะห์ทักษะ</h3>
            <div className="space-y-4">
              {skills.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 capitalize">{s.name}</span>
                    <span className="font-mono text-slate-500">
                      {s.correct}/{s.total} <span className={getScoreColor(s.percent)}>({Math.round(s.percent)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${s.percent >= 80 ? 'bg-emerald-500' : s.percent >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${s.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="w-full grid grid-cols-2 gap-4">
          <button
            onClick={() => setReviewMode(true)}
            disabled={attempt.wrongQuestions.length === 0}
            className="p-4 rounded-xl font-bold bg-slate-700 hover:bg-slate-600 text-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UIIcon value={"🔍"} /> ทบทวนข้อที่ผิด
          </button>
          <button
            onClick={onBack}
            className="p-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 transition-all"
          >
            <UIIcon value={"←"} /> กลับ Arena
          </button>
        </div>

      </div>
    </div>
  );
}
