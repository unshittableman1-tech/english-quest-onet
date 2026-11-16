import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  Award,
  RotateCcw,
  Sparkles,
  Lock,
  Play,
  CheckCircle2,
  AlertCircle,
  School,
  UserCheck,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Info
} from 'lucide-react';
import {
  getGuestDemoSession,
  saveGuestDemoSession,
  clearGuestDemoSession,
  addDemoXPToSession,
  recordDemoMissionCompletion,
  recordDemoExamAttemptToSession,
  recordDemoMistakeToSession,
  reviewDemoMistakeInSession
} from '../../utils/demoSession';
import { DEMO_QUEST_MISSIONS, DEMO_REGIONS } from '../../data/demoContent';
import DemoVocabDrill from './DemoVocabDrill';
import DemoExamView from './DemoExamView';
import DemoMistakeReview from './DemoMistakeReview';
import GameMissionRouter from '../games/GameMissionRouter';

export default function DemoAdventureHub({ onNavigateOfficial, onToast }) {
  const [session, setSession] = useState(() => getGuestDemoSession());
  const [activeSubView, setActiveSubView] = useState(null); // 'vocab' | 'exam' | 'mission' | 'mistakes' | null
  const [activeMission, setActiveMission] = useState(null);

  // Sync session state to storage
  const handleAddXP = (amount, reason = '') => {
    const { session: updated, leveledUp, newLevel } = addDemoXPToSession(session, amount);
    setSession({ ...updated });
    if (onToast) {
      onToast(`+${amount} XP ${reason ? `(${reason})` : ''}`);
    }
  };

  const handleCompleteMission = (missionId, score, total) => {
    const updated = recordDemoMissionCompletion(session, missionId, score, total);
    setSession({ ...updated });
    handleAddXP(30 + score * 5, 'ผ่านภารกิจ Demo');
    setActiveSubView(null);
    setActiveMission(null);
  };

  const handleRecordExamAttempt = (attempt) => {
    const updated = recordDemoExamAttemptToSession(session, attempt);
    setSession({ ...updated });
  };

  const handleRecordMistake = (question) => {
    const updated = recordDemoMistakeToSession(session, question);
    setSession({ ...updated });
  };

  const handleResolveMistake = (questionId, isCorrect) => {
    const updated = reviewDemoMistakeInSession(session, questionId, isCorrect);
    setSession({ ...updated });
  };

  const handleResetDemo = () => {
    if (typeof window !== 'undefined' && window.confirm('ต้องการรีเซ็ตความก้าวหน้า Demo ชั่วคราวทั้งหมดและเริ่มใหม่หรือไม่?')) {
      clearGuestDemoSession();
      const fresh = getGuestDemoSession();
      setSession(fresh);
      setActiveSubView(null);
      setActiveMission(null);
      if (onToast) onToast('รีเซ็ตเซสชันทดลองเล่นเรียบร้อย');
    }
  };

  const mistakeCount = Object.values(session?.mistakeBank || {}).filter(m => !m.mastered).length;

  // Render Sub-Views
  if (activeSubView === 'vocab') {
    return (
      <DemoVocabDrill
        onBack={() => setActiveSubView(null)}
        onAddXP={handleAddXP}
        onRecordMistake={handleRecordMistake}
      />
    );
  }

  if (activeSubView === 'exam') {
    return (
      <DemoExamView
        onBack={() => setActiveSubView(null)}
        onAddXP={handleAddXP}
        onRecordExamAttempt={handleRecordExamAttempt}
        onRecordMistake={handleRecordMistake}
      />
    );
  }

  if (activeSubView === 'mistakes') {
    return (
      <DemoMistakeReview
        session={session}
        onBack={() => setActiveSubView(null)}
        onResolveMistake={handleResolveMistake}
        onAddXP={handleAddXP}
      />
    );
  }

  if (activeSubView === 'mission' && activeMission) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="mb-4">
          <button
            onClick={() => { setActiveSubView(null); setActiveMission(null); }}
            className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold hover:bg-amber-200 transition"
          >
            ← กลับหน้า Demo Hub
          </button>
        </div>
        <GameMissionRouter
          mission={activeMission}
          onComplete={async (xpEarned) => {
            const cardCount = activeMission.cards?.length || activeMission.questions?.length || activeMission.wordSentences?.length || 5;
            handleCompleteMission(activeMission.id, cardCount, cardCount);
          }}
          onBack={() => { setActiveSubView(null); setActiveMission(null); }}
        />
      </div>
    );
  }

  // Main Hub View
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      {/* Public Demo Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 p-6 sm:p-8 text-white shadow-xl mb-8">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/30 text-amber-100 text-xs font-black uppercase tracking-wider mb-2 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> Secure Public Demo Mode
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              English O-NET Adventure — โหมดทดลองเล่นฟรี
            </h1>
            <p className="text-amber-100 text-sm max-w-xl leading-relaxed">
              สัมผัสประสบการณ์เกมภาษาอังกฤษ ป.6 เตรียมสอบ O-NET อย่างแท้จริง โดยไม่ต้องใช้บัญชีโรงเรียน ข้อมูลทั้งหมดเป็นเพียงเดโมชั่วคราวและแยกจากระบบจริง 100%
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateOfficial && onNavigateOfficial('student-login')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-amber-950 font-black text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-amber-600" /> เข้าสู่ระบบนักเรียนจริง
            </button>
            <button
              onClick={() => onNavigateOfficial && onNavigateOfficial('teacher-login')}
              className="px-4 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-950/60 text-white font-bold text-xs border border-white/20 transition flex items-center justify-center gap-2"
            >
              <School className="w-3.5 h-3.5 text-amber-300" /> หน้าเข้าสู่ระบบคุณครู
            </button>
          </div>
        </div>
      </div>

      {/* Guest Status Strip (In-memory XP & Session Actions) */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-2xl p-4 border border-amber-200 shadow-sm flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 flex items-center justify-center text-2xl font-black text-amber-800 dark:text-amber-300">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 dark:text-white text-base">
                ผู้เยี่ยมชม (Guest Demo)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                Level {session?.level || 1}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>คะแนนสะสม: <strong className="text-amber-600">{session?.xp || 0} XP</strong></span>
              <span>•</span>
              <span>เซสชันชั่วคราวในเบราว์เซอร์</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {mistakeCount > 0 && (
            <button
              onClick={() => setActiveSubView('mistakes')}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" /> ทบทวนข้อผิด ({mistakeCount})
            </button>
          )}

          <button
            onClick={handleResetDemo}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            title="ล้างข้อมูลเดโมและเริ่มใหม่"
          >
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ต Demo
          </button>
        </div>
      </div>

      {/* Grid of 3 Core Demo Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Module 1: Quest Explorer */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-3xl p-6 border-2 border-amber-300 shadow-md hover:shadow-lg transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl mb-4 border border-amber-200">
              🗺️
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Quest Explorer
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                3 ภารกิจ
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              ฝึกทำภารกิจผจญภัยภาษาอังกฤษ 3 รูปแบบ: แฟลชการ์ด, เติมคำในช่องว่าง และเรียงประโยค
            </p>

            {/* List of 3 Missions */}
            <div className="space-y-2 mb-4">
              {DEMO_QUEST_MISSIONS.map((m, idx) => {
                const passed = session?.questProgress?.[m.id]?.passed;
                return (
                  <div
                    key={m.id}
                    onClick={() => { setActiveMission(m); setActiveSubView('mission'); }}
                    className="p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 border border-amber-200 dark:border-slate-600 cursor-pointer flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-slate-800 dark:text-white">{m.title}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{m.type}</div>
                      </div>
                    </div>
                    {passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => { setActiveMission(DEMO_QUEST_MISSIONS[0]); setActiveSubView('mission'); }}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            เริ่มเล่น Quest <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Module 2: Vocabulary Drill */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-3xl p-6 border-2 border-indigo-300 shadow-md hover:shadow-lg transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-2xl mb-4 border border-indigo-200">
              📖
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Vocabulary Drill
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                30 คำศัพท์
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              ฝึกจำคำศัพท์ ป.6 คุณภาพ 30 คำ (ข้อมูลส่วนตัว, ห้องเรียน และคำกริยา) พร้อมโหมดการ์ดและควิซสั้น
            </p>

            <div className="bg-indigo-50/70 dark:bg-slate-700/60 p-3 rounded-2xl border border-indigo-200 dark:border-slate-600 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>• ข้อมูลส่วนตัว (Profile)</span>
                <span className="font-bold">10 คำ</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>• ห้องเรียนและอุปกรณ์</span>
                <span className="font-bold">10 คำ</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>• คำกริยากิจวัตรประจำวัน</span>
                <span className="font-bold">10 คำ</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveSubView('vocab')}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            เปิดคลังศัพท์ 30 คำ <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Module 3: Exam Arena */}
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-3xl p-6 border-2 border-emerald-300 shadow-md hover:shadow-lg transition flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl mb-4 border border-emerald-200">
              🎯
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Exam Arena
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                10 ข้อ O-NET
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              ชุดข้อสอบจำลอง Mini Mock 10 ข้อ จับเวลาจริง 10 นาที ตรวจคำตอบพร้อมคำอธิบายเฉลยละเอียด
            </p>

            <div className="bg-emerald-50/70 dark:bg-slate-700/60 p-3 rounded-2xl border border-emerald-200 dark:border-slate-600 mb-4 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>• ป้ายและสัญลักษณ์ (Signs)</span>
                <span className="font-bold">5 ข้อ</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>• บทสนทนา (Conversation)</span>
                <span className="font-bold">5 ข้อ</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>• เวลาจำลองการสอบ</span>
                <span className="font-bold">10 นาที</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveSubView('exam')}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            เริ่มทำข้อสอบจำลอง <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* World Map Preview Section (Starter Realm Unlocked, Others Locked Preview) */}
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" />
              World Map Preview — แผนที่โลกผจญภัย
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              โหมดเดโมเปิดให้เข้าถึงบทเริ่มต้น (Chapter 1) ส่วนบทถัดไปเป็นตัวอย่างแสดงโครงสร้างระบบ
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold self-start">
            1 Starter Region Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEMO_REGIONS.map(reg => {
            const isUnlocked = reg.status === 'unlocked';
            return (
              <div
                key={reg.id}
                className={`p-5 rounded-2xl border-2 transition ${
                  isUnlocked
                    ? 'bg-amber-50/80 border-amber-300 dark:bg-slate-800'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{reg.icon}</span>
                  {isUnlocked ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      เปิดให้เล่น
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> ล็อก
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-1">
                  {reg.name}
                </h4>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  {reg.description}
                </p>
                {isUnlocked ? (
                  <button
                    onClick={() => { setActiveMission(DEMO_QUEST_MISSIONS[0]); setActiveSubView('mission'); }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                  >
                    เล่น 3 ด่านเริ่มต้น →
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400 italic block">
                    {reg.lockNotice}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Official School CTA Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden border-2 border-amber-400 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-xs font-black mb-3">
            <Sparkles className="w-3.5 h-3.5" /> ยกระดับคะแนน O-NET ทั้งชั้นเรียน
          </div>
          <h3 className="text-2xl font-black mb-2">
            พร้อมใช้งานเวอร์ชันเต็มสำหรับโรงเรียนของคุณแล้วหรือยัง?
          </h3>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            ระบบจัดเก็บสถิตินักเรียนรายบุคคล (Student 360°), ข้อสอบเสมือนจริง 64–68 ครบทุกทักษะ, บทวิเคราะห์จุดผิดพลาด (Common Misconception) และแผนการสอนซ่อมเสริมสำหรับคุณครู
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateOfficial && onNavigateOfficial('student-login')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> นักเรียน: เข้าสู่ระบบโรงเรียน
            </button>
            <button
              onClick={() => onNavigateOfficial && onNavigateOfficial('teacher-login')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-600 transition flex items-center gap-2"
            >
              <School className="w-4 h-4 text-amber-400" /> คุณครู: เข้าสู่ Teacher Dashboard
            </button>
            <button
              onClick={() => onNavigateOfficial && onNavigateOfficial('landing')}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-slate-300 font-medium text-xs transition"
            >
              ดูรายละเอียดแพ็กเกจโรงเรียน →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
