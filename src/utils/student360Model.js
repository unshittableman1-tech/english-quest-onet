import { buildSkillEvidenceProfile } from './skillEvidenceProfile';
import { buildReportQuestProgress, getReportPreTest } from './reportDataIntegrity';

const count = value => Number.isInteger(value) && value >= 0;
export function buildStudent360Model(snapshot, quests, chapters) {
  const profile = buildSkillEvidenceProfile(snapshot.profile, quests);
  const wordNeeds = snapshot.vocabulary.status === 'available' ? snapshot.vocabulary.rows.filter(row =>
    typeof row.word_id === 'string' && typeof row.word === 'string' && row.latest_independent_correct === false
    && count(row.independent_attempts) && count(row.independent_correct) && row.independent_correct <= row.independent_attempts)
    .map(row => ({ wordId: row.word_id, word: row.word, categoryId: row.category_id,
      incorrect: row.independent_attempts - row.independent_correct, attempts: row.independent_attempts,
      repeated: row.independent_attempts - row.independent_correct >= 2 })).filter(row => row.incorrect > 0) : [];
  const tasks = snapshot.assignments.status === 'available' ? snapshot.assignments.tasks : null;
  return { profile, progress: buildReportQuestProgress(chapters, snapshot.profile.questProgress || {}),
    preTest: getReportPreTest(snapshot.profile), errors: profile.observations.filter(item => item.firstCorrect === false), wordNeeds,
    assignments: tasks ? { total: tasks.length, pending: tasks.filter(task => ['assigned', 'in_progress'].includes(task.status)).length,
      submitted: tasks.filter(task => task.status === 'submitted').length } : null };
}

export function filterStudent360Roster(students, quests, { query = '', skill = '', evidence = 'all' } = {}) {
  const text = query.trim().toLocaleLowerCase('th-TH');
  return students.filter(student => {
    if (text && !`${student.name || ''} ${student.number ?? ''} ${student.id || ''}`.toLocaleLowerCase('th-TH').includes(text)) return false;
    if (!skill && evidence === 'all') return true;
    const profile = buildSkillEvidenceProfile(student, quests);
    const skills = profile.skills.filter(row => !skill || row.id === skill);
    if (evidence === 'errors') return profile.observations.some(row => !row.firstCorrect && (!skill || row.skillId === skill));
    if (evidence === 'insufficient') return skills.every(row => row.total === 0);
    return skills.some(row => row.total > 0);
  });
}

export function formatStudent360Date(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return 'ยังไม่มีข้อมูลเพียงพอ';
  return new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
