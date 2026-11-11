import UIIcon from './UIIcon';
import MissionModeIcon from './MissionModeIcon';
import { getMissionArtwork, getMissionModeArtwork } from '../data/missionModeArtwork';
import '../styles/missionModes.css';
import { useApp } from '../App';
import { QUESTS } from '../data/questions';
import { Play } from 'lucide-react';
import { isPracticeQuestionReady } from '../utils/questionMedia';
import { getAccessibleGameMission, getQuestMissions, isQuestAccessible } from '../utils/missionAccess';
import { getOrderingActivities } from '../utils/orderingGame';
import { getUnlockedQuests } from '../utils/scoring';

// ── MissionSelect ─────────────────────────────────────────────
// Shared activity selection for all Quests that use this screen.
// Props are taken from AppContext

export default function MissionSelect() {
  const { currentQuest, navigate, addXP, student, unlockedQuests } = useApp();
  const questId = currentQuest;
  const access = unlockedQuests || getUnlockedQuests(student?.questProgress, student);
  const canAccess = isQuestAccessible(questId, access);
  const missions = getQuestMissions(questId);
  const quest = QUESTS.find(item => item.id === questId);
  const isChapterBoss = Boolean(quest?.isExam);
  const visibleMissions = isChapterBoss ? [] : missions;
  const hasQuizItems = isChapterBoss
    ? Boolean(quest?.questions?.length)
    : Boolean(quest?.questions?.some(isPracticeQuestionReady));
  const pendingItems = quest?.questions?.filter(q => q.reviewStatus === 'pending_teacher').length || 0;
  const assessmentCount = student?.isDemo && ['strategy_boss', 'finalboss'].includes(questId) ? 20 : questId === 'chapter2_boss' ? 20 : quest?.assessmentCount || quest?.questions?.length || 0;
  const isMixedBoss = questId !== 'chapter2_boss' && Boolean(quest?.requiredAssessmentFocus?.length);

  async function handleMissionComplete(xpEarned) {
    await addXP(xpEarned, `🎮 Mission: +${xpEarned} XP`);
    navigate('mission-select', questId); // return to mission select after game
  }

  function handleSelectMission(mission) {
    const accessible = getAccessibleGameMission(questId, mission.id, access);
    if (accessible) navigate('game', { questId, mission: accessible, onComplete: handleMissionComplete });
  }

  function handleGoQuiz() {
    if (!canAccess || !hasQuizItems) return;
    navigate('lesson', questId); // MiniLesson → Quiz (existing flow)
  }

  if (!canAccess) return <section className="max-w-lg mx-auto p-4 space-y-4">
    <h1 className="text-xl font-black text-slate-800">ภารกิจนี้ยังล็อกอยู่</h1>
    <p role="status" className="text-base text-slate-600">กลับไปดูเงื่อนไขปลดล็อกบนแผนที่ภารกิจ</p>
    <button type="button" onClick={() => navigate('map')} className="btn-primary min-h-11 px-4">กลับไปแผนที่</button>
  </section>;

  return (
    <div className="mission-select-page min-h-screen p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button
          type="button"
          aria-label="กลับไปแผนที่"
          onClick={() => navigate('map')}
          className="btn-ghost px-3 py-2 text-xl"
        >
          <UIIcon value={"←"} />
        </button>
        <div>
          <h1 className="text-xl font-black text-amber-800">{isChapterBoss ? 'ด่านท้าทายท้ายบท' : 'เลือกโหมดการเรียน'}</h1>
          <p className="text-slate-500 text-sm">{quest?.name || `Quest: ${questId}`}</p>
        </div>
      </div>

      {/* Mission Cards */}
      {visibleMissions.length > 0 && (
        <>
          <div className="mb-3">
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest"><UIIcon value={"🎮"} /> Game Missions</span>
          </div>
          <div className="space-y-3 mb-6">
            {visibleMissions.map((mission, i) => {
              const typeInfo = getMissionArtwork(mission);
              const orderingActivities = mission.type === 'rearrange' ? getOrderingActivities(mission) : [];
              const rewardClaimed = student?.questProgress?.[questId]?.gameMissions?.[mission.id]?.rewardClaimed;
              return (
                <button
                  type="button"
                  key={mission.id}
                  data-mission-id={mission.id}
                  onClick={() => handleSelectMission(mission)}
                  className={`mission-mode-card mission-mode-tone-${typeInfo.tone} w-full glass-card p-4 sm:p-5 hover:-translate-y-0.5 active:scale-98 transition-all duration-200 border-l-4 border-l-amber-400 border border-amber-200 text-left group`}
                >
                  {/* Icon */}
                  <MissionModeIcon mission={mission} />
                  {/* Info */}
                  <div className="mission-mode-copy">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-500 text-xs font-black">MISSION {i + 1}</span>
                    </div>
                    <h3 className="text-slate-800 font-black text-base">{mission.title}</h3>
                    <span className="mission-mode-action-label">{typeInfo.label}</span>
                    <p className="mission-mode-description text-slate-500 text-xs">{mission.subtitle || typeInfo.desc}</p>
                    {orderingActivities.length > 0 && <p className="mt-2 text-sm leading-relaxed text-slate-600">{orderingActivities.map(activity => `${activity.label} ${activity.rounds.length} ข้อ`).join(' · ')}</p>}
                    {rewardClaimed && <p className="mt-1 text-sm text-emerald-700">รับ XP แล้ว · ฝึกซ้ำได้</p>}
                  </div>
                  {/* XP + Arrow */}
                  <div className="mission-mode-reward">
                    <span className="text-amber-600 font-black text-sm">{rewardClaimed ? 'ฝึกซ้ำ' : `สูงสุด ${mission.xpReward} XP`}</span>
                    <span className="text-slate-500 text-lg">›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Divider */}
      {visibleMissions.length > 0 && <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-amber-200" />
        <span className="text-xs text-slate-500 uppercase tracking-widest">หรือ</span>
        <div className="h-px flex-1 bg-amber-200" />
      </div>}

      {/* Quiz Mode (existing) */}
      <button
        type="button"
        onClick={handleGoQuiz}
        disabled={!hasQuizItems}
        aria-describedby={!hasQuizItems ? 'assessment-unavailable' : undefined}
        className={`mission-mode-card mission-mode-tone-${getMissionModeArtwork(isChapterBoss ? 'boss' : 'quiz').tone} w-full glass-card p-5 hover:-translate-y-0.5 active:scale-98 transition-all duration-200 border border-slate-200 text-left group disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none`}
      >
        <MissionModeIcon type={isChapterBoss ? 'boss' : 'quiz'} />
        <div className="mission-mode-copy">
          <span className="text-slate-500 text-xs font-black">{isChapterBoss ? 'O-NET ASSESSMENT' : 'CLASSIC'}</span>
          <h3 className="text-slate-800 font-black text-base">{hasQuizItems ? isChapterBoss ? `เริ่มข้อสอบ O-NET ${isMixedBoss ? 'Boss Challenge ' : ''}${assessmentCount} ข้อ` : 'Quiz Mode' : pendingItems ? 'Quiz รอตรวจรับ' : 'แบบประเมินยังไม่พร้อม'}</h3>
          <span className="mission-mode-action-label">{getMissionModeArtwork(isChapterBoss ? 'boss' : 'quiz').label}</span>
          <p className="mission-mode-description text-slate-500 text-xs">{hasQuizItems ? isChapterBoss ? isMixedBoss ? `${assessmentCount} ข้อ · Ordering · Labeling · Graph · Comparison · ผ่านเกณฑ์ 70%` : `${assessmentCount} ข้อ · ผ่านเกณฑ์ 70% · คะแนนจากคำตอบครั้งแรก` : 'เรียน + ทำข้อสอบ MCQ แบบเดิม' : pendingItems ? `รอตรวจรับข้อประเมิน ${pendingItems} ข้อ` : 'ยังไม่มีข้อประเมินในด่านนี้'}</p>
        </div>
        <div className="mission-mode-chevron text-slate-500 text-lg shrink-0">›</div>
      </button>
      {import.meta.env.DEV && questId !== 'family' && pendingItems > 0 && <a className="mt-3 inline-flex items-center gap-2 text-sky-700 min-h-11 px-3 border border-sky-200 rounded" href={`/scratch/assessment-review.html?quest=${encodeURIComponent(questId)}`}><Play size={18}/>ลอง Quiz ชุดร่าง</a>}
      {!hasQuizItems && <p id="assessment-unavailable" role="status" className="mt-3 text-sm text-slate-600 leading-relaxed">
        กิจกรรมเรียนรู้ยังเปิดให้เล่นได้ แต่ XP จากกิจกรรมไม่นับเป็นผลผ่านแบบประเมิน
      </p>}

      {/* Tip */}
      {hasQuizItems && visibleMissions.length > 0 && <div className="mt-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
        <p className="text-amber-700 text-xs"><UIIcon value={"💡"} /> เล่น Game Missions เพื่อสะสม XP เพิ่มเติมก่อนทำ Quiz!</p>
      </div>}
    </div>
  );
}

