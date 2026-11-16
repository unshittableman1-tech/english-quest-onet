import { BADGES } from '../data/badges';

export function getEarnedRankingBadges(student) {
  const stored = new Set([
    ...(Array.isArray(student?.badges) ? student.badges : []),
    ...(Array.isArray(student?.arenaStats?.arenaBadges) ? student.arenaStats.arenaBadges : []),
  ]);
  return BADGES.filter(badge => stored.has(badge.id));
}
