import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeQuestScores, summarizeSkillScores } from '../src/utils/learningAnalysis.js';

test('quest averages include real zero and exclude missing, invalid and out-of-range scores', () => {
  const rows=summarizeQuestScores([
    {questProgress:{reading:{pct:0},grammar:{pct:null},finalboss:{pct:40}}},
    {questProgress:{reading:{pct:80},grammar:{pct:undefined},bad:{pct:101}}},
    {questProgress:{reading:{pct:false},grammar:{pct:' '},bad:{pct:-1}}},
    {questProgress:{reading:{pct:'60'},grammar:{pct:NaN}}},
  ]);
  assert.deepEqual(rows,[{id:'reading',avg:47,count:3,belowThreshold:2}]);
});

test('does not suppress results from a small number of learners or create values for no data', () => {
  assert.deepEqual(summarizeQuestScores([]),[]);
  const students=Array.from({length:25},(_,i)=>({questProgress:i===0?{reading:{pct:90}}:{}}));
  assert.deepEqual(summarizeQuestScores(students),[{id:'reading',avg:90,count:1,belowThreshold:0}]);
});

test('summarizeSkillScores groups quest progress into vocabulary, reading, and grammar', () => {
  const students = [
    { id: 's1', questProgress: { vocabulary: { pct: 80 }, reading: { pct: 60 } } },
    { id: 's2', questProgress: { vocabulary: { pct: 100 }, reading: { pct: 70 }, pronouns_master: { pct: 90 } } },
  ];
  const skills = summarizeSkillScores(students);
  assert.equal(skills.length, 3);
  
  const vocab = skills.find(s => s.id === 'vocabulary');
  assert.equal(vocab.avg, 90);
  assert.equal(vocab.count, 2);
  assert.equal(vocab.hasEvidence, true);

  const reading = skills.find(s => s.id === 'reading');
  assert.equal(reading.avg, 65);
  assert.equal(reading.count, 2);
  assert.equal(reading.belowThreshold, 1);
  assert.equal(reading.hasEvidence, true);

  const grammar = skills.find(s => s.id === 'grammar');
  assert.equal(grammar.avg, 90);
  assert.equal(grammar.count, 1);
  assert.equal(grammar.hasEvidence, true);
});

test('summarizeSkillScores returns hasEvidence false when no progress exists', () => {
  const emptySkills = summarizeSkillScores([]);
  assert.equal(emptySkills.length, 3);
  assert.ok(emptySkills.every(s => s.hasEvidence === false && s.avg === null));
});

