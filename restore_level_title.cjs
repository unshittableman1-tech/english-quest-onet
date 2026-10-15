const fs = require('fs');
let content = fs.readFileSync('src/utils/scoring.js', 'utf8');
content += `

export function getLevelTitle(level) {
  const titles = [
    'Newbie Explorer',
    'Curious Learner',
    'Word Hunter',
    'Grammar Knight',
    'Sentence Master',
    'Language Scholar',
    'O-NET Challenger',
    'Elite Student',
    'Master of English',
    'Legendary Wizard'
  ];
  return titles[level - 1] || titles[0];
}
`;
fs.writeFileSync('src/utils/scoring.js', content);
console.log('Restored getLevelTitle');
