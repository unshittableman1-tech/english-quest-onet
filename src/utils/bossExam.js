import { supabase } from './supabase';
import { supabaseConfig } from '../config/runtimeMode';

export const SERVER_BOSS_IDS = Object.freeze(new Set(['chapter2_boss', 'strategy_boss', 'finalboss']));

// Activation requires an approved private catalog, local authenticated E2E, and an explicit rollout decision.
export const SERVER_BOSS_EXAM_ENABLED = true;

const uuid = value => typeof value === 'string'
  && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export function bossRunStorageKey(studentId, bossId) {
  if (!studentId || !SERVER_BOSS_IDS.has(bossId)) throw new Error('invalid_boss_context');
  return `eq_onet_boss_run:${studentId}:${bossId}`;
}

export function getOrCreateBossRequestId(studentId, bossId) {
  const key = bossRunStorageKey(studentId, bossId);
  const existing = sessionStorage.getItem(key);
  if (uuid(existing)) return existing;
  const requestId = crypto.randomUUID();
  sessionStorage.setItem(key, requestId);
  return requestId;
}

export function clearBossRequestId(studentId, bossId) {
  sessionStorage.removeItem(bossRunStorageKey(studentId, bossId));
}

export function getOrCreateBossAnswerRequestId(runId, itemId) {
  if (!uuid(runId) || typeof itemId !== 'string' || !itemId) throw new Error('invalid_boss_answer_context');
  const key = `eq_onet_boss_answer:${runId}:${itemId}`;
  const existing = sessionStorage.getItem(key);
  if (uuid(existing)) return existing;
  const requestId = crypto.randomUUID();
  sessionStorage.setItem(key, requestId);
  return requestId;
}

export async function callBossExam(body) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) throw new Error('session_unavailable');
  const response = await fetch(`${supabaseConfig.url}/functions/v1/boss-exam`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseConfig.anonKey,
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.error || 'boss_exam_unavailable');
    error.code = payload?.error || 'boss_exam_unavailable';
    throw error;
  }
  return payload;
}
