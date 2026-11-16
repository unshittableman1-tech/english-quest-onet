export function selectFillBlankOption(question, index, submitted, enabled, { choose, speak, success }) {
  if (submitted || !question || !Number.isInteger(index) || index < 0 || index >= question.options.length) return;
  choose(index);
  if (!enabled) return;
  speak(question.options[index]);
  if (index === question.answer) success();
}
