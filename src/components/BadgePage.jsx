import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, LockKeyhole, X } from 'lucide-react';
import { useApp } from '../App';
import { BADGE_CATEGORIES } from '../data/badges';
import { STREAK_REWARDS } from '../utils/scoring';
import { getArenaStats, mergeArenaStatsFromCloud } from '../utils/arenaStorage';
import { getBadgePageRows } from '../utils/badgePageModel';
import { getEffectiveBadgeStats } from '../utils/preTestResult';
import BadgeArtwork from './BadgeArtwork';

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

const RARITY_LABELS = { common: 'Common', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

function getBadgeRarity(badge) {
  return badge.category === 'Arena' || badge.category === 'Special'
    ? 'legendary'
    : badge.tier === 'gold' ? 'epic' : badge.tier === 'silver' ? 'rare' : 'common';
}

function BadgeCard({ badge, onOpen, showXpReward }) {
  const rarity = getBadgeRarity(badge);
  return (
    <article className={`badge-card ${badge.earned ? 'earned' : 'locked'} rarity-${rarity}`} data-tone={CATEGORY_TONES[badge.category]}>
      <button type="button" className="badge-medal-frame" onClick={() => onOpen(badge)} aria-label={`ดูรายละเอียด ${badge.name}`}>
        <BadgeArtwork badgeId={badge.id} className="badge-card-icon" label={badge.name} />
        {!badge.earned && <span className="badge-lock-overlay" aria-hidden="true"><LockKeyhole /></span>}
      </button>
      <div className="badge-card-body">
        <div className="badge-card-heading">
          <div><span className="badge-rarity">{RARITY_LABELS[rarity]}</span><h3>{badge.name}</h3></div>
          <span className={`badge-state ${badge.earned ? 'is-earned' : ''}`}>
            {badge.earned ? <Check aria-hidden="true" /> : <LockKeyhole aria-hidden="true" />}
            {badge.earned ? 'ปลดล็อกแล้ว' : 'ยังล็อก'}
          </span>
        </div>
        <p className="badge-description">{badge.description}</p>
        {badge.earned ? (
          <p className="badge-reward">{badge.category === 'Arena' ? 'บันทึกผลสำเร็จจากสนามสอบ' : showXpReward ? `รางวัลเหรียญ +${badge.xpReward} XP` : 'บันทึกเหรียญความสำเร็จ'}</p>
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

function BadgeDetailModal({ badge, unlockedDate, onClose, showXpReward }) {
  const rarity = getBadgeRarity(badge);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return <div className="achievement-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`achievement-modal rarity-${rarity}`} role="dialog" aria-modal="true" aria-labelledby="achievement-detail-title">
      <header><div><span>{RARITY_LABELS[rarity]}</span><h2 id="achievement-detail-title">{badge.name}</h2></div><button type="button" onClick={onClose} aria-label="ปิดรายละเอียด"><X aria-hidden="true" /></button></header>
      <div className="achievement-modal-content">
        <div className={`achievement-modal-medal ${badge.earned ? '' : 'is-locked'}`}>
          <BadgeArtwork badgeId={badge.id} label={badge.name} />
          {!badge.earned && <span aria-hidden="true"><LockKeyhole /></span>}
        </div>
        <div className="achievement-modal-copy">
          <p>{badge.description}</p>
          <dl>
            <div><dt>รางวัล</dt><dd>{showXpReward ? `+${badge.xpReward} XP` : 'เหรียญความสำเร็จ'}</dd></div>
            <div><dt>เงื่อนไข</dt><dd>{badge.conditionText}</dd></div>
            <div><dt>สถานะ</dt><dd>{badge.earned ? 'ปลดล็อกแล้ว' : 'ยังไม่ปลดล็อก'}</dd></div>
            {unlockedDate && <div><dt>วันที่ได้รับ</dt><dd>{unlockedDate}</dd></div>}
          </dl>
          <div className="achievement-modal-progress">
            <div><span>ความคืบหน้า</span><strong>{Math.floor(badge.progress)}{badge.category === 'Arena' ? '%' : ''} / {badge.target}{badge.category === 'Arena' ? '%' : ''}</strong></div>
            <div role="progressbar" aria-label={`ความคืบหน้า ${badge.name}`} aria-valuemin="0" aria-valuemax={badge.target} aria-valuenow={badge.progress}><span style={{ width: `${badge.ratio * 100}%` }} /></div>
            {badge.extraRequirement && <small>ต้อง{badge.extraRequirement}</small>}
          </div>
        </div>
      </div>
      <footer><button type="button" onClick={onClose}>ปิดรายละเอียด</button></footer>
    </section>
  </div>;
}

export default function BadgePage() {
  const { student, navigate, checkBadges } = useApp();
  const studentId = student?.id;
  const showXpReward = student?.authVerified !== true;
  const [arenaRecord, setArenaRecord] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState('all');
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedBadge, setSelectedBadge] = useState(null);

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
            <ArrowLeft aria-hidden="true" />
          </button>
          <div><p className="badge-eyebrow">ความสำเร็จของฉัน</p><h1>เหรียญรางวัล</h1></div>
        </header>

        <section className="badge-summary" aria-label="ภาพรวมเหรียญรางวัล">
          <div className="badge-summary-icon"><BadgeArtwork badgeId="onet_legend" /></div>
          <div className="badge-summary-copy">
            <strong>{earnedCount} / {rows.length} เหรียญ</strong>
            <span>สะสมความสำเร็จจากการเรียนและสนามสอบ</span>
          </div>
          <span className="badge-summary-percent">{Math.round(earnedCount / rows.length * 100)}%</span>
          <div className="badge-summary-track"><span style={{ width: `${earnedCount / rows.length * 100}%` }} /></div>
        </section>

        <section className="badge-streak" aria-label="การเรียนต่อเนื่อง">
          <BadgeArtwork badgeId="streak_7" className="badge-streak-art" />
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
            <div className="badge-grid">{badges.slice(0, expandedSections[title] ? badges.length : 8).map(badge => <BadgeCard key={badge.id} badge={badge} onOpen={setSelectedBadge} showXpReward={showXpReward} />)}</div>
            {badges.length > 8 && <button type="button" className="badge-show-more" onClick={() => setExpandedSections(current => ({ ...current, [title]: !current[title] }))}>
              {expandedSections[title] ? 'แสดงน้อยลง' : `ดูเพิ่มอีก ${badges.length - 8} เหรียญ`}
            </button>}
          </section>
        ))}
        {filtered.length === 0 && <p className="badge-empty">ยังไม่มีเหรียญในตัวกรองนี้</p>}
      </div>
      {selectedBadge && <BadgeDetailModal badge={selectedBadge} unlockedDate={student?.badgeUnlockedAt?.[selectedBadge.id] || student?.badgeDates?.[selectedBadge.id] || null} onClose={() => setSelectedBadge(null)} showXpReward={showXpReward} />}
    </main>
  );
}
