const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const uniqueIds = items => items.every(item => validId(item?.id)) && new Set(items.map(item => item.id)).size === items.length;

export function isLabelingDefinitionValid(definition, requireAnswers = true) {
  if (!definition || definition.type !== 'image_labeling' || !validId(definition.id)) return false;
  if (typeof definition.image !== 'string' || !definition.image.startsWith('/') || definition.image.startsWith('//') || definition.image.includes('..')) return false;
  if (!Number.isInteger(definition.imageWidth) || !Number.isInteger(definition.imageHeight) || definition.imageWidth < 1 || definition.imageHeight < 1) return false;
  const { labels, hotspots } = definition;
  if (!Array.isArray(labels) || !Array.isArray(hotspots) || !labels.length || !hotspots.length || labels.length > 24 || hotspots.length > 12) return false;
  if (!uniqueIds(labels) || !uniqueIds(hotspots)) return false;
  if (!labels.every(label => typeof label.text === 'string' && label.text.trim() && label.text.length <= 80)) return false;
  if (!hotspots.every(spot => Number.isFinite(spot.x) && Number.isFinite(spot.y) && spot.x >= 0 && spot.x <= 1 && spot.y >= 0 && spot.y <= 1)) return false;
  if (!requireAnswers) return true;
  const answers = definition.answerKey;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length !== hotspots.length) return false;
  if (!hotspots.every(spot => Object.hasOwn(answers, spot.id) && labels.some(label => label.id === answers[spot.id]))) return false;
  return definition.allowReuse === true || new Set(Object.values(answers)).size === hotspots.length;
}

export function publicLabelingDefinition(definition) {
  if (!isLabelingDefinitionValid(definition)) throw new Error('invalid_definition');
  return {
    id: definition.id, type: definition.type, title: definition.title, objective: definition.objective,
    image: definition.image, imageAlt: definition.imageAlt, imageWidth: definition.imageWidth, imageHeight: definition.imageHeight,
    previewOnly: true, reviewStatus: 'synthetic_test_fixture', allowReuse: definition.allowReuse === true,
    labels: definition.labels.map(({ id, text, description }) => ({ id, text, description })),
    hotspots: definition.hotspots.map(({ id, x, y }) => ({ id, x, y })),
  };
}

export function checkLabelingAnswer(definition, placements) {
  if (!isLabelingDefinitionValid(definition)) throw new Error('invalid_definition');
  if (!placements || typeof placements !== 'object' || Array.isArray(placements)) throw new Error('invalid_placements');
  const entries = Object.entries(placements);
  if (entries.length !== definition.hotspots.length) throw new Error('incomplete_placements');
  if (!entries.every(([spotId, labelId]) => definition.hotspots.some(spot => spot.id === spotId) && definition.labels.some(label => label.id === labelId))) throw new Error('unknown_id');
  if (definition.allowReuse !== true && new Set(Object.values(placements)).size !== entries.length) throw new Error('reused_label');
  const results = definition.hotspots.map((spot, index) => {
    const expected = definition.labels.find(label => label.id === definition.answerKey[spot.id]);
    const correct = placements[spot.id] === expected.id;
    return { hotspotId: spot.id, correct, correctText: expected.text, feedback: `ตำแหน่ง ${index + 1}: ${expected.text}${expected.meaning ? ` — ${expected.meaning}` : ''}` };
  });
  return { correct: results.filter(result => result.correct).length, total: results.length, results, rewardsAwarded: false };
}

export function createLabelingState(definition) {
  return { definition, placements: {}, selected: null, phase: 'play', result: null, message: '', attemptId: null };
}

export function isLabelingComplete(state) {
  return state.definition.hotspots.every(spot => Object.hasOwn(state.placements, spot.id));
}

export function labelingReducer(state, action) {
  if (action.type === 'retry' && state.phase === 'review') return createLabelingState(state.definition);
  if (action.type === 'checked' && state.phase === 'checking') return { ...state, phase: 'review', result: action.result, message: '' };
  if (action.type === 'failed' && state.phase === 'checking') return { ...state, phase: 'play', message: 'ตรวจคำตอบไม่สำเร็จ ลองกดตรวจอีกครั้ง ข้อมูลที่ติดป้ายยังอยู่' };
  if (state.phase !== 'play') return state;
  if (action.type === 'select' && state.definition.labels.some(label => label.id === action.id)) return { ...state, selected: action.id, message: 'เลือกตำแหน่งบนภาพที่ต้องการติดป้าย' };
  if (action.type === 'place' && state.definition.hotspots.some(spot => spot.id === action.id)) {
    if (!state.selected) return { ...state, message: 'เลือกคำศัพท์ก่อน แล้วแตะตำแหน่งบนภาพ' };
    const placements = { ...state.placements };
    if (!state.definition.allowReuse) for (const [spotId, labelId] of Object.entries(placements)) if (labelId === state.selected) delete placements[spotId];
    placements[action.id] = state.selected;
    return { ...state, placements, selected: null, attemptId: null, message: 'ติดป้ายแล้ว เลือกคำอื่นต่อ หรือเลือกคำเดิมเพื่อย้ายตำแหน่ง' };
  }
  if (action.type === 'remove' && Object.hasOwn(state.placements, action.id)) {
    const placements = { ...state.placements };
    delete placements[action.id];
    return { ...state, placements, attemptId: null, message: 'นำป้ายออกแล้ว' };
  }
  if (action.type === 'check' && isLabelingComplete(state)) return { ...state, phase: 'checking', attemptId: action.attemptId, message: '' };
  return state;
}
