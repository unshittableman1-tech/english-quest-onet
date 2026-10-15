const fs = require('fs');
let content = fs.readFileSync('src/utils/scoring.js', 'utf8');
content += `

export const STREAK_REWARDS = {
  3: { name: 'Fire Starter', xp: 50, icon: '🔥' },
  7: { name: 'Weekly Warrior', xp: 150, icon: '⚡' },
  30: { name: 'Monthly Master', xp: 500, icon: '🌟' }
};

export function getStreakReward(streakDays) {
  return STREAK_REWARDS[streakDays] || null;
}
`;
fs.writeFileSync('src/utils/scoring.js', content);
console.log('Restored streak rewards');
