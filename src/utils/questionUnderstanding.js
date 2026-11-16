const PRACTICE_QUESTS = new Set(['question_words', 'reading', 'reading_detective']);

export function getReviewedGuide(question, metadata, { questId, isExamMode = false } = {}) {
  if (isExamMode || !PRACTICE_QUESTS.has(questId) || !question || !metadata) return null;
  if (metadata.teacherReviewStatus !== 'approved' || !metadata.reviewerId || !metadata.reviewedAt) return null;
  if (metadata.preAnswerDecoderAllowed === false) return null;
  if (metadata.questionId !== question.id || metadata.questionText !== question.question || metadata.questId !== questId) return null;
  const hints = Array.isArray(metadata.progressiveHints) ? metadata.progressiveHints.filter(value => typeof value === 'string' && value.trim()) : [];
  if (!hints.length) return null;
  const answer = question.options?.[question.answer];
  if (typeof answer === 'string' && answer.trim().length > 2 && hints.some(hint => hint.toLocaleLowerCase().includes(answer.trim().toLocaleLowerCase()))) return null;
  return {
    questionId: metadata.questionId,
    preAnswerDecoderAllowed: metadata.preAnswerDecoderAllowed !== false,
    progressiveHints: hints.slice(0, 3),
    comprehensionCheck: metadata.comprehensionCheck || null,
    questionMeaningTh: metadata.questionMeaningTh || null,
    essentialVocabulary: metadata.essentialVocabulary || [],
    learningTipTh: metadata.learningTipTh || null,
  };
}

export function nextHintIndex(current, guide) {
  return Math.min(Math.max(0, current) + 1, guide?.progressiveHints?.length || 0);
}

export function checkComprehension(guide, choiceIndex) {
  const check = guide?.comprehensionCheck;
  if (!check || !Array.isArray(check.choices) || !Number.isInteger(check.correctIndex)) return null;
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= check.choices.length) return null;
  return choiceIndex === check.correctIndex;
}

export function getLearningFeedback(guide) {
  if (!guide) return null;
  return {
    meaning: guide.questionMeaningTh || null,
    vocabulary: Array.isArray(guide.essentialVocabulary) ? guide.essentialVocabulary : [],
    tip: guide.learningTipTh || null,
  };
}

export function compareTransferQuestions(first, second) {
  if (!first || !second || first.id === second.id) return false;
  if (!first.parallelQuestionGroup || first.parallelQuestionGroup !== second.parallelQuestionGroup) return false;
  return first.learningObjective === second.learningObjective && first.questionText !== second.questionText;
}

export function masteryPreview(evidence = []) {
  const first = evidence.filter(item => item.purpose === 'fresh_check' && item.firstAttempt === true && item.verified === true);
  if (first.length < 3) return { status: 'insufficient_data', label: 'ข้อมูลยังไม่เพียงพอ', freshCount: first.length };
  const correct = first.filter(item => item.correct === true).length;
  return { status: correct / first.length >= 0.7 ? 'developing' : 'needs_support', label: correct / first.length >= 0.7 ? 'กำลังพัฒนา' : 'ควรติดตาม', freshCount: first.length, freshAccuracy: correct / first.length };
}
