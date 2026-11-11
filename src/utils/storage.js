import { supabase } from '../config/supabase';
import { getPreTestResult } from './preTestResult';
import { calcLevel, calculateRankScore, getRankingTier } from './scoring';
import { validateAssessmentEvidence } from './assessmentEvidence';
import { isDemoMode, supabaseConfig } from '../config/runtimeMode';
import { createDemoStudent, DEMO_RANKING_STUDENTS } from '../data/demoFixtures';
import { submitQuestToServer, addXPToServer, syncStudentProgressToServer } from './studentProgressApi';
import { recordQuestMistake, reviewQuestMistake } from './questReviewGate';
import { normalizeClassName } from './studentImportFile';

const PREFIX = 'eq_onet_';

// ── Local Session Helpers ─────────────────────────────────────
export function getCurrentStudent() {
  try {
    const s = localStorage.getItem(`${PREFIX}current`);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

export function clearCurrentStudent() {
  localStorage.removeItem(`${PREFIX}current`);
}

// ── Online Status (Heartbeat) ─────────────────────────────────
export async function updateLastActive(studentId) {
  if (!studentId || studentId.startsWith('teacher') || studentId === 'demo_student') return;
  try {
    await supabase.from('students').update({ lastActive: new Date().toISOString() }).eq('id', studentId);
  } catch (error) {
    console.error("Error updating last active:", error);
  }
}

export async function setOffline(studentId) {
  if (!studentId || studentId.startsWith('teacher') || studentId === 'demo_student') return;
  try {
    await supabase.from('students').update({ lastActive: null }).eq('id', studentId);
  } catch (error) {
    console.error("Error setting offline status:", error);
  }
}

// ── Daily Login Streak Reward ─────────────────────────────────
/**
 * Checks if the student has an unclaimed daily reward for today.
 * Returns { streakDays } if reward is available, null otherwise.
 * Demo users and teachers never get rewards.
 */
export function checkDailyReward(student) {
  if (!student || student.isDemo || student.role === 'teacher') return null;
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const stats = student.badgeStats || {};
  // Block if already claimed today
  if (stats.lastRewardClaimedDate === today) return null;
  // Must have a valid streak (badgeStats populated = has logged in today)
  if (!stats.streakDays || stats.streakDays < 1) return null;
  return { streakDays: stats.streakDays };
}

/**
 * Marks today's daily reward as claimed so it won't show again on reload.
 */
export async function markDailyRewardClaimed() {
  const today = new Date().toLocaleDateString('en-CA');
  const current = getCurrentStudent();
  if (!current) return;
  const updatedStats = { ...(current.badgeStats || {}), lastRewardClaimedDate: today };
  await updateCurrentStudent({ badgeStats: updatedStats });
}

// ── Student Profile ───────────────────────────────────────────
export async function saveStudent(studentData) {
  if (studentData.role === 'teacher') {
    // Teachers are just stored locally for session
    localStorage.setItem(`${PREFIX}current`, JSON.stringify(studentData));
    return studentData;
  }

  let current = { ...studentData };
  current = initBadgeStats(current, true);
  current = initRankingStats(current);
  current.updatedAt = new Date().toISOString();
  if (!current.createdAt) current.createdAt = new Date().toISOString();

  if (current.authVerified === true) {
    current.level = calcLevel(current.xp || 0);
    localStorage.setItem(`${PREFIX}current`, JSON.stringify(current));
    return current;
  }

  // If student already has an id
  if (studentData.id && !studentData.id.startsWith('local_')) {
    try {
      const { data: remoteData, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentData.id)
        .maybeSingle();

      if (remoteData) {
        // Deep-merge: remote data wins for stats fields, local session wins for identity
        current = {
          ...remoteData,
          ...current,
          rankingStats: {
            ...remoteData.rankingStats,
            ...(current.rankingStats || {}),
            totalAnswered: Math.max(
              remoteData.rankingStats?.totalAnswered || 0,
              current.rankingStats?.totalAnswered || 0
            ),
            totalCorrect: Math.max(
              remoteData.rankingStats?.totalCorrect || 0,
              current.rankingStats?.totalCorrect || 0
            ),
          },
          badgeStats: { ...(remoteData.badgeStats || {}), ...(current.badgeStats || {}) },
          questProgress: { ...(remoteData.questProgress || {}), ...(current.questProgress || {}) },
          badges: (current.badges?.length || 0) > (remoteData.badges?.length || 0)
            ? current.badges : (remoteData.badges || []),
          xp: Math.max(remoteData.xp || 0, current.xp || 0),
        };
      }
    } catch (e) {
      console.warn('Could not fetch remote data for merge (using local):', e);
    }

    const correctedLevel = calcLevel(current.xp || 0);
    current.level = correctedLevel;
    current = initBadgeStats(current);
    current = initRankingStats(current);

    // Save to localStorage immediately
    localStorage.setItem(`${PREFIX}current`, JSON.stringify(current));

    // Update Supabase in background (non-blocking)
    supabase.from('students').upsert(current).then(({ error }) => {
      if (error) console.warn('Background Supabase update failed:', error);
    }).catch(e => console.warn('Background Supabase update skipped:', e));

    return current;
  }

  // New student — try to save to Supabase
  try {
    const numberStr = studentData.number?.toString().trim();
    let query = supabase
      .from('students')
      .select('*')
      .eq('class', studentData.class)
      .eq('number', numberStr);

    if (studentData.school_code) {
      query = query.eq('school_code', studentData.school_code);
    }

    const { data: existingList } = await query;

    if (existingList && existingList.length > 0) {
      const existingData = existingList[0];
      const correctedLevel = calcLevel(existingData.xp || 0);
      current = {
        ...existingData,
        ...studentData,
        id: existingData.id,
        name: existingData.name,
        level: correctedLevel,
        xp: Math.max(existingData.xp || 0, studentData.xp || 0),
        rankingStats: {
          totalAnswered: 0,
          totalCorrect: 0,
          fastGuessCount: 0,
          averageTimePerQuestion: 0,
          ...(existingData.rankingStats || {}),
        },
        badgeStats: { ...(existingData.badgeStats || {}), ...(studentData.badgeStats || {}) },
        questProgress: { ...(existingData.questProgress || {}), ...(studentData.questProgress || {}) },
        badges: existingData.badges || [],
        updatedAt: new Date().toISOString()
      };
      current = initBadgeStats(current);
      current = initRankingStats(current);

      supabase.from('students').upsert(current).then(({ error }) => {
        if (error) console.warn('Background update failed:', error);
      });
    } else {
      if (!current.id || current.id.startsWith('local_')) {
        current.id = 'std_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      }
      supabase.from('students').insert(current).then(({ error }) => {
        if (error) console.warn('Background insert failed:', error);
      });
    }
  } catch (error) {
    console.error("Supabase fetch failed:", error);
    if (!current.id) {
      current.id = 'local_' + Date.now(); // Generate local ID if offline
    }
  }

  localStorage.setItem(`${PREFIX}current`, JSON.stringify(current));
  return current;
}

export async function getStudentByClassAndNumber(className, number, schoolCode = null) {
  const numberStr = number.toString().trim();
  const numberNum = parseInt(number, 10);
  const cleanSchoolCode = schoolCode ? schoolCode.toString().trim().toUpperCase() : null;

  try {
    let query = supabase
      .from('students')
      .select('*')
      .eq('class', className);

    const { data, error } = await query;

    if (data && data.length > 0) {
      const match = data.find(d => {
        const matchesNumber = d.number?.toString().trim() === numberStr ||
                              parseInt(d.number, 10) === numberNum;
        if (!matchesNumber) return false;

        // If schoolCode is specified, ensure it matches (or fallback for legacy students without school_code)
        if (cleanSchoolCode) {
          const dCode = (d.school_code || '').toUpperCase();
          const dId = (d.school_id || '').toUpperCase();
          if (dCode && dCode !== cleanSchoolCode) return false;
          if (dId && dId !== cleanSchoolCode && !dCode) return false;
        }
        return true;
      });
      if (match) return match;
    }
  } catch (error) {
    console.error("Student query failed:", error);
  }

  return null;
}

export function initRankingStats(student) {
  const defaultRanking = {
    totalAnswered: 0,
    totalCorrect: 0,
    fastGuessCount: 0,
    averageTimePerQuestion: 0, // in seconds
  };
  return { ...student, rankingStats: { ...defaultRanking, ...(student.rankingStats || {}) } };
}

export async function updateRankingStats(updates) {
  const current = getCurrentStudent();
  if (!current || !current.id) return;

  const currentStats = current.rankingStats || {};
  let newStats = { ...currentStats, ...updates };

  await updateCurrentStudent({ rankingStats: newStats });
  return newStats;
}

export function initBadgeStats(student, isNew = false) {
  const defaultStats = {
    correctBySkill: { vocabulary: 0, signs: 0, directions: 0, conversation: 0, reading: 0, grammar: 0, illness: 0, jobs: 0, food: 0, numbers: 0 },
    mistakesFixed: 0,
    streakDays: 0,
    lastLoginDate: null,
    maxCombo: 0,
    retryCorrectCount: 0,
    failedThenPassed: 0,
    pretestScore: 0,
    posttestScore: 0,
    readingDetailCorrect: 0,
    readingPassagesCompleted: 0,
    grammarBoss: 0,
    bossPassed: 0,
    perfectLevels: 0,
  };

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  let updatedStats = { ...defaultStats, ...(student.badgeStats || {}) };

  // Calculate Streak
  if (updatedStats.lastLoginDate !== today) {
    if (!updatedStats.lastLoginDate) {
      updatedStats.streakDays = 1;
    } else {
      const lastLogin = new Date(updatedStats.lastLoginDate);
      const now = new Date(today);
      const diffTime = Math.abs(now - lastLogin);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        updatedStats.streakDays += 1; // Consecutive day
      } else if (diffDays > 1) {
        updatedStats.streakDays = 1; // Streak broken
      }
    }
    updatedStats.lastLoginDate = today;
  }

  return { ...student, badgeStats: updatedStats };
}

export async function updateBadgeStats(updates) {
  const current = getCurrentStudent();
  if (!current || !current.id) return;

  const currentStats = current.badgeStats || {};
  let newStats = { ...currentStats };

  // Deep merge for nested objects like correctBySkill
  for (const key in updates) {
    if (typeof updates[key] === 'object' && updates[key] !== null && !Array.isArray(updates[key])) {
      newStats[key] = { ...(currentStats[key] || {}), ...updates[key] };
    } else {
      newStats[key] = updates[key];
    }
  }

  await updateCurrentStudent({ badgeStats: newStats });
  return newStats;
}

export async function updateCurrentStudent(updates) {
  const current = getCurrentStudent();
  if (!current) return null;
  
  const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(`${PREFIX}current`, JSON.stringify(updated));
  
  if (current.role !== 'teacher' && current.id && !current.id.startsWith('local_')) {
    (async () => {
      try {
        const session = (await supabase?.auth?.getSession?.())?.data?.session;
        if (session?.access_token) {
          await syncStudentProgressToServer(updates, session.access_token);
        }
      } catch (e) {
        // Fallback or offline
      }
    })();
  }
  
  return updated;
}

// ── In-memory cache for getAllStudents (5 min TTL) ────────────
let _studentsCache = null;
let _studentsCacheTime = 0;
const STUDENTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAllStudents({ forceRefresh = false, throwOnError = false } = {}) {
  if (isDemoMode) {
    const current = getCurrentStudent();
    const demoStudent = current?.isDemo ? current : createDemoStudent();
    return [demoStudent, ...DEMO_RANKING_STUDENTS.map(student => ({ ...student }))];
  }
  const now = Date.now();
  if (!forceRefresh && _studentsCache && (now - _studentsCacheTime) < STUDENTS_CACHE_TTL) {
    return _studentsCache;
  }
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    _studentsCache = (data || []).filter(s => s.id !== '__SYSTEM_EXAM_SESSION__' && s.role !== 'system');
    _studentsCacheTime = now;
    return _studentsCache;
  } catch (err) {
    console.error("Failed to fetch students from Supabase:", err);
    if (throwOnError) throw err;
    return _studentsCache || [];
  }
}

// Invalidate cache (call after write operations that change student list)
export function invalidateStudentsCache() {
  _studentsCache = null;
  _studentsCacheTime = 0;
}

// On-demand online status check for teacher dashboard
// Returns students with lastActive within the past `withinMinutes` minutes.
export async function getStudentsOnlineStatus(withinMinutes = 15) {
  const students = await getAllStudents({ forceRefresh: true });
  const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
  return students
    .filter(s => s.role !== 'teacher' && !s.isDemo)
    .map(s => ({
      id: s.id,
      name: s.name,
      class: s.class,
      number: s.number,
      lastActive: s.lastActive || null,
      isOnline: s.lastActive && s.lastActive >= cutoff,
    }));
}

export async function deleteStudent(studentId) {
  if (!studentId) return;
  await supabase.from('students').delete().eq('id', studentId);
  invalidateStudentsCache();
}

export async function updateStudentAdmin(studentId, updates) {
  if (!studentId) return;
  const dataToUpdate = { ...updates, updatedAt: new Date().toISOString() };
  await supabase.from('students').update(dataToUpdate).eq('id', studentId);
  invalidateStudentsCache();
}

// ── Quest Progress ─────────────────────────────────────────────
export async function saveQuestResult(studentId, questId, score, total, extraStats = {}) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId) return {};
  if (extraStats.assessmentEvidence) validateAssessmentEvidence(extraStats.assessmentEvidence, score, total);

  if (current.authVerified === true && extraStats.assessmentEvidence) {
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData?.session?.access_token;
    if (!accessToken) throw new Error('Student session is unavailable. Please sign in again.');
    const attemptId = extraStats.attemptId || crypto.randomUUID();
    const response = await fetch(`${supabaseConfig.url}/functions/v1/student-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseConfig.anonKey,
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'save-quest', questId, attemptId, extraStats }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload?.ok || !payload?.questProgress) {
      throw new Error(payload?.message || 'Unable to save verified quest progress.');
    }
    const updated = {
      ...current,
      questProgress: payload.questProgress,
      xp: payload.xp,
      level: payload.level,
      badgeStats: payload.badgeStats,
      rankingStats: payload.rankingStats,
      badges: payload.badges,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(`${PREFIX}current`, JSON.stringify(updated));
    return payload.questProgress;
  }

  const progress = current.questProgress || {};
  const pct = Math.round((score / total) * 100);
  const existing = progress[questId] || { roundsPlayed: 0, stars: [], totalScore: 0, totalQuestions: 0 };
  
  // Calculate star for this round
  let star = 0;
  if (pct >= 85) star = 3;
  else if (pct >= 70) star = 2;
  else if (pct >= 50) star = 1;

  const newRounds = (existing.roundsPlayed || 0) + 1;
  const newStars = [...(existing.stars || []), star];
  const newTotalScore = (existing.score || 0) + score;
  const newTotalQuestions = (existing.total || 0) + total;
  const avgPct = Math.min(100, Math.round((newTotalScore / newTotalQuestions) * 100));

  progress[questId] = {
    ...existing,
    score: newTotalScore,
    total: newTotalQuestions,
    pct: avgPct,
    passed: existing.passed || pct >= 70, // Passed if get >= 70%
    best: Math.max(existing.best || 0, avgPct, pct),
    attempts: (existing.attempts || 0) + 1,
    roundsPlayed: newRounds,
    stars: newStars,
    lastPlayed: new Date().toISOString(),
    ...(extraStats.assessmentEvidence ? { lastAssessment: { ...extraStats.assessmentEvidence, completedAt: new Date().toISOString() } } : {}),
  };

  const isNowPassed = progress[questId].passed;
  const wasPassedBefore = existing.passed || false;
  
  let statsUpdates = {};
  if (!wasPassedBefore && isNowPassed && existing.roundsPlayed > 0) {
    statsUpdates.failedThenPassed = (current.badgeStats?.failedThenPassed || 0) + 1;
  }
  if (star === 3) {
    statsUpdates.perfectLevels = (current.badgeStats?.perfectLevels || 0) + 1;
  }
  
  // Chapter 3 / Strategy Stats updates
  if (['question_words', 'sign_detective', 'conversation_rescue', 'map_escape', 'reading_detective'].includes(questId)) {
    if (!current.badgeStats?.strategyQuests) statsUpdates.strategyQuests = { ...current.badgeStats?.strategyQuests };
    if (!statsUpdates.strategyQuests) statsUpdates.strategyQuests = {};
    statsUpdates.strategyQuests[questId] = Math.max(statsUpdates.strategyQuests[questId] || 0, pct);
  }
  
  if (questId === 'strategy_boss' && pct >= 70) {
    statsUpdates.strategyBossPassed = (current.badgeStats?.strategyBossPassed || 0) + 1;
  }
  
  if (extraStats.twoStepBothCorrect !== undefined) {
    statsUpdates.twoStepBothCorrect = (current.badgeStats?.twoStepBothCorrect || 0) + extraStats.twoStepBothCorrect;
    statsUpdates.twoStepMainCorrect = (current.badgeStats?.twoStepMainCorrect || 0) + (extraStats.mainCorrect || 0);
    statsUpdates.twoStepReasonCorrect = (current.badgeStats?.twoStepReasonCorrect || 0) + (extraStats.reasonCorrect || 0);
    statsUpdates.twoStepTotal = (current.badgeStats?.twoStepTotal || 0) + total;
  }
  if (extraStats.noGuessEarned) {
    statsUpdates.noGuessBadgeEarned = (current.badgeStats?.noGuessBadgeEarned || 0) + 1;
  }
  
  await updateCurrentStudent({ questProgress: progress });
  if (Object.keys(statsUpdates).length > 0) {
    await updateBadgeStats(statsUpdates);
  }
  
  return progress;
}

export function getProgress(studentId) {
  const current = getCurrentStudent();
  if (current && current.id === studentId) {
    return current.questProgress || {};
  }
  return {};
}

export function getStrategyKeys(studentId) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId) return 0;
  
  const strategyQuests = ['question_words', 'sign_detective', 'conversation_rescue', 'map_escape', 'reading_detective'];
  const progress = current.questProgress || {};
  let keys = 0;
  
  strategyQuests.forEach(questId => {
    if (progress[questId] && progress[questId].passed) {
      keys += 1;
    }
  });
  
  return keys;
}

// ── Mistakes ──────────────────────────────────────────────────
export async function saveMistake(studentId, questionObj) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId) return;

  const mistakeBank = recordQuestMistake(current.mistakeBank || {}, questionObj);
  
  await updateCurrentStudent({ mistakeBank });
}

export async function processReviewAnswer(studentId, questionId, isCorrect) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId || typeof isCorrect !== 'boolean') return;

  const mistakeBank = reviewQuestMistake(current.mistakeBank || {}, questionId, isCorrect);
  if (!mistakeBank[questionId]) return;

  const currentStats = current.badgeStats || {};
  const currentRankingStats = current.rankingStats || {};
  let mistakesFixed = currentStats.mistakesFixed || 0;
  let fastGuessCount = currentRankingStats.fastGuessCount || 0;

  if (isCorrect) {
    mistakesFixed += 1;
    // Clear / reduce fast guess count penalty by 5 for every review answer
    if (fastGuessCount > 0) {
      fastGuessCount = Math.max(0, fastGuessCount - 5);
    }
  }

  const newBadgeStats = { ...currentStats, mistakesFixed };
  const newRankingStats = { ...currentRankingStats, fastGuessCount };
  const updated = await updateCurrentStudent({ mistakeBank, badgeStats: newBadgeStats, rankingStats: newRankingStats });
  return updated;
}

// ── Pre-test ──────────────────────────────────────────────────
export async function savePreTest(studentId, categoryScores, totalScore) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId) throw new TypeError('Student session does not match pre-test result');
  const categories = Object.values(categoryScores || {});
  if (!categories.length || categories.some(category => !category || !Number.isInteger(category.total) || category.total <= 0 ||
    !Number.isInteger(category.correct) || category.correct < 0 || category.correct > category.total)) throw new TypeError('Invalid pre-test category scores');
  const total = categories.reduce((sum, category) => sum + category.total, 0);
  if (categories.reduce((sum, category) => sum + category.correct, 0) !== totalScore) throw new TypeError('Invalid pre-test score');
  if (current.preTest != null) throw new TypeError('Pre-test result already exists');
  const data = { categoryScores, totalScore, total, version: 'pretest-v2', date: new Date().toISOString() };
  await updateCurrentStudent({ preTest: data });
  return data;
}

export function getPreTest(studentId) {
  const current = getCurrentStudent();
  if (current && current.id === studentId) {
    return current.preTest || null;
  }
  return null;
}

export async function addXP(studentId, amount) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId) return { student: current, leveledUp: false, newLevel: current?.level || 1 };
  
  if (!Number.isFinite(amount)) throw new TypeError('XP reward must be a finite number');
  if (current.authVerified === true) {
    return { student: current, leveledUp: false, newLevel: current.level || 1 };
  }

  if (!current.isDemo && current.role === 'student' && !current.id.startsWith('local_') && amount > 0) {
    try {
      const session = (await supabase?.auth?.getSession?.())?.data?.session;
      if (session?.access_token) {
        const res = await addXPToServer({ amount, token: session.access_token });
        if (res?.student) {
          localStorage.setItem(`${PREFIX}current`, JSON.stringify(res.student));
          return { student: res.student, leveledUp: res.leveledUp, newLevel: res.newLevel };
        }
      }
    } catch {
      // fallback to local calculation
    }
  }

  const previousXP = Number(current.xp);
  const newXP = Math.max(0, (Number.isFinite(previousXP) ? previousXP : 0) + amount);
  const newLevel  = calcLevel(newXP);
  const leveledUp = newLevel > (current.level || 1);
  
  const updated = await updateCurrentStudent({ xp: newXP, level: newLevel });
  return { student: updated, leveledUp, newLevel };
}

// ── Badges ────────────────────────────────────────────────────
export async function awardBadge(studentId, badgeId) {
  const current = getCurrentStudent();
  if (!current || current.id !== studentId) return;
  const badges = current.badges || [];
  if (!badges.includes(badgeId)) {
    await updateCurrentStudent({ badges: [...badges, badgeId] });
  }
}

export function hasBadge(student, badgeId) {
  return (student?.badges || []).includes(badgeId);
}

// ── Final Boss ────────────────────────────────────────────────
export async function saveFinalBossResult(studentId, score, total) {
  const pct = Math.round((score / total) * 100);
  const data = { score, total, pct, passed: pct >= 70, date: new Date().toISOString() };
  
  await updateCurrentStudent({ finalBoss: data });
  return data;
}

export function getFinalBossResult(studentId) {
  const current = getCurrentStudent();
  if (current && current.id === studentId) {
    return current.finalBoss || null;
  }
  return null;
}

// ── Export CSV ────────────────────────────────────────────────
export async function exportStudentsCSV() {
  const students = await getAllStudents();
  if (!students.length) { alert('ยังไม่มีข้อมูลนักเรียน'); return; }

  const headers = ['ชื่อ', 'ชั้น', 'เลขที่', 'XP รวม', 'Level', 'Rank Score', 'Tier', 'Fast Guess', 'คะแนน Pre-test(%)', 'Vocabulary(%)', 'Signs(%)', 'Directions(%)', 'Market(%)', 'Conversation(%)', 'Reading(%)', 'Grammar(%)', 'O-NET Final Boss(%)', 'Badge จำนวน', 'จุดอ่อน'];

  const rows = students.map(s => {
    const p = s.questProgress || {};
    const prePct = getPreTestResult(s).percent ?? '';
    const badges = s.badges || [];
    const questIds = ['vocabulary', 'signs', 'directions', 'market', 'conversation', 'reading', 'grammar'];
    const weakAreas = questIds.filter(q => (p[q]?.pct || 0) < 60 && p[q]?.attempts > 0).map(q => q);
    
    let rankScore = 0;
    let tierName = 'Bronze Adventurer';
    try {
      rankScore = calculateRankScore(s);
      tierName = getRankingTier(rankScore).name;
    } catch (e) {
      console.error(e);
    }

    return [
      s.name || '',
      s.class || '',
      s.number || '',
      s.xp || 0,
      s.level || 1,
      rankScore,
      tierName,
      s.rankingStats?.fastGuessCount || 0,
      prePct,
      p.vocabulary?.pct || 0,
      p.signs?.pct || 0,
      p.directions?.pct || 0,
      p.market?.pct || 0,
      p.conversation?.pct || 0,
      p.reading?.pct || 0,
      p.grammar?.pct || 0,
      s.finalBoss?.pct || 0,
      badges.length,
      weakAreas.join(' / ') || 'ไม่มี',
    ];
  });

  const bom = '\uFEFF';
  const csv = bom + [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `english_quest_onet_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function parseCSVData(csvText) {
  const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return [];
  
  const firstLine = lines[0].toLowerCase();
  let startIndex = 0;
  let idIdx = -1, nameIdx = -1, classIdx = -1, numberIdx = -1;

  if (firstLine.includes('ชื่อ') || firstLine.includes('name') || firstLine.includes('student_id')) {
    startIndex = 1;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
    headers.forEach((h, idx) => {
      if (h.includes('student_id') || h.includes('รหัส') || h === 'id') idIdx = idx;
      else if (h.includes('name') || h.includes('ชื่อ')) nameIdx = idx;
      else if (h.includes('class') || h.includes('ชั้น') || h.includes('ห้อง')) classIdx = idx;
      else if (h.includes('number') || h.includes('เลขที่') || h.includes('ลำดับ')) numberIdx = idx;
    });
  }
  
  const results = [];
  for (let i = startIndex; i < lines.length; i++) {
    const cols = [];
    let curr = '';
    let inQuotes = false;
    for (let c of lines[i]) {
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) { cols.push(curr); curr = ''; }
      else curr += c;
    }
    cols.push(curr);
    
    const cleanCols = cols.map(c => c.trim().replace(/^"|"$/g, ''));
    
    if (cleanCols.length >= 3) {
      let studentId = '', name = '', className = '', number = '';
      
      if (idIdx !== -1 && nameIdx !== -1 && classIdx !== -1 && numberIdx !== -1) {
        studentId = cleanCols[idIdx] || '';
        name = cleanCols[nameIdx] || '';
        className = cleanCols[classIdx] || '';
        number = cleanCols[numberIdx] || '';
      } else if (cleanCols.length >= 4 && !isNaN(cleanCols[0]) && isNaN(cleanCols[1])) {
        number = cleanCols[0];
        name = cleanCols[1];
        className = cleanCols[3];
      } else if (cleanCols.length >= 4 && isNaN(cleanCols[0]) && isNaN(cleanCols[1])) {
        studentId = cleanCols[0];
        name = cleanCols[1];
        className = cleanCols[2];
        number = cleanCols[3];
      } else {
        name = cleanCols[0];
        className = cleanCols[1];
        number = cleanCols[2];
      }
      
      className = normalizeClassName(className);
      
      if (name && className && number) {
        results.push({
          student_id: studentId,
          name: name,
          class: className,
          number: number.toString(),
          role: 'student'
        });
      }
    }
  }
  return results;
}

// ── Reset Data ────────────────────────────────────────────────
export async function deleteStudentsByClass(className) {
  if (!className) return;
  await supabase.from('students').delete().eq('class', className);
  invalidateStudentsCache();
}

export async function resetAllData() {
  try {
    await supabase.from('students').delete().neq('id', '__SYSTEM_EXAM_SESSION__');
  } catch (e) {
    console.error("Failed to reset Supabase students:", e);
  }
  invalidateStudentsCache();
  const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
}

export async function resetStudentData(studentId) {
  if (studentId && !studentId.startsWith('local_')) {
    await supabase.from('students').delete().eq('id', studentId);
  }
  clearCurrentStudent();
  invalidateStudentsCache();
}

// ── Teacher Translation Permission Control ────────────────────
export async function updateStudentTranslatePermission(studentId, translatePermission) {
  if (!studentId) return;

  const current = getCurrentStudent();
  if (current && (current.id === studentId || current.number === studentId)) {
    current.translatePermission = translatePermission;
    localStorage.setItem(`${PREFIX}current`, JSON.stringify(current));
  }

  if (!studentId.startsWith('local_')) {
    try {
      await supabase
        .from('students')
        .update({ translatePermission, updatedAt: new Date().toISOString() })
        .eq('id', studentId);
    } catch (e) {
      console.warn('Failed to update student translate permission in Supabase:', e);
    }
  }

  invalidateStudentsCache();
}
