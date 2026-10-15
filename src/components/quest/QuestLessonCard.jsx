import UIIcon, { UIIconText } from '../UIIcon';
import { ArrowRight, CheckCircle2, LockKeyhole, RotateCcw, Star, Award, Sparkles, Swords } from 'lucide-react';
import { isQuestPassed, getQuestPracticeStats, getQuestLearningState } from '../../utils/questMapModel';
import { getQuestPalette } from '../../utils/questPalette';

export default function QuestLessonCard({ quest, progress, unlocked, badge, recommended = false, onPlay }) {
  const passed = isQuestPassed(progress);
  const palette = getQuestPalette(quest);
  const { rounds, stars } = getQuestPracticeStats(progress);
  const hasScore = progress?.pct !== null && progress?.pct !== undefined && Number.isFinite(Number(progress.pct));
  const score = hasScore ? Math.max(0, Math.min(100, Number(progress.pct))) : null;
  const StatusIcon = !unlocked ? LockKeyhole : passed ? CheckCircle2 : ArrowRight;
  const state = getQuestLearningState(progress, unlocked);
  const status = { locked: 'ล็อก', passed: 'ผ่านเกณฑ์แล้ว', unfinished: 'ยังไม่ผ่าน', new: 'ยังไม่เริ่ม' }[state];
  const showRecommendation = recommended && unlocked && !passed;
  const boss = ['grammar', 'chapter2_boss', 'strategy_boss', 'finalboss', 'chapter5_boss'].includes(quest.id);
  const masteryStars = Math.min(3, Math.max(0, Number(stars) || 0));
  const playLabel = !unlocked ? 'ล็อก' : boss ? 'ท้าทายบอส' : passed ? 'เล่นอีก' : 'เข้าเล่น';
  const lockedHint = boss ? 'ผ่านด่านอื่นในบทนี้ให้ครบก่อน' : `ผ่านบท ${quest.chapter - 1} และทบทวนข้อผิดให้ครบก่อน`;

  return <article data-tone={palette.tone} style={{ '--quest-ink': palette.ink, '--quest-soft': palette.soft, '--quest-edge': palette.edge, '--quest-surface': palette.surface }} className={`qm-quest-card ${!unlocked ? 'is-locked' : passed ? 'is-passed' : 'is-ready'} ${showRecommendation ? 'is-recommended' : ''} ${boss ? 'is-boss' : ''}`}>
    <div className="qm-card-heading">
      <span className="qm-quest-icon" aria-hidden="true"><UIIcon value={quest.icon} /></span>
      <div className="qm-card-tags">{showRecommendation && <span className="qm-recommended"><Sparkles size={13} aria-hidden="true" />แนะนำ</span>}<span className="qm-status"><StatusIcon size={14} aria-hidden="true" />{status}</span></div>
    </div>
    <h3>{quest.name}{badge && <Award size={17} aria-label="ได้รับ Badge แล้ว" />}</h3>
    <p className="qm-quest-description">{quest.description}</p>
    <div className="qm-card-metrics">
      <span>{rounds === null ? 'ยังไม่มีข้อมูลรอบ' : `ฝึกสะสม ${rounds} รอบ`}</span>
      <span className="qm-stars" aria-label={`${masteryStars} จาก 3 ดาว`}>{[1, 2, 3].map(star => <Star key={star} aria-hidden="true" className={star <= masteryStars ? 'is-earned' : ''} />)}</span>
    </div>
    <p className={`qm-star-nudge ${unlocked && masteryStars < 3 ? '' : 'is-placeholder'}`} aria-hidden={!(unlocked && masteryStars < 3)}>
      {unlocked && masteryStars < 3 ? 'อีกนิดเดียวจะได้ 3 ดาว' : '\u00a0'}
    </p>
    <div className="qm-card-footer">
      <span>{score === null ? 'ยังไม่มีคะแนน' : <>คะแนน <strong>{score}%</strong></>}</span>
      <button className="qm-card-play" disabled={!unlocked} onClick={onPlay} aria-label={`${playLabel} ${quest.name}`}>
        {!unlocked ? <LockKeyhole size={16} aria-hidden="true" /> : boss ? <Swords size={16} aria-hidden="true" /> : passed ? <RotateCcw size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
        {playLabel}
      </button>
    </div>
    {!unlocked && <p className="qm-lock-hint">{lockedHint}</p>}
  </article>;
}
