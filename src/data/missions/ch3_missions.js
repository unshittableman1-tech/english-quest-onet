// ============================================================
// ch3_missions.js — Mission data สำหรับ Chapter 3 (6 Quests)
// ข้อมูลจาก: โค้งหักศอก (O-NET technique) + Worksheet P6 passages
// ============================================================

import { TECHNIQUE_CARDS } from './ch1_missions';

// ── Chapter 3, Quest 12: Question Word Gate ───────────────────
export const questionWordsMissions = [
  {
    id: 'qw_match',
    questId: 'question_words',
    type: 'matching',
    title: '🗝️ WH Sort',
    subtitle: 'จับคู่ WH-word กับสิ่งที่ถาม',
    xpReward: 30,
    techniqueCard: 'reading',
    pairs: [
      { id: 'qm1', left: 'What time', right: '⏰ เวลา', leftThai: '' },
      { id: 'qm2', left: 'Where', right: '📍 สถานที่', leftThai: '' },
      { id: 'qm3', left: 'How often', right: '🔁 ความบ่อย', leftThai: '' },
      { id: 'qm4', left: 'Whose', right: '👤 เจ้าของ', leftThai: '' },
      { id: 'qm5', left: 'How many', right: '🔢 จำนวน', leftThai: '' },
      { id: 'qm6', left: 'How much', right: '💰 ราคา/นับไม่ได้', leftThai: '' },
      { id: 'qm7', left: 'Why', right: '💡 เหตุผล', leftThai: '' },
      { id: 'qm8', left: 'Who', right: '👩 บุคคล', leftThai: '' },
    ],
  },
  {
    id: 'qw_mike',
    questId: 'question_words',
    type: 'story_tap',
    title: '📖 Mike\'s Story',
    subtitle: 'อ่านเรื่องราวแล้วตอบคำถาม WH',
    xpReward: 50,
    techniqueCard: 'reading',
    // จากโค้งหักศอก (O-NET style passage)
    storyText: "Mike is a fifteen-year-old student. He goes to Wattana School. He gets up at six o'clock every morning. He goes to school by bicycle. He arrives at school at seven thirty. He has lunch at school with his friends at noon. After school, he goes home and does homework. He goes to bed at nine o'clock.",
    passages: [
      { id: 'qw1', question: 'How old is Mike?', options: ['14', '15', '16', '17'], answer: 1, explanation: '"fifteen-year-old student" = อายุ 15 ปี' },
      { id: 'qw2', question: 'Where does Mike go to school?', options: ['Wattana School', 'Bangkok School', 'Central School', 'Thailand School'], answer: 0, explanation: '"He goes to Wattana School"' },
      { id: 'qw3', question: 'What time does Mike get up?', options: ['5:00', '6:00', '6:30', '7:00'], answer: 1, explanation: '"gets up at six o\'clock"' },
      { id: 'qw4', question: 'How does Mike go to school?', options: ['By bus', 'By car', 'By bicycle', 'On foot'], answer: 2, explanation: '"He goes to school by bicycle"' },
      { id: 'qw5', question: 'When does Mike have lunch?', options: ['At 11:00', 'At noon', 'At 1:00', 'At 2:00'], answer: 1, explanation: '"He has lunch... at noon" = เที่ยงวัน' },
      { id: 'qw6', question: 'What does he do after school?', options: ['Plays football', 'Watches TV', 'Does homework', 'Goes shopping'], answer: 2, explanation: '"goes home and does homework"' },
      { id: 'qw7', question: 'What time does Mike go to bed?', options: ['8:00', '9:00', '10:00', '11:00'], answer: 1, explanation: '"He goes to bed at nine o\'clock"' },
    ],
  },
];

// ── Chapter 3, Quest 13: Sign Detective ─────────────────────
export const signDetectiveMissions = [
  {
    id: 'sd_flash',
    questId: 'sign_detective',
    type: 'flashcard',
    title: '🕵️ O-NET Sign Flash',
    subtitle: 'ฝึกอ่านป้ายแบบ O-NET จริง',
    xpReward: 30,
    techniqueCard: 'signs',
    // จากโค้งหักศอก Part 2: O-NET Style Signs
    cards: [
      {
        id: 'sdf1',
        front: '🏪',
        frontLabel: 'WEEKEND ONLY\nBUY 2 GET 1 FREE\nON ALL SHOES AND CLOTHES',
        back: 'ที่ร้านนี้',
        backThai: 'ซื้อ 2 แถม 1 เฉพาะวันเสาร์-อาทิตย์ สำหรับรองเท้าและเสื้อผ้า',
        hint: 'ONLY = เฉพาะ / FREE = ฟรี',
      },
      {
        id: 'sdf2',
        front: '🏊',
        frontLabel: 'NO SWIMMING\nWATER IS DANGEROUS',
        back: 'ป้ายนี้หมายความว่า',
        backThai: 'ห้ามว่ายน้ำ น้ำมีอันตราย',
        hint: 'NO = ห้าม',
      },
      {
        id: 'sdf3',
        front: '📱',
        frontLabel: 'PLEASE TURN OFF\nYOUR MOBILE PHONES',
        back: 'ป้ายนี้แสดงว่า',
        backThai: 'กรุณาปิดโทรศัพท์มือถือ',
        hint: 'Turn off = ปิด',
      },
      {
        id: 'sdf4',
        front: '🅿️',
        frontLabel: 'FREE PARKING\nFOR CUSTOMERS ONLY',
        back: 'ป้ายนี้หมายความว่า',
        backThai: 'จอดรถฟรีสำหรับลูกค้าเท่านั้น',
        hint: 'FREE = ไม่ต้องจ่าย / ONLY = เฉพาะ',
      },
      {
        id: 'sdf5',
        front: '🔔',
        frontLabel: 'LIBRARY\nPLEASE KEEP QUIET',
        back: 'ป้ายนี้แสดงว่า',
        backThai: 'นี่คือห้องสมุด กรุณาเงียบ',
        hint: 'Keep quiet = เงียบ',
      },
    ],
  },
  {
    id: 'sd_onet',
    questId: 'sign_detective',
    type: 'story_tap',
    title: '🔍 Sign Quiz (O-NET Style)',
    subtitle: 'วิเคราะห์ป้ายแบบข้อสอบ O-NET จริง',
    xpReward: 50,
    techniqueCard: 'signs',
    passages: [
      {
        id: 'sd1',
        text: '🚫🅿️ NO PARKING\nMON - FRI 8AM - 6PM',
        question: 'What does this sign mean?',
        options: [
          'You can park here on weekends.',
          'You must not park here on weekdays.',
          'Parking is free from Monday to Friday.',
          'You can park here between 8 AM and 6 PM.',
        ],
        answer: 0,
        explanation: 'NO PARKING Mon–Fri 8AM–6PM → ห้ามจอดในวันจันทร์–ศุกร์ ช่วงเช้าถึงเย็น → สามารถจอดได้วันเสาร์-อาทิตย์',
      },
      {
        id: 'sd2',
        text: '👶 CHILDREN ONLY\nAGE 3 - 12\nADULTS NOT ALLOWED',
        question: 'Who can use this area?',
        options: ['Children aged 3 to 12', 'Adults only', 'Everyone', 'Children and adults'],
        answer: 0,
        explanation: 'CHILDREN ONLY Age 3-12 = เฉพาะเด็กอายุ 3-12 ปีเท่านั้น',
      },
      {
        id: 'sd3',
        text: '🆓 FREE WIFI\nASK STAFF FOR PASSWORD',
        question: 'What is TRUE about the WiFi?',
        options: ['You don\'t need to pay.', 'You must pay 50 baht.', 'Only staff can use it.', 'The WiFi is not available.'],
        answer: 0,
        explanation: 'FREE WiFi = ไม่ต้องจ่ายเงิน',
      },
      {
        id: 'sd4',
        text: '⏰ OPEN\nMON - SAT 9AM - 9PM\nCLOSED ON SUNDAYS',
        question: 'When is this shop closed?',
        options: ['On Sundays', 'On Mondays', 'Every evening', 'From 9AM to 9PM'],
        answer: 0,
        explanation: 'CLOSED ON SUNDAYS = ปิดวันอาทิตย์',
      },
      {
        id: 'sd5',
        text: '🔇 QUIET PLEASE\nEXAM IN PROGRESS',
        question: 'Why should people be quiet?',
        options: ['There is an exam happening.', 'The library is open.', 'A movie is playing.', 'It is night time.'],
        answer: 0,
        explanation: 'EXAM IN PROGRESS = กำลังสอบอยู่ → ต้องเงียบ',
      },
    ],
  },
];

// ── Chapter 3, Quest 14: Conversation Rescue ─────────────────
export const conversationRescueMissions = [
  {
    id: 'cr_match',
    questId: 'conversation_rescue',
    type: 'matching',
    title: '💬 Convo Match',
    subtitle: 'จับคู่ประโยคในบทสนทนา',
    xpReward: 30,
    techniqueCard: 'conversation',
    // จากโค้งหักศอก Part 1
    pairs: [
      { id: 'crm1', left: 'Nice to meet you.', right: 'Nice to meet you, too.', leftThai: 'ยินดีที่ได้รู้จัก' },
      { id: 'crm2', left: 'Do you need any help?', right: 'No, thank you.', leftThai: 'ต้องการความช่วยเหลือไหม' },
      { id: 'crm3', left: 'What\'s the matter?', right: 'I have a stomachache.', leftThai: 'เป็นอะไรไปหรือ' },
      { id: 'crm4', left: 'Can I borrow your pen?', right: 'Sure. Here you are.', leftThai: 'ขอยืมปากกาได้ไหม' },
      { id: 'crm5', left: 'Would you like some water?', right: 'Yes, please.', leftThai: 'ต้องการน้ำไหม' },
      { id: 'crm6', left: 'Excuse me, are you busy?', right: 'No, not at all.', leftThai: 'โทษนะ คุณยุ่งอยู่ไหม' },
      { id: 'crm7', left: 'Happy birthday!', right: 'Thank you so much!', leftThai: 'สุขสันต์วันเกิด' },
      { id: 'crm8', left: 'I\'m sorry I\'m late.', right: 'That\'s all right.', leftThai: 'ขอโทษที่มาสาย' },
    ],
  },
  {
    id: 'cr_flow',
    questId: 'conversation_rescue',
    type: 'conversation',
    title: '🚑 Rescue Flow',
    subtitle: 'เลือกคำตอบในบทสนทนาจาก Worksheet',
    xpReward: 50,
    techniqueCard: 'conversation',
    // จาก Worksheet P6: Greeting dialogs (Amy-Ann, Tom-Thomas, Mary-Betty)
    scenes: [
      {
        id: 'cr1',
        context: '🌅 พบกันตอนเช้าที่โรงเรียน',
        speaker: 'Amy',
        speakerEmoji: '👧',
        text: 'Good morning, Ann. How are you?',
        options: [
          "I'm fine, thank you. And you?",
          'Good evening, Amy.',
          'I like pizza.',
          'See you tomorrow.',
        ],
        correct: 0,
        explanation: "ตอบทักทาย + ถามกลับด้วย 'And you?'",
      },
      {
        id: 'cr2',
        context: '🤝 โทมัสแนะนำเพื่อนใหม่',
        speaker: 'Thomas',
        speakerEmoji: '👦',
        text: 'Tom, this is my friend, Tina.',
        options: [
          'Nice to meet you, Tina.',
          'What is your name?',
          'I\'m fine, thank you.',
          'Where are you from?',
        ],
        correct: 0,
        explanation: "เมื่อได้รับการแนะนำ → 'Nice to meet you'",
      },
      {
        id: 'cr3',
        context: '😅 Mary มาสายและขอโทษ',
        speaker: 'Mary',
        speakerEmoji: '👩',
        text: "I'm sorry I'm late. The traffic was bad.",
        options: [
          "That's all right.",
          'See you later.',
          'I am happy.',
          'What time is it?',
        ],
        correct: 0,
        explanation: "Sorry → That's all right (ไม่เป็นไร)",
      },
      {
        id: 'cr4',
        context: '🏫 ก่อนแยกกัน',
        speaker: 'Friend',
        speakerEmoji: '👦',
        text: 'See you tomorrow!',
        options: ['See you!', "I'm fine.", 'Yes, please.', 'Turn right.'],
        correct: 0,
        explanation: "See you → See you! / Take care! / Bye!",
      },
    ],
  },
];

// ── Chapter 3, Quest 15: Map Escape ──────────────────────────
export const mapEscapeMissions = [
  {
    id: 'me_rearrange',
    questId: 'map_escape',
    type: 'rearrange',
    title: '🗺️ Direction Rearrange',
    subtitle: 'เรียงประโยคบอกทาง',
    xpReward: 40,
    // จากเฉลยครู: Map dialog sentences
    wordSentences: [
      { id: 'mer1', words: ['Walk', 'along', 'East', 'Street.', 'It\'s', 'on', 'your', 'right.'], correct: "Walk along East Street. It's on your right." },
      { id: 'mer2', words: ['Turn', 'left', 'at', 'the', 'corner.', 'The', 'bank', 'is', 'opposite.'], correct: 'Turn left at the corner. The bank is opposite.' },
      { id: 'mer3', words: ['Go', 'straight', 'and', 'turn', 'right.', 'It\'s', 'next', 'to', 'the', 'school.'], correct: "Go straight and turn right. It's next to the school." },
      { id: 'mer4', words: ['The', 'hospital', 'is', 'between', 'the', 'bank', 'and', 'the', 'school.'], correct: 'The hospital is between the bank and the school.' },
    ],
  },
  {
    id: 'me_map',
    questId: 'map_escape',
    type: 'story_tap',
    title: '🗺️ Map Quest',
    subtitle: 'อ่านบทสนทนาถามทาง ตอบให้ถูก',
    xpReward: 50,
    passages: [
      {
        id: 'me1',
        text: 'Visitor: Excuse me. How do I get to the hospital?\nLocal: Walk along East Street. Turn left. It\'s on the ___.',
        question: 'เติมคำให้ถูก',
        options: ['right', 'left', 'corner', 'straight'],
        answer: 0,
        explanation: '"on your right" = ทางขวามือ',
      },
      {
        id: 'me2',
        text: 'A: Where is the cinema?\nB: It is ___ the hospital and the school.',
        question: 'เติมคำให้ถูก',
        options: ['between', 'behind', 'opposite', 'next to'],
        answer: 0,
        explanation: '"between X and Y" = ระหว่าง X กับ Y',
      },
      {
        id: 'me3',
        text: 'A: Is the post office far from here?\nB: No, it is ___ the school.',
        question: 'เติมคำให้ถูก',
        options: ['next to', 'between', 'behind', 'above'],
        answer: 0,
        explanation: '"next to" = ข้างๆ / ติดกับ',
      },
      {
        id: 'me4',
        text: 'A: How do I get to the airport?\nB: ___ along New Street. Turn right. The airport is on your left.',
        question: 'เติมคำให้ถูก',
        options: ['Go straight', 'Turn right', 'Walk back', 'Stop here'],
        answer: 0,
        explanation: '"Go straight" = ตรงไป',
      },
    ],
  },
];

// ── Chapter 3, Quest 16: Reading Detective ───────────────────
export const readingDetectiveMissions = [
  {
    id: 'rd_festival',
    questId: 'reading_detective',
    type: 'story_tap',
    title: '🎃 Festival Story',
    subtitle: 'อ่านเรื่องเทศกาล แล้วตอบคำถาม',
    xpReward: 40,
    techniqueCard: 'reading',
    // จาก Worksheet P6: Halloween passage
    storyText: "Halloween is celebrated on the 31st of October. People wear scary costumes and masks. Children go trick-or-treating from house to house. People put carved pumpkins called jack-o'-lanterns outside their homes. Halloween comes from an old Celtic tradition.",
    passages: [
      { id: 'rd1', question: 'When is Halloween?', options: ['October 31st', 'December 25th', 'October 13th', 'November 1st'], answer: 0, explanation: '"celebrated on the 31st of October"' },
      { id: 'rd2', question: 'What do children do on Halloween?', options: ['Go trick-or-treating', 'Watch movies', 'Eat cake', 'Play sports'], answer: 0, explanation: '"Children go trick-or-treating"' },
      { id: 'rd3', question: 'What is a jack-o\'-lantern?', options: ['A carved pumpkin', 'A costume', 'A mask', 'A candy'], answer: 0, explanation: '"carved pumpkins called jack-o\'-lanterns"' },
      { id: 'rd4', question: 'Where does Halloween come from?', options: ['Celtic tradition', 'American tradition', 'British tradition', 'Thai tradition'], answer: 0, explanation: '"comes from an old Celtic tradition"' },
    ],
  },
  {
    id: 'rd_sarah',
    questId: 'reading_detective',
    type: 'story_tap',
    title: '📖 Sarah\'s Story',
    subtitle: 'อ่านบทความ O-NET Style แล้วตอบ',
    xpReward: 50,
    techniqueCard: 'reading',
    // จากโค้งหักศอก: Sarah passage
    storyText: "Sarah is a Grade 9 student. She is fourteen years old. She wakes up at five thirty every morning. She goes to school by bus. Her school is about five kilometers from her house. She has three meals a day: breakfast at home, lunch at school, and dinner with her family. She loves reading books and playing the piano. She practices the piano for one hour every evening.",
    passages: [
      { id: 'rs1', question: 'How old is Sarah?', options: ['13', '14', '15', '16'], answer: 1, explanation: '"She is fourteen years old."' },
      { id: 'rs2', question: 'What time does Sarah wake up?', options: ['5:00', '5:30', '6:00', '6:30'], answer: 1, explanation: '"wakes up at five thirty"' },
      { id: 'rs3', question: 'How does Sarah go to school?', options: ['By bicycle', 'By car', 'By bus', 'On foot'], answer: 2, explanation: '"She goes to school by bus"' },
      { id: 'rs4', question: 'How far is her school from home?', options: ['3 km', '4 km', '5 km', '6 km'], answer: 2, explanation: '"about five kilometers from her house"' },
      { id: 'rs5', question: 'Where does Sarah have breakfast?', options: ['At school', 'At home', 'On the bus', 'At a restaurant'], answer: 1, explanation: '"breakfast at home"' },
      { id: 'rs6', question: 'What are Sarah\'s hobbies?', options: ['Reading and piano', 'Football and piano', 'Reading and singing', 'Cooking and painting'], answer: 0, explanation: '"loves reading books and playing the piano"' },
    ],
  },
];

// ── Chapter 3, Quest 17: Strategy Castle Boss ────────────────
export const strategyBossMissions = [
  {
    id: 'sb_rearrange',
    questId: 'strategy_boss',
    type: 'rearrange',
    title: '⚡ Sentence Rearrange',
    subtitle: 'เรียงประโยคจากโค้งหักศอก',
    xpReward: 40,
    techniqueCard: 'grammar',
    wordSentences: [
      { id: 'sr1', words: ['She', 'went', 'to', 'school', 'yesterday.'], correct: 'She went to school yesterday.' },
      { id: 'sr2', words: ['I', 'am', 'studying', 'English', 'now.'], correct: 'I am studying English now.' },
      { id: 'sr3', words: ['This', 'bag', 'is', 'bigger', 'than', 'that', 'one.'], correct: 'This bag is bigger than that one.' },
      { id: 'sr4', words: ['He', 'will', 'play', 'football', 'tomorrow.'], correct: 'He will play football tomorrow.' },
      { id: 'sr5', words: ['They', 'have', 'never', 'been', 'to', 'Japan.'], correct: 'They have never been to Japan.' },
    ],
  },
  {
    id: 'sb_ordering',
    questId: 'strategy_boss',
    type: 'rearrange',
    title: '📦 Event Ordering',
    subtitle: 'เรียงลำดับเหตุการณ์ (O-NET Part 5)',
    xpReward: 50,
    description: 'เรียงประโยคให้ได้ลำดับที่ถูกต้อง',
    techniqueHint: 'First/Then/Finally → หาคำบอกลำดับก่อนเสมอ',
    // จากโค้งหักศอก Part 5: Ordering
    sentences: [
      {
        id: 'sbo1',
        title: '🎫 Buying a Movie Ticket',
        steps: [
          { id: 'step1', text: 'First, he arrived at the cinema.' },
          { id: 'step2', text: 'Then, he asked for a ticket.' },
          { id: 'step3', text: 'Next, he paid for the ticket.' },
          { id: 'step4', text: 'After that, he got the ticket.' },
          { id: 'step5', text: 'Finally, he went into the cinema.' },
        ],
        correctOrder: ['step1', 'step2', 'step3', 'step4', 'step5'],
      },
      {
        id: 'sbo2',
        title: '☀️ Morning Routine',
        steps: [
          { id: 'step1', text: 'First, she woke up at 6 o\'clock.' },
          { id: 'step2', text: 'Then, she brushed her teeth.' },
          { id: 'step3', text: 'After that, she had breakfast.' },
          { id: 'step4', text: 'Next, she put on her uniform.' },
          { id: 'step5', text: 'Finally, she went to school.' },
        ],
        correctOrder: ['step1', 'step2', 'step3', 'step4', 'step5'],
      },
    ],
  },
];

export const CH3_MISSIONS = {
  question_words: questionWordsMissions,
  sign_detective: signDetectiveMissions,
  conversation_rescue: conversationRescueMissions,
  map_escape: mapEscapeMissions,
  reading_detective: readingDetectiveMissions,
  strategy_boss: strategyBossMissions,
};

export function getMissionsForQuest(questId) {
  return CH3_MISSIONS[questId] || [];
}
