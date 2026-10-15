const fs = require('fs');

let set7 = JSON.parse(fs.readFileSync('scratch/set7_questions_full.json', 'utf8'));

// 7.1
set7[0].image = '/images/rain_school.svg';
set7[1].image = '/images/breakfast.svg';
set7[2].image = '/images/clean_classroom.svg';
set7[3].image = '/images/no_smoking.svg';
set7[4].image = '/images/teaching.svg';
set7[5].image = '/images/library.svg';
set7[6].image = '/images/no_signal.svg';
set7[7].image = '/images/clean_school.svg';
set7[8].image = '/images/cross_road.svg';
set7[9].image = '/images/noisy_class.svg';

// 7.2
set7[10].image = '/images/town_map.svg';
set7[11].image = '/images/school_map.svg';
set7[12].image = '/images/house_map.svg';
set7[13].image = '/images/flowchart.svg';
set7[14].image = '/images/town_map.svg';

// 7.3
set7[15].image = '/images/bar_colors.svg';
set7[16].image = '/images/bar_years.svg';
set7[18].image = '/images/bar_english.svg';
set7[19].image = '/images/bar_population.svg';

// 7.4
set7[20].image = '/images/table_scores.svg';
set7[21].image = '/images/table_scores.svg';
set7[22].image = '/images/table_scores.svg';
set7[23].image = '/images/table_scores.svg';
set7[24].image = '/images/table_scores.svg';

// Normalize properties to match game engine
set7 = set7.map((q, i) => {
  return {
    id: `pdf_set7_${i}`,
    quest: 'reading', // Map and graphs fit well into Reading / Data Detective (Chapter 4)
    question: q.question,
    options: q.choices,
    answer: q.answer === 'A' ? 0 : q.answer === 'B' ? 1 : q.answer === 'C' ? 2 : 3,
    correctFeedback: 'Correct!',
    wrongFeedback: 'Incorrect.',
    image: q.image
  };
});

fs.writeFileSync('scratch/set7_questions_formatted.json', JSON.stringify(set7, null, 2));
console.log('SET 7 formatted!');

// Process SET 5
let set5Raw = JSON.parse(fs.readFileSync('scratch/set5_questions_part1.json', 'utf8'));
let set5 = [];
let set5Index = 0;
set5Raw.forEach(fileObj => {
  fileObj.questions.forEach(q => {
    set5.push({
      id: `pdf_set5_${set5Index++}`,
      quest: 'signs', // Classroom rules, requests, instructions
      question: q.question,
      options: q.options,
      answer: q.answer === 'A' ? 0 : q.answer === 'B' ? 1 : q.answer === 'C' ? 2 : 3,
      correctFeedback: 'Correct!',
      wrongFeedback: 'Incorrect.'
    });
  });
});
fs.writeFileSync('scratch/set5_questions_formatted.json', JSON.stringify(set5, null, 2));
console.log('SET 5 formatted!');

// Process SET 3
let set3Raw = JSON.parse(fs.readFileSync('scratch/set3_questions_part1.json', 'utf8'));
let set3 = set3Raw.map(q => ({
  id: q.id,
  quest: 'conversation',
  question: q.question,
  options: q.options,
  answer: q.answer,
  correctFeedback: q.correctFeedback,
  wrongFeedback: q.wrongFeedback
}));
fs.writeFileSync('scratch/set3_questions_formatted.json', JSON.stringify(set3, null, 2));
console.log('SET 3 formatted!');

// Now we inject into questions.js!
let fileStr = fs.readFileSync('src/data/questions.js', 'utf8');

// We need to append these arrays and add them to QUESTS array.
let newArrays = `\nexport const set3Questions = ${JSON.stringify(set3, null, 2)};\n` + 
                `\nexport const set5Questions = ${JSON.stringify(set5, null, 2)};\n` + 
                `\nexport const set7Questions = ${JSON.stringify(set7, null, 2)};\n`;

fileStr = fileStr.replace(/export const QUESTS = \[/, newArrays + '\nexport const QUESTS = [\n');

// Since we already have 'conversation', 'signs', 'reading' quests, we can append these questions to the existing quests in memory, OR we can append them to the existing arrays.
// It's easier to modify the quest array mapping.
fs.writeFileSync('src/data/questions.js', fileStr);
console.log('Injected arrays into questions.js. Need to modify QUESTS to include them.');
