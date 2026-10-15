const fs = require('fs');
let content = fs.readFileSync('src/utils/scoring.js', 'utf8');
const replacement = `
export function getStreakReward(streakDays) {
  const milestone = STREAK_REWARDS[streakDays];
  if (milestone) return { isMilestone: true, xp: milestone.xp, name: milestone.name, icon: milestone.icon };
  return { isMilestone: false, xp: 10, name: 'Daily Bonus', icon: '✨' };
}
`;
content = content.replace(/export function getStreakReward[\s\S]*?}/, replacement.trim());
fs.writeFileSync('src/utils/scoring.js', content);
console.log('Fixed getStreakReward');
