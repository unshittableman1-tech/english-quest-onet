import { supabase } from '../config/supabase';

export function canSyncVocabulary(student) {
  return Boolean(student?.authVerified && !student.isDemo && student.role === 'student' && student.auth_user_id && student.school_id);
}

export async function sendVocabularyEvents(student, events, client = supabase) {
  if (!canSyncVocabulary(student)) return [];
  const { data: identity, error: authError } = await client.auth.getUser();
  if (authError || identity?.user?.id !== student.auth_user_id) throw new Error('student_session_changed');
  const batch = events.filter(event => event.cloudPending === true).slice(0, 100);
  if (!batch.length) return [];
  const assignmentId = batch[0].assignmentId || null;
  const scopedBatch = batch.filter(event => (event.assignmentId || null) === assignmentId);
  const { data, error } = await client.rpc(assignmentId ? 'student_record_vocabulary_assignment' : 'student_record_vocabulary_practice', { ...(assignmentId ? { p_assignment: assignmentId } : {}), expected_auth_user_id: student.auth_user_id, events: scopedBatch.map(event => ({
    eventId: event.eventId, wordId: event.wordId, word: event.word, meaningTh: event.meaningTh,
    categoryId: event.categoryId, questId: event.questId ?? null, mode: event.mode,
    correct: event.correct, assisted: event.assisted, at: event.at,
  })) });
  if (error) throw error;
  if (data?.accepted !== scopedBatch.length) throw new Error('incomplete_vocabulary_sync');
  return scopedBatch.map(event => event.eventId);
}

async function assignmentRpc(name, args = {}, client = supabase) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw error;
  if (name !== 'staff_assign_vocabulary' && !Array.isArray(data)) throw new Error('invalid_assignment_response');
  return data;
}
export const fetchAssignmentCatalog = () => assignmentRpc('vocabulary_assignment_catalog');
export const fetchStudentAssignments = () => assignmentRpc('student_vocabulary_assignments');
export const fetchStaffAssignments = (schoolId, studentId) => assignmentRpc('staff_vocabulary_assignments', { p_school: schoolId, p_student: studentId });
export const createVocabularyAssignment = (schoolId, studentId, task) => assignmentRpc('staff_assign_vocabulary', {
  p_school: schoolId, p_student: studentId, p_id: task.id, p_title: task.title,
  p_word_ids: task.wordIds, p_instructions: task.instructions,
  p_due: task.dueDate ? `${task.dueDate}T23:59:59+07:00` : null,
});

export async function fetchTeacherVocabulary(schoolId, studentId, client = supabase) {
  if (!schoolId || !studentId) throw new Error('school_and_student_required');
  const { data, error } = await client.rpc('staff_vocabulary_practice', { target_school_id: schoolId, target_student_id: studentId });
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('invalid_vocabulary_report');
  return data;
}

export async function fetchStudentVocabulary(student, client = supabase) {
  if (!canSyncVocabulary(student)) throw new Error('student_report_unavailable');
  async function checkIdentity() {
    const { data, error } = await client.auth.getUser();
    if (error || data?.user?.id !== student.auth_user_id) throw new Error('student_session_changed');
  }
  await checkIdentity();
  const { data, error } = await client.rpc('student_vocabulary_report');
  if (error) throw error;
  if (!Array.isArray(data) || data.some(row => !row || typeof row.word_id !== 'string' || typeof row.word !== 'string')) throw new Error('invalid_vocabulary_report');
  await checkIdentity();
  return data;
}
