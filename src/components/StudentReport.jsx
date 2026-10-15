import UIIcon, { UIIconText } from './UIIcon';
import { useApp } from '../App';
import { getWeakAreas, getStrongAreas, getLevelTitle, xpToNextLevel, STREAK_REWARDS, getStreakReward } from '../utils/scoring';
import { getPreTestResult } from '../utils/preTestResult';

const QUEST_NAMES = {
  vocabulary: 'Vocabulary Village', signs: 'Signs City', directions: 'Direction Maze',
  market: 'Market Quest', conversation: 'Conversation Café', reading: 'Reading Dungeon',
  grammar: 'Grammar Boss', finalboss: 'O-NET Final Boss',
};

export default function StudentReport() {
  const { student, questProgress, navigate } = useApp();
  if (!student) return null;

  const xpInfo  = xpToNextLevel(student.xp || 0);
  const weak    = getWeakAreas(questProgress);
  const strong  = getStrongAreas(questProgress);
  const preTest = student.preTest;
  const preResult = getPreTestResult(student);
  const prePct = preResult.percent;
  const badges  = student.badges || [];

  const questEntries = Object.entries(questProgress);

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black text-gradient-gold"><UIIcon value={"📊"} /> รายงานผลการเรียน</h1>
        <p className="text-slate-500 text-sm mt-1">สรุปผลการเรียนรู้ของคุณ</p>
      </div>

      <div className="px-4 max-w-lg mx-auto space-y-4">

        {/* Student Info */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-2xl font-black">
              {student.name?.charAt(0) || '?'}
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-xl">{student.name}</h2>
              <p className="text-slate-500 text-sm">ชั้น {student.class} | เลขที่ {student.number}</p>
              <p className="text-amber-400 text-sm font-bold">{getLevelTitle(student.level || 1)}</p>
            </div>
          </div>
        </div>

        {/* XP & Level */}
        <div className="grid grid-cols-3 gap-3">
          <div className="stat-card">
            <div className="text-2xl font-black text-gradient-gold">{student.level || 1}</div>
            <div className="text-slate-500 text-xs mt-1">Level</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-black text-blue-400">{student.xp || 0}</div>
            <div className="text-slate-500 text-xs mt-1">XP รวม</div>
          </div>
          <div className="stat-card">
            <div className="text-2xl font-black text-amber-400">{badges.length}</div>
            <div className="text-slate-500 text-xs mt-1">Badge</div>
          </div>
        </div>

        {/* 🔥 Streak Stats */}
        {(() => {
          const streak = student.badgeStats?.streakDays || 0;
          const dayInWeek = streak > 0 ? ((streak - 1) % 7) + 1 : 0;
          const reward = streak > 0 ? getStreakReward(streak) : null;
          return (
            <div className="glass-card p-4 border border-orange-500/20">
              <h3 className="font-bold text-orange-400 mb-3 flex items-center gap-2">
                <span><UIIcon value={"🔥"} /></span> ล็อคอินติดต่อกัน
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-4xl"><UIIconText value={reward ? reward.icon : '💤'} /></div>
                <div>
                  <div className="text-2xl font-black" style={{ color: reward?.color || '#9ca3af' }}>
                    {streak} วัน
                  </div>
                  <div className="text-slate-500 text-xs">
                    {streak === 0
                      ? 'ยังไม่ได้ล็อคอินวันนี้'
                      : `สัปดาห์นี้: Day ${dayInWeek}/7`}
                  </div>
                </div>
                {streak >= 7 && (
                  <div className="ml-auto text-right">
                    <div className="text-xs text-amber-400 font-bold"><UIIcon value={"🏆"} /> ครบสัปดาห์</div>
                    <div className="text-xs text-slate-500">{Math.floor(streak / 7)} รอบแล้ว</div>
                  </div>
                )}
              </div>
              {/* 7-day dot tracker */}
              <div className="flex gap-1.5 mb-3">
                {STREAK_REWARDS.map((r, i) => {
                  const filled = i < dayInWeek;
                  const isCur  = i === dayInWeek - 1;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: filled
                            ? `linear-gradient(135deg,${r.color},${r.color}99)`
                            : 'rgba(255,255,255,0.06)',
                          color: filled ? '#111' : 'rgba(255,255,255,0.25)',
                          boxShadow: isCur ? `0 0 10px ${r.color}88` : undefined,
                          outline: isCur ? `2px solid ${r.color}` : undefined,
                        }}
                      >
                        <UIIconText value={filled ? (isCur ? r.icon : '✓') : i + 1} />
                      </div>
                      <span className="text-[8px]" style={{ color: filled ? r.color : 'rgba(255,255,255,0.2)' }}>
                        +{r.xp}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(dayInWeek / 7) * 100}%`,
                    background: reward
                      ? `linear-gradient(90deg,${STREAK_REWARDS[0].color},${reward.color})`
                      : '#374151',
                  }}
                />
              </div>
              <div className="text-slate-800/30 text-xs mt-1.5 text-right">
                {dayInWeek < 7
                  ? `อีก ${7 - dayInWeek} วันถึง 👑 +500 XP`
                  : '🎉 ครบสัปดาห์แล้ว!'}
              </div>
            </div>
          );
        })()}


        {/* XP to next level */}
        <div className="glass-card p-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Level {student.level || 1}</span>
            <span>{xpInfo.maxLevel ? 'Level สูงสุดแล้ว' : `XP ถึง Level ถัดไป: ${xpInfo.needed - xpInfo.current} XP`}</span>
          </div>
          <div className="progress-track h-2.5">
            <div className="progress-fill bg-gradient-to-r from-amber-500 to-yellow-400" style={{ width: `${xpInfo.pct}%`, height: '100%' }} />
          </div>
        </div>

        {/* Pre-test Score */}
        {preTest && (
          <div className="glass-card p-4">
            <h3 className="font-bold text-slate-800/80 mb-3 flex items-center gap-2">
              <span><UIIcon value={"📝"} /></span> ผล Pre-test
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl font-black text-violet-400">{preResult.score ?? '—'}/{preResult.total ?? '—'}</div>
              <div>
                <div className="text-slate-800 font-bold">{prePct === null ? 'ไม่ทราบจำนวนข้อเดิม' : `${prePct}%`}</div>
                <div className="text-slate-500 text-xs">ก่อนเริ่มเรียน</div>
              </div>
            </div>
            {prePct !== null && <div className="progress-track h-2">
              <div className="progress-fill bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${prePct}%`, height: '100%' }} />
            </div>}
          </div>
        )}

        {/* Quest Scores */}
        {questEntries.length > 0 && (
          <div className="glass-card p-4">
            <h3 className="font-bold text-slate-800/80 mb-3 flex items-center gap-2">
              <span><UIIcon value={"🗺️"} /></span> คะแนนรายด่าน
            </h3>
            <div className="space-y-2.5">
              {questEntries.map(([questId, data]) => {
                const color = data.pct >= 80 ? 'from-emerald-500 to-green-400' :
                              data.pct >= 70 ? 'from-blue-500 to-cyan-400' :
                              data.pct >= 50 ? 'from-amber-500 to-yellow-400' :
                              'from-red-500 to-rose-400';
                const hasBadge = badges.includes(questId);
                return (
                  <div key={questId}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 flex items-center gap-1">
                        {QUEST_NAMES[questId] || questId}
                        {hasBadge && <span title="ได้ Badge"><UIIcon value={"🏅"} /></span>}
                      </span>
                      <span className="font-bold text-slate-800">{data.score}/{data.total} ({data.pct}%)</span>
                    </div>
                    <div className="progress-track h-1.5">
                      <div className={`progress-fill bg-gradient-to-r ${color}`} style={{ width: `${data.pct}%`, height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strong Areas */}
        {strong.length > 0 && (
          <div className="glass-card p-4 border border-emerald-500/20">
            <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <span><UIIcon value={"💪"} /></span> จุดแข็ง
            </h3>
            <div className="flex flex-wrap gap-2">
              {strong.map(area => (
                <span key={area.id} className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-700 border border-emerald-500/30">
                  <UIIcon value={"✅"} /> {area.name} {area.pct}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weak Areas */}
        {weak.length > 0 && (
          <div className="glass-card p-4 border border-amber-500/20">
            <h3 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
              <span><UIIcon value={"📌"} /></span> ควรฝึกเพิ่ม
            </h3>
            <div className="flex flex-wrap gap-2">
              {weak.map(area => (
                <span key={area.id} className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
                  <UIIcon value={"⚠️"} /> {area.name} {area.pct}%
                </span>
              ))}
            </div>
          </div>
        )}

        {questEntries.length === 0 && (
          <div className="glass-card p-6 text-center">
            <p className="text-slate-500 text-sm">ยังไม่ได้เล่น Quest ใดๆ<br />ไปที่ Quest Map แล้วเริ่มเล่นได้เลย!</p>
          </div>
        )}

        {/* Back to map */}
        <button className="btn-primary w-full text-base py-3" onClick={() => navigate('map')}>
          <UIIcon value={"🗺️"} /> กลับไป Quest Map
        </button>
      </div>
    </div>
  );
}
