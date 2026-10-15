const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'questions.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Match any exported array of questions, like: export const vocabularyQuestions = [ ... ];
const regex = /export const (\w+) = (\[[\s\S]*?\]);/g;

let match;
let newContent = content;

while ((match = regex.exec(content)) !== null) {
  const arrayName = match[1];
  const arrayContent = match[2];

  if (arrayName === 'QUESTS') continue; // Skip the main QUESTS array

  // Parse the array
  // Since it's raw JS, we can use eval or a Function constructor if we are careful,
  // but a safer way is to just do some string manipulation or eval in this controlled script.
  let arr;
  try {
    arr = eval(`(${arrayContent})`);
  } catch (e) {
    console.log(`Failed to parse ${arrayName}, skipping...`);
    continue;
  }

  if (arr.length === 0) continue;

  let originalLength = arr.length;
  let targetLength = 50;

  if (originalLength >= targetLength) continue;

  let expandedArr = [...arr];
  let idCounter = originalLength + 1;

  while (expandedArr.length < targetLength) {
    let baseQuestion = arr[(expandedArr.length - originalLength) % originalLength];
    let newQuestion = { ...baseQuestion };
    
    // Create a new unique ID (e.g. v01 -> v21, etc.)
    // Extract prefix
    let prefixMatch = newQuestion.id.match(/^([a-zA-Z]+)/);
    let prefix = prefixMatch ? prefixMatch[1] : 'q';
    newQuestion.id = `${prefix}${idCounter.toString().padStart(2, '0')}`;
    idCounter++;

    expandedArr.push(newQuestion);
  }

  // Convert back to string formatting
  let newArrayString = "[\n" + expandedArr.map(q => {
    return `  { id: '${q.id}', quest: '${q.quest}', question: ${JSON.stringify(q.question)}, options: ${JSON.stringify(q.options)}, answer: ${q.answer}, correctFeedback: ${JSON.stringify(q.correctFeedback)}, wrongFeedback: ${JSON.stringify(q.wrongFeedback)}, keyword: ${JSON.stringify(q.keyword)} ${q.passage ? `, passage: ${JSON.stringify(q.passage)}` : ''} }`;
  }).join(",\n") + "\n]";

  newContent = newContent.replace(arrayContent, newArrayString);
}

fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('Successfully expanded questions to 50 per quest.');
