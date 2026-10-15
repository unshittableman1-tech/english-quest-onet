import UIIcon, { UIIconText } from '../UIIcon';
import React from 'react';
import { getRankingTier, calculateRankScore, RANKING_TIERS } from '../../utils/scoring';

const ALL_TIERS = RANKING_TIERS.map(tier => getRankingTier(tier.min)).reverse();

const SCORING_RULES = [
  { action: 'ผ่าน 1 เควส', points: '+150 pts' },
  { action: 'เล่นซ้ำ 1 รอบ (Missions)', points: '+80 pts' },
  { action: 'ปลดล็อก 1 Badge', points: '+50 pts' },
  { action: 'สะสม 1 ดาว', points: '+20 pts' },
  { action: 'พัฒนา Post-test (+1%)', points: '+15 pts' },
  { action: 'แก้ข้อผิด 1 ข้อ', points: '+10 pts' },
  { action: 'ผ่าน Final Boss (+1%)', points: '+5 pts' },
  { action: 'กดมั่วเร็วกว่า 3 วิ', points: '-30 pts/ข้อ' },
];

export default function TierInfoModal({ onClose, student, selectedTierName = null }) {
  const currentRankScore = calculateRankScore(student);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-amber-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-amber-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UIIcon value={"🏅"} /> ระบบ Rank & Tier
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/20 transition-colors">
            <UIIcon value={"✕"} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Active Tier Spotlight (If passed) */}
          {selectedTierName && (() => {
            const tier = ALL_TIERS.find(t => t.name === selectedTierName) || getRankingTier(currentRankScore);
            return (
              <div className="glass-card p-5 border border-amber-300 text-center relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-8xl opacity-10 blur-sm"><UIIcon value={tier.icon} /></div>
                <div className="text-5xl mb-2 drop-shadow-lg relative z-10"><UIIcon value={tier.icon} /></div>
                <h3 className={`text-2xl font-black ${tier.color} drop-shadow mb-1 relative z-10`}>{tier.name}</h3>
                <p className="text-sm text-slate-800/80 relative z-10">{tier.description}</p>
                
                <div className="mt-4 pt-4 border-t border-amber-200 relative z-10">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">คะแนนของคุณ: <strong className="text-slate-800">{currentRankScore.toLocaleString()}</strong></span>
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
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${isCurrent ? 'bg-white/10 border-amber-400/50' : 'bg-white/5 border-white/5'} ${isLocked ? 'opacity-60 grayscale' : ''}`}>
                    <div className="text-3xl w-10 text-center drop-shadow"><UIIcon value={t.icon} /></div>
                    <div className="flex-1">
                      <div className={`font-bold ${isLocked ? 'text-slate-500' : t.color}`}>{t.name}</div>
                      <div className="text-xs text-slate-500">{t.min.toLocaleString()} {t.next ? `- ${(t.next - 1).toLocaleString()}` : '+'} pts</div>
                    </div>
                    {isCurrent && <div className="text-xs font-bold px-2 py-1 bg-amber-400/20 text-amber-300 rounded-full">ปัจจุบัน</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scoring Rules */}
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">วิธีได้คะแนน Rank</h3>
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
        <div className="p-4 bg-white/5 border-t border-amber-200">
          <button 
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all"
          >
            เข้าใจแล้ว!
          </button>
        </div>

      </div>
    </div>
  );
}
