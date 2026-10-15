import UIIcon, { UIIconText } from '../UIIcon';
import React from 'react';
import { getAvatarUrl } from '../../utils/avatar';

const PodiumItem = ({ student, rank, activeTab }) => {
  if (!student) return <div className="flex-1" />;

  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const isThird = rank === 3;

  // Formatting score based on activeTab
  let scoreText = '';
  if (activeTab === 'overall') scoreText = `${(student?.rankScore || 0).toLocaleString()} pts`;
  else if (activeTab === 'growth') scoreText = `+${student?.growthScore || 0}%`;
  else if (activeTab === 'accuracy') scoreText = `${student?.accuracy || 0}%`;
  else if (activeTab === 'streak') scoreText = `${student?.streakDays || 0} วัน`;
  else if (activeTab === 'mistakes') scoreText = `${student?.mistakesFixed || 0} ข้อ`;
  else if (activeTab === 'skill') scoreText = `${student?.skillScore || 0} ข้อ`;
  else if (activeTab === 'fastguess') scoreText = `${student?.rankingStats?.fastGuessCount || 0} ครั้ง`;

  let baseColor = '';
  let shadowColor = '';
  let crownIcon = '';
  let height = '';
  let zIndex = '';
  
  if (isFirst) {
    baseColor = 'from-yellow-300 via-amber-400 to-amber-600 border-yellow-200';
    shadowColor = 'shadow-[0_0_20px_rgba(251,191,36,0.6)]';
    crownIcon = activeTab === 'fastguess' ? '🤡' : '👑';
    height = 'h-52 md:h-56';
    zIndex = 'z-20';
  } else if (isSecond) {
    baseColor = 'from-slate-200 via-slate-300 to-slate-400 border-slate-100';
    shadowColor = 'shadow-[0_0_15px_rgba(148,163,184,0.5)]';
    crownIcon = activeTab === 'fastguess' ? '🙈' : '🥈';
    height = 'h-44 md:h-48';
    zIndex = 'z-10';
  } else {
    baseColor = 'from-orange-300 via-orange-400 to-orange-600 border-orange-200';
    shadowColor = 'shadow-[0_0_15px_rgba(249,115,22,0.5)]';
    crownIcon = activeTab === 'fastguess' ? '🙊' : '🥉';
    height = 'h-36 md:h-40';
    zIndex = 'z-0';
  }

  return (
    <div className={`flex flex-col items-center justify-end flex-1 ${zIndex}`}>
      {/* Crown / Rank Icon */}
      <div className={`text-4xl -mb-4 relative z-30 drop-shadow-lg ${isFirst ? 'text-5xl -mb-5' : ''} animate-bounce-slow`}>
        <UIIcon value={crownIcon} />
      </div>

      {/* Avatar & Info Card */}
      <div className={`
        relative w-full mx-1 rounded-t-2xl border-2 bg-gradient-to-b ${baseColor} ${shadowColor}
        flex flex-col items-center pt-5 pb-2 px-1
        transition-transform duration-500 hover:scale-105
        ${height}
      `}>
        {/* Inner glass effect */}
        <div className="absolute inset-0 bg-white/20 rounded-t-2xl pointer-events-none" />
        
        {/* Avatar */}
        <div className={`
          rounded-full bg-slate-50 p-1 mb-2 relative z-10 shadow-lg
          ${isFirst ? 'w-16 h-16 md:w-20 md:h-20 border-2 border-yellow-200' : 'w-14 h-14 md:w-16 md:h-16 border-2 border-white/50'}
        `}>
          <img src={getAvatarUrl(student.name)} alt={student.name} className="w-full h-full object-cover rounded-full" />
        </div>

        {/* Name Badge */}
        <div className={`
          relative z-10 px-1 py-1 rounded shadow text-white font-bold text-center text-[10px] md:text-xs w-full max-w-[95%] break-words leading-tight
          ${isFirst ? 'bg-red-600' : isSecond ? 'bg-blue-600' : 'bg-emerald-600'}
        `}>
          {student.name || 'ไม่มีชื่อ'}
        </div>

        {/* Score */}
        <div className="mt-2 text-sm font-black text-slate-900 drop-shadow-sm relative z-10">
          {scoreText}
        </div>

        {/* Level Pill */}
        <div className="mt-auto relative z-10 bg-slate-900/60 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
          Lv.{student.level || 1}
        </div>
      </div>
    </div>
  );
};

export default function TopThreePodium({ topThree, activeTab }) {
  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="flex items-end justify-center w-full max-w-lg mx-auto mb-6 px-2 h-64 md:h-72 pt-8">
      <PodiumItem student={second} rank={2} activeTab={activeTab} />
      <PodiumItem student={first} rank={1} activeTab={activeTab} />
      <PodiumItem student={third} rank={3} activeTab={activeTab} />
    </div>
  );
}
