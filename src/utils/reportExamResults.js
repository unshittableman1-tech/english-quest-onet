// Legacy arena records are client-originated; this reader never upgrades them
// to server-verified evidence or manufactures missing attempts.
export function readReportExamResults(stats, { unavailable = false } = {}) {
  if (unavailable) return { state: 'unavailable', attempts: [], excluded: 0 };
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return { state: 'unknown', attempts: [], excluded: 0 };
  if (!Array.isArray(stats.attempts) && !stats.finalExamResult) return { state: 'unknown', attempts: [], excluded: 0 };
  const groups = new Map();
  const records = [...(Array.isArray(stats.attempts) ? stats.attempts : [])];
  if (stats.finalExamResult && typeof stats.finalExamResult === 'object' && !Array.isArray(stats.finalExamResult)) {
    const final = { ...stats.finalExamResult, mode: 'final_exam' };
    const alreadyIncluded = final.startedAt != null && records.some(item => item?.mode === 'final_exam'
      && item.startedAt === final.startedAt && item.score === final.score && item.total === final.total);
    if (!alreadyIncluded) records.push(final);
  }
  for (const [index, item] of records.entries()) {
    const key = typeof item?.attemptId === 'string' && item.attemptId ? `id:${item.attemptId}` : `unknown:${index}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  let excluded = 0;
  const attempts = [];
  for (const entries of groups.values()) {
    const signature = item => JSON.stringify([item?.mode, item?.score, item?.total, item?.percent, item?.startedAt, item?.submittedAt]);
    if (new Set(entries.map(signature)).size !== 1) { excluded++; continue; }
    const item = entries[0];
    if (!item || typeof item.mode !== 'string' || !item.mode || !Number.isInteger(item.score) || !Number.isInteger(item.total)
        || item.total <= 0 || item.score < 0 || item.score > item.total
        || typeof item.percent !== 'number' || !Number.isFinite(item.percent) || Math.abs(item.percent - item.score / item.total * 100) > 0.51) {
      excluded++; continue;
    }
    const value = item.submittedAt;
    const date = typeof value === 'number' || typeof value === 'string' ? new Date(value) : null;
    attempts.push({ id: typeof item.attemptId === 'string' ? item.attemptId : null, mode: item.mode,
      score: item.score, total: item.total, percent: item.percent,
      completedAt: date && Number.isFinite(date.getTime()) ? date.toISOString() : null, verified: false });
  }
  return { state: attempts.length ? 'available' : excluded ? 'invalid' : 'empty', attempts, excluded };
}

export function mergeReportArenaSources(local, account) {
  const sources = [local, account].filter(value => value && typeof value === 'object' && (Array.isArray(value.attempts) || value.finalExamResult));
  if (!sources.length) return readReportExamResults(undefined);
  const attempts = sources.flatMap(source => [
    ...(Array.isArray(source.attempts) ? source.attempts : []),
    ...(source.finalExamResult ? [{ ...source.finalExamResult, mode: 'final_exam' }] : []),
  ]).map(item => {
    if (!item || item.startedAt == null || typeof item.mode !== 'string') return item;
    if (item.attemptId && item.mode !== 'final_exam') return item;
    return { ...item, attemptId: `legacy:${item.mode}:${item.startedAt}` };
  });
  return readReportExamResults({ attempts });
}
