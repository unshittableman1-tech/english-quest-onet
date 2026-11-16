import { isQuestPassed } from './questMapModel';

// These are observations, not estimates of mastery or reconstructed attempts.
export function buildReportActivity(student = {}, history = {}, sessions = {}) {
  const missions = [];
  const quests = [];
  for (const [questId, progress] of Object.entries(student.questProgress || {})) {
    if (progress && (isQuestPassed(progress) || Number.isInteger(progress.attempts) && progress.attempts > 0 || Number.isInteger(progress.total) && progress.total > 0)) {
      const validScore = Number.isInteger(progress.score) && Number.isInteger(progress.total) && progress.total > 0 && progress.score >= 0 && progress.score <= progress.total;
      quests.push({ questId, passed: isQuestPassed(progress), score: validScore ? progress.score : null,
        total: validScore ? progress.total : null, attempts: Number.isInteger(progress.attempts) && progress.attempts > 0 ? progress.attempts : null });
    }
    for (const [missionId, record] of Object.entries(progress?.gameMissions || {})) {
      if (!Number.isInteger(record?.attempts) || record.attempts < 1) continue;
      missions.push({ questId, missionId, attempts: record.attempts, lastCompletedAt: record.lastCompletedAt || null });
    }
  }
  const categories = new Map();
  const rowFor = id => {
    if (!categories.has(id)) categories.set(id, { categoryId: id, sessions: null, lastMode: null, lastPracticedAt: null, observations: 0, answers: 0, correct: 0 });
    return categories.get(id);
  };
  for (const [id, record] of Object.entries(sessions.categories || {})) {
    if (!Number.isInteger(record?.sessions) || record.sessions < 1) continue;
    Object.assign(rowFor(id), { sessions: record.sessions, lastMode: record.mode || null, lastPracticedAt: record.lastPracticedAt || null });
  }
  const seen = new Set();
  for (const event of Array.isArray(history.events) ? history.events : []) {
    if (!event?.eventId || seen.has(event.eventId) || !event.categoryId) continue;
    seen.add(event.eventId);
    const row = rowFor(event.categoryId);
    row.observations++;
    if (['quick_check', 'speed'].includes(event.mode) && typeof event.correct === 'boolean') {
      row.answers++;
      if (event.correct) row.correct++;
    }
  }
  return { quests, missions, vocabulary: [...categories.values()] };
}
