import { BADGES } from '../data/badges.js';
import { getEffectiveBadgeStats } from './preTestResult.js';

const ARENA_TARGETS = {
  arena_challenger: ['bestMiniMock', 80],
  speed_solver: ['bestSpeedMock', 80],
  mixed_skill_fighter: ['bestSkillMixedMock', 80],
  weakness_crusher: ['bestWeaknessMock', 80],
  mock_test_survivor: ['bestFullMock', 70],
  onet_ready: ['bestFullMock', 80],
  onet_champion: ['bestFinalSimulation', 80],
  onet_legend_arena: ['bestFinalSimulation', 90],
};

const nonnegative = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

export function getBadgePageRows(student, arenaStats) {
  const stats = getEffectiveBadgeStats(student || {});
  const stored = new Set([...(student?.badges || []), ...(arenaStats?.arenaBadges || [])]);

  return BADGES.map(badge => {
    const arenaTarget = ARENA_TARGETS[badge.id];
    const target = arenaTarget ? arenaTarget[1] : badge.maxProgress;
    const raw = arenaTarget
      ? arenaStats?.[arenaTarget[0]]?.percent
      : badge.getProgress(stats);
    const progress = Math.min(nonnegative(raw), target);
    const earned = stored.has(badge.id) || Boolean(arenaTarget && progress >= target);
    const extraRequirement = badge.id === 'sign_legend' && !earned
      ? `ได้ดาวเต็ม ${Math.min(nonnegative(stats.perfectLevels), 1)}/1 ด่าน`
      : null;
    const ratio = target > 0 ? progress / target : 0;

    return {
      ...badge,
      earned,
      progress,
      target,
      ratio,
      extraRequirement,
      near: !earned && ratio >= 0.5,
    };
  });
}
