export function validateAssessmentEvidence(evidence, score, total) {
  if (!evidence || evidence.policy !== 'first_response_v1' || evidence.score !== score || evidence.total !== total ||
      !Number.isInteger(total) || total <= 0 || !Number.isInteger(score) || score < 0 || score > total ||
      !Array.isArray(evidence.items) || evidence.items.length !== total ||
      new Set(evidence.items.map(item => item?.id)).size !== total ||
      evidence.items.some(item => !item || typeof item.id !== 'string' || !item.id || typeof item.version !== 'string' || !item.version ||
        typeof item.firstCorrect !== 'boolean' || typeof item.finalCorrect !== 'boolean' || typeof item.firstChoice !== 'string') ||
      evidence.items.filter(item => item.firstCorrect).length !== score) {
    throw new TypeError('Invalid first-response assessment evidence');
  }
  return evidence;
}
