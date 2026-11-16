const empty = () => ({ version: 1, events: [] });
const demoHistories = new Map();
const normalize = value => String(value || '').normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s/-]/g, '').replace(/\s+/g, ' ').trim();
export function vocabularyWord(card) {
  const candidates = [card?.frontLabel, card?.back, card?.front];
  const text = candidates.find(value => typeof value === 'string' && /[a-z]/i.test(value) && !/[\u0e00-\u0e7f]/.test(value)) || card?.frontLabel?.split('=')[0] || '';
  return text.replace(/[^a-zA-Z0-9'’\s/?!.,-]/g, '').trim();
}
export function vocabularyWordId(card) {
  const word = normalize(vocabularyWord(card));
  return word ? `${word}:${encodeURIComponent(card?.backThai || '')}` : null;
}
export function evidenceOwner(student) {
  if (!student?.id) return null;
  if (student.isDemo) return `demo:${student.id}`;
  return `${student.school_id || student.school_code || 'local'}:${student.id}`;
}
const keyFor = owner => `onet_vocab_words_v1:${encodeURIComponent(owner)}`;
const validEvent = event => event && typeof event.eventId === 'string' && typeof event.wordId === 'string' && typeof event.word === 'string' && typeof event.categoryId === 'string' && ['study', 'audio', 'speed', 'quick_check'].includes(event.mode) && [true, false, null].includes(event.correct) && typeof event.assisted === 'boolean' && Number.isFinite(Date.parse(event.at));
export function readWordEvidence(owner, storage = globalThis.localStorage) {
  if (!owner) return empty();
  if (owner.startsWith('demo:')) return demoHistories.get(owner) || empty();
  try {
    const data = JSON.parse(storage.getItem(keyFor(owner)));
    return data?.version === 1 && Array.isArray(data.events) ? { version: 1, events: data.events.filter(validEvent).slice(-4000) } : empty();
  } catch { return empty(); }
}
export function recordWordEvidence(history, event) {
  if (!validEvent(event)) throw new Error('Invalid vocabulary evidence');
  if (history.events.some(previous => previous.eventId === event.eventId)) return history;
  return { version: 1, events: [...history.events, { ...event }].slice(-4000) };
}
export function saveWordEvidence(owner, history, storage = globalThis.localStorage) {
  if (!owner) return true;
  if (owner.startsWith('demo:')) { demoHistories.set(owner, history); return true; }
  try { storage.setItem(keyFor(owner), JSON.stringify(history)); return true; } catch { return false; }
}
export function wordStatus(history, card) {
  const events = history.events.filter(event => event.wordId === vocabularyWordId(card));
  const checks = events.filter(event => event.correct !== null && !event.assisted);
  const latest = checks.at(-1);
  if (latest) return { status: latest.correct ? 'recognized' : 'practice', label: latest.correct ? 'ตอบถูกในแบบฝึก' : 'ควรฝึกเพิ่ม', checks: checks.length };
  return { status: events.length ? 'seen' : 'unseen', label: events.length ? 'เคยเรียนแล้ว' : 'ยังไม่มีข้อมูล', checks: 0 };
}
export function summarizeWords(history, cards) {
  const statuses = cards.map(card => wordStatus(history, card));
  return { total: cards.length, recognized: statuses.filter(row => row.status === 'recognized').length, practice: statuses.filter(row => row.status === 'practice').length, seen: statuses.filter(row => row.status !== 'unseen').length };
}

const masteredKeyFor = owner => `onet_mastered_words_v1:${encodeURIComponent(owner || 'guest')}`;
const demoMastered = new Map();

export function readMasteredWords(owner, storage = globalThis.localStorage) {
  if (!owner) return new Set();
  if (owner.startsWith('demo:')) return demoMastered.get(owner) || new Set();
  try {
    const raw = storage?.getItem?.(masteredKeyFor(owner));
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.map(normalize) : []);
  } catch {
    return new Set();
  }
}

export function saveMasteredWords(owner, wordSet, storage = globalThis.localStorage) {
  if (!owner) return true;
  const list = Array.from(wordSet).map(normalize);
  if (owner.startsWith('demo:')) {
    demoMastered.set(owner, new Set(list));
    return true;
  }
  try {
    storage?.setItem?.(masteredKeyFor(owner), JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function markWordAsMastered(owner, word, storage = globalThis.localStorage) {
  if (!owner || !word) return false;
  const set = readMasteredWords(owner, storage);
  set.add(normalize(word));
  saveMasteredWords(owner, set, storage);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('onet_vocab_mastered_change', { detail: { owner, word: normalize(word), mastered: true } }));
  }
  return true;
}

export function unmarkWordAsMastered(owner, word, storage = globalThis.localStorage) {
  if (!owner || !word) return false;
  const set = readMasteredWords(owner, storage);
  set.delete(normalize(word));
  saveMasteredWords(owner, set, storage);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('onet_vocab_mastered_change', { detail: { owner, word: normalize(word), mastered: false } }));
  }
  return true;
}

export function isWordMasteredOrRecognized(word, owner, history = null, storage = globalThis.localStorage) {
  if (!word) return false;
  const norm = normalize(word);
  if (!norm) return false;

  // 1. Explicitly marked as mastered (Option 3)
  if (owner) {
    const masteredSet = readMasteredWords(owner, storage);
    if (masteredSet.has(norm)) return true;
  }

  // 2. Learned with evidence from practice (Option 1)
  if (owner) {
    const currentHistory = history || readWordEvidence(owner, storage);
    if (currentHistory && Array.isArray(currentHistory.events)) {
      const matching = currentHistory.events.filter(e => normalize(e.word) === norm && e.correct !== null && !e.assisted);
      const latest = matching.at(-1);
      if (latest && latest.correct === true) {
        return true;
      }
    }
  }

  return false;
}

