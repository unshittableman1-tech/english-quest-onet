const number = value => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '') && Number.isFinite(Number(value)) ? Number(value) : null;

export function getPreTestResult(student = {}) {
  const pre = student.preTest;
  if (!pre) {
    const cached = number(student.badgeStats?.pretestScore);
    return { score: null, total: null, percent: cached > 0 && cached <= 100 ? cached : null, basis: 'legacy_percent_only' };
  }
  const score = number(pre.totalScore);
  let total = number(pre.total);
  let basis = 'recorded_total';
  if (pre.total === undefined || pre.total === null) {
    const categories = Object.values(pre.categoryScores || {});
    const valid = categories.length > 0 && categories.every(c => c && Number.isInteger(number(c.total)) && number(c.total) > 0 &&
      Number.isInteger(number(c.correct)) && number(c.correct) >= 0 && number(c.correct) <= number(c.total));
    if (valid && categories.reduce((sum, c) => sum + Number(c.correct), 0) === score) {
      total = categories.reduce((sum, c) => sum + Number(c.total), 0);
      basis = 'category_totals';
    } else if (!categories.length && pre.version === 'pretest-v1') {
      total = 20;
      basis = 'known_version';
    } else {
      total = null;
      basis = 'unknown_total';
    }
  }
  const valid = Number.isInteger(score) && score >= 0 && Number.isInteger(total) && total > 0 && score <= total;
  return { score, total: valid ? total : null, percent: valid ? Math.round(score / total * 100) : null, basis: valid ? basis : 'unknown_total' };
}

export function getEffectiveBadgeStats(student = {}) {
  return { ...student.badgeStats, pretestScore: getPreTestResult(student).percent };
}
