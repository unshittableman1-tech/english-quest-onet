import BadgeArtwork from '../BadgeArtwork';
import { getEarnedRankingBadges } from '../../utils/rankingBadges';

export default function RankingBadges({ student, limit = 3 }) {
  const earned = getEarnedRankingBadges(student);
  const shown = limit === null ? earned : earned.slice(0, limit);
  const remaining = earned.length - shown.length;
  return (
    <div className="ranking-earned-badges" aria-label={`เหรียญที่ได้รับของ ${student?.name || 'นักเรียน'}`}>
      <p className="ranking-badges-label">เหรียญที่ได้รับ{earned.length > 0 ? ` (${earned.length})` : ''}</p>
      {earned.length > 0 ? <ul>{shown.map(badge => (
        <li key={badge.id} title={`${badge.name}: ${badge.description}`}>
          <BadgeArtwork badgeId={badge.id} />
          <span>{badge.name}</span>
        </li>
      ))}</ul> : <p className="ranking-badges-empty">ยังไม่มีข้อมูลเหรียญที่ได้รับ</p>}
      {remaining > 0 && <p className="ranking-badges-more">อีก {remaining} เหรียญ · ดูทั้งหมดในรายละเอียด Rank</p>}
    </div>
  );
}
