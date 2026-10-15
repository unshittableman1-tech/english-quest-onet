import React from 'react';
import TierBadge from './TierBadge';
import { getRankingTier } from '../../utils/scoring';
import { getAvatarUrl } from '../../utils/avatar';

export default function LeaderboardList({ students, startIndex = 3, activeTab, onTierClick }) {
  if (!students || students.length <= startIndex) return null;

  const list = students.slice(startIndex);

  return (
    <div className="mx-2 mb-6 space-y-2">
      {list.map((student, index) => {
        const rank = startIndex + index + 1;
        const tier = getRankingTier(student?.rankScore || 0);
        
        let scoreText = '';
        if (activeTab === 'overall') scoreText = `${(student?.rankScore || 0).toLocaleString()} pts`;
        else if (activeTab === 'growth') scoreText = `+${student?.growthScore || 0}%`;
        else if (activeTab === 'accuracy') scoreText = `${student?.accuracy || 0}%`;
        else if (activeTab === 'streak') scoreText = `${student?.streakDays || 0} วัน`;
        else if (activeTab === 'mistakes') scoreText = `${student?.mistakesFixed || 0} ข้อ`;
        else if (activeTab === 'skill') scoreText = `${student?.skillScore || 0} ข้อ`;
        else if (activeTab === 'fastguess') scoreText = `${student?.rankingStats?.fastGuessCount || 0} ครั้ง`;

        return (
          <div key={student.id || index} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            {/* Rank Number */}
            <div className="w-8 text-center font-black text-slate-500 text-lg">
              {rank}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
              <img src={getAvatarUrl(student.name)} alt={student.name} className="w-full h-full object-cover rounded-full" />
            </div>

            {/* Name & Tier */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                <span>{student.name}</span>
                <span className="text-[10px] font-black bg-purple-900 text-purple-100 px-1.5 py-0.5 rounded-md border border-purple-400/40 shrink-0">
                  Lv.{student.level || 1}
                </span>
              </div>
              {activeTab === 'overall' && (
                <div className="scale-75 origin-left -mt-0.5">
                  <TierBadge tier={tier} onClick={() => onTierClick(tier.name)} className="!px-2 !py-0.5" />
                </div>
              )}
            </div>

            {/* Score */}
            <div className="font-black text-slate-700 text-sm">
              {scoreText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
