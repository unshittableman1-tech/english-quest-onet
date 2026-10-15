const fs = require('fs');
const content = fs.readFileSync('รายชื่อ ป.6-2.csv', 'utf8');
const lines = content.split('\n').filter(l => l.trim());
console.log('Total lines:', lines.length);

const firstLine = lines[0].toLowerCase();
let startIndex = 0;
if (firstLine.includes('ชื่อ') || firstLine.includes('name')) {
  startIndex = 1;
}

for (let i = startIndex; i < Math.min(startIndex + 3, lines.length); i++) {
  const cols = [];
  let curr = '';
  let inQuotes = false;
  for (let c of lines[i]) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { cols.push(curr); curr = ''; }
    else curr += c;
  }
  cols.push(curr);
  const cleanCols = cols.map(c => c.trim().replace(/^"|"$/g, ''));
  console.log('cleanCols:', cleanCols);
  
  let name, className, number;
  if (cleanCols.length >= 4 && !isNaN(cleanCols[0]) && isNaN(cleanCols[1])) {
    number = cleanCols[0];
    name = cleanCols[1];
    className = cleanCols[3];
  } else {
    name = cleanCols[0];
    className = cleanCols[1];
    number = cleanCols[2];
  }
  
  if (className && className.startsWith('ป.')) {
    className = className.substring(2);
  }
  
  console.log({name, class: className, number});
}
