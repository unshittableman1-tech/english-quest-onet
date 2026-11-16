import { supabase } from '../config/supabase';

export const STUDENT_360_CONTRACT = 'student-360-v1';
const fail = code => Object.assign(new Error(code), { code });

export function validateStudent360Snapshot(data, schoolId, studentId) {
  if (data?.contractVersion !== STUDENT_360_CONTRACT || data.schoolId !== schoolId || data.studentId !== studentId
      || data.profile?.id !== studentId || data.profile.school_id !== schoolId || data.profile.role !== 'student'
      || data.profile.isDemo === true || !['available', 'unavailable'].includes(data.vocabulary?.status)
      || !['available', 'unavailable'].includes(data.assignments?.status)
      || !Array.isArray(data.vocabulary.rows) || !Array.isArray(data.assignments.tasks)) throw fail('invalid_student360_response');
  if (data.assignments.tasks.some(task => !task || typeof task.id !== 'string' || !['assigned', 'in_progress', 'submitted'].includes(task.status)
      || !Array.isArray(task.words) || !Array.isArray(task.answeredWordIds)
      || !Number.isInteger(task.total) || task.total < 1 || !Number.isInteger(task.answered) || task.answered < 0 || task.answered > task.total)) throw fail('invalid_student360_response');
  if (data.vocabulary.rows.some(row => !row || typeof row.word_id !== 'string' || typeof row.word !== 'string')) throw fail('invalid_student360_response');
  return data;
}

export async function fetchStudent360(schoolId, studentId, actor, client = supabase) {
  if (!actor?.authVerified || actor.isDemo || !['teacher', 'super_admin'].includes(actor.role) || !actor.user_id) throw fail('student360_forbidden');
  if (typeof schoolId !== 'string' || !schoolId.trim() || typeof studentId !== 'string' || !studentId.trim()) throw fail('student360_forbidden');
  const { data: identity, error: identityError } = await client.auth.getUser();
  if (identityError || identity?.user?.id !== actor.user_id) throw fail('student360_forbidden');
  const { data, error } = await client.rpc('staff_student_360', { p_school: schoolId, p_student: studentId });
  if (error) {
    if (['PGRST202', '42883', '55000'].includes(error.code)) throw fail('student360_unavailable');
    if (['42501', 'PGRST301', 'PGRST302'].includes(error.code)) throw fail('student360_forbidden');
    throw fail('student360_load_failed');
  }
  const { data: currentIdentity, error: currentError } = await client.auth.getUser();
  if (currentError || currentIdentity?.user?.id !== actor.user_id) throw fail('student360_forbidden');
  return validateStudent360Snapshot(data, schoolId, studentId);
}
