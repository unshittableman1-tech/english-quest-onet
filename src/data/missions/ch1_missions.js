// ============================================================
// ch1_missions.js — Mission data สำหรับ Chapter 1 (7 Quests)
// ข้อมูลจาก: English Worksheet P6.pdf + เฉลยใบงานครู + โค้งหักศอก
// ============================================================

// ── Technique Cards (จากโค้งหักศอก) ─────────────────────────
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
      { id: 'vf1', front: '✈️', frontLabel: 'plane', back: 'plane', backThai: 'เครื่องบิน', hint: 'p_ane', category: 'transport' },
      { id: 'vf2', front: '🚗', frontLabel: 'car', back: 'car', backThai: 'รถยนต์', hint: 'c_r', category: 'transport' },
      { id: 'vf3', front: '🚌', frontLabel: 'bus', back: 'bus', backThai: 'รถบัส/รถเมล์', hint: 'b_s', category: 'transport' },
      { id: 'vf4', front: '🚐', frontLabel: 'van', back: 'van', backThai: 'รถตู้', hint: 'v_n', category: 'transport' },
      { id: 'vf5', front: '🚲', frontLabel: 'bicycle', back: 'bicycle', backThai: 'รถจักรยาน', hint: 'bi_y_le', category: 'transport' },
      { id: 'vf6', front: '🚢', frontLabel: 'ship', back: 'ship', backThai: 'เรือใหญ่', hint: 'sh_p', category: 'transport' },
      { id: 'vf7', front: '🚂', frontLabel: 'train', back: 'train', backThai: 'รถไฟ', hint: 'tr_in', category: 'transport' },
      { id: 'vf8', front: '🚕', frontLabel: 'taxi', back: 'taxi', backThai: 'แท็กซี่', hint: 'ta_i', category: 'transport' },
      { id: 'vf9', front: '⛵', frontLabel: 'boat', back: 'boat', backThai: 'เรือเล็ก', hint: 'bo_t', category: 'transport' },
      { id: 'vf10', front: '🏍️', frontLabel: 'motorcycle', back: 'motorcycle', backThai: 'รถจักรยานยนต์', hint: 'mot_r_y_le', category: 'transport' },
      { id: 'vf11', front: '🚑', frontLabel: 'ambulance', back: 'ambulance', backThai: 'รถพยาบาล', hint: 'am_ul_nce', category: 'transport' },
      { id: 'vf12', front: '🛻', frontLabel: 'pick-up truck', back: 'pick-up truck', backThai: 'รถกระบะ', hint: 'p_ck-up', category: 'transport' },
    ],
  },
  {
    id: 'vocab_match',
    questId: 'vocabulary',
    type: 'matching',
    title: '🔗 Place Match',
    subtitle: 'จับคู่สถานที่กับ emoji',
    xpReward: 30,
    description: 'แตะคำภาษาอังกฤษ แล้วแตะ emoji ที่ตรงกัน',
    pairs: [
      { id: 'vm1', left: 'hospital', right: '🏥', leftThai: 'โรงพยาบาล' },
      { id: 'vm2', left: 'school', right: '🏫', leftThai: 'โรงเรียน' },
      { id: 'vm3', left: 'bank', right: '🏦', leftThai: 'ธนาคาร' },
      { id: 'vm4', left: 'airport', right: '✈️', leftThai: 'สนามบิน' },
      { id: 'vm5', left: 'market', right: '🏪', leftThai: 'ตลาด' },
      { id: 'vm6', left: 'restaurant', right: '🍽️', leftThai: 'ร้านอาหาร' },
      { id: 'vm7', left: 'cinema', right: '🎬', leftThai: 'โรงภาพยนตร์' },
      { id: 'vm8', left: 'post office', right: '📮', leftThai: 'ไปรษณีย์' },
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
      { id: 'ps1', image: '🚲', answer: 'bicycle', thai: 'รถจักรยาน' },
      { id: 'ps2', image: '🏥', answer: 'hospital', thai: 'โรงพยาบาล' },
      { id: 'ps3', image: '✈️', answer: 'airport', thai: 'สนามบิน' },
      { id: 'ps4', image: '🏪', answer: 'market', thai: 'ตลาด' },
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
    // จากโค้งหักศอก Part 4: Grammar Keywords
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

// ── Export all missions grouped by questId ────────────────────
export const CH1_MISSIONS = {
  vocabulary: vocabularyMissions,
  signs: signsMissions,
  directions: directionsMissions,
  market: marketMissions,
  conversation: conversationMissions,
  reading: readingMissions,
  grammar: grammarMissions,
};

export function getMissionsForQuest(questId) {
  return CH1_MISSIONS[questId] || [];
}
