import { supabase } from '../config/supabase';

export async function fetchReportArenaAccount(student, client = supabase) {
  if (!student?.authVerified || student.isDemo || student.role !== 'student' || !student.id || !student.auth_user_id) throw Error('report_arena_unavailable');
  async function checkIdentity() {
    const { data, error } = await client.auth.getUser();
    if (error || data?.user?.id !== student.auth_user_id) throw Error('student_session_changed');
  }
  await checkIdentity();
  const { data, error } = await client.from('students').select('arenaStats').eq('id', student.id).maybeSingle();
  if (error || !data) throw error || Error('report_arena_unavailable');
  await checkIdentity();
  return data.arenaStats;
}
