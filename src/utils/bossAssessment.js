function shuffle(items, random) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function selectBossAssessmentQuestions(questions, count, requiredFocus = [], random = Math.random) {
  const pool = Array.isArray(questions) ? questions : [];
  const limit = Math.min(Math.max(0, count), pool.length);
  const selected = [];
  const selectedIds = new Set();

  for (const focus of requiredFocus) {
    if (selected.length >= limit) break;
    const candidates = pool.filter(question => question.assessmentFocus === focus && !selectedIds.has(question.id));
    const picked = shuffle(candidates, random)[0];
    if (picked) {
      selected.push(picked);
      selectedIds.add(picked.id);
    }
  }

  const remaining = shuffle(pool.filter(question => !selectedIds.has(question.id)), random);
  selected.push(...remaining.slice(0, limit - selected.length));
  return shuffle(selected, random);
}
