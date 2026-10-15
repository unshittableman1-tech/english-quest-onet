const empty = () => ({ version: 1, categories: {} });
const keyFor = id => `onet_vocab_practice_v1:${encodeURIComponent(id)}`;
export function readVocabPractice(id, storage = globalThis.localStorage) {
  if (!id) return empty();
  try {
    const data = JSON.parse(storage.getItem(keyFor(id)));
    if (data?.version !== 1 || !data.categories || typeof data.categories !== 'object' || Array.isArray(data.categories)) return empty();
    const categories = Object.fromEntries(Object.entries(data.categories).filter(([, row]) => row && Number.isInteger(row.sessions) && row.sessions > 0 && Number.isFinite(Date.parse(row.lastPracticedAt))));
    return { version: 1, categories };
  } catch { return empty(); }
}
export function nextVocabPractice(history, category, mode, now = new Date()) {
  if (!category || !mode || !Number.isFinite(now.getTime())) throw new Error('Invalid vocabulary practice record');
  const previous = history.categories[category];
  return { version: 1, categories: { ...history.categories, [category]: { sessions: (previous?.sessions || 0) + 1, lastPracticedAt: now.toISOString(), mode } } };
}
export function saveVocabPractice(id, history, storage = globalThis.localStorage) {
  if (!id) return true;
  try { storage.setItem(keyFor(id), JSON.stringify(history)); return true; } catch { return false; }
}
export function formatVocabPracticeDate(value) {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
