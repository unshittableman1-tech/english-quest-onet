import { useState, useEffect, createContext, useContext, useCallback, useRef, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import LandingPage from './components/LandingPage';
import StudentLoginPage from './components/StudentLoginPage';
import TeacherLoginPage from './components/TeacherLoginPage';
import QuestMap from './components/QuestMap';
import AvatarSessionSync from './components/AvatarSessionSync';
import Navigation from './components/Navigation';
import XPToast from './components/XPToast';

// Lazy-loaded components for optimal initial payload & classroom concurrency
const PreTestPage = lazy(() => import('./components/PreTestPage'));
const Chapter3LearningPage = lazy(() => import('./components/Chapter3LearningPage'));
const MiniLesson = lazy(() => import('./components/MiniLesson'));
const QuizPage = lazy(() => import('./components/QuizPage'));
const BadgePage = lazy(() => import('./components/BadgePage'));
const StudentReport = lazy(() => import('./components/StudentReport'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const FinalBoss = lazy(() => import('./components/FinalBoss'));
const ReviewMistakePage = lazy(() => import('./components/ReviewMistakePage'));
const RankingPage = lazy(() => import('./components/RankingPage'));
const OnetArena = lazy(() => import('./components/OnetArena'));
const OfficialOnetPage = lazy(() => import('./components/OfficialOnetPage'));
const HeadsUpCharades = lazy(() => import('./components/HeadsUpCharades'));
const ExamMode = lazy(() => import('./components/ExamMode'));
const ExamReport = lazy(() => import('./components/ExamReport'));
const MissionSelect = lazy(() => import('./components/MissionSelect'));
const GameMissionRouter = lazy(() => import('./components/games/GameMissionRouter'));
const TechniqueHub = lazy(() => import('./components/TechniqueHub'));
const VocabDrillHub = lazy(() => import('./components/VocabDrillHub'));
const RealOnetSimulator = lazy(() => import('./components/RealOnetSimulator'));
const FinalExamReport = lazy(() => import('./components/FinalExamReport'));
const SuperAdminDashboard = lazy(() => import('./components/SuperAdminDashboard'));
const SchoolAdminDashboard = lazy(() => import('./components/SchoolAdminDashboard'));
import AcceptInvitationModal from './components/AcceptInvitationModal';
import OwnerActivationPage from './components/OwnerActivationPage';
import {
  getCurrentStudent, updateCurrentStudent, clearCurrentStudent,
  saveStudent, addXP as storageAddXP, saveQuestResult, awardBadge, savePreTest,
  saveMistake as storageSaveMistake, processReviewAnswer, updateBadgeStats, updateLastActive, setOffline,
} from './utils/storage';
import {
  calcLevel, XP_RULES, getUnlockedQuests, xpToNextLevel, getStreakReward,
} from './utils/scoring';
import { playLevelUpSound } from './utils/audio';
import BGMToggle from './components/BGMToggle';
import BadgeModal from './components/BadgeModal';
import { BADGES, checkUnlockedBadges } from './data/badges';
import { getAccessibleGameMission, isQuestAccessible } from './utils/missionAccess';
import { getFinalExamResult, mergeArenaStatsFromCloud } from './utils/arenaStorage';
import LoginRankModal from './components/ranking/LoginRankModal';
import RankShiftToast from './components/ranking/RankShiftToast';
import RankWatcher from './components/ranking/RankWatcher';
import DailyRewardModal from './components/DailyRewardModal';
import { supabase } from './config/supabase';
import { createMembershipService, createStaffSession } from './utils/membership';
import { isDemoMode, supabaseConfig } from './config/runtimeMode';
import { verifyChapter3StudentEligibility, chapter3EligibilityError } from './utils/chapter3Eligibility';
import { fetchServerStudentProfile } from './utils/studentProgressApi';
import { createDemoStudent } from './data/demoFixtures';
import { buildGameMissionRewardProgress } from './utils/gameMissionRewards';
import { buildDemoQuestProgress } from './utils/demoQuestProgress';
const DemoAdventureHub = lazy(() => import('./components/demo/DemoAdventureHub'));
import { isDemoPath, DEMO_CONFIG } from './config/demoConfig';
import { getGuestDemoSession, isGuestDemoSession, clearGuestDemoSession, addDemoXPToSession, saveGuestDemoSession } from './utils/demoSession';
import { restoreStudentSession } from './utils/studentAuth';
import { requestDailyCheckin, celebrateCheckin } from './utils/dailyCheckin';
import { canAccessPage, getSessionRole } from './utils/roleAccess';
import { readSchoolEntry } from './utils/schoolEntry';
import { getQuestReviewBlocker, recordQuestMistake, reviewQuestMistake } from './utils/questReviewGate';

const membershipService = createMembershipService(supabase);

// ── App Context ──────────────────────────────────────────────
export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Pages that show bottom nav
const SHOW_NAV_PAGES = ['map', 'vocab-drill', 'badge', 'report', 'review', 'ranking'];


function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
      <div className="text-center p-6">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">กำลังเตรียมความพร้อม...</p>
      </div>
    </div>
  );
}

export default function App() {
  const ownerActivationRequested = typeof window !== 'undefined'
    && new URLSearchParams(window.location.search).get('owner_activation') === '1';
  const [page, setPage]               = useState('landing');
  const [mapView, setMapView]         = useState('lessons');
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
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [rankRefresh, setRankRefresh] = useState(0);
  const onboardingRequest = useRef(0);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const [pendingInvitationToken, setPendingInvitationToken] = useState(null);
  const [chapter3Check, setChapter3Check] = useState(null);
  const [chapter3CheckRequest, setChapter3CheckRequest] = useState(0);

  useEffect(() => {
    if (!student?.id || student?.isDemo || student?.role !== 'student' || !['127.0.0.1', 'localhost'].includes(window.location.hostname)) {
      setChapter3Check(null);
      return;
    }
    if (page !== 'map') return;
    let active = true;
    let refreshing = false;
    const controllers = new Set();
    const studentId = student.id;
    const refresh = async () => {
      if (refreshing || document.visibilityState === 'hidden') return;
      refreshing = true;
      const controller = new AbortController();
      controllers.add(controller);
      const timeout = setTimeout(() => controller.abort(), 10000);
      setChapter3Check({ studentId, loading: true, status: null, error: '' });
      try {
        const { data } = await supabase.auth.getSession();
        const verified = await verifyChapter3StudentEligibility({ studentId, session: data?.session, fetchProfile: fetchServerStudentProfile, url: supabaseConfig.url, apikey: supabaseConfig.anonKey, signal: controller.signal });
        if (active && studentRef.current?.id === studentId) {
          setChapter3Check({ studentId, loading: false, status: verified.status, error: '' });
          if (studentRef.current.authVerified !== true) setStudent(current => current?.id === studentId ? { ...current, authVerified: true, ...(verified.authUserId ? { auth_user_id: verified.authUserId } : {}) } : current);
        }
      } catch (caught) {
        if (active && studentRef.current?.id === studentId) setChapter3Check({ studentId, loading: false, status: null, error: chapter3EligibilityError(caught.message), code: caught.message });
      } finally {
        clearTimeout(timeout);
        controllers.delete(controller);
        refreshing = false;
      }
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      controllers.forEach(controller => controller.abort());
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [page, student?.id, student?.authVerified, student?.isDemo, student?.role, chapter3CheckRequest]);

  // Load saved session on mount. Staff sessions must be re-verified with Supabase.
  useEffect(() => {
    let active = true;
    if (typeof window !== 'undefined' && (isDemoPath(window.location.pathname, window.location.search) || isDemoMode)) {
      const demo = getGuestDemoSession();
      setStudent(demo);
      setPage('demo');
      return () => { active = false; };
    }
    const urlParams = new URLSearchParams(window.location.search);
    const routeParam = urlParams.get('route');
    const schoolEntry = readSchoolEntry(window.location);
    const invitationToken = urlParams.get('invitation_token');

    if (invitationToken) {
      // SECURITY (Phase 1F & 2C): Scrub invitation token immediately from the address bar
      // to eliminate Referer leakage, browser history persistence, and shoulder-surfing risk.
      // Retain token strictly in React memory state (NEVER in localStorage/sessionStorage/cookies).
      urlParams.delete('invitation_token');
      const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : '';
      const cleanUrl = `${window.location.pathname}${cleanSearch}${window.location.hash}`;
      window.history.replaceState({}, document.title, cleanUrl);
      setPendingInvitationToken(invitationToken);
    }

    const saved = getCurrentStudent();
    if (routeParam === 'teacher-login' && !saved) {
      setStudent(null);
      setPage('teacher-login');
      return;
    }
    if ((routeParam === 'student-login' || schoolEntry.kind === 'school') && !saved) {
      setStudent(null);
      setPage('student-login');
      return;
    }
    if (saved) {
      if (saved.isStaff || saved.role === 'teacher' || saved.role === 'super_admin') {
        membershipService.getIdentity()
          .then((identity) => {
            if (!active) return;
            const verifiedSession = createStaffSession(identity, saved.school_membership_id || null);
            localStorage.setItem('eq_onet_current', JSON.stringify(verifiedSession));
            setStudent(verifiedSession);
            const target = verifiedSession.role === 'super_admin'
              ? 'super-admin'
              : 'teacher';
            setPage(target);
          })
          .catch(async () => {
            try { await membershipService.signOut(); } catch { /* local state is still cleared */ }
            if (!active) return;
            clearCurrentStudent();
            setStudent(null);
            setPage('teacher-login');
          });
      } else {
        if (saved.authVerified === true) {
          restoreStudentSession().then((verified) => {
            if (!active) return;
            if (!verified) {
              clearCurrentStudent();
              setStudent(null);
              setPage(schoolEntry.kind === 'school' ? 'student-login' : 'landing');
              return;
            }
            setStudent(verified);
            setPage(verified.preTest != null ? 'map' : 'pretest');
          });
          return () => { active = false; };
        }
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
    if (isDemoMode) return undefined;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== 'SIGNED_OUT' || !studentRef.current?.isStaff) return;
      clearCurrentStudent();
      setStudent(null);
      setPage('teacher-login');
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Navigation ───────────────────────────────────────────
  const navigate = useCallback(async (target, questIdOrMission = null) => {
    if (target === 'demo') {
      const demo = getGuestDemoSession();
      setStudent(demo);
      setPage('demo');
      window.scrollTo(0, 0);
      return;
    }
    if ((studentRef.current?.isGuestDemo || studentRef.current?.isDemo) && ['teacher', 'school-admin', 'super-admin'].includes(target)) {
      showToast('🔒 โหมดทดลองเล่นไม่สามารถเข้าถึงระบบคุณครูหรือข้อมูลโรงเรียนได้');
      return;
    }
    if(target==='exam-hub'){setMapView('exams');setPage('map');window.scrollTo(0,0);return;}
    if(target==='skills-hub'){setMapView('skills');setPage('map');window.scrollTo(0,0);return;}
    if(target==='map')setMapView('lessons');
    if (target === 'multiplayer-arena') {
      showToast('โหมดประลองทีมถูกนำออกแล้ว กรุณาเลือกสนามสอบ O-NET Arena');
      return;
    }
    if (isDemoMode && ['student-login', 'teacher-login', 'teacher', 'super-admin', 'multiplayer-arena'].includes(target)) {
      showToast('Demo Mode แยกจากระบบจริง ฟีเจอร์นี้จึงถูกปิด');
      return;
    }
    let accessibleMission = null;
    const reviewQuestId = target === 'game' ? questIdOrMission?.questId : target === 'finalboss' ? 'finalboss'
      : target === 'final-exam' ? 'final_exam' : ['mission-select', 'chapter3-learning', 'lesson', 'quiz'].includes(target)
        ? typeof questIdOrMission === 'string' ? questIdOrMission : currentQuest : null;
    const reviewBlocker = getQuestReviewBlocker(reviewQuestId, studentRef.current);
    if (reviewBlocker) {
      showToast(`ทบทวนข้อผิด ${reviewBlocker.name} ให้ครบก่อนเปิดด่านถัดไป`);
      return;
    }
    if (target === 'chapter3-learning' && (!studentRef.current || !getUnlockedQuests(studentRef.current.questProgress, studentRef.current)[questIdOrMission] || !['question_words','pronouns_master','tenses_arena','c3_labeling_lab','c3_ordering_quest','c3_graph_comparison'].includes(questIdOrMission))) {
      showToast('ผ่านบทก่อนหน้าและทบทวนข้อผิดก่อนเริ่มภารกิจ');
      return;
    }
    if (target === 'game' || target === 'mission-select') {
      const current = studentRef.current;
      const questId = target === 'game' ? questIdOrMission?.questId : questIdOrMission;
      const access = getUnlockedQuests(current?.questProgress, current, chapter3Check?.studentId === current?.id ? chapter3Check.status || {} : null);
      if (target === 'game') accessibleMission = getAccessibleGameMission(questId, questIdOrMission?.mission?.id, access);
      if (!current || !isQuestAccessible(questId, access)
        || (target === 'game' && !accessibleMission)) {
        showToast('ภารกิจนี้ยังไม่เปิดให้เล่น กลับไปตรวจเงื่อนไขบนแผนที่');
        return;
      }
    }
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
      setCurrentMission(accessibleMission);
      setCurrentQuest(questIdOrMission.questId);
    } else if (questIdOrMission && typeof questIdOrMission === 'string') {
      setCurrentQuest(questIdOrMission);
    }
    setPage(target);
    window.scrollTo(0, 0);
  }, [showToast, chapter3Check, currentQuest]);

  // ── XP System ───────────────────────────────────────────
  const addXP = useCallback(async (amount, reason = '') => {
    const current = studentRef.current;
    if (!current || !Number.isFinite(amount)) return;
    let leveledUp = false;
    let newLevel = current.level || 1;

    if (current.isGuestDemo) {
      const { session: updated, leveledUp: didLevelUp, newLevel: lvl } = addDemoXPToSession(current, amount);
      setStudent(updated);
      leveledUp = didLevelUp;
      newLevel = lvl;
    } else if (current.isDemo) {
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
    if (badge.xpReward && student.authVerified !== true) {
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
    if (!student) return;
    // Check against latest student data
    const currentData = getCurrentStudent() || student;
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
    let wasAlreadyPassed = student.questProgress?.[questId]?.passed;

    let result = {};
    if (!student.isDemo) {
      result = await saveQuestResult(student.id, questId, score, total, extraStats);
      const updated = await updateCurrentStudent({ questProgress: result });
      setStudent(updated);
    } else {
      // Demo: update in-memory only
      const current = studentRef.current;
      if (!current?.isDemo || current.id !== student.id) return;
      wasAlreadyPassed = current.questProgress?.[questId]?.passed;
      result = buildDemoQuestProgress(current, questId, score, total, extraStats);
      const updated = { ...current, questProgress: result };
      if (current.isGuestDemo) {
        saveGuestDemoSession(updated);
      }
      setStudent(updated);
    }

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

  const completeGameMission = useCallback(async (questId, mission, xpEarned) => {
    const current = studentRef.current;
    if (!current || !questId || !mission?.id) return;

    const reward = buildGameMissionRewardProgress(current, questId, mission, xpEarned);
    if (current.isDemo) {
      setStudent({ ...current, questProgress: reward.questProgress });
    } else {
      const updated = await updateCurrentStudent({ questProgress: reward.questProgress });
      if (updated && studentRef.current?.id === current.id) setStudent(updated);
    }

    if (reward.awardedXP > 0) {
      await addXP(reward.awardedXP, `Game Mission: ${mission.title}`);
    } else if (reward.alreadyClaimed) {
      showToast('ฝึกซ้ำสำเร็จ · Mission นี้รับ XP ไปแล้ว');
    } else {
      showToast('จบการฝึกแล้ว · รอบนี้ไม่ได้รับ XP');
    }
  }, [addXP, setStudent, showToast]);

  // ── Daily Reward Claim ────────────────────────────────────
  const loadDailyReward = useCallback(async (s) => {
    const request = ++onboardingRequest.current;
    setDailyReward({ streakDays: 1, loading: true });
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const status = await requestDailyCheckin(supabase, { studentId: s.id });
        if (request !== onboardingRequest.current || studentRef.current?.id !== s.id) return;
        setDailyReward(status.claimed ? null : status);
        return;
      }
    } catch (error) {
      // Server checkin unavailable, fallback to local daily checkin
    }

    if (request !== onboardingRequest.current || studentRef.current?.id !== s.id) return;
    const current = studentRef.current || s;
    const today = new Date().toLocaleDateString('en-CA');
    const stats = current.badgeStats || {};
    if (stats.lastRewardClaimedDate === today) {
      setDailyReward(null);
      return;
    }
    const streakDays = Math.max(1, stats.streakDays || 1);
    const reward = getStreakReward(streakDays);
    setDailyReward({
      studentId: current.id,
      streakDays,
      rewardXP: reward.xp,
      earnedXP: 0,
      claimed: false,
      loading: false,
      error: '',
    });
  }, []);

  const handleDailyRewardClaim = useCallback(async () => {
    const current = studentRef.current;
    if (!current?.authVerified || current.isDemo) throw new Error('กรุณาเข้าสู่ระบบนักเรียนก่อนรับรางวัล');
    const request = onboardingRequest.current;
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const receipt = await requestDailyCheckin(supabase, { claim: true, studentId: current.id });
        if (request !== onboardingRequest.current || studentRef.current?.id !== current.id) throw new Error('เซสชันเปลี่ยนแล้ว กรุณาเข้าสู่ระบบอีกครั้ง');
        const updated = { ...studentRef.current, xp: receipt.xp, level: receipt.level, badgeStats: receipt.badgeStats };
        setLoginRank({ loading: true });
        setRankRefresh(value => value + 1);
        localStorage.setItem('eq_onet_current', JSON.stringify(updated));
        setStudent(updated);
        return receipt;
      }
    } catch (err) {
      console.warn('[dailyReward] Server claim failed, using fallback reward claim:', err);
    }

    // Local / fallback claim
    const today = new Date().toLocaleDateString('en-CA');
    const stats = current.badgeStats || {};
    const streakDays = Math.max(1, stats.streakDays || 1);
    const reward = getStreakReward(streakDays);
    const earnedXP = reward.xp;
    const newXP = (current.xp || 0) + earnedXP;
    const newLevel = calcLevel(newXP);
    const newBadgeStats = {
      ...stats,
      streakDays,
      lastLoginDate: today,
      lastRewardClaimedDate: today,
    };
    const updated = {
      ...current,
      xp: newXP,
      level: newLevel,
      badgeStats: newBadgeStats,
    };
    await saveStudent(updated);
    setLoginRank({ loading: true });
    setRankRefresh(value => value + 1);
    setStudent(updated);
    return {
      studentId: current.id,
      streakDays,
      rewardXP: reward.xp,
      earnedXP,
      xp: newXP,
      level: newLevel,
      badgeStats: newBadgeStats,
      claimed: true,
    };
  }, [setStudent]);

  const completeDailyReward = useCallback((receipt) => {
    if (studentRef.current?.id !== receipt.studentId) return;
    setDailyReward(null);
    setWelcomeOpen(true);
    if (receipt.earnedXP > 0) {
      showToast(`+${receipt.earnedXP} XP (รางวัลเช็คอินประจำวัน!)`);
      celebrateCheckin(confetti);
    } else showToast('รับรางวัลวันนี้แล้ว · คะแนนล่าสุดอัปเดตเรียบร้อย');
  }, [showToast]);

  // ── Student Login (from StudentLoginPage) ─────────────────
  const handleLogin = useCallback((s) => {
    setStudent(s);
    setLoginRank(null);
    setWelcomeOpen(!s.isDemo);
    const hasPreTest = s.preTest != null;
    navigate(hasPreTest ? 'map' : 'pretest');
    if (!s.isDemo && s.authVerified) {
      loadDailyReward(s);
      mergeArenaStatsFromCloud(s.id).catch(() => {});
    }
  }, [navigate, loadDailyReward, setStudent]);

  // ── Teacher Login ─────────────────────────────────────────
  const handleTeacherLogin = useCallback((verifiedSession) => {
    if (!verifiedSession?.authVerified || !verifiedSession?.isStaff
        || !['teacher', 'super_admin'].includes(verifiedSession.role)) {
      throw new Error('Unverified staff session');
    }
    localStorage.setItem('eq_onet_current', JSON.stringify(verifiedSession));
    setStudent(verifiedSession);
    const target = verifiedSession.role === 'super_admin'
      ? 'super-admin'
      : 'teacher';
    navigate(target);
  }, [navigate]);

  // ── Demo Mode ─────────────────────────────────────────────
  const handleDemoLogin = useCallback(() => {
    const demo = getGuestDemoSession();
    setStudent(demo);
    setPage('demo');
    showToast('🎮 Public Demo Mode — ทดลองเล่นฟรี');
  }, [showToast, setStudent]);

  // ── Logout ──────────────────────────────────────────────
  const handleLogout = useCallback(async () => {
    ++onboardingRequest.current;
    setDailyReward(null);
    setWelcomeOpen(false);
    setLoginRank(null);
    if (student?.isStaff) {
      try { await membershipService.signOut(); } catch { /* clear local access regardless */ }
    } else if (student && student.id && student.role !== 'teacher' && !student.isDemo) {
      try { setOffline(student.id); } catch {}
      try {
        const { logoutStudent } = await import('./utils/studentAuth');
        await logoutStudent();
      } catch {}
    }
    clearCurrentStudent();
    setStudent(null);
    setCurrentQuest(null);
    navigate('landing');
  }, [navigate, student]);

  // Handle navigate to demo from landing page
  useEffect(() => {
    if (page === 'demo') {
      if (!studentRef.current?.isGuestDemo) {
        setStudent(getGuestDemoSession());
      }
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
  const chapter3EligibilityCheck = chapter3Check?.studentId === student?.id ? chapter3Check : null;
  const unlockedQuests = getUnlockedQuests(questProgress, student, chapter3EligibilityCheck ? chapter3EligibilityCheck.status || {} : null);
  const xpInfo = xpToNextLevel(student?.xp || 0);

  const handleSaveMistake = useCallback(async (studentId, question) => {
    const current = studentRef.current;
    if (!current || current.id !== studentId) return;
    const updatedMistakes = recordQuestMistake(current.mistakeBank || {}, question);
    const updated = { ...current, mistakeBank: updatedMistakes };
    if (current.isGuestDemo) {
      saveGuestDemoSession(updated);
    }
    setStudent(updated);
    if (current.isDemo) return;
    try {
      await storageSaveMistake(studentId, question);
    } catch {
      showToast('ยังบันทึกข้อผิดไม่ได้ กรุณาเชื่อมต่อแล้วลองใหม่ ด่านถัดไปยังล็อกอยู่');
    }
  }, [setStudent, showToast]);

  const handleProcessReviewAnswer = useCallback(async (studentId, questionId, isCorrect) => {
    const current = studentRef.current;
    if (!current || current.id !== studentId) return;
    if (current.isDemo) {
      const updated = { ...current, mistakeBank: reviewQuestMistake(current.mistakeBank || {}, questionId, isCorrect) };
      if (current.isGuestDemo) {
        saveGuestDemoSession(updated);
      }
      setStudent(updated);
      return updated;
    }
    const updated = await processReviewAnswer(studentId, questionId, isCorrect);
    if (updated && studentRef.current?.id === studentId) {
      setStudent(updated);
    }
    return updated;
  }, [setStudent]);

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
    chapter3EligibilityCheck, refreshChapter3Eligibility: () => setChapter3CheckRequest(previous => previous + 1),
    xpInfo,
    addXP, completeQuest, completePreTest,
    saveMistake: handleSaveMistake, processReviewAnswer: handleProcessReviewAnswer,
    handleLogin, handleTeacherLogin, handleLogout,
    showToast, unlockBadge, checkBadges,
    viewFinalExamReport,
    isDemoMode,
  };

  const sessionRole = getSessionRole(student);
  const isStudentSession = sessionRole === 'student';
  const showNav = SHOW_NAV_PAGES.includes(page) && isStudentSession && !student?.isGuestDemo;
  const previousPage = useRef(page);
  useEffect(() => {
    if (previousPage.current !== page) document.getElementById('app-content')?.focus({ preventScroll: true });
    previousPage.current = page;
  }, [page]);

  if (ownerActivationRequested) return <OwnerActivationPage />;

  return (
    <AppContext.Provider value={ctx}>
      <AvatarSessionSync />
      <a className="app-skip-link" href="#app-content">ข้ามไปเนื้อหา</a>
      {isDemoMode && (
        <div className="app-demo-banner bg-amber-300 text-amber-950 text-center text-sm font-bold py-1.5 px-3 shadow" role="status">
          Demo Mode · ใช้ข้อมูลสังเคราะห์ · ไม่เชื่อมต่อฐานข้อมูลจริง
        </div>
      )}
      {/* Adventure background */}
      <div className="bg-stars" />

      {/* Main content */}
      <div id="app-content" tabIndex={-1} className={`relative z-10 app-page-content ${showNav ? 'has-bottom-navigation' : ''} ${page === 'ranking' ? 'is-ranking-page' : ''}`}>
        <Suspense fallback={<PageLoadingFallback />}>
        {/* Public pages */}
        {page === 'landing'        && <LandingPage />}
        {page === 'student-login'  && <StudentLoginPage />}
        {page === 'teacher-login'  && <TeacherLoginPage />}
        {page === 'demo'           && (
          <DemoAdventureHub
            onNavigateOfficial={(target) => {
              if (target === 'student-login') {
                setStudent(null);
                setPage('student-login');
              } else if (target === 'teacher-login') {
                setStudent(null);
                setPage('teacher-login');
              } else {
                setPage('landing');
              }
            }}
            onToast={(msg) => showToast(msg)}
          />
        )}

        {/* Student pages */}
        {page === 'pretest'        && isStudentSession && <PreTestPage />}
        {page === 'map'            && isStudentSession && <QuestMap initialView={mapView} />}
        {page === 'onet-2569'      && isStudentSession && <OfficialOnetPage student={student} onBack={()=>navigate('exam-hub')} />}
        {page === 'chapter3-learning' && isStudentSession && currentQuest && <Chapter3LearningPage key={currentQuest} missionId={currentQuest} />}
        {page === 'mission-select' && isStudentSession && currentQuest && <MissionSelect />}
        {page === 'game'           && isStudentSession && currentMission && (
          <GameMissionRouter
            mission={currentMission}
            onComplete={async (xpEarned) => {
              await completeGameMission(currentQuest, currentMission, xpEarned);
              setPage('mission-select');
              window.scrollTo(0, 0);
            }}
            onBack={() => { setPage('mission-select'); window.scrollTo(0, 0); }}
          />
        )}
        {page === 'technique-hub'  && isStudentSession && <TechniqueHub onBack={() => { setMapView('skills'); setPage('map'); }} />}
        {page === 'vocab-drill'    && isStudentSession && <VocabDrillHub onBack={() => { setMapView('skills'); setPage('map'); }} onAddXP={addXP} initialQuestId={currentQuest} />}
        {page === 'real-simulator' && isStudentSession && <RealOnetSimulator student={student} onBack={() => setPage('map')} onAddXP={addXP} />}
        {page === 'lesson'    && isStudentSession && currentQuest && <MiniLesson questId={currentQuest} />}
        {page === 'quiz'      && isStudentSession && currentQuest && <QuizPage questId={currentQuest} />}
        {page === 'badge'     && isStudentSession && <BadgePage />}
        {page === 'ranking'   && isStudentSession && <RankingPage />}
        {page === 'report'    && isStudentSession && <StudentReport />}
        {page === 'review'    && isStudentSession && <ReviewMistakePage />}
        {page === 'finalboss' && isStudentSession && <FinalBoss />}
        
        {/* Chapter 4 (O-NET Arena) */}
        {page === 'heads-up' && isStudentSession && <HeadsUpCharades />}
        {page === 'arena'       && isStudentSession && <OnetArena 
                                      student={student} 
                                      onBack={() => setPage('map')}
                                      onStartExam={(missionId) => {
                                        setCurrentQuest(missionId);
                                        setPage('exam');
                                      }}
                                      onStartFinalExam={() => navigate('final-exam', 'final_exam')}
                                    />}
        {page === 'exam'        && isStudentSession && currentQuest && <ExamMode 
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
        {page === 'final-exam'  && isStudentSession && currentQuest === 'final_exam' && <ExamMode 
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
        {page === 'exam-report' && isStudentSession && lastAttempt && <ExamReport 
                                      attempt={lastAttempt}
                                      onBackToArena={() => setPage('arena')}
                                    />}
        {page === 'final-exam-report' && isStudentSession && lastFinalExamAttempt && <FinalExamReport
                                      attempt={lastFinalExamAttempt}
                                      student={student}
                                      onBack={() => setPage('arena')}
                                    />}

        {/* Teacher & Super Admin pages */}
        {page === 'teacher' && (canAccessPage(student, 'teacher')
          ? <TeacherDashboard /> : <TeacherLoginPage />)}
        {page === 'school-admin' && (canAccessPage(student, 'school-admin')
          ? (student?.role === 'super_admin' ? <SchoolAdminDashboard onBackToTeacher={() => setPage('teacher')} /> : <TeacherDashboard initialTab="student_management" />) : <TeacherLoginPage />)}
        {page === 'super-admin' && (canAccessPage(student, 'super-admin')
          ? <SuperAdminDashboard /> : <TeacherLoginPage />)}
              </Suspense></div>

      {/* Bottom Navigation */}
      {showNav && <Navigation />}

      {/* BGM Toggle */}
      {student?.role === 'student' && !['landing', 'student-login', 'teacher-login', 'demo'].includes(page) && <BGMToggle aboveNavigation={showNav} />}

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
          showXpReward={student?.authVerified !== true}
          onClose={closeBadgeModal} 
        />
      )}

      {/* Daily Streak Reward Modal — shows first, before rank modal */}
      {dailyReward && (
        <DailyRewardModal
          streakDays={dailyReward.streakDays}
          loading={dailyReward.loading}
          error={dailyReward.error}
          onClaim={handleDailyRewardClaim}
          onComplete={completeDailyReward}
          onRetry={() => loadDailyReward(studentRef.current)}
          onSkip={() => { ++onboardingRequest.current; setDailyReward(null); }}
        />
      )}

      {/* Rank Watcher & Toasts */}
      {isStudentSession && <RankWatcher
        student={student}
        refreshToken={rankRefresh}
        onLoginRank={setLoginRank}
        onRankShift={setRankShift}
      />}
      {/* LoginRankModal waits until daily reward is dismissed */}
      {isStudentSession && !dailyReward && welcomeOpen && (
        <LoginRankModal 
          open
          loading={loginRank?.loading}
          rank={loginRank?.rank} 
          total={loginRank?.total} 
          onClose={() => { setLoginRank(null); setWelcomeOpen(false); }}
        />
      )}
      {isStudentSession && <RankShiftToast
        shift={rankShift} 
        onClose={() => setRankShift(null)} 
      />}

      {/* School Admin Invitation Acceptance Modal (Phase 2C) */}
      {pendingInvitationToken && (
        <AcceptInvitationModal
          token={pendingInvitationToken}
          onClose={() => setPendingInvitationToken(null)}
          onSuccess={(verifiedSession) => {
            setPendingInvitationToken(null);
            handleTeacherLogin(verifiedSession);
          }}
          showToast={showToast}
        />
      )}
    </AppContext.Provider>
  );
}
