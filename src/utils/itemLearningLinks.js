import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { ITEM_LEARNING_LINKS } from '../data/itemLearningLinks';

const text = value => typeof value === 'string' && value.trim().length > 0;
const stable = value => {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
};
const serialize = value => JSON.stringify(stable(value));
const hash = value => bytesToHex(sha256(new TextEncoder().encode(serialize(value))));

// Bind only single-step, text-only practice items in this first pilot. Preserve
// answer text when options are shuffled; never rely on the displayed index.
export function itemLearningSnapshot(question) {
  if (!question || question.type === 'two_step' || question.reasonChoices ||
      question.image || question.mediaRequired || question.chart || question.chartData ||
      question.table || question.tableData || question.document || question.stimulus ||
      !text(question.id) || !text(question.quest) || !text(question.question) ||
      !Array.isArray(question.options) || question.options.length !== 4 ||
      !question.options.every(text) || new Set(question.options).size !== 4 ||
      !Number.isInteger(question.answer) || question.answer < 0 || question.answer >= 4) return null;
  return {
    id: question.id, questId: question.quest,
    version: question.itemVersion ?? question.version ?? 'legacy-unversioned',
    question: question.question, passage: question.passage ?? null,
    options: [...question.options].sort(), correctOption: question.options[question.answer],
  };
}

// An approval fingerprint binds the exact authored learning payload. This is a
// stale-review guard, not a signature or a substitute for reviewer identity checks.
export function learningLinkFingerprint(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const { review, technicalReview, ...payload } = entry;
  return hash(payload);
}

export function validateItemLearningLink(entry, question) {
  const errors=[];
  const snapshot=itemLearningSnapshot(question);
  if (!entry || !snapshot) return ['unsupported_or_missing_item'];
  if (entry.questionId !== snapshot.id || entry.questId !== snapshot.questId ||
      serialize(entry.questionSnapshot) !== serialize(snapshot)) errors.push('stale_question');
  if (![entry.version,entry.skillId,entry.patternId,entry.patternTh,entry.questionMeaningTh,entry.explanationTh].every(text)) errors.push('missing_learning_content');
  if (!Array.isArray(entry.evidence) || !entry.evidence.length || entry.evidence.some(e =>
    !e || !['question','passage'].includes(e.field) || !text(e.quote) || !text(e.explanationTh) ||
    !String(snapshot[e.field] || '').includes(e.quote))) errors.push('invalid_evidence');
  if (!Array.isArray(entry.vocabulary) || !entry.vocabulary.length || entry.vocabulary.some(v =>
    !v || !text(v.catalogId) || !text(v.word) || !text(v.meaningTh))) errors.push('invalid_vocabulary');
  if (!entry.remediation || !text(entry.remediation.questId) || !text(entry.remediation.activityTh)) errors.push('missing_remediation');
  if (!Array.isArray(entry.optionExplanations) || entry.optionExplanations.length !== 4 ||
      entry.optionExplanations.some(o => !o || typeof o !== 'object') ||
      new Set(entry.optionExplanations.map(o => o.option)).size !== 4 ||
      entry.optionExplanations.some(o => !snapshot.options.includes(o.option) || !text(o.explanationTh) ||
        o.correct !== (o.option === snapshot.correctOption))) errors.push('invalid_option_explanations');
  return errors;
}

export function getItemLearningFeedback(question, context = {}, registry = ITEM_LEARNING_LINKS) {
  if (!Array.isArray(registry) || context.mode !== 'practice' || context.phase !== 'after_answer' || context.isExamMode ||
      !text(context.questId) || /boss/i.test(context.questId) || question?.quest !== context.questId) return null;
  const entries = registry.filter(e => e?.questId === context.questId && e.questionId === question?.id);
  if (entries.length !== 1) return null;
  const entry = entries[0], review = entry.review;
  if (review?.status !== 'approved' || !text(review.reviewerId) || !text(review.reviewedAt) ||
      !Number.isFinite(Date.parse(review.reviewedAt)) || review.fingerprint !== learningLinkFingerprint(entry) ||
      validateItemLearningLink(entry,question).length) return null;
  return structuredClone({
    questionMeaningTh:entry.questionMeaningTh, patternTh:entry.patternTh,
    explanationTh:entry.explanationTh, evidence:entry.evidence, vocabulary:entry.vocabulary,
    remediation:entry.remediation,
    optionExplanations:question.options.map(option=>entry.optionExplanations.find(o=>o.option===option)),
  });
}
