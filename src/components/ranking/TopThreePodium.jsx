import React from 'react';
import StudentAvatar from '../StudentAvatar';
import { getRankingTier } from '../../utils/scoring';
import TierBadge from './TierBadge';
import RankingBadges from './RankingBadges';

const PodiumItem = ({ student, rank, activeTab, onTierClick }) => {
  if (!student) return <div className="ranking-podium-placeholder" aria-hidden="true" />;

  const isFirst = rank === 1;
  const isSecond = rank === 2;
  const tier = getRankingTier(student?.rankScore || 0);

  // Formatting score based on activeTab
  let scoreText = '';
  if (activeTab === 'overall') scoreText = `${(student?.xp || 0).toLocaleString()} XP`;
  else if (activeTab === 'growth') scoreText = `+${student?.growthScore || 0}%`;
  else if (activeTab === 'accuracy') scoreText = `${student?.accuracy || 0}%`;
  else if (activeTab === 'streak') scoreText = `${student?.streakDays || 0} วัน`;
  else if (activeTab === 'mistakes') scoreText = `${student?.mistakesFixed || 0} ข้อ`;
  else if (activeTab === 'skill') scoreText = `${student?.skillScore || 0} ข้อ`;
  else if (activeTab === 'fastguess') scoreText = `${student?.rankingStats?.fastGuessCount || 0} ครั้ง`;

  return (
    <article className={`ranking-podium-place is-rank-${rank}`} aria-label={`อันดับ ${rank}: ${student.name || 'ไม่มีชื่อ'}`}>
      {/* Crown / Rank Icon */}
      <div className={`ranking-crown-stage is-rank-${rank}`} aria-hidden="true">
          <img
            src={`/assets/ranking/${isFirst ? 'first' : isSecond ? 'second' : 'third'}-place-crown-3d-v1.png`}
            alt={`มงกุฎ${isFirst ? 'ทอง' : isSecond ? 'เงิน' : 'ทองแดง'}สามมิติ`}
            className="ranking-crown-3d"
          />
          <span className="ranking-crown-glint" aria-hidden="true" />
      </div>

      {/* Avatar & Info Card */}
      <div className="ranking-podium-card">
        <strong className="ranking-podium-rank">อันดับ {rank}</strong>
        
        {/* Avatar */}
        <div className="ranking-podium-avatar">
          <StudentAvatar student={student} className="w-full h-full" />
        </div>

        {/* Name Badge */}
        <h2 className="ranking-podium-name">
          {student.name || 'ไม่มีชื่อ'}
        </h2>

        {/* Score */}
        <div className="ranking-podium-score">
          {scoreText}
        </div>

        <div className="ranking-star-stat" aria-label={`ดาวสะสม ${student.totalStars || 0} ดาว`}>
          <span aria-hidden="true">★</span> {student.totalStars || 0} ดาว
        </div>

        <RankingBadges student={student} />

        <TierBadge tier={tier} onClick={() => onTierClick(tier.name, student)} className="ranking-podium-tier" />

        {/* Level Pill */}
        <div className="ranking-podium-level">
          Lv.{student.level || 1}
        </div>
      </div>
    </article>
  );
};

export default function TopThreePodium({ topThree, activeTab, onTierClick }) {
  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <section className="ranking-podium" aria-label="สามอันดับสูงสุด">
      <PodiumItem student={second} rank={2} activeTab={activeTab} onTierClick={onTierClick} />
      <PodiumItem student={first} rank={1} activeTab={activeTab} onTierClick={onTierClick} />
      <PodiumItem student={third} rank={3} activeTab={activeTab} onTierClick={onTierClick} />
    </section>
  );
}
