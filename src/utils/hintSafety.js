const normalizeHintText = (value) => String(value || '')
  .toLowerCase()
  .replace(/[\s.,!?()\-_/|=:;"'“”‘’]+/g, '');

export function hintRevealsAnswer(meaning, blockedMeanings = []) {
  const normalizedMeaning = normalizeHintText(meaning);
  if (!normalizedMeaning) return false;

  return blockedMeanings.some((answer) => {
    const normalizedAnswer = normalizeHintText(answer);
    return normalizedAnswer.length >= 2 && (
      normalizedMeaning.includes(normalizedAnswer)
      || normalizedAnswer.includes(normalizedMeaning)
    );
  });
}

