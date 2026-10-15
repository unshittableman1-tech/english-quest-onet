const fs = require('fs');

// Read existing questions.js
let fileStr = fs.readFileSync('src/data/questions.js', 'utf8');

// Load SET 1 part 2
let set1_p2 = JSON.parse(fs.readFileSync('scratch/set1_questions_part2.json', 'utf8'));

// Load SET 2
let set2 = JSON.parse(fs.readFileSync('scratch/set2_questions.json', 'utf8'));

// Format SET 2 (it's already mostly formatted, just needs to match the structure)
// We will assign them to their respective quests.
// SET 2 quests: yes_no_questions, wh_questions, how_questions, or_questions
// Wait, we don't have these quests in QUESTS array yet! Let's check `questions.js` for Chapter 3 quests.
// Chapter 3: question_words (Who, What, Where), yes_no (Is, Am, Are)
// Let's create new quests for them or map them to existing.
// In questions.js, Chapter 3 has `question_words` and `yes_no`. Let's map SET 2 to those.

set2 = set2.map(q => {
  let questId = 'question_words';
  if (q.quest === 'yes_no_questions') questId = 'yes_no';
  if (q.quest === 'wh_questions') questId = 'question_words';
  if (q.quest === 'how_questions') questId = 'question_words';
  if (q.quest === 'or_questions') questId = 'question_words';
  return {
    id: q.id,
    quest: questId,
    question: q.question,
    options: q.options,
    answer: q.answer,
    correctFeedback: q.correctFeedback,
    wrongFeedback: q.wrongFeedback
  };
});

let yesNoExtracted = set2.filter(q => q.quest === 'yes_no');
let qwExtracted = set2.filter(q => q.quest === 'question_words');

let newArrays = `\nexport const yesNoExtracted = ${JSON.stringify(yesNoExtracted, null, 2)};\n` + 
                `\nexport const qwExtracted = ${JSON.stringify(qwExtracted, null, 2)};\n` +
                `\nexport const set1Part2 = ${JSON.stringify(set1_p2, null, 2)};\n`;

fileStr = fileStr.replace(/export const QUESTS = \[/, newArrays + '\nexport const QUESTS = [\n');

// Inject into question_wordsQuestions and yesNoQuestions arrays directly in the file string
fileStr = fileStr.replace(/questions: yesNoQuestions/, 'questions: [...yesNoQuestions, ...yesNoExtracted]');
fileStr = fileStr.replace(/questions: question_wordsQuestions/, 'questions: [...question_wordsQuestions, ...qwExtracted]');

// Set 1 part 2 maps to vocabulary (Chapter 1)
fileStr = fileStr.replace(/questions: schoolQuestions/, 'questions: [...schoolQuestions, ...set1Part2]'); // Append them all to school for now, or just create a new quest.

fs.writeFileSync('src/data/questions.js', fileStr);
console.log('Merged SET 1 part 2 and SET 2 successfully!');
