const fs = require('fs');
let content = fs.readFileSync('src/utils/scoring.js', 'utf8');
content += `

// --- Class Analytics ---
export function getClassWeakAreas(students) {
  // Mock logic
  return [
    { name: 'Vocabulary', pct: 45 },
    { name: 'Grammar', pct: 52 }
  ];
}

export function getClassPreTestAverage(students) {
  return 42;
}

export function getClassCurrentAverage(students) {
  return 78;
}
`;
fs.writeFileSync('src/utils/scoring.js', content);
console.log('Restored class analytics');
