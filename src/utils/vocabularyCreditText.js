export const normalizeCreditText = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').replace(/[?!.:,;]+$/g, '').trim();
export function creditFingerprint(value) {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16);
}
export const questCreditActivityId = (questId, question) => `quest:${questId}:${question.id || creditFingerprint(question.question)}`;
const escaped = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+').replace(/'/g, "['’]");

// The same longest-phrase-first renderer is used for a passage, prompt and choices.
// It preserves punctuation and never invents a meaning through stemming.
export function segmentCreditText(text, terms = []) {
  const source = String(text || '');
  const byForm = new Map(terms.map(term => [normalizeCreditText(term.form), term]));
  const forms = [...byForm.keys()].filter(Boolean).sort((a, b) => b.length - a.length);
  if (!forms.length) return [{ text: source }];
  const pattern = new RegExp(`(?<![a-z0-9'])(${forms.map(escaped).join('|')})(?![a-z0-9'])`, 'gi');
  const parts = []; let offset = 0;
  for (const match of source.matchAll(pattern)) {
    if (match.index > offset) parts.push({ text: source.slice(offset, match.index) });
    parts.push({ text: match[0], term: byForm.get(normalizeCreditText(match[0])) });
    offset = match.index + match[0].length;
  }
  if (offset < source.length) parts.push({ text: source.slice(offset) });
  return parts.length ? parts : [{ text: source }];
}

// Each word stays independently selectable; matching multiword glosses are
// offered alongside it rather than consuming the words in the phrase.
export function segmentSelectableCreditText(text, terms = []) {
  const source = String(text || '');
  const singles = new Map(terms.filter(term => !/\s/.test(term.form)).map(term => [normalizeCreditText(term.form), term]));
  const phrases = terms.filter(term => /\s/.test(term.form)).flatMap(term => {
    const pattern = new RegExp(`(?<![a-z0-9'])${escaped(normalizeCreditText(term.form))}(?![a-z0-9'])`, 'gi');
    return [...source.matchAll(pattern)].map(match => ({ start: match.index, end: match.index + match[0].length, term }));
  });
  const parts = []; let offset = 0;
  for (const match of source.matchAll(/[a-z]+(?:['’][a-z]+)?/gi)) {
    if (match.index > offset) parts.push({ text: source.slice(offset, match.index) });
    const form = normalizeCreditText(match[0]);
    parts.push({ text: match[0], term: singles.get(form) || { id: `missing:${form}`, form, missing: true },
      phrases: phrases.filter(row => match.index >= row.start && match.index + match[0].length <= row.end).map(row => row.term) });
    offset = match.index + match[0].length;
  }
  if (offset < source.length) parts.push({ text: source.slice(offset) });
  return parts.length ? parts : [{ text: source }];
}
