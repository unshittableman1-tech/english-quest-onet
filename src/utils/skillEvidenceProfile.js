import { SKILL_PRACTICE_SCOPES, SKILL_PRACTICE_SCOPE_VERSION } from '../data/skillPracticeScopes';
import { isPracticeQuestionReady } from './questionMedia';
import { evidenceOwner } from './vocabWordEvidence';

const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? Date.parse(value) : null;
const latestDate = values => {
  const dates = values.map(timestamp).filter(value => value !== null);
  return dates.length ? new Date(Math.max(...dates)).toISOString() : null;
};
const groupBy = (values, keyOf) => {
  const groups = new Map();
  for (const value of values) {
    const key = keyOf(value);
    groups.set(key, [...(groups.get(key) || []), value]);
  }
  return groups;
};
const itemKey = (id, version) => JSON.stringify([id, version]);
const recordedRounds = result => {
  const value = result.roundsPlayed ?? result.attempts;
  return Number.isInteger(value) && value > 0 ? value : null;
};

function resolveCandidates(items) {
  if (new Set(items.map(item => item.skillId)).size !== 1) return null;
  const outcome = item => JSON.stringify([item.correct, item.corrected]);
  const conflicting = new Set(items.map(outcome)).size > 1;
  if (conflicting && items.some(item => item.timeBasis !== 'assessment')) return null;
  const ordered = [...items].sort((left, right) => Number(right.timeBasis === 'assessment') - Number(left.timeBasis === 'assessment')
    || (timestamp(right.at) ?? -Infinity) - (timestamp(left.at) ?? -Infinity)
    || left.questId.localeCompare(right.questId));
  const latest = ordered[0];
  if (conflicting && ordered.some(item => item.at === latest.at && outcome(item) !== outcome(latest))) return null;
  return latest;
}

function validFirstResponses(evidence) {
  return evidence?.policy === 'first_response_v1'
    && Number.isInteger(evidence.total) && evidence.total > 0
    && Number.isInteger(evidence.score) && evidence.score >= 0 && evidence.score <= evidence.total
    && Array.isArray(evidence.items) && evidence.items.length === evidence.total
    && evidence.items.every(item => item && typeof item.id === 'string' && item.id
      && typeof item.version === 'string' && item.version && typeof item.firstCorrect === 'boolean'
      && (item.finalCorrect === undefined || typeof item.finalCorrect === 'boolean'))
    && new Set(evidence.items.map(item => item.id)).size === evidence.total
    && evidence.items.filter(item => item.firstCorrect).length === evidence.score;
}

function summarizeWordPractice(student, wordEvidence) {
  const summary = { unassisted: { correct: 0, total: 0 }, assisted: { correct: 0, total: 0 }, latestAt: null, conflictingEvents: 0 };
  const owner = evidenceOwner(student);
  if (!owner || wordEvidence?.owner !== owner || wordEvidence.history?.version !== 1
      || !Array.isArray(wordEvidence.history.events)) return summary;
  const dates = [];
  const events = wordEvidence.history.events.filter(event => event && typeof event.eventId === 'string' && event.eventId);
  for (const copies of groupBy(events, event => event.eventId).values()) {
    const signature = event => JSON.stringify([event.wordId, event.word, event.categoryId, event.mode, event.correct, event.assisted, event.at]);
    if (new Set(copies.map(signature)).size !== 1) { summary.conflictingEvents += 1; continue; }
    const event = copies[0];
    if (typeof event.wordId !== 'string' || !event.wordId || typeof event.word !== 'string'
        || typeof event.categoryId !== 'string' || !['quick_check', 'speed'].includes(event.mode)
        || typeof event.correct !== 'boolean' || typeof event.assisted !== 'boolean' || timestamp(event.at) === null) continue;
    dates.push(event.at);
    const bucket = event.assisted ? summary.assisted : summary.unassisted;
    bucket.total += 1;
    if (event.correct) bucket.correct += 1;
  }
  summary.latestAt = latestDate(dates);
  return summary;
}

export function buildSkillEvidenceProfile(student, quests = [], wordEvidence = null) {
  const catalog = groupBy((Array.isArray(quests) ? quests : []).filter(quest => quest?.id), quest => quest.id);
  const progress = student?.questProgress || {};
  const excluded = { aggregateOnly: 0, invalidRecords: 0, unmatchedItems: 0, heldItems: 0, ambiguousItems: 0, ambiguousMetadata: 0 };
  const allCandidates = [];
  for (const skill of SKILL_PRACTICE_SCOPES) {
    for (const questId of skill.questIds) {
      const result = progress[questId];
      if (!result) continue;
      const definitions = catalog.get(questId) || [];
      if (definitions.length > 1) { excluded.ambiguousMetadata += 1; continue; }
      const quest = definitions[0];
      if (!quest || quest.isExam || !Array.isArray(quest.questions)) continue;
      const evidence = result.lastAssessment;
      if (!evidence) { excluded.aggregateOnly += 1; continue; }
      if (!validFirstResponses(evidence)) { excluded.invalidRecords += 1; continue; }
      const questions = groupBy(quest.questions.filter(question => question && typeof question.id === 'string'),
        question => itemKey(question.id, question.itemVersion || 'legacy-v1'));
      const assessmentAt = latestDate([evidence.completedAt]);
      const at = assessmentAt || latestDate([result.lastPlayed]);
      const timeBasis = assessmentAt ? 'assessment' : at ? 'quest_activity' : 'unknown';
      for (const item of evidence.items) {
        const matches = questions.get(itemKey(item.id, item.version)) || [];
        if (matches.length > 1) { excluded.ambiguousMetadata += 1; continue; }
        const question = matches[0];
        if (!question) { excluded.unmatchedItems += 1; continue; }
        if ((question.reviewStatus && question.reviewStatus !== 'approved') || !isPracticeQuestionReady(question)) { excluded.heldItems += 1; continue; }
        allCandidates.push({ skillId: skill.id, questId, name: quest.name || questId, id: item.id, version: item.version,
          correct: item.firstCorrect, corrected: item.finalCorrect === true && !item.firstCorrect, at, timeBasis, rounds: recordedRounds(result) });
      }
    }
  }

  const candidates = [];
  for (const items of groupBy(allCandidates, item => itemKey(item.id, item.version)).values()) {
    const candidate = resolveCandidates(items);
    if (candidate) candidates.push(candidate);
    else excluded.ambiguousItems += 1;
  }

  const wordPractice = summarizeWordPractice(student, wordEvidence);
  const skills = SKILL_PRACTICE_SCOPES.map(skill => {
    const items = candidates.filter(item => item.skillId === skill.id);
    const correct = items.filter(item => item.correct).length;
    const sources = new Map();
    for (const item of items) {
      const key = JSON.stringify([item.questId, item.version]);
      const source = sources.get(key) || { questId: item.questId, name: item.name, version: item.version, correct: 0, total: 0,
        at: item.at, timeBasis: item.timeBasis, rounds: item.rounds };
      source.total += 1; source.correct += Number(item.correct);
      source.at = latestDate([source.at, item.at]); sources.set(key, source);
    }
    const hasDrill = skill.id === 'vocabulary' && wordPractice.unassisted.total + wordPractice.assisted.total > 0;
    return { id: skill.id, name: skill.name, english: skill.english, scope: skill.scope,
      status: items.length || hasDrill ? 'practice_only' : 'no_evidence',
      correct, total: items.length, percent: items.length ? Math.round(correct / items.length * 100) : null,
      corrected: items.filter(item => item.corrected).length,
      independent: 'unknown', novelty: 'unknown',
      latestAt: latestDate([...items.filter(item => item.timeBasis === 'assessment').map(item => item.at), ...(skill.id === 'vocabulary' ? [wordPractice.latestAt] : [])]),
      sources: [...sources.values()] };
  });
  const observations = candidates.map(item => ({ id: item.id, version: item.version, questId: item.questId, skillId: item.skillId,
    firstCorrect: item.correct, corrected: item.corrected, at: item.timeBasis === 'assessment' ? item.at : null }));
  return { scopeVersion: SKILL_PRACTICE_SCOPE_VERSION, skills, wordPractice, excluded, observations };
}

export function formatSkillEvidenceDate(value) {
  if (timestamp(value) === null) return 'ไม่บันทึกวันที่';
  return new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
