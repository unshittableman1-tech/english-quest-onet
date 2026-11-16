import { supabase } from '../config/supabase';

const fail = code => Object.assign(new Error(code), { code });
const pendingKey = student => `eq_pretest_pending_v1:${JSON.stringify([student.school_id, student.auth_user_id, student.id])}`;

export function readPendingPretest(student, storage = globalThis.localStorage) {
  if (!student?.id || !student?.school_id || !student?.auth_user_id || !student.authVerified || student.isDemo) return null;
  try {
    const raw = storage.getItem(pendingKey(student));
    return raw ? JSON.parse(raw) : null;
  } catch { throw fail('pretest_pending_unavailable'); }
}

export function stagePretestAttempt(student, attempt, storage = globalThis.localStorage) {
  if (!student?.id || !student?.school_id || !student?.auth_user_id || !student.authVerified || student.isDemo) throw fail('pretest_session_invalid');
  const pending = readPendingPretest(student, storage);
  if (pending && JSON.stringify(pending) !== JSON.stringify(attempt)) throw fail('pretest_pending_conflict');
  try { storage.setItem(pendingKey(student), JSON.stringify(attempt)); }
  catch { throw fail('pretest_pending_unavailable'); }
}

export function clearPendingPretest(student, storage = globalThis.localStorage) {
  try { storage.removeItem(pendingKey(student)); } catch { /* A confirmed server receipt is authoritative. */ }
}

export async function submitPretestAttempt(student, attempt, client = supabase) {
  if (!student?.authVerified || student.isDemo || student.role !== 'student' || !student.auth_user_id || !student.school_id || !student.id) throw fail('pretest_session_invalid');
  if (!attempt || typeof attempt.attemptId !== 'string' || !/^[A-Za-z0-9_-]{1,100}$/.test(attempt.attemptId) ||
      !Array.isArray(attempt.answers) || attempt.answers.length !== 20 || attempt.answers.some((item, index) =>
        item?.id !== `pretest-v2-${index + 1}` || !Number.isInteger(item.choice) || item.choice < 0 || item.choice > 3)) throw fail('pretest_answers_invalid');
  const verify = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || data?.user?.id !== student.auth_user_id) throw fail('pretest_session_changed');
  };
  await verify();
  const { data, error } = await client.rpc('student_submit_pretest_v2', {
    p_attempt_id: attempt.attemptId, p_answers: attempt.answers.map(item => item.choice), expected_auth_user_id: student.auth_user_id,
  });
  if (error) throw Object.assign(fail('pretest_save_failed'), { cause: error });
  await verify();
  if (data?.contractVersion !== 'pretest-receipt-v1' || data.studentId !== student.id || data.schoolId !== student.school_id ||
      data.attemptId !== attempt.attemptId || data.result?.version !== 'pretest-v2' || data.result.total !== 20 ||
      !Number.isInteger(data.result.totalScore) || data.result.totalScore < 0 || data.result.totalScore > 20 ||
      !data.result.categoryScores || typeof data.result.date !== 'string' || !Number.isFinite(Date.parse(data.result.date))) throw fail('pretest_receipt_invalid');
  return data;
}
