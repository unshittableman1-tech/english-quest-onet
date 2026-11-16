/**
 * ENGLISH O-NET ADVENTURE — PUBLIC DEMO CONTENT
 * 
 * Curated content strictly limited to:
 * 1. Exactly 3 playable missions in Starter Region (About Myself)
 * 2. Exactly 30 unique Primary 6 vocabulary words
 * 3. Exactly 10 mini-mock examination questions (O-NET P.6 format)
 * 
 * Zero private school records, zero student IDs. 100% original pedagogical fixtures.
 */

import { aboutMissions } from './missions/ch1_missions.js';
import { miniMockPool } from './chapter4_questions.js';

// ── 1. EXACTLY 3 PLAYABLE MISSIONS ───────────────────────────
export const DEMO_QUEST_MISSIONS = Object.freeze(
  aboutMissions.filter(m => 
    m.id === 'about_profile_flip' || 
    m.id === 'about_intro_fill' || 
    m.id === 'about_sentence_builder'
  )
);

// ── 2. EXACTLY 30 UNIQUE PRIMARY 6 VOCABULARY WORDS ──────────
export const DEMO_VOCABULARY_WORDS = Object.freeze([
  // Group 1: Personal Profile (10 words)
  {
    id: 'demo_vocab_01',
    word: 'name',
    thai: 'ชื่อ',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'My name is Pim.',
    exampleThai: 'ฉันชื่อพิม',
    hint: 'ใช้บอกชื่อของตนเอง'
  },
  {
    id: 'demo_vocab_02',
    word: 'age',
    thai: 'อายุ',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'I am twelve years of age.',
    exampleThai: 'ฉันอายุ 12 ปี',
    hint: 'ใช้บอกอายุ'
  },
  {
    id: 'demo_vocab_03',
    word: 'hobby',
    thai: 'งานอดิเรก',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'My hobby is drawing pictures.',
    exampleThai: 'งานอดิเรกของฉันคือการวาดรูป',
    hint: 'กิจกรรมที่ชอบทำยามว่าง'
  },
  {
    id: 'demo_vocab_04',
    word: 'favourite',
    thai: 'ที่ชื่นชอบ',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'adjective',
    example: 'My favourite subject is English.',
    exampleThai: 'วิชาที่ฉันชื่นชอบคือภาษาอังกฤษ',
    hint: 'สิ่งที่ชอบมากที่สุด'
  },
  {
    id: 'demo_vocab_05',
    word: 'live',
    thai: 'อาศัยอยู่',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'verb',
    example: 'I live in Bangkok with my family.',
    exampleThai: 'ฉันอาศัยอยู่ในกรุงเทพฯ กับครอบครัว',
    hint: 'การพักอาศัย ณ สถานที่ใดที่หนึ่ง'
  },
  {
    id: 'demo_vocab_06',
    word: 'student',
    thai: 'นักเรียน',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'I am a primary school student.',
    exampleThai: 'ฉันเป็นนักเรียนระดับประถมศึกษา',
    hint: 'ผู้ที่ศึกษาเล่าเรียน'
  },
  {
    id: 'demo_vocab_07',
    word: 'friend',
    thai: 'เพื่อน',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'She is my best friend at school.',
    exampleThai: 'เธอเป็นเพื่อนสนิทของฉันที่โรงเรียน',
    hint: 'มิตร สหาย'
  },
  {
    id: 'demo_vocab_08',
    word: 'school',
    thai: 'โรงเรียน',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'Our school starts at eight o’clock.',
    exampleThai: 'โรงเรียนของเราเริ่มเรียนเวลา 8 นาฬิกา',
    hint: 'สถานศึกษา'
  },
  {
    id: 'demo_vocab_09',
    word: 'birthday',
    thai: 'วันเกิด',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'My birthday is on May 15th.',
    exampleThai: 'วันเกิดของฉันตรงกับวันที่ 15 พฤษภาคม',
    hint: 'วันครบรอบวันเกิด'
  },
  {
    id: 'demo_vocab_10',
    word: 'grade',
    thai: 'ระดับชั้น / ผลการเรียน',
    category: 'profile',
    categoryName: 'ข้อมูลส่วนตัว',
    partOfSpeech: 'noun',
    example: 'I am studying in grade 6.',
    exampleThai: 'ฉันกำลังศึกษาอยู่ชั้นประถมศึกษาปีที่ 6',
    hint: 'ระดับชั้นปีการศึกษา'
  },

  // Group 2: Classroom & Objects (10 words)
  {
    id: 'demo_vocab_11',
    word: 'book',
    thai: 'หนังสือ',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Please open your book to page 10.',
    exampleThai: 'กรุณาเปิดหนังสือของคุณไปที่หน้า 10',
    hint: 'สิ่งที่ใช้เปิดอ่าน'
  },
  {
    id: 'demo_vocab_12',
    word: 'pencil',
    thai: 'ดินสอ',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'I sharpen my pencil before class.',
    exampleThai: 'ฉันเหลาดินสอก่อนเริ่มเรียน',
    hint: 'อุปกรณ์เขียนลบได้'
  },
  {
    id: 'demo_vocab_13',
    word: 'ruler',
    thai: 'ไม้บรรทัด',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Use a ruler to draw a straight line.',
    exampleThai: 'ใช้ไม้บรรทัดเพื่อขีดเส้นตรง',
    hint: 'อุปกรณ์วัดและขีดเส้น'
  },
  {
    id: 'demo_vocab_14',
    word: 'eraser',
    thai: 'ยางลบ',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Can I borrow your eraser, please?',
    exampleThai: 'ฉันขอยืมยางลบของคุณหน่อยได้ไหม?',
    hint: 'อุปกรณ์ลบรอยดินสอ'
  },
  {
    id: 'demo_vocab_15',
    word: 'desk',
    thai: 'โต๊ะเรียน',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Keep your desk clean and organized.',
    exampleThai: 'รักษาโต๊ะเรียนให้สะอาดและเป็นระเบียบ',
    hint: 'โต๊ะสำหรับนั่งเรียน'
  },
  {
    id: 'demo_vocab_16',
    word: 'chair',
    thai: 'เก้าอี้',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Please push your chair in after class.',
    exampleThai: 'กรุณาเก็บเก้าอี้หลังเลิกเรียน',
    hint: 'ที่สำหรับนั่ง'
  },
  {
    id: 'demo_vocab_17',
    word: 'teacher',
    thai: 'คุณครู',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Our teacher explains the lesson clearly.',
    exampleThai: 'คุณครูอธิบายบทเรียนได้อย่างชัดเจน',
    hint: 'ผู้ประสิทธิ์ประสาทวิชา'
  },
  {
    id: 'demo_vocab_18',
    word: 'blackboard',
    thai: 'กระดานดำ',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Look at the blackboard for directions.',
    exampleThai: 'มองที่กระดานดำเพื่อดูคำชี้แจง',
    hint: 'กระดานสำหรับเขียนหน้าห้อง'
  },
  {
    id: 'demo_vocab_19',
    word: 'notebook',
    thai: 'สมุดจด',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Write down key words in your notebook.',
    exampleThai: 'จดคำสำคัญลงในสมุดของคุณ',
    hint: 'สมุดสำหรับจดบันทึก'
  },
  {
    id: 'demo_vocab_20',
    word: 'bag',
    thai: 'กระเป๋า',
    category: 'classroom',
    categoryName: 'ห้องเรียนและอุปกรณ์',
    partOfSpeech: 'noun',
    example: 'Pack your school bag every evening.',
    exampleThai: 'จัดกระเป๋านักเรียนทุกเย็น',
    hint: 'กระเป๋าสำหรับใส่สัมภาระ'
  },

  // Group 3: Everyday Actions & Verbs (10 words)
  {
    id: 'demo_vocab_21',
    word: 'eat',
    thai: 'กิน / รับประทาน',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'We eat fresh fruit every day.',
    exampleThai: 'พวกเรากินผลไม้สดทุกวัน',
    hint: 'การรับประทานอาหาร'
  },
  {
    id: 'demo_vocab_22',
    word: 'drink',
    thai: 'ดื่ม',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'Drink at least eight glasses of water.',
    exampleThai: 'ดื่มน้ำอย่างน้อย 8 แก้ว',
    hint: 'การดื่มน้ำหรือเครื่องดื่ม'
  },
  {
    id: 'demo_vocab_23',
    word: 'read',
    thai: 'อ่าน',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'I read English stories before sleeping.',
    exampleThai: 'ฉันอ่านนิทานภาษาอังกฤษก่อนนอน',
    hint: 'การกวาดสายตาทำความเข้าใจข้อความ'
  },
  {
    id: 'demo_vocab_24',
    word: 'write',
    thai: 'เขียน',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'Write full sentences in your answers.',
    exampleThai: 'เขียนประโยคฉบับสมบูรณ์ในคำตอบของคุณ',
    hint: 'การจรดปากกาหรือดินสอเพื่อสื่อสาร'
  },
  {
    id: 'demo_vocab_25',
    word: 'speak',
    thai: 'พูด',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'We speak English with confidence.',
    exampleThai: 'พวกเราพูดภาษาอังกฤษด้วยความมั่นใจ',
    hint: 'การเปล่งเสียงสื่อความหมาย'
  },
  {
    id: 'demo_vocab_26',
    word: 'listen',
    thai: 'ฟัง',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'Listen attentively to the speaker.',
    exampleThai: 'ตั้งใจฟังผู้พูดอย่างมีสมาธิ',
    hint: 'การสดับฟัง'
  },
  {
    id: 'demo_vocab_27',
    word: 'play',
    thai: 'เล่น',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'Children play sports in the playground.',
    exampleThai: 'เด็กๆ เล่นกีฬาในสนามเด็กเล่น',
    hint: 'การทำกิจกรรมเพื่อความสนุกและสุขภาพ'
  },
  {
    id: 'demo_vocab_28',
    word: 'learn',
    thai: 'เรียนรู้',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'We learn from our daily practice.',
    exampleThai: 'พวกเราเรียนรู้จากการฝึกฝนประจำวัน',
    hint: 'การซึมซับความรู้ใหม่'
  },
  {
    id: 'demo_vocab_29',
    word: 'study',
    thai: 'ศึกษา / ทบทวน',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'Students study hard for the O-NET exam.',
    exampleThai: 'นักเรียนตั้งใจอ่านหนังสือทบทวนเพื่อสอบ O-NET',
    hint: 'การทุ่มเทศึกษาค้นคว้า'
  },
  {
    id: 'demo_vocab_30',
    word: 'clean',
    thai: 'ทำความสะอาด',
    category: 'verbs',
    categoryName: 'คำกริยาและกิจวัตรประจำวัน',
    partOfSpeech: 'verb',
    example: 'Help clean the room before leaving.',
    exampleThai: 'ช่วยทำความสะอาดห้องก่อนกลับบ้าน',
    hint: 'การขจัดสิ่งสกปรก'
  }
]);

// ── 3. EXACTLY 10 MINI-MOCK EXAM QUESTIONS ───────────────────
// First 10 questions from original miniMockPool (mm01 - mm10)
export const DEMO_EXAM_QUESTIONS = Object.freeze(miniMockPool.slice(0, 10));

// ── 4. WORLD MAP PREVIEW REGIONS ─────────────────────────────
export const DEMO_REGIONS = Object.freeze([
  {
    id: 'ch1',
    name: 'Starter Realm — ดินแดนแห่งการเริ่มต้น',
    description: 'ฝึกฝนทักษะพื้นฐาน: แนะนำตัว ศัพท์ในห้องเรียน และการสร้างประโยค',
    icon: '🌱',
    status: 'unlocked',
    playableMissions: 3
  },
  {
    id: 'ch2',
    name: 'Family & Home — หุบเขาครอบครัว',
    description: 'คำศัพท์ความสัมพันธ์และบทสนทนาในชีวิตประจำวัน',
    icon: '🏡',
    status: 'locked_preview',
    playableMissions: 0,
    lockNotice: 'ปลดล็อกในเวอร์ชันโรงเรียนเต็มรูปแบบ'
  },
  {
    id: 'ch3',
    name: 'Grammar Citadel — ปราสาทไวยากรณ์ O-NET',
    description: 'Tenses, Prepositions, กราฟและป้ายสัญลักษณ์เชิงลึก',
    icon: '🏰',
    status: 'locked_preview',
    playableMissions: 0,
    lockNotice: 'ปลดล็อกในเวอร์ชันโรงเรียนเต็มรูปแบบ'
  },
  {
    id: 'ch4',
    name: 'Arena of Champions — ลานประลองข้อสอบจริง',
    description: 'คลังข้อสอบจริง 64–68 ครบทุกทักษะพร้อมระบบจำลองเวลา',
    icon: '⚔️',
    status: 'locked_preview',
    playableMissions: 0,
    lockNotice: 'ปลดล็อกในเวอร์ชันโรงเรียนเต็มรูปแบบ'
  }
]);
