import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExecutivePretestReport, renderExecutivePretestReport } from '../src/utils/executivePretestReport.js';

test('buildExecutivePretestReport returns correct metrics for empty student list', () => {
  const report = buildExecutivePretestReport([]);
  assert.equal(report.eligible, 0);
  assert.equal(report.completed, 0);
  assert.equal(report.participation, null);
  assert.equal(report.average, null);
  assert.equal(report.comparable, false);
  assert.ok(Array.isArray(report.standardsRemedial));
  assert.equal(report.standardsRemedial.length, 6);
});

test('buildExecutivePretestReport calculates score distribution and average correctly for verified results', () => {
  const students = [
    { id: 'std-1', preTest: { totalScore: 18, total: 20, version: 'pretest-v2' } },
    { id: 'std-2', preTest: { totalScore: 12, total: 20, version: 'pretest-v2' } },
    { id: 'std-3', preTest: { totalScore: 8, total: 20, version: 'pretest-v2' } },
    { id: 'std-4' }, // not taken
  ];

  const report = buildExecutivePretestReport(students);
  assert.equal(report.eligible, 4);
  assert.equal(report.completed, 3);
  assert.equal(report.participation, 75);
  // (90 + 60 + 40) / 3 = 190 / 3 = 63.333...
  assert.equal(Math.round(report.average * 10) / 10, 63.3);
  assert.equal(report.comparable, true);
  assert.deepEqual(report.scoreDistribution, { high: 1, medium: 1, low: 1 });
});

test('renderExecutivePretestReport generates valid HTML with school information and remedial plan', () => {
  const students = [
    { id: 'std-1', preTest: { totalScore: 16, total: 20, version: 'pretest-v2' } },
  ];
  const report = buildExecutivePretestReport(students);
  const html = renderExecutivePretestReport(report, {
    name: 'โรงเรียนบ้านน้ำใส',
    code: 'BNS69',
    area: 'สพป. นราธิวาส เขต 1',
  }, {
    scope: 'นักเรียนชั้น ป.6 ทุกห้องเรียน',
    teacherName: 'ครูสมใจ สุขสมบัติ',
  });

  assert.ok(html.includes('โรงเรียนบ้านน้ำใส'));
  assert.ok(html.includes('BNS69'));
  assert.ok(html.includes('80%')); // 16/20 = 80%
  assert.ok(html.includes('ต 1.1'));
  assert.ok(html.includes('ต 1.2'));
  assert.ok(html.includes('ต 4.1'));
  assert.ok(html.includes('ผังโครงสร้างข้อสอบ O-NET'));
  assert.ok(html.includes('32 ข้อ'));
  assert.ok(html.includes('ครูสมใจ สุขสมบัติ'));
  assert.ok(html.includes('ผู้อำนวยการโรงเรียน'));
  assert.ok(html.includes('window.print()'));
});
