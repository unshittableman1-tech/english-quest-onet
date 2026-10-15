import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import LandingPage from './components/LandingPage';
import StudentLoginPage from './components/StudentLoginPage';
import TeacherLoginPage from './components/TeacherLoginPage';
import PreTestPage from './components/PreTestPage';
import QuestMap from './components/QuestMap';
import MiniLesson from './components/MiniLesson';
import QuizPage from './components/QuizPage';
import BadgePage from './components/BadgePage';
import StudentReport from './components/StudentReport';
import TeacherDashboard from './components/TeacherDashboard';
import FinalBoss from './components/FinalBoss';
import ReviewMistakePage from './components/ReviewMistakePage';
import RankingPage from './components/RankingPage';
import Navigation from './components/Navigation';
import XPToast from './components/XPToast';
import OnetArena from './components/OnetArena';
import MultiplayerArena from './components/MultiplayerArena';
import HeadsUpCharades from './components/HeadsUpCharades';
import ExamMode from './components/ExamMode';
import ExamReport from './components/ExamReport';
import MissionSelect from './components/MissionSelect';
import GameMissionRouter from './components/games/GameMissionRouter';
import TechniqueHub from './components/TechniqueHub';
import VocabDrillHub from './components/VocabDrillHub';
import RealOnetSimulator from './components/RealOnetSimulator';
import FinalExamReport from './components/FinalExamReport';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import {
  getCurrentStudent, updateCurrentStudent, clearCurrentStudent,
  saveStudent, addXP as storageAddXP, saveQuestResult, awardBadge, savePreTest,
  saveMistake, processReviewAnswer, updateBadgeStats, updateLastActive, setOffline,
  checkDailyReward, markDailyRewardClaimed,
} from './utils/storage';
import {
  calcLevel, XP_RULES, getUnlockedQuests, xpToNextLevel,
} from './utils/scoring';
import { playLevelUpSound } from './utils/audio';
import BGMToggle from './components/BGMToggle';
import BadgeModal from './components/BadgeModal';
import { BADGES, checkUnlockedBadges } from './data/badges';
import { getFinalExamResult, mergeArenaStatsFromCloud } from './utils/arenaStorage';
import LoginRankModal from './components/ranking/LoginRankModal';
import RankShiftToast from './components/ranking/RankShiftToast';
import RankWatcher from './components/ranking/RankWatcher';
import DailyRewardModal from './components/DailyRewardModal';
import { supabase } from './config/supabase';
import { createMembershipService, createStaffSession } from './utils/membership';

const membershipService = createMembershipService(supabase);

// ── App Context ──────────────────────────────────────────────
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Pages that show bottom nav
const SHOW_NAV_PAGES = ['map', 'badge', 'report', 'review', 'ranking'];

// ── Demo Student ──────────────────────────────────────────────
const DEMO_STUDENT = {
  id: 'demo_student',
  name: 'Demo Student',
  class: 'Demo',
  number: '0',
  roomCode: 'DEMO',
  xp: 0,
  level: 1,
  badges: [],
  role: 'student',
  isDemo: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function App() {
  const [page, setPage]               = useState('landing');
  const [student, setStudentState]    = useState(null);
  const studentRef = useRef(null);
  const setStudent = useCallback((value) => {
    const next = typeof value === 'function' ? value(studentRef.current) : value;
    studentRef.current = next;
    setStudentState(next);
  }, []);
  const [currentQuest, setCurrentQuest] = useState(null);
  const [currentMission, setCurrentMission] = useState(null); // active game mission
  const [toast, setToast]             = useState(null);
  const [levelUpMsg, setLevelUpMsg]   = useState(null);
  const [newEarnedBadges, setNewEarnedBadges] = useState([]);
  const [lastAttempt, setLastAttempt] = useState(null);
  const [lastFinalExamAttempt, setLastFinalExamAttempt] = useState(null);
  const [loginRank, setLoginRank]   = useState(null);
  const [rankShift, setRankShift]   = useState(null);
  const [dailyReward, setDailyReward] = useState(null);

  // Load saved session on mount. Staff sessions must be re-verified with Supabase.
  useEffect(() => {
    let active = true;
    const urlParams = new URLSearchParams(window.location.search);
    const routeParam = urlParams.get('route');
    const schoolParam = urlParams.get('school') || urlParams.get('schoolCode');

    if (routeParam === 'student-login' || (schoolParam && !getCurrentStudent())) {
      setStudent(null);
      setPage('student-login');
      return;
    }

    const saved = getCurrentStudent();
    if (saved) {
      if (saved.isStaff || saved.role === 'teacher' || saved.role === 'super_admin') {
        membershipService.getIdentity()
          .then((identity) => {
            if (!active) return;
            const verifiedSession = createStaffSession(identity, saved.school_membership_id || null);
            localStorage.setItem('eq_onet_current', JSON.stringify(verifiedSession));
            setStudent(verifiedSession);
            setPage(verifiedSession.role === 'super_admin' ? 'super-admin' : 'teacher');
          })
          .catch(async () => {
            try { await membershipService.signOut(); } catch { /* local state is still cleared */ }
            if (!active) return;
            clearCurrentStudent();
            setStudent(null);
            setPage('teacher-login');
          });
      } else {
        const hasPreTest = saved.preTest != null;
        if (hasPreTest) {
          setStudent(saved);
          setPage('map');
        } else if (saved.id && !saved.id.startsWith('local_')) {
          setStudent(saved);
          setPage('pretest');
        } else {
          import('./utils/storage').then(({ clearCurrentStudent }) => {
            clearCurrentStudent();
          });
          setStudent(null);
          setPage('landing');
        }
      }
    }
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_OUT' || !studentRef.current?.isStaff) return;
      clearCurrentStudent();
      setStudent(null);
      setPage('teacher-login');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ── Navigation ───────────────────────────────────────────
  const navigate = useCallback(async (target, questIdOrMission = null) => {
    if (target === 'final-exam') {
      const current = studentRef.current;
      if (!current) return;
      try {
        const stats = await mergeArenaStatsFromCloud(current.id, { requireCloud: !current.isDemo });
        if (studentRef.current?.id !== current.id) return;
        if (stats.finalExamResult) {
          setLastFinalExamAttempt(stats.finalExamResult);
          setPage('final-exam-report');
          window.scrollTo(0, 0);
          return;
        }
      } catch {
        showToast('ตรวจสอบสถานะสอบไม่ได้ กรุณาเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง');
        return;
      }
    }
    if (target === 'game' && questIdOrMission?.mission) {
      // Navigate to a specific game mission
      setCurrentMission(questIdOrMission.mission);
      setCurrentQuest(questIdOrMission.questId);
    } else if (questIdOrMission && typeof questIdOrMission === 'string') {
      setCurrentQuest(questIdOrMission);
    }
    setPage(target);
    window.scrollTo(0, 0);
  }, [showToast]);

  // ── XP System ───────────────────────────────────────────
  const addXP = useCallback(async (amount, reason = '') => {
    const current = studentRef.current;
    if (!current || !Number.isFinite(amount)) return;
    let leveledUp = false;
    let newLevel = current.level || 1;

    if (current.isDemo) {
      const previousXP = Number(current.xp);
      const newXP = Math.max(0, (Number.isFinite(previousXP) ? previousXP : 0) + amount);
      newLevel = calcLevel(newXP);
      leveledUp = newLevel > calcLevel(previousXP);
      setStudent({ ...current, xp: newXP, level: newLevel });
    } else {
      // Storage reads the latest session, including rewards and progress saved in the same event.
      const result = await storageAddXP(current.id, amount);
      const updated = getCurrentStudent();
      if (studentRef.current?.id !== current.id || updated?.id !== current.id) return;
      setStudent(updated);
      leveledUp = result.leveledUp;
      newLevel = result.newLevel;
    }
    
    const sign = amount > 0 ? '+' : '';
    showToast(`${sign}${amount} XP${reason ? ` (${reason})` : ''}`);
    
    if (leveledUp) {
      playLevelUpSound();
      setLevelUpMsg({ level: newLevel });
    }
  }, [showToast, setStudent]);


  const pendingBadgeAwards = useRef(new Set());
  const unlockBadge = useCallback(async (badgeId) => {
    if (!student) return;
    const badge = BADGES.find(b => b.id === badgeId);
    if (!badge) return;
    const key = `${student.id}:${badgeId}`;
    const current = getCurrentStudent();
    if (!current || current.id !== student.id || current.badges?.includes(badgeId) || pendingBadgeAwards.current.has(key)) return;
    pendingBadgeAwards.current.add(key);
    try {

    // Save badge to database
    await awardBadge(student.id, badgeId);
    
    // Add XP reward
    if (badge.xpReward) {
      await addXP(badge.xpReward, `ได้ Badge: ${badge.name}`);
    }

    // Update local state to show modal
    setNewEarnedBadges(prev => [...prev, badge]);

    // Ensure student state is refreshed so BadgePage sees the new badge
    const updatedStudent = getCurrentStudent();
    if (updatedStudent) setStudent(updatedStudent);
    } finally { pendingBadgeAwards.current.delete(key); }

  }, [student, addXP]);

  const closeBadgeModal = useCallback(() => {
    setNewEarnedBadges([]);
  }, []);

  const checkBadges = useCallback(async () => {
    if (!student || student.isDemo) return;
    // Check against latest student data
    const currentData = getCurrentStudent();
    if (!currentData) return;
    
    const newBadges = checkUnlockedBadges(currentData, currentData.badges || []);
    for (const badgeId of newBadges) {
      await unlockBadge(badgeId);
    }
  }, [student, unlockBadge]);

  // ── Quest Complete ───────────────────────────────────────
  const completeQuest = useCallback(async (questId, score, total, extraStats = {}) => {
    if (!student) return;
    const pct = Math.round((score / total) * 100);

    let result = {};
    if (!student.isDemo) {
      result = await saveQuestResult(student.id, questId, score, total, extraStats);
      const updated = await updateCurrentStudent({ questProgress: result });
      setStudent(updated);
    } else {
      // Demo: update in-memory only
      const p = { ...(student.questProgress || {}) };
      p[questId] = { score, total, pct, passed: pct >= 70, best: pct, attempts: 1, lastPlayed: new Date().toISOString(),
        ...(extraStats.assessmentEvidence ? { lastAssessment: extraStats.assessmentEvidence } : {}) };
      setStudent(s => ({ ...s, questProgress: p }));
      result = p;
    }

    // Check if previously passed before saving
    const wasAlreadyPassed = student.questProgress?.[questId]?.passed;

    // Award XP (Diminishing Returns: 50% XP if replaying an already passed quest)
    const multiplier = wasAlreadyPassed ? 0.5 : 1.0;
    if (pct >= 90) {
      const xpAmount = Math.round(XP_RULES.PASS_90 * multiplier);
      const label = wasAlreadyPassed ? 'ผ่านด่าน 90%! (เล่นซ้ำ 50% XP)' : 'ผ่านด่าน 90%!';
      await addXP(xpAmount, label);
    } else if (pct >= 70) {
      const xpAmount = Math.round(XP_RULES.PASS_70 * multiplier);
      const label = wasAlreadyPassed ? 'ผ่านด่าน! (เล่นซ้ำ 50% XP)' : 'ผ่านด่าน!';
      await addXP(xpAmount, label);
    }

    return result;
  }, [student, addXP]);

  // ── Pre-test Save ─────────────────────────────────────────
  const completePreTest = useCallback(async (categoryScores, totalScore) => {
    if (!student) return;
    if (!student.isDemo) {
      const data = await savePreTest(student.id, categoryScores, totalScore);
      const pct = Math.round((totalScore / data.total) * 100);
      const statsUpdates = { pretestScore: pct };
      await updateBadgeStats(statsUpdates);
      const updated = await updateCurrentStudent({ preTest: data });
      setStudent(updated);
      await addXP(XP_RULES.PRETEST_DONE, 'ทำ Pre-test เสร็จ');
    }
    navigate('map');
  }, [student, addXP, navigate]);

  // ── Daily Reward Claim ────────────────────────────────────
  const handleDailyRewardClaim = useCallback(async (xpAmount) => {
    await markDailyRewardClaimed();
    await addXP(xpAmount, '🔥 รางวัลล็อคอินติดต่อกัน!');
    setDailyReward(null);
  }, [addXP]);

  // ── Student Login (from StudentLoginPage) ─────────────────
  const handleLogin = useCallback((s) => {
    setStudent(s);
    const hasPreTest = s.preTest != null;
    navigate(hasPreTest ? 'map' : 'pretest');
    // Check for daily streak reward (real students only)
    const reward = checkDailyReward(s);
    if (reward) setDailyReward(reward);
  }, [navigate]);

  // ── Teacher Login ─────────────────────────────────────────
  const handleTeacherLogin = useCallback((verifiedSession) => {
    if (!verifiedSession?.authVerified || !verifiedSession?.isStaff
        || !['teacher', 'super_admin'].includes(verifiedSession.role)) {
      throw new Error('Unverified staff session');
    }
    localStorage.setItem('eq_onet_current', JSON.stringify(verifiedSession));
    setStudent(verifiedSession);
    navigate(verifiedSession.role === 'super_admin' ? 'super-admin' : 'teacher');
  }, [navigate]);

  // ── Demo Mode ─────────────────────────────────────────────
  const handleDemoLogin = useCallback(() => {
    setStudent(DEMO_STUDENT);
    navigate('map');
    showToast('🎮 Demo Mode — XP ไม่ถูกบันทึก');
  }, [navigate, showToast]);

  // ── Logout ──────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    if (student?.isStaff) {
      try { await membershipService.signOut(); } catch { /* clear local access regardless */ }
    } else if (student && student.id && student.role !== 'teacher' && !student.isDemo) {
      setOffline(student.id);
    }
    clearCurrentStudent();
    setStudent(null);
    setCurrentQuest(null);
    navigate('landing');
  }, [navigate, student]);

  // Handle navigate to demo from landing page
  useEffect(() => {
    if (page === 'demo') {
      handleDemoLogin();
    }
  }, [page]);

  // ── Online Status — Heartbeat every 4 minutes (tab-visible only) ──────
  // Fires only when the tab is in the foreground to save Firebase quota.
  // Clears automatically when student logs out (student changes to null/teacher).
  useEffect(() => {
    if (!student || student.role === 'teacher' || student.isDemo) return;

    // Mark active immediately on login
    updateLastActive(student.id);

    const HEARTBEAT_MS = 4 * 60 * 1000; // 4 minutes
    const interval = setInterval(() => {
      // Only write to Firebase when the tab is actually visible
      if (document.visibilityState === 'visible') {
        updateLastActive(student.id);
      }
    }, HEARTBEAT_MS);

    return () => clearInterval(interval);
  }, [student?.id]); // eslint-disable-line react-hooks/exhaustive-deps


  // ── Derived state ────────────────────────────────────────
  const questProgress = student?.questProgress || {};
  const unlockedQuests = getUnlockedQuests(questProgress, student);
  const xpInfo = xpToNextLevel(student?.xp || 0);

  const handleProcessReviewAnswer = useCallback(async (studentId, questionId, isCorrect) => {
    if (!student) return;
    const updated = await processReviewAnswer(studentId, questionId, isCorrect);
    if (updated) {
      setStudent(updated);
    }
    return updated;
  }, [student]);

  const viewFinalExamReport = useCallback((result = null) => {
    const existing = result || (student?.id ? getFinalExamResult(student.id) : null);
    if (existing) {
      setLastFinalExamAttempt(existing);
      setPage('final-exam-report');
    } else {
      navigate('arena');
    }
  }, [student, navigate]);

  const ctx = {
    page, navigate,
    student, setStudent,
    currentQuest, setCurrentQuest,
    questProgress, unlockedQuests,
    xpInfo,
    addXP, completeQuest, completePreTest,
    saveMistake, processReviewAnswer: handleProcessReviewAnswer,
    handleLogin, handleTeacherLogin, handleLogout,
    showToast, unlockBadge, checkBadges,
    viewFinalExamReport
  };

  const showNav = SHOW_NAV_PAGES.includes(page) && student && student.role !== 'teacher';

  return (
    <AppContext.Provider value={ctx}>
      {/* Adventure background */}
      <div className="bg-stars" />

      {/* Main content */}
      <div className="relative z-10" style={{ paddingBottom: showNav ? '72px' : '0' }}>
        {/* Public pages */}
        {page === 'landing'        && <LandingPage />}
        {page === 'student-login'  && <StudentLoginPage />}
        {page === 'teacher-login'  && <TeacherLoginPage />}

        {/* Student pages */}
        {page === 'pretest'        && student && student.role !== 'teacher' && <PreTestPage />}
        {page === 'map'            && student && student.role !== 'teacher' && <QuestMap />}
        {page === 'mission-select' && student && currentQuest && student.role !== 'teacher' && <MissionSelect />}
        {page === 'game'           && student && currentMission && student.role !== 'teacher' && (
          <GameMissionRouter
            mission={currentMission}
            onComplete={async (xpEarned) => {
              await addXP(xpEarned, `🎮 ${currentMission.title}`);
              setPage('mission-select');
              window.scrollTo(0, 0);
            }}
            onBack={() => { setPage('mission-select'); window.scrollTo(0, 0); }}
          />
        )}
        {page === 'technique-hub'  && student && <TechniqueHub onBack={() => setPage('map')} />}
        {page === 'vocab-drill'    && student && <VocabDrillHub onBack={() => setPage('map')} onAddXP={addXP} />}
        {page === 'real-simulator' && student && <RealOnetSimulator student={student} onBack={() => setPage('map')} onAddXP={addXP} />}
        {page === 'lesson'    && student && currentQuest && student.role !== 'teacher' && <MiniLesson questId={currentQuest} />}
        {page === 'quiz'      && student && currentQuest && student.role !== 'teacher' && <QuizPage questId={currentQuest} />}
        {page === 'badge'     && student && student.role !== 'teacher' && <BadgePage />}
        {page === 'ranking'   && student && <RankingPage />}
        {page === 'report'    && student && student.role !== 'teacher' && <StudentReport />}
        {page === 'review'    && student && student.role !== 'teacher' && <ReviewMistakePage />}
        {page === 'finalboss' && student && student.role !== 'teacher' && <FinalBoss />}
        
        {/* Chapter 4 (O-NET Arena) */}
        {page === 'multiplayer-arena' && student && student.role !== 'teacher' && <MultiplayerArena />}
        {page === 'heads-up' && student && student.role !== 'teacher' && <HeadsUpCharades />}
        {page === 'arena'       && student && student.role !== 'teacher' && <OnetArena 
                                      student={student} 
                                      onBack={() => setPage('map')}
                                      onStartExam={(missionId) => {
                                        setCurrentQuest(missionId);
                                        setPage('exam');
                                      }}
                                      onStartFinalExam={() => navigate('final-exam', 'final_exam')}
                                    />}
        {page === 'exam'        && student && currentQuest && student.role !== 'teacher' && <ExamMode 
                                      missionId={currentQuest}
                                      student={student}
                                      onCancel={() => setPage('arena')}
                                      onFinish={(attempt) => {
                                        import('./utils/arenaStorage').then(({ saveArenaAttempt }) => {
                                          saveArenaAttempt(student.id, attempt);
                                          setLastAttempt(attempt);
                                          setPage('exam-report');
                                        });
                                      }}
                                    />}
        {page === 'final-exam'  && student && currentQuest === 'final_exam' && student.role !== 'teacher' && <ExamMode 
                                      missionId="final_exam"
                                      student={student}
                                      onCancel={() => setPage('map')}
                                      onFinish={(attempt) => {
                                        import('./utils/arenaStorage').then(({ saveFinalExamResult }) => {
                                          const saved = saveFinalExamResult(student.id, attempt);
                                          setLastFinalExamAttempt(saved || attempt);
                                          setPage('final-exam-report');
                                        });
                                      }}
                                    />}
        {page === 'exam-report' && student && lastAttempt && student.role !== 'teacher' && <ExamReport 
                                      attempt={lastAttempt}
                                      onBackToArena={() => setPage('arena')}
                                    />}
        {page === 'final-exam-report' && student && lastFinalExamAttempt && student.role !== 'teacher' && <FinalExamReport
                                      attempt={lastFinalExamAttempt}
                                      student={student}
                                      onBack={() => setPage('arena')}
                                    />}

        {/* Teacher & Super Admin pages */}
        {page === 'teacher' && (student?.authVerified && ['teacher', 'super_admin'].includes(student?.role)
          ? <TeacherDashboard /> : <TeacherLoginPage />)}
        {page === 'super-admin' && (student?.authVerified && student?.role === 'super_admin'
          ? <SuperAdminDashboard /> : <TeacherLoginPage />)}
      </div>

      {/* Bottom Navigation */}
      {showNav && <Navigation />}

      {/* BGM Toggle */}
      {student?.role === 'student' && !['landing', 'student-login', 'teacher-login'].includes(page) && <BGMToggle />}

      {/* Overlays */}
      {toast && <XPToast message={toast} />}
      
      {/* Level Up Modal */}
      {levelUpMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setLevelUpMsg(null)}>
          <div className="bg-gradient-to-b from-indigo-900 to-purple-900 p-8 rounded-3xl text-center border-4 border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.3)] max-w-sm w-full animate-bounce-in">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-2">
              LEVEL UP!
            </h2>
            <div className="text-6xl my-6">⭐</div>
            <p className="text-2xl text-white font-bold mb-6">
              Level {levelUpMsg.level}
            </p>
            <button className="w-full py-3 bg-yellow-400 hover:bg-yellow-300 text-purple-900 font-bold rounded-xl text-lg">
              เยี่ยมยอด!
            </button>
          </div>
        </div>
      )}

      {/* Badge Unlocked Modal */}
      {newEarnedBadges.length > 0 && (
        <BadgeModal 
          badge={newEarnedBadges[0]} 
          badges={newEarnedBadges}
          onClose={closeBadgeModal} 
        />
      )}

      {/* Daily Streak Reward Modal — shows first, before rank modal */}
      {dailyReward && (
        <DailyRewardModal
          streakDays={dailyReward.streakDays}
          onClaim={handleDailyRewardClaim}
        />
      )}

      {/* Rank Watcher & Toasts */}
      <RankWatcher 
        student={student}
        onLoginRank={setLoginRank}
        onRankShift={setRankShift}
      />
      {/* LoginRankModal waits until daily reward is dismissed */}
      {!dailyReward && (
        <LoginRankModal 
          rank={loginRank?.rank} 
          total={loginRank?.total} 
          onClose={() => setLoginRank(null)} 
        />
      )}
      <RankShiftToast 
        shift={rankShift} 
        onClose={() => setRankShift(null)} 
      />
    </AppContext.Provider>
  );
}
