import assert from 'node:assert/strict';
import test from 'node:test';
import { getBadgePageRows } from '../src/utils/badgePageModel.js';

const byId = rows => Object.fromEntries(rows.map(row => [row.id, row]));

test('Arena badges appear from stored awards or qualifying best scores without double counting', () => {
  const rows = getBadgePageRows(
    { badges: ['arena_challenger', 'vocab_rookie', 'vocab_rookie'], badgeStats: {} },
    {
      arenaBadges: ['arena_challenger', 'speed_solver'],
      bestMiniMock: { percent: 85 },
      bestSpeedMock: { percent: 82 },
      bestFullMock: { percent: 75 },
      bestFinalSimulation: { percent: 65 },
    }
  );
  const badges = byId(rows);
  assert.equal(rows.filter(row => row.earned).length, 4);
  assert.equal(badges.arena_challenger.earned, true);
  assert.equal(badges.speed_solver.earned, true);
  assert.equal(badges.mock_test_survivor.earned, true);
  assert.equal(badges.onet_ready.earned, false);
  assert.equal(badges.onet_ready.progress, 75);
  assert.equal(badges.onet_ready.target, 80);
  assert.equal(badges.onet_champion.near, true);
});

test('Sign Legend shows the second requirement when sign count is complete', () => {
  const rows = byId(getBadgePageRows({ badges: [], badgeStats: { correctBySkill: { signs: 150 }, perfectLevels: 0 } }, null));
  assert.equal(rows.sign_legend.earned, false);
  assert.equal(rows.sign_legend.ratio, 1);
  assert.match(rows.sign_legend.extraRequirement, /0\/1/);
});

test('empty or invalid progress stays within the display range', () => {
  const rows = byId(getBadgePageRows({ badges: [], badgeStats: { correctBySkill: { vocabulary: -20 } } }, { bestMiniMock: { percent: NaN } }));
  assert.equal(rows.vocab_rookie.progress, 0);
  assert.equal(rows.arena_challenger.progress, 0);
  assert.equal(rows.arena_challenger.earned, false);
});
