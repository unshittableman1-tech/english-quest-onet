import { useEffect, useMemo, useState } from 'react';
import UIIcon from './UIIcon';
import { useApp } from '../App';
import { BADGE_CATEGORIES } from '../data/badges';
import { STREAK_REWARDS } from '../utils/scoring';
import { getArenaStats, mergeArenaStatsFromCloud } from '../utils/arenaStorage';
import { getBadgePageRows } from '../utils/badgePageModel';
import { getEffectiveBadgeStats } from '../utils/preTestResult';

const STATUS_OPTIONS = [
  ['all', 'ทั้งหมด'],
  ['earned', 'ได้รับแล้ว'],
  ['near', 'ใกล้ปลดล็อก'],
  ['locked', 'ยังล็อก'],
];

const CATEGORY_TONES = {
  Vocabulary: 'sky', Signs: 'rose', Directions: 'mint', Conversation: 'lilac',
  Reading: 'sky', Grammar: 'rose', Effort: 'peach', Growth: 'mint',
  Streak: 'peach', Strategy: 'lilac', Arena: 'sky', Special: 'lemon',
};

function BadgeCard({ badge }) {
  return (
    <article className={`badge-card ${badge.earned ? 'earned' : 'locked'}`} data-tone={CATEGORY_TONES[badge.category]}>
      <div className="badge-card-icon"><UIIcon value={badge.earned ? badge.icon : '🔒'} size="1.55rem" /></div>
      <div className="badge-card-body">
        <div className="badge-card-heading">
          <h3>{badge.name}</h3>
          <span className={`badge-state ${badge.earned ? 'is-earned' : ''}`}>
            <UIIcon value={badge.earned ? '✓' : '🔒'} size="0.85rem" />
            {badge.earned ? 'ปลดล็อกแล้ว' : 'ยังล็อก'}
          </span>
        </div>
        <p className="badge-description">{badge.description}</p>
        {badge.earned ? (
          <p className="badge-reward">{badge.category === 'Arena' ? 'บันทึกผลสำเร็จจากสนามสอบ' : `รางวัลเหรียญ +${badge.xpReward} XP`}</p>
        ) : (
          <div className="badge-condition">
            <p>{badge.conditionText}</p>
            {badge.target > 1 && (
              <>
                <div className="badge-progress-label">
                  <span>ความคืบหน้า</span>
                  <strong>{Math.floor(badge.progress)}{badge.category === 'Arena' ? '%' : ''} / {badge.target}{badge.category === 'Arena' ? '%' : ''}</strong>
                </div>
                <div className="badge-progress-track" role="progressbar" aria-valuenow={badge.progress} aria-valuemin="0" aria-valuemax={badge.target} aria-label={`ความคืบหน้า ${badge.name}`}>
                  <span style={{ width: `${badge.ratio * 100}%` }} />
                </div>
              </>
            )}
            {badge.extraRequirement && <p className="badge-extra">ต้อง{badge.extraRequirement}</p>}
          </div>
        )}
      </div>
    </article>
  );
}

export default function BadgePage() {
  const { student, navigate, checkBadges } = useApp();
  const studentId = student?.id;
  const [arenaRecord, setArenaRecord] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    if (checkBadges) checkBadges();
  }, [checkBadges]);

  useEffect(() => {
    let active = true;
    if (!studentId) return undefined;
    try { setArenaRecord({ studentId, stats: getArenaStats(studentId) }); } catch { setArenaRecord({ studentId, stats: null }); }
    mergeArenaStatsFromCloud(studentId)
      .then(stats => { if (active) setArenaRecord({ studentId, stats }); })
      .catch(() => {});
    return () => { active = false; };
  }, [studentId]);

  const arenaStats = arenaRecord?.studentId === studentId ? arenaRecord.stats : null;
  const rows = useMemo(() => getBadgePageRows(student, arenaStats), [student, arenaStats]);
  const earnedCount = rows.filter(row => row.earned).length;
  const nearCount = rows.filter(row => row.near).length;
  const badgeStats = getEffectiveBadgeStats(student || {});
  const streak = Math.max(0, badgeStats.streakDays || 0);
  const dayInWeek = streak ? ((streak - 1) % 7) + 1 : 0;
  const filtered = rows.filter(row =>
    (activeCategory === 'All' || row.category === activeCategory) &&
    (activeStatus === 'all' || (activeStatus === 'earned' && row.earned) ||
      (activeStatus === 'near' && row.near) ||
      (activeStatus === 'locked' && !row.earned))
  );
  const sections = activeStatus === 'all'
    ? [
        ['ใกล้ปลดล็อก', filtered.filter(row => row.near).sort((a, b) => b.ratio - a.ratio)],
        ['ได้รับแล้ว', filtered.filter(row => row.earned)],
        ['ยังไม่ปลดล็อก', filtered.filter(row => !row.earned && !row.near)],
      ]
    : [[STATUS_OPTIONS.find(([key]) => key === activeStatus)?.[1], filtered]];

  return (
    <main className="badge-page">
      <div className="badge-page-inner">
        <header className="badge-page-header">
          <button type="button" className="badge-back" onClick={() => navigate('map')} aria-label="กลับแผนที่ด่าน" title="กลับแผนที่ด่าน">
            <UIIcon value="←" size="1.2rem" />
          </button>
          <div><p className="badge-eyebrow">ความสำเร็จของฉัน</p><h1>เหรียญรางวัล</h1></div>
        </header>

        <section className="badge-summary" aria-label="ภาพรวมเหรียญรางวัล">
          <div className="badge-summary-icon"><UIIcon value="🏅" size="1.9rem" /></div>
          <div className="badge-summary-copy">
            <strong>{earnedCount} / {rows.length} เหรียญ</strong>
            <span>สะสมความสำเร็จจากการเรียนและสนามสอบ</span>
          </div>
          <span className="badge-summary-percent">{Math.round(earnedCount / rows.length * 100)}%</span>
          <div className="badge-summary-track"><span style={{ width: `${earnedCount / rows.length * 100}%` }} /></div>
        </section>

        <section className="badge-streak" aria-label="การเรียนต่อเนื่อง">
          <UIIcon value="🔥" size="1.25rem" />
          <div><strong>เรียนต่อเนื่อง {streak} วัน</strong><span>{streak ? `สัปดาห์นี้ ${dayInWeek}/7 วัน` : 'เริ่มเรียนวันนี้เพื่อสะสมวันต่อเนื่อง'}</span></div>
          <div className="badge-streak-days">
            {STREAK_REWARDS.map((reward, index) => <span key={index} className={index < dayInWeek ? 'done' : ''} title={`วันที่ ${index + 1}: +${reward.xp} XP`}>{index + 1}</span>)}
          </div>
        </section>

        <div className="badge-toolbar">
          <div className="badge-status-tabs" role="group" aria-label="สถานะเหรียญ">
            {STATUS_OPTIONS.map(([key, label]) => <button type="button" key={key} className={activeStatus === key ? 'selected' : ''} onClick={() => setActiveStatus(key)} aria-pressed={activeStatus === key}>
              {label}{key === 'near' && nearCount > 0 ? ` (${nearCount})` : ''}
            </button>)}
          </div>
          <label className="badge-category-select">หมวด
            <select value={activeCategory} onChange={event => setActiveCategory(event.target.value)}>
              <option value="All">ทุกหมวด</option>
              {Object.entries(BADGE_CATEGORIES).map(([key, value]) => <option value={key} key={key}>{value.name}</option>)}
            </select>
          </label>
        </div>

        {sections.map(([title, badges]) => badges.length > 0 && (
          <section className="badge-section" key={title}>
            <div className="badge-section-heading"><h2>{title}</h2><span>{badges.length} เหรียญ</span></div>
            <div className="badge-grid">{badges.slice(0, expandedSections[title] ? badges.length : 8).map(badge => <BadgeCard key={badge.id} badge={badge} />)}</div>
            {badges.length > 8 && <button type="button" className="badge-show-more" onClick={() => setExpandedSections(current => ({ ...current, [title]: !current[title] }))}>
              {expandedSections[title] ? 'แสดงน้อยลง' : `ดูเพิ่มอีก ${badges.length - 8} เหรียญ`}
            </button>}
          </section>
        ))}
        {filtered.length === 0 && <p className="badge-empty">ยังไม่มีเหรียญในตัวกรองนี้</p>}
      </div>
    </main>
  );
}
