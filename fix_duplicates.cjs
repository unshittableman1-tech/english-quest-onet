const fs = require('fs');
let fileStr = fs.readFileSync('src/data/questions.js', 'utf8');

const regex = /export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*\[/g;
const counts = {};
let newStr = fileStr.replace(regex, (match, name) => {
  if (!counts[name]) {
    counts[name] = 1;
    return match;
  } else {
    counts[name]++;
    return `export const ${name}_${counts[name]} = [`;
  }
});
fs.writeFileSync('src/data/questions.js', newStr);
console.log('Fixed duplicate exports');
