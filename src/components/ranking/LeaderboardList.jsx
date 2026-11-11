import React from 'react';
import TierBadge from './TierBadge';
import { getRankingTier } from '../../utils/scoring';
import StudentAvatar from '../StudentAvatar';
import RankingBadges from './RankingBadges';

export default function LeaderboardList({ students, startIndex = 3, activeTab, onTierClick }) {
  if (!students || students.length <= startIndex) return null;

  const list = students.slice(startIndex);

  return (
    <div className="ranking-list" aria-label="อันดับถัดจากสามอันดับแรก">
      {list.map((student, index) => {
        const rank = startIndex + index + 1;
        const tier = getRankingTier(student?.rankScore || 0);
        
        let scoreText = '';
        if (activeTab === 'overall') scoreText = `${(student?.xp || 0).toLocaleString()} XP`;
        else if (activeTab === 'growth') scoreText = `+${student?.growthScore || 0}%`;
        else if (activeTab === 'accuracy') scoreText = `${student?.accuracy || 0}%`;
        else if (activeTab === 'streak') scoreText = `${student?.streakDays || 0} วัน`;
        else if (activeTab === 'mistakes') scoreText = `${student?.mistakesFixed || 0} ข้อ`;
        else if (activeTab === 'skill') scoreText = `${student?.skillScore || 0} ข้อ`;
        else if (activeTab === 'fastguess') scoreText = `${student?.rankingStats?.fastGuessCount || 0} ครั้ง`;

        return (
          <button type="button" key={student.id || index} className="ranking-student-row" onClick={() => onTierClick(tier.name, student)} aria-label={`ดู Rank ของ ${student.name} อันดับ ${rank}`}>
            {/* Rank Number */}
            <div className="ranking-row-rank">
              {rank}
            </div>

            {/* Avatar */}
            <div className="ranking-list-avatar w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex-shrink-0">
              <StudentAvatar student={student} className="w-full h-full" />
            </div>

            {/* Name & Tier */}
            <div className="ranking-row-info">
              <div className="ranking-row-name">
                <span>{student.name}</span>
                <span className="ranking-row-level">
                  Lv.{student.level || 1}
                </span>
              </div>
              {activeTab === 'overall' && (
                <div className="ranking-row-meta">
                  <TierBadge tier={tier} className="!px-2 !py-0.5" />
                  <span className="ranking-star-stat" aria-label={`ดาวสะสม ${student.totalStars || 0} ดาว`}><span aria-hidden="true">★</span> {student.totalStars || 0} ดาว</span>
                </div>
              )}
              <RankingBadges student={student} />
            </div>

            {/* Score */}
            <div className="ranking-row-score">
              {scoreText}
            </div>
            <span className="ranking-row-action" aria-hidden="true">ดู Rank →</span>
          </button>
        );
      })}
    </div>
  );
}
