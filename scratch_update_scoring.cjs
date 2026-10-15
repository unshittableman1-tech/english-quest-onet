const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/scoring.js');
let content = fs.readFileSync(filePath, 'utf8');

const newGetUnlockedQuests = `export function getUnlockedQuests(questProgress) {
  const passed = (questId) => (questProgress[questId]?.passed || (questProgress[questId]?.pct || 0) >= 70);
  
  const ch1Done = passed('grammar');
  const ch2Done = ch1Done && passed('conversation') && passed('conversation_rescue') && passed('emotions_feelings') && passed('jobs') && passed('market');
  const ch3Done = ch2Done && passed('strategy_boss');
  const ch4Done = ch3Done && passed('finalboss');

  return {
    // Chapter 1: The Foundation
    vocabulary:      true,
    numbers:         true,
    weather_seasons: passed('vocabulary'),
    food:            passed('numbers'),
    illness:         passed('weather_seasons'),
    shapes_colors:   passed('food'),
    grammar:         passed('illness') && passed('shapes_colors'),

    // Chapter 2: Social Interactions
    conversation:         ch1Done,
    conversation_rescue:  ch1Done,
    emotions_feelings:    ch1Done,
    jobs:                 ch1Done,
    market:               ch1Done,

    // Chapter 3: The Interrogation Room
    question_words:  ch2Done,
    pronouns_master: ch2Done,
    tenses_arena:    ch2Done,
    strategy_boss:   ch2Done && passed('question_words') && passed('pronouns_master') && passed('tenses_arena'),

    // Chapter 4: Data Detective
    signs:              ch3Done,
    sign_detective:     ch3Done,
    directions:         ch3Done,
    prepositions_hub:   ch3Done,
    map_escape:         ch3Done,
    reading:            ch3Done,
    reading_detective:  ch3Done,
    finalboss:          ch3Done && passed('signs') && passed('map_escape') && passed('reading') && passed('reading_detective'),

    // Chapter 5: O-NET Arena
    chapter4_unlocked:  ch4Done, // Keep the key as chapter4_unlocked for now to avoid breaking Arena component logic, or rename if safe.
  };
}`;

content = content.replace(/export function getUnlockedQuests\([\s\S]*?\}\n\s*\n/, newGetUnlockedQuests + '\n\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated scoring.js');
