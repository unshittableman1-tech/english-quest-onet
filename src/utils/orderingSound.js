import { orderingReducer } from './orderingGame.js';

export function chooseTokenWithSound(state, token, selected, enabled, { dispatch, speak }) {
  if (state.phase !== 'play' || state.submitted) return;
  dispatch({ type: selected ? 'remove' : 'add', id: token.id });
  if (enabled && !selected && state.activity.id === 'words' && state.remaining.some(item => item.id === token.id)) speak(token.text);
}

export function checkOrderingWithSound(state, enabled, { dispatch, success }) {
  const next = orderingReducer(state, { type: 'check' });
  if (next === state) return;
  dispatch({ type: 'check' });
  if (enabled && next.isCorrect) success();
}
