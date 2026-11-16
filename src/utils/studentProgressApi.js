/**
 * Student Progress API Client.
 * Communicates with the secure student-progress Edge Function.
 */

import { supabaseConfig } from '../config/runtimeMode';

export async function fetchServerStudentProfile(token) {
  if (!token) return null;
  const endpoint = `${supabaseConfig.url}/functions/v1/student-progress`;
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': supabaseConfig.anonKey,
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.ok ? payload.student : null;
  } catch (err) {
    console.warn('[studentProgressApi] fetchServerStudentProfile error:', err);
    return null;
  }
}

export async function submitQuestToServer({ questId, attemptId = crypto.randomUUID(), extraStats, token }) {
  if (!token) return null;
  const endpoint = `${supabaseConfig.url}/functions/v1/student-progress`;
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseConfig.anonKey,
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        action: 'save-quest',
        questId,
        attemptId,
        extraStats,
      }),
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return payload?.ok ? payload : null;
  } catch (err) {
    console.warn('[studentProgressApi] submitQuestToServer error:', err);
    return null;
  }
}

export async function addXPToServer({ amount, reason, token }) {
  throw new Error('Direct student XP awards are disabled; XP is awarded by verified quest completion.');
}

export async function syncStudentProgressToServer(updates, token) {
  throw new Error('Direct student progress synchronization is disabled.');
}
