export function getOrderingActivities(mission) {
  return [
    { id: 'words', label: 'เรียงคำ', rounds: mission?.wordSentences },
    { id: 'steps', label: 'เรียงเหตุการณ์', rounds: mission?.sentences },
  ].filter(activity => Array.isArray(activity.rounds) && activity.rounds.length > 0);
}

export function isOrderingActivityValid(activity) {
  if (!activity || !Array.isArray(activity.rounds) || !activity.rounds.length) return false;
  return activity.rounds.every(round => {
    if (!round) return false;
    if (activity.id === 'words') {
      return Array.isArray(round.words) && round.words.length > 0
        && round.words.every(word => typeof word === 'string' && word.trim())
        && typeof round.correct === 'string' && round.correct.trim().length > 0;
    }
    const steps = round.steps;
    return Array.isArray(steps) && steps.length > 0
      && steps.every(step => typeof step.id === 'string' && step.id && typeof step.text === 'string' && step.text.trim())
      && new Set(steps.map(step => step.id)).size === steps.length
      && Array.isArray(round.correctOrder) && round.correctOrder.length === steps.length
      && new Set(round.correctOrder).size === steps.length
      && round.correctOrder.every(id => steps.some(step => step.id === id));
  });
}

export function createOrderingTokens(round, mode, roundIndex) {
  const items = mode === 'words' ? round.words : round.steps;
  return items.map((item, index) => ({
    id: `${mode}:${roundIndex}:${index}`, position: index + 1,
    text: mode === 'words' ? item : item.text,
    sourceId: mode === 'words' ? null : item.id,
  }));
}

function shuffleTokens(tokens) {
  const shuffled = [...tokens];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const targetIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[targetIndex]] = [shuffled[targetIndex], shuffled[index]];
  }
  return shuffled;
}

export function createOrderingState(activity) {
  return {
    activity, index: 0, correct: 0, arranged: [],
    remaining: shuffleTokens(createOrderingTokens(activity.rounds[0], activity.id, 0)),
    submitted: false, isCorrect: false, phase: 'play', focusTarget: null,
  };
}

export function orderingReducer(state, action) {
  if (state.phase !== 'play') return state;
  if (action.type === 'next') {
    if (!state.submitted) return state;
    const index = state.index + 1;
    if (index >= state.activity.rounds.length) return { ...state, phase: 'done', focusTarget: 'result' };
    return {
      ...state, index, arranged: [], submitted: false, isCorrect: false, focusTarget: 'heading',
      remaining: shuffleTokens(createOrderingTokens(state.activity.rounds[index], state.activity.id, index)),
    };
  }
  if (state.submitted) return state;
  if (action.type === 'add' || action.type === 'remove') {
    const source = action.type === 'add' ? state.remaining : state.arranged;
    const token = source.find(item => item.id === action.id);
    if (!token) return state;
    return action.type === 'add' ? {
      ...state, arranged: [...state.arranged, token],
      remaining: state.remaining.filter(item => item.id !== token.id), focusTarget: 'remaining',
    } : {
      ...state, arranged: state.arranged.filter(item => item.id !== token.id),
      remaining: [...state.remaining, token], focusTarget: 'arranged',
    };
  }
  if (action.type === 'check') {
    if (state.remaining.length || !state.arranged.length) return state;
    const round = state.activity.rounds[state.index];
    const isCorrect = state.activity.id === 'words'
      ? state.arranged.map(token => token.text).join(' ') === round.correct
      : state.arranged.length === round.correctOrder.length
        && state.arranged.every((token, index) => token.sourceId === round.correctOrder[index]);
    return { ...state, submitted: true, isCorrect, correct: state.correct + Number(isCorrect), focusTarget: 'next' };
  }
  return state;
}
