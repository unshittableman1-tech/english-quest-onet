import { QUESTS } from '../data/questions';
import { getStudentCurrentPercent, getStudentPreTestPercent } from './scoring';

export const ARENA_MODES = [
  ['bestMiniMock', 'Mini Mock'], ['bestSpeedMock', 'Speed Mock'],
  ['bestSkillMixedMock', 'Skill Mixed'], ['bestWeaknessMock', 'Weakness'],
  ['bestFullMock', 'Full Mock'], ['bestFinalSimulation', 'Final Simulation'],
];

export const TEACHER_CHAPTERS = [
  ['The Foundation', '📘', '#38bdf8'], ['Social Interactions', '📗', '#10b981'],
  ['The Interrogation Room', '📙', '#a78bfa'], ['Data Detective', '📕', '#f43f5e'],
  ['Expansion', '📒', '#f59e0b'],
].map(([name, icon, color], index) => ({
  ch: index + 1, label: `Chapter ${index + 1} — ${name}`, icon, color,
  quests: QUESTS.filter(q => q.chapter === index + 1).map(q => q.id), useArena: false,
})).concat({ ch: 'arena', label: 'O-NET Arena', icon: '🏟️', color: '#10b981', quests: [], useArena: true, arenaMocks: ARENA_MODES.map(([id]) => id), arenaLabels: Object.fromEntries(ARENA_MODES) });

const hasScore = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
const passed = result => result?.passed || (hasScore(result?.pct) && Number(result.pct) >= 70);

export function getRiskStudents(students, now = Date.now()) {
  return students.map(student => {
    const quests = Object.entries(student.questProgress || {}).filter(([id, q]) => id !== 'finalboss' && hasScore(q.pct)).map(([, q]) => q);
    const avgScore = getStudentCurrentPercent(student);
    const preScore = getStudentPreTestPercent(student);
    const passedQuests = quests.filter(passed).length;
    const lastActive = student.lastActive || student.badgeStats?.lastLoginDate;
    const lastTime = lastActive ? new Date(lastActive).getTime() : NaN;
    const inactiveDays = Number.isFinite(lastTime) ? Math.max(0, Math.floor((now - lastTime) / 86400000)) : null;
    const reasons = [];
    let level = 0;
    const flag = (message, severity) => { reasons.push(message); level = Math.max(level, severity); };
    if (avgScore !== null && avgScore < 50 && quests.length >= 3) flag(`คะแนนเฉลี่ยต่ำ ${avgScore}%`, 3);
    if (preScore !== null && preScore <= 30 && passedQuests === 0) flag('Pre-test ต่ำ และยังไม่ผ่านด่าน', 1);
    if (inactiveDays >= 3) flag(`ไม่ได้เข้าเรียน ${inactiveDays} วัน`, inactiveDays >= 7 ? 3 : 2);
    const total = student.rankingStats?.totalAnswered || 0;
    if (total >= 10 && (student.rankingStats?.fastGuessCount || 0) / total >= 0.3) flag('ตอบเร็วกว่า 3 วินาทีบ่อย', 2);
    if (Object.values(student.mistakeBank || {}).some(m => !m.mastered && m.timesWrong >= 3)) flag('ทำข้อผิดเดิมซ้ำอย่างน้อย 3 ครั้ง', 2);
    return { ...student, avgScore, preScore, passedQuests, inactiveDays, reasons, severity: ['', 'watch', 'medium', 'high'][level], riskLevel: level };
  }).filter(s => s.reasons.length > 0).sort((a, b) => b.riskLevel - a.riskLevel || b.reasons.length - a.reasons.length);
}

export function hasRiskEvidence(student) {
  const lastActive = student.lastActive || student.badgeStats?.lastLoginDate;
  const totalAnswered = Number(student.rankingStats?.totalAnswered) || 0;
  const hasMistakes = Object.keys(student.mistakeBank || {}).length > 0;
  return getStudentCurrentPercent(student) !== null
    || getStudentPreTestPercent(student) !== null
    || Boolean(lastActive)
    || totalAnswered >= 10
    || hasMistakes;
}

export function getTeacherOverview(students) {
  const distribution = [
    { label: 'ดีมาก ≥80%', value: 0, color: '#10b981' },
    { label: 'ดี 70–79%', value: 0, color: '#38bdf8' },
    { label: 'เฝ้าระวัง 50–69%', value: 0, color: '#f59e0b' },
    { label: 'ต้องเสริม <50%', value: 0, color: '#f43f5e' },
    { label: 'ยังไม่มีผลการเรียน', value: 0, color: '#64748b' },
  ];
  students.forEach(s => {
    const score = getStudentCurrentPercent(s);
    const index = score === null ? 4 : score >= 80 ? 0 : score >= 70 ? 1 : score >= 50 ? 2 : 3;
    distribution[index].value++;
  });
  const weakQuests = [];
  let completed = 0;
  for (const quest of QUESTS) {
    let count = 0;
    for (const student of students) {
      const result = student.questProgress?.[quest.id];
      if (passed(result)) completed++;
      else if (hasScore(result?.pct)) count++;
    }
    if (count) weakQuests.push({ id: quest.id, name: quest.name, count });
  }
  for (const [id, name] of ARENA_MODES) {
    let count = 0;
    for (const student of students) {
      const result = student.arenaStats?.[id];
      if (hasScore(result?.percent)) {
        if (Number(result.percent) >= 70) completed++;
        else count++;
      }
    }
    if (count) weakQuests.push({ id, name, count });
  }
  weakQuests.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const total = students.length * (QUESTS.length + ARENA_MODES.length);
  return { distribution, completed, total, completionPct: total ? Math.round(completed / total * 100) : 0, weakQuests };
}

export function getLatestLearningActivities(students, limit = 5) {
  const questNames = new Map(QUESTS.map(quest => [quest.id, quest.name]));
  return students.flatMap(student => Object.entries(student.questProgress || {}).flatMap(([questId, result]) => {
    if (questId === 'finalboss') return [];
    const completedAt = result?.lastAssessment?.completedAt || result?.lastPlayed;
    const timestamp = completedAt ? Date.parse(completedAt) : NaN;
    if (!Number.isFinite(timestamp)) return [];
    const score = hasScore(result?.lastAssessment?.score) ? Number(result.lastAssessment.score) : null;
    const total = hasScore(result?.lastAssessment?.total) ? Number(result.lastAssessment.total) : null;
    return [{
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      questId,
      questName: questNames.get(questId) || questId,
      completedAt,
      timestamp,
      score,
      total,
      pct: hasScore(result?.pct) ? Number(result.pct) : null,
      xp: Number(student.xp) || 0,
    }];
  })).sort((a, b) => b.timestamp - a.timestamp).slice(0, Math.max(0, limit));
}

export function getReviewTasks(student) {
  const weak = QUESTS.map(q => ({ ...q, result: student.questProgress?.[q.id] }))
    .filter(q => hasScore(q.result?.pct) && !passed(q.result)).sort((a, b) => a.result.pct - b.result.pct).slice(0, 3);
  const tasks = weak.map(q => `ทบทวน ${q.name} และทำแบบฝึกให้ได้อย่างน้อย 70%`);
  const mistakes = Object.values(student.mistakeBank || {}).filter(m => !m.mastered).length;
  if (mistakes) tasks.push(`ทบทวนข้อผิดที่ยังไม่ผ่าน ${mistakes} ข้อ`);
  if (!tasks.length) tasks.push('เริ่มทบทวน Chapter 1 และทำแบบฝึกพื้นฐาน');
  if ((student.rankingStats?.fastGuessCount || 0) > 0) tasks.push('อ่านโจทย์และตัวเลือกให้ครบก่อนตอบ');
  return tasks;
}
