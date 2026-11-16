import { DEMO_RANKING_STUDENTS } from '../data/demoFixtures';

export async function loadRankingStudents(student, fetchStudents) {
  if (student?.isDemo === true) {
    return [student, ...DEMO_RANKING_STUDENTS.filter(row => row.id !== student.id)];
  }
  const rows = await fetchStudents({ throwOnError: true });
  if (!Array.isArray(rows)) throw new TypeError('Ranking data is unavailable');
  return rows.filter(row => row && !row.isDemo && (!row.role || row.role === 'student'));
}
