import { getVocabularyAsset } from '../learningAssetPaths.js';

// ============================================================
// ch1_missions.js — Mission data สำหรับ Chapter 1 (7 Quests)
// ข้อมูลจาก: English Worksheet P6.pdf + เฉลยใบงานครู + สูตรลัด O-NET
// ============================================================

// ── Technique Cards (สูตรลัด O-NET) ─────────────────────────
export const TECHNIQUE_CARDS = {
  signs: {
    title: '🧠 เทคนิคพิชิต Signs',
    tips: [
      { icon: '✋', text: 'NO + V = ห้ามทำสิ่งนั้นเลย', example: 'No Parking = ห้ามจอด' },
      { icon: '🆓', text: 'FREE = ไม่ต้องจ่าย', example: 'Free WiFi = อินเทอร์เน็ตฟรี' },
      { icon: '⛔', text: 'ONLY = เฉพาะกลุ่มนั้น', example: 'Staff Only = เฉพาะพนักงาน' },
      { icon: '⏰', text: 'OPEN/CLOSED = ดูเวลา/วัน', example: 'Closed on Monday = ปิดวันจันทร์' },
      { icon: '➡️', text: 'ลูกศร = บอกทาง', example: 'Entrance → = ทางเข้า' },
    ],
    strategy: 'อ่านคำถามก่อน → มองหา Keyword → ตัดช้อยส์ผิดทันที',
  },
  conversation: {
    title: '🧠 เทคนิคพิชิต Conversation',
    tips: [
      { icon: '💬', text: 'How are you? → ตอบด้วยความรู้สึก', example: "I'm fine / Not bad / Pretty good" },
      { icon: '🙏', text: 'Thank you → ตอบ "ไม่เป็นไร"', example: "You're welcome / No problem" },
      { icon: '😔', text: 'Sorry → ตอบ "ไม่เป็นไร"', example: "That's OK / Never mind" },
      { icon: '🤝', text: 'Can I...? → ตอบ can/can\'t', example: 'Yes, you can / Sorry, you can\'t' },
      { icon: '👋', text: 'Goodbye → ลาตอบกลับ', example: 'See you / Bye / Take care' },
    ],
    strategy: 'จำเป็นคู่: Q → A pattern เสมอ',
  },
  grammar: {
    title: '🧠 เทคนิคพิชิต Grammar',
    tips: [
      { icon: '🕐', text: 'yesterday / last → V ช่อง 2', example: 'went, ate, saw' },
      { icon: '🔄', text: 'now / at the moment → V-ing', example: 'is going, are playing' },
      { icon: '📏', text: 'than → -er / more', example: 'bigger, more beautiful' },
      { icon: '💎', text: 'very → adjective เท่านั้น', example: 'very happy (not happily)' },
      { icon: '❌', text: "didn't → V ช่อง 1", example: "didn't go (not went)" },
    ],
    strategy: 'มองคำใบ้ก่อน → รู้รูปคำทันที',
  },
  reading: {
    title: '🧠 เทคนิคพิชิต Reading',
    tips: [
      { icon: '❓', text: 'Who → ชื่อคน / he / she', example: '' },
      { icon: '📍', text: 'Where → สถานที่', example: '' },
      { icon: '🕐', text: 'When → เวลา / วัน', example: '' },
      { icon: '🚗', text: 'How → by + พาหนะ', example: 'by bus, by motorcycle' },
      { icon: '💡', text: 'คำตอบอยู่ในประโยคเดียว ไม่ต้องอ่านทั้งบท', example: '' },
    ],
    strategy: 'สูตรทอง: Q → Scan → Answer',
  },
};

// ── Chapter 1, Quest 1: Vocabulary Village ────────────────────
export const vocabularyMissions = [
  {
    id: 'vocab_flip',
    questId: 'vocabulary',
    type: 'flashcard',
    title: '🃏 Vocab Flip',
    subtitle: 'พลิกการ์ดเรียนคำศัพท์ยานพาหนะ',
    xpReward: 30,
    description: 'พลิกการ์ดเพื่อดูคำแปล แล้วบอกว่าจำได้หรือยัง',
    cards: [
      ...[
        ['vf1', 'plane', 'เครื่องบิน', 'p_ane'], ['vf2', 'car', 'รถยนต์', 'c_r'],
        ['vf3', 'bus', 'รถบัส/รถเมล์', 'b_s'], ['vf4', 'van', 'รถตู้', 'v_n'],
        ['vf5', 'bicycle', 'รถจักรยาน', 'bi_y_le'], ['vf6', 'ship', 'เรือใหญ่', 'sh_p'],
        ['vf7', 'train', 'รถไฟ', 'tr_in'], ['vf8', 'taxi', 'แท็กซี่', 'ta_i'],
        ['vf9', 'boat', 'เรือเล็ก', 'bo_t'], ['vf10', 'motorcycle', 'รถจักรยานยนต์', 'mot_r_y_le'],
        ['vf11', 'ambulance', 'รถพยาบาล', 'am_ul_nce'], ['vf12', 'pick-up truck', 'รถกระบะ', 'p_ck-up'],
      ].map(([id, word, backThai, hint]) => ({
        id, frontLabel: word, back: word, backThai, hint, category: 'transport',
        image: getVocabularyAsset(word), imageAlt: word,
      })),
    ],
  },
  {
    id: 'vocab_match',
    questId: 'vocabulary',
    type: 'matching',
    title: '🔗 Place Match',
    subtitle: 'จับคู่สถานที่กับภาพ',
    xpReward: 30,
    description: 'แตะคำภาษาอังกฤษ แล้วแตะภาพที่ตรงกัน',
    pairs: [
      ...[
        ['vm1', 'hospital', 'โรงพยาบาล'], ['vm2', 'school', 'โรงเรียน'],
        ['vm3', 'bank', 'ธนาคาร'], ['vm4', 'airport', 'สนามบิน'],
        ['vm5', 'market', 'ตลาด'], ['vm6', 'restaurant', 'ร้านอาหาร'],
        ['vm7', 'cinema', 'โรงภาพยนตร์'], ['vm8', 'post office', 'ไปรษณีย์'],
      ].map(([id, left, leftThai]) => ({
        id, left, leftThai, right: left, image: getVocabularyAsset(left), imageAlt: left,
      })),
    ],
  },
  {
    id: 'vocab_pic_spell',
    questId: 'vocabulary',
    type: 'spell',
    title: '🧩 Pic & Spell',
    subtitle: 'ดูภาพแล้วเรียงตัวอักษรให้ถูกต้อง',
    xpReward: 40,
    items: [
      { id: 'ps1', image: getVocabularyAsset('bicycle'), imageAlt: 'bicycle', answer: 'bicycle', thai: 'รถจักรยาน' },
      { id: 'ps2', image: getVocabularyAsset('hospital'), imageAlt: 'hospital', answer: 'hospital', thai: 'โรงพยาบาล' },
      { id: 'ps3', image: getVocabularyAsset('airport'), imageAlt: 'airport', answer: 'airport', thai: 'สนามบิน' },
      { id: 'ps4', image: getVocabularyAsset('market'), imageAlt: 'market', answer: 'market', thai: 'ตลาด' },
    ]
  },
  {
    id: 'vocab_detective',
    questId: 'vocabulary',
    type: 'spell',
    title: '🕵️ Solo Detective',
    subtitle: 'อ่านคำใบ้แล้วทายคำศัพท์ให้ถูก',
    xpReward: 50,
    items: [
      { id: 'sd1', hints: ['It is a place.', 'You go there to study.', 'Teachers work here.'], answer: 'school', thai: 'โรงเรียน' },
      { id: 'sd2', hints: ['It is a vehicle.', 'It runs on tracks.', 'Choo choo!'], answer: 'train', thai: 'รถไฟ' },
      { id: 'sd3', hints: ['It is a place.', 'You go there when you are sick.', 'Doctors work here.'], answer: 'hospital', thai: 'โรงพยาบาล' },
    ]
  }
];

// ── Chapter 1, Quest 2: Signs City ────────────────────────────
export const signsMissions = [
  {
    id: 'signs_flip',
    questId: 'signs',
    type: 'flashcard',
    title: '🚦 Sign Decode',
    subtitle: 'เรียนรู้ความหมายป้ายสัญลักษณ์',
    xpReward: 30,
    techniqueCard: 'signs',
    cards: [
      { id: 'sf1', front: '🚫🅿️', frontLabel: 'NO PARKING', back: 'No Parking', backThai: 'ห้ามจอดรถ', hint: 'No = ห้าม' },
      { id: 'sf2', front: '↩️🚫', frontLabel: 'NO U-TURN', back: 'No U-turn', backThai: 'ห้ามกลับรถ', hint: 'No = ห้าม' },
      { id: 'sf3', front: '📢🚫', frontLabel: 'NO HORN', back: 'No Horn', backThai: 'ห้ามบีบแตร', hint: 'Horn = แตร' },
      { id: 'sf4', front: '🏫⚠️', frontLabel: 'SCHOOL ZONE', back: 'School Zone', backThai: 'เขตโรงเรียน', hint: 'Zone = เขต' },
      { id: 'sf5', front: '🚪🔥', frontLabel: 'FIRE EXIT', back: 'Fire Exit', backThai: 'ทางออกฉุกเฉิน', hint: 'Exit = ทางออก' },
      { id: 'sf6', front: '💧⚠️', frontLabel: 'WET FLOOR', back: 'Wet Floor', backThai: 'พื้นเปียก ระวังลื่น', hint: 'Wet = เปียก' },
      { id: 'sf7', front: '📷🚫', frontLabel: 'NO PHOTOGRAPHY', back: 'No Photography', backThai: 'ห้ามถ่ายรูป', hint: 'Photography = การถ่ายภาพ' },
      { id: 'sf8', front: '🐾🚫', frontLabel: 'NO PETS', back: 'No Pets Allowed', backThai: 'ห้ามนำสัตว์เลี้ยงเข้า', hint: 'Pets = สัตว์เลี้ยง' },
      { id: 'sf9', front: '🚻', frontLabel: 'TOILET', back: 'Toilet', backThai: 'ห้องน้ำ', hint: '' },
      { id: 'sf10', front: '🚦', frontLabel: 'TRAFFIC LIGHT', back: 'Traffic Light', backThai: 'สัญญาณไฟจราจร', hint: 'Traffic = จราจร' },
    ],
  },
  {
    id: 'signs_match',
    questId: 'signs',
    type: 'matching',
    title: '🔍 Symbol Sort',
    subtitle: 'จับคู่สัญลักษณ์กับความหมาย',
    xpReward: 30,
    techniqueCard: 'signs',
    pairs: [
      { id: 'sm1', left: 'First Aid', right: '🩺', leftThai: 'ปฐมพยาบาล' },
      { id: 'sm2', left: 'No Entry', right: '⛔', leftThai: 'ห้ามเข้า' },
      { id: 'sm3', left: 'No Smoking', right: '🚭', leftThai: 'ห้ามสูบบุหรี่' },
      { id: 'sm4', left: 'No Litter', right: '🗑️', leftThai: 'ห้ามทิ้งขยะ' },
      { id: 'sm5', left: 'Food Service', right: '🍽️', leftThai: 'บริการอาหาร' },
      { id: 'sm6', left: 'Bike Lane', right: '🚲', leftThai: 'เลนจักรยาน' },
      { id: 'sm7', left: 'Danger', right: '⚠️', leftThai: 'อันตราย' },
      { id: 'sm8', left: 'Keep Quiet', right: '🤫', leftThai: 'กรุณาเงียบ' },
    ],
  },
];

// ── Chapter 1, Quest 3: Direction Maze ────────────────────────
export const directionsMissions = [
  {
    id: 'dir_flip',
    questId: 'directions',
    type: 'flashcard',
    title: '🧭 Direction Flash',
    subtitle: 'จำคำบอกทิศทางและตำแหน่ง',
    xpReward: 30,
    cards: [
      { id: 'df1', front: '⬆️', frontLabel: 'go straight', back: 'Go straight', backThai: 'ตรงไป', hint: '' },
      { id: 'df2', front: '↰', frontLabel: 'turn left', back: 'Turn left', backThai: 'เลี้ยวซ้าย', hint: 'Left = ซ้าย' },
      { id: 'df3', front: '↱', frontLabel: 'turn right', back: 'Turn right', backThai: 'เลี้ยวขวา', hint: 'Right = ขวา' },
      { id: 'df4', front: '👈', frontLabel: 'on the left', back: 'On the left', backThai: 'ทางซ้ายมือ', hint: '' },
      { id: 'df5', front: '👉', frontLabel: 'on the right', back: 'On the right', backThai: 'ทางขวามือ', hint: '' },
      { id: 'df6', front: '↔️', frontLabel: 'next to', back: 'Next to', backThai: 'ข้างๆ / ติดกับ', hint: '' },
      { id: 'df7', front: '⟺', frontLabel: 'opposite', back: 'Opposite', backThai: 'ตรงข้าม', hint: '' },
      { id: 'df8', front: '↕️', frontLabel: 'between', back: 'Between', backThai: 'ระหว่าง', hint: 'ต้องมี 2 สิ่ง' },
      { id: 'df9', front: '📍', frontLabel: 'near', back: 'Near', backThai: 'ใกล้', hint: 'Near ↔ Far' },
      { id: 'df10', front: '🔙', frontLabel: 'behind', back: 'Behind', backThai: 'ด้านหลัง', hint: '' },
      { id: 'df11', front: '🔄', frontLabel: 'on the corner', back: 'On the corner', backThai: 'ที่มุม', hint: '' },
      { id: 'df12', front: '⬛', frontLabel: 'in front of', back: 'In front of', backThai: 'ด้านหน้า', hint: '' },
    ],
  },
  {
    id: 'dir_story',
    questId: 'directions',
    type: 'story_tap',
    title: '🗺️ Map Dialog',
    subtitle: 'อ่านบทสนทนาถามทาง แตะคำตอบที่ถูก',
    xpReward: 30,
    // บทสนทนาจากเฉลยครู Asking for Directions
    passages: [
      {
        id: 'dt1',
        text: 'A: How do I get to the hospital?\nB: Walk along East Street. It\'s ___ your right.',
        question: 'เติมคำให้ถูกต้อง',
        options: ['on', 'in', 'at', 'by'],
        answer: 0,
        explanation: '"on your right" = ทางขวามือของคุณ',
      },
      {
        id: 'dt2',
        text: 'A: Could you tell me how to get to the coffee shop?\nB: Go ___ East Street. Turn left. It\'s on the corner.',
        question: 'เติมคำให้ถูกต้อง',
        options: ['straight', 'left', 'right', 'back'],
        answer: 0,
        explanation: '"Go straight" = ตรงไป',
      },
      {
        id: 'dt3',
        text: 'A: Where is the airport?\nB: It is ___ the cinema and the greengrocer\'s.',
        question: 'เติมคำให้ถูกต้อง',
        options: ['between', 'next to', 'opposite', 'behind'],
        answer: 0,
        explanation: '"between" = ระหว่าง (มี 2 สิ่งขนาบ)',
      },
      {
        id: 'dt4',
        text: 'A: How can I get to the greengrocer\'s?\nB: Go straight. Turn ___. Walk along New Street. It\'s next to the airport.',
        question: 'เติมคำให้ถูกต้อง',
        options: ['right', 'left', 'straight', 'back'],
        answer: 0,
        explanation: '"Turn right" = เลี้ยวขวา',
      },
      {
        id: 'dt5',
        text: 'A: Where is the post office?\nB: It is ___ to the hospital.',
        question: 'เติมคำให้ถูกต้อง',
        options: ['next', 'near', 'between', 'opposite'],
        answer: 0,
        explanation: '"next to" = ติดกับ/ข้างๆ',
      },
    ],
  },
];

// ── Chapter 1, Quest 4: Market Quest ─────────────────────────
export const marketMissions = [
  {
    id: 'market_fill',
    questId: 'market',
    type: 'fill_blank',
    title: '💰 Price Fill',
    subtitle: 'เติมราคาเป็นภาษาอังกฤษ',
    xpReward: 30,
    questions: [
      { id: 'mf1', sentence: 'Jenny: How much is it?\nEmmy: It\'s ___ and fifty baht.', blank: '___ and fifty baht', options: ['one hundred', 'two hundred', 'three hundred', 'fifty'], answer: 0, answerThai: '150 บาท', hint: '100 = one hundred' },
      { id: 'mf2', sentence: 'Jenny: How much is it?\nEmmy: It\'s two hundred and ___ baht.', blank: 'two hundred and ___', options: ['twenty', 'thirty', 'forty', 'fifty'], answer: 0, answerThai: '220 บาท', hint: '20 = twenty' },
      { id: 'mf3', sentence: 'Jenny: How much is it?\nEmmy: It\'s ___ baht.', blank: '___ baht', options: ['seventy-five', 'fifty-seven', 'sixty-five', 'eighty-five'], answer: 0, answerThai: '75 บาท', hint: '75 = seventy-five' },
      { id: 'mf4', sentence: 'A: Can I help you?\nB: Yes, please. I\'m looking for a ___.', blank: 'I\'m looking for a ___', options: ['skirt', 'hungry', 'good morning', 'happy'], answer: 0, answerThai: 'กระโปรง', hint: 'skirt = กระโปรง' },
      { id: 'mf5', sentence: 'A: What color do you like?\nB: ___, please.', blank: '___, please', options: ['Red', 'Walk', 'Yes', 'Fine'], answer: 0, answerThai: 'สีแดง', hint: 'สีก่อน please' },
    ],
  },
  {
    id: 'market_convo',
    questId: 'market',
    type: 'conversation',
    title: '🛒 Shop Convo',
    subtitle: 'สนทนาในร้านค้า เลือกคำตอบที่ถูกต้อง',
    xpReward: 40,
    // จากเฉลยครู: Shopping dialog
    scenes: [
      {
        id: 'mc1',
        context: '🛍️ คุณเข้าไปในร้านเสื้อผ้า',
        speaker: 'Jane',
        speakerEmoji: '👩‍💼',
        text: 'Can I help you?',
        options: ['Yes, please. I\'m looking for a skirt.', 'I am hungry.', 'Good morning, Jane.', 'Thank you very much.'],
        correct: 0,
        explanation: 'ตอบรับการช่วยเหลือ + บอกสิ่งที่ต้องการ',
      },
      {
        id: 'mc2',
        context: '👗 Jane กำลังช่วยเลือกสี',
        speaker: 'Jane',
        speakerEmoji: '👩‍💼',
        text: 'What color do you like?',
        options: ['Red, please.', 'I like school.', 'Very big.', 'Yes, I do.'],
        correct: 0,
        explanation: 'ตอบสีที่ต้องการ + please (สุภาพ)',
      },
      {
        id: 'mc3',
        context: '💰 ตอนนี้ถามราคา',
        speaker: 'You',
        speakerEmoji: '🧑',
        text: 'How much is it?',
        options: ['It\'s two hundred baht.', 'I go to school.', 'He is tall.', 'Thank you, Jane.'],
        correct: 0,
        explanation: "How much is it? → It's ___ baht.",
      },
      {
        id: 'mc4',
        context: '💳 จ่ายเงิน',
        speaker: 'Jane',
        speakerEmoji: '👩‍💼',
        text: 'Here you are. That\'s two hundred baht.',
        options: ['Here you are.', 'See you tomorrow.', 'I don\'t know.', 'Where is the toilet?'],
        correct: 0,
        explanation: '"Here you are" = นี่ไง (ยื่นให้)',
      },
    ],
  },
];

// ── Chapter 1, Quest 5: Conversation Café ─────────────────────
export const conversationMissions = [
  {
    id: 'convo_flip',
    questId: 'conversation',
    type: 'flashcard',
    title: '💬 Greeting Flash',
    subtitle: 'เรียนคำทักทายและการตอบรับ',
    xpReward: 30,
    techniqueCard: 'conversation',
    cards: [
      { id: 'cf1', front: 'How are you?', frontLabel: '', back: "I'm fine, thanks.", backThai: 'ฉันสบายดีขอบคุณ', hint: 'How → ตอบความรู้สึก' },
      { id: 'cf2', front: 'Thank you!', frontLabel: '', back: "You're welcome.", backThai: 'ยินดี / ไม่เป็นไร', hint: 'Thank → welcome' },
      { id: 'cf3', front: "I'm sorry.", frontLabel: '', back: "That's OK.", backThai: 'ไม่เป็นไร', hint: "Sorry → That's OK" },
      { id: 'cf4', front: 'Can you help me?', frontLabel: '', back: 'Sure! / No problem.', backThai: 'ได้เลย / ไม่มีปัญหา', hint: 'Help → Sure / can\'t' },
      { id: 'cf5', front: 'Nice to meet you.', frontLabel: '', back: 'Nice to meet you, too.', backThai: 'ยินดีที่ได้รู้จักเช่นกัน', hint: 'ต้องใส่ "too"!' },
      { id: 'cf6', front: 'Goodbye!', frontLabel: '', back: 'See you! / Take care.', backThai: 'แล้วเจอกัน / ดูแลตัวด้วย', hint: 'Goodbye → See you' },
      { id: 'cf7', front: 'Would you like some coffee?', frontLabel: '', back: 'Yes, please. / No, thanks.', backThai: 'ใช่เลย / ไม่ขอบคุณ', hint: 'Would you like → Yes/No' },
      { id: 'cf8', front: "Can I use your pen?", frontLabel: '', back: 'Sure. / Sorry, I need it.', backThai: 'ได้เลย / ขอโทษ ฉันต้องใช้', hint: 'Can I → ขออนุญาต' },
    ],
  },
  {
    id: 'convo_match',
    questId: 'conversation',
    type: 'matching',
    title: '🔗 Response Match',
    subtitle: 'จับคู่ประโยคถามกับคำตอบที่เหมาะสม',
    xpReward: 30,
    techniqueCard: 'conversation',
    // จาก Worksheet: Greeting dialogs (Tony-Anne, Amy-Ann, Mary-Betty)
    pairs: [
      { id: 'cm1', left: 'Good morning.', right: 'Good morning!', leftThai: 'สวัสดีตอนเช้า' },
      { id: 'cm2', left: 'How are you?', right: "I'm fine, thank you.", leftThai: 'คุณสบายดีไหม' },
      { id: 'cm3', left: 'Nice to meet you.', right: 'Nice to meet you, too.', leftThai: 'ยินดีที่ได้รู้จัก' },
      { id: 'cm4', left: 'Thank you.', right: "You're welcome.", leftThai: 'ขอบคุณ' },
      { id: 'cm5', left: "I'm sorry I'm late.", right: "That's OK.", leftThai: 'ขอโทษที่มาสาย' },
      { id: 'cm6', left: 'Can you help me?', right: 'Sure!', leftThai: 'ช่วยได้ไหม' },
      { id: 'cm7', left: 'Goodbye!', right: 'See you!', leftThai: 'ลาก่อน' },
      { id: 'cm8', left: 'Do you need any help?', right: 'No, thank you.', leftThai: 'ต้องการความช่วยเหลือไหม' },
    ],
  },
  {
    id: 'convo_voice',
    questId: 'conversation',
    type: 'voice',
    title: '🎤 AI Roleplay',
    subtitle: 'กดไมค์เพื่อฝึกพูดตอบโต้อย่างมั่นใจ',
    xpReward: 50,
    sentences: [
      { id: 'cv1', context: 'ครูพูดว่า "Good morning. How are you?" คุณจะตอบว่าอย่างไร?', text: 'I am fine thank you', thai: 'ฉันสบายดี ขอบคุณ' },
      { id: 'cv2', context: 'เพื่อนพูดว่า "Thank you." คุณจะตอบว่าอย่างไร?', text: 'you are welcome', thai: 'ด้วยความยินดี' },
      { id: 'cv3', context: 'คุณเดินชนเพื่อน คุณจะพูดว่าอย่างไร?', text: 'I am sorry', thai: 'ฉันขอโทษ' },
      { id: 'cv4', context: 'เพื่อนพูดว่า "Nice to meet you." คุณจะตอบว่าอย่างไร?', text: 'nice to meet you too', thai: 'ยินดีที่ได้รู้จักเช่นกัน' },
    ]
  }
];

// ── Chapter 1, Quest 6: Reading Dungeon ───────────────────────
export const readingMissions = [
  {
    id: 'reading_wh',
    questId: 'reading',
    type: 'flashcard',
    title: '❓ WH Flash',
    subtitle: 'จำ WH-Questions และสิ่งที่ถาม',
    xpReward: 30,
    techniqueCard: 'reading',
    // จาก Worksheet P6: Question Words
    cards: [
      { id: 'rf1', front: 'What', frontLabel: '', back: 'What = อะไร', backThai: 'ถามสิ่งของ / อาชีพ / เวลา', hint: '' },
      { id: 'rf2', front: 'Where', frontLabel: '', back: 'Where = ที่ไหน', backThai: 'ถามสถานที่', hint: '' },
      { id: 'rf3', front: 'When', frontLabel: '', back: 'When = เมื่อไหร่', backThai: 'ถามเวลา/วัน', hint: '' },
      { id: 'rf4', front: 'Who', frontLabel: '', back: 'Who = ใคร', backThai: 'ถามบุคคล', hint: '' },
      { id: 'rf5', front: 'Why', frontLabel: '', back: 'Why = ทำไม', backThai: 'ถามเหตุผล → Because...', hint: '' },
      { id: 'rf6', front: 'How', frontLabel: '', back: 'How = อย่างไร', backThai: 'ถามวิธี/วิธีการ', hint: '' },
      { id: 'rf7', front: 'Whose', frontLabel: '', back: 'Whose = ของใคร', backThai: 'ถามความเป็นเจ้าของ', hint: '' },
      { id: 'rf8', front: 'How many', frontLabel: '', back: 'How many = กี่', backThai: 'ถามจำนวน (นับได้)', hint: '' },
      { id: 'rf9', front: 'How much', frontLabel: '', back: 'How much = เท่าไหร่', backThai: 'ถามราคา / นับไม่ได้', hint: '' },
      { id: 'rf10', front: 'How often', frontLabel: '', back: 'How often = บ่อยแค่ไหน', backThai: 'ถามความถี่', hint: '' },
    ],
  },
  {
    id: 'reading_alice',
    questId: 'reading',
    type: 'story_tap',
    title: '📖 Alice\'s Story',
    subtitle: 'อ่านบทความแล้วตอบคำถาม',
    xpReward: 40,
    techniqueCard: 'reading',
    // จาก Worksheet P6: Alice passage
    storyText: 'Alice is a girl. She is twelve years old. She gets up early and sets up her bed every day. After school, she helps her teacher to clean the classroom. Her parents take her home by motorcycle. At home, she does her homework and helps her parents after dinner.',
    passages: [
      { id: 'ra1', question: 'Who is Alice?', options: ['A teacher', 'A girl student', 'A doctor', 'A driver'], answer: 1, explanation: 'ประโยคแรก: "Alice is a girl" → she is a girl (student)' },
      { id: 'ra2', question: 'How old is Alice?', options: ['Ten', 'Eleven', 'Twelve', 'Thirteen'], answer: 2, explanation: '"She is twelve years old."' },
      { id: 'ra3', question: 'What does she do after school?', options: ['Erase the board', 'Clean the classroom', 'Tidy the room', 'Talk to the teacher'], answer: 1, explanation: '"she helps her teacher to clean the classroom"' },
      { id: 'ra4', question: 'How does she go home?', options: ['By bicycle', 'By motorcycle', 'By car', 'On foot'], answer: 1, explanation: '"Her parents take her home by motorcycle"' },
      { id: 'ra5', question: 'When does she do her homework?', options: ['In the morning', 'After lunch', 'In the afternoon', 'After dinner'], answer: 3, explanation: '"she does her homework ... after dinner"' },
    ],
  },
];

// ── Chapter 1, Quest 7: Grammar Boss ─────────────────────────
export const grammarMissions = [
  {
    id: 'grammar_flip',
    questId: 'grammar',
    type: 'flashcard',
    title: '⚡ Grammar Flash',
    subtitle: 'คำใบ้ → รูปกริยาที่ถูกต้อง',
    xpReward: 30,
    techniqueCard: 'grammar',
    // จากสูตรลัด O-NET Part 4: Grammar Keywords
    cards: [
      { id: 'gf1', front: 'yesterday / last', frontLabel: '', back: 'V ช่อง 2', backThai: 'went, ate, saw, played', hint: 'อดีต = ช่อง 2' },
      { id: 'gf2', front: 'now / at the moment', frontLabel: '', back: 'am/is/are + V-ing', backThai: 'is going, are playing', hint: 'กำลัง = Ving' },
      { id: 'gf3', front: 'tomorrow / next week', frontLabel: '', back: 'will + V ช่อง 1', backThai: 'will go, will eat', hint: 'อนาคต = will' },
      { id: 'gf4', front: 'than', frontLabel: '', back: '-er / more', backThai: 'bigger, more beautiful', hint: 'เปรียบเทียบ = -er' },
      { id: 'gf5', front: 'very', frontLabel: '', back: 'adjective เท่านั้น', backThai: 'very happy (ไม่ใช่ happily)', hint: 'very → adj' },
      { id: 'gf6', front: 'many / few', frontLabel: '', back: 'นับได้ (plural)', backThai: 'many books, few students', hint: 'นับได้ = many' },
      { id: 'gf7', front: 'much / little', frontLabel: '', back: 'นับไม่ได้', backThai: 'much water, little sugar', hint: 'นับไม่ได้ = much' },
      { id: 'gf8', front: "he / she / it", frontLabel: '', back: 'V + -s', backThai: 'goes, plays, runs', hint: 'เอกพจน์ = +s' },
      { id: 'gf9', front: "didn't", frontLabel: '', back: 'V ช่อง 1 เท่านั้น', backThai: "didn't go (ไม่ใช่ went)", hint: "didn't → V1" },
      { id: 'gf10', front: 'can / could', frontLabel: '', back: 'V ช่อง 1 เท่านั้น', backThai: 'can go, can play', hint: 'Modal → V1' },
    ],
  },
  {
    id: 'grammar_pronoun',
    questId: 'grammar',
    type: 'fill_blank',
    title: '👥 Pronoun Fill',
    subtitle: 'เติม Possessive Adjective ให้ถูกต้อง',
    xpReward: 40,
    // จาก Worksheet P6: Pronoun exercises
    questions: [
      { id: 'gp1', sentence: 'I do ___ homework every evening.', options: ['my', 'your', 'his', 'their'], answer: 0, answerThai: 'my = ของฉัน', hint: 'I → my' },
      { id: 'gp2', sentence: 'We clean ___ classroom.', options: ['our', 'my', 'her', 'their'], answer: 0, answerThai: 'our = ของพวกเรา', hint: 'We → our' },
      { id: 'gp3', sentence: 'He plays with ___ dogs.', options: ['his', 'her', 'its', 'my'], answer: 0, answerThai: 'his = ของเขา', hint: 'He → his' },
      { id: 'gp4', sentence: 'A monkey usually eats ___ bananas.', options: ['its', 'her', 'his', 'their'], answer: 0, answerThai: 'its = ของมัน', hint: 'สัตว์ → its' },
      { id: 'gp5', sentence: 'This is an elephant. ___ ears are big.', options: ['Its', 'His', 'Her', 'My'], answer: 0, answerThai: 'Its = ของมัน', hint: 'สัตว์ → Its' },
      { id: 'gp6', sentence: 'Tom and Thomas play with ___ toys.', options: ['their', 'our', 'his', 'its'], answer: 0, answerThai: 'their = ของพวกเขา', hint: 'คนหลายคน → their' },
      { id: 'gp7', sentence: 'She always looks at ___ in the mirror.', options: ['herself', 'himself', 'myself', 'itself'], answer: 0, answerThai: 'herself (Reflexive)', hint: 'She → herself' },
      { id: 'gp8', sentence: 'Alice has a rabbit. The rabbit is ___.', options: ['hers', 'her', 'his', 'mine'], answer: 0, answerThai: "hers = ของหล่อน (Possessive Pronoun)", hint: 'She → hers (ไม่มีคำนามตาม)' },
    ],
  },
  {
    id: 'grammar_builder',
    questId: 'grammar',
    type: 'rearrange',
    title: '🧩 Sentence Builder',
    subtitle: 'เรียงประโยคให้ถูกต้องตามหลักไวยากรณ์',
    xpReward: 50,
    techniqueHint: 'ประโยคภาษาอังกฤษมักเริ่มด้วย Subject + Verb + Object เสมอ',
    wordSentences: [
      { id: 'gb1', words: ['school', 'to', 'went', 'I', 'yesterday'], correct: 'I went to school yesterday' },
      { id: 'gb2', words: ['playing', 'is', 'He', 'football', 'now'], correct: 'He is playing football now' },
      { id: 'gb3', words: ['do', 'Where', 'you', 'live'], correct: 'Where do you live' },
      { id: 'gb4', words: ['an', 'apple', 'ate', 'She'], correct: 'She ate an apple' }
    ]
  }
];

// ── Chapter 1 foundation quests used by the current Quest Map ───────────────
export const aboutMissions = [
  {
    id: 'about_profile_flip', questId: 'about_myself', type: 'flashcard',
    title: 'Profile Words', subtitle: 'เรียนรู้คำสำคัญสำหรับแนะนำตัว', xpReward: 30,
    cards: [
      { id: 'apf1', front: 'name', frontLabel: 'name', back: 'name', backThai: 'ชื่อ', hint: 'My name is ...', image: '/learning/profile/name-v1.png', imageAlt: 'นักเรียนชี้ช่องชื่อว่างบนป้ายชื่อของตน' },
      { id: 'apf2', front: 'age', frontLabel: 'age', back: 'age', backThai: 'อายุ', hint: 'I am eleven years old.', image: '/learning/profile/age-v1.png', imageAlt: 'นักเรียนนับเทียนบนเค้กวันเกิดเพื่อบอกอายุ' },
      { id: 'apf3', front: 'hobby', frontLabel: 'hobby', back: 'hobby', backThai: 'งานอดิเรก', hint: 'My hobby is drawing.', image: '/learning/profile/hobby-v1.png', imageAlt: 'นักเรียนกำลังวาดภาพเป็นงานอดิเรก' },
      { id: 'apf4', front: 'favourite', frontLabel: 'favourite', back: 'favourite', backThai: 'ที่ชื่นชอบ', hint: 'My favourite subject is English.', image: '/learning/profile/favourite-v1.png', imageAlt: 'นักเรียนกอดหนังสือเล่มโปรดพร้อมสัญลักษณ์หัวใจและดาว' },
      { id: 'apf5', front: 'live', frontLabel: 'live', back: 'live', backThai: 'อาศัยอยู่', hint: 'I live in Bangkok.', image: '/learning/profile/live-v1.png', imageAlt: 'นักเรียนชี้ไปยังบ้านที่ตนอาศัยอยู่' },
      { id: 'apf6', front: 'student', frontLabel: 'student', back: 'student', backThai: 'นักเรียน', hint: 'I am a student.', image: '/learning/profile/student-v1.png', imageAlt: 'นักเรียนในชุดนักเรียนสะพายกระเป๋าและถือหนังสือ' },
    ],
  },
  {
    id: 'about_intro_fill', questId: 'about_myself', type: 'fill_blank',
    title: 'Introduce Yourself', subtitle: 'เติมบทแนะนำตัวให้สมบูรณ์', xpReward: 40,
    questions: [
      { id: 'aif1', sentence: 'My ___ is Nida.', blank: 'My ___ is Nida.', options: ['name', 'age', 'school', 'hobby'], answer: 0, answerThai: 'ฉันชื่อนิดา', hint: 'ใช้บอกชื่อ' },
      { id: 'aif2', sentence: 'I am eleven years ___.', blank: 'eleven years ___', options: ['old', 'live', 'name', 'class'], answer: 0, answerThai: 'ฉันอายุสิบเอ็ดปี', hint: 'years old' },
      { id: 'aif3', sentence: 'I ___ in Chiang Mai.', blank: 'I ___ in Chiang Mai.', options: ['live', 'like', 'play', 'study'], answer: 0, answerThai: 'ฉันอาศัยอยู่เชียงใหม่', hint: 'บอกที่อยู่อาศัย' },
      { id: 'aif4', sentence: 'My hobby is ___ books.', blank: 'My hobby is ___ books.', options: ['reading', 'read', 'reads', 'reader'], answer: 0, answerThai: 'งานอดิเรกของฉันคืออ่านหนังสือ', hint: 'is + V-ing' },
    ],
  },
  {
    id: 'about_sentence_builder', questId: 'about_myself', type: 'rearrange',
    title: 'Profile Builder', subtitle: 'เรียงประโยคแนะนำตัวให้ถูกต้อง', xpReward: 50,
    wordSentences: [
      { id: 'asb1', words: ['name', 'My', 'is', 'Pim'], correct: 'My name is Pim' },
      { id: 'asb2', words: ['years', 'I', 'am', 'old', 'twelve'], correct: 'I am twelve years old' },
      { id: 'asb3', words: ['favourite', 'English', 'is', 'subject', 'My'], correct: 'My favourite subject is English' },
      { id: 'asb4', words: ['football', 'after', 'I', 'school', 'play'], correct: 'I play football after school' },
    ],
  },
];

export const familyMissions = [
  {
    id: 'family_relation_flip', questId: 'family', type: 'flashcard',
    title: 'Family Words', subtitle: 'เรียนรู้คำเรียกสมาชิกในครอบครัว', xpReward: 30,
    cards: [
      { id: 'frf1', front: 'parents', frontLabel: 'parents', back: 'parents', backThai: 'พ่อและแม่', hint: 'father + mother', image: '/assessment/quest-scenes/family-parents-v1.webp', imageAlt: 'พ่อและแม่ยืนอยู่กับลูกสองคนในบ้าน' },
      { id: 'frf2', front: 'grandparents', frontLabel: 'grandparents', back: 'grandparents', backThai: 'ปู่ย่าตายาย', hint: 'parents of your parents', image: '/learning/family/grandparents-v1.png', imageAlt: 'คุณตาคุณยายหรือคุณปู่คุณย่ายืนยิ้มอยู่ด้วยกัน' },
      { id: 'frf3', front: 'brother', frontLabel: 'brother', back: 'brother', backThai: 'พี่ชายหรือน้องชาย', hint: 'male sibling', image: '/learning/family/brother-v1.png', imageAlt: 'เด็กผู้หญิงชี้ไปยังพี่ชายหรือน้องชายของตน' },
      { id: 'frf4', front: 'sister', frontLabel: 'sister', back: 'sister', backThai: 'พี่สาวหรือน้องสาว', hint: 'female sibling', image: '/learning/family/sister-v1.png', imageAlt: 'เด็กผู้ชายชี้ไปยังพี่สาวหรือน้องสาวของตน' },
      { id: 'frf5', front: 'uncle', frontLabel: 'uncle', back: 'uncle', backThai: 'ลุงหรือน้าอา', hint: 'male relative', image: '/learning/family/uncle-v1.png', imageAlt: 'เด็กชี้ไปยังลุงหรือน้าอาผู้ชายที่กำลังโบกมือ' },
      { id: 'frf6', front: 'aunt', frontLabel: 'aunt', back: 'aunt', backThai: 'ป้าหรือน้าอา', hint: 'female relative', image: '/learning/family/aunt-v1.png', imageAlt: 'เด็กชี้ไปยังป้าหรือน้าอาผู้หญิงที่กำลังโบกมือ' },
    ],
  },
  {
    id: 'family_relation_match', questId: 'family', type: 'matching',
    title: 'Family Match', subtitle: 'จับคู่ความสัมพันธ์ในครอบครัว', xpReward: 40,
    pairs: [
      { id: 'frm1', left: "father's father", leftThai: 'พ่อของพ่อ', right: 'grandfather' },
      { id: 'frm2', left: "mother's sister", leftThai: 'พี่สาวหรือน้องสาวของแม่', right: 'aunt' },
      { id: 'frm3', left: "father's brother", leftThai: 'พี่ชายหรือน้องชายของพ่อ', right: 'uncle' },
      { id: 'frm4', left: "uncle's child", leftThai: 'ลูกของลุง', right: 'cousin' },
    ],
  },
  {
    id: 'family_pronoun_fill', questId: 'family', type: 'fill_blank',
    title: 'Family Pronouns', subtitle: 'เลือกคำสรรพนามให้ตรงกับสมาชิกครอบครัว', xpReward: 50,
    questions: [
      { id: 'fpf1', sentence: 'My mother is a nurse. ___ works at a hospital.', blank: '___ works', options: ['She', 'He', 'It', 'They'], answer: 0, answerThai: 'เธอทำงานที่โรงพยาบาล', hint: 'mother = she' },
      { id: 'fpf2', sentence: 'Tom and Tim are brothers. ___ play football together.', blank: '___ play', options: ['They', 'He', 'She', 'It'], answer: 0, answerThai: 'พวกเขาเล่นฟุตบอลด้วยกัน', hint: 'สองคน = they' },
      { id: 'fpf3', sentence: 'This is my father. ___ name is Somchai.', blank: '___ name', options: ['His', 'Her', 'Their', 'Its'], answer: 0, answerThai: 'ชื่อของเขาคือสมชาย', hint: 'father = his' },
      { id: 'fpf4', sentence: 'We love ___ grandparents.', blank: '___ grandparents', options: ['our', 'his', 'her', 'its'], answer: 0, answerThai: 'พวกเรารักปู่ย่าตายายของเรา', hint: 'we = our' },
    ],
  },
];

export const schoolMissions = [
  {
    id: 'school_object_flip', questId: 'school', type: 'flashcard',
    title: 'Classroom Words', subtitle: 'เรียนรู้สิ่งของและสถานที่ในโรงเรียน', xpReward: 30,
    cards: [
      { id: 'sof1', front: 'library', frontLabel: 'library', back: 'library', backThai: 'ห้องสมุด', hint: 'a place for books', image: '/learning/classroom/library-v1.png', imageAlt: 'นักเรียนอ่านหนังสือในห้องสมุดที่มีชั้นหนังสือหลายชั้น' },
      { id: 'sof2', front: 'canteen', frontLabel: 'canteen', back: 'canteen', backThai: 'โรงอาหาร', hint: 'a place to eat lunch', image: '/learning/classroom/canteen-v1.png', imageAlt: 'นักเรียนถือถาดอาหารอยู่ในโรงอาหารของโรงเรียน' },
      { id: 'sof3', front: 'playground', frontLabel: 'playground', back: 'playground', backThai: 'สนามเด็กเล่น', hint: 'a place to play', image: '/learning/classroom/playground-v1.png', imageAlt: 'เด็กเล่นชิงช้าและกระดานลื่นในสนามเด็กเล่น' },
      { id: 'sof4', front: 'ruler', frontLabel: 'ruler', back: 'ruler', backThai: 'ไม้บรรทัด', hint: 'used to measure', image: '/learning/classroom/ruler-v1.png', imageAlt: 'ไม้บรรทัดสีเหลืองวางอยู่ข้างดินสอ' },
      { id: 'sof5', front: 'eraser', frontLabel: 'eraser', back: 'eraser', backThai: 'ยางลบ', hint: 'used to remove pencil marks', image: '/learning/classroom/eraser-v1.png', imageAlt: 'ยางลบกำลังลบรอยดินสอบนกระดาษ' },
      { id: 'sof6', front: 'notebook', frontLabel: 'notebook', back: 'notebook', backThai: 'สมุด', hint: 'used for writing notes', image: '/learning/classroom/notebook-v1.png', imageAlt: 'สมุดสันห่วงเปิดหน้ากระดาษว่างพร้อมดินสอ' },
    ],
  },
  {
    id: 'school_place_match', questId: 'school', type: 'matching',
    title: 'School Place Match', subtitle: 'จับคู่สถานที่กับกิจกรรม', xpReward: 40,
    pairs: [
      { id: 'spm1', left: 'borrow a book', leftThai: 'ยืมหนังสือ', right: 'library' },
      { id: 'spm2', left: 'eat lunch', leftThai: 'รับประทานอาหารกลางวัน', right: 'canteen' },
      { id: 'spm3', left: 'play basketball', leftThai: 'เล่นบาสเกตบอล', right: 'gym' },
      { id: 'spm4', left: 'study science', leftThai: 'เรียนวิทยาศาสตร์', right: 'laboratory' },
    ],
  },
  {
    id: 'school_notice_fill', questId: 'school', type: 'fill_blank',
    title: 'School Notice', subtitle: 'อ่านสถานการณ์และเติมคำให้ถูกต้อง', xpReward: 50,
    questions: [
      { id: 'snf1', sentence: 'LIBRARY CLOSED ON ___.', blank: 'CLOSED ON ___', options: ['Friday', 'desk', 'book', 'quiet'], answer: 0, answerThai: 'ห้องสมุดปิดวันศุกร์', hint: 'ต้องเป็นวันในสัปดาห์' },
      { id: 'snf2', sentence: 'Please be ___ in the library.', blank: 'be ___', options: ['quiet', 'hungry', 'late', 'fast'], answer: 0, answerThai: 'กรุณาเงียบในห้องสมุด', hint: 'library rule' },
      { id: 'snf3', sentence: 'Students must wear their school ___.', blank: 'school ___', options: ['uniform', 'lunch', 'lesson', 'library'], answer: 0, answerThai: 'นักเรียนต้องสวมชุดนักเรียน', hint: 'สิ่งที่สวมใส่' },
      { id: 'snf4', sentence: 'Put your books on the ___.', blank: 'on the ___', options: ['desk', 'teacher', 'class', 'subject'], answer: 0, answerThai: 'วางหนังสือบนโต๊ะ', hint: 'classroom furniture' },
    ],
  },
];

// ── Ten-round content pack ────────────────────────────────────────────────
// Every Chapter 1 game is intentionally ten rounds long. These additions keep
// the original missions and UI intact while completing the shorter data sets.
const TEN_ROUND_ADDITIONS = {
  vocab_match: [
    { id: 'vm9', left: 'library', leftThai: 'ห้องสมุด', right: 'library', image: getVocabularyAsset('library'), imageAlt: 'library' },
    { id: 'vm10', left: 'police station', leftThai: 'สถานีตำรวจ', right: 'police station', image: getVocabularyAsset('police station'), imageAlt: 'police station' },
  ],
  vocab_pic_spell: [
    ['ps5', 'train', 'รถไฟ'], ['ps6', 'restaurant', 'ร้านอาหาร'], ['ps7', 'cinema', 'โรงภาพยนตร์'],
    ['ps8', 'school', 'โรงเรียน'], ['ps9', 'ambulance', 'รถพยาบาล'], ['ps10', 'bicycle', 'รถจักรยาน'],
  ].map(([id, answer, thai]) => ({ id, image: getVocabularyAsset(answer), imageAlt: answer, answer, thai })),
  vocab_detective: [
    { id: 'sd4', hints: ['It is a vehicle.', 'It flies in the sky.', 'You board it at an airport.'], answer: 'plane', thai: 'เครื่องบิน' },
    { id: 'sd5', hints: ['It is a place.', 'You can buy food there.', 'Many sellers work here.'], answer: 'market', thai: 'ตลาด' },
    { id: 'sd6', hints: ['It is a vehicle.', 'It has two wheels.', 'You pedal it.'], answer: 'bicycle', thai: 'รถจักรยาน' },
    { id: 'sd7', hints: ['It is a place.', 'You watch movies there.', 'It has a big screen.'], answer: 'cinema', thai: 'โรงภาพยนตร์' },
    { id: 'sd8', hints: ['It is a vehicle.', 'It carries many passengers.', 'It stops at bus stops.'], answer: 'bus', thai: 'รถบัส' },
    { id: 'sd9', hints: ['It is a place.', 'You send letters there.', 'It sells stamps.'], answer: 'post office', thai: 'ไปรษณีย์' },
    { id: 'sd10', hints: ['It is a place.', 'You keep money there.', 'It has cash machines.'], answer: 'bank', thai: 'ธนาคาร' },
  ],
  signs_match: [
    { id: 'sm9', left: 'Hospital', right: '🏥', leftThai: 'โรงพยาบาล' },
    { id: 'sm10', left: 'Pedestrian Crossing', right: '🚶', leftThai: 'ทางม้าลาย' },
  ],
  dir_story: [
    { id: 'dt6', text: 'The bank is ___ the school.', question: 'ธนาคารอยู่ตรงข้ามโรงเรียน', options: ['opposite', 'between', 'behind', 'near'], answer: 0, explanation: 'opposite = ตรงข้าม' },
    { id: 'dt7', text: 'The library is ___ the bank and the market.', question: 'ห้องสมุดอยู่ระหว่างสองสถานที่', options: ['between', 'next to', 'behind', 'on'], answer: 0, explanation: 'between = ระหว่าง' },
    { id: 'dt8', text: 'Turn ___ at the traffic lights.', question: 'เลี้ยวซ้ายที่สัญญาณไฟ', options: ['left', 'straight', 'near', 'between'], answer: 0, explanation: 'turn left = เลี้ยวซ้าย' },
    { id: 'dt9', text: 'The bus stop is ___ front of the school.', question: 'เติมคำบุพบท', options: ['in', 'on', 'at', 'to'], answer: 0, explanation: 'in front of = ด้านหน้า' },
    { id: 'dt10', text: 'Walk ___ the road for two minutes.', question: 'เดินตรงไปตามถนน', options: ['along', 'between', 'opposite', 'behind'], answer: 0, explanation: 'walk along = เดินไปตาม' },
  ],
  market_fill: [
    { id: 'mf6', sentence: 'The bag is ___ baht.', blank: '___ baht', options: ['ninety', 'nine', 'nineteen', 'ninth'], answer: 0, answerThai: '90 บาท', hint: '90 = ninety' },
    { id: 'mf7', sentence: 'A: What ___ do you need? B: Medium, please.', blank: 'What ___', options: ['size', 'price', 'name', 'time'], answer: 0, answerThai: 'ต้องการขนาดอะไร', hint: 'small / medium / large' },
    { id: 'mf8', sentence: 'Can I ___ this shirt on?', blank: '___ this shirt on', options: ['try', 'buying', 'wears', 'looks'], answer: 0, answerThai: 'ขอลองเสื้อตัวนี้ได้ไหม', hint: 'try on = ลองสวม' },
    { id: 'mf9', sentence: 'It is too expensive. Do you have a ___ one?', blank: 'a ___ one', options: ['cheaper', 'taller', 'slower', 'younger'], answer: 0, answerThai: 'มีชิ้นที่ถูกกว่านี้ไหม', hint: 'cheap → cheaper' },
    { id: 'mf10', sentence: 'Here is your ___.', blank: 'your ___', options: ['change', 'color', 'shop', 'size'], answer: 0, answerThai: 'นี่คือเงินทอนของคุณ', hint: 'เงินทอน = change' },
  ],
  market_convo: [
    { id: 'mc5', context: '👕 คุณต้องการลองเสื้อ', speaker: 'You', speakerEmoji: '🧑', text: 'Can I try this on?', options: ['Of course. The fitting room is there.', 'It is Monday.', 'I walk to school.', 'No, I am not.'], correct: 0, explanation: 'ตอบอนุญาตและบอกตำแหน่งห้องลองเสื้อ' },
    { id: 'mc6', context: '📏 พนักงานถามขนาด', speaker: 'Jane', speakerEmoji: '👩‍💼', text: 'What size do you need?', options: ['Medium, please.', 'It is blue.', 'Two hundred baht.', 'At the market.'], correct: 0, explanation: 'คำถาม What size ต้องตอบขนาด' },
    { id: 'mc7', context: '🎨 พนักงานเสนออีกสี', speaker: 'Jane', speakerEmoji: '👩‍💼', text: 'Would you like the blue one?', options: ['Yes, please.', 'It is a skirt.', 'I am eleven.', 'By bus.'], correct: 0, explanation: 'Would you like...? ตอบ Yes, please.' },
    { id: 'mc8', context: '💸 สินค้าราคาแพงเกินไป', speaker: 'You', speakerEmoji: '🧑', text: 'It is too expensive.', options: ['Do you have a cheaper one?', 'What is your name?', 'Turn left here.', 'I like football.'], correct: 0, explanation: 'ขอสินค้าที่ราคาถูกกว่าอย่างสุภาพ' },
    { id: 'mc9', context: '💵 พนักงานรับเงิน', speaker: 'Jane', speakerEmoji: '👩‍💼', text: 'Here is your change.', options: ['Thank you.', 'Red, please.', 'Medium size.', 'I am fine.'], correct: 0, explanation: 'ได้รับเงินทอนแล้วกล่าวขอบคุณ' },
    { id: 'mc10', context: '👋 จบบทสนทนาในร้าน', speaker: 'Jane', speakerEmoji: '👩‍💼', text: 'Have a nice day!', options: ['You too!', 'It is fifty baht.', 'I need a large.', 'This is a bank.'], correct: 0, explanation: 'ตอบคำอวยพรด้วย You too!' },
  ],
  convo_flip: [
    { id: 'cf9', front: 'Excuse me.', frontLabel: '', back: 'Yes? / How can I help?', backThai: 'มีอะไรให้ช่วยไหม', hint: 'ใช้เรียกความสนใจอย่างสุภาพ' },
    { id: 'cf10', front: 'Have a nice day!', frontLabel: '', back: 'You too!', backThai: 'เช่นกันนะ', hint: 'คำอวยพร → You too' },
  ],
  convo_match: [
    { id: 'cm9', left: 'Excuse me.', right: 'Yes? How can I help?', leftThai: 'ขอโทษนะ / ขออนุญาต' },
    { id: 'cm10', left: 'Have a nice weekend!', right: 'You too!', leftThai: 'ขอให้มีวันหยุดที่ดี' },
  ],
  convo_voice: [
    { id: 'cv5', context: 'คุณต้องการขอความช่วยเหลือจากครู', text: 'can you help me please', thai: 'ช่วยฉันหน่อยได้ไหม' },
    { id: 'cv6', context: 'คุณต้องการยืมดินสอจากเพื่อน', text: 'can I borrow your pencil', thai: 'ขอยืมดินสอได้ไหม' },
    { id: 'cv7', context: 'เพื่อนพูดว่า "Goodbye."', text: 'see you tomorrow', thai: 'เจอกันพรุ่งนี้' },
    { id: 'cv8', context: 'คุณต้องการเรียกพนักงานอย่างสุภาพ', text: 'excuse me', thai: 'ขอโทษนะ / ขออนุญาต' },
    { id: 'cv9', context: 'เพื่อนอวยพรว่า "Have a nice day!"', text: 'you too', thai: 'เช่นกันนะ' },
    { id: 'cv10', context: 'คุณพบเพื่อนใหม่เป็นครั้งแรก', text: 'nice to meet you', thai: 'ยินดีที่ได้รู้จัก' },
  ],
  reading_alice: [
    { id: 'ra6', question: 'Does Alice get up early?', options: ['Yes, she does.', 'No, she does not.', 'Only on Sunday.', 'The story does not say.'], answer: 0, explanation: '"She gets up early"' },
    { id: 'ra7', question: 'What does Alice set up every day?', options: ['Her bed', 'Her desk', 'Her bicycle', 'Her dinner'], answer: 0, explanation: '"sets up her bed every day"' },
    { id: 'ra8', question: 'Who does Alice help after school?', options: ['Her teacher', 'Her brother', 'Her doctor', 'Her driver'], answer: 0, explanation: '"she helps her teacher"' },
    { id: 'ra9', question: 'Who takes Alice home?', options: ['Her parents', 'Her teacher', 'Her friends', 'Her grandparents'], answer: 0, explanation: '"Her parents take her home"' },
    { id: 'ra10', question: 'Who does Alice help after dinner?', options: ['Her parents', 'Her classmates', 'Her neighbours', 'Her cousins'], answer: 0, explanation: '"helps her parents after dinner"' },
  ],
  grammar_pronoun: [
    { id: 'gp9', sentence: 'You should bring ___ notebook.', options: ['your', 'my', 'his', 'our'], answer: 0, answerThai: 'your = ของคุณ', hint: 'You → your' },
    { id: 'gp10', sentence: 'That blue bicycle is ___.', options: ['mine', 'my', 'me', 'I'], answer: 0, answerThai: 'mine = ของฉัน', hint: 'ไม่มีคำนามตามหลัง ใช้ mine' },
  ],
  grammar_builder: [
    { id: 'gb5', words: ['every', 'She', 'reads', 'night'], correct: 'She reads every night' },
    { id: 'gb6', words: ['will', 'tomorrow', 'We', 'travel'], correct: 'We will travel tomorrow' },
    { id: 'gb7', words: ['than', 'is', 'A', 'B', 'bigger'], correct: 'A is bigger than B' },
    { id: 'gb8', words: ['not', 'They', 'hungry', 'are'], correct: 'They are not hungry' },
    { id: 'gb9', words: ['your', 'What', 'name', 'is'], correct: 'What is your name' },
    { id: 'gb10', words: ['can', 'English', 'speak', 'I'], correct: 'I can speak English' },
  ],
  about_profile_flip: [
    { id: 'apf7', front: 'birthday', frontLabel: 'birthday', back: 'birthday', backThai: 'วันเกิด', hint: 'My birthday is in May.', image: '/learning/profile/birthday-v1.png', imageAlt: 'นักเรียนฉลองวันเกิดพร้อมเค้ก ลูกโป่ง และหมวกงานเลี้ยง' },
    { id: 'apf8', front: 'address', frontLabel: 'address', back: 'address', backThai: 'ที่อยู่', hint: 'My address is ...', image: '/learning/profile/address-v1.png', imageAlt: 'นักเรียนถือซองจดหมายข้างบ้านและหมุดแผนที่เพื่อสื่อถึงที่อยู่' },
    { id: 'apf9', front: 'subject', frontLabel: 'subject', back: 'subject', backThai: 'วิชา', hint: 'English is my favourite subject.', image: '/learning/profile/subject-v1.png', imageAlt: 'นักเรียนอยู่กับหนังสือ ลูกโลก ตัวเลข และอุปกรณ์ศิลปะซึ่งแทนวิชาเรียน' },
    { id: 'apf10', front: 'dream job', frontLabel: 'dream job', back: 'dream job', backThai: 'อาชีพในฝัน', hint: 'I want to be a doctor.', image: '/learning/profile/dream-job-v1.png', imageAlt: 'นักเรียนฝันเห็นตนเองโตขึ้นเป็นแพทย์' },
  ],
  about_intro_fill: [
    { id: 'aif5', sentence: 'I ___ at Ban Nong School.', blank: 'I ___ at Ban Nong School.', options: ['study', 'live', 'old', 'name'], answer: 0, answerThai: 'ฉันเรียนที่โรงเรียนบ้านหนอง', hint: 'study at school' },
    { id: 'aif6', sentence: 'My favourite ___ is English.', blank: 'favourite ___', options: ['subject', 'age', 'address', 'year'], answer: 0, answerThai: 'วิชาโปรดของฉันคือภาษาอังกฤษ', hint: 'English is a subject' },
    { id: 'aif7', sentence: 'There are four people in my ___.', blank: 'my ___', options: ['family', 'name', 'hobby', 'age'], answer: 0, answerThai: 'ครอบครัวของฉันมีสี่คน', hint: 'people in a family' },
    { id: 'aif8', sentence: 'I want to ___ a teacher.', blank: 'to ___ a teacher', options: ['be', 'am', 'is', 'are'], answer: 0, answerThai: 'ฉันอยากเป็นครู', hint: 'want to + V1' },
    { id: 'aif9', sentence: 'My birthday is ___ July.', blank: '___ July', options: ['in', 'on', 'at', 'from'], answer: 0, answerThai: 'วันเกิดของฉันอยู่ในเดือนกรกฎาคม', hint: 'เดือนใช้ in' },
    { id: 'aif10', sentence: 'I like ___ badminton.', blank: 'like ___ badminton', options: ['playing', 'play', 'plays', 'played'], answer: 0, answerThai: 'ฉันชอบเล่นแบดมินตัน', hint: 'like + V-ing' },
  ],
  about_sentence_builder: [
    { id: 'asb5', words: ['in', 'I', 'Udon Thani', 'live'], correct: 'I live in Udon Thani' },
    { id: 'asb6', words: ['drawing', 'hobby', 'My', 'is'], correct: 'My hobby is drawing' },
    { id: 'asb7', words: ['birthday', 'May', 'is', 'My', 'in'], correct: 'My birthday is in May' },
    { id: 'asb8', words: ['student', 'grade-six', 'a', 'am', 'I'], correct: 'I am a grade-six student' },
    { id: 'asb9', words: ['doctor', 'be', 'want', 'a', 'to', 'I'], correct: 'I want to be a doctor' },
    { id: 'asb10', words: ['people', 'family', 'five', 'my', 'There', 'in', 'are'], correct: 'There are five people in my family' },
  ],
  family_relation_flip: [
    { id: 'frf7', front: 'cousin', frontLabel: 'cousin', back: 'cousin', backThai: 'ลูกพี่ลูกน้อง', hint: "your aunt's or uncle's child", image: '/learning/family/cousin-v1.png', imageAlt: 'ลูกพี่ลูกน้องสองคนกำลังแตะมือกันอย่างสนุกสนาน' },
    { id: 'frf8', front: 'son', frontLabel: 'son', back: 'son', backThai: 'ลูกชาย', hint: 'a male child', image: '/learning/family/son-v1.png', imageAlt: 'พ่อแนะนำลูกชายที่ยืนอยู่ข้างกัน' },
    { id: 'frf9', front: 'daughter', frontLabel: 'daughter', back: 'daughter', backThai: 'ลูกสาว', hint: 'a female child', image: '/learning/family/daughter-v1.png', imageAlt: 'แม่แนะนำลูกสาวที่ยืนอยู่ข้างกัน' },
    { id: 'frf10', front: 'relatives', frontLabel: 'relatives', back: 'relatives', backThai: 'ญาติ', hint: 'people in your extended family', image: '/learning/family/relatives-v1.png', imageAlt: 'กลุ่มญาติหลายวัยถ่ายภาพครอบครัวร่วมกัน' },
  ],
  family_relation_match: [
    { id: 'frm5', left: "mother's mother", leftThai: 'แม่ของแม่', right: 'grandmother' },
    { id: 'frm6', left: "aunt's daughter", leftThai: 'ลูกสาวของป้า', right: 'cousin' },
    { id: 'frm7', left: "parents' male child", leftThai: 'ลูกผู้ชายของพ่อแม่', right: 'son' },
    { id: 'frm8', left: "parents' female child", leftThai: 'ลูกผู้หญิงของพ่อแม่', right: 'daughter' },
    { id: 'frm9', left: "sister's husband", leftThai: 'สามีของพี่สาวหรือน้องสาว', right: 'brother-in-law' },
    { id: 'frm10', left: "brother's wife", leftThai: 'ภรรยาของพี่ชายหรือน้องชาย', right: 'sister-in-law' },
  ],
  family_pronoun_fill: [
    { id: 'fpf5', sentence: 'My sister likes music. ___ plays the guitar.', blank: '___ plays', options: ['She', 'He', 'They', 'It'], answer: 0, answerThai: 'เธอเล่นกีตาร์', hint: 'sister = she' },
    { id: 'fpf6', sentence: 'My uncle is a chef. ___ cooks very well.', blank: '___ cooks', options: ['He', 'She', 'They', 'We'], answer: 0, answerThai: 'เขาทำอาหารเก่ง', hint: 'uncle = he' },
    { id: 'fpf7', sentence: 'Anna and I visit ___ aunt.', blank: '___ aunt', options: ['our', 'their', 'his', 'its'], answer: 0, answerThai: 'พวกเราไปเยี่ยมป้า', hint: 'Anna and I = we → our' },
    { id: 'fpf8', sentence: 'The baby is playing with ___ toy.', blank: '___ toy', options: ['its', 'their', 'our', 'your'], answer: 0, answerThai: 'เด็กทารกเล่นของเล่นของตน', hint: 'baby = it → its' },
    { id: 'fpf9', sentence: 'My cousins live nearby. ___ house is blue.', blank: '___ house', options: ['Their', 'His', 'Her', 'Its'], answer: 0, answerThai: 'บ้านของพวกเขาสีฟ้า', hint: 'cousins = they → their' },
    { id: 'fpf10', sentence: 'You and your brother should help ___ parents.', blank: '___ parents', options: ['your', 'our', 'his', 'my'], answer: 0, answerThai: 'คุณควรช่วยพ่อแม่ของคุณ', hint: 'you → your' },
  ],
  school_object_flip: [
    { id: 'sof7', front: 'laboratory', frontLabel: 'laboratory', back: 'laboratory', backThai: 'ห้องทดลอง', hint: 'a place for science experiments', image: '/learning/classroom/laboratory-v1.png', imageAlt: 'นักเรียนทดลองวิทยาศาสตร์ในห้องทดลองพร้อมอุปกรณ์นิรภัย' },
    { id: 'sof8', front: 'gym', frontLabel: 'gym', back: 'gym', backThai: 'โรงยิม', hint: 'a place for exercise', image: '/learning/classroom/gym-v1.png', imageAlt: 'นักเรียนออกกำลังกายในโรงยิมที่มีอุปกรณ์กีฬา' },
    { id: 'sof9', front: 'uniform', frontLabel: 'uniform', back: 'uniform', backThai: 'ชุดนักเรียน', hint: 'students wear it', image: '/learning/classroom/uniform-v1.png', imageAlt: 'ชุดนักเรียนครบชุดพร้อมกระเป๋า รองเท้า และถุงเท้า' },
    { id: 'sof10', front: 'principal', frontLabel: 'principal', back: 'principal', backThai: 'ผู้อำนวยการโรงเรียน', hint: 'the head of a school', image: '/learning/classroom/principal-v1.png', imageAlt: 'ผู้อำนวยการโรงเรียนยืนถือแฟ้มและกล่าวต้อนรับ' },
  ],
  school_place_match: [
    { id: 'spm5', left: 'use a computer', leftThai: 'ใช้คอมพิวเตอร์', right: 'computer room' },
    { id: 'spm6', left: 'meet the principal', leftThai: 'พบผู้อำนวยการ', right: "principal's office" },
    { id: 'spm7', left: 'play outside', leftThai: 'เล่นกลางแจ้ง', right: 'playground' },
    { id: 'spm8', left: 'learn music', leftThai: 'เรียนดนตรี', right: 'music room' },
    { id: 'spm9', left: 'see the school nurse', leftThai: 'พบพยาบาลโรงเรียน', right: 'first-aid room' },
    { id: 'spm10', left: 'attend the morning assembly', leftThai: 'เข้าแถวตอนเช้า', right: 'school hall' },
  ],
  school_notice_fill: [
    { id: 'snf5', sentence: 'NO FOOD OR DRINK IN THE ___.', blank: 'IN THE ___', options: ['computer room', 'sandwich', 'uniform', 'Monday'], answer: 0, answerThai: 'ห้ามอาหารและเครื่องดื่มในห้องคอมพิวเตอร์', hint: 'ต้องเป็นสถานที่' },
    { id: 'snf6', sentence: 'The school bus leaves at ___ o’clock.', blank: 'at ___ o’clock', options: ['four', 'library', 'quiet', 'uniform'], answer: 0, answerThai: 'รถโรงเรียนออกเวลาสี่โมง', hint: 'ต้องเป็นตัวเลขบอกเวลา' },
    { id: 'snf7', sentence: 'Please ___ your hand before speaking.', blank: '___ your hand', options: ['raise', 'eat', 'close', 'wear'], answer: 0, answerThai: 'กรุณายกมือก่อนพูด', hint: 'raise your hand' },
    { id: 'snf8', sentence: 'Do not ___ in the hallway.', blank: 'Do not ___', options: ['run', 'read', 'study', 'write'], answer: 0, answerThai: 'ห้ามวิ่งในทางเดิน', hint: 'กฎความปลอดภัย' },
    { id: 'snf9', sentence: 'Return library books by ___.', blank: 'by ___', options: ['Friday', 'pencil', 'lunch', 'teacher'], answer: 0, answerThai: 'คืนหนังสือภายในวันศุกร์', hint: 'กำหนดส่งเป็นวัน' },
    { id: 'snf10', sentence: 'Keep the classroom ___.', blank: 'classroom ___', options: ['clean', 'tall', 'sweet', 'expensive'], answer: 0, answerThai: 'รักษาห้องเรียนให้สะอาด', hint: 'classroom rule' },
  ],
};

const ROUND_COLLECTION_BY_TYPE = {
  flashcard: 'cards', matching: 'pairs', spell: 'items', fill_blank: 'questions',
  conversation: 'scenes', voice: 'sentences', story_tap: 'passages', rearrange: 'wordSentences',
};

function completeChapterOneMissions(missionGroups) {
  return Object.fromEntries(Object.entries(missionGroups).map(([questId, missions]) => [questId, missions.map((sourceMission) => {
    const mission = { ...sourceMission };
    const collectionKey = ROUND_COLLECTION_BY_TYPE[mission.type];
    const rounds = mission[collectionKey];
    if (!Array.isArray(rounds)) return mission;
    mission[collectionKey] = rounds.length >= 10
      ? rounds.slice(0, 10)
      : [...rounds, ...(TEN_ROUND_ADDITIONS[mission.id] || [])];
    return mission;
  })]));
}

// ── Export all missions grouped by questId ────────────────────
// Vocab Drill consumes the full learning decks; Game Missions consume the
// normalized ten-round copy.
export const CH1_LEARNING_DECKS = {
  about_myself: aboutMissions,
  family: familyMissions,
  school: schoolMissions,
  vocabulary: vocabularyMissions,
  signs: signsMissions,
  directions: directionsMissions,
  market: marketMissions,
  conversation: conversationMissions,
  reading: readingMissions,
  grammar: grammarMissions,
};

export const CH1_MISSIONS = completeChapterOneMissions(CH1_LEARNING_DECKS);

export function getMissionsForQuest(questId) {
  return CH1_MISSIONS[questId] || [];
}
