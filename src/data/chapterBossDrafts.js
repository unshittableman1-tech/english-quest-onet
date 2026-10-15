// Original practice drafts based on existing chapter objectives. Not copied O-NET items.
// These are intentionally outside QUESTS until the owner reviews their wording and keys.
const chapter2Items = [
  {
    question: 'A new classmate says, "Hello, I am Ben. Nice to meet you." What should you say?',
    options: ['Nice to meet you, too.', 'I am sorry to hear that.', 'You are welcome.', 'See you yesterday.'],
    answer: 0, explanation: 'Nice to meet you, too ตอบรับเมื่อรู้จักกันครั้งแรก',
    sourceQuests: ['conversation'], difficulty: 'introductory',
  },
  {
    question: 'Your friend says, "Thank you for helping me." Which reply is appropriate?',
    options: ['Never mind the price.', 'You are welcome.', 'I am ten years old.', 'Please be quiet.'],
    answer: 1, explanation: 'You are welcome ใช้ตอบคำขอบคุณ',
    sourceQuests: ['conversation'], difficulty: 'introductory',
  },
  {
    question: 'You accidentally step on a friend\'s foot. What should you say first?',
    options: ['Congratulations!', 'Good luck!', 'I am sorry.', 'How much is it?'],
    answer: 2, explanation: 'เมื่อทำให้ผู้อื่นเดือดร้อนโดยไม่ตั้งใจ ควรกล่าวขอโทษก่อน',
    sourceQuests: ['conversation', 'conversation_rescue'], difficulty: 'introductory',
  },
  {
    question: 'You need to borrow a ruler from a classmate. Which request is the most polite?',
    options: ['Give me your ruler now.', 'Your ruler is mine.', 'I will take your ruler.', 'Could I borrow your ruler, please?'],
    answer: 3, explanation: 'Could I ... please? เป็นรูปประโยคขออนุญาตอย่างสุภาพ',
    sourceQuests: ['conversation_rescue'], difficulty: 'application',
  },
  {
    question: 'Mali says, "I feel nervous about speaking in front of the class." What is the best response?',
    options: ['I can practise with you before class.', 'You should stop talking to everyone.', 'Your bag is under the table.', 'The shop closes at five.'],
    answer: 0, explanation: 'เพื่อนกำลังกังวล จึงควรเสนอตัวช่วยฝึกพูดและให้กำลังใจ',
    sourceQuests: ['emotions_feelings', 'conversation_rescue'], difficulty: 'application',
  },
  {
    question: 'Your friend has a fever and will miss school today. What should you say?',
    options: ['Have a nice trip!', 'I hope you feel better soon.', 'Happy birthday!', 'What is your job?'],
    answer: 1, explanation: 'I hope you feel better soon เป็นคำพูดให้กำลังใจผู้ป่วย',
    sourceQuests: ['emotions_feelings', 'conversation'], difficulty: 'application',
  },
  {
    question: 'A customer asks, "How much is the notebook?" Use the price list to answer.',
    stimuli: [{ type: 'table', columns: ['Item', 'Price'], rows: [['Pencil', '8 baht'], ['Eraser', '5 baht'], ['Notebook', '20 baht']] }],
    options: ['It is eight baht.', 'It is five baht.', 'It is twenty baht.', 'It is thirty baht.'],
    answer: 2, explanation: 'ดูแถว Notebook ในตาราง ราคา 20 baht จึงตอบ It is twenty baht.',
    sourceQuests: ['market', 'conversation'], difficulty: 'application',
  },
  {
    question: 'A child has a toothache. Which worker should the child visit?',
    options: ['A chef', 'A farmer', 'A pilot', 'A dentist'],
    answer: 3, explanation: 'Dentist คือทันตแพทย์ ผู้ตรวจและรักษาฟัน',
    sourceQuests: ['jobs'], difficulty: 'application',
  },
  {
    question: 'The shopkeeper says, "The blue pen is sold out, but the black pen is available." What can you buy now?',
    options: ['A black pen', 'A blue pen', 'Both pens', 'Neither pen'],
    answer: 0, explanation: 'Sold out หมายถึงขายหมด ส่วน available หมายถึงยังมีขาย',
    sourceQuests: ['market', 'conversation'], difficulty: 'interpretation',
  },
  {
    question: 'A classmate drops her books while you are on the way to lunch. Which response shows both concern and an offer of help?',
    options: ['I am hungry. Goodbye.', 'Are you okay? Let me help you pick them up.', 'How many books are in the library?', 'You must carry my books first.'],
    answer: 1, explanation: 'Are you okay? แสดงความห่วงใย และ Let me help ... เป็นการเสนอช่วย',
    sourceQuests: ['conversation_rescue', 'emotions_feelings'], difficulty: 'interpretation',
  },
];

const chapter5Items = [
  {
    question: 'There are ___ apples in the basket. Choose the correct word.',
    options: ['much', 'many', 'any water', 'a little'],
    answer: 1, explanation: 'Apples เป็นคำนามนับได้พหูพจน์ จึงใช้ many',
    sourceQuests: ['nouns_quantifiers'], difficulty: 'introductory',
  },
  {
    question: 'Which question correctly asks about the amount of water in a bottle?',
    options: ['How many water is there?', 'How often water is there?', 'How much water is there?', 'How long waters are there?'],
    answer: 2, explanation: 'Water เป็นคำนามนับไม่ได้ จึงถามปริมาณด้วย How much',
    sourceQuests: ['nouns_quantifiers'], difficulty: 'introductory',
  },
  {
    question: 'The red bag weighs 3 kg. The blue bag weighs 1 kg. Which sentence is correct?',
    options: ['The red bag is lighter than the blue bag.', 'The blue bag is heavier than the red bag.', 'Both bags weigh the same.', 'The red bag is heavier than the blue bag.'],
    answer: 3, explanation: '3 kg มากกว่า 1 kg ดังนั้นกระเป๋าสีแดงหนักกว่า (heavier than)',
    sourceQuests: ['adjectives_comp'], difficulty: 'application',
  },
  {
    question: 'It is raining on the way to school. Which item is the most useful to wear?',
    options: ['A raincoat', 'Sunglasses', 'A swimsuit', 'A scarf for snow'],
    answer: 0, explanation: 'Raincoat คือเสื้อกันฝน เหมาะกับสถานการณ์ฝนตก',
    sourceQuests: ['clothes_fashion'], difficulty: 'application',
  },
  {
    question: 'Ken is from Japan. What is his nationality?',
    options: ['Thai', 'Japanese', 'French', 'Chinese'],
    answer: 1, explanation: 'ประเทศ Japan ตรงกับสัญชาติ Japanese',
    sourceQuests: ['world_countries'], difficulty: 'application',
  },
  {
    question: 'Which habit can reduce single-use plastic waste at school?',
    options: ['Buying a new plastic cup every day', 'Throwing bottles into a river', 'Bringing a reusable water bottle', 'Leaving food wrappers on the ground'],
    answer: 2, explanation: 'ขวดน้ำที่ใช้ซ้ำได้ช่วยลดขยะพลาสติกแบบใช้ครั้งเดียว',
    sourceQuests: ['nature_environment'], difficulty: 'application',
  },
  {
    question: 'According to the timetable, which subject does Mali study first on Tuesday?',
    stimuli: [{ type: 'table', columns: ['Day', '9:00', '10:00'], rows: [['Monday', 'English', 'Science'], ['Tuesday', 'Mathematics', 'Art']] }],
    options: ['Art', 'Science', 'English', 'Mathematics'],
    answer: 3, explanation: 'วัน Tuesday เวลา 9:00 ในตารางเป็น Mathematics',
    sourceQuests: ['school_subjects'], difficulty: 'application',
  },
  {
    question: 'A poster says, "On Halloween, children visit homes and say a special phrase to ask for treats." Which phrase belongs on the poster?',
    options: ['Trick or treat!', 'Happy Songkran!', 'See you next year!', 'Welcome to school!'],
    answer: 0, explanation: 'Trick or treat เป็นวลีที่เด็กพูดเมื่อไปขอขนมในวัน Halloween',
    sourceQuests: ['culture_festivals'], difficulty: 'application',
  },
  {
    question: 'A school wants to make a festival display. Which pair matches the event and its traditional symbol?',
    options: ['Christmas - water gun', 'Loy Krathong - candle and flowers', 'Halloween - jasmine garland', 'Songkran - candy canes'],
    answer: 1, explanation: 'กระทงวันลอยกระทงมักมีเทียนและดอกไม้',
    sourceQuests: ['culture_festivals'], difficulty: 'interpretation',
  },
  {
    question: 'Mali has 40 baht and wants a reusable bottle for her school trip. Which choice costs less than her budget and also reduces waste?',
    stimuli: [{ type: 'table', columns: ['Item', 'Price'], rows: [['Reusable bottle', '35 baht'], ['Disposable cups (pack)', '25 baht'], ['New school bag', '120 baht']] }],
    options: ['Buy the bag for 120 baht.', 'Buy disposable cups for 25 baht.', 'Buy the reusable bottle for 35 baht.', 'Buy both the bottle and cups for 60 baht.'],
    answer: 2, explanation: '35 baht ต่ำกว่า 40 baht และขวดใช้ซ้ำช่วยลดขยะ',
    sourceQuests: ['nouns_quantifiers', 'nature_environment', 'school_subjects'], difficulty: 'interpretation',
  },
];

function makeDraft(chapter, items) {
  return items.map((item, index) => ({
    ...item,
    id: `chapter${chapter}_boss_draft_${String(index + 1).padStart(2, '0')}`,
    quest: `chapter${chapter}_boss`,
    itemVersion: 'boss-review-v1',
    reviewStatus: 'pending_teacher',
    approvedModes: [],
    intendedMode: 'practice_assessment',
    scoringPolicy: 'first_response_v1',
    correctFeedback: item.explanation,
    wrongFeedback: item.explanation,
    source: { type: 'original_practice_draft', title: `Chapter ${chapter} lesson objectives`, relatedQuests: item.sourceQuests },
    contentReview: { status: 'pending_owner', reviewer: null, version: 'boss-review-v1' },
    mediaReview: { status: item.stimuli ? 'pending_teacher' : 'not_required', version: 'boss-review-v1', reviewer: null },
  }));
}

export const CHAPTER_BOSS_DRAFTS = {
  2: makeDraft(2, chapter2Items),
  5: makeDraft(5, chapter5Items),
};

// The owner approved both review pages in chat on 2026-10-14. Keep the
// reviewed drafts intact; release copies are scoped to practice only.
export const CHAPTER_BOSS_QUESTIONS = Object.fromEntries(
  Object.entries(CHAPTER_BOSS_DRAFTS).map(([chapter, items]) => [chapter, items.map(item => ({
    ...structuredClone(item),
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment'],
    contentReview: {
      status: 'approved_for_practice',
      reviewer: 'workspace_owner',
      approvedBy: 'workspace_owner',
      approvedAt: '2026-10-14',
      approvalSource: `explicit_user_chat_after_chapter${chapter}_challenge_review`,
      version: item.itemVersion,
    },
    mediaReview: {
      status: item.stimuli ? 'verified' : 'not_required',
      reviewer: 'workspace_owner',
      approvedAt: '2026-10-14',
      scope: 'practice_assessment',
      version: item.itemVersion,
    },
  }))]),
);
