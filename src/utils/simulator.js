export const SIMULATOR_TIME_LIMIT = 45 * 60;

export function prepareSimulatorParts(parts, random = Math.random) {
  return parts.map((part, partIndex) => ({ ...part, questions: part.questions.map((question, index) => {
    const choices = question.opts.map((text, originalIndex) => ({ text, originalIndex }));
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    return { ...question, id: `practice_sim_${partIndex + 1}_${index + 1}`, itemVersion: 'practice-sim-v2',
      opts: choices.map(option => option.text), ans: choices.findIndex(option => option.originalIndex === question.ans),
      passage: question.passage || part.passage || null };
  }) }));
}

export function getSimulatorResults(parts, answers) {
  let totalCorrect = 0;
  let totalQuestions = 0;
  let answered = 0;
  const partStats = parts.map((part, partIndex) => {
    let correct = 0;
    part.questions.forEach((question, index) => {
      totalQuestions++;
      const chosen = answers[`${partIndex}_${index}`];
      if (Number.isInteger(chosen) && chosen >= 0 && chosen < question.opts.length) answered++;
      if (chosen === question.ans) { correct++; totalCorrect++; }
    });
    return { part: part.title, correct, total: part.questions.length, pct: Math.round(correct / part.questions.length * 100) };
  });
  const realScore = totalQuestions ? Math.round(totalCorrect / totalQuestions * 100) : 0;
  const bonusXP = answered === 0 ? 0 : realScore >= 90 ? 300 : realScore >= 70 ? 200 : realScore >= 50 ? 100 : 50;
  return { totalCorrect, totalQuestions, realScore, bonusXP, partStats, answered };
}
