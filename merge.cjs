const fs = require('fs');
let set1 = JSON.parse(fs.readFileSync('scratch/set1_questions_part1.json', 'utf8'));
let aboutMyself = set1.filter(q => q.quest === 'about_myself');
let family = set1.filter(q => q.quest === 'family');
let school = set1.filter(q => q.quest === 'school');

let fileStr = fs.readFileSync('src/data/questions.js', 'utf8');

let newArrays = `\nexport const aboutMyselfQuestions = ${JSON.stringify(aboutMyself, null, 2)};\n\nexport const familyQuestions = ${JSON.stringify(family, null, 2)};\n\nexport const schoolQuestions = ${JSON.stringify(school, null, 2)};\n`;

fileStr = fileStr.replace(/export const QUESTS = \[/, newArrays + '\nexport const QUESTS = [\n' + 
  `  { id: 'about_myself', chapter: 1, category: 'vocabulary', name: 'About Myself', isExam: false, questions: aboutMyselfQuestions },\n` +
  `  { id: 'family', chapter: 1, category: 'vocabulary', name: 'Family', isExam: false, questions: familyQuestions },\n` +
  `  { id: 'school', chapter: 1, category: 'vocabulary', name: 'School', isExam: false, questions: schoolQuestions },\n`);

fs.writeFileSync('src/data/questions.js', fileStr);
console.log('Merged SET 1 Part 1 into questions.js');
