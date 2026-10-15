// src/data/chapter3_questions.js

export const questionWordQuestions = [
  {
    id: 'c3_qw_1',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ do you live?\nA: I live in Bangkok.',
    translation: 'ถาม: คุณอาศัยอยู่ที่ไหน?\nตอบ: ฉันอาศัยอยู่ในกรุงเทพฯ',
    vocab: {
      "live": "อาศัยอยู่",
      "Bangkok": "กรุงเทพฯ",
      "you": "คุณ",
      "I": "ฉัน",
      "in": "ใน",
      "do": "(คำกริยาช่วย)"
    },
    options: ['What', 'Where', 'When', 'Who'],
    answer: 1,
    reasonQuestion: 'ทำไมถึงตอบข้อนี้? (หา Keyword จากคำตอบ)',
    reasonChoices: [
      'เพราะคำตอบคือสถานที่ (Bangkok) จึงต้องใช้ Where',
      'เพราะคำตอบบอกเวลา จึงต้องใช้ When',
      'เพราะคำตอบบอกบุคคล จึงต้องใช้ Who',
      'เพราะคำตอบบอกสิ่งของ จึงต้องใช้ What'
    ],
    reasonAnswer: 0,
    feedback: {
      bothCorrect: 'เก่งมาก! ตอบถูกและให้เหตุผลชัดเจน Keyword คือ "Bangkok" (สถานที่)',
      mainRightReasonWrong: 'ตอบ Where ถูกแล้ว แต่เหตุผลยังไม่ใช่นะ สังเกตคำว่า Bangkok คือชื่อสถานที่',
      mainWrongReasonRight: 'เหตุผลวิเคราะห์มาถูกทางแล้ว! แต่เลือก Question Word ผิดไปนิด',
      bothWrong: 'ลองสังเกตคำตอบ "Bangkok" ดูนะว่าคืออะไร (สถานที่, เวลา, หรือคน)'
    },
    reasonLanguage: 'thai',
    keyword: 'Bangkok = สถานที่ (Where)'
  },
  {
    id: 'c3_qw_2',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ students are there in the room?\nA: There are 25 students.',
    translation: 'ถาม: มีนักเรียนอยู่ในห้องจำนวนเท่าไหร่?\nตอบ: มีนักเรียน 25 คน',
    vocab: {
      "students": "นักเรียน (หลายคน)",
      "in the room": "ในห้อง",
      "are there": "มี",
      "are": "เป็น/อยู่/คือ",
      "in": "ใน"
    },
    options: ['How much', 'How many', 'How old', 'How long'],
    answer: 1,
    reasonQuestion: 'ทำไมถึงใช้คำถามนี้?',
    reasonChoices: [
      'เพราะเป็นการถามอายุ (25)',
      'เพราะเป็นการถามระยะเวลา',
      'เพราะเป็นการถามจำนวนนับได้ (students)',
      'เพราะเป็นการถามราคาหรือจำนวนนับไม่ได้'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'ยอดเยี่ยม! students เป็นนามนับได้พหูพจน์ ต้องใช้ How many',
      mainRightReasonWrong: 'ตอบ How many ถูกแล้ว! แต่ต้องจำไว้ว่าใช้กับ "นามนับได้พหูพจน์" นะ',
      mainWrongReasonRight: 'เข้าใจเหตุผลแล้ว เยี่ยมมาก! แต่อย่าลืมเลือกคำศัพท์ให้ตรงกับเหตุผลด้วย',
      bothWrong: 'ดูที่คำว่า "students" (นักเรียนหลายคน) เป็นจำนวนที่นับได้นะ'
    },
    reasonLanguage: 'thai',
    keyword: 'students = จำนวนนับได้ (How many)'
  },
  {
    id: 'c3_qw_3',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ is your birthday?\nA: It is on October 15th.',
    translation: 'ถาม: วันเกิดของคุณคือเมื่อไหร่?\nตอบ: วันเกิดของฉันคือวันที่ 15 ตุลาคม',
    vocab: {
      "birthday": "วันเกิด",
      "October": "ตุลาคม",
      "is": "คือ",
      "your": "ของคุณ",
      "It is": "มันคือ",
      "on": "ใน (ใช้กับวัน/วันที่)"
    },
    options: ['Where', 'What time', 'When', 'How'],
    answer: 2,
    reasonQuestion: 'Keyword ใดในคำตอบที่ช่วยให้เราเลือกคำถามนี้?',
    reasonChoices: [
      'It is (ประธานและกริยา)',
      'birthday (วันเกิด)',
      'on October 15th (บอกช่วงเวลา/วันที่)',
      'your (สรรพนามแสดงความเป็นเจ้าของ)'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'ถูกต้องเป๊ะ! เมื่อคำตอบบอกวันที่หรือเวลา คำถามต้องใช้ When (เมื่อไหร่)',
      mainRightReasonWrong: 'คำตอบหลักถูกแล้ว แต่ Keyword สำคัญที่บ่งบอกว่าต้องใช้ When คือ October 15th นะ',
      mainWrongReasonRight: 'หา Keyword เจอแล้ว! แต่ต้องจับคู่กับคำถามที่แปลว่า "เมื่อไหร่" (When) นะ',
      bothWrong: 'October 15th คือ "วันที่" ดังนั้นคำถามต้องถามหาเวลา (เมื่อไหร่)'
    },
    reasonLanguage: 'thai',
    keyword: 'October 15th = วันที่ (When)'
  },
  {
    id: 'c3_qw_4',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ does this book cost?\nA: It is 150 baht.',
    translation: 'ถาม: หนังสือเล่มนี้ราคาเท่าไหร่?\nตอบ: ราคา 150 บาท',
    vocab: {
      "book": "หนังสือ",
      "cost": "มีราคา",
      "this": "นี้",
      "It is": "มันคือ",
      "does": "(คำกริยาช่วย)"
    },
    options: ['How many', 'How much', 'How long', 'How far'],
    answer: 1,
    reasonQuestion: 'ทำไมต้องเลือกข้อนี้?',
    reasonChoices: [
      'เพราะถามเกี่ยวกับระยะทาง (How far)',
      'เพราะคำตอบบอก "ราคา" เป็นเงิน (baht) จึงต้องใช้ How much',
      'เพราะถามเกี่ยวกับจำนวนชิ้น (How many)',
      'เพราะถามเกี่ยวกับความยาว (How long)'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'สุดยอด! การถามราคาสินค้า เราใช้ How much เสมอ',
      mainRightReasonWrong: 'เลือก How much ถูกแล้ว! จำไว้ว่าใช้ถามราคา (ราคาเป็นสิ่งที่นับไม่ได้)',
      mainWrongReasonRight: 'เข้าใจถูกว่าต้องถามราคา แต่คำว่า "ราคาเท่าไหร่" คือ How much นะ',
      bothWrong: 'สังเกตคำว่า "150 baht" เป็นการบอกราคาสินค้าครับ'
    },
    reasonLanguage: 'thai',
    keyword: '150 baht = ราคา (How much)'
  },
  {
    id: 'c3_qw_5',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ one do you prefer, the red shirt or the blue shirt?\nA: The red one, please.',
    translation: 'ถาม: คุณชอบเสื้อตัวไหนมากกว่ากัน ระหว่างเสื้อสีแดงหรือเสื้อสีน้ำเงิน?\nตอบ: ขอเสื้อสีแดงครับ/ค่ะ',
    vocab: {
      "prefer": "ชอบมากกว่า",
      "one": "อัน/ตัว (ใช้แทนสิ่งที่อ้างถึงไปแล้ว)",
      "red shirt": "เสื้อสีแดง",
      "blue shirt": "เสื้อสีน้ำเงิน",
      "you": "คุณ",
      "or": "หรือ",
      "do": "(คำกริยาช่วย)"
    },
    options: ['What', 'Why', 'Which', 'Who'],
    answer: 2,
    reasonQuestion: 'Why is "Which" the correct answer?',
    reasonChoices: [
      'Because it asks for a reason (ทำไม).',
      'Because it asks about a person (ใคร).',
      'Because it gives options to choose from (มีตัวเลือกให้ตัดสินใจ).',
      'Because it asks for general information (ถามข้อมูลทั่วไป).'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'Perfect! "Which" is used when there is a choice (red or blue).',
      mainRightReasonWrong: 'You got the word right! But remember, "Which" is for choices.',
      mainWrongReasonRight: 'You know the reason! Just remember "Which" = อันไหน (ให้เลือก)',
      bothWrong: 'Notice the choices "red shirt OR blue shirt". We use "Which" when choosing.'
    },
    reasonLanguage: 'mixed',
    keyword: 'or (ให้เลือก) = Which'
  },
  {
    id: 'c3_qw_6',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ is that man standing there?\nA: He is my uncle.',
    translation: 'ถาม: ผู้ชายที่ยืนอยู่ตรงนั้นคือใคร?\nตอบ: เขาคือลุงของฉันเอง',
    vocab: {
      "man": "ผู้ชาย",
      "standing": "กำลังยืน",
      "uncle": "ลุง/อา/น้า (ผู้ชาย)",
      "is": "คือ",
      "that": "นั้น",
      "there": "ที่นั่น",
      "He is": "เขาคือ",
      "my": "ของฉัน"
    },
    options: ['Whose', 'Who', 'What', 'Where'],
    answer: 1,
    reasonQuestion: 'อะไรคือ Keyword หลักในคำตอบ?',
    reasonChoices: [
      'my uncle (บอกถึงตัวบุคคล)',
      'standing (บอกการกระทำ)',
      'He is (ประธานและกริยา)',
      'there (บอกสถานที่)'
    ],
    reasonAnswer: 0,
    feedback: {
      bothCorrect: 'ถูกทั้งคู่! my uncle (ลุง) คือ "คน" จึงต้องถามด้วย Who (ใคร)',
      mainRightReasonWrong: 'ตอบ Who ถูกแล้ว แต่คำที่ช่วยให้เรารู้คือคำว่า "my uncle" นะ',
      mainWrongReasonRight: 'หา Keyword ถูกแล้ว! พอรู้ว่าเป็น "คน" คำถามต้องเป็น Who เสมอ',
      bothWrong: 'ลองดูคำตอบ "He is my uncle" (เขาคือลุงของฉัน) เป็นการบอกถึงตัวบุคคลนะ'
    },
    reasonLanguage: 'thai',
    keyword: 'my uncle = บุคคล (Who)'
  },
  {
    id: 'c3_qw_7',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ car is this?\nA: It is Peter\'s car.',
    translation: 'ถาม: รถคันนี้เป็นของใคร?\nตอบ: มันคือรถของปีเตอร์',
    vocab: {
      "car": "รถยนต์",
      "Peter's": "ของปีเตอร์",
      "It is": "มันคือ",
      "is": "คือ",
      "this": "นี้"
    },
    options: ['Who', 'Whom', 'Whose', 'Which'],
    answer: 2,
    reasonQuestion: 'Why do we use "Whose"?',
    reasonChoices: [
      'Because it asks "Who did it?" (ใครทำ).',
      'Because the answer shows ownership (การแสดงความเป็นเจ้าของ).',
      'Because it asks about a specific object.',
      'Because it asks about a place.'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'Excellent! "Peter\'s" shows ownership, so we ask "Whose" (ของใคร).',
      mainRightReasonWrong: 'You picked Whose correctly! Remember it asks for the owner.',
      mainWrongReasonRight: 'You understood the ownership part! "Whose" means "ของใคร".',
      bothWrong: 'The answer has "Peter\'s" (ของปีเตอร์) which shows ownership.'
    },
    reasonLanguage: 'mixed',
    keyword: 'Peter\'s = เจ้าของ (Whose)'
  },
  {
    id: 'c3_qw_8',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ do you go to school?\nA: I go to school by bus.',
    translation: 'ถาม: คุณไปโรงเรียนอย่างไร?\nตอบ: ฉันไปโรงเรียนโดยรถบัส',
    vocab: {
      "school": "โรงเรียน",
      "by bus": "โดยรถโดยสารประจำทาง",
      "you": "คุณ",
      "to": "ถึง/ไปยัง",
      "I": "ฉัน",
      "go": "ไป",
      "do": "(คำกริยาช่วย)"
    },
    options: ['When', 'Where', 'Why', 'How'],
    answer: 3,
    reasonQuestion: 'ทำไมถึงเลือกคำถามนี้?',
    reasonChoices: [
      'เพราะคำตอบบอกเหตุผล (Why)',
      'เพราะคำตอบบอกสถานที่ (Where)',
      'เพราะคำตอบบอกวิธีการหรือยานพาหนะ (by bus)',
      'เพราะคำตอบบอกเวลา (When)'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'ถูกต้องเก่งมาก! "by bus" คือวิธีการเดินทาง จึงต้องถามว่าไป "อย่างไร" (How)',
      mainRightReasonWrong: 'ตอบ How ถูกแล้ว! แต่จุดสังเกตคือคำว่า "by bus" นะ',
      mainWrongReasonRight: 'วิเคราะห์เหตุผลถูกแล้วครับ! แต่แปลคำว่า "อย่างไร" ผิดไปนิดนึง',
      bothWrong: 'คำตอบคือ "by bus" (โดยรถบัส) เป็นการบอกวิธีการเดินทาง ต้องใช้ How (อย่างไร)'
    },
    reasonLanguage: 'thai',
    keyword: 'by bus = วิธีการ (How)'
  },
  {
    id: 'c3_qw_9',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ are you crying?\nA: Because I lost my wallet.',
    translation: 'ถาม: ทำไมคุณถึงร้องไห้?\nตอบ: เพราะฉันทำกระเป๋าตังค์หาย',
    vocab: {
      "crying": "กำลังร้องไห้",
      "Because": "เพราะว่า",
      "lost": "ทำหาย",
      "wallet": "กระเป๋าสตางค์",
      "are you": "คุณกำลัง",
      "I": "ฉัน"
    },
    options: ['Why', 'What', 'Who', 'How'],
    answer: 0,
    reasonQuestion: 'Which word is the key to choosing "Why"?',
    reasonChoices: [
      'wallet',
      'crying',
      'lost',
      'Because'
    ],
    reasonAnswer: 3,
    feedback: {
      bothCorrect: 'Brilliant! "Because" always answers a "Why" question.',
      mainRightReasonWrong: 'You got "Why", but the key word that links to Why is "Because".',
      mainWrongReasonRight: 'You found the keyword "Because"! It always matches with "Why".',
      bothWrong: 'Look at the word "Because" (เพราะว่า). It gives a reason, so the question must be "Why" (ทำไม).'
    },
    reasonLanguage: 'mixed',
    keyword: 'Because = เหตุผล (Why)'
  },
  {
    id: 'c3_qw_10',
    quest: 'question_words',
    type: 'two_step',
    question: 'Q: _____ long does it take to get to Chiang Mai?\nA: It takes about 10 hours.',
    translation: 'ถาม: ใช้เวลานานแค่ไหนในการเดินทางไปเชียงใหม่?\nตอบ: ใช้เวลาประมาณ 10 ชั่วโมง',
    vocab: {
      "take": "ใช้เวลา",
      "get to": "ไปถึง",
      "about": "ประมาณ",
      "hours": "ชั่วโมง",
      "it": "มัน",
      "to": "เพื่อ/ไปยัง",
      "does": "(คำกริยาช่วย)"
    },
    options: ['What', 'Where', 'How', 'When'],
    answer: 2,
    reasonQuestion: 'ทำไมถึงเติมคำนี้?',
    reasonChoices: [
      'ต้องการถามว่าไปที่ไหน (Where)',
      'ต้องการคำว่า "How long" เพื่อถามระยะเวลา (10 hours)',
      'ต้องการคำว่า "What long" เพื่อถามความยาว',
      'ต้องการถามว่าเมื่อไหร่ (When)'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'เฉียบขาด! คำตอบ "10 hours" คือระยะเวลา จึงต้องใช้ How long',
      mainRightReasonWrong: 'เติม How ถูกแล้ว! ประโยคนี้คือ How long (นานเท่าไหร่) เพราะคำตอบเป็นระยะเวลา',
      mainWrongReasonRight: 'รู้ว่าต้องถามระยะเวลา แต่ลืมไปว่า "นานเท่าไหร่" ใช้คู่กับ How (How long)',
      bothWrong: 'คำตอบคือ 10 ชั่วโมง (ระยะเวลา) ดังนั้นต้องถามว่านานเท่าไหร่ (How long)'
    },
    reasonLanguage: 'thai',
    keyword: '10 hours = ระยะเวลา (How long)'
  }
];

export const signDetectiveQuestions = [
  {
    id: 'c3_sd_1',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Look at the sign: [ NO SMOKING ]\nWhat does this sign mean?',
    translation: 'ดูที่ป้าย: [ ห้ามสูบบุหรี่ ]\nป้ายนี้มีความหมายว่าอย่างไร?\nA. คุณสามารถสูบบุหรี่ที่นี่ได้\nB. คุณไม่ได้รับอนุญาตให้สูบบุหรี่ที่นี่\nC. คุณต้องซื้อบุหรี่ที่นี่\nD. คุณควรไปสูบบุหรี่ข้างนอก',
    vocab: {
      "NO SMOKING": "ห้ามสูบบุหรี่",
      "mean": "หมายความว่า",
      "can": "สามารถ (กริยาช่วย)",
      "allowed to": "ได้รับอนุญาตให้",
      "must": "ต้อง (กริยาช่วย)",
      "should": "ควรจะ (กริยาช่วย)",
      "you": "คุณ",
      "here": "ที่นี่",
      "this": "นี้"
    },
    options: [
      'You can smoke here.',
      'You are not allowed to smoke here.',
      'You must buy cigarettes here.',
      'You should smoke outside.'
    ],
    answer: 1,
    reasonQuestion: 'อะไรคือความหมายของคำว่า "NO" ในป้ายนี้?',
    reasonChoices: [
      'หมายถึงคำแนะนำ (should)',
      'หมายถึงข้อห้ามเด็ดขาด (not allowed to)',
      'หมายถึงสิ่งที่ทำได้ (can)',
      'หมายถึงสิ่งที่ต้องทำ (must)'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'ถูกต้อง! NO แปลว่าห้ามเด็ดขาด ซึ่งตรงกับคำว่า not allowed to',
      mainRightReasonWrong: 'ตอบถูกแล้ว แต่ต้องเข้าใจว่า NO = not allowed to (ไม่อนุญาต/ห้าม)',
      mainWrongReasonRight: 'เข้าใจความหมายของข้อห้ามแล้ว! แค่ไปเลือกคำตอบหลักให้ตรงกันนะ',
      bothWrong: 'ป้าย NO SMOKING คือ "ห้ามสูบบุหรี่" ซึ่งหมายความว่าไม่อนุญาต (not allowed)'
    },
    reasonLanguage: 'thai',
    keyword: 'NO = not allowed to (ห้าม)'
  },
  {
    id: 'c3_sd_2',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Look at the sign: [ KEEP OFF THE GRASS ]\nWhat should you do?',
    translation: 'ดูที่ป้าย: [ ห้ามลัดสนามหญ้า ]\nคุณควรทำอย่างไร?',
    vocab: {
      "KEEP OFF": "อยู่ให้ห่าง/ห้ามเหยียบ",
      "GRASS": "หญ้า",
      "should": "ควรจะ (กริยาช่วย)",
      "you": "คุณ",
      "can": "สามารถ (กริยาช่วย)",
      "must": "ต้อง (กริยาช่วย)",
      "have to": "ต้อง"
    },
    options: [
      'You can sit on the grass.',
      'You should water the grass.',
      'You must not walk on the grass.',
      'You have to cut the grass.'
    ],
    answer: 2,
    reasonQuestion: 'Keyword ใดในตัวเลือกที่ตรงกับความหมายของ "KEEP OFF"?',
    reasonChoices: [
      'sit on (นั่งบน)',
      'water (รดน้ำ)',
      'must not walk on (ห้ามเดินเหยียบ)',
      'cut (ตัด)'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'สุดยอด! KEEP OFF = อยู่ให้ห่าง/ห้ามเหยียบ ตรงกับ must not walk on',
      mainRightReasonWrong: 'ตอบถูกครับ! KEEP OFF แปลว่า ห้ามเข้าไปเหยียบหรือเดินบนนั้นนะ',
      mainWrongReasonRight: 'จับคู่คำศัพท์ได้แล้ว! Keep off แปลว่าห้ามเดินเหยียบครับ',
      bothWrong: 'Keep off the grass หมายถึง "ห้ามเดินลัดสนามหญ้า / ห้ามเหยียบหญ้า"'
    },
    reasonLanguage: 'thai_mixed',
    keyword: 'keep off = must not walk on'
  },
  {
    id: 'c3_sd_3',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Look at the sign: [ PLEASE QUEUE HERE ]\nWhere can you see this sign?',
    translation: 'ดูที่ป้าย: [ กรุณาเข้าแถวตรงนี้ ]\nคุณจะเห็นป้ายนี้ได้ที่ไหน?',
    vocab: {
      "QUEUE": "เข้าแถว",
      "HERE": "ที่นี่",
      "Where": "ที่ไหน",
      "can": "สามารถ (กริยาช่วย)",
      "you": "คุณ",
      "see": "เห็น",
      "this": "นี้"
    },
    options: [
      'In a bedroom.',
      'At a bus stop or a bank.',
      'In a forest.',
      'In a swimming pool.'
    ],
    answer: 1,
    reasonQuestion: 'What is the main clue to finding the correct place?',
    reasonChoices: [
      'You queue when you are sleeping.',
      'You queue (line up) when you wait for a service, like a bus or a bank.',
      'You queue to look at trees.',
      'You queue when you are swimming.'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'Perfect! "Queue" means to line up, which you do at a bank or bus stop.',
      mainRightReasonWrong: 'You chose the right place! The reason is because you have to wait in line there.',
      mainWrongReasonRight: 'You know what queue means! Just select the place where people line up.',
      bothWrong: 'Queue แปลว่า "เข้าแถว" สถานที่ที่ต้องเข้าแถวคือป้ายรถเมล์หรือธนาคาร'
    },
    reasonLanguage: 'simple_english',
    keyword: 'queue = wait in line (เข้าแถว)'
  },
  {
    id: 'c3_sd_4',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Look at the sign: [ BEWARE OF DOG ]\nWhat does this sign tell you?',
    translation: 'ดูที่ป้าย: [ ระวังสุนัขดุ ]\nป้ายนี้บอกอะไรแก่คุณ?',
    vocab: {
      "BEWARE OF": "ระวัง",
      "DOG": "สุนัข",
      "does": "(คำกริยาช่วย)",
      "this": "นี้",
      "tell": "บอก",
      "you": "คุณ",
      "can": "สามารถ (กริยาช่วย)",
      "should": "ควรจะ (กริยาช่วย)",
      "must": "ต้อง (กริยาช่วย)",
      "be careful": "ระมัดระวัง"
    },
    options: [
      'You can play with the dog.',
      'You should feed the dog.',
      'You must be careful because there is a dog.',
      'You must buy a dog here.'
    ],
    answer: 2,
    reasonQuestion: 'คำว่า "BEWARE" มีความหมายตรงกับคำใดมากที่สุด?',
    reasonChoices: [
      'play (เล่น)',
      'feed (ให้อาหาร)',
      'buy (ซื้อ)',
      'be careful (ระวัง)'
    ],
    reasonAnswer: 3,
    feedback: {
      bothCorrect: 'เก่งมาก! Beware = ระวัง (Be careful) มักใช้กับป้ายเตือนอันตราย',
      mainRightReasonWrong: 'ตอบถูกแล้ว! อย่าลืมจำคำศัพท์ Beware = Be careful ด้วยนะ',
      mainWrongReasonRight: 'รู้คำศัพท์แล้ว เยี่ยมมาก! แต่อย่าลืมเลือกข้อที่มีคำว่า be careful ในคำตอบหลัก',
      bothWrong: 'Beware of dog แปลว่า "ระวังหมาดุ" จึงต้องใช้ความระมัดระวัง (be careful)'
    },
    reasonLanguage: 'thai',
    keyword: 'beware = be careful (ระวัง)'
  },
  {
    id: 'c3_sd_5',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Look at the sign: [ WET FLOOR ]\nWhat might happen if you don\'t see this sign?',
    translation: 'ดูที่ป้าย: [ พื้นเปียก ]\nอาจเกิดอะไรขึ้นถ้าคุณไม่เห็นป้ายนี้?',
    vocab: {
      "WET": "เปียก",
      "FLOOR": "พื้น",
      "might": "อาจจะ (กริยาช่วย)",
      "happen": "เกิดขึ้น",
      "if": "ถ้า",
      "you": "คุณ",
      "don't": "ไม่ได้",
      "see": "เห็น",
      "this": "นี้"
    },
    options: [
      'You might get wet from rain.',
      'You might slip and fall.',
      'You might lose your shoes.',
      'You might find water to drink.'
    ],
    answer: 1,
    reasonQuestion: 'สถานการณ์ใดสอดคล้องกับ "พื้นเปียก" (WET FLOOR) มากที่สุด?',
    reasonChoices: [
      'การลื่นล้ม (slip and fall)',
      'เปียกฝน (rain)',
      'รองเท้าหาย (lose shoes)',
      'หาแหล่งน้ำดื่ม (find water)'
    ],
    reasonAnswer: 0,
    feedback: {
      bothCorrect: 'ยอดเยี่ยม! พื้นเปียก (Wet Floor) เป็นอันตรายที่อาจทำให้ลื่นล้มได้',
      mainRightReasonWrong: 'ตอบถูกแล้ว! พื้นเปียกมักจะทำให้เกิดการ slip (ลื่น)',
      mainWrongReasonRight: 'วิเคราะห์เหตุผลถูกแล้ว! slip = ลื่น, fall = ล้ม',
      bothWrong: 'Wet floor คือพื้นเปียก ซึ่งอาจทำให้เราลื่น (slip) และล้ม (fall) ได้'
    },
    reasonLanguage: 'thai',
    keyword: 'wet floor -> slip and fall (ลื่นล้ม)'
  },
  {
    id: 'c3_sd_6',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Sign: [ DO NOT FEED THE ANIMALS ]\nWhere are you most likely to see this sign?',
    translation: 'ป้าย: [ ห้ามให้อาหารสัตว์ ]\nคุณมีแนวโน้มที่จะเห็นป้ายนี้ที่ไหนมากที่สุด?',
    vocab: {
      "FEED": "ให้อาหาร",
      "ANIMALS": "สัตว์",
      "Where": "ที่ไหน",
      "are": "เป็น/อยู่/คือ",
      "you": "คุณ",
      "most likely": "มีแนวโน้มมากที่สุด",
      "to": "เพื่อ/ไปยัง",
      "see": "เห็น",
      "this": "นี้"
    },
    options: [
      'In a library',
      'In a hospital',
      'At a zoo',
      'At a school'
    ],
    answer: 2,
    reasonQuestion: 'Why is "At a zoo" the best answer?',
    reasonChoices: [
      'Because you read books there.',
      'Because doctors work there.',
      'Because there are many animals there.',
      'Because students study there.'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'Spot on! Zoos have animals, and this sign protects them.',
      mainRightReasonWrong: 'You got the place! The reason is simply that zoos are full of animals.',
      mainWrongReasonRight: 'You found the reason! Now match it with the place (Zoo = สวนสัตว์).',
      bothWrong: 'สัตว์ (Animals) จะมีจำนวนมากในสวนสัตว์ (Zoo) จึงต้องมีป้ายห้ามให้อาหารสัตว์'
    },
    reasonLanguage: 'simple_english',
    keyword: 'animals -> zoo'
  },
  {
    id: 'c3_sd_7',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Sign: [ STAFF ONLY ]\nWhat does it mean?',
    translation: 'ป้าย: [ เฉพาะพนักงานเท่านั้น ]\nมันมีความหมายว่าอย่างไร?',
    vocab: {
      "STAFF": "พนักงาน/เจ้าหน้าที่",
      "ONLY": "เท่านั้น",
      "does": "(คำกริยาช่วย)",
      "it": "มัน",
      "mean": "มีความหมายว่า",
      "Everyone": "ทุกคน",
      "can": "สามารถ (กริยาช่วย)",
      "enter": "เข้าไป"
    },
    options: [
      'Everyone can enter.',
      'Only employees can enter this area.',
      'You can buy staffs here.',
      'It is an exit door.'
    ],
    answer: 1,
    reasonQuestion: 'คำว่า "STAFF" ในบริบทของป้ายนี้หมายถึงใคร?',
    reasonChoices: [
      'ทุกคน (Everyone)',
      'พนักงาน/เจ้าหน้าที่ (Employees)',
      'ลูกค้า (Customers)',
      'นักเรียน (Students)'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'ถูกต้องครับ! Staff = Employee (พนักงาน/เจ้าหน้าที่) หมายถึงห้ามบุคคลภายนอกเข้า',
      mainRightReasonWrong: 'คำตอบหลักถูกแล้ว จำไว้ว่าคำว่า Staff แปลว่า Employee นะครับ',
      mainWrongReasonRight: 'รู้คำแปลแล้ว แต่อย่าลืมเลือกคำตอบหลักให้ถูกต้องด้วยนะ',
      bothWrong: 'Staff = เจ้าหน้าที่/พนักงาน (Employee) ป้ายนี้แปลว่า "เฉพาะเจ้าหน้าที่เท่านั้น"'
    },
    reasonLanguage: 'thai',
    keyword: 'staff = employee (พนักงาน)'
  },
  {
    id: 'c3_sd_8',
    quest: 'sign_detective',
    type: 'two_step',
    question: 'Sign: [ OUT OF ORDER ] on a toilet door.\nWhat should you do?',
    translation: 'ป้าย: [ ชำรุด/ใช้การไม่ได้ ] บนประตูห้องน้ำ\nคุณควรทำอย่างไร?',
    vocab: {
      "OUT OF ORDER": "ชำรุด/ใช้การไม่ได้",
      "on": "บน",
      "a": "หนึ่ง",
      "toilet door": "ประตูห้องน้ำ",
      "should": "ควรจะ (กริยาช่วย)",
      "you": "คุณ",
      "do": "ทำ"
    },
    options: [
      'Clean the toilet.',
      'Order some food.',
      'Use another toilet.',
      'Wait inside the toilet.'
    ],
    answer: 2,
    reasonQuestion: 'คำว่า "OUT OF ORDER" แปลว่าอะไร?',
    reasonChoices: [
      'อยู่นอกห้อง',
      'สั่งอาหารกลับบ้าน',
      'ชำรุด/ใช้การไม่ได้ (Broken)',
      'เปิดให้บริการตามปกติ'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'สุดยอด! Out of order = ชำรุด (Broken) เมื่อห้องน้ำเสีย เราก็ต้องไปใช้ห้องอื่น (Use another)',
      mainRightReasonWrong: 'ตอบถูกว่าต้องไปห้องอื่น แต่ต้องรู้ด้วยว่า Out of order = ชำรุด/เสีย',
      mainWrongReasonRight: 'รู้แล้วว่ามันแปลว่าชำรุด ดังนั้นเราจึงต้อง "ไปใช้ห้องน้ำอื่น" (Use another toilet)',
      bothWrong: 'Out of order แปลว่า "เสีย/ใช้ไม่ได้" เมื่อห้องน้ำเสีย เราจึงต้องไปใช้ห้องอื่น (Use another toilet)'
    },
    reasonLanguage: 'thai',
    keyword: 'out of order = broken/use another'
  }
];

export const conversationRescueQuestions = [
  {
    id: 'c3_cr_1',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'A: Thank you so much for your help!\nB: _______________',
    translation: 'A: ขอบคุณมากสำหรับความช่วยเหลือของคุณ!\nB: _______________',
    vocab: {
      "Thank you": "ขอบคุณ",
      "so much": "มาก",
      "for": "สำหรับ",
      "your": "ของคุณ",
      "help": "ความช่วยเหลือ",
      "You're welcome": "ด้วยความยินดี",
      "Never mind": "ไม่เป็นไร",
      "I'm sorry": "ฉันขอโทษ",
      "Yes, please": "ใช่ ได้โปรด"
    },
    options: [
      'Yes, please.',
      'You\'re welcome.',
      'Never mind.',
      'I\'m sorry.'
    ],
    answer: 1,
    reasonQuestion: 'เราควรตอบรับคำขอบคุณ (Thank you) อย่างไรให้สุภาพที่สุด?',
    reasonChoices: [
      'บอกว่าใช่ ได้โปรด (Yes, please)',
      'ตอบรับด้วยความยินดี (You\'re welcome)',
      'บอกว่าช่างมันเถอะ ไม่เป็นไรแบบปัดๆ (Never mind)',
      'กล่าวขอโทษ (I\'m sorry)'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'ถูกต้อง! เมื่อมีคนขอบคุณ เราควรตอบว่า You\'re welcome (ด้วยความยินดี)',
      mainRightReasonWrong: 'ตอบถูกแล้วครับ! เหตุผลคือมันเป็นมารยาทในการตอบรับคำขอบคุณ',
      mainWrongReasonRight: 'เข้าใจสถานการณ์แล้ว! แต่ Never mind มักใช้ตอบรับคำขอโทษมากกว่านะ',
      bothWrong: 'เมื่อมีคนพูด Thank you เราต้องตอบกลับว่า You\'re welcome (ด้วยความยินดี) เสมอ'
    },
    reasonLanguage: 'thai',
    keyword: 'Thank you -> You\'re welcome'
  },
  {
    id: 'c3_cr_2',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'A: I\'m sorry I broke your glass.\nB: _______________',
    translation: 'A: ฉันขอโทษที่ทำแก้วของคุณแตก\nB: _______________',
    vocab: {
      "I'm sorry": "ฉันขอโทษ",
      "I": "ฉัน",
      "broke": "ทำแตก",
      "your": "ของคุณ",
      "glass": "แก้ว",
      "That's all right": "ไม่เป็นไร",
      "Don't worry": "ไม่ต้องกังวล",
      "Congratulations": "ขอแสดงความยินดีด้วย",
      "Me too": "ฉันก็เหมือนกัน",
      "You're welcome": "ด้วยความยินดี"
    },
    options: [
      'You\'re welcome.',
      'Congratulations!',
      'That\'s all right. Don\'t worry.',
      'Me too.'
    ],
    answer: 2,
    reasonQuestion: 'ในสถานการณ์ที่มีคนมาขอโทษ (I\'m sorry) เราควรทำอย่างไร?',
    reasonChoices: [
      'กล่าวแสดงความยินดี (Congratulations)',
      'ตอบว่าฉันก็เหมือนกัน (Me too)',
      'ให้อภัยและบอกว่าไม่เป็นไร (That\'s all right)',
      'กล่าวขอบคุณ (You\'re welcome)'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'เยี่ยมมาก! เมื่อมีคนขอโทษ เราตอบรับว่า That\'s all right (ไม่เป็นไร)',
      mainRightReasonWrong: 'ตอบถูก! That\'s all right ใช้ตอบรับคำขอโทษนะ ไม่ใช่การขอบคุณ',
      mainWrongReasonRight: 'รู้ว่าต้องให้อภัย แต่อย่าลืมเลือกประโยค That\'s all right นะ',
      bothWrong: 'เมื่อเพื่อนขอโทษ (I\'m sorry) เราควรตอบว่า That\'s all right. Don\'t worry. (ไม่เป็นไร ไม่ต้องกังวล)'
    },
    reasonLanguage: 'thai_mixed',
    keyword: 'I\'m sorry -> That\'s all right / Never mind'
  },
  {
    id: 'c3_cr_3',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'A: Would you like some more coffee?\nB: _______________, I\'m full.',
    translation: 'A: คุณต้องการรับกาแฟเพิ่มไหม?\nB: _______________ ฉันอิ่มแล้ว',
    vocab: {
      "Would you like": "คุณต้องการไหม",
      "some more": "เพิ่มอีกบ้าง",
      "coffee": "กาแฟ",
      "I'm full": "ฉันอิ่มแล้ว",
      "Yes, please": "ใช่ ได้โปรด",
      "No, thank you": "ไม่ล่ะ ขอบคุณ",
      "Of course": "แน่นอน",
      "Sure": "แน่นอน"
    },
    options: [
      'Yes, please',
      'No, thank you',
      'Of course',
      'Sure'
    ],
    answer: 1,
    reasonQuestion: 'Keyword ใดที่บอกว่าเราควรปฏิเสธ?',
    reasonChoices: [
      'Would you like (คุณต้องการไหม)',
      'some more (รับเพิ่มไหม)',
      'coffee (กาแฟ)',
      'I\'m full (ฉันอิ่มแล้ว)'
    ],
    reasonAnswer: 3,
    feedback: {
      bothCorrect: 'เป๊ะมาก! "I\'m full" (อิ่มแล้ว) เป็นเหตุผลที่ต้องปฏิเสธอย่างสุภาพด้วย No, thank you',
      mainRightReasonWrong: 'ตอบ No, thank you ถูกแล้ว! แต่จุดสังเกตสำคัญคือคำว่า I\'m full นะ',
      mainWrongReasonRight: 'รู้ว่าอิ่มแล้ว ก็ต้องปฏิเสธนะ! (No, thank you) จะตอบ Yes ไม่ได้',
      bothWrong: 'ในเมื่อประโยคหลังบอกว่า "I\'m full" (อิ่มแล้ว) เราจึงต้องตอบปฏิเสธว่า "No, thank you" (ไม่ล่ะ ขอบคุณ)'
    },
    reasonLanguage: 'thai',
    keyword: 'full (อิ่ม) -> No, thank you'
  },
  {
    id: 'c3_cr_4',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'Situation: You step on someone\'s foot on the bus.\nYou: _______________',
    translation: 'สถานการณ์: คุณเหยียบเท้าคนอื่นบนรถประจำทาง\nคุณ: _______________',
    vocab: {
      "Situation": "สถานการณ์",
      "You": "คุณ",
      "step on": "เหยียบ",
      "someone's": "ของคนบางคน",
      "foot": "เท้า",
      "on": "บน",
      "the bus": "รถประจำทาง",
      "Excuse me": "ขอโทษ (เพื่อขอทาง/รบกวน)",
      "I'm so sorry": "ฉันขอโทษจริงๆ",
      "Thank you": "ขอบคุณ",
      "Never mind": "ไม่เป็นไร"
    },
    options: [
      'Excuse me.',
      'I\'m so sorry!',
      'Thank you.',
      'Never mind.'
    ],
    answer: 1,
    reasonQuestion: 'ทำไมถึงต้องพูดว่า "I\'m so sorry"?',
    reasonChoices: [
      'เพราะต้องการขอทาง (Excuse me)',
      'เพราะเราทำผิดพลาดหรือทำให้คนอื่นเจ็บ (step on someone\'s foot)',
      'เพราะเราต้องการขอบคุณ',
      'เพราะเราต้องการบอกว่าไม่เป็นไร'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'ยอดเยี่ยม! เมื่อเราเดินเหยียบเท้าคนอื่น ถือเป็นความผิดของเรา ต้องกล่าวขอโทษ (Sorry)',
      mainRightReasonWrong: 'ตอบ Sorry ถูกแล้ว! เหตุผลคือเราเผลอไปทำคนอื่นเจ็บนั่นเอง',
      mainWrongReasonRight: 'วิเคราะห์สถานการณ์ได้ถูกต้อง! แต่เมื่อทำผิดเราต้องใช้ Sorry นะ ไม่ใช่ Excuse me',
      bothWrong: 'step on someone\'s foot = เหยียบเท้าคนอื่น เมื่อทำผิดต้องพูดว่า I\'m so sorry (ขอโทษ)'
    },
    reasonLanguage: 'thai',
    keyword: 'step on foot (ทำผิด) -> I\'m sorry'
  },
  {
    id: 'c3_cr_5',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'A: I passed my English exam!\nB: _______________',
    translation: 'A: ฉันสอบผ่านวิชาภาษาอังกฤษแล้ว!\nB: _______________',
    vocab: {
      "I": "ฉัน",
      "passed": "สอบผ่าน",
      "my": "ของฉัน",
      "English exam": "การสอบวิชาภาษาอังกฤษ",
      "Happy birthday": "สุขสันต์วันเกิด",
      "Congratulations": "ขอแสดงความยินดีด้วย",
      "Good luck": "โชคดีนะ",
      "I am sorry": "ฉันเสียใจด้วย",
      "to hear that": "ที่ได้ยินเช่นนั้น"
    },
    options: [
      'Happy birthday!',
      'Congratulations!',
      'Good luck!',
      'I am sorry to hear that.'
    ],
    answer: 1,
    reasonQuestion: 'Why do we say "Congratulations"?',
    reasonChoices: [
      'Because it is their birthday.',
      'Because they had bad news.',
      'Because they achieved something good (passed an exam).',
      'Because they need luck for the future.'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'Perfect! When someone passes an exam, we congratulate them.',
      mainRightReasonWrong: 'You got the word right, but the reason is because passing an exam is a success!',
      mainWrongReasonRight: 'You know they did well! The right word to celebrate is "Congratulations!".',
      bothWrong: 'สอบผ่าน (passed exam) เป็นเรื่องน่ายินดี เราต้องพูดว่า Congratulations! (ขอแสดงความยินดีด้วย)'
    },
    reasonLanguage: 'simple_english',
    keyword: 'passed exam -> Congratulations'
  },
  {
    id: 'c3_cr_6',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'Teacher: How do you do?\nStudent: _______________',
    translation: 'คุณครู: ยินดีที่ได้รู้จัก (ทักทายครั้งแรก)\nนักเรียน: _______________',
    vocab: {
      "How do you do": "ยินดีที่ได้รู้จัก (ใช้ทักทายเมื่อเจอกันครั้งแรก)",
      "I am fine": "ฉันสบายดี",
      "thank you": "ขอบคุณ",
      "Nice to meet you too": "ยินดีที่ได้รู้จักเช่นกัน",
      "I am doing": "ฉันกำลังทำ",
      "my": "ของฉัน",
      "homework": "การบ้าน"
    },
    options: [
      'I am fine, thank you.',
      'How do you do?',
      'Nice to meet you too.',
      'I am doing my homework.'
    ],
    answer: 1,
    reasonQuestion: 'อะไรคือความพิเศษของประโยค "How do you do?"',
    reasonChoices: [
      'มันคือคำถามที่ถามว่าทำอาชีพอะไร',
      'มันคือคำถามที่ถามว่ากำลังทำอะไรอยู่',
      'มันเป็นคำทักทายแบบเป็นทางการสำหรับคนที่เพิ่งรู้จักกันครั้งแรก ต้องตอบกลับด้วยคำเดิม',
      'มันแปลว่าสบายดีไหม ต้องตอบว่า I am fine.'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'เก่งมากๆ! How do you do? ไม่ใช่ประโยคคำถาม แต่เป็นการทักทาย ต้องตอบกลับว่า How do you do? เสมอ (ข้อสอบ O-NET ชอบออกบ่อยมาก!)',
      mainRightReasonWrong: 'ตอบถูกแล้ว! แต่ต้องจำไว้นะว่ามันคือกฎการทักทายของ How do you do?',
      mainWrongReasonRight: 'เข้าใจกฎแล้ว! ดังนั้นต้องตอบว่า How do you do? กลับไปนะ ห้ามตอบ I am fine',
      bothWrong: 'จำไว้เลย! ถ้ามีคนทักว่า How do you do? เราต้องตอบกลับด้วยประโยคเดียวกันคือ "How do you do?" เท่านั้น'
    },
    reasonLanguage: 'thai',
    keyword: 'How do you do? -> How do you do?'
  },
  {
    id: 'c3_cr_7',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'A: Do you mind if I open the window?\nB: _______________ It\'s very hot in here.',
    translation: 'A: คุณจะรังเกียจไหมถ้าฉันจะเปิดหน้าต่าง?\nB: _______________ ข้างในนี้ร้อนมาก',
    vocab: {
      "Do you mind": "คุณจะรังเกียจไหม",
      "if": "ถ้า",
      "I": "ฉัน",
      "open": "เปิด",
      "the window": "หน้าต่าง",
      "It's": "มัน",
      "very hot": "ร้อนมาก",
      "in here": "ในนี้",
      "Yes, I do": "ใช่ ฉันรังเกียจ",
      "No, not at all": "ไม่ ไม่รังเกียจเลย",
      "Of course I mind": "แน่นอนฉันรังเกียจ",
      "No, you can't": "ไม่ คุณทำไม่ได้"
    },
    options: [
      'Yes, I do.',
      'No, not at all.',
      'Of course I mind.',
      'No, you can\'t.'
    ],
    answer: 1,
    reasonQuestion: 'คำว่า "Do you mind...?" แปลว่าอะไร และในบริบทนี้ B อนุญาตหรือไม่?',
    reasonChoices: [
      'แปลว่า "คุณจะรังเกียจไหม" B อนุญาตเพราะบอกว่าอากาศร้อน (No = ไม่รังเกียจ = อนุญาต)',
      'แปลว่า "คุณเปิดหน้าต่างได้ไหม" B ไม่อนุญาต',
      'แปลว่า "คุณคิดยังไง" B ไม่มีความเห็น',
      'แปลว่า "คุณจะรังเกียจไหม" B ไม่อนุญาต (Yes = รังเกียจ)'
    ],
    reasonAnswer: 0,
    feedback: {
      bothCorrect: 'สุดยอดการวิเคราะห์! Do you mind? (รังเกียจไหม) การตอบ No (ไม่รังเกียจ) แปลว่า "อนุญาตให้ทำได้"',
      mainRightReasonWrong: 'ตอบ No ถูกแล้ว! แต่จำไว้ว่ามันคือการบอกว่า "ไม่รังเกียจ เชิญทำเลย"',
      mainWrongReasonRight: 'วิเคราะห์บริบทถูกว่า B อนุญาต! แต่ถ้าอนุญาตต้องตอบว่า No, not at all (ไม่รังเกียจเลย)',
      bothWrong: 'Do you mind...? แปลว่าคุณรังเกียจไหม ถ้าเราจะ "อนุญาต" ต้องตอบ No (ไม่รังเกียจ) ครับ'
    },
    reasonLanguage: 'thai_mixed',
    keyword: 'Do you mind? + อนุญาต -> No, not at all.'
  },
  {
    id: 'c3_cr_8',
    quest: 'conversation_rescue',
    type: 'two_step',
    question: 'A: What does your father do?\nB: _______________',
    translation: 'A: พ่อของคุณทำอาชีพอะไร?\nB: _______________',
    vocab: {
      "What": "อะไร",
      "does": "(คำกริยาช่วย)",
      "your": "ของคุณ",
      "father": "พ่อ",
      "do": "ทำ(อาชีพ)",
      "He": "เขา (ผู้ชาย)",
      "is": "คือ/เป็น",
      "fine": "สบายดี",
      "reading": "กำลังอ่าน",
      "a book": "หนังสือ",
      "a doctor": "หมอ",
      "in": "ใน",
      "the living room": "ห้องนั่งเล่น"
    },
    options: [
      'He is fine.',
      'He is reading a book.',
      'He is a doctor.',
      'He is in the living room.'
    ],
    answer: 2,
    reasonQuestion: 'คำถาม "What do/does (someone) do?" ใช้ถามเกี่ยวกับอะไร?',
    reasonChoices: [
      'ถามว่าเขากำลังทำอะไรอยู่ (What is he doing?)',
      'ถามถึงอาชีพ (Occupation)',
      'ถามถึงสถานที่ (Where is he?)',
      'ถามถึงอาการ/สุขภาพ (How is he?)'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'ยอดเยี่ยม! "What do you do?" หรือ "What does he do?" เป็นสำนวนแปลว่า "คุณทำอาชีพอะไร"',
      mainRightReasonWrong: 'ตอบถูกแล้ว! อย่าสับสนกับ What is he doing? นะ ประโยคนี้ถามหา "อาชีพ"',
      mainWrongReasonRight: 'รู้ว่าถามอาชีพแล้ว แต่ดันไปเลือกข้อที่ตอบว่ากำลังทำอะไรอยู่ ต้องเลือก He is a doctor นะ',
      bothWrong: 'What does your father do? แปลว่า "พ่อของคุณทำงานอะไร(อาชีพ)" ต้องตอบเป็นชื่ออาชีพครับ'
    },
    reasonLanguage: 'thai',
    keyword: 'What does he do? = อาชีพ'
  }
];

export const mapEscapeQuestions = [
  {
    id: 'c3_me_1',
    quest: 'map_escape',
    type: 'two_step',
    question: 'You are at the hospital. Go straight and turn left. The bank is on your right.\nQuestion: Where is the bank?',
    translation: 'คุณอยู่ที่โรงพยาบาล เดินตรงไปและเลี้ยวซ้าย ธนาคารจะอยู่ทางขวามือของคุณ\nคำถาม: ธนาคารอยู่ที่ไหน?',
    vocab: {
      "You": "คุณ",
      "are": "เป็น/อยู่/คือ",
      "at": "ที่",
      "the hospital": "โรงพยาบาล",
      "Go straight": "เดินตรงไป",
      "and": "และ",
      "turn left": "เลี้ยวซ้าย",
      "The bank": "ธนาคาร",
      "is": "คือ/อยู่",
      "on": "บน",
      "your": "ของคุณ",
      "right": "ขวา",
      "Where": "ที่ไหน",
      "Next to": "ถัดจาก",
      "On the left side": "ทางด้านซ้าย",
      "of the street": "ของถนน",
      "On the right side": "ทางด้านขวา",
      "Behind": "ข้างหลัง"
    },
    options: [
      'Next to the hospital',
      'On the left side of the street',
      'On the right side of the street',
      'Behind the hospital'
    ],
    answer: 2,
    reasonQuestion: 'ข้อความใดในโจทย์ที่บอกตำแหน่งสุดท้ายของธนาคาร?',
    reasonChoices: [
      'Go straight',
      'turn left',
      'on your right',
      'at the hospital'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'ถูกต้อง! คำว่า "on your right" ระบุชัดเจนว่าธนาคารอยู่ทางขวามือ',
      mainRightReasonWrong: 'ตอบถูกแล้วครับ จุดสังเกตของตำแหน่งคือท่อนสุดท้าย "on your right"',
      mainWrongReasonRight: 'หา Keyword เจอแล้ว! "on your right" ก็ต้องแปลว่าอยู่ทางฝั่งขวา (on the right side) นะ',
      bothWrong: 'ประโยคบอกว่า "The bank is on your right." แปลว่าธนาคารอยู่ทางด้านขวามือครับ'
    },
    reasonLanguage: 'thai_mixed',
    keyword: 'on your right = ทางขวา'
  },
  {
    id: 'c3_me_2',
    quest: 'map_escape',
    type: 'two_step',
    question: 'The library is between the school and the post office.\nQuestion: If you are at the school, where is the library?',
    translation: 'ห้องสมุดอยู่ระหว่างโรงเรียนและที่ทำการไปรษณีย์\nคำถาม: ถ้าคุณอยู่ที่โรงเรียน ห้องสมุดจะอยู่ที่ไหน?',
    vocab: {
      "The library": "ห้องสมุด",
      "is": "คือ/อยู่",
      "between": "อยู่ระหว่าง",
      "the school": "โรงเรียน",
      "and": "และ",
      "the post office": "ที่ทำการไปรษณีย์",
      "If": "ถ้า",
      "you": "คุณ",
      "are": "อยู่",
      "at": "ที่",
      "where": "ที่ไหน",
      "It": "มัน",
      "behind": "ข้างหลัง",
      "next to": "ถัดจาก",
      "opposite": "ตรงข้าม",
      "across from": "ตรงข้ามกับ"
    },
    options: [
      'It is behind the school.',
      'It is next to the school.',
      'It is opposite the post office.',
      'It is across from the school.'
    ],
    answer: 1,
    reasonQuestion: 'คำว่า "between" (อยู่ระหว่าง) มีความหมายแฝงว่าอย่างไรในเชิงตำแหน่ง?',
    reasonChoices: [
      'สิ่งที่อยู่ระหว่าง จะต้องอยู่ถัดจาก (next to) ทั้งสองสถานที่ที่ขนาบข้าง',
      'สิ่งที่อยู่ระหว่าง จะต้องอยู่ตรงข้าม (opposite) เสมอ',
      'สิ่งที่อยู่ระหว่าง จะต้องอยู่ด้านหลัง (behind)',
      'สิ่งที่อยู่ระหว่าง จะต้องอยู่ไกลออกไป (far)'
    ],
    reasonAnswer: 0,
    feedback: {
      bothCorrect: 'วิเคราะห์ได้ดีมาก! ถ้าห้องสมุดอยู่ระหว่าง A กับ B แปลว่าห้องสมุดต้องอยู่ถัดจาก (next to) A และ B',
      mainRightReasonWrong: 'ตอบถูกว่า next to แต่เหตุผลคือ between หมายถึงการอยู่ตรงกลาง ซึ่งจะติดกับทั้งซ้ายและขวาครับ',
      mainWrongReasonRight: 'เข้าใจเหตุผลแล้ว! ดังนั้นเมื่อมันขนาบข้าง มันจึง "next to" (อยู่ถัดจาก) โรงเรียนครับ',
      bothWrong: 'between A and B แปลว่าอยู่ตรงกลางระหว่าง A กับ B ดังนั้นมันจึงต้องอยู่ "ติดกับ/ถัดจาก" (next to) ทั้ง A และ B'
    },
    reasonLanguage: 'thai',
    keyword: 'between = next to ทั้งสองฝั่ง'
  },
  {
    id: 'c3_me_3',
    quest: 'map_escape',
    type: 'two_step',
    question: 'Go along this street. Take the second turning on the left. The shop is opposite the park.\nWhere do you turn?',
    translation: 'เดินไปตามถนนนี้ เลี้ยวที่ทางแยกที่สองทางซ้าย ร้านค้าจะอยู่ตรงข้ามสวนสาธารณะ\nคุณต้องเลี้ยวที่ไหน?',
    vocab: {
      "Go along": "เดินไปตาม",
      "this": "นี้",
      "street": "ถนน",
      "Take": "เลี้ยวที่",
      "the second": "ที่สอง",
      "turning": "ทางแยก",
      "on the left": "ทางซ้าย",
      "The shop": "ร้านค้า",
      "is": "อยู่",
      "opposite": "ตรงข้าม",
      "the park": "สวนสาธารณะ",
      "Where": "ที่ไหน",
      "do": "(คำกริยาช่วย)",
      "you": "คุณ",
      "turn": "เลี้ยว",
      "At": "ที่",
      "the first": "ที่แรก",
      "on the right": "ทางขวา"
    },
    options: [
      'At the first turning on the right.',
      'At the first turning on the left.',
      'At the second turning on the left.',
      'At the park.'
    ],
    answer: 2,
    reasonQuestion: 'Which phrase gives the exact instruction for turning?',
    reasonChoices: [
      'Go along this street',
      'Take the second turning on the left',
      'opposite the park',
      'The shop is'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'Exactly! The instruction clearly says "Take the second turning on the left".',
      mainRightReasonWrong: 'Right answer! The clue was exactly in the text "second turning on the left".',
      mainWrongReasonRight: 'You found the correct phrase in the text! Just select the option that matches it perfectly.',
      bothWrong: 'คำตอบมีบอกตรงๆ ในโจทย์เลยครับ คือ "Take the second turning on the left" (เลี้ยวซ้ายที่แยกที่สอง)'
    },
    reasonLanguage: 'simple_english',
    keyword: 'second turning on the left'
  },
  {
    id: 'c3_me_4',
    quest: 'map_escape',
    type: 'two_step',
    question: 'A: Excuse me, _______________\nB: Walk straight for two blocks. It\'s at the corner.',
    translation: 'A: ขอโทษนะครับ/คะ _______________\nB: เดินตรงไปสองบล็อก มันอยู่ที่มุมถนน',
    vocab: {
      "Excuse me": "ขอโทษ (เพื่อรบกวน/ขอทาง)",
      "Walk straight": "เดินตรงไป",
      "for": "เป็นระยะทาง",
      "two blocks": "สองบล็อก",
      "It's": "มันอยู่",
      "at": "ที่",
      "the corner": "มุมถนน",
      "where": "ที่ไหน",
      "is": "คือ/อยู่",
      "the nearest": "ที่ใกล้ที่สุด",
      "hospital": "โรงพยาบาล",
      "what time": "เวลาเท่าไหร่",
      "how much": "ราคาเท่าไหร่",
      "are you": "คุณกำลัง",
      "going": "ไป"
    },
    options: [
      'where is the nearest hospital?',
      'what time is it?',
      'how much is this?',
      'are you going to the hospital?'
    ],
    answer: 0,
    reasonQuestion: 'คำตอบของ B "Walk straight... It\'s at the corner" บอกใบ้ว่า A ควรถามเรื่องอะไร?',
    reasonChoices: [
      'ถามเวลา (Time)',
      'ถามราคา (Price)',
      'ถามทางไปสถานที่ (Direction/Location)',
      'ถามใช่/ไม่ใช่ (Yes/No Question)'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'เป๊ะมาก! B บอกทิศทางเดิน ดังนั้น A ต้องถามหา "สถานที่" ว่าอยู่ที่ไหน (Where is...)',
      mainRightReasonWrong: 'ตอบคำถาม Where ถูกแล้ว เหตุผลเพราะ B ตอบกลับเป็นการบอกทางครับ',
      mainWrongReasonRight: 'รู้ว่าเป็นการบอกทาง ก็ต้องเลือกคำถามที่ขึ้นต้นด้วย "Where" เพื่อถามหาสถานที่นะ',
      bothWrong: 'B บอกทางว่าให้เดินตรงไป (Walk straight) ดังนั้น A ต้องกำลังหลงทางและถามว่า "โรงพยาบาลอยู่ที่ไหน" (Where is...)'
    },
    reasonLanguage: 'thai',
    keyword: 'Walk straight (บอกทาง) -> Where is...?'
  }
];

export const readingDetectiveQuestions = [
  {
    id: 'c3_rd_1',
    quest: 'reading_detective',
    type: 'two_step',
    question: 'Read the passage:\n"Elephants are the largest land animals. They eat grass, leaves, and fruits. They drink a lot of water every day."\nQuestion: What do elephants eat?',
    translation: 'อ่านเนื้อเรื่อง:\n"ช้างเป็นสัตว์บกที่ใหญ่ที่สุด พวกมันกินหญ้า ใบไม้ และผลไม้ พวกมันดื่มน้ำมากทุกวัน"\nคำถาม: ช้างกินอะไร?',
    vocab: {
      "Read": "อ่าน",
      "the passage": "เนื้อเรื่อง",
      "Elephants": "ช้าง (หลายตัว)",
      "are": "เป็น/อยู่/คือ",
      "the largest": "ใหญ่ที่สุด",
      "land animals": "สัตว์บก",
      "They": "พวกมัน",
      "eat": "กิน",
      "grass": "หญ้า",
      "leaves": "ใบไม้",
      "and": "และ",
      "fruits": "ผลไม้",
      "drink": "ดื่ม",
      "a lot of": "จำนวนมาก",
      "water": "น้ำ",
      "every day": "ทุกวัน",
      "What": "อะไร",
      "do": "(คำกริยาช่วย)",
      "Only": "เท่านั้น",
      "Meat": "เนื้อสัตว์"
    },
    options: [
      'Only grass',
      'Meat and fruits',
      'Grass, leaves, and fruits',
      'Only water'
    ],
    answer: 2,
    reasonQuestion: 'ประโยคใดในเนื้อเรื่องที่บอกคำตอบได้ตรงที่สุด (Keyword Match)?',
    reasonChoices: [
      'Elephants are the largest land animals.',
      'They eat grass, leaves, and fruits.',
      'They drink a lot of water every day.',
      'ไม่มีประโยคไหนบอกชัดเจน'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'ถูกต้อง! การทำ Reading ให้หาคำว่า "eat" ในคำถาม แล้วไปกวาดสายตาหาในเนื้อเรื่อง จะเจอคำตอบทันที',
      mainRightReasonWrong: 'คำตอบหลักถูกแล้ว! เทคนิคคือการจับ Keyword คำว่า "eat" ในโจทย์ไปเทียบกับเนื้อเรื่องนะ',
      mainWrongReasonRight: 'หาประโยคคำตอบเจอแล้ว! แต่อย่าลืมอ่านรายละเอียดให้ครบว่ามี Grass, leaves, และ fruits',
      bothWrong: 'โจทย์ถามหา "eat" ให้กวาดสายตาหาคำว่า "eat" ในเนื้อเรื่อง ก็จะพบประโยคที่บอกของกินครบ 3 อย่างครับ'
    },
    reasonLanguage: 'thai',
    keyword: 'eat -> grass, leaves, fruits'
  },
  {
    id: 'c3_rd_2',
    quest: 'reading_detective',
    type: 'two_step',
    question: 'Read the text message:\n"Hi Mark, I cannot go to your party tonight because I have a terrible headache. Happy Birthday! - Jane"\nQuestion: Why is Jane not going to the party?',
    translation: 'อ่านข้อความ:\n"สวัสดีมาร์ค ฉันไม่สามารถไปงานปาร์ตี้ของคุณคืนนี้ได้ เพราะฉันปวดหัวอย่างหนัก สุขสันต์วันเกิด! - เจน"\nคำถาม: ทำไมเจนถึงไม่ไปงานปาร์ตี้?',
    vocab: {
      "Hi": "สวัสดี",
      "I": "ฉัน",
      "cannot": "ไม่สามารถ",
      "go": "ไป",
      "to": "ไปยัง",
      "your": "ของคุณ",
      "party": "งานปาร์ตี้",
      "tonight": "คืนนี้",
      "because": "เพราะว่า",
      "have": "มี/เป็น",
      "a terrible": "อย่างหนัก/แย่มาก",
      "headache": "อาการปวดหัว",
      "Happy Birthday": "สุขสันต์วันเกิด",
      "Why": "ทำไม",
      "is": "(คำกริยาช่วย)",
      "not": "ไม่",
      "going": "ไป",
      "she": "เธอ (ผู้หญิง)",
      "has": "มี/เป็น",
      "has to": "ต้อง",
      "study": "เรียน",
      "doesn't": "ไม่",
      "like": "ชอบ",
      "raining": "กำลังตก (ฝน)"
    },
    options: [
      'Because she has a headache.',
      'Because she has to study.',
      'Because she doesn\'t like Mark.',
      'Because it is raining.'
    ],
    answer: 0,
    reasonQuestion: 'What keyword follows the word "because" in the text?',
    reasonChoices: [
      'tonight',
      'Happy Birthday',
      'a terrible headache',
      'cannot go'
    ],
    reasonAnswer: 2,
    feedback: {
      bothCorrect: 'Excellent! The text explicitly says "because I have a terrible headache".',
      mainRightReasonWrong: 'Right answer! Always trace the word "because" in the text to find the reason.',
      mainWrongReasonRight: 'You found the keyword "headache"! So her reason for not going is the headache.',
      bothWrong: 'ในเนื้อเรื่อง Jane บอกตรงๆ เลยว่า "...because I have a terrible headache" (เพราะฉันปวดหัวหนักมาก)'
    },
    reasonLanguage: 'simple_english',
    keyword: 'because -> headache'
  },
  {
    id: 'c3_rd_3',
    quest: 'reading_detective',
    type: 'two_step',
    question: 'Read the chart info:\n"Monday: Sunny, 30°C\nTuesday: Rainy, 25°C\nWednesday: Cloudy, 28°C"\nQuestion: What is the weather like on Tuesday?',
    translation: 'อ่านข้อมูลในตาราง:\n"วันจันทร์: แดดจ้า, 30°C\nวันอังคาร: ฝนตก, 25°C\nวันพุธ: มีเมฆมาก, 28°C"\nคำถาม: สภาพอากาศในวันอังคารเป็นอย่างไร?',
    vocab: {
      "Read": "อ่าน",
      "the chart info": "ข้อมูลในตาราง",
      "Monday": "วันจันทร์",
      "Sunny": "แดดจ้า",
      "Tuesday": "วันอังคาร",
      "Rainy": "ฝนตก",
      "Wednesday": "วันพุธ",
      "Cloudy": "มีเมฆมาก",
      "What": "อะไร/อย่างไร",
      "is": "คือ/เป็น",
      "the weather like": "สภาพอากาศเป็นอย่างไร",
      "on": "ใน (ใช้นำหน้าวัน)",
      "It": "มัน",
      "hot": "ร้อน",
      "and": "และ",
      "raining": "กำลังตก (ฝน)",
      "cloudy": "มีเมฆมาก",
      "snowing": "หิมะกำลังตก"
    },
    options: [
      'It is hot and sunny.',
      'It is raining.',
      'It is cloudy.',
      'It is snowing.'
    ],
    answer: 1,
    reasonQuestion: 'เราต้องใช้ Keyword คำว่าอะไรในการกวาดสายตาหาคำตอบ?',
    reasonChoices: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Weather'
    ],
    reasonAnswer: 1,
    feedback: {
      bothCorrect: 'เก่งมาก! เมื่อโจทย์ถาม Tuesday เราก็พุ่งสายตาไปหาบรรทัด Tuesday ก็จะเจอว่าฝนตก (Rainy)',
      mainRightReasonWrong: 'คำตอบถูกครับ! ทริคคือมองหาเฉพาะวันที่โจทย์ถาม (Tuesday) เพื่อประหยัดเวลา',
      mainWrongReasonRight: 'หาบรรทัด Tuesday เจอแล้ว! ลองดูดีๆ ว่าบรรทัดนั้นเขียนว่าอะไร (Rainy = ฝนตก = raining)',
      bothWrong: 'โจทย์ถามวันอังคาร (Tuesday) ให้ไปดูข้อมูลวันอังคาร จะพบคำว่า Rainy (ฝนตก)'
    },
    reasonLanguage: 'thai',
    keyword: 'Tuesday -> Rainy'
  },
  {
    id: 'c3_rd_4',
    quest: 'reading_detective',
    type: 'two_step',
    question: 'Passage: "Tom gets up at 6:00 a.m. He has breakfast at 6:30 a.m. He goes to school by bicycle at 7:00 a.m."\nQuestion: How does Tom go to school?',
    translation: 'เนื้อเรื่อง: "ทอมตื่นนอนเวลา 6:00 น. เขากินอาหารเช้าเวลา 6:30 น. เขาไปโรงเรียนโดยรถจักรยานเวลา 7:00 น."\nคำถาม: ทอมไปโรงเรียนอย่างไร?',
    vocab: {
      "Passage": "เนื้อเรื่อง",
      "gets up": "ตื่นนอน",
      "at": "ที่ (เวลา)",
      "He": "เขา (ผู้ชาย)",
      "has breakfast": "กินอาหารเช้า",
      "goes": "ไป",
      "to": "ไปยัง",
      "school": "โรงเรียน",
      "by bicycle": "โดยรถจักรยาน",
      "How": "อย่างไร",
      "does": "(คำกริยาช่วย)",
      "go": "ไป",
      "By bus": "โดยรถประจำทาง"
    },
    options: [
      'At 7:00 a.m.',
      'At 6:30 a.m.',
      'By bus',
      'By bicycle'
    ],
    answer: 3,
    reasonQuestion: 'ทำไมถึงตอบ By bicycle? (วิเคราะห์คำถาม)',
    reasonChoices: [
      'เพราะโจทย์ถาม "How" (อย่างไร) เป็นการถามหาวิธีการ/ยานพาหนะ ไม่ใช่ถามเวลา',
      'เพราะโจทย์ถาม "When" (เมื่อไหร่)',
      'เพราะโจทย์ถาม "Who" (ใคร)',
      'เพราะโจทย์ถาม "Where" (ที่ไหน)'
    ],
    reasonAnswer: 0,
    feedback: {
      bothCorrect: 'เฉียบขาด! ข้อสอบ O-NET ชอบหลอกเอาเวลามาใส่ในช้อยส์ แต่ถ้าถาม How ต้องตอบเป็นวิธีการ (by bicycle)',
      mainRightReasonWrong: 'ตอบถูกครับ แต่ต้องระวังโดนหลอกนะ จำไว้ว่า How = วิธีการ, When = เวลา',
      mainWrongReasonRight: 'วิเคราะห์ถูกแล้วว่าถามวิธีการ! แต่เผลอไปกดตอบข้อที่เป็นเวลา (7:00 a.m.) ระวังโดนหลอกนะ!',
      bothWrong: 'คำถามขึ้นต้นด้วย "How" (ไปอย่างไร) เราต้องไปหาในเนื้อเรื่องตรงคำว่า goes to school ว่าเขาต่อท้ายด้วยอะไร (by bicycle)'
    },
    reasonLanguage: 'thai_mixed',
    keyword: 'How = ยานพาหนะ (by bicycle)'
  }
];

// Combine all missions for the final boss
export const strategyBossQuestions = [
  ...questionWordQuestions.slice(0, 3),
  ...signDetectiveQuestions.slice(0, 3),
  ...conversationRescueQuestions.slice(0, 3),
  ...mapEscapeQuestions.slice(0, 3),
  ...readingDetectiveQuestions.slice(0, 3)
];
