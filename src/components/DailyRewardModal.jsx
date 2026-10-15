import UIIcon, { UIIconText } from './UIIcon';
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { STREAK_REWARDS, getStreakReward } from '../utils/scoring';
import { playStreakSound } from '../utils/audio';

export default function DailyRewardModal({ streakDays = 1, onClaim }) {
  const [show, setShow]       = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [xpPop, setXpPop]     = useState(false);

  const dayInWeek  = ((Math.max(1, streakDays) - 1) % 7) + 1;
  const reward     = getStreakReward(streakDays);
  const nextDay    = dayInWeek < 7 ? dayInWeek + 1 : 1;
  const nextReward = STREAK_REWARDS[nextDay - 1];

  // Slide in
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Confetti on milestone days + sound
  useEffect(() => {
    if (!show) return;
    // Play sound — milestone gets the full chime, normal gets a pop
    playStreakSound(reward.isMilestone);

    if (reward.isMilestone) {
      const end = Date.now() + 3000;
      const burst = () => {
        confetti({ particleCount: 7, angle: 60,  spread: 55, origin: { x: 0 }, colors: ['#FFD700','#FF69B4','#00BFFF'] });
        confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700','#FF69B4','#00BFFF'] });
        if (Date.now() < end) requestAnimationFrame(burst);
      };
      burst();
    }
  }, [show, reward.isMilestone]);

  const handleClaim = () => {
    if (claimed) return;
    setClaimed(true);
    setXpPop(true);
    setTimeout(() => onClaim(reward.xp), 900);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-sm glass-card text-center shadow-2xl overflow-hidden
          transition-all duration-500 transform animate-bounce-in
          ${show ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-10 opacity-0'}`}
      >
        {/* Top colour glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: reward.color }}
        />

        <div className="relative px-6 pt-7 pb-6">

          {/* Title */}
          <p className="text-xs font-bold uppercase tracking-widest mb-1 text-amber-600">
            <UIIcon value={"🔥"} /> ล็อคอินติดต่อกัน
          </p>
          <h2 className="text-2xl font-black text-amber-900 mb-4">รางวัลประจำวัน!</h2>

          {/* Big icon */}
          <div className={`text-7xl mb-2 inline-block ${show ? 'animate-bounce' : ''}`}>
            <UIIcon value={reward.icon} />
          </div>

          {/* Day badge */}
          <div className="mb-5">
            <span
              className="text-5xl font-black"
              style={{ color: reward.color, textShadow: `0 0 20px ${reward.color}55` }}
            >
              Day {dayInWeek}
            </span>
            {dayInWeek === 7 && (
              <p className="text-xs text-slate-500 mt-1">ครบสัปดาห์! รอบใหม่เริ่มพรุ่งนี้ <UIIcon value={"🔄"} /></p>
            )}
          </div>

          {/* 7-day dot tracker */}
          <div className="flex justify-center gap-2 mb-6">
            {STREAK_REWARDS.map((r, i) => {
              const isDone    = i < dayInWeek;
              const isCurrent = i === dayInWeek - 1;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold
                      transition-all duration-300 border-2
                      ${isCurrent ? 'scale-125 border-white shadow-lg' : isDone ? 'border-transparent' : 'border-slate-200'}`}
                    style={{
                      background: isDone
                        ? `linear-gradient(135deg, ${r.color}, ${r.color}99)`
                        : 'rgba(0,0,0,0.05)',
                      color: isDone ? '#111' : 'rgba(0,0,0,0.25)',
                      boxShadow: isCurrent ? `0 0 14px ${r.color}` : undefined,
                    }}
                  >
                    <UIIconText value={isDone ? (isCurrent ? r.icon : '✓') : i + 1} />
                  </div>
                  <span className="text-[9px] font-bold" style={{ color: isDone ? r.color : 'rgba(0,0,0,0.25)' }}>
                    +{r.xp}
                  </span>
                </div>
              );
            })}
          </div>

          {/* XP reward box */}
          <div
            className="relative rounded-2xl py-4 px-4 mb-4 border overflow-hidden bg-amber-50"
            style={{ borderColor: `${reward.color}55` }}
          >
            {/* Float-up XP pop */}
            {xpPop && (
              <div
                className="absolute top-0 left-1/2 font-black text-2xl pointer-events-none"
                style={{
                  color: reward.color,
                  transform: 'translateX(-50%)',
                  animation: 'drFloatUp 0.9s ease-out forwards',
                }}
              >
                +{reward.xp} XP!
              </div>
            )}
            <div className="text-4xl font-black text-amber-600">+{reward.xp} XP</div>
            <div className="text-slate-600 text-sm mt-0.5">{reward.label}</div>
            <div className="text-slate-500 text-xs mt-1">Streak รวม {streakDays} วัน</div>
          </div>

          {/* Next day hint */}
          <p className="text-slate-500 text-xs mb-5">
            {dayInWeek < 7
              ? `พรุ่งนี้: Day ${nextDay} → ${nextReward.icon} +${nextReward.xp} XP`
              : `พรุ่งนี้เริ่มสัปดาห์ใหม่ → ${STREAK_REWARDS[0].icon} +${STREAK_REWARDS[0].xp} XP`}
          </p>

          {/* Claim button */}
          <button
            onClick={handleClaim}
            disabled={claimed}
            className={`btn-primary w-full py-3.5 text-lg tracking-wide
              ${claimed ? 'opacity-60 cursor-default' : ''}`}
          >
            <UIIconText value={claimed ? '✅ รับแล้ว!' : '🎁 รับรางวัล!'} />
          </button>
        </div>
      </div>

      {/* Keyframe injected once */}
      <style>{`
        @keyframes drFloatUp {
          0%   { opacity:1; transform:translateX(-50%) translateY(0); }
          100% { opacity:0; transform:translateX(-50%) translateY(-48px); }
        }
      `}</style>
    </div>
  );
}
