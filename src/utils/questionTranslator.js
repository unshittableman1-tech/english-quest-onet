// src/utils/questionTranslator.js
// ระบบแปลโจทย์ภาษาไทยอัตโนมัติ สำหรับนักเรียน ป.6

// ดิกชันนารีแปลประโยคคำถามภาษาอังกฤษยอดฮิตใน O-NET
const KNOWN_QUESTION_TRANSLATIONS = {
  // Signs & Notices
  'Read the sign: What should you do?': 'อ่านป้าย: คุณควรทำอย่างไร?',
  'What does this sign mean?': 'ป้ายนี้หมายความว่าอย่างไร?',
  'Where can you see this sign?': 'คุณสามารถพบเห็นป้ายนี้ได้ที่ไหน?',
  'What should you do when you see this sign?': 'คุณควรทำอย่างไรเมื่อเห็นป้ายนี้?',
  'Which of the following signs means': 'ป้ายในข้อใดต่อไปนี้มีความหมายว่า',

  // Weather & Seasons
  'You are in Canada in December. The weather is cold and snowy. What should you wear?':
    'คุณอยู่ในแคนาดาในเดือนธันวาคม สภาพอากาศหนาวจัดและมีหิมะตก คุณควรสวมใส่อะไร?',
  'In autumn in the USA, the leaves on trees usually…':
    'ในฤดูใบไม้ร่วงที่ประเทศสหรัฐอเมริกา ใบไม้บนต้นไม้มักจะ...',
  'It is very hot in July in Spain. What activity is the most suitable?':
    'อากาศร้อนมากในเดือนกรกฎาคมที่สเปน กิจกรรมใดเหมาะสมที่สุด?',
  'In winter, many families in Europe decorate their houses with lights. What festival is this?':
    'ในฤดูหนาว หลายครอบครัวในยุโรปประดับไฟที่บ้าน เทศกาลนี้คือเทศกาลอะไร?',
  'In spring, the weather is usually…':
    'ในฤดูใบไม้ผลิ สภาพอากาศมักจะเป็นอย่างไร...',
  'Which season is after summer in the UK?':
    'ฤดูใดต่อจากฤดูร้อนในสหราชอาณาจักร (อังกฤษ)?',
  "Tom is planning a picnic in England. He checks the weather forecast: 'It will rain tomorrow.' What should he do?":
    'ทอมกำลังวางแผนไปปิกนิกที่อังกฤษ เขาตรวจสอบพยากรณ์อากาศ: "พรุ่งนี้ฝนจะตก" เขาควรทำอย่างไร?',
  'In the USA, many people eat turkey and celebrate with family in November. What season is this?':
    'ในสหรัฐอเมริกา ผู้คนมากมายกินไก่งวงและเฉลิมฉลองกับครอบครัวในเดือนพฤศจิกายน ฤดูนี้คือฤดูอะไร?',
  'Which of the following sentences is correct?':
    'ประโยคในข้อใดถูกต้องที่สุด?',
  'You are in Australia in January. What is the weather like?':
    'คุณอยู่ในออสเตรเลียในเดือนมกราคม สภาพอากาศเป็นอย่างไร?',

  // Emotions & Feelings
  'You studied hard and got full marks on a test. What do you feel?':
    'คุณตั้งใจเรียนและสอบได้คะแนนเต็ม คุณรู้สึกอย่างไร?',
  'Your friend looks worried. What should you ask?':
    'เพื่อนของคุณดูมีสีหน้ากังวล คุณควรถามว่าอะไร?',
  'Your little brother broke your toy but he says sorry. What should you say?':
    'น้องชายทำของเล่นของคุณพังแต่เขาพูดขอโทษ คุณควรพูดว่าอะไร?',
  'You are nervous before speaking on stage. What will your heart do?':
    'คุณประหม่าตื่นเต้นก่อนพูดบนเวที หัวใจของคุณจะเป็นอย่างไร?',
  'Your teacher praises you for doing a good job. What do you feel?':
    'คุณครูชมเชยที่คุณทำผลงานได้ดี คุณรู้สึกอย่างไร?',
  'You are excited because your family will go to the beach tomorrow. What might you do?':
    'คุณรู้สึกตื่นเต้นมากเพราะครอบครัวจะไปเที่ยวทะเลพรุ่งนี้ คุณอาจจะทำอะไร?',
  'Your friend is very sad because he lost his bag. What should you do?':
    'เพื่อนของคุณเศร้ามากเพราะเขาทำกระเป๋าหาย คุณควรทำอย่างไร?',
  'You feel angry because someone took your seat. What should you say politely?':
    'คุณรู้สึกโกรธเพราะมีคนมาแย่งที่นั่ง คุณควรพูดอย่างสุภาพว่าอย่างไร?',
  'After playing football, you feel very tired. What can you say?':
    'หลังจากเล่นฟุตบอล คุณรู้สึกเหนื่อยมาก คุณจะพูดว่าอย่างไร?',
  'Your friend gives you a birthday gift. What should you say?':
    'เพื่อนให้ของขวัญวันเกิดแก่คุณ คุณควรพูดว่าอย่างไร?',

  // Classroom & Daily
  'What time is it?': 'ตอนนี้เวลาเท่าไหร่?',
  'How old are you?': 'คุณอายุเท่าไหร่?',
  'Where are you from?': 'คุณมาจากที่ไหน?',
  'How do you go to school?': 'คุณเดินทางไปโรงเรียนอย่างไร?',
  'What is your favourite subject?': 'วิชาโปรดของคุณคือวิชาอะไร?',
  'How much is this shirt?': 'เสื้อตัวนี้ราคาเท่าไหร่?',
  'What do you want to be?': 'คุณอยากโตขึ้นเป็นอะไร?',
  'Where is the hospital?': 'โรงพยาบาลอยู่ที่ไหน?'
};

// แปลประโยคสั้นๆ หรือบทสนทนา A: / B:
function translateDialogueOrSentence(text) {
  if (!text) return '';

  // เช็คข้อความตรงตัวในตารางแปล
  const trimmed = text.trim();
  if (KNOWN_QUESTION_TRANSLATIONS[trimmed]) {
    return KNOWN_QUESTION_TRANSLATIONS[trimmed];
  }

  // รูปแบบบทสนทนา A: "..." \n B: "..."
  if (text.includes('A:') && text.includes('B:')) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    const translatedLines = lines.map(line => {
      // แปล A: "Can I help you?"
      let res = line;
      res = res.replace(/A:\s*["']?Can I help you\?["']?/i, 'A: "มีอะไรให้ฉันช่วยไหม?"');
      res = res.replace(/B:\s*["']?Yes,\s*_{2,}\s*is the nearest hospital\?["']?/i, 'B: "ครับ/ค่ะ โรงพยาบาลที่ใกล้ที่สุดอยู่ที่____?"');
      res = res.replace(/A:\s*["']?How are you\?["']?/i, 'A: "สบายดีไหม?"');
      res = res.replace(/A:\s*["']?What time does the library open\?["']?/i, 'A: "ห้องสมุดเปิดกี่โมง?"');
      res = res.replace(/B:\s*["']?It opens\s*_{2,}\s*8 a\.m\.["']?/i, 'B: "เปิดตอน____ 8 โมงเช้า"');
      res = res.replace(/A:\s*["']?May I borrow your pen\?["']?/i, 'A: "ขอฉันยืมปากกาของคุณได้ไหม?"');
      res = res.replace(/A:\s*["']?How much is this shirt\?["']?/i, 'A: "เสื้อตัวนี้ราคาเท่าไหร่?"');
      res = res.replace(/B:\s*["']?It's\s*_{2,}\s*two hundred baht\.["']?/i, 'B: "ราคา____ สองร้อยบาท"');
      res = res.replace(/A:\s*["']?May I take your order\?["']?/i, 'A: "รับออเดอร์อะไรดีครับ/ค่ะ?"');
      res = res.replace(/B:\s*["']?_{2,},\s*please\.["']?/i, 'B: "ขอ____ ครับ/ค่ะ"');
      res = res.replace(/A:\s*["']?Is the soup hot\?["']?/i, 'A: "ซุปร้อนไหม?"');
      res = res.replace(/B:\s*["']?Yes,\s*_{2,}\s*very hot\.["']?/i, 'B: "ใช่ มัน____ ร้อนมาก"');
      return res;
    });

    if (translatedLines.every((line, index) => line !== lines[index] || /[\u0E00-\u0E7F]/.test(lines[index]))) {
      return translatedLines.join('\n');
    }
  }

  // ประโยคเติมคำในช่องว่างที่พบบ่อย
  if (/She\s+_{2,}\s+to school every day/i.test(text)) {
    return 'เธอ _____ ไปโรงเรียนทุกวัน (เติมคำกริยาที่ถูกต้อง)';
  }
  if (/I\s+_{2,}\s+my homework yesterday/i.test(text)) {
    return 'ฉัน _____ การบ้านของฉันเมื่อวานนี้ (อดีต past tense)';
  }
  if (/There\s+_{2,}\s+many students in the library/i.test(text)) {
    return 'มีนักเรียนหลายคน _____ ในห้องสมุด';
  }
  if (/She is\s+_{2,}\s+than her sister/i.test(text)) {
    return 'เธอ _____ กว่าพี่สาว/น้องสาวของเธอ (เปรียบเทียบขั้นกว่า)';
  }
  if (/_{2,}\s+she speak English\?/i.test(text)) {
    return 'เธอพูดภาษาอังกฤษใช่ไหม? (เลือก Do/Does)';
  }
  if (/_{2,}\s+does the party start\?/i.test(text)) {
    return '"งานเลี้ยงเริ่ม____?" ตอบ: ตอน 1 ทุ่ม (เลือกคำถาม)';
  }
  if (/_{2,}\s+is your favourite colour\?/i.test(text)) {
    return '"สีโปรดของคุณคือ____?" ตอบ: สีน้ำเงิน';
  }
  if (/_{2,}\s+are you crying\?/i.test(text)) {
    return '"คุณร้องไห้____?" ตอบ: เพราะฉันทำกระเป๋าหาย';
  }
  if (/_{2,}\s+students are in the class\?/i.test(text)) {
    return '"มีนักเรียน____คนในห้อง?" ตอบ: 30 คน';
  }
  if (/_{2,}\s+does it take to get there\?/i.test(text)) {
    return '"ใช้เวลานาน____เพื่อไปถึงที่นั่น?" ตอบ: ประมาณ 20 นาที';
  }

  return null;
}

/**
 * ดึงคำแปลภาษาไทยของโจทย์ข้อนี้
 * @param {Object} question
 * @returns {string} คำแปลภาษาไทยที่พร้อมอ่านออกเสียงและแสดงผล
 */
export function getQuestionTranslation(question) {
  if (!question) return '';

  // 1. ถ้ามีฟิลด์ translation หรือ thaiTranslation อยู่แล้ว
  if (typeof question.translation === 'string' && /[\u0E00-\u0E7F]/.test(question.translation)) {
    return question.translation.trim();
  }
  if (typeof question.thaiTranslation === 'string' && /[\u0E00-\u0E7F]/.test(question.thaiTranslation)) {
    return question.thaiTranslation.trim();
  }
  if (typeof question.questionThai === 'string' && /[\u0E00-\u0E7F]/.test(question.questionThai)) {
    return question.questionThai.trim();
  }

  const qText = (question.question || '').trim();

  // 2. ตรวจสอบในตารางแปลประโยคหรือบทสนทนา
  const directTrans = translateDialogueOrSentence(qText);
  if (directTrans) {
    return directTrans;
  }

  // 3. ถ้าโจทย์มีภาษาไทยปนอยู่มากแล้ว (เช่น "Bicycle" แปลว่าอะไร? หรือ ป้าย "Stop" สีแดงหมายความว่าอย่างไร?)
  const thaiCharCount = (qText.match(/[\u0E00-\u0E7F]/g) || []).length;
  if (thaiCharCount >= 6) {
    return qText;
  }

  // An explanation is not a translation; leave unavailable translations empty.
  return '';
}

/**
 * ดึงข้อความเสียงภาษาไทยที่เหมาะสมในการอ่านออกเสียงตอนตอบผิด
 * @param {Object} question 
 * @param {string} explanationText 
 * @returns {string}
 */
export function getSpokenFeedbackText(question, explanationText) {
  const trans = getQuestionTranslation(question);
  if (!trans) return explanationText || '';

  // ถ้าคำแปลกับโจทย์เหมือนกัน และเป็นไทยอยู่แล้ว
  const cleanTrans = trans.replace(/ถาม:\s*/g, 'คำถามคือ ').replace(/ตอบ:\s*/g, 'คำตอบคือ ');
  
  if (cleanTrans === explanationText) {
    return explanationText;
  }

  // อ่าน "แปลโจทย์: ... และเฉลยคือ: ..."
  return `แปลโจทย์: ${cleanTrans} ... เทคนิคคือ: ${explanationText}`;
}
