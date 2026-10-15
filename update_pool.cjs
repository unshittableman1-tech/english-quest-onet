const fs = require('fs');
let fileStr = fs.readFileSync('src/data/chapter4_questions.js', 'utf8');

if (!fileStr.includes('import { QUESTS } from \'./questions\';')) {
  fileStr = 'import { QUESTS } from \'./questions\';\n' + fileStr;
}

const addQuestsLogic = `
    // Add all questions from the main QUESTS array
    QUESTS.forEach(questGroup => {
      let mappedSkill = questGroup.id;
      // Map quest categories to final exam skills
      if (['about_myself', 'family', 'school', 'food', 'weather_seasons', 'illness'].includes(questGroup.id)) mappedSkill = 'vocabulary';
      if (['directions'].includes(questGroup.id)) mappedSkill = 'directions';
      if (['conversation', 'conversation_rescue', 'emotions_feelings'].includes(questGroup.id)) mappedSkill = 'conversation';
      if (['signs', 'sign_detective'].includes(questGroup.id)) mappedSkill = 'signs';
      if (['grammar', 'tenses_boss'].includes(questGroup.id)) mappedSkill = 'grammar';
      if (['reading', 'reading_detective', 'finalboss'].includes(questGroup.id)) mappedSkill = 'reading';
      if (['question_words', 'yes_no'].includes(questGroup.id)) mappedSkill = 'question_words';

      questGroup.questions.forEach(q => {
        const qCopy = { ...q, skill: mappedSkill };
        addQuestions([qCopy]);
      });
    });
`;

if (!fileStr.includes('QUESTS.forEach(questGroup => {')) {
  fileStr = fileStr.replace(/addQuestions\(speedMockPool\);/, 'addQuestions(speedMockPool);\n' + addQuestsLogic);
  fs.writeFileSync('src/data/chapter4_questions.js', fileStr);
  console.log('Updated getFinalExamPool to include all QUESTS!');
} else {
  console.log('Already included.');
}
