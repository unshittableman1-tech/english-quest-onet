import UIIcon, { UIIconText } from './UIIcon';
import { useState } from 'react';
import { useApp } from '../App';
import { CH1_MISSIONS } from '../data/missions/ch1_missions';
import { CH2_MISSIONS } from '../data/missions/ch2_missions';
import { CH3_MISSIONS } from '../data/missions/ch3_missions';
import { CH5_MISSIONS } from '../data/missions/ch5_missions';
import { QUESTS } from '../data/questions';
import { Play, Swords } from 'lucide-react';
import { isPracticeQuestionReady } from '../utils/questionMedia';

// ── MissionSelect ─────────────────────────────────────────────
// Shows the 3-mode selection: Mission A | Mission B | Quiz
// Props are taken from AppContext

const GAME_TYPE_LABELS = {
  flashcard: { icon: '🃏', label: 'Flashcard Flip', desc: 'พลิกการ์ดเรียนรู้คำ' },
  matching: { icon: '🔗', label: 'Word Matching', desc: 'จับคู่คำกับความหมาย' },
  fill_blank: { icon: '✏️', label: 'Fill in the Blank', desc: 'เติมคำในช่องว่าง' },
  conversation: { icon: '💬', label: 'Conversation', desc: 'สนทนาเลือกคำตอบ' },
  story_tap: { icon: '👆', label: 'Story Tap', desc: 'อ่านบทความแล้วแตะคำตอบ' },
  rearrange: { icon: '📦', label: 'Sentence Rearrange', desc: 'เรียงคำให้เป็นประโยค' },
  spell: { icon: '🔤', label: 'Spell It', desc: 'สะกดคำจาก Letters' },
};

function getMissions(questId) {
  return (
    CH1_MISSIONS[questId] ||
    CH2_MISSIONS[questId] ||
    CH3_MISSIONS[questId] ||
    CH5_MISSIONS[questId] ||
    []
  );
}

export default function MissionSelect() {
  const { currentQuest, navigate, addXP } = useApp();
  const questId = currentQuest;
  const missions = getMissions(questId);
  const quest = QUESTS.find(item => item.id === questId);
  const isChapterBoss = questId === 'chapter2_boss' || questId === 'chapter5_boss';
  const hasQuizItems = Boolean(quest?.questions?.some(isPracticeQuestionReady));
  const pendingItems = quest?.questions?.filter(q => q.reviewStatus === 'pending_teacher').length || 0;

  async function handleMissionComplete(xpEarned) {
    await addXP(xpEarned, `🎮 Mission: +${xpEarned} XP`);
    navigate('mission-select', questId); // return to mission select after game
  }

  function handleSelectMission(mission) {
    navigate('game', { questId, mission, onComplete: handleMissionComplete });
  }

  function handleGoQuiz() {
    if (!hasQuizItems) return;
    navigate('lesson', questId); // MiniLesson → Quiz (existing flow)
  }

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-4">
        <button
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
      {missions.length > 0 && (
        <>
          <div className="mb-3">
            <span className="text-xs font-black text-amber-700 uppercase tracking-widest"><UIIcon value={"🎮"} /> Game Missions</span>
          </div>
          <div className="space-y-3 mb-6">
            {missions.map((mission, i) => {
              const typeInfo = GAME_TYPE_LABELS[mission.type] || { icon: '🎮', label: mission.type, desc: '' };
              return (
                <button
                  key={mission.id}
                  onClick={() => handleSelectMission(mission)}
                  className="w-full glass-card p-5 flex items-center gap-4 hover:bg-amber-50 hover:-translate-y-0.5 active:scale-98 transition-all duration-200 border-l-4 border-l-amber-400 border border-amber-200 text-left group"
                >
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-2xl shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                    <UIIcon value={typeInfo.icon} />
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-slate-500 text-xs font-black">MISSION {i + 1}</span>
                    </div>
                    <h3 className="text-slate-800 font-black text-base">{mission.title}</h3>
                    <p className="text-slate-500 text-xs truncate">{mission.subtitle || typeInfo.desc}</p>
                  </div>
                  {/* XP + Arrow */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-amber-600 font-black text-sm">+{mission.xpReward} XP</span>
                    <span className="text-slate-500 text-lg">›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Divider */}
      {missions.length > 0 && <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-amber-200" />
        <span className="text-xs text-slate-500 uppercase tracking-widest">หรือ</span>
        <div className="h-px flex-1 bg-amber-200" />
      </div>}

      {/* Quiz Mode (existing) */}
      <button
        onClick={handleGoQuiz}
        disabled={!hasQuizItems}
        aria-describedby={!hasQuizItems ? 'assessment-unavailable' : undefined}
        className="w-full glass-card p-5 flex items-center gap-4 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-98 transition-all duration-200 border border-slate-200 text-left group disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-2xl shrink-0 shadow-lg group-hover:scale-105 transition-transform">
          {isChapterBoss ? <Swords size={26} aria-hidden="true" /> : <UIIcon value={"📝"} />}
        </div>
        <div className="flex-1">
          <span className="text-slate-500 text-xs font-black">CLASSIC</span>
          <h3 className="text-slate-800 font-black text-base">{hasQuizItems ? isChapterBoss ? 'เริ่มท้าทายบอส' : 'Quiz Mode' : pendingItems ? 'Quiz รอตรวจรับ' : 'แบบประเมินยังไม่พร้อม'}</h3>
          <p className="text-slate-500 text-xs">{hasQuizItems ? isChapterBoss ? '10 ข้อ · คะแนนจากคำตอบครั้งแรก' : 'เรียน + ทำข้อสอบ MCQ แบบเดิม' : pendingItems ? `รอตรวจรับข้อประเมิน ${pendingItems} ข้อ` : 'ยังไม่มีข้อประเมินในด่านนี้'}</p>
        </div>
        <div className="text-slate-500 text-lg shrink-0">›</div>
      </button>
      {import.meta.env.DEV && questId !== 'family' && pendingItems > 0 && <a className="mt-3 inline-flex items-center gap-2 text-sky-700 min-h-11 px-3 border border-sky-200 rounded" href={`/scratch/assessment-review.html?quest=${encodeURIComponent(questId)}`}><Play size={18}/>ลอง Quiz ชุดร่าง</a>}
      {!hasQuizItems && <p id="assessment-unavailable" role="status" className="mt-3 text-sm text-slate-600 leading-relaxed">
        กิจกรรมเรียนรู้ยังเปิดให้เล่นได้ แต่ XP จากกิจกรรมไม่นับเป็นผลผ่านแบบประเมิน
      </p>}

      {/* Tip */}
      {hasQuizItems && missions.length > 0 && <div className="mt-6 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
        <p className="text-amber-700 text-xs"><UIIcon value={"💡"} /> เล่น Game Missions เพื่อสะสม XP เพิ่มเติมก่อนทำ Quiz!</p>
      </div>}
    </div>
  );
}
