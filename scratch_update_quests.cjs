const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/questions.js');
let content = fs.readFileSync(filePath, 'utf8');

const newQuestsStr = `export const QUESTS = [
  // ── Chapter 1: The Foundation (Basic Vocab & Grammar) ──
  { id: 'vocabulary', chapter: 1, name: 'Vocab Village', description: 'คำศัพท์รอบตัว ยานพาหนะ สถานที่', icon: '📚', color: 'from-blue-600 to-cyan-500', questions: vocabularyQuestions },
  { id: 'numbers', chapter: 1, name: 'Number Arena', description: 'ตัวเลข ราคา และการบอกเวลา', icon: '🔢', color: 'from-violet-600 to-purple-500', questions: numbersQuestions },
  { id: 'weather_seasons', chapter: 1, name: 'Weather & Seasons', description: 'สภาพอากาศและฤดูกาล', icon: '🌤️', color: 'from-yellow-500 to-amber-400', questions: ch5QuizQuestions('weather_seasons') },
  { id: 'food', chapter: 1, name: 'Food Festival', description: 'อาหารและการสั่งอาหาร', icon: '🍜', color: 'from-red-600 to-orange-500', questions: foodQuestions },
  { id: 'illness', chapter: 1, name: 'Health Clinic', description: 'คำศัพท์การเจ็บป่วยและสุขภาพ', icon: '🏥', color: 'from-teal-600 to-cyan-500', questions: illnessQuestions },
  { id: 'shapes_colors', chapter: 1, name: 'Shapes & Colors', description: 'รูปทรงและสีสัน', icon: '🎨', color: 'from-purple-600 to-indigo-500', questions: ch5QuizQuestions('shapes_colors') },
  { id: 'grammar', chapter: 1, name: 'Grammar Boss', description: 'สรุป Tense และ Grammar พื้นฐาน', icon: '⚡', color: 'from-pink-600 to-rose-500', questions: grammarQuestions },

  // ── Chapter 2: Social Interactions ──
  { id: 'conversation', chapter: 2, name: 'Conversation Café', description: 'บทสนทนาทักทาย ขอบคุณ ขอโทษ', icon: '💬', color: 'from-purple-600 to-violet-500', questions: conversationQuestions, unlockCondition: ['Chapter1'] },
  { id: 'conversation_rescue', chapter: 2, name: 'Conversation Rescue', description: 'มารยาทสังคมและการขอความช่วยเหลือ', icon: '🤝', color: 'from-pink-600 to-rose-700', questions: conversationRescueQuestions, unlockCondition: ['Chapter1'] },
  { id: 'emotions_feelings', chapter: 2, name: 'Emotions & Feelings', description: 'อารมณ์และความรู้สึก', icon: '😊', color: 'from-emerald-500 to-teal-400', questions: ch5QuizQuestions('emotions_feelings'), unlockCondition: ['Chapter1'] },
  { id: 'jobs', chapter: 2, name: 'Career World', description: 'อาชีพและการทำงาน', icon: '👷', color: 'from-orange-600 to-amber-500', questions: jobsQuestions, unlockCondition: ['Chapter1'] },
  { id: 'market', chapter: 2, name: 'Market Quest', description: 'การซื้อขายในตลาด', icon: '🛒', color: 'from-yellow-500 to-amber-400', questions: marketQuestions, unlockCondition: ['Chapter1'] },

  // ── Chapter 3: The Interrogation Room (Question Mastery) ──
  { id: 'question_words', chapter: 3, name: 'Question Word Gate', description: 'ฝึกวิเคราะห์คำถาม Wh-Questions', icon: '🕵️', color: 'from-purple-700 to-indigo-800', questions: questionWordQuestions, unlockCondition: ['Chapter2'] },
  { id: 'pronouns_master', chapter: 3, name: 'Pronoun World', description: 'วิเคราะห์สรรพนามในคำถาม', icon: '👥', color: 'from-fuchsia-600 to-pink-500', questions: ch5QuizQuestions('pronouns_master'), unlockCondition: ['Chapter2'] },
  { id: 'tenses_arena', chapter: 3, name: 'Tense Mastery', description: 'จับผิด Tense ในประโยคคำถาม', icon: '⏳', color: 'from-yellow-600 to-orange-500', questions: ch5QuizQuestions('tenses_arena'), unlockCondition: ['Chapter2'] },
  { id: 'strategy_boss', chapter: 3, name: 'The Question Sphinx', description: 'บอสแห่งคำถาม (Two-Step Strategy)', icon: '👑', color: 'from-red-700 to-rose-900', questions: strategyBossQuestions, unlockCondition: ['Chapter2'] },

  // ── Chapter 4: Data Detective (Reading & Interpretation) ──
  { id: 'signs', chapter: 4, name: 'Signs City', description: 'อ่านป้ายและสัญลักษณ์', icon: '🚦', color: 'from-red-600 to-orange-500', questions: signsQuestions, unlockCondition: ['Chapter3'] },
  { id: 'sign_detective', chapter: 4, name: 'Sign Detective', description: 'วิเคราะห์ป้ายแบบลึก', icon: '🔍', color: 'from-slate-700 to-gray-900', questions: signDetectiveQuestions, unlockCondition: ['Chapter3'] },
  { id: 'directions', chapter: 4, name: 'Direction Maze', description: 'คำบอกทิศทางและแผนที่', icon: '🧭', color: 'from-green-600 to-emerald-500', questions: directionsQuestions, unlockCondition: ['Chapter3'] },
  { id: 'prepositions_hub', chapter: 4, name: 'Preposition Portal', description: 'ตำแหน่งและสถานที่', icon: '📍', color: 'from-emerald-600 to-teal-500', questions: ch5QuizQuestions('prepositions_hub'), unlockCondition: ['Chapter3'] },
  { id: 'map_escape', chapter: 4, name: 'Map Escape', description: 'วิเคราะห์แผนผังและทิศทาง', icon: '🗺️', color: 'from-emerald-700 to-teal-900', questions: mapEscapeQuestions, unlockCondition: ['Chapter3'] },
  { id: 'reading', chapter: 4, name: 'Reading Dungeon', description: 'การอ่านจับใจความ', icon: '📖', color: 'from-indigo-600 to-blue-700', questions: readingQuestions, unlockCondition: ['Chapter3'] },
  { id: 'reading_detective', chapter: 4, name: 'Reading Detective', description: 'หา keyword จาก passage', icon: '🕵️‍♂️', color: 'from-amber-700 to-orange-900', questions: readingDetectiveQuestions, unlockCondition: ['Chapter3'] },
  { id: 'finalboss', chapter: 4, name: 'The Logic Dragon', description: 'สอบวัดผลก่อนเข้า Arena', icon: '🐉', color: 'from-amber-500 to-yellow-400', questions: strategyBossQuestions, unlockCondition: ['Chapter3'] }, // Using strategyBossQuestions temporarily

  // ── Chapter 5: Expansion / Extra Quests ──
  { id: 'nouns_quantifiers', chapter: 5, name: 'Countable & Quantifiers', description: 'คำนามและปริมาณ', icon: '🥛', color: 'from-cyan-600 to-blue-500', questions: ch5QuizQuestions('nouns_quantifiers') },
  { id: 'adjectives_comp', chapter: 5, name: 'Adjective & Comparison', description: 'การเปรียบเทียบ', icon: '📏', color: 'from-amber-600 to-yellow-500', questions: ch5QuizQuestions('adjectives_comp') },
  { id: 'clothes_fashion', chapter: 5, name: 'Clothes & Fashion', description: 'เครื่องแต่งกาย', icon: '👕', color: 'from-pink-600 to-rose-500', questions: ch5QuizQuestions('clothes_fashion') },
  { id: 'world_countries', chapter: 5, name: 'Countries & Nationalities', description: 'ประเทศและสัญชาติ', icon: '🇹🇭', color: 'from-red-600 to-rose-500', questions: ch5QuizQuestions('world_countries') },
  { id: 'nature_environment', chapter: 5, name: 'Eco & Environment', description: 'สิ่งแวดล้อม', icon: '🌿', color: 'from-green-600 to-emerald-500', questions: ch5QuizQuestions('nature_environment') },
  { id: 'school_subjects', chapter: 5, name: 'School Subjects', description: 'วิชาเรียน', icon: '📚', color: 'from-blue-600 to-cyan-500', questions: ch5QuizQuestions('school_subjects') },
];

export const preTestQuestions = [`;

content = content.replace(/export const QUESTS = \[[\s\S]*?export const preTestQuestions = \[/, newQuestsStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated questions.js');
