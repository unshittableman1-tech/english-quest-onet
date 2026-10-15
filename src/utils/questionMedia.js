const SUPPORTED = new Set(['image', 'passage', 'table', 'chart', 'sequence']);
const isText = value => typeof value === 'string' && value.trim().length > 0;
const isCell = value => typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));

function isValidStimulus(s) {
  if (!s || !SUPPORTED.has(s.type)) return false;
  if (s.type === 'image') return isText(s.src);
  if (s.type === 'passage') return isText(s.text);
  if (s.type === 'table') return Array.isArray(s.columns) && s.columns.length > 0 && s.columns.every(isText) &&
    Array.isArray(s.rows) && s.rows.length > 0 && s.rows.every(row => Array.isArray(row) && row.length === s.columns.length && row.every(isCell));
  if (s.type === 'sequence') return Array.isArray(s.steps) && s.steps.length >= 2 && s.steps.every(isText);
  return ['bar', 'line'].includes(s.chartType) && isText(s.title) && isText(s.xLabel) && isText(s.yLabel) &&
    Number.isFinite(s.maximum) && s.maximum > 0 && Number.isFinite(s.step) && s.step > 0 && s.maximum / s.step <= 20 &&
    (s.precision === undefined || (Number.isInteger(s.precision) && s.precision >= 0 && s.precision <= 3)) &&
    Array.isArray(s.points) && s.points.length >= 2 && s.points.length <= 20 &&
    s.points.every(p => p && isText(p.label) && Number.isFinite(p.value) && p.value >= 0 && p.value <= s.maximum);
}

// Legacy fields remain usable, but their presence is not a content-review approval.
export function getQuestionStimuli(question = {}) {
  if (Array.isArray(question.stimuli)) return question.stimuli;
  return [
    question.passage && { type: 'passage', text: question.passage },
    question.image && { type: 'image', src: question.image, alt: question.imageAlt || '' },
  ].filter(Boolean);
}

export function inspectQuestionMedia(question = {}) {
  const stimuli = getQuestionStimuli(question);
  const stem = question.question || '';
  const placeholder = !stimuli.length && /\((?:Recycle symbol|Juice box symbol|Hot drink|สัญลักษณ์[^)]*|ป้าย[^)]*)\)|(?:this symbol|this sign|this picture)[^()]*\([^)]*\)|symbol means:\s*\p{Extended_Pictographic}/iu.test(stem);
  const missing = question.mediaRequired === true && !stimuli.length;
  const invalid = stimuli.some(s => !isValidStimulus(s));
  const status = invalid ? 'render_failure' : placeholder ? 'placeholder' : missing ? 'missing' :
    !stimuli.length ? 'not_required' : question.mediaReview?.status === 'verified' && question.mediaReview?.reviewer && question.mediaReview?.version &&
      (!question.itemVersion || question.itemVersion === question.mediaReview.version) ? 'verified' : 'present_unverified';
  return { status, stimuli, needsManualReview: /picture|chart|graph|table|map|symbol|sign/iu.test(stem), blocked: ['missing', 'placeholder', 'render_failure'].includes(status) };
}

export function isMediaReleaseEligible(question, mode = 'practice_assessment') {
  const { status, needsManualReview } = inspectQuestionMedia(question);
  return question.reviewStatus === 'approved' && (!Array.isArray(question.approvedModes) || question.approvedModes.includes(mode)) && (status === 'verified' ||
    (status === 'not_required' && (!needsManualReview || question.mediaReview?.status === 'not_required')));
}

// Legacy practice can continue while its content audit is pending; broken stimuli cannot.
export function isPracticeQuestionReady(question) {
  const inspection = inspectQuestionMedia(question);
  return !questionReviewPending(question) && !inspection.blocked && inspection.status !== 'present_unverified' &&
    (!Array.isArray(question.approvedModes) || question.approvedModes.includes('practice_assessment'));
}

export function preloadQuestionMedia(questions, loadImage = src => new Promise((resolve, reject) => {
  const img = new Image();
  const timeout = setTimeout(() => finish(new Error('Image load timeout')), 15000);
  function finish(error) {
    clearTimeout(timeout);
    img.onload = img.onerror = null;
    error ? reject(error) : resolve();
  }
  img.onload = () => img.naturalWidth > 0 ? finish() : finish(new Error('Empty image'));
  img.onerror = () => finish(new Error('Image unavailable'));
  img.src = src;
})) {
  const bad = questions.filter(q => {
    const inspection = inspectQuestionMedia(q);
    return inspection.blocked || inspection.status === 'present_unverified' || questionReviewPending(q);
  });
  if (bad.length) return Promise.reject(new Error(`Incomplete question media: ${bad.map(q => q.id).join(', ')}`));
  const images = new Set(questions.flatMap(q => getQuestionStimuli(q).filter(s => s.type === 'image').map(s => s.src)));
  return Promise.all([...images].map(loadImage));
}

function questionReviewPending(question) {
  return ['pending_teacher', 'rejected', 'quarantined'].includes(question.reviewStatus);
}
