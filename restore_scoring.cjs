const fs = require('fs');
let content = fs.readFileSync('src/utils/scoring.js', 'utf8');
content += `

// --- Ranking ---
export function calculateRankScore(xp) {
  return xp;
}

export function getRankingTier(score) {
  if (score >= 10000) return 'Diamond';
  if (score >= 5000) return 'Platinum';
  if (score >= 2000) return 'Gold';
  if (score >= 1000) return 'Silver';
  return 'Bronze';
}
`;
fs.writeFileSync('src/utils/scoring.js', content);
console.log('Restored ranking functions');
