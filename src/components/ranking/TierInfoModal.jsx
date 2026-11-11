import UIIcon, { UIIconText } from '../UIIcon';
import React from 'react';
import { getRankingTier, RANKING_TIERS, XP_RULES } from '../../utils/scoring';
import TierArtwork from './TierArtwork';
import RankingBadges from './RankingBadges';

const ALL_TIERS = RANKING_TIERS.map(tier => getRankingTier(tier.min)).reverse();

const SCORING_RULES = [
  { action: 'ตอบถูก 1 ข้อ', points: `+${XP_RULES.CORRECT_ANSWER} XP` },
  { action: 'ทำเควสครบ', points: `+${XP_RULES.COMPLETE_QUEST} XP` },
  { action: 'ผ่านด่าน 70%', points: `+${XP_RULES.PASS_70} XP` },
  { action: 'ผ่านด่าน 90%', points: `+${XP_RULES.PASS_90} XP` },
  { action: 'ผ่าน Final Boss', points: `+${XP_RULES.FINALBOSS_PASS} XP` },
];

export default function TierInfoModal({ onClose, student, selectedTierName = null }) {
  const currentRankScore = Math.max(0, Number(student?.xp) || 0);

  return (
    <div className="tier-modal-backdrop">
      <section className="tier-modal" role="dialog" aria-modal="true" aria-labelledby="tier-modal-title">
        
        {/* Header */}
        <header className="tier-modal-header">
          <div>
            <h2 id="tier-modal-title"><UIIcon value={"🏅"} /> ระบบ Rank & Tier</h2>
            <p>{student?.name ? `ข้อมูลของ ${student.name}` : 'รายละเอียดระดับทั้งหมด'}</p>
          </div>
          <button onClick={onClose} aria-label="ปิดรายละเอียด Rank">
            <UIIcon value={"✕"} />
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="tier-modal-body">
          <RankingBadges student={student} limit={null} />
          
          {/* Active Tier Spotlight (If passed) */}
          {selectedTierName && (() => {
            const tier = ALL_TIERS.find(t => t.name === selectedTierName) || getRankingTier(currentRankScore);
            return (
              <div className="glass-card p-5 border border-amber-300 text-center relative overflow-hidden">
                <TierArtwork tier={tier} decorative className="tier-artwork-watermark" />
                <TierArtwork tier={tier} className="tier-artwork-spotlight relative z-10" />
                <h3 className={`text-2xl font-black ${tier.color} drop-shadow mb-1 relative z-10`}>{tier.name}</h3>
                <p className="text-sm text-slate-800/80 relative z-10">{tier.description}</p>
                
                <div className="mt-4 pt-4 border-t border-amber-200 relative z-10">
                  <div className="tier-student-stats">
                    <span><strong>{currentRankScore.toLocaleString()}</strong> XP</span>
                    <span><strong>{student?.totalStars || 0}</strong> ดาวสะสม</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">XP ปัจจุบัน: <strong className="text-slate-800">{currentRankScore.toLocaleString()} XP</strong></span>
                    {tier.next ? (
                      <span className="text-slate-500">เป้าหมาย: <strong className="text-amber-300">{tier.next.toLocaleString()}</strong></span>
                    ) : (
                      <span className="text-emerald-400 font-bold">สูงสุดแล้ว!</span>
                    )}
                  </div>
                  {tier.next && (
                    <div className="progress-track h-2 mb-2">
                      <div 
                        className="progress-fill h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, ((currentRankScore - tier.min) / (tier.next - tier.min)) * 100))}%` }}
                      />
                    </div>
                  )}
                  {tier.tips && tier.tips.length > 0 && (
                    <div className="mt-3 text-left bg-black/20 p-3 rounded-lg">
                      <div className="text-xs text-amber-300 font-bold mb-1"><UIIcon value={"💡"} /> คำแนะนำเพื่อเลื่อนขั้น:</div>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                        {tier.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* All Tiers List */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">ระดับ Tier ทั้งหมด</h3>
            <div className="space-y-2">
              {ALL_TIERS.map((t, i) => {
                const isCurrent = t.min <= currentRankScore && (!t.next || currentRankScore < t.next);
                const isLocked = currentRankScore < t.min;
                
                return (
                <div key={i} className={`tier-row ${isCurrent ? 'is-current' : ''} ${isLocked ? 'is-locked' : ''}`}>
                    <TierArtwork tier={t} className="tier-artwork-row" />
                    <div className="flex-1">
                      <div className={`font-bold ${isLocked ? 'text-slate-500' : t.color}`}>{t.name}</div>
                      <div className="text-xs text-slate-500">{t.min.toLocaleString()} {t.next ? `- ${(t.next - 1).toLocaleString()}` : '+'} XP</div>
                    </div>
                    {isCurrent && <div className="tier-current">ปัจจุบัน</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring Rules */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">วิธีสะสม XP</h3>
            <div className="bg-white/5 rounded-xl overflow-hidden border border-amber-200">
              {SCORING_RULES.map((rule, i) => (
                <div key={i} className={`flex justify-between p-2.5 text-sm ${i % 2 === 0 ? 'bg-white/5' : ''}`}>
                  <span className="text-slate-800/80">{rule.action}</span>
                  <span className={`font-bold ${rule.points.startsWith('-') ? 'text-rose-600' : 'text-emerald-400'}`}>{rule.points}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="tier-modal-footer">
          <button 
            onClick={onClose}
            className="eq-btn"
          >
            เข้าใจแล้ว!
          </button>
        </footer>

      </section>
    </div>
  );
}
