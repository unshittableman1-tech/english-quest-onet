export function isSingleStepMcq(question) {
  return Boolean(question && question.type !== 'two_step' && !question.reasonChoices &&
    Array.isArray(question.options) && question.options.length >= 2 &&
    Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length);
}

export function getQuestionFeedback(question, result) {
  if (question.type === 'two_step') {
    const key = result.isMainCorrect ? (result.isReasonCorrect ? 'bothCorrect' : 'mainRightReasonWrong')
      : (result.isReasonCorrect ? 'mainWrongReasonRight' : 'bothWrong');
    if (question.feedback?.[key]?.trim()) return question.feedback[key];
  }
  const wrong = question.wrongFeedback?.trim();
  return (result.isCorrect ? question.correctFeedback : wrong && wrong !== 'Incorrect.' ? wrong : question.correctFeedback)
    || 'ลองสังเกตคำสำคัญในโจทย์และความหมายของตัวเลือก';
}
