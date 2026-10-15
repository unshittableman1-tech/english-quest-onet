import React from 'react';
import TierBadge from './TierBadge';
import { getRankingTier } from '../../utils/scoring';
import { getAvatarUrl } from '../../utils/avatar';

export default function MyRankCard({ student, rankIndex, activeTab, onTierClick, leaderboardLength }) {
  if (!student) return null;

  const rankNumber = rankIndex >= 0 ? rankIndex + 1 : '-';
  
  // Format score based on activeTab
  let scoreText = '';
  if (activeTab === 'overall') scoreText = `${(student?.rankScore || 0).toLocaleString()} pts`;
  else if (activeTab === 'growth') scoreText = `+${student?.growthScore || 0}%`;
  else if (activeTab === 'accuracy') scoreText = `${student?.accuracy || 0}%`;
  else if (activeTab === 'streak') scoreText = `${student?.streakDays || 0} วัน`;
  else if (activeTab === 'mistakes') scoreText = `${student?.mistakesFixed || 0} ข้อ`;
  else if (activeTab === 'skill') scoreText = `${student?.skillScore || 0} ข้อ`;
  else if (activeTab === 'fastguess') scoreText = `${student?.rankingStats?.fastGuessCount || 0} ครั้ง`;

  const tier = getRankingTier(student?.rankScore || 0);
  
  let progressText = '';
  let progressPct = 100;
  
  if (activeTab === 'overall') {
    if (tier.next) {
      const pointsToNext = tier.next - (student?.rankScore || 0);
      progressText = `อีก ${pointsToNext.toLocaleString()} คะแนน จะขึ้นแรงก์ถัดไป`;
      progressPct = Math.min(100, Math.max(0, (((student?.rankScore || 0) - tier.min) / (tier.next - tier.min)) * 100));
    } else {
      progressText = 'สูงสุดแล้วในขณะนี้!';
    }
  } else {
    // For other tabs, show rank distance if not rank 1
    if (rankIndex > 0) {
      progressText = `พยายามอีกนิดเพื่อแซงอันดับ ${rankIndex}`;
      progressPct = 50; // Just visual
    } else if (rankIndex === 0) {
      progressText = 'คุณคืออันดับ 1! ยอดเยี่ยมมาก';
      progressPct = 100;
    } else {
      progressText = 'ทำเงื่อนไขให้ครบเพื่อติดอันดับ';
      progressPct = 0;
    }
  }

  return (
    <div className="relative glass-card p-4 mx-2 mb-6 rounded-2xl bg-[#FFFBF0] text-slate-800 border-2 border-amber-200/50 shadow-xl overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-amber-300 p-0.5 shadow-md flex-shrink-0">
          <img src={getAvatarUrl(student.name)} alt="My Avatar" className="w-full h-full object-cover rounded-full" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              อันดับของฉัน <span className="text-blue-600 font-black">#{rankNumber}</span>
            </h3>
            <div className="font-black text-xl text-slate-800 tracking-tight">
              {scoreText}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-600 font-semibold truncate max-w-[100px]">คุณ</span>
            <span className="text-xs font-black bg-purple-900 text-purple-100 px-2 py-0.5 rounded-lg border border-purple-400/40 shadow-sm">
              Lv.{student.level || 1}
            </span>
            {activeTab === 'overall' && (
              <TierBadge tier={tier} onClick={onTierClick} className="bg-white border-amber-200 shadow scale-90 origin-left" />
            )}
          </div>
          
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-1000 ease-out" 
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
            {progressText}
          </div>
        </div>
      </div>
    </div>
  );
}
