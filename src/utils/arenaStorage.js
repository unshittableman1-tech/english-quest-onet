// src/utils/arenaStorage.js
// Handles storage for Chapter 4 (O-NET Arena)
// Saves to localStorage (fast) + syncs to Supabase (cross-device)

import { supabase } from '../config/supabase';

const ARENA_STORAGE_KEY_PREFIX = 'eng_quest_arena_';

const EMPTY_STATS = () => ({
  bestMiniMock: null,
  bestSpeedMock: null,
  bestSkillMixedMock: null,
  bestWeaknessMock: null,
  bestFullMock: null,
  bestFinalSimulation: null,
  finalExamResult: null,     // One-time final exam result (never overwritten)
  arenaBadges: [],
  arenaRankScore: 0,
  attempts: []
});

export function getArenaStats(studentId) {
  if (!studentId) return EMPTY_STATS();
  const data = localStorage.getItem(`${ARENA_STORAGE_KEY_PREFIX}${studentId}`);
  if (!data) return EMPTY_STATS();
  return JSON.parse(data);
}

// ── Merge two arena stats objects, keeping the best score ──────
function mergeStats(local, cloud) {
  if (!cloud) return local;
  if (!local) return cloud;

  const merged = { ...local };

  const bestKeys = [
    'bestMiniMock', 'bestSpeedMock', 'bestSkillMixedMock',
    'bestWeaknessMock', 'bestFullMock', 'bestFinalSimulation'
  ];

  for (const key of bestKeys) {
    const l = local[key];
    const c = cloud[key];
    if (!l && c) {
      merged[key] = c;
    } else if (l && c) {
      // Cloud wins if higher percent, or same percent but faster time
      if (c.percent > l.percent || (c.percent === l.percent && c.timeUsed < l.timeUsed)) {
        merged[key] = c;
      }
    }
  }

  // Merge badges (union)
  // A submitted exam is immutable. Cloud wins if both devices already submitted.
  merged.finalExamResult = cloud.finalExamResult || local.finalExamResult || null;
  merged.arenaBadges = [...new Set([
    ...(local.arenaBadges || []),
    ...(cloud.arenaBadges || [])
  ])];

  // Merge attempts history (deduplicate by startedAt, keep last 20)
  const allAttempts = [...(local.attempts || []), ...(cloud.attempts || [])];
  const seen = new Set();
  merged.attempts = allAttempts
    .filter(a => {
      const k = a.startedAt || JSON.stringify(a);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 20);

  // Recalculate rank score after merge
  merged.arenaRankScore = (
    (merged.bestMiniMock?.percent || 0) +
    (merged.bestSpeedMock?.percent || 0) +
    (merged.bestSkillMixedMock?.percent || 0) +
    (merged.bestWeaknessMock?.percent || 0) +
    (merged.bestFullMock?.percent || 0) +
    (merged.bestFinalSimulation?.percent || 0)
  );

  return merged;
}

// ── Pull from Supabase, merge with localStorage, save merged ───
export async function mergeArenaStatsFromCloud(studentId, { requireCloud = false } = {}) {
  if (!studentId || studentId.startsWith('local_') || studentId === 'demo_student') {
    return getArenaStats(studentId);
  }

  try {
    const { data, error } = await supabase
      .from('students')
      .select('arenaStats')
      .eq('id', studentId)
      .maybeSingle();

    if (error) throw error;
    if (!data && requireCloud) throw new Error('Student record not found');
    if (data?.arenaStats) {
      const local = getArenaStats(studentId);
      const merged = mergeStats(local, data.arenaStats);
      // Save merged result back to localStorage
      localStorage.setItem(`${ARENA_STORAGE_KEY_PREFIX}${studentId}`, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    if (requireCloud) throw e;
    console.warn('Arena: Could not fetch from cloud, using local:', e);
  }

  return getArenaStats(studentId);
}

// ── Push stats to Supabase in background (non-blocking) ────────
function syncArenaStatsToCloud(studentId, stats) {
  if (!studentId || studentId.startsWith('local_') || studentId === 'demo_student') return;

  supabase
    .from('students')
    .update({ arenaStats: stats })
    .eq('id', studentId)
    .then(({ error }) => {
      if (error) console.warn('Arena: Cloud sync failed:', error);
    })
    .catch(e => console.warn('Arena: Cloud sync skipped:', e));
}

export function saveArenaAttempt(studentId, attempt) {
  if (!studentId || !attempt) return;
  
  const stats = getArenaStats(studentId);
  const mode = attempt.mode; // e.g., 'mini_mock_arena'
  
  // Add to attempts history (keep last 20)
  stats.attempts = [attempt, ...stats.attempts].slice(0, 20);
  
  // Update best score for this mode
  let bestKey = '';
  if (mode === 'mini_mock_arena') bestKey = 'bestMiniMock';
  if (mode === 'speed_mock_challenge') bestKey = 'bestSpeedMock';
  if (mode === 'skill_mixed_mock') bestKey = 'bestSkillMixedMock';
  if (mode === 'weakness_mock') bestKey = 'bestWeaknessMock';
  if (mode === 'full_mock_test') bestKey = 'bestFullMock';
  if (mode === 'final_exam_simulation') bestKey = 'bestFinalSimulation';

  if (bestKey) {
    const currentBest = stats[bestKey];
    if (!currentBest || attempt.percent > currentBest.percent || 
        (attempt.percent === currentBest.percent && attempt.timeUsed < currentBest.timeUsed)) {
      stats[bestKey] = {
        score: attempt.score,
        total: attempt.total,
        percent: attempt.percent,
        timeUsed: attempt.timeUsed,
        date: attempt.startedAt
      };
    }
  }

  // Update arena badges based on the new stats
  stats.arenaBadges = checkArenaBadges(stats);
  
  // Update rank score (sum of all best percents)
  stats.arenaRankScore = (
    (stats.bestMiniMock?.percent || 0) +
    (stats.bestSpeedMock?.percent || 0) +
    (stats.bestSkillMixedMock?.percent || 0) +
    (stats.bestWeaknessMock?.percent || 0) +
    (stats.bestFullMock?.percent || 0) +
    (stats.bestFinalSimulation?.percent || 0)
  );

  // 1) Save to localStorage immediately (fast)
  localStorage.setItem(`${ARENA_STORAGE_KEY_PREFIX}${studentId}`, JSON.stringify(stats));

  // 2) Sync to Supabase in background (non-blocking, cross-device)
  syncArenaStatsToCloud(studentId, stats);

  return stats;
}

// ── Badge logic ────────────────────────────────────────────────
function checkArenaBadges(stats) {
  const badges = [...(stats.arenaBadges || [])];
  const award = (id) => { if (!badges.includes(id)) badges.push(id); };

  if (stats.bestMiniMock?.percent >= 80) award('arena_challenger');
  if (stats.bestSpeedMock?.percent >= 80) award('speed_solver');
  if (stats.bestSkillMixedMock?.percent >= 80) award('mixed_skill_fighter');
  if (stats.bestWeaknessMock?.percent >= 80) award('weakness_crusher');
  if (stats.bestFullMock?.percent >= 70) award('mock_test_survivor');
  if (stats.bestFullMock?.percent >= 80) award('onet_ready');
  if (stats.bestFinalSimulation?.percent >= 80) award('onet_champion');
  if (stats.bestFinalSimulation?.percent >= 90) award('onet_legend_arena');

  return badges;
}

export function getAllArenaStatsForTeacher(studentIds) {
  // Pull local storage for all these IDs
  // Since we are using localStorage as cache, we can only get stats for students who played on THIS device.
  // For cross-device data, use the arenaStats column in Supabase directly.
  const results = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(ARENA_STORAGE_KEY_PREFIX)) {
      const studentId = key.replace(ARENA_STORAGE_KEY_PREFIX, '');
      const data = JSON.parse(localStorage.getItem(key));
      results.push({ studentId, ...data });
    }
  }
  return results;
}

// ── Final Exam (One-time) ──────────────────────────────────────

/**
 * Save a final exam result ONLY if the student hasn't submitted before.
 * Returns the saved attempt, or the existing one if already submitted.
 */
export function saveFinalExamResult(studentId, attempt) {
  if (!studentId || !attempt) return null;

  const stats = getArenaStats(studentId);

  // Guard: never overwrite — one-shot exam
  if (stats.finalExamResult) {
    console.warn('Final exam already submitted for this student.');
    return stats.finalExamResult;
  }

  stats.finalExamResult = {
    score: attempt.score,
    total: attempt.total,
    points: attempt.points !== undefined ? attempt.points : (attempt.score * 2),
    maxPoints: attempt.maxPoints || 100,
    percent: attempt.percent,
    timeUsed: attempt.timeUsed,
    skillScores: attempt.skillScores,
    wrongQuestions: attempt.wrongQuestions,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt || Date.now(),
  };

  // Save to localStorage
  localStorage.setItem(`${ARENA_STORAGE_KEY_PREFIX}${studentId}`, JSON.stringify(stats));

  // Sync to Supabase in background
  syncArenaStatsToCloud(studentId, stats);

  return stats.finalExamResult;
}

/**
 * Return the student's finalExamResult (or null if not yet taken).
 */
export function getFinalExamResult(studentId) {
  if (!studentId) return null;
  return getArenaStats(studentId).finalExamResult || null;
}

// ── Teacher Exam Session (PIN + Open/Close) ────────────────────

const EXAM_SESSION_KEY = 'eng_quest_exam_session';
const SYSTEM_EXAM_SESSION_ID = '__SYSTEM_EXAM_SESSION__';

/**
 * Open a final exam session (teacher action).
 * Saves { isOpen, pin, openedAt } to localStorage AND Supabase.
 * Uses students table system record for guaranteed cross-device sync.
 */
export async function openExamSession(pin) {
  const session = { isOpen: true, pin: String(pin), openedAt: new Date().toISOString() };
  localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));

  let cloudSynced = false;
  try {
    // 1. Sync to students table (system record) - always available without needing new tables
    const { error: sErr } = await supabase.from('students').upsert({
      id: SYSTEM_EXAM_SESSION_ID,
      name: 'SYSTEM EXAM SESSION',
      class: 'SYSTEM',
      number: '0',
      role: 'system',
      arenaStats: {
        isOpen: true,
        pin: String(pin),
        openedAt: session.openedAt,
        closedAt: null,
      }
    });
    if (!sErr) cloudSynced = true;
    else console.warn('Exam session students table sync failed:', sErr);

    // 2. Also try exam_sessions table if it exists
    supabase.from('exam_sessions').upsert({
      id: 'final_exam',
      is_open: true,
      pin: String(pin),
      opened_at: session.openedAt,
      closed_at: null,
    }, { onConflict: 'id' }).catch(() => {});
  } catch (e) {
    console.warn('Exam session cloud sync failed (open):', e);
  }

  return { ...session, cloudSynced };
}

/**
 * Close the exam session (teacher action).
 */
export async function closeExamSession() {
  const prev = getExamSession();
  const session = { isOpen: false, pin: prev?.pin || '', openedAt: prev?.openedAt || null, closedAt: new Date().toISOString() };
  localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));

  let cloudSynced = false;
  try {
    // 1. Sync to students table
    const { error: sErr } = await supabase.from('students').upsert({
      id: SYSTEM_EXAM_SESSION_ID,
      name: 'SYSTEM EXAM SESSION',
      class: 'SYSTEM',
      number: '0',
      role: 'system',
      arenaStats: {
        isOpen: false,
        pin: session.pin,
        openedAt: session.openedAt,
        closedAt: session.closedAt,
      }
    });
    if (!sErr) cloudSynced = true;
    else console.warn('Exam session students table close sync failed:', sErr);

    // 2. Also try exam_sessions table if it exists
    supabase.from('exam_sessions').upsert({
      id: 'final_exam',
      is_open: false,
      pin: session.pin,
      opened_at: session.openedAt,
      closed_at: session.closedAt,
    }, { onConflict: 'id' }).catch(() => {});
  } catch (e) {
    console.warn('Exam session cloud sync failed (close):', e);
  }

  return { ...session, cloudSynced };
}

/**
 * Get the current exam session from localStorage cache.
 */
export function getExamSession() {
  try {
    const raw = localStorage.getItem(EXAM_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/**
 * Fetch the exam session from Supabase (for students polling).
 */
export async function getExamSessionFromCloud() {
  try {
    // 1. First check students table (__SYSTEM_EXAM_SESSION__)
    const { data: sysData, error: sysErr } = await supabase
      .from('students')
      .select('arenaStats')
      .eq('id', SYSTEM_EXAM_SESSION_ID)
      .maybeSingle();

    if (!sysErr && sysData?.arenaStats) {
      const session = {
        isOpen: Boolean(sysData.arenaStats.isOpen),
        pin: String(sysData.arenaStats.pin || ''),
        openedAt: sysData.arenaStats.openedAt || null,
        closedAt: sysData.arenaStats.closedAt || null,
      };
      localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));
      return session;
    }

    // 2. Fallback: try exam_sessions table
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('id, is_open, pin, opened_at, closed_at')
      .eq('id', 'final_exam')
      .maybeSingle();

    if (!error && data) {
      const session = {
        isOpen: Boolean(data.is_open),
        pin: String(data.pin || ''),
        openedAt: data.opened_at || null,
        closedAt: data.closed_at || null,
      };
      localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(session));
      return session;
    }

    // 3. Fallback to localStorage cache
    return getExamSession();
  } catch (e) {
    console.warn('getExamSessionFromCloud failed, using local cache:', e);
    return getExamSession();
  }
}

/**
 * Pull final exam results for all students from Supabase (teacher view).
 * Returns array of { id, name, class, number, finalExamResult }.
 */
export async function getAllFinalExamResultsFromCloud() {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('id, name, class, number, arenaStats')
      .not('arenaStats', 'is', null);

    if (error || !data) return [];

    return data
      .filter(s => s.id !== SYSTEM_EXAM_SESSION_ID && s.role !== 'system' && s.arenaStats?.finalExamResult)
      .map(s => ({
        id: s.id,
        name: s.name,
        class: s.class,
        number: s.number,
        finalExamResult: s.arenaStats.finalExamResult,
      }))
      .sort((a, b) => (b.finalExamResult.percent || 0) - (a.finalExamResult.percent || 0));
  } catch (e) {
    console.warn('getAllFinalExamResultsFromCloud failed:', e);
    return [];
  }
}
