import { assertGraphQuestion, graphExpectedResult, graphExpectedSentence } from './graphComparison.js';
import { isLabelingDefinitionValid, checkLabelingAnswer } from './labelingGame.js';
import { createOrderingTokens, isOrderingActivityValid } from './orderingGame.js';

const safeId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(value);
function item(id, kind, allowedIds, accepted, extra = {}) {
  if (!safeId(id) || allowedIds.length > 100 || !allowedIds.length || accepted.length > 100
    || !accepted.length || accepted.some(answer => !answer.length || answer.length > 100)) throw new Error('content_limit');
  return { id, kind, allowedIds, accepted, ...extra };
}

function equivalentSequences(words, tokens) {
  const solutions = [];
  const visit = (position, used, ids) => {
    if (solutions.length > 100) throw new Error('too_many_equivalent_answers');
    if (position === words.length) { solutions.push(ids); return; }
    for (const token of tokens) if (!used.has(token.id) && token.text === words[position]) {
      visit(position + 1, new Set([...used, token.id]), [...ids, token.id]);
    }
  };
  if (words.length !== tokens.length) throw new Error('invalid_word_bank');
  visit(0, new Set(), []);
  if (!solutions.length || solutions.length > 100) throw new Error('invalid_word_bank');
  return solutions;
}

export function compileGraphItem(question, dataset) {
  assertGraphQuestion(question, dataset);
  if (question.interaction === 'cards') {
    const tokens = question.bankWords.map((text, index) => ({ text, id: `words:0:${index}` }));
    return item(question.id, 'sequence', tokens.map(token => token.id), equivalentSequences(graphExpectedSentence(question, dataset).split(' '), tokens));
  }
  const expected = graphExpectedResult(question, dataset);
  const correct = question.options.filter(option => expected.type === 'categories' ? expected.ids.includes(option.categoryId)
    : expected.type === 'number' ? option.value === expected.value : option.expression === expected.expression).map(option => option.id);
  return item(question.id, question.interaction === 'multi' ? 'set' : 'choice', question.options.map(option => option.id), [[...correct].sort()]);
}

export function compileLabelingItem(definition) {
  if (!isLabelingDefinitionValid(definition) || !safeId(definition.id)
    || ![...definition.hotspots, ...definition.labels].every(entry => safeId(entry.id))) throw new Error('invalid_definition');
  const allowedIds = definition.hotspots.flatMap(spot => definition.labels.map(label => `${spot.id}:${label.id}`));
  const accepted = [definition.hotspots.map(spot => `${spot.id}:${definition.answerKey[spot.id]}`).sort()];
  return item(definition.id, 'labeling', allowedIds, accepted, { allowReuse: definition.allowReuse === true });
}

export function normalizeLabelingResponse(definition, placements) {
  checkLabelingAnswer(definition, placements);
  return Object.entries(placements).map(([spot, label]) => `${spot}:${label}`).sort();
}

export function compileOrderingActivity(activity) {
  if (!isOrderingActivityValid(activity)) throw new Error('invalid_ordering_activity');
  return activity.rounds.map((round, index) => {
    const tokens = createOrderingTokens(round, activity.id, index);
    const accepted = activity.id === 'words'
      ? equivalentSequences(round.correct.split(' '), tokens)
      : [round.correctOrder.map(sourceId => tokens.find(token => token.sourceId === sourceId).id)];
    return item(round.id, 'sequence', tokens.map(token => token.id), accepted);
  });
}
