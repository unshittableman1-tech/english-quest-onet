/**
 * ENGLISH O-NET ADVENTURE — GUEST DEMO SESSION MANAGER
 * 
 * Ephemeral session management for public demo mode.
 * - Stores state strictly in sessionStorage / memory
 * - NEVER touches localStorage real student accounts
 * - Zero database / cloud network requests
 * - No school IDs, no student credentials
 */

import { calcLevel } from './scoring.js';
import { recordQuestMistake, reviewQuestMistake } from './questReviewGate.js';

const DEMO_STORAGE_KEY = 'eq_onet_demo_session';

let memoryFallbackSession = null;

function hasSessionStorage() {
  try {
    return typeof window !== 'undefined' && Boolean(window.sessionStorage);
  } catch {
    return false;
  }
}

/**
 * Creates a brand new, clean guest demo session starting at 0 XP
 * @returns {object}
 */
export function createGuestDemoSession() {
  const timestamp = new Date().toISOString();
  return {
    id: 'guest_demo_user',
    name: 'ผู้เยี่ยมชม (Guest Demo)',
    role: 'student',
    isDemo: true,
    isGuestDemo: true,
    authVerified: false,
    school_id: null,
    school_code: null,
    school_name: null,
    school_membership_id: null,
    class: 'Demo Mode',
    number: null,
    xp: 0,
    level: 1,
    questProgress: {},
    badgeStats: {
      streakDays: 1,
      mistakesFixed: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      correctBySkill: {},
    },
    badges: [],
    mistakeBank: {},
    arenaStats: {
      arenaBadges: [],
      arenaRankScore: 0,
      attempts: [],
      finalExamResult: null,
    },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * Reads the current guest demo session, creating one if none exists
 * @returns {object}
 */
export function getGuestDemoSession() {
  if (hasSessionStorage()) {
    try {
      const raw = window.sessionStorage.getItem(DEMO_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.isGuestDemo) {
          return parsed;
        }
      }
    } catch {
      // Fall through to memory
    }
  }

  if (memoryFallbackSession && memoryFallbackSession.isGuestDemo) {
    return memoryFallbackSession;
  }

  const fresh = createGuestDemoSession();
  saveGuestDemoSession(fresh);
  return fresh;
}

/**
 * Persists the guest demo session to sessionStorage / memory
 * @param {object} session
 * @returns {object}
 */
export function saveGuestDemoSession(session) {
  if (!session) return null;
  const updated = {
    ...session,
    isDemo: true,
    isGuestDemo: true,
    school_id: null,
    school_code: null,
    school_name: null,
    updatedAt: new Date().toISOString(),
  };

  memoryFallbackSession = updated;

  if (hasSessionStorage()) {
    try {
      window.sessionStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Silent memory fallback
    }
  }

  return updated;
}

/**
 * Clears demo session completely for a fresh restart
 */
export function clearGuestDemoSession() {
  memoryFallbackSession = null;
  if (hasSessionStorage()) {
    try {
      window.sessionStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
}

/**
 * Check if a session belongs to the guest demo
 * @param {object} session
 * @returns {boolean}
 */
export function isGuestDemoSession(session) {
  return Boolean(session && (session.isGuestDemo || session.id === 'guest_demo_user'));
}

/**
 * Adds temporary XP to the guest demo session
 * @param {object} session
 * @param {number} amount
 * @returns {{ session: object, leveledUp: boolean, newLevel: number, newXP: number }}
 */
export function addDemoXPToSession(session, amount) {
  if (!session || !Number.isFinite(amount)) {
    return { session, leveledUp: false, newLevel: session?.level || 1, newXP: session?.xp || 0 };
  }

  const previousXP = Number(session.xp) || 0;
  const newXP = Math.max(0, previousXP + amount);
  const previousLevel = calcLevel(previousXP);
  const newLevel = calcLevel(newXP);
  const leveledUp = newLevel > previousLevel;

  const updated = {
    ...session,
    xp: newXP,
    level: newLevel,
  };

  saveGuestDemoSession(updated);
  return { session: updated, leveledUp, newLevel, newXP };
}

/**
 * Records a demo mission completion
 * @param {object} session
 * @param {string} missionId
 * @param {number} score
 * @param {number} total
 * @returns {object}
 */
export function recordDemoMissionCompletion(session, missionId, score, total) {
  if (!session) return session;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const prevRecord = session.questProgress?.[missionId] || {};
  const attempts = (prevRecord.attempts || 0) + 1;
  const best = Math.max(prevRecord.best || 0, pct);
  const passed = best >= 60;

  const updatedProgress = {
    ...(session.questProgress || {}),
    [missionId]: {
      score,
      total,
      pct,
      best,
      passed,
      attempts,
      completedAt: new Date().toISOString(),
    },
  };

  const updated = {
    ...session,
    questProgress: updatedProgress,
    badgeStats: {
      ...(session.badgeStats || {}),
      totalAnswered: (session.badgeStats?.totalAnswered || 0) + total,
      totalCorrect: (session.badgeStats?.totalCorrect || 0) + score,
    },
  };

  return saveGuestDemoSession(updated);
}

/**
 * Records an exam attempt in the demo session
 * @param {object} session
 * @param {object} attempt
 * @returns {object}
 */
export function recordDemoExamAttemptToSession(session, attempt) {
  if (!session || !attempt) return session;
  const previousAttempts = session.arenaStats?.attempts || [];
  const updatedAttempts = [attempt, ...previousAttempts].slice(0, 5); // Keep at most 5

  const updated = {
    ...session,
    arenaStats: {
      ...(session.arenaStats || {}),
      attempts: updatedAttempts,
      lastAttempt: attempt,
    },
  };

  return saveGuestDemoSession(updated);
}

/**
 * Records a question mistake into the demo mistakeBank
 * @param {object} session
 * @param {object} question
 * @returns {object}
 */
export function recordDemoMistakeToSession(session, question) {
  if (!session || !question?.id) return session;
  const previous = session.mistakeBank?.[question.id];
  const updatedMistake = {
    ...previous,
    ...question,
    quest: question.quest || 'about_myself',
    timesWrong: (Number(previous?.timesWrong) || 0) + 1,
    correctInReview: 0,
    mastered: false,
    addedAt: previous?.addedAt || new Date().toISOString(),
  };
  const mistakeBank = {
    ...(session.mistakeBank || {}),
    [question.id]: updatedMistake,
  };
  const updated = {
    ...session,
    mistakeBank,
  };
  return saveGuestDemoSession(updated);
}

/**
 * Reviews a question mistake in the demo mistakeBank
 * @param {object} session
 * @param {string} questionId
 * @param {boolean} isCorrect
 * @returns {object}
 */
export function reviewDemoMistakeInSession(session, questionId, isCorrect) {
  if (!session || !questionId) return session;
  const mistake = session.mistakeBank?.[questionId];
  if (!mistake || typeof isCorrect !== 'boolean') return session;
  const correctInReview = isCorrect ? (Number(mistake.correctInReview) || 0) + 1 : 0;
  const updatedMistake = {
    ...mistake,
    correctInReview,
    mastered: isCorrect,
    timesWrong: (Number(mistake.timesWrong) || 0) + (isCorrect ? 0 : 1),
  };
  const mistakeBank = {
    ...(session.mistakeBank || {}),
    [questionId]: updatedMistake,
  };
  const updated = {
    ...session,
    mistakeBank,
    badgeStats: {
      ...(session.badgeStats || {}),
      mistakesFixed: (session.badgeStats?.mistakesFixed || 0) + (isCorrect ? 1 : 0),
    },
  };
  return saveGuestDemoSession(updated);
}
