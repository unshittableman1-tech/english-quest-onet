import { readChapter3Response } from './chapter3Response.mjs';

export const CHAPTER3_REQUIRED_MISSIONS = Object.freeze(['question_words', 'pronouns_master', 'tenses_arena', 'c3_labeling_lab', 'c3_ordering_quest', 'c3_graph_comparison']);

export function normalizeChapter3Eligibility(payload) {
  if (payload?.ok !== true || payload.policyVersion !== 'c3-v1' || !Array.isArray(payload.missions) || payload.missions.length !== CHAPTER3_REQUIRED_MISSIONS.length || typeof payload.bossAllowed !== 'boolean') return null;
  if (new Set(payload.missions.map(mission => mission?.missionId)).size !== CHAPTER3_REQUIRED_MISSIONS.length || payload.missions.some(mission => !CHAPTER3_REQUIRED_MISSIONS.includes(mission?.missionId) || typeof mission.passed !== 'boolean')) return null;
  if (payload.bossAllowed !== payload.missions.every(mission => mission.passed)) return null;
  return { ok: true, policyVersion: payload.policyVersion, bossAllowed: payload.bossAllowed, missions: payload.missions.map(({ missionId, passed }) => ({ missionId, passed })) };
}

export async function fetchChapter3Eligibility({ token, url, apikey, signal, fetcher = globalThis.fetch }) {
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) || !token) throw new Error('chapter3_status_unavailable');
  const response = await fetcher(`${endpoint.origin}/functions/v1/chapter3-missions`, {
    method: 'POST', cache: 'no-store', signal,
    headers: { 'Content-Type': 'application/json', apikey, Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action: 'status' }),
  });
  const status = normalizeChapter3Eligibility(await readChapter3Response(response));
  if (!status) throw new Error('chapter3_status_invalid');
  return status;
}

export async function verifyChapter3StudentEligibility({ studentId, session, fetchProfile, ...options }) {
  const token = session?.access_token;
  if (!token) throw new Error('chapter3_login_required');
  const profile = await fetchProfile(token);
  if (!profile) throw new Error('chapter3_profile_unavailable');
  if (!studentId || profile.id !== studentId) throw new Error('chapter3_identity_mismatch');
  const status = await fetchChapter3Eligibility({ ...options, token });
  return { status, studentId, authUserId: session.user?.id || null };
}

export function chapter3EligibilityError(code) {
  return {
    chapter3_login_required: 'เซสชันเข้าสู่ระบบหมดอายุหรือยังไม่ได้ยืนยัน กรุณาเข้าสู่ระบบนักเรียนอีกครั้ง คะแนนเดิมจะไม่ถูกลบ',
    chapter3_profile_unavailable: 'ยังตรวจยืนยันบัญชีนักเรียนกับเซิร์ฟเวอร์ไม่ได้ กรุณาลองตรวจสิทธิ์อีกครั้ง',
    chapter3_identity_mismatch: 'บัญชีที่หน้าเว็บกับเซสชันเข้าสู่ระบบไม่ตรงกัน กรุณาเข้าสู่ระบบนักเรียนอีกครั้ง',
  }[code] || 'ยังตรวจสอบสิทธิ์ Boss จากเซิร์ฟเวอร์ไม่ได้ กรุณาลองตรวจใหม่';
}
