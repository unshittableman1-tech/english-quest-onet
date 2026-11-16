const idValid = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const textValid = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 200;
const kinds = new Set(['max_value', 'min_value', 'exact_value', 'difference', 'greater_than', 'less_than']);
const expressions = ['more_than', 'fewer_than', 'less_than', 'the_most', 'the_least', 'higher_than', 'lower_than', 'taller_than', 'shorter_than', 'bigger_than', 'smaller_than'];
const grammarPairs = { count: ['more_than', 'fewer_than'], mass: ['more_than', 'less_than'], height: ['taller_than', 'shorter_than'], size: ['bigger_than', 'smaller_than'], temperature: ['higher_than', 'lower_than'] };
const fail = message => { throw new Error(message); };

export function assertGraphDataset(dataset) {
  if (!dataset || !idValid(dataset.id) || !['bar', 'line'].includes(dataset.chartType) || !textValid(dataset.title) || !textValid(dataset.unit) || !textValid(dataset.xLabel)) fail('invalid_dataset');
  if (!['count', 'mass', 'height', 'size', 'temperature'].includes(dataset.unitKind) || !textValid(dataset.noun)) fail('invalid_units');
  if (dataset.chartType === 'line' && dataset.ordered !== true) fail('unordered_line_chart');
  if (!Number.isInteger(dataset.precision) || dataset.precision < 0 || dataset.precision > 2) fail('invalid_precision');
  const categories = dataset.categories;
  if (!Array.isArray(categories) || categories.length < 2 || categories.length > 8) fail('invalid_categories');
  if (!categories.every(category => idValid(category?.id) && textValid(category.label) && Number.isFinite(category.value) && category.value >= 0 && category.value <= 1_000_000)) fail('invalid_values');
  if (new Set(categories.map(category => category.id)).size !== categories.length || new Set(categories.map(category => category.label)).size !== categories.length) fail('duplicate_categories');
  if (categories.some(category => Math.abs(category.value - Number(category.value.toFixed(dataset.precision))) > 1e-8 || (dataset.unitKind === 'count' && !Number.isInteger(category.value)))) fail('invalid_unit_values');
  return dataset;
}

export function graphExpectedResult(question, dataset) {
  assertGraphDataset(dataset);
  if (!question || !idValid(question.id) || question.datasetId !== dataset.id || !kinds.has(question.kind) || !['graph', 'comparison'].includes(question.activity)) fail('invalid_question');
  if ('answerKey' in question || 'correctAnswer' in question) fail('manual_answer_key_not_allowed');
  if (!Array.isArray(question.targets) || new Set(question.targets).size !== question.targets.length || question.targets.some(id => !dataset.categories.some(category => category.id === id))) fail('invalid_targets');
  const targets = question.targets.map(id => dataset.categories.find(category => category.id === id));
  const extrema = question.kind === 'max_value' || question.kind === 'min_value';
  if (targets.length !== (extrema ? 0 : question.kind === 'exact_value' ? 1 : 2)) fail('invalid_targets');
  let winners;
  if (extrema) {
    const value = (question.kind === 'max_value' ? Math.max : Math.min)(...dataset.categories.map(category => category.value));
    winners = dataset.categories.filter(category => category.value === value);
    if (question.tiePolicy !== undefined && !['unique', 'all'].includes(question.tiePolicy)) fail('invalid_tie_policy');
    if (winners.length > 1 && question.tiePolicy !== 'all') fail('ambiguous_extreme');
  }
  if (question.activity === 'graph') {
    if (extrema) return { type: 'categories', ids: winners.map(category => category.id) };
    if (question.kind === 'exact_value') return { type: 'number', value: targets[0].value };
    if (question.kind === 'difference') return { type: 'number', value: Number(Math.abs(targets[0].value - targets[1].value).toFixed(dataset.precision)) };
    fail('invalid_graph_kind');
  }
  if (extrema) {
    if (winners.length !== 1 || !['count', 'mass'].includes(dataset.unitKind)) fail('ambiguous_comparison');
    return { type: 'expression', expression: question.kind === 'max_value' ? 'the_most' : 'the_least', subject: winners[0] };
  }
  const greater = question.kind === 'greater_than';
  if (!['greater_than', 'less_than'].includes(question.kind) || (greater ? targets[0].value <= targets[1].value : targets[0].value >= targets[1].value)) fail('contradictory_relation');
  return { type: 'expression', expression: grammarPairs[dataset.unitKind][greater ? 0 : 1], subject: targets[0], object: targets[1] };
}

export const graphExpressionChoices = (question, dataset) => ['max_value', 'min_value'].includes(question.kind) ? ['the_most', 'the_least'] : grammarPairs[dataset.unitKind];

export function graphComparisonSentence(dataset, expression, subject, object) {
  if (expression === 'the_most' || expression === 'the_least') {
    const phrase = expression === 'the_most' ? 'the most' : 'the least';
    const name = subject.sentenceLabel || subject.label;
    return dataset.unitKind === 'count' ? `${name[0].toUpperCase() + name.slice(1)} are ${phrase} popular ${dataset.itemNoun || 'choice'}.` : `${subject.label} has ${phrase} ${dataset.noun}.`;
  }
  if (dataset.unitKind === 'count') {
    const quantifier = expression === 'more_than' ? 'More' : expression === 'fewer_than' ? 'Fewer' : 'Less';
    return `${quantifier} ${dataset.noun} like ${subject.sentenceLabel || subject.label.toLowerCase()} than ${object.sentenceLabel || object.label.toLowerCase()}.`;
  }
  if (dataset.unitKind === 'mass') return `${subject.label} has ${expression === 'more_than' ? 'more' : expression === 'fewer_than' ? 'fewer' : 'less'} ${dataset.noun} than ${object.label}.`;
  const phrase = expression.replaceAll('_', ' ');
  return dataset.unitKind === 'temperature' ? `The temperature on ${subject.label} is ${phrase} on ${object.label}.` : `${subject.label} is ${phrase} ${object.label}.`;
}

export function graphQuestionPrompt(question, dataset) {
  if (question.activity === 'comparison') return question.interaction === 'cards' ? 'Arrange the words to make a true comparison.' : 'Which sentence correctly describes the graph?';
  const targets = question.targets.map(id => dataset.categories.find(category => category.id === id));
  if (question.kind === 'max_value') return `Which ${dataset.itemNoun || 'category'} has the highest value?${question.tiePolicy === 'all' ? ' Select all that apply.' : ''}`;
  if (question.kind === 'min_value') return `Which ${dataset.itemNoun || 'category'} has the lowest value?${question.tiePolicy === 'all' ? ' Select all that apply.' : ''}`;
  if (question.kind === 'exact_value') return `What is the value for ${targets[0].label}, in ${dataset.unit}?`;
  return `What is the difference between ${targets[0].label} and ${targets[1].label}, in ${dataset.unit}?`;
}

export function graphExpectedSentence(question, dataset) {
  const result = graphExpectedResult(question, dataset);
  return graphComparisonSentence(dataset, result.expression, result.subject, result.object);
}

const choiceCorrect = (option, expected) => expected.type === 'categories' ? expected.ids.includes(option.categoryId)
  : expected.type === 'number' ? option.value === expected.value : option.expression === expected.expression;

export function assertGraphQuestion(question, dataset) {
  const expected = graphExpectedResult(question, dataset);
  if (!['choice', 'multi', 'cards'].includes(question.interaction) || !textValid(question.learningObjective) || !['easy', 'medium'].includes(question.difficulty)) fail('invalid_question_metadata');
  if (question.interaction === 'cards') {
    if (question.activity !== 'comparison' || !Array.isArray(question.bankWords) || question.bankWords.length > 20 || !question.bankWords.every(textValid)) fail('invalid_word_cards');
    const words = graphExpectedSentence(question, dataset).split(' ');
    if (JSON.stringify([...words].sort()) !== JSON.stringify([...question.bankWords].sort())) fail('contradictory_word_cards');
  } else {
    const options = question.options;
    if (!Array.isArray(options) || options.length < 2 || options.length > 8 || !options.every(option => idValid(option?.id)) || new Set(options.map(option => option.id)).size !== options.length) fail('invalid_options');
    if (expected.type === 'number' && !options.every(option => Number.isFinite(option.value))) fail('invalid_numeric_options');
    if (expected.type === 'categories' && !options.every(option => dataset.categories.some(category => category.id === option.categoryId))) fail('invalid_category_options');
    if (expected.type === 'expression' && !options.every(option => expressions.includes(option.expression))) fail('invalid_expression_options');
    if (expected.type === 'expression' && !options.every(option => graphExpressionChoices(question, dataset).includes(option.expression))) fail('grammar_mismatch');
    const expectedCount = expected.type === 'categories' ? expected.ids.length : 1;
    if (options.filter(option => choiceCorrect(option, expected)).length !== expectedCount) fail('ambiguous_options');
    if ((expectedCount > 1 || question.tiePolicy === 'all') && question.interaction !== 'multi') fail('multi_answer_required');
    if (expectedCount === 1 && question.interaction === 'multi' && question.tiePolicy !== 'all') fail('invalid_multi');
  }
  return question;
}

export function publicGraphQuestion(question, dataset) {
  assertGraphQuestion(question, dataset);
  const expected = graphExpectedResult(question, dataset);
  const max = Math.max(1, ...dataset.categories.map(category => category.value));
  const magnitude = 10 ** Math.floor(Math.log10(max / 5));
  const step = Math.max(10 ** -dataset.precision, [1, 2, 5, 10].map(value => value * magnitude).find(value => value >= max / 5));
  const chart = { type: 'chart', chartType: dataset.chartType, title: dataset.title, xLabel: dataset.xLabel, yLabel: dataset.unit, maximum: Math.ceil(max / step) * step, step, precision: dataset.precision, points: dataset.categories.map(({ id, label, value }) => ({ id, label, value })) };
  const view = { id: question.id, activity: question.activity, interaction: question.interaction, learningObjective: question.learningObjective, difficulty: question.difficulty, prompt: graphQuestionPrompt(question, dataset), chart };
  if (question.interaction === 'cards') view.tokens = question.bankWords.map((text, index) => ({ id: `words:0:${index}`, text }));
  else view.options = question.options.map(option => ({ id: option.id, text: expected.type === 'number' ? `${option.value} ${dataset.unit}` : expected.type === 'categories' ? dataset.categories.find(category => category.id === option.categoryId).label : graphComparisonSentence(dataset, option.expression, expected.subject, expected.object) }));
  return view;
}

export function checkGraphAnswer(question, dataset, response) {
  assertGraphQuestion(question, dataset);
  const expected = graphExpectedResult(question, dataset);
  let correct;
  if (question.interaction === 'cards') {
    if (!Array.isArray(response) || response.length !== question.bankWords.length || new Set(response).size !== response.length) fail('invalid_token_response');
    const tokens = question.bankWords.map((text, index) => ({ id: `words:0:${index}`, text }));
    if (response.some(id => !tokens.some(token => token.id === id))) fail('unknown_token');
    correct = response.map(id => tokens.find(token => token.id === id).text).join(' ') === graphExpectedSentence(question, dataset);
  } else {
    const selected = question.interaction === 'multi' ? response : [response];
    if (!Array.isArray(selected) || !selected.length || new Set(selected).size !== selected.length || selected.some(id => !question.options.some(option => option.id === id))) fail('invalid_option_response');
    const correctOptions = question.options.filter(option => choiceCorrect(option, expected)).map(option => option.id);
    correct = selected.length === correctOptions.length && selected.every(id => correctOptions.includes(id));
  }
  let explanation;
  if (expected.type === 'categories') explanation = dataset.categories.filter(category => expected.ids.includes(category.id)).map(category => `${category.label}: ${category.value} ${dataset.unit}`).join(', ');
  else if (expected.type === 'number') explanation = question.kind === 'difference'
    ? `${question.targets.map(id => dataset.categories.find(category => category.id === id).value).sort((first, second) => second - first).join(' − ')} = ${expected.value} ${dataset.unit}`
    : `${dataset.categories.find(category => category.id === question.targets[0]).label}: ${expected.value} ${dataset.unit}`;
  else explanation = `${graphExpectedSentence(question, dataset)}${dataset.unitKind === 'count' && expected.expression === 'fewer_than' ? ' — students เป็นคำนามนับได้ จึงใช้ fewer students' : dataset.unitKind === 'mass' ? ` — ${dataset.noun} เป็นคำนามนับไม่ได้ ใช้ more หรือ less` : ''}`;
  return { correct, feedback: correct ? 'ถูกต้อง! อ่านข้อมูลและใช้คำเปรียบเทียบได้ดี' : 'ยังไม่ถูก ลองดูค่าจากกราฟและคำอธิบาย แล้วตอบข้อนี้ใหม่', explanation, rewardsAwarded: false };
}
