import '../tests/helpers/environment.mjs';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { inspectQuestionMedia, isMediaReleaseEligible } from '../src/utils/questionMedia.js';
const { QUESTS, preTestQuestions } = await import('../src/data/questions.js');
const arena = await import('../src/data/chapter4_questions.js');
const { finalBossQuestions } = await import('../src/data/finalBossQuestions.js');
const banks = [
  ...QUESTS.map(q => [ `quest:${q.id}`, q.questions ]),
  ['pretest', preTestQuestions], ['finalBoss', finalBossQuestions],
  ...Object.entries(arena).filter(([, v]) => Array.isArray(v)),
];
const rows = [];
for (const [bank, questions] of banks) {
  for (const [index, question] of questions.entries()) {
    const inspection = inspectQuestionMedia(question);
    const images = inspection.stimuli.filter(s => s.type === 'image').map(s => s.src);
    const absent = [];
    for (const src of images) {
      if (!src.startsWith('/')) { absent.push(`${src}: non-local; requires manual review`); continue; }
      const target = resolve('public', `.${src}`);
      if (relative(resolve('public'), target).startsWith('..')) { absent.push(src); continue; }
      try { await access(target); } catch { absent.push(src); }
    }
    rows.push({ bank, index, id: question.id || null, question: question.question,
      status: absent.length ? 'missing' : inspection.status,
      types: inspection.stimuli.map(s => s.type), assets: images, absent,
      source: question.source || null, sourcePage: question.sourcePage || null,
      mediaReview: question.mediaReview || null, releaseEligible: !absent.length && isMediaReleaseEligible(question),
      itemVersion: question.itemVersion || null, sourceCheck: question.sourceCheck || null,
      reviewStatus: question.reviewStatus || null,
      approvedModes: question.approvedModes || null, contentReview: question.contentReview || null,
      mediaSource: question.mediaSource || null,
      needsManualReview: inspection.needsManualReview,
      blockedBeforeAssessment: absent.length > 0 || inspection.blocked || inspection.status === 'present_unverified' || ['pending_teacher', 'quarantined', 'rejected'].includes(question.reviewStatus),
      reviewNote: 'Automatic triage only; not proof of completeness, source fidelity, accessibility or answer correctness.' });
  }
}
const counts = rows.reduce((all, row) => { all[row.status] = (all[row.status] || 0) + 1; return all; }, {});
const report = { generatedAt: new Date().toISOString(), scope: 'Quiz QUESTS, pretest, exported arena arrays, FinalBoss; mission game payloads and inline RealOnetSimulator not yet covered', counts, rows };
await mkdir('md', { recursive: true });
await writeFile('md/Question Media Inventory.json', JSON.stringify(report, null, 2));
const cell = value => `"${(value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')).replaceAll('"', '""')}"`;
await writeFile('md/Question Media Inventory.csv', '\ufeff' + [['bank','index','id','status','types','assets','source','sourcePage','needsManualReview','blockedBeforeAssessment','releaseEligible','question'], ...rows.map(r => [r.bank,r.index,r.id,r.status,r.types.join('|'),r.assets.join('|'),r.source,r.sourcePage,r.needsManualReview,r.blockedBeforeAssessment,r.releaseEligible,r.question])].map(row => row.map(cell).join(',')).join('\n'));
console.log(JSON.stringify({ rows: rows.length, counts, blockedBeforeAssessment: rows.filter(r => r.blockedBeforeAssessment).length, releaseEligible: rows.filter(r => r.releaseEligible).length }, null, 2));
