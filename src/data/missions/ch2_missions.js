// ============================================================
// ch2_missions.js — Mission data สำหรับ Chapter 2 (4 Quests)
// ข้อมูลจาก: เฉลยใบงานครู (Illness, Jobs, Food, Ordinal Numbers)
// ============================================================

import { TECHNIQUE_CARDS } from './ch1_missions';

// ── Chapter 2, Quest 8: Health Clinic ─────────────────────────
export const illnessMissions = [
  {
    id: 'illness_flip',
    questId: 'illness',
    type: 'flashcard',
    title: '🤒 Illness Flash',
    subtitle: 'เรียนรู้คำศัพท์การเจ็บป่วย',
    xpReward: 30,
    // จากเฉลยครู: Illness 10 คำ
    cards: [
      { id: 'if1', front: '🤕', frontLabel: 'headache', back: 'headache', backThai: 'ปวดหัว', hint: 'head = หัว + ache = ปวด' },
      { id: 'if2', front: '🤧', frontLabel: 'runny nose', back: 'runny nose', backThai: 'น้ำมูกไหล', hint: 'nose = จมูก' },
      { id: 'if3', front: '🦷', frontLabel: 'toothache', back: 'toothache', backThai: 'ปวดฟัน', hint: 'tooth = ฟัน + ache = ปวด' },
      { id: 'if4', front: '👂', frontLabel: 'earache', back: 'earache', backThai: 'ปวดหู', hint: 'ear = หู + ache = ปวด' },
      { id: 'if5', front: '🔙', frontLabel: 'backache', back: 'backache', backThai: 'ปวดหลัง', hint: 'back = หลัง + ache = ปวด' },
      { id: 'if6', front: '🌡️', frontLabel: 'fever', back: 'fever', backThai: 'ไข้', hint: 'fever = ตัวร้อน' },
      { id: 'if7', front: '😮‍💨', frontLabel: 'sore throat', back: 'sore throat', backThai: 'เจ็บคอ', hint: 'throat = คอ' },
      { id: 'if8', front: '🤒', frontLabel: 'cold', back: 'cold', backThai: 'หวัด', hint: 'catch a cold = เป็นหวัด' },
      { id: 'if9', front: '😮', frontLabel: 'cough', back: 'cough', backThai: 'ไอ', hint: '' },
      { id: 'if10', front: '🤢', frontLabel: 'stomach ache', back: 'stomach ache', backThai: 'ปวดท้อง', hint: 'stomach = กระเพาะ' },
    ],
  },
  {
    id: 'illness_convo',
    questId: 'illness',
    type: 'conversation',
    title: '🏥 Doctor Chat',
    subtitle: 'สนทนาที่คลินิก เลือกคำตอบที่ถูกต้อง',
    xpReward: 40,
    scenes: [
      {
        id: 'ic1',
        context: '🏥 คุณไปหาหมอ',
        speaker: 'Doctor',
        speakerEmoji: '👨‍⚕️',
        text: "What's the matter?",
        options: ['I have a headache.', 'I am a student.', 'I go to school.', 'It\'s sunny today.'],
        correct: 0,
        explanation: '"What\'s the matter?" → ตอบด้วยอาการ "I have a ___"',
      },
      {
        id: 'ic2',
        context: '💊 หมอแนะนำยา',
        speaker: 'Doctor',
        speakerEmoji: '👨‍⚕️',
        text: 'Take this medicine three times a day.',
        options: ['Thank you, doctor.', 'I love playing football.', 'Where is the hospital?', 'My name is Tom.'],
        correct: 0,
        explanation: 'ตอบขอบคุณเมื่อได้รับคำแนะนำ',
      },
      {
        id: 'ic3',
        context: '🤒 เพื่อนถามอาการ',
        speaker: 'Friend',
        speakerEmoji: '👦',
        text: "You look pale. Are you OK?",
        options: ["No, I'm not. I have a fever.", 'I am fine, thank you.', 'I like pizza.', 'See you tomorrow.'],
        correct: 0,
        explanation: 'บอกอาการที่เป็นอยู่จริง',
      },
      {
        id: 'ic4',
        context: '🩺 หมอถามเพิ่มเติม',
        speaker: 'Doctor',
        speakerEmoji: '👨‍⚕️',
        text: 'Do you have a cough?',
        options: ['Yes, I do.', 'Yes, I am.', 'No, I don\'t like it.', 'I study English.'],
        correct: 0,
        explanation: '"Do you have...?" → "Yes, I do." / "No, I don\'t."',
      },
    ],
  },
];

// ── Chapter 2, Quest 9: Career World ─────────────────────────
export const jobsMissions = [
  {
    id: 'jobs_match',
    questId: 'jobs',
    type: 'matching',
    title: '💼 Job Match',
    subtitle: 'จับคู่อาชีพกับสถานที่ทำงาน',
    xpReward: 30,
    // จากเฉลยครู: Jobs 12 คำ + Where do you work
    pairs: [
      { id: 'jm1', left: 'doctor 👨‍⚕️', right: '🏥 hospital', leftThai: 'แพทย์' },
      { id: 'jm2', left: 'teacher 👩‍🏫', right: '🏫 school', leftThai: 'ครู' },
      { id: 'jm3', left: 'pilot ✈️', right: '🛫 airport', leftThai: 'นักบิน' },
      { id: 'jm4', left: 'chef 👨‍🍳', right: '🍽️ restaurant', leftThai: 'เชฟ' },
      { id: 'jm5', left: 'librarian 📚', right: '📖 library', leftThai: 'บรรณารักษ์' },
      { id: 'jm6', left: 'firefighter 🚒', right: '🔥 fire station', leftThai: 'นักดับเพลิง' },
      { id: 'jm7', left: 'vet 🐾', right: '🐶 vet clinic', leftThai: 'สัตวแพทย์' },
      { id: 'jm8', left: 'postman 📬', right: '📮 post office', leftThai: 'บุรุษไปรษณีย์' },
    ],
  },
  {
    id: 'jobs_fill',
    questId: 'jobs',
    type: 'fill_blank',
    title: '🏢 Job Sentence',
    subtitle: 'เติมคำให้ประโยคสมบูรณ์',
    xpReward: 30,
    // จากเฉลยครู: "I work in the ___"
    questions: [
      { id: 'jf1', sentence: 'A doctor works in a ___.', options: ['hospital', 'school', 'airport', 'market'], answer: 0, answerThai: 'โรงพยาบาล', hint: 'doctor = แพทย์' },
      { id: 'jf2', sentence: 'A pilot works at an ___.', options: ['airport', 'hospital', 'library', 'market'], answer: 0, answerThai: 'สนามบิน', hint: 'pilot = นักบิน' },
      { id: 'jf3', sentence: 'A teacher works in a ___.', options: ['school', 'hospital', 'restaurant', 'bank'], answer: 0, answerThai: 'โรงเรียน', hint: 'teacher = ครู' },
      { id: 'jf4', sentence: 'A chef works in a ___.', options: ['restaurant', 'school', 'hospital', 'airport'], answer: 0, answerThai: 'ร้านอาหาร', hint: 'chef = เชฟ' },
      { id: 'jf5', sentence: 'A ___ takes care of sick people.', options: ['doctor', 'pilot', 'teacher', 'chef'], answer: 0, answerThai: 'แพทย์', hint: 'sick people = คนป่วย' },
      { id: 'jf6', sentence: 'A ___ flies an airplane.', options: ['pilot', 'driver', 'sailor', 'chef'], answer: 0, answerThai: 'นักบิน', hint: 'airplane = เครื่องบิน' },
    ],
  },
];

// ── Chapter 2, Quest 10: Food Festival ────────────────────────
export const foodMissions = [
  {
    id: 'food_match',
    questId: 'food',
    type: 'matching',
    title: '🍜 Food Match',
    subtitle: 'จับคู่อาหารไทย/สากล',
    xpReward: 30,
    // จากเฉลยครู: Thai Food + Western Food
    pairs: [
      { id: 'fm1', left: 'ข้าวผัด', right: 'Fried rice 🍳', leftThai: '' },
      { id: 'fm2', left: 'ส้มตำ', right: 'Papaya salad 🥗', leftThai: '' },
      { id: 'fm3', left: 'ต้มยำกุ้ง', right: 'Tom Yum Kung 🍲', leftThai: '' },
      { id: 'fm4', left: 'พิซซ่า', right: 'Pizza 🍕', leftThai: '' },
      { id: 'fm5', left: 'แฮมเบอร์เกอร์', right: 'Hamburger 🍔', leftThai: '' },
      { id: 'fm6', left: 'สปาเก็ตตี้', right: 'Spaghetti 🍝', leftThai: '' },
      { id: 'fm7', left: 'แพนเค้ก', right: 'Pancake 🥞', leftThai: '' },
      { id: 'fm8', left: 'ซุปไก่', right: 'Chicken soup 🍜', leftThai: '' },
    ],
  },
  {
    id: 'food_order',
    questId: 'food',
    type: 'rearrange',
    title: '🥪 Recipe Order',
    subtitle: 'เรียงขั้นตอนการทำแซนด์วิช',
    xpReward: 40,
    description: 'จากเฉลยครู: How to make a sandwich',
    techniqueHint: 'First → Then → Next → Finally (ลำดับเหตุการณ์)',
    // จากเฉลยครู: How to make a sandwich
    sentences: [
      {
        id: 'fo1',
        title: '🥪 How to Make a Sandwich',
        steps: [
          { id: 'step1', text: 'First, put a piece of bread on the table.' },
          { id: 'step2', text: 'Then, put a slice of cheese on it.' },
          { id: 'step3', text: 'Next, put ham and lettuce on the cheese.' },
          { id: 'step4', text: 'After that, put another piece of bread on top.' },
          { id: 'step5', text: 'Finally, cut the sandwich in half.' },
        ],
        correctOrder: ['step1', 'step2', 'step3', 'step4', 'step5'],
      },
    ],
    // Word-level rearrange เพิ่มเติม
    wordSentences: [
      { id: 'fw1', words: ['She', 'eats', 'rice', 'every', 'day.'], correct: 'She eats rice every day.' },
      { id: 'fw2', words: ['Do', 'you', 'like', 'pizza', 'or', 'hamburger?'], correct: 'Do you like pizza or hamburger?' },
      { id: 'fw3', words: ['Tom', 'ordered', 'spaghetti', 'and', 'salad.'], correct: 'Tom ordered spaghetti and salad.' },
    ],
  },
];

// ── Chapter 2, Quest 11: Number Arena ────────────────────────
export const numbersMissions = [
  {
    id: 'numbers_flip',
    questId: 'numbers',
    type: 'flashcard',
    title: '🔢 Ordinal Flash',
    subtitle: 'เรียน Ordinal Numbers ลำดับที่',
    xpReward: 30,
    // จากเฉลยครู: Ordinal Numbers
    cards: [
      { id: 'nf1', front: '1st', frontLabel: 'first', back: 'first', backThai: 'ที่หนึ่ง', hint: '1 → first', image: '/learning/numbers/ordinal-1st-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่หนึ่งถูกเน้นบนเส้นทาง' },
      { id: 'nf2', front: '2nd', frontLabel: 'second', back: 'second', backThai: 'ที่สอง', hint: '2 → second', image: '/learning/numbers/ordinal-2nd-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่สองถูกเน้นบนเส้นทาง' },
      { id: 'nf3', front: '3rd', frontLabel: 'third', back: 'third', backThai: 'ที่สาม', hint: '3 → third', image: '/learning/numbers/ordinal-3rd-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่สามถูกเน้นบนเส้นทาง' },
      { id: 'nf4', front: '4th', frontLabel: 'fourth', back: 'fourth', backThai: 'ที่สี่', hint: '4 → fourth', image: '/learning/numbers/ordinal-4th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่สี่ถูกเน้นบนเส้นทาง' },
      { id: 'nf5', front: '5th', frontLabel: 'fifth', back: 'fifth', backThai: 'ที่ห้า', hint: 'five → fifth', image: '/learning/numbers/ordinal-5th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่ห้าถูกเน้นบนเส้นทาง' },
      { id: 'nf6', front: '6th', frontLabel: 'sixth', back: 'sixth', backThai: 'ที่หก', hint: '6 → sixth', image: '/learning/numbers/ordinal-6th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่หกถูกเน้นบนเส้นทาง' },
      { id: 'nf7', front: '7th', frontLabel: 'seventh', back: 'seventh', backThai: 'ที่เจ็ด', hint: '7 → seventh', image: '/learning/numbers/ordinal-7th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่เจ็ดถูกเน้นบนเส้นทาง' },
      { id: 'nf8', front: '8th', frontLabel: 'eighth', back: 'eighth', backThai: 'ที่แปด', hint: 'eight → eighth', image: '/learning/numbers/ordinal-8th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่แปดถูกเน้นบนเส้นทาง' },
      { id: 'nf9', front: '9th', frontLabel: 'ninth', back: 'ninth', backThai: 'ที่เก้า', hint: 'nine → ninth', image: '/learning/numbers/ordinal-9th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่เก้าถูกเน้นบนเส้นทาง' },
      { id: 'nf10', front: '10th', frontLabel: 'tenth', back: 'tenth', backThai: 'ที่สิบ', hint: '10 → tenth', image: '/learning/numbers/ordinal-10th-v1.svg', imageAlt: 'ผู้เข้าแข่งขันลำดับที่สิบถูกเน้นบนเส้นทาง' },
    ],
  },
  {
    id: 'numbers_price',
    questId: 'numbers',
    type: 'fill_blank',
    title: '💰 Price Decode',
    subtitle: 'อ่านราคาเป็นตัวเลข',
    xpReward: 30,
    questions: [
      { id: 'np1', sentence: '"one hundred and fifty baht" = ___ บาท', options: ['150', '105', '115', '1050'], answer: 0, answerThai: '150 บาท', hint: 'one hundred (100) + fifty (50)' },
      { id: 'np2', sentence: '"seventy-five baht" = ___ บาท', options: ['75', '57', '65', '85'], answer: 0, answerThai: '75 บาท', hint: 'seventy (70) + five (5)' },
      { id: 'np3', sentence: '"two hundred and twenty baht" = ___ บาท', options: ['220', '202', '212', '2020'], answer: 0, answerThai: '220 บาท', hint: 'two hundred (200) + twenty (20)' },
      { id: 'np4', sentence: '"three hundred baht" = ___ บาท', options: ['300', '30', '3000', '330'], answer: 0, answerThai: '300 บาท', hint: 'three hundred = 300' },
      { id: 'np5', sentence: '"half past two" คือเวลา ___', options: ['2:30', '2:15', '2:45', '1:30'], answer: 0, answerThai: '2:30 น.', hint: 'half past = ครึ่งชั่วโมงหลัง' },
      { id: 'np6', sentence: '"a quarter to three" คือเวลา ___', options: ['2:45', '3:15', '3:45', '2:15'], answer: 0, answerThai: '2:45 น.', hint: 'quarter to = ก่อน 15 นาที' },
    ],
  },
];

export const CH2_MISSIONS = {
  illness: illnessMissions,
  jobs: jobsMissions,
  food: foodMissions,
  numbers: numbersMissions,
};

export function getMissionsForQuest(questId) {
  return CH2_MISSIONS[questId] || [];
}
