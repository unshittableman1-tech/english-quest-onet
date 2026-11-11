// ============================================================
// ch5_missions.js — Mission data สำหรับ Chapter 5 (12 Quests ใหม่)
// ข้อมูลจาก: English Worksheet P6 + เฉลยใบงานครู 28 หมวด + สูตรลัด O-NET
// ============================================================

import { TECHNIQUE_CARDS } from './ch1_missions';

// ── 1. Pronouns Master 👥 ────────────────────────────────────
export const pronounsMasterMissions = [
  {
    id: 'pm_flip',
    questId: 'pronouns_master',
    type: 'flashcard',
    title: '👥 Pronoun 5 Types',
    subtitle: 'จำรูปสรรพนามทั้ง 5 ชนิด',
    xpReward: 30,
    cards: [
      { id: 'p1', front: 'Subject: I', frontLabel: 'ฉัน (ประธาน)', back: 'I → me → my → mine → myself', backThai: 'ฉัน / สรรพนามชุด I', hint: 'I = ประธาน' },
      { id: 'p2', front: 'Subject: You', frontLabel: 'คุณ (ประธาน)', back: 'You → you → your → yours → yourself', backThai: 'คุณ / สรรพนามชุด You', hint: 'You = ประธาน' },
      { id: 'p3', front: 'Subject: He', frontLabel: 'เขาผู้ชาย (ประธาน)', back: 'He → him → his → his → himself', backThai: 'เขาผู้ชาย / สรรพนามชุด He', hint: 'He = ประธาน' },
      { id: 'p4', front: 'Subject: She', frontLabel: 'หล่อนผู้หญิง (ประธาน)', back: 'She → her → her → hers → herself', backThai: 'หล่อน / สรรพนามชุด She', hint: 'She = ประธาน' },
      { id: 'p5', front: 'Subject: It', frontLabel: 'มัน/สัตว์/สิ่งของ', back: 'It → it → its → its → itself', backThai: 'มัน / สรรพนามชุด It', hint: 'It = สิ่งของ/สัตว์' },
      { id: 'p6', front: 'Subject: We', frontLabel: 'พวกเรา (ประธาน)', back: 'We → us → our → ours → ourselves', backThai: 'พวกเรา / สรรพนามชุด We', hint: 'We = พวกเรา' },
      { id: 'p7', front: 'Subject: They', frontLabel: 'พวกเขา/พวกมัน', back: 'They → them → their → theirs → themselves', backThai: 'พวกเขา / สรรพนามชุด They', hint: 'They = หลายคน/สิ่ง' },
    ],
  },
  {
    id: 'pm_fill',
    questId: 'pronouns_master',
    type: 'fill_blank',
    title: '✍️ Pronoun Drill',
    subtitle: 'เลือกสรรพนามให้ตรงกับประโยค',
    xpReward: 40,
    questions: [
      { id: 'pq1', sentence: 'John plays with ___ dog in the park.', options: ['his', 'him', 'he', 'himself'], answer: 0, answerThai: 'his = ของเขา', hint: 'John (ผู้ชาย) → his' },
      { id: 'pq2', sentence: 'Mary finished ___ homework early.', options: ['her', 'hers', 'she', 'herself'], answer: 0, answerThai: 'her = ของหล่อน', hint: 'Mary (ผู้หญิง) → her' },
      { id: 'pq3', sentence: 'This cat cleans ___ every day.', options: ['itself', 'its', 'it', 'himself'], answer: 0, answerThai: 'itself = ตัวของมันเอง (Reflexive)', hint: 'Cat → itself' },
      { id: 'pq4', sentence: 'That pen is not yours. It is ___.', options: ['mine', 'my', 'me', 'myself'], answer: 0, answerThai: 'mine = ของฉัน (Possessive Pronoun)', hint: 'ไม่มีคำนามตาม → mine' },
      { id: 'pq5', sentence: 'Teacher told ___ to sit down.', options: ['us', 'we', 'our', 'ourselves'], answer: 0, answerThai: 'us = พวกเรา (กรรม)', hint: 'หลังกริยา = กรรม us' },
    ],
  },
];

// ── 2. Nouns & Quantifiers 🥛 ──────────────────────────────
export const nounsQuantifiersMissions = [
  {
    id: 'nq_match',
    questId: 'nouns_quantifiers',
    type: 'matching',
    title: '🥛 Quantifiers Match',
    subtitle: 'จับคู่คำบอกปริมาณกับการใช้',
    xpReward: 30,
    pairs: [
      { id: 'nqm1', left: 'many 📚', right: 'นามนับได้พหูพจน์', leftThai: 'หลาย/มาก' },
      { id: 'nqm2', left: 'much 🥛', right: 'นามนับไม่ได้', leftThai: 'มาก' },
      { id: 'nqm3', left: 'some 🍎', right: 'บอกเล่า / ชวน', leftThai: 'บ้าง' },
      { id: 'nqm4', left: 'any ❓', right: 'ปฏิเสธ / คำถาม', leftThai: 'เลย' },
      { id: 'nqm5', left: 'a few ✏️', right: 'นับได้ (น้อย)', leftThai: 'เล็กน้อย' },
      { id: 'nqm6', left: 'a little 💧', right: 'นับไม่ได้ (น้อย)', leftThai: 'เล็กน้อย' },
    ],
  },
  {
    id: 'nq_fill',
    questId: 'nouns_quantifiers',
    type: 'fill_blank',
    title: '🥛 Irregular Plurals & Quantifiers',
    subtitle: 'เลือกคำนามพหูพจน์และ Quantifier',
    xpReward: 40,
    questions: [
      { id: 'nqq1', sentence: 'There are two ___ under the table.', options: ['mice', 'mouses', 'mouse', 'mices'], answer: 0, answerThai: 'mice (พหูพจน์ของ mouse)', hint: 'mouse → mice' },
      { id: 'nqq2', sentence: 'I wash my ___ before sleeping.', options: ['feet', 'foots', 'foot', 'feets'], answer: 0, answerThai: 'feet (พหูพจน์ของ foot)', hint: 'foot → feet' },
      { id: 'nqq3', sentence: 'Do you have ___ milk in the fridge?', options: ['any', 'some', 'many', 'few'], answer: 0, answerThai: 'any (ใช้ในประโยคคำถาม)', hint: 'ประโยคคำถาม → any' },
      { id: 'nqq4', sentence: 'There is ___ water in the bottle.', options: ['some', 'many', 'few', 'any'], answer: 0, answerThai: 'some (ประโยคบอกเล่า)', hint: 'บอกเล่า + นับไม่ได้ → some' },
      { id: 'nqq5', sentence: 'How ___ books do you read?', options: ['many', 'much', 'little', 'some'], answer: 0, answerThai: 'How many (หนังสือ=นับได้)', hint: 'books นับได้ → How many' },
    ],
  },
];

// ── 3. Adjectives & Comparison 📏 ───────────────────────────
export const adjectivesCompMissions = [
  {
    id: 'ac_flip',
    questId: 'adjectives_comp',
    type: 'flashcard',
    title: '📏 Comparison Rules',
    subtitle: 'กฎการเปรียบเทียบขั้นกว่า-ขั้นสุด',
    xpReward: 30,
    cards: [
      { id: 'ac1', front: 'big 🐘', frontLabel: 'ใหญ่', back: 'bigger than → the biggest', backThai: 'ใหญ่กว่า → ใหญ่ที่สุด', hint: 'บวก -er / -est' },
      { id: 'ac2', front: 'tall 🦒', frontLabel: 'สูง', back: 'taller than → the tallest', backThai: 'สูงกว่า → สูงที่สุด', hint: 'taller / tallest' },
      { id: 'ac3', front: 'beautiful 🌺', frontLabel: 'สวยงาม', back: 'more beautiful than → the most beautiful', backThai: 'สวยกว่า → สวยที่สุด', hint: '3 พยางค์ → more / most' },
      { id: 'ac4', front: 'good 🌟', frontLabel: 'ดี', back: 'better than → the best', backThai: 'ดีกว่า → ดีที่สุด (เปลี่ยนรูป)', hint: 'good → better → best' },
      { id: 'ac5', front: 'bad ❌', frontLabel: 'เลว/แย่', back: 'worse than → the worst', backThai: 'แย่กว่า → แย่ที่สุด (เปลี่ยนรูป)', hint: 'bad → worse → worst' },
    ],
  },
  {
    id: 'ac_fill',
    questId: 'adjectives_comp',
    type: 'fill_blank',
    title: '📏 Comparison Sentence',
    subtitle: 'เลือกคำเปรียบเทียบในประโยค',
    xpReward: 40,
    questions: [
      { id: 'acq1', sentence: 'An elephant is ___ than a dog.', options: ['bigger', 'big', 'biggest', 'more big'], answer: 0, answerThai: 'bigger than = ใหญ่กว่า', hint: 'มีคำว่า than → -er' },
      { id: 'acq2', sentence: 'Mount Everest is the ___ mountain in the world.', options: ['highest', 'higher', 'high', 'more high'], answer: 0, answerThai: 'the highest = สูงที่สุด', hint: 'มี the → -est' },
      { id: 'acq3', sentence: 'This exam is ___ than yesterday\'s exam.', options: ['easier', 'easy', 'easiest', 'more easy'], answer: 0, answerThai: 'easier than = ง่ายกว่า', hint: 'easy → easier' },
      { id: 'acq4', sentence: 'She is the ___ student in our class.', options: ['best', 'good', 'better', 'more good'], answer: 0, answerThai: 'the best = ดีที่สุด', hint: 'good → the best' },
    ],
  },
];

// ── 4. Preposition Portal 📍 ─────────────────────────────────
export const prepositionsMissions = [
  {
    id: 'prep_match',
    questId: 'prepositions_hub',
    type: 'matching',
    title: '📍 Prepositions Match',
    subtitle: 'จับคู่ Preposition กับความหมาย',
    xpReward: 30,
    pairs: [
      { id: 'pm1', left: 'in 📦', right: 'ข้างใน / เดือน / ปี', leftThai: 'ใน' },
      { id: 'pm2', left: 'on 📅', right: 'ข้างบน / วัน / วันที่', leftThai: 'บน' },
      { id: 'pm3', left: 'at ⏰', right: 'สถานที่ระบุ / เวลาชั่วโมง', leftThai: 'ที่' },
      { id: 'pm4', left: 'under ☂️', right: 'ข้างใต้', leftThai: 'ใต้' },
      { id: 'pm5', left: 'behind 🔙', right: 'ข้างหลัง', leftThai: 'หลัง' },
      { id: 'pm6', left: 'in front of ⬛', right: 'ข้างหน้า', leftThai: 'หน้า' },
    ],
  },
  {
    id: 'prep_fill',
    questId: 'prepositions_hub',
    type: 'fill_blank',
    title: '📍 Preposition Fill',
    subtitle: 'เลือก in / on / at ให้ถูกต้อง',
    xpReward: 30,
    questions: [
      { id: 'prq1', sentence: 'My birthday is ___ October 31st.', options: ['on', 'in', 'at', 'under'], answer: 0, answerThai: 'on (ใช้กับวันที่ระบุ)', hint: 'มีวันที่ → on' },
      { id: 'prq2', sentence: 'He gets up ___ 6:00 a.m. every day.', options: ['at', 'on', 'in', 'by'], answer: 0, answerThai: 'at (ใช้กับเวลาชั่วโมง)', hint: 'เวลาชั่วโมง → at' },
      { id: 'prq3', sentence: 'We usually go to the beach ___ summer.', options: ['in', 'on', 'at', 'with'], answer: 0, answerThai: 'in (ใช้กับฤดูกาล/เดือน)', hint: 'ฤดูกาล → in' },
      { id: 'prq4', sentence: 'The cat is sleeping ___ the bed.', options: ['on', 'at', 'in', 'to'], answer: 0, answerThai: 'on (บนเตียง)', hint: 'บนพื้นผิว → on' },
    ],
  },
];

// ── 5. Clothes & Accessories 👔 ──────────────────────────────
export const clothesMissions = [
  {
    id: 'clothes_flip',
    questId: 'clothes_fashion',
    type: 'flashcard',
    title: '👔 Clothes Flash',
    subtitle: 'เรียนคำศัพท์เครื่องแต่งกาย',
    xpReward: 30,
    cards: [
      { id: 'c1', front: '👗', frontLabel: 'dress', back: 'dress', backThai: 'ชุดกระโปรงยาว', hint: '' },
      { id: 'c2', front: '👕', frontLabel: 'shirt / T-shirt', back: 'shirt', backThai: 'เสื้อเชิ้ต / เสื้อยืด', hint: '' },
      { id: 'c3', front: '🥼', frontLabel: 'raincoat', back: 'raincoat', backThai: 'เสื้อกันฝน', hint: 'rain + coat' },
      { id: 'c4', front: '👖', frontLabel: 'trousers / jeans', back: 'jeans', backThai: 'กางเกงขายาว', hint: '' },
      { id: 'c5', front: '👟', frontLabel: 'shoes', back: 'shoes', backThai: 'รองเท้า', hint: '' },
      { id: 'c6', front: '🧦', frontLabel: 'socks', back: 'socks', backThai: 'ถุงเท้า', hint: '' },
      { id: 'c7', front: '🧢', frontLabel: 'cap / hat', back: 'cap', backThai: 'หมวก', hint: '' },
      { id: 'c8', front: '🧥', frontLabel: 'jacket', back: 'jacket', backThai: 'เสื้อแจ็คเก็ต', hint: '' },
    ],
  },
  {
    id: 'clothes_match',
    questId: 'clothes_fashion',
    type: 'matching',
    title: '👗 Fashion Match',
    subtitle: 'จับคู่ชุดแต่งกายกับ emoji',
    xpReward: 30,
    pairs: [
      { id: 'cm1', left: 'raincoat 🥼', right: 'วันฝนตก 🌧️', leftThai: 'เสื้อกันฝน' },
      { id: 'cm2', left: 'sunglasses 🕶️', right: 'วันแดดจัด ☀️', leftThai: 'แว่นกันแดด' },
      { id: 'cm3', left: 'sweater 🧥', right: 'วันอากาศหนาว ❄️', leftThai: 'เสื้อกันหนาว' },
      { id: 'cm4', left: 'swimsuit 🩱', right: 'ไปสระว่ายน้ำ 🏊', leftThai: 'ชุดว่ายน้ำ' },
      { id: 'cm5', left: 'uniform 🏫', right: 'ไปโรงเรียน 🎒', leftThai: 'ชุดนักเรียน' },
    ],
  },
];

// ── 6. Weather & Seasons 🌤️ ─────────────────────────────────
export const weatherMissions = [
  {
    id: 'weather_flip',
    questId: 'weather_seasons',
    type: 'flashcard',
    title: '🌤️ Weather & Seasons',
    subtitle: 'เรียนสภาพอากาศและฤดูกาล',
    xpReward: 30,
    cards: [
      { id: 'w1', front: '☀️', frontLabel: 'sunny', back: 'sunny', backThai: 'แดดออก / แจ่มใส', hint: '' },
      { id: 'w2', front: '🌧️', frontLabel: 'rainy', back: 'rainy', backThai: 'ฝนตก', hint: '' },
      { id: 'w3', front: '❄️', frontLabel: 'snowy / cold', back: 'cold', backThai: 'หนาว / หิมะตก', hint: '' },
      { id: 'w4', front: '💨', frontLabel: 'windy', back: 'windy', backThai: 'ลมแรง', hint: '' },
      { id: 'w5', front: '🌫️', frontLabel: 'foggy', back: 'foggy', backThai: 'หมอกหนา', hint: '' },
      { id: 'w6', front: '🌸', frontLabel: 'spring', back: 'spring', backThai: 'ฤดูใบไม้ผลิ', hint: '' },
      { id: 'w7', front: '🏖️', frontLabel: 'summer', back: 'summer', backThai: 'ฤดูร้อน', hint: '' },
      { id: 'w8', front: '🍂', frontLabel: 'autumn / fall', back: 'autumn', backThai: 'ฤดูใบไม้ร่วง', hint: '' },
      { id: 'w9', front: '☃️', frontLabel: 'winter', back: 'winter', backThai: 'ฤดูหนาว', hint: '' },
    ],
  },
  {
    id: 'weather_fill',
    questId: 'weather_seasons',
    type: 'fill_blank',
    title: '🌧️ Weather Sentence',
    subtitle: 'เติมคำบอกสภาพอากาศ',
    xpReward: 30,
    questions: [
      { id: 'wq1', sentence: 'Don\'t forget your umbrella! It is ___ today.', options: ['rainy', 'sunny', 'hot', 'foggy'], answer: 0, answerThai: 'rainy (ฝนตก)', hint: 'umbrella = ร่ม' },
      { id: 'wq2', sentence: 'Put on your sweater. The weather is very ___.', options: ['cold', 'hot', 'sunny', 'warm'], answer: 0, answerThai: 'cold (หนาว)', hint: 'sweater = เสื้อกันหนาว' },
      { id: 'wq3', sentence: 'Trees lose their leaves in ___.', options: ['autumn', 'spring', 'summer', 'winter'], answer: 0, answerThai: 'autumn (ฤดูใบไม้ร่วง)', hint: 'lose leaves = ร่วง' },
    ],
  },
];

// ── 7. Emotions & Feelings 😊 ────────────────────────────────
export const emotionsMissions = [
  {
    id: 'emotions_flip',
    questId: 'emotions_feelings',
    type: 'flashcard',
    title: '😊 Emotions Flash',
    subtitle: 'เรียนอารมณ์และความรู้สึก',
    xpReward: 30,
    cards: [
      { id: 'e1', front: '😃', frontLabel: 'happy', back: 'happy', backThai: 'มีความสุข', hint: '' },
      { id: 'e2', front: '😢', frontLabel: 'sad', back: 'sad', backThai: 'เศร้าเสียใจ', hint: '' },
      { id: 'e3', front: '😡', frontLabel: 'angry', back: 'angry', backThai: 'โกรธ', hint: '' },
      { id: 'e4', front: '😱', frontLabel: 'scared / afraid', back: 'scared', backThai: 'กลัว', hint: '' },
      { id: 'e5', front: '🤩', frontLabel: 'excited', back: 'excited', backThai: 'ตื่นเต้น', hint: '' },
      { id: 'e6', front: '🥱', frontLabel: 'tired / sleepy', back: 'tired', backThai: 'เหนื่อย / ง่วง', hint: '' },
      { id: 'e7', front: '🏆', frontLabel: 'proud', back: 'proud', backThai: 'ภาคภูมิใจ', hint: '' },
      { id: 'e8', front: '🤔', frontLabel: 'confused', back: 'confused', backThai: 'สับสน', hint: '' },
    ],
  },
  {
    id: 'emotions_match',
    questId: 'emotions_feelings',
    type: 'matching',
    title: '🎭 Emotion Match',
    subtitle: 'จับคู่อารมณ์กับสถานการณ์',
    xpReward: 30,
    pairs: [
      { id: 'em1', left: 'happy 😃', right: 'สอบผ่านได้คะแนนดี 💯', leftThai: 'มีความสุข' },
      { id: 'em2', left: 'scared 😱', right: 'เจอผี / เจอสุนัขดุ 🐶', leftThai: 'กลัว' },
      { id: 'em3', left: 'tired 🥱', right: 'วิ่งออกกำลังกายทั้งวัน 🏃', leftThai: 'เหนื่อย' },
      { id: 'em4', left: 'proud 🏆', right: 'ชนะการแข่งขัน 🥇', leftThai: 'ภูมิใจ' },
    ],
  },
];

// ── 8. Countries & Nationalities 🇹🇭 ─────────────────────────
export const countriesMissions = [
  {
    id: 'countries_match',
    questId: 'world_countries',
    type: 'matching',
    title: '🇹🇭 Country & Flag Match',
    subtitle: 'จับคู่ประเทศกับสัญชาติ',
    xpReward: 30,
    pairs: [
      { id: 'cn1', left: 'Thailand 🇹🇭', right: 'Thai', leftThai: 'ประเทศไทย' },
      { id: 'cn2', left: 'Japan 🇯🇵', right: 'Japanese', leftThai: 'ประเทศญี่ปุ่น' },
      { id: 'cn3', left: 'China 🇨🇳', right: 'Chinese', leftThai: 'ประเทศจีน' },
      { id: 'cn4', left: 'Korea 🇰🇷', right: 'Korean', leftThai: 'ประเทศเกาหลี' },
      { id: 'cn5', left: 'England 🇬🇧', right: 'English / British', leftThai: 'ประเทศอังกฤษ' },
      { id: 'cn6', left: 'America 🇺🇸', right: 'American', leftThai: 'ประเทศอเมริกา' },
    ],
  },
  {
    id: 'countries_fill',
    questId: 'world_countries',
    type: 'fill_blank',
    title: '🌍 Nationality Sentence',
    subtitle: 'เติมประเทศและสัญชาติ',
    xpReward: 30,
    questions: [
      { id: 'cq1', sentence: 'Ken is from Japan. He is ___', options: ['Japanese', 'Japan', 'Chinese', 'Thai'], answer: 0, answerThai: 'Japanese (สัญชาติญี่ปุ่น)', hint: 'from Japan → Japanese' },
      { id: 'cq2', sentence: 'Lisa is from Thailand. She speaks ___.', options: ['Thai', 'Thailand', 'English', 'Japanese'], answer: 0, answerThai: 'Thai (ภาษาไทย)', hint: 'from Thailand → Thai' },
      { id: 'cq3', sentence: 'Where are you from? — I am from ___.', options: ['Thailand', 'Thai', 'American', 'Chinese'], answer: 0, answerThai: 'Thailand (ชื่อประเทศ)', hint: 'from + ชื่อประเทศ' },
    ],
  },
];

// ── 9. Shapes & Geometry 🔷 ──────────────────────────────────
export const shapesMissions = [
  {
    id: 'shapes_flip',
    questId: 'shapes_colors',
    type: 'flashcard',
    title: '🔷 Shapes Flash',
    subtitle: 'เรียนรู้รูปทรงทางเรขาคณิต',
    xpReward: 30,
    cards: [
      { id: 'sh1', front: '🔴', frontLabel: 'circle', back: 'circle', backThai: 'วงกลม', hint: '' },
      { id: 'sh2', front: '⬛', frontLabel: 'square', back: 'square', backThai: 'สี่เหลี่ยมจัตุรัส', hint: '' },
      { id: 'sh3', front: '🔺', frontLabel: 'triangle', back: 'triangle', backThai: 'สามเหลี่ยม', hint: 'tri = สาม' },
      { id: 'sh4', front: '🔷', frontLabel: 'diamond', back: 'diamond', backThai: 'สี่เหลี่ยมข้าวหลามตัด', hint: '' },
      { id: 'sh5', front: '⭐', frontLabel: 'star', back: 'star', backThai: 'รูปดาว', hint: '' },
      { id: 'sh6', front: '🥚', frontLabel: 'oval', back: 'oval', backThai: 'วงรี / รูปไข่', hint: '' },
      { id: 'sh7', front: '▭', frontLabel: 'rectangle', back: 'rectangle', backThai: 'สี่เหลี่ยมผืนผ้า', hint: '' },
    ],
  },
  {
    id: 'shapes_match',
    questId: 'shapes_colors',
    type: 'matching',
    title: '🔺 Shape Matching',
    subtitle: 'จับคู่รูปทรงกับคำศัพท์',
    xpReward: 30,
    pairs: [
      { id: 'sm1', left: 'circle', right: '🔴 วงกลม', leftThai: '' },
      { id: 'sm2', left: 'triangle', right: '🔺 สามเหลี่ยม', leftThai: '' },
      { id: 'sm3', left: 'square', right: '⬛ สี่เหลี่ยม', leftThai: '' },
      { id: 'sm4', left: 'star', right: '⭐ ดาว', leftThai: '' },
      { id: 'sm5', left: 'diamond', right: '🔷 ข้าวหลามตัด', leftThai: '' },
    ],
  },
];

// ── 10. Environment & Eco 🌿 ─────────────────────────────────
export const environmentMissions = [
  {
    id: 'env_flip',
    questId: 'nature_environment',
    type: 'flashcard',
    title: '🌿 Eco & Environment',
    subtitle: 'เรียนคำศัพท์อนุรักษ์สิ่งแวดล้อม',
    xpReward: 30,
    cards: [
      { id: 'ev1', front: '♻️', frontLabel: 'recycle', back: 'recycle', backThai: 'นำกลับมาใช้ใหม่', hint: '' },
      { id: 'ev2', front: '🗑️', frontLabel: 'garbage / trash', back: 'garbage', backThai: 'ขยะ', hint: '' },
      { id: 'ev3', front: '🌳', frontLabel: 'plant trees', back: 'plant trees', backThai: 'ปลูกต้นไม้', hint: '' },
      { id: 'ev4', front: '💡', frontLabel: 'save energy', back: 'save energy', backThai: 'ประหยัดพลังงาน', hint: '' },
      { id: 'ev5', front: '🚯', frontLabel: 'don\'t litter', back: 'don\'t litter', backThai: 'ห้ามทิ้งขยะเรี่ยราด', hint: '' },
      { id: 'ev6', front: '😷', frontLabel: 'pollution', back: 'pollution', backThai: 'มลพิษ / มลภาวะ', hint: '' },
    ],
  },
  {
    id: 'env_fill',
    questId: 'nature_environment',
    type: 'fill_blank',
    title: '🌱 Save the Planet',
    subtitle: 'เลือกคำตอบรักษ์โลก',
    xpReward: 30,
    questions: [
      { id: 'evq1', sentence: 'We should ___ paper and plastic bottles.', options: ['recycle', 'burn', 'throw', 'litter'], answer: 0, answerThai: 'recycle (นำกลับมาใช้ใหม่)', hint: 'เพื่อสิ่งแวดล้อม' },
      { id: 'evq2', sentence: 'Turn off the lights to ___ energy.', options: ['save', 'use', 'waste', 'buy'], answer: 0, answerThai: 'save energy (ประหยัดพลังงาน)', hint: 'ปิดไฟ → ประหยัด' },
    ],
  },
];

// ── 11. School Subjects 📚 ───────────────────────────────────
export const subjectsMissions = [
  {
    id: 'sub_match',
    questId: 'school_subjects',
    type: 'matching',
    title: '📚 Subject Match',
    subtitle: 'จับคู่วิชาเรียนกับอุปกรณ์/เนื้อหา',
    xpReward: 30,
    pairs: [
      { id: 'sbm1', left: 'Math 🔢', right: 'ตัวเลขและการคำนวณ', leftThai: 'วิชาคณิตศาสตร์' },
      { id: 'sbm2', left: 'Science 🧪', right: 'การทดลองและธรรมชาติ', leftThai: 'วิชาวิทยาศาสตร์' },
      { id: 'sbm3', left: 'English 🇬🇧', right: 'การพูดและอ่านภาษาอังกฤษ', leftThai: 'วิชาภาษาอังกฤษ' },
      { id: 'sbm4', left: 'P.E. ⚽', right: 'การเล่นกีฬาและออกกำลังกาย', leftThai: 'วิชาสุขศึกษา/พละ' },
      { id: 'sbm5', left: 'Art 🎨', right: 'การวาดภาพและระบายสี', leftThai: 'วิชาศิลปะ' },
      { id: 'sbm6', left: 'Geography 🗺️', right: 'แผนที่และประเทศต่างๆ', leftThai: 'วิชาภูมิศาสตร์' },
    ],
  },
  {
    id: 'sub_fill',
    questId: 'school_subjects',
    type: 'fill_blank',
    title: '🏫 Favorite Subject',
    subtitle: 'ตอบคำถามเกี่ยวกับวิชาเรียน',
    xpReward: 30,
    questions: [
      { id: 'sbq1', sentence: 'My favorite subject is ___ because I like numbers.', options: ['Math', 'Art', 'P.E.', 'Music'], answer: 0, answerThai: 'Math (คณิตศาสตร์)', hint: 'numbers = ตัวเลข' },
      { id: 'sbq2', sentence: 'We play football and run in ___ class.', options: ['P.E.', 'Math', 'Science', 'English'], answer: 0, answerThai: 'P.E. (พละ)', hint: 'play football = เล่นฟุตบอล' },
      { id: 'sbq3', sentence: 'She draws pictures in ___ class.', options: ['Art', 'Science', 'Math', 'History'], answer: 0, answerThai: 'Art (ศิลปะ)', hint: 'draws pictures = วาดรูป' },
    ],
  },
];

// ── 12. Tenses Mastery ⚡ ─────────────────────────────────────
export const tensesMissions = [
  {
    id: 'ten_flip',
    questId: 'tenses_arena',
    type: 'flashcard',
    title: '⚡ Tense 4 Forms',
    subtitle: 'สรุป Tense หลักออกสอบ O-NET',
    xpReward: 30,
    techniqueCard: 'grammar',
    cards: [
      { id: 't1', front: 'Present Simple', frontLabel: 'กิจวัตร / ความจริง', back: 'Subject + V1 (s/es)\ne.g., He plays football every day.', backThai: 'เกิดขึ้นประจำ / เป็นจริง', hint: 'always, usually, every day' },
      { id: 't2', front: 'Present Continuous', frontLabel: 'กำลังทำอยู่ตอนนี้', back: 'Subject + is/am/are + V-ing\ne.g., She is studying now.', backThai: 'กำลังทำอยู่', hint: 'now, at the moment' },
      { id: 't3', front: 'Past Simple', frontLabel: 'เหตุการณ์อดีต', back: 'Subject + V2\ne.g., They went to Japan last year.', backThai: 'จบไปแล้วในอดีต', hint: 'yesterday, ago, last...' },
      { id: 't4', front: 'Future Simple', frontLabel: 'เหตุการณ์อนาคต', back: 'Subject + will + V1\ne.g., I will travel tomorrow.', backThai: 'จะเกิดขึ้นในอนาคต', hint: 'tomorrow, next...' },
    ],
  },
  {
    id: 'ten_rearrange',
    questId: 'tenses_arena',
    type: 'rearrange',
    title: '⚡ Tense Builder',
    subtitle: 'เรียงคำเป็นประโยค Tense ต่างๆ',
    xpReward: 40,
    techniqueHint: 'มองหาคำบอกเวลาก่อน → กำหนดรูปกริยาที่ถูก',
    wordSentences: [
      { id: 'tw1', words: ['He', 'plays', 'football', 'every', 'Sunday.'], correct: 'He plays football every Sunday.' },
      { id: 'tw2', words: ['She', 'is', 'cooking', 'dinner', 'now.'], correct: 'She is cooking dinner now.' },
      { id: 'tw3', words: ['We', 'visited', 'the', 'zoo', 'yesterday.'], correct: 'We visited the zoo yesterday.' },
      { id: 'tw4', words: ['They', 'will', 'fly', 'to', 'Bangkok', 'tomorrow.'], correct: 'They will fly to Bangkok tomorrow.' },
    ],
  },
];

export const CH5_MISSIONS = {
  pronouns_master: pronounsMasterMissions,
  nouns_quantifiers: nounsQuantifiersMissions,
  adjectives_comp: adjectivesCompMissions,
  prepositions_hub: prepositionsMissions,
  clothes_fashion: clothesMissions,
  weather_seasons: weatherMissions,
  emotions_feelings: emotionsMissions,
  world_countries: countriesMissions,
  shapes_colors: shapesMissions,
  nature_environment: environmentMissions,
  school_subjects: subjectsMissions,
  tenses_arena: tensesMissions,
};

export function getMissionsForQuest(questId) {
  return CH5_MISSIONS[questId] || [];
}
