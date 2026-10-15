import UIIcon, { UIIconText } from './UIIcon';
import React, { useState, useEffect, useCallback } from 'react';
import { ARENA_MISSIONS, FINAL_EXAM_CONFIG } from '../data/chapter4_config';
import { mergeArenaStatsFromCloud, getExamSessionFromCloud, getFinalExamResult } from '../utils/arenaStorage';

const POLL_INTERVAL_MS = 30000; // poll ทุก 30 วินาที

export default function OnetArena({ student, onBack, onStartExam, onStartFinalExam }) {
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(true);
  const [examSession, setExamSession] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [finalExamResult, setFinalExamResult] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ── Initial load ────────────────────────────────────────────
  useEffect(() => {
    if (student) {
      setSyncing(true);
      Promise.all([
        mergeArenaStatsFromCloud(student.id),
        getExamSessionFromCloud(),
      ]).then(([merged, session]) => {
        setStats(merged);
        setExamSession(session);
        setFinalExamResult(getFinalExamResult(student.id));
        setLastRefreshed(new Date());
        setSyncing(false);
      });
    }
  }, [student]);

  // ── Auto-polling: ตรวจสถานะสอบทุก 30 วินาที ──────────────
  useEffect(() => {
    if (!student) return;
    const interval = setInterval(async () => {
      try {
        const session = await getExamSessionFromCloud();
        setExamSession(session);
        setFinalExamResult(getFinalExamResult(student.id));
        setLastRefreshed(new Date());
      } catch (e) {
        // silent — ใช้ค่าเก่า
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval); // cleanup เมื่อ unmount
  }, [student]);

  // ── Manual Refresh ───────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const session = await getExamSessionFromCloud();
      setExamSession(session);
      setFinalExamResult(getFinalExamResult(student.id));
      setLastRefreshed(new Date());
    } catch (e) {
      // silent
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, student]);

  if (syncing || !stats) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-amber-700 text-sm font-bold">กำลังโหลดคะแนน...</p>
      </div>
    </div>
  );


  const getBestScore = (missionId) => {
    let key = '';
    if (missionId === 'mini_mock_arena') key = 'bestMiniMock';
    if (missionId === 'speed_mock_challenge') key = 'bestSpeedMock';
    if (missionId === 'skill_mixed_mock') key = 'bestSkillMixedMock';
    if (missionId === 'weakness_mock') key = 'bestWeaknessMock';
    if (missionId === 'full_mock_test') key = 'bestFullMock';
    if (missionId === 'final_exam_simulation') key = 'bestFinalSimulation';
    
    return stats[key];
  };

  const handlePinSubmit = () => {
    if (!examSession?.pin) return;
    if (pinInput.trim() === String(examSession.pin).trim()) {
      setShowPinModal(false);
      setPinInput('');
      setPinError('');
      onStartFinalExam();
    } else {
      setPinError('รหัส PIN ไม่ถูกต้อง กรุณาลองใหม่');
      setPinInput('');
    }
  };

  const examIsOpen = examSession?.isOpen === true;
  const alreadySubmitted = !!finalExamResult;

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Header — chapter-4 banner */}
      <div className="chapter-4 relative z-10 pt-12 pb-6 px-6 text-center">
        <button 
          onClick={onBack}
          className="absolute top-12 left-6 w-10 h-10 rounded-2xl bg-white/30 border border-white/40 flex items-center justify-center text-white hover:bg-white/40 transition-all"
        >
          <UIIcon value={"←"} />
        </button>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/30 text-3xl shadow-xl mb-4 border border-white/40">
          <UIIcon value={"🏟️"} />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2 drop-shadow">
          O-NET Arena
        </h1>
        <p className="text-slate-800/80 max-w-sm mx-auto text-sm">
          สนามประลองข้อสอบจริง ฝึกฝนทำข้อสอบ จับเวลา และวิเคราะห์จุดอ่อนของคุณ
        </p>
      </div>

      {/* Stats Summary */}
      <div className="px-6 -mt-4 mb-6 relative z-10 max-w-lg mx-auto">
        <div className="glass-card p-4 flex justify-between items-center border-amber-200">
          <div>
            <div className="text-xs text-slate-500 mb-1 font-bold">Rank Score</div>
            <div className="text-2xl font-black text-amber-600">{Math.round(stats.arenaRankScore || 0)}</div>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div>
            <div className="text-xs text-slate-500 mb-1 font-bold">Badges</div>
            <div className="text-2xl font-black text-amber-500">{stats.arenaBadges?.length || 0} / 8</div>
          </div>
          <div className="h-8 w-px bg-amber-200" />
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1 font-bold">Full Mock Best</div>
            <div className="text-xl font-black text-emerald-600">
              {stats.bestFullMock ? `${Math.round(stats.bestFullMock.percent)}%` : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="px-6 relative z-10 max-w-lg mx-auto space-y-4">

        {/* ── Final Exam Card (Pinned at the Top!) ── */}
        <div className={`glass-card p-5 relative overflow-hidden transition-all duration-300 border-2 ${
          examIsOpen && !alreadySubmitted
            ? 'border-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.3)]'
            : alreadySubmitted
            ? 'border-emerald-300'
            : 'border-amber-200'
        }`}>
          {/* Gold shimmer when open */}
          {examIsOpen && !alreadySubmitted && (
            <div className="absolute inset-0 pointer-events-none rounded-2xl animate-pulse" style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, transparent 70%)',
            }} />
          )}

          <div className="flex gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg border ${
              examIsOpen && !alreadySubmitted
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 animate-bounce'
                : alreadySubmitted
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 border-emerald-300'
                : 'bg-amber-50 border-amber-200 opacity-70'
            }`}>
              <UIIcon value={"🎓"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-black text-lg text-amber-800">สอบปลายภาค</h3>
                {examIsOpen && !alreadySubmitted && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full border border-emerald-300 font-bold animate-pulse">
                    <UIIcon value={"🟢"} /> เปิดสอบอยู่
                  </span>
                )}
                {!examIsOpen && !alreadySubmitted && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full border border-slate-200">
                    <UIIcon value={"🔒"} /> รอครูเปิดสอบ
                  </span>
                )}
                {alreadySubmitted && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full border border-emerald-300 font-bold">
                    <UIIcon value={"✅"} /> ส่งข้อสอบแล้ว
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {FINAL_EXAM_CONFIG.description}
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  <UIIcon value={"📄"} /> {FINAL_EXAM_CONFIG.questions} ข้อ
                </span>
                <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 font-black">
                  <UIIcon value={"💯"} /> {FINAL_EXAM_CONFIG.totalPoints} คะแนน
                </span>
                <span className="px-2 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
                  <UIIcon value={"⏱️"} /> {Math.round(FINAL_EXAM_CONFIG.timeLimit / 60)} นาที
                </span>
                <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 border border-rose-200">
                  <UIIcon value={"⚠️"} /> ทำได้ครั้งเดียว
                </span>
                {alreadySubmitted && (
                  <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 font-black">
                    <UIIcon value={"🏆"} /> {finalExamResult.points ?? (finalExamResult.score * 2)}/100 ({Math.round(finalExamResult.percent)}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {examIsOpen && !alreadySubmitted && (
            <button
              onClick={() => { setPinInput(''); setPinError(''); setShowPinModal(true); }}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              เข้าสอบปลายภาค <UIIcon value={"🎓"} /> (ใส่รหัส PIN)
            </button>
          )}

          {!examIsOpen && !alreadySubmitted && (
            <div className="mt-4 space-y-2">
              <div className="w-full py-2.5 px-3 rounded-xl text-center text-xs text-slate-500 bg-slate-50 border border-slate-200">
                <UIIcon value={"⏳"} /> ยังไม่เปิดสอบ — กรุณารอคุณครูเปิดระบบและแจ้งรหัส PIN ในห้องเรียน
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all disabled:opacity-40"
              >
                {refreshing ? (
                  <><span className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /> กำลังตรวจสอบ...</>
                ) : (
                  <><UIIcon value={"🔄"} /> รีเฟรชสถานะ{lastRefreshed && <span className="text-slate-500 font-normal ml-1">(ล่าสุด {lastRefreshed.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</span>}</>
                )}
              </button>
            </div>
          )}

          {alreadySubmitted && (
            <button
              onClick={onStartFinalExam}
              className="btn-ghost w-full mt-4 flex items-center justify-center gap-2"
            >
              <UIIcon value={"📊"} /> ดูผลสอบปลายภาค & ใบประกาศนียบัตร
            </button>
          )}
        </div>

        {/* Section Divider: Arena Practice Missions */}
        <div className="pt-2 pb-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-amber-200" />
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">สนามฝึกซ้อมข้อสอบ O-NET</span>
          <div className="h-px flex-1 bg-amber-200" />
        </div>

        {ARENA_MISSIONS.map(mission => {
          const isUnlocked = mission.unlock(stats);
          const best = getBestScore(mission.id);

          return (
            <div 
              key={mission.id}
              className={`glass-card p-5 relative overflow-hidden transition-all duration-300 border-l-4 ${
                mission.isBoss
                  ? 'border-l-amber-500'
                  : 'border-l-sky-400'
              } ${isUnlocked ? '' : 'opacity-60 grayscale'}`}
            >
              {!isUnlocked && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
                  <div className="bg-white/90 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 flex items-center gap-2 shadow-xl">
                    <UIIcon value={"🔒"} /> ปลดล็อกเมื่อผ่าน Full Mock 70%
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-lg ${
                  mission.isBoss 
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-300'
                    : 'bg-gradient-to-br from-sky-100 to-sky-200 border border-sky-300'
                }`}>
                  <UIIcon value={mission.icon} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`font-black text-lg mb-1 truncate ${mission.isBoss ? 'text-amber-800' : 'text-slate-800'}`}>
                    {mission.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                    {mission.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                      <UIIcon value={"📄"} /> {mission.questions} ข้อ
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
                      <UIIcon value={"⏱️"} /> {mission.timeLimit / 60} นาที
                    </span>
                    {best && (
                      <span className={`px-2 py-1 rounded-lg border ${
                        best.percent >= 70 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        <UIIcon value={"🏆"} /> ดีสุด {Math.round(best.percent)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isUnlocked && (
                <button
                  onClick={() => onStartExam(mission.id)}
                  className={`w-full mt-4 ${mission.isBoss ? 'btn-primary' : 'btn-secondary'}`}
                >
                  เริ่มทำข้อสอบ <UIIcon value={mission.icon} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── PIN Modal ── */}
      {showPinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPinModal(false)} />
          <div className="glass-card p-6 max-w-sm w-full relative z-10 animate-bounce-in border-amber-300">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2"><UIIcon value={"🎓"} /></div>
              <h3 className="text-xl font-black text-amber-800 mb-1">ใส่รหัส PIN</h3>
              <p className="text-slate-500 text-sm">กรอกรหัส PIN ที่ได้รับจากครูเพื่อเข้าสอบปลายภาค</p>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={pinInput}
              onChange={e => { setPinInput(e.target.value); setPinError(''); }}
              onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              placeholder="กรอกรหัส PIN"
              className="input-field w-full text-center text-2xl font-mono tracking-[0.5em] mb-3"
              autoFocus
            />
            {pinError && (
              <p className="text-rose-600 text-sm text-center mb-3"><UIIcon value={"⚠️"} /> {pinError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowPinModal(false)}
                className="btn-ghost flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handlePinSubmit}
                disabled={!pinInput.trim()}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                เข้าสอบ <UIIcon value={"🎓"} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

