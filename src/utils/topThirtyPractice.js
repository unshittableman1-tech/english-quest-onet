export const TOP_THIRTY_VERSION = 'v3-review-candidate-20261023-patch1';
const keyFor = learnerId => `eq_top30_local_v1:${encodeURIComponent(learnerId)}`;
const empty = () => ({ version: TOP_THIRTY_VERSION, runs: [], activeId: null });

export function readTopThirtyHistory(learnerId, storage = globalThis.localStorage) {
  if (!learnerId) return empty();
  try {
    const value = JSON.parse(storage.getItem(keyFor(learnerId)));
    if (value?.version !== TOP_THIRTY_VERSION || !Array.isArray(value.runs)) return empty();
    const runs = value.runs.filter(run => run && typeof run.attemptId === 'string' && run.version === TOP_THIRTY_VERSION && ['A', 'B', 'C'].includes(run.form) && Array.isArray(run.items) && run.items.length === 30 && run.items.every(item => typeof item?.id === 'string' && typeof item.context_en === 'string' && typeof item.question_en === 'string' && Array.isArray(item.options) && item.options.length === 4 && item.options.every(option => typeof option === 'string')) && Array.isArray(run.responses) && run.responses.length <= 30 && run.responses.every((answer, index) => answer?.id === run.items[index]?.id && (answer.choice === null || Number.isInteger(answer.choice) && answer.choice >= 0 && answer.choice < 4) && typeof answer.understanding === 'string' && typeof answer.evidence === 'string' && typeof answer.assisted === 'boolean') && (run.result === null || run.result === undefined || Number.isInteger(run.result.correct) && Number.isInteger(run.result.answered) && run.result.correct >= 0 && run.result.correct <= run.result.answered && run.result.answered <= 30 && Array.isArray(run.result.unresolvedItemIds)));
    return { version: TOP_THIRTY_VERSION, runs, activeId: runs.some(run => run.attemptId === value.activeId) ? value.activeId : null };
  } catch { return empty(); }
}

export function saveTopThirtyHistory(learnerId, history, storage = globalThis.localStorage) {
  if (!learnerId) return false;
  try { storage.setItem(keyFor(learnerId), JSON.stringify(history)); return true; } catch { return false; }
}

export function parseTopThirtyContext(context) {
  const lines = String(context).split('\n');
  if (!lines[0].startsWith('|')) return { text: context, table: null, trailing: '' };
  const tableLines = lines.filter(line => line.startsWith('|'));
  const rows = tableLines.map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
  return { text: '', table: { headers: rows[0], rows: rows.slice(2) }, trailing: lines.filter(line => !line.startsWith('|')).join('\n').trim() };
}

export async function topThirtyRequest(action, payload, fetcher = globalThis.fetch) {
  const response = await fetcher(`/__local/top30/${action}`, payload === undefined ? { cache: 'no-store' } : { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'request_failed');
    error.code = data.error;
    throw error;
  }
  return data;
}
