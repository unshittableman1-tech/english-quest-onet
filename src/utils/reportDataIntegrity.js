import { getPreTestResult } from './preTestResult';
import { isQuestPassed } from './questMapModel';

const number = value => (typeof value === 'number' || typeof value === 'string' && value.trim() !== '')
  && Number.isFinite(Number(value)) ? Number(value) : null;
const hasValue = value => value !== undefined && value !== null;

export function getReportPreTest(student = {}) {
  const empty = { score: null, total: null, percent: null, basis: 'unknown_total' };
  const pre = student.preTest;
  if (!hasValue(pre)) {
    const legacy = getPreTestResult(student);
    if (legacy.percent !== null) return { ...legacy, state: 'legacy_percent_only', label: 'มีเปอร์เซ็นต์เดิม · ไม่ทราบจำนวนข้อ' };
    const recorded = Object.prototype.hasOwnProperty.call(student, 'preTest');
    return { ...empty, state: recorded ? 'no_record' : 'unknown', label: recorded ? 'ยังไม่มีผลบันทึก' : 'ไม่ทราบสถานะการทำ' };
  }
  const incomplete = { ...empty, state: 'incomplete', label: 'ข้อมูลผลยังไม่ครบ' };
  const conflict = { ...empty, state: 'conflict', label: 'ข้อมูลผลขัดกัน · ยังไม่สรุปคะแนน' };
  if (typeof pre !== 'object' || Array.isArray(pre)) return incomplete;
  const scores = [pre.totalScore, pre.score].filter(hasValue).map(number);
  if (!scores.length || scores.some(value => value === null)) return incomplete;
  if (new Set(scores).size !== 1) return conflict;
  const result = getPreTestResult({ preTest: { ...pre, totalScore: scores[0] } });
  if (result.percent === null) return incomplete;
  if (hasValue(pre.percent)) {
    const percent = number(pre.percent);
    if (percent === null || percent < 0 || percent > 100) return incomplete;
    if (Math.round(percent) !== result.percent) return conflict;
  }
  return { ...result, state: 'recorded', label: 'มีผลบันทึกแล้ว' };
}

export function buildReportQuestProgress(chapters = [], progress = {}) {
  const seen = new Set();
  const duplicateQuestIds = new Set();
  const rows = chapters.map(chapter => {
    const quests = (Array.isArray(chapter.quests) ? chapter.quests : []).filter(quest => {
      if (!quest || typeof quest.id !== 'string' || !quest.id) return false;
      if (seen.has(quest.id)) { duplicateQuestIds.add(quest.id); return false; }
      seen.add(quest.id);
      return true;
    });
    const countable = quests.filter(quest => !quest.previewOnly);
    return { ...chapter, quests, total: countable.length,
      completed: countable.filter(quest => isQuestPassed(progress[quest.id])).length };
  });
  const total = rows.reduce((sum, chapter) => sum + chapter.total, 0);
  const completed = rows.reduce((sum, chapter) => sum + chapter.completed, 0);
  return { chapters: rows, total, completed, percent: total ? Math.round(completed / total * 100) : 0,
    duplicateQuestIds: [...duplicateQuestIds] };
}
