export function validQuestPercent(value) {
  if (typeof value !== 'number' && !(typeof value === 'string' && value.trim())) return null;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

export function summarizeQuestScores(students) {
  const groups = new Map();
  for (const student of students) {
    for (const [id, result] of Object.entries(student.questProgress || {})) {
      if (id === 'finalboss' || id === 'strategy_boss') continue;
      const score = validQuestPercent(result?.pct);
      if (score === null) continue;
      const group = groups.get(id) || { total: 0, count: 0, belowThreshold: 0 };
      group.total += score; group.count++;
      if (score < 70) group.belowThreshold++;
      groups.set(id, group);
    }
  }
  return Array.from(groups, ([id, group]) => ({ id, avg: Math.round(group.total / group.count), count: group.count, belowThreshold: group.belowThreshold }))
    .sort((a,b) => a.avg - b.avg || a.id.localeCompare(b.id));
}
