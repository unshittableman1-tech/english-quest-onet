const fs = require('fs');
const path = require('path');

// Helper to generate variations
function generateQuestions(missionId, skill, count, templates, difficulty, chapterId = "chapter_3") {
  const result = [];
  let tIdx = 0;
  for (let i = 1; i <= count; i++) {
    const t = templates[tIdx % templates.length];
    
    // Slight variations in the template
    const variationSuffix = i > templates.length ? ` (Q${i})` : '';
    
    let qObj = {
      id: `strategy_${missionId}_${String(i).padStart(3, '0')}`,
      chapterId: chapterId,
      missionId: missionId,
      type: "two_step",
      skill: skill,
      difficulty: difficulty,
      passage: t.passage,
      question: t.question + (variationSuffix ? ` (Var ${Math.ceil(i/templates.length)})` : ''),
      choices: [...t.choices],
      correctIndex: t.correctIndex,
      reasonQuestion: t.reasonQuestion,
      reasonChoices: [...t.reasonChoices],
      correctReasonIndex: t.correctReasonIndex,
      keywords: [...t.keywords],
      trapChoices: [...t.trapChoices],
      explanationThai: t.explanationThai,
      explanationEnglishShort: t.explanationEnglishShort
    };
    
    // Rotate correct index slightly for variations to avoid same answer every time
    if (i > templates.length) {
      const shift = i % 4;
      const oldCorrectChoice = qObj.choices[qObj.correctIndex];
      const oldReasonChoice = qObj.reasonChoices[qObj.correctReasonIndex];
      
      // Shuffle choices
      const newChoices = [...qObj.choices];
      newChoices[qObj.correctIndex] = newChoices[shift];
      newChoices[shift] = oldCorrectChoice;
      qObj.correctIndex = shift;
      
      // Shuffle reasons
      const newReasons = [...qObj.reasonChoices];
      newReasons[qObj.correctReasonIndex] = newReasons[shift];
      newReasons[shift] = oldReasonChoice;
      qObj.correctReasonIndex = shift;
    }
    
    result.push(qObj);
    tIdx++;
  }
  return result;
}

const templatesQW = [
  {
    passage: "John is going to the library to read some books.",
    question: "Where is John going?",
    choices: ["to the park", "to the library", "to the school", "to the hospital"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น to the library?",
    reasonChoices: [
      "เพราะโจทย์ถาม Where (ที่ไหน) และในประโยคบอกว่า going to the library",
      "เพราะโจทย์ถาม What (อะไร) และในประโยคบอกว่า read books",
      "เพราะโจทย์ถาม Who (ใคร) และในประโยคบอกว่า John",
      "เพราะโจทย์ถาม When (เมื่อไหร่) และในประโยคไม่ได้บอกเวลา"
    ],
    correctReasonIndex: 0,
    keywords: ["Where", "library"],
    trapChoices: ["to the park", "to the school", "to the hospital"],
    explanationThai: "คำถาม Where แปลว่า ที่ไหน คำตอบต้องเป็นสถานที่ ซึ่งในโจทย์คือ library",
    explanationEnglishShort: "Where asks for a place. The passage says the library."
  },
  {
    passage: "Mary has three cats and two dogs at home.",
    question: "How many cats does Mary have?",
    choices: ["two", "three", "four", "five"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น three?",
    reasonChoices: [
      "เพราะโจทย์ถาม Who (ใคร) และในประโยคบอกว่า Mary",
      "เพราะโจทย์ถาม How many (มากเท่าไหร่/จำนวน) และในประโยคบอกว่า three cats",
      "เพราะโจทย์ถาม Where (ที่ไหน) และในประโยคบอกว่า at home",
      "เพราะโจทย์ถาม What (อะไร) และในประโยคบอกว่า dogs"
    ],
    correctReasonIndex: 1,
    keywords: ["How many", "three cats"],
    trapChoices: ["two", "four", "five"],
    explanationThai: "How many ใช้ถามจำนวนของ cats ซึ่งโจทย์บอกว่า three cats",
    explanationEnglishShort: "How many asks for a number. She has three cats."
  },
  {
    passage: "The movie starts at 7:00 PM tonight.",
    question: "When does the movie start?",
    choices: ["at 6:00 PM", "in the morning", "at 7:00 PM", "tomorrow"],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น at 7:00 PM?",
    reasonChoices: [
      "เพราะโจทย์ถาม When (เมื่อไหร่) และประโยคระบุเวลา 7:00 PM",
      "เพราะโจทย์ถาม What (อะไร) และประโยคบอกว่า the movie",
      "เพราะโจทย์ถาม Where (ที่ไหน) แต่ประโยคไม่ได้ระบุ",
      "เพราะโจทย์ถาม Why (ทำไม) แต่ไม่มีการให้เหตุผล"
    ],
    correctReasonIndex: 0,
    keywords: ["When", "7:00 PM"],
    trapChoices: ["at 6:00 PM", "in the morning", "tomorrow"],
    explanationThai: "When ใช้ถามเวลา ซึ่งในโจทย์ระบุเวลาคือ 7:00 PM",
    explanationEnglishShort: "When asks for time. The passage says 7:00 PM."
  },
  {
    passage: "Tom is crying because he lost his favorite toy.",
    question: "Why is Tom crying?",
    choices: ["he is hungry", "he is happy", "he lost his toy", "he wants to play"],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น he lost his toy?",
    reasonChoices: [
      "เพราะโจทย์ถาม Why (ทำไม) และหลังคำว่า because บอกเหตุผลว่า lost his toy",
      "เพราะโจทย์ถาม Who (ใคร) และคำตอบคือ Tom",
      "เพราะโจทย์ถาม When (เมื่อไหร่) แต่ประโยคไม่มีเวลา",
      "เพราะโจทย์ถาม Where (ที่ไหน) แต่ไม่มีสถานที่"
    ],
    correctReasonIndex: 0,
    keywords: ["Why", "because", "lost his toy"],
    trapChoices: ["he is hungry", "he is happy", "he wants to play"],
    explanationThai: "Why ถามเหตุผล มักตามด้วย because (เพราะว่า) ซึ่งคือ lost his toy",
    explanationEnglishShort: "Why asks for a reason. 'because he lost his toy' gives the reason."
  },
  {
    passage: "I want the red apple, not the green one.",
    question: "Which apple does the speaker want?",
    choices: ["the green one", "the red one", "the yellow one", "both"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น the red one?",
    reasonChoices: [
      "เพราะโจทย์ถาม Why (ทำไม) แต่ไม่มีเหตุผล",
      "เพราะโจทย์ถาม Which (อันไหน/สิ่งไหน) และประโยคบอกว่า want the red apple",
      "เพราะโจทย์ถาม Who (ใคร) แต่เป็นเรื่องแอปเปิ้ล",
      "เพราะโจทย์ถาม What (อะไร) แต่ต้องการให้เลือกสิ่งใดสิ่งหนึ่ง"
    ],
    correctReasonIndex: 1,
    keywords: ["Which", "red apple"],
    trapChoices: ["the green one", "the yellow one", "both"],
    explanationThai: "Which ถามให้เลือกสิ่งใดสิ่งหนึ่ง ซึ่งโจทย์ระบุชัดเจนว่า want the red apple",
    explanationEnglishShort: "Which asks for a choice. The passage says 'want the red apple'."
  }
];

const templatesSign = [
  {
    passage: "DO NOT FEED THE ANIMALS",
    question: "Where can you see this notice?",
    choices: ["at a school", "in a zoo", "at a restaurant", "in a hospital"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น in a zoo?",
    reasonChoices: [
      "เพราะมีคำว่า animals ซึ่งเกี่ยวข้องกับสวนสัตว์",
      "เพราะมีคำว่า school ซึ่งแปลว่าโรงเรียน",
      "เพราะมีคำว่า restaurant ซึ่งเกี่ยวข้องกับอาหาร",
      "เพราะมีคำว่า hospital ซึ่งแปลว่าโรงพยาบาล"
    ],
    correctReasonIndex: 0,
    keywords: ["animals", "zoo"],
    trapChoices: ["at a school", "at a restaurant", "in a hospital"],
    explanationThai: "คำว่า animals (สัตว์) มักพบเห็นป้ายห้ามให้อาหารสัตว์ได้ใน zoo (สวนสัตว์)",
    explanationEnglishShort: "The notice says 'animals', so it is in a zoo."
  },
  {
    passage: "KEEP OFF THE GRASS",
    question: "What does this sign mean?",
    choices: ["You can play on the grass.", "You must water the grass.", "You must not walk on the grass.", "You can cut the grass."],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น You must not walk on the grass?",
    reasonChoices: [
      "เพราะ keep off แปลว่า ให้อยู่ห่าง หรือห้ามเดินเหยียบ",
      "เพราะ keep off แปลว่า ให้ดูแลรักษา",
      "เพราะ keep off แปลว่า อนุญาตให้เข้าไปได้",
      "เพราะ keep off แปลว่า ให้รดน้ำต้นไม้"
    ],
    correctReasonIndex: 0,
    keywords: ["KEEP OFF", "must not walk"],
    trapChoices: ["You can play on the grass.", "You must water the grass.", "You can cut the grass."],
    explanationThai: "Keep off แปลว่า ให้อยู่ห่าง จึงมีความหมายตรงกับ must not walk (ห้ามเดิน)",
    explanationEnglishShort: "'Keep off' means you must not walk on it."
  },
  {
    passage: "NO PARKING",
    question: "If you see this sign, what should you do?",
    choices: ["Park your car here.", "Do not leave your car here.", "Wash your car here.", "Sell your car here."],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Do not leave your car here?",
    reasonChoices: [
      "เพราะ No parking หมายถึง ห้ามจอดรถ ซึ่งตรงกับ do not leave your car",
      "เพราะ No parking หมายถึง อนุญาตให้จอดฟรี",
      "เพราะ No parking หมายถึง ที่ล้างรถ",
      "เพราะ No parking หมายถึง ห้ามขายรถ"
    ],
    correctReasonIndex: 0,
    keywords: ["NO PARKING", "Do not leave"],
    trapChoices: ["Park your car here.", "Wash your car here.", "Sell your car here."],
    explanationThai: "No parking คือห้ามจอดรถ ซึ่งความหมายเดียวกับ Do not leave your car here",
    explanationEnglishShort: "'No parking' means do not leave your car."
  },
  {
    passage: "WET FLOOR",
    question: "What should you be careful of?",
    choices: ["falling down", "getting burned", "wild animals", "loud noise"],
    correctIndex: 0,
    reasonQuestion: "ทำไมคำตอบจึงเป็น falling down?",
    reasonChoices: [
      "เพราะ wet floor (พื้นเปียก) อาจทำให้ลื่นล้ม (falling down) ได้",
      "เพราะ wet floor หมายถึง ระวังไฟไหม้",
      "เพราะ wet floor หมายถึง ระวังสัตว์ดุร้าย",
      "เพราะ wet floor หมายถึง ระวังเสียงดัง"
    ],
    correctReasonIndex: 0,
    keywords: ["WET FLOOR", "falling down"],
    trapChoices: ["getting burned", "wild animals", "loud noise"],
    explanationThai: "พื้นเปียก (wet floor) ทำให้เกิดอุบัติเหตุลื่นล้มได้",
    explanationEnglishShort: "A wet floor is slippery, so you might fall down."
  },
  {
    passage: "SILENCE PLEASE",
    question: "Where are you most likely to see this sign?",
    choices: ["in a library", "at a concert", "in a market", "at a football match"],
    correctIndex: 0,
    reasonQuestion: "ทำไมคำตอบจึงเป็น in a library?",
    reasonChoices: [
      "เพราะ silence แปลว่า ความเงียบ ซึ่งห้องสมุดต้องการความเงียบ",
      "เพราะ silence คือเสียงดัง เหมาะกับคอนเสิร์ต",
      "เพราะ silence คือตลาดสด",
      "เพราะ silence คือสนามกีฬา"
    ],
    correctReasonIndex: 0,
    keywords: ["SILENCE", "library"],
    trapChoices: ["at a concert", "in a market", "at a football match"],
    explanationThai: "Silence คือความเงียบ สถานที่ที่ต้องการความเงียบคือ library (ห้องสมุด)",
    explanationEnglishShort: "Libraries need silence for reading."
  }
];

const templatesConv = [
  {
    passage: "A: ________ B: I'm fine, thank you.",
    question: "What should A say?",
    choices: ["How old are you?", "How are you?", "What is your name?", "Where are you from?"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น How are you?",
    reasonChoices: [
      "เพราะ B ตอบว่า I'm fine ซึ่งเป็นการตอบรับคำทักทาย How are you",
      "เพราะ How old ถามอายุ",
      "เพราะ What is your name ถามชื่อ",
      "เพราะ Where are you from ถามที่มา"
    ],
    correctReasonIndex: 0,
    keywords: ["How are you", "I'm fine"],
    trapChoices: ["How old are you?", "What is your name?", "Where are you from?"],
    explanationThai: "I'm fine เป็นการบอกว่าสบายดี จึงต้องถูกถามด้วย How are you?",
    explanationEnglishShort: "'I'm fine' is the answer to 'How are you?'."
  },
  {
    passage: "You step on your friend's foot. What should you say?",
    question: "What is the polite response?",
    choices: ["Thank you.", "You're welcome.", "I'm sorry.", "Goodbye."],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น I'm sorry?",
    reasonChoices: [
      "เพราะการเหยียบเท้าคนอื่นเป็นการทำผิด ต้องกล่าวขอโทษ (I'm sorry)",
      "เพราะ Thank you ใช้เมื่อขอบคุณ",
      "เพราะ You're welcome ใช้ตอบรับคำขอบคุณ",
      "เพราะ Goodbye ใช้บอกลา"
    ],
    correctReasonIndex: 0,
    keywords: ["step on", "foot", "sorry"],
    trapChoices: ["Thank you.", "You're welcome.", "Goodbye."],
    explanationThai: "เมื่อทำผิด เช่นเหยียบเท้าเพื่อน ต้องพูดขอโทษ (I'm sorry)",
    explanationEnglishShort: "You should say sorry when you step on someone's foot."
  },
  {
    passage: "A: Could you pass me the salt, please? B: ________",
    question: "What should B say?",
    choices: ["No, I can't.", "Here you are.", "I don't know.", "Thank you."],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Here you are?",
    reasonChoices: [
      "เพราะ Here you are ใช้พูดเวลาส่งของให้ผู้อื่น",
      "เพราะ No, I can't เป็นการปฏิเสธที่เสียมารยาท",
      "เพราะ I don't know แปลว่าไม่รู้",
      "เพราะ Thank you เป็นคำขอบคุณ ไม่ใช่การส่งของ"
    ],
    correctReasonIndex: 0,
    keywords: ["pass me", "Here you are"],
    trapChoices: ["No, I can't.", "I don't know.", "Thank you."],
    explanationThai: "เมื่อมีคนขอให้ส่งของให้และเราส่งให้ จะใช้คำว่า Here you are (นี่ครับ/ค่ะ)",
    explanationEnglishShort: "Say 'Here you are' when giving something to someone."
  },
  {
    passage: "Teacher: ________ Student: It's cloudy and raining.",
    question: "What did the teacher ask?",
    choices: ["What time is it?", "How is the weather today?", "Where is your umbrella?", "What day is today?"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น How is the weather today?",
    reasonChoices: [
      "เพราะคำตอบ cloudy and raining เป็นเรื่องของสภาพอากาศ (weather)",
      "เพราะ What time ถามเวลา",
      "เพราะ Where is ถามสถานที่",
      "เพราะ What day ถามวันในสัปดาห์"
    ],
    correctReasonIndex: 0,
    keywords: ["weather", "cloudy", "raining"],
    trapChoices: ["What time is it?", "Where is your umbrella?", "What day is today?"],
    explanationThai: "คำตอบพูดถึงเมฆมากและฝนตก ซึ่งเป็นเรื่องสภาพอากาศ (weather)",
    explanationEnglishShort: "Cloudy and raining describe the weather."
  },
  {
    passage: "A: Nice to meet you. B: ________",
    question: "What should B say?",
    choices: ["Nice to meet you too.", "I am fine.", "See you tomorrow.", "Good morning."],
    correctIndex: 0,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Nice to meet you too?",
    reasonChoices: [
      "เพราะมารยาทเมื่อมีคนบอก Nice to meet you ต้องตอบรับด้วยคำเดียวกันพร้อมเติม too",
      "เพราะ I am fine ใช้ตอบ How are you",
      "เพราะ See you tomorrow ใช้ตอนลากัน",
      "เพราะ Good morning เป็นคำทักทายตอนเช้า"
    ],
    correctReasonIndex: 0,
    keywords: ["Nice to meet you", "too"],
    trapChoices: ["I am fine.", "See you tomorrow.", "Good morning."],
    explanationThai: "การตอบรับ ยินดีที่ได้รู้จักเช่นกัน คือเพิ่ม too ต่อท้ายประโยคเดิม",
    explanationEnglishShort: "Reply with 'Nice to meet you too'."
  }
];

const templatesMap = [
  {
    passage: "The hospital is next to the school and opposite the park.",
    question: "Where is the hospital?",
    choices: ["behind the park", "next to the school", "inside the school", "far from the park"],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น next to the school?",
    reasonChoices: [
      "เพราะโจทย์ระบุชัดเจนว่า next to the school",
      "เพราะโจทย์บอกว่า behind the park ซึ่งไม่จริง",
      "เพราะโจทย์บอกว่า inside the school ซึ่งผิด",
      "เพราะโจทย์ไม่ได้บอกระยะทาง"
    ],
    correctReasonIndex: 0,
    keywords: ["next to", "school"],
    trapChoices: ["behind the park", "inside the school", "far from the park"],
    explanationThai: "โจทย์บอกตำแหน่งชัดเจนว่า next to the school",
    explanationEnglishShort: "The text says 'next to the school'."
  },
  {
    passage: "Go straight, then turn left at the corner. The bank is on your right.",
    question: "How do you get to the bank?",
    choices: ["Turn right at the corner.", "Go straight and turn left.", "The bank is on your left.", "Turn around."],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Go straight and turn left?",
    reasonChoices: [
      "เพราะโจทย์บอกให้ Go straight, then turn left",
      "เพราะโจทย์ไม่ได้บอกให้ turn right at the corner",
      "เพราะโจทย์บอกว่า bank is on your right ไม่ใช่ left",
      "เพราะโจทย์ไม่ได้บอกให้ turn around"
    ],
    correctReasonIndex: 0,
    keywords: ["Go straight", "turn left"],
    trapChoices: ["Turn right at the corner.", "The bank is on your left.", "Turn around."],
    explanationThai: "โจทย์ระบุทิศทางคือ ตรงไปแล้วเลี้ยวซ้าย (Go straight and turn left)",
    explanationEnglishShort: "The directions say 'Go straight, then turn left'."
  },
  {
    passage: "The supermarket is between the post office and the pharmacy.",
    question: "What is next to the supermarket?",
    choices: ["only the post office", "only the pharmacy", "the post office and the pharmacy", "the park"],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น the post office and the pharmacy?",
    reasonChoices: [
      "เพราะคำว่า between หมายถึง อยู่ระหว่างสองสิ่ง ซึ่งก็คือทั้งคู่จะอยู่ข้างๆ (next to)",
      "เพราะมีเพียงไปรษณีย์ที่อยู่ติด",
      "เพราะมีเพียงร้านขายยาที่อยู่ติด",
      "เพราะสวนสาธารณะไม่ได้อยู่ในประโยค"
    ],
    correctReasonIndex: 0,
    keywords: ["between", "post office", "pharmacy"],
    trapChoices: ["only the post office", "only the pharmacy", "the park"],
    explanationThai: "Between แปลว่าอยู่ตรงกลางระหว่าง ดังนั้นทั้ง post office และ pharmacy จะอยู่ติดกับ supermarket",
    explanationEnglishShort: "Between means it is in the middle of both places."
  },
  {
    passage: "To get to the museum, cross the bridge and walk past the bakery.",
    question: "What do you do first?",
    choices: ["cross the bridge", "walk past the bakery", "go to the museum", "turn right"],
    correctIndex: 0,
    reasonQuestion: "ทำไมคำตอบจึงเป็น cross the bridge?",
    reasonChoices: [
      "เพราะลำดับแรกในประโยคคือ cross the bridge ก่อนที่จะ walk past the bakery",
      "เพราะต้องผ่านร้านเบเกอรี่ก่อน",
      "เพราะพิพิธภัณฑ์คือจุดหมาย ไม่ใช่สิ่งที่ทำอย่างแรก",
      "เพราะไม่มีคำว่า turn right"
    ],
    correctReasonIndex: 0,
    keywords: ["first", "cross the bridge"],
    trapChoices: ["walk past the bakery", "go to the museum", "turn right"],
    explanationThai: "ประโยคบอกให้ cross the bridge (ข้ามสะพาน) ก่อนเป็นลำดับแรก",
    explanationEnglishShort: "'cross the bridge' is the first instruction."
  },
  {
    passage: "The library is behind the school.",
    question: "Where is the school?",
    choices: ["in front of the library", "behind the library", "next to the library", "far away"],
    correctIndex: 0,
    reasonQuestion: "ทำไมคำตอบจึงเป็น in front of the library?",
    reasonChoices: [
      "เพราะถ้าห้องสมุดอยู่หลังโรงเรียน โรงเรียนก็ต้องอยู่หน้าห้องสมุด (in front of)",
      "เพราะโรงเรียนไม่ได้อยู่ข้างหลัง",
      "เพราะโรงเรียนไม่ได้อยู่ข้างๆ",
      "เพราะโรงเรียนไม่ได้อยู่ไกล"
    ],
    correctReasonIndex: 0,
    keywords: ["behind", "in front of"],
    trapChoices: ["behind the library", "next to the library", "far away"],
    explanationThai: "เป็นเรื่องของคำตรงข้าม ถ้ายกห้องสมุดอยู่ behind (หลัง) โรงเรียน โรงเรียนก็ต้องอยู่ in front of (หน้า) ห้องสมุด",
    explanationEnglishShort: "If A is behind B, B is in front of A."
  }
];

const templatesRead = [
  {
    passage: "Elephants are the largest land animals. They have big ears and a long trunk.",
    question: "What is the main idea of this text?",
    choices: ["Elephants are small.", "Elephants are the largest land animals.", "Elephants have small ears.", "Elephants live in the water."],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Elephants are the largest land animals?",
    reasonChoices: [
      "เพราะประโยคแรกระบุชัดเจนและเป็นใจความสำคัญของเรื่อง",
      "เพราะช้างตัวเล็ก ไม่จริง",
      "เพราะช้างมีหูเล็ก ไม่จริง",
      "เพราะช้างอยู่ในน้ำ ไม่จริงตามข้อความ"
    ],
    correctReasonIndex: 0,
    keywords: ["largest land animals", "main idea"],
    trapChoices: ["Elephants are small.", "Elephants have small ears.", "Elephants live in the water."],
    explanationThai: "ประโยคแรกสุดมักเป็น Main idea ซึ่งบอกว่าช้างเป็นสัตว์บกที่ใหญ่ที่สุด",
    explanationEnglishShort: "The first sentence gives the main idea."
  },
  {
    passage: "Lisa likes to eat fruits. Her favorite fruit is an apple.",
    question: "What is Lisa's favorite fruit?",
    choices: ["banana", "orange", "apple", "grape"],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น apple?",
    reasonChoices: [
      "เพราะประโยคบอกว่า Her favorite fruit is an apple",
      "เพราะโจทย์ไม่ได้พูดถึงกล้วย",
      "เพราะโจทย์ไม่ได้พูดถึงส้ม",
      "เพราะโจทย์ไม่ได้พูดถึงองุ่น"
    ],
    correctReasonIndex: 0,
    keywords: ["favorite fruit", "apple"],
    trapChoices: ["banana", "orange", "grape"],
    explanationThai: "โจทย์ถามรายละเอียดที่ระบุตรงๆ ในประโยคที่สองว่าคือ apple",
    explanationEnglishShort: "The text explicitly says her favorite fruit is an apple."
  },
  {
    passage: "It is raining heavily outside. Peter takes his umbrella before going out.",
    question: "Why does Peter take his umbrella?",
    choices: ["Because it is sunny.", "Because it is raining heavily.", "Because he likes umbrellas.", "Because it is snowing."],
    correctIndex: 1,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Because it is raining heavily?",
    reasonChoices: [
      "เพราะประโยคแรกบอกเหตุผลว่า It is raining heavily (ฝนตกหนัก)",
      "เพราะแดดไม่ได้ออก",
      "เพราะโจทย์ไม่ได้บอกว่าเขาชอบร่ม",
      "เพราะหิมะไม่ได้ตก"
    ],
    correctReasonIndex: 0,
    keywords: ["raining heavily", "umbrella"],
    trapChoices: ["Because it is sunny.", "Because he likes umbrellas.", "Because it is snowing."],
    explanationThai: "ฝนตกหนัก (raining heavily) คือเหตุผลที่ทำให้ปีเตอร์ต้องเอาร่มไป",
    explanationEnglishShort: "He needs an umbrella because it is raining."
  },
  {
    passage: "Anna usually wakes up at 6 AM. Today she woke up at 8 AM. She missed the school bus.",
    question: "What happened to Anna today?",
    choices: ["She woke up at 6 AM.", "She caught the school bus.", "She missed the school bus.", "She didn't go to school."],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น She missed the school bus?",
    reasonChoices: [
      "เพราะประโยคสุดท้ายบอกชัดเจนว่า She missed the school bus",
      "เพราะวันนี้เธอไม่ได้ตื่น 6 โมง",
      "เพราะเธอขึ้นรถบัสไม่ทัน",
      "เพราะโจทย์ไม่ได้บอกว่าเธอไม่ไปโรงเรียน"
    ],
    correctReasonIndex: 0,
    keywords: ["missed", "school bus"],
    trapChoices: ["She woke up at 6 AM.", "She caught the school bus.", "She didn't go to school."],
    explanationThai: "เหตุการณ์ที่เป็นผลลัพธ์ของวันนี้คือเธอตื่นสายและพลาดรถโรงเรียน (missed the school bus)",
    explanationEnglishShort: "The text says 'She missed the school bus'."
  },
  {
    passage: "Monkeys love eating bananas. They are very playful and live in trees.",
    question: "Which of the following is true?",
    choices: ["Monkeys hate bananas.", "Monkeys live in the water.", "Monkeys live in trees.", "Monkeys are not playful."],
    correctIndex: 2,
    reasonQuestion: "ทำไมคำตอบจึงเป็น Monkeys live in trees?",
    reasonChoices: [
      "เพราะตรงกับข้อความในเรื่องที่บอกว่า live in trees",
      "เพราะลิงไม่ได้เกลียดกล้วย",
      "เพราะลิงไม่ได้อยู่ในน้ำ",
      "เพราะลิงนั้น playful (ซุกซน) ต่างหาก"
    ],
    correctReasonIndex: 0,
    keywords: ["live in trees", "true"],
    trapChoices: ["Monkeys hate bananas.", "Monkeys live in the water.", "Monkeys are not playful."],
    explanationThai: "ข้อความบอกชัดเจนว่าลิงอาศัยอยู่บนต้นไม้ (live in trees)",
    explanationEnglishShort: "The text states that monkeys live in trees."
  }
];

const templatesBoss = [
  ...templatesQW.slice(0,1).map(t => ({...t, difficulty: 'boss'})),
  ...templatesSign.slice(0,1).map(t => ({...t, difficulty: 'boss'})),
  ...templatesConv.slice(0,1).map(t => ({...t, difficulty: 'boss'})),
  ...templatesMap.slice(0,1).map(t => ({...t, difficulty: 'boss'})),
  ...templatesRead.slice(0,1).map(t => ({...t, difficulty: 'boss'}))
];
// For Boss, reason language is simple_english
templatesBoss.forEach(t => {
  t.reasonQuestion = "Why is this the correct answer?";
  t.reasonChoices = t.reasonChoices.map((rc, idx) => {
    if (idx === t.correctReasonIndex) return "Because the passage shows the keyword: " + t.keywords[0];
    return "Because it is wrong information.";
  });
  t.reasonChoices[t.correctReasonIndex] = "Because the passage shows the keyword: " + t.keywords[0];
});

const qQW = generateQuestions('question_words', 'question_words', 30, templatesQW, 'easy');
const qSign = generateQuestions('sign_detective', 'signs', 30, templatesSign, 'easy');
const qConv = generateQuestions('conversation_rescue', 'conversation', 30, templatesConv, 'easy');
const qMap = generateQuestions('map_escape', 'directions', 30, templatesMap, 'easy');
const qRead = generateQuestions('reading_detective', 'reading', 30, templatesRead, 'easy');
const qBoss = generateQuestions('strategy_boss', 'mixed_onet_strategy', 30, templatesBoss, 'hard', 'strategy_boss');

const fileContent = "// GENERATED CHAPTER 3 QUESTIONS\n" +
"export const questionWordQuestions = " + JSON.stringify(qQW, null, 2) + ";\n" +
"export const signDetectiveQuestions = " + JSON.stringify(qSign, null, 2) + ";\n" +
"export const conversationRescueQuestions = " + JSON.stringify(qConv, null, 2) + ";\n" +
"export const mapEscapeQuestions = " + JSON.stringify(qMap, null, 2) + ";\n" +
"export const readingDetectiveQuestions = " + JSON.stringify(qRead, null, 2) + ";\n" +
"export const strategyBossQuestions = " + JSON.stringify(qBoss, null, 2) + ";\n";

fs.writeFileSync(path.join(__dirname, 'src', 'data', 'chapter3_questions.js'), fileContent);
console.log('Chapter 3 questions generated!');
