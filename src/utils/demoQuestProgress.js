import { validateAssessmentEvidence } from './assessmentEvidence';

export function buildDemoQuestProgress(student, questId, score, total, extraStats = {}, completedAt = new Date().toISOString()) {
  if (student?.isDemo !== true || typeof questId !== 'string' || !questId.trim()
      || !Number.isInteger(total) || total <= 0 || !Number.isInteger(score) || score < 0 || score > total) {
    throw new TypeError('Invalid Demo quest result');
  }
  if (extraStats.assessmentEvidence) validateAssessmentEvidence(extraStats.assessmentEvidence, score, total);

  const progress = student.questProgress || {};
  const existing = progress[questId] || {};
  const pct = Math.round((score / total) * 100);
  const star = pct >= 85 ? 3 : pct >= 70 ? 2 : pct >= 50 ? 1 : 0;
  const totalScore = (existing.score || 0) + score;
  const totalQuestions = (existing.total || 0) + total;
  const averagePct = Math.min(100, Math.round((totalScore / totalQuestions) * 100));
  const previousStars = Array.isArray(existing.stars) ? existing.stars : [];

  return {
    ...progress,
    [questId]: {
      ...existing,
      score: totalScore,
      total: totalQuestions,
      pct: averagePct,
      passed: existing.passed === true || pct >= 70,
      best: Math.max(existing.best || 0, averagePct, pct),
      attempts: (existing.attempts || 0) + 1,
      roundsPlayed: (existing.roundsPlayed ?? existing.attempts ?? previousStars.length) + 1,
      stars: [...previousStars, star],
      lastPlayed: completedAt,
      ...(extraStats.assessmentEvidence ? { lastAssessment: { ...extraStats.assessmentEvidence, completedAt } } : {}),
    },
  };
}
