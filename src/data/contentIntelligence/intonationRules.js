/**
 * O-NET ADVENTURE — CONTENT INTELLIGENCE LAYER
 * Module: Intonation Rules & Intonation Detective Practice
 * 
 * Standard: ต 2.2 ป.6/1 (การออกเสียงประโยคชนิดต่างๆ และระดับเสียงท้ายประโยค)
 * Verified against O-NET historical items 2561-2567 (Item 244-250).
 */

export const INTONATION_CATEGORIES = Object.freeze({
  RISING: 'rising',
  FALLING: 'falling',
  CHOICE_OR: 'choice_or'
});

export const INTONATION_RULES = Object.freeze([
  {
    id: 'rule_yes_no_rising',
    category: INTONATION_CATEGORIES.RISING,
    title: 'Yes / No Questions — เสียงสูงท้ายประโยค (Rising ↗)',
    description: 'ประโยคคำถามที่ขึ้นต้นด้วยกริยาช่วย (Auxiliary / Modal Verbs) และต้องการคำตอบว่า ใช่ หรือ ไม่ใช่',
    leadWords: ['Is', 'Am', 'Are', 'Was', 'Were', 'Do', 'Does', 'Did', 'Can', 'Could', 'May', 'Will', 'Would', 'Should', 'Have', 'Has'],
    pitchPattern: 'ท้ายประโยคจะปรับระดับเสียงสูงขึ้น ↗ เพื่อแสดงการถามหาการยืนยัน',
    ruleSummary: 'ขึ้นต้นด้วยกริยาช่วย (Do, Can, Is...) ➜ เสียงสูงท้ายประโยค ↗',
    examples: [
      { text: 'Can you speak English?', phoneticHint: 'English? ↗', thai: 'คุณพูดภาษาอังกฤษได้ไหม?' },
      { text: 'Do you have a ruler?', phoneticHint: 'ruler? ↗', thai: 'คุณมีไม้บรรทัดไหม?' },
      { text: 'Is your mother a doctor?', phoneticHint: 'doctor? ↗', thai: 'คุณแม่ของคุณเป็นหมอใช่ไหม?' },
      { text: 'May I borrow your eraser?', phoneticHint: 'eraser? ↗', thai: 'ฉันขอยืมยางลบของคุณได้ไหม?' }
    ]
  },
  {
    id: 'rule_wh_falling',
    category: INTONATION_CATEGORIES.FALLING,
    title: 'Wh-Questions — เสียงต่ำท้ายประโยค (Falling ↘)',
    description: 'ประโยคคำถามที่ขึ้นต้นด้วยคำแสดงคำถาม (Wh-Question Words) และต้องการข้อมูลเฉพาะเจาะจง',
    leadWords: ['What', 'Where', 'When', 'Why', 'Who', 'Whose', 'Whom', 'Which', 'How'],
    pitchPattern: 'ท้ายประโยคจะปรับระดับเสียงลดต่ำลง ↘ เมื่อจบประโยค',
    ruleSummary: 'ขึ้นต้นด้วย Wh- (What, Where, When, How...) ➜ เสียงต่ำท้ายประโยค ↘',
    examples: [
      { text: 'What is your favourite subject?', phoneticHint: 'subject. ↘', thai: 'วิชาที่คุณชอบที่สุดคืออะไร?' },
      { text: 'Where does the teacher live?', phoneticHint: 'live. ↘', thai: 'คุณครูอาศัยอยู่ที่ไหน?' },
      { text: 'When does the library open?', phoneticHint: 'open. ↘', thai: 'ห้องสมุดเปิดเวลาใด?' },
      { text: 'How do you go to school?', phoneticHint: 'school. ↘', thai: 'คุณไปโรงเรียนอย่างไร?' }
    ]
  },
  {
    id: 'rule_choice_or',
    category: INTONATION_CATEGORIES.CHOICE_OR,
    title: 'Choice Questions — เสียงขึ้นแล้วลง (Rising then Falling ↗ ↘)',
    description: 'คำถามที่มีตัวเลือกเชื่อมด้วย "or" เช่น ต้องการสิ่งนี้หรือสิ่งนั้น',
    leadWords: ['Do you want ... or ...', 'Would you like ... or ...'],
    pitchPattern: 'ตัวเลือกแรกเสียงสูง ↗ และตัวเลือกหลังเสียงลดต่ำลง ↘',
    ruleSummary: 'ประโยคถามให้เลือก (มี or) ➜ ตัวเลือกแรกขึ้น ↗ ตัวเลือกหลังลง ↘',
    examples: [
      { text: 'Would you like milk or orange juice?', phoneticHint: 'milk ↗ or orange juice ↘', thai: 'คุณรับนมหรือน้ำส้มดีครับ?' },
      { text: 'Do you go by bus or by train?', phoneticHint: 'bus ↗ or train ↘', thai: 'คุณไปโดยรถบัสหรือรถไฟ?' }
    ]
  }
]);

/**
 * Predicts the expected intonation category of an English sentence based on structural clues
 * @param {string} sentence
 * @returns {{ pattern: string, direction: string, reason: string }}
 */
export function analyzeIntonation(sentence = '') {
  const clean = sentence.trim();
  if (!clean) return { pattern: 'unknown', direction: 'neutral', reason: 'Empty sentence' };

  const firstWord = clean.split(/\s+/)[0].replace(/[^a-zA-Z]/g, '');
  const lowerFirst = firstWord.toLowerCase();
  const hasOr = /\bor\b/i.test(clean);

  if (hasOr && clean.endsWith('?')) {
    return {
      pattern: INTONATION_CATEGORIES.CHOICE_OR,
      direction: '↗ then ↘',
      reason: 'Choice Question (มีคำว่า or ให้เลือก) เสียงตัวเลือกแรกจะสูง และตัวเลือกหลังจะลดต่ำลง'
    };
  }

  const whWords = ['what', 'where', 'when', 'why', 'who', 'whose', 'whom', 'which', 'how'];
  if (whWords.includes(lowerFirst)) {
    return {
      pattern: INTONATION_CATEGORIES.FALLING,
      direction: 'เสียงต่ำ ↘ (Falling)',
      reason: `ขึ้นต้นด้วย Wh-Question (${firstWord}) ต้องการข้อมูล ท้ายประโยคจึงใช้ระดับเสียงต่ำลง`
    };
  }

  const auxiliaryVerbs = [
    'is', 'am', 'are', 'was', 'were',
    'do', 'does', 'did',
    'can', 'could', 'may', 'might',
    'will', 'would', 'shall', 'should',
    'have', 'has', 'had'
  ];
  if (auxiliaryVerbs.includes(lowerFirst)) {
    return {
      pattern: INTONATION_CATEGORIES.RISING,
      direction: 'เสียงสูง ↗ (Rising)',
      reason: `ขึ้นต้นด้วยกริยาช่วย (${firstWord}) เป็น Yes/No Question ท้ายประโยคจึงยกเสียงสูงขึ้น`
    };
  }

  return {
    pattern: INTONATION_CATEGORIES.FALLING,
    direction: 'เสียงต่ำ ↘ (Falling)',
    reason: 'ประโยคบอกเล่าทั่วไปหรือคำสั่ง มักลงท้ายด้วยเสียงระดับปกติหรือต่ำลง'
  };
}
