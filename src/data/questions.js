// ============================================================
// questions.js — Mock data ทุกด่าน พร้อม AI Tutor Feedback
// จำนวน 20 ข้อต่อด่าน
// ============================================================
import { getMissionsForQuest } from './missions/ch5_missions';
import { restoreSourceMedia } from './mediaRepairs';
import { restoreFamilyMedia } from './familyMediaRepairs';
import { QUEST_ASSESSMENTS } from './questAssessments';
import { cultureQuestions } from './cultureQuestions';
import { buildVocabularyAssessment } from './vocabularyAssessment';
import { O_NET_QUEST_UPGRADES } from './onetQuestUpgrades';
import { EXPANDED_ONET_ASSESSMENTS } from './expandedOnetAssessments';
import { OFFICIAL_ONET_BOSS_QUESTIONS } from './officialOnetBossQuestions';
import { finalBossQuestions } from './finalBossQuestions';
import { BOSS_ACTIVITY_FOCUS, BOSS_ACTIVITY_QUESTIONS } from './bossActivityQuestions';

function preserveQuestionIds(legacyQuestions, upgradedQuestions) {
  return upgradedQuestions.map((question, index) => ({
    ...question,
    id: legacyQuestions[index]?.id || question.id,
  }));
}

function uniqueQuestions(questions) {
  const seen = new Set();
  return questions.filter(question => {
    const key = JSON.stringify([question.question, question.image || null, question.passage || null]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function balanceDraftQuestionOptions(questions) {
  return questions.map((question, index) => {
    if (!Array.isArray(question.options) || question.options.length !== 4 || !Number.isInteger(question.answer)) return question;
    const target = index % 4;
    const shift = (question.answer - target + 4) % 4;
    if (!shift) return question;
    return { ...question, options: [...question.options.slice(shift), ...question.options.slice(0, shift)], answer: target };
  });
}

// ── helper: สร้าง quiz questions จาก fill_blank missions ของ Ch5 ──
function ch5QuizQuestions(questId) {
  if (QUEST_ASSESSMENTS[questId]) return QUEST_ASSESSMENTS[questId];
  const missions = getMissionsForQuest(questId);
  const fillMissions = missions.filter(m => m.type === 'fill_blank');
  return fillMissions.flatMap((m, mi) =>
    (m.questions || []).map((q, qi) => ({
      id: q.id || `${questId}_q${mi}_${qi}`,
      quest: questId,
      question: q.sentence,
      options: q.options,
      answer: q.answer,
      correctFeedback: q.answerThai || 'ถูกต้อง!',
      wrongFeedback: q.hint || '',
      keyword: q.answerThai || ''
    }))
  );
}

const legacyVocabularyQuestions = [
  { id: 'v01', quest: 'vocabulary', question: "\"Bicycle\" แปลว่าอะไร?", options: ["รถยนต์","รถจักรยาน","รถบัส","รถไฟ"], answer: 1, correctFeedback: "เก่งมาก! \"Bicycle\" แปลว่า รถจักรยาน", wrongFeedback: "Bi = สอง, cycle = วงล้อ ดังนั้น Bicycle = รถจักรยาน", keyword: "bicycle = รถจักรยาน"  },
  { id: 'v02', quest: 'vocabulary', question: "\"Motorcycle\" แปลว่าอะไร?", options: ["รถไฟ","รถเรือ","รถจักรยานยนต์","รถบรรทุก"], answer: 2, correctFeedback: "ถูกต้อง! \"Motorcycle\" คือ รถจักรยานยนต์", wrongFeedback: "Motor = เครื่องยนต์, Cycle = วงล้อ → Motorcycle = รถจักรยานยนต์", keyword: "motorcycle = รถจักรยานยนต์"  },
  { id: 'v03', quest: 'vocabulary', question: "ยานพาหนะชนิดใดที่วิ่งบนรางเหล็ก?", options: ["Bus","Taxi","Train","Van"], answer: 2, correctFeedback: "ใช่เลย! \"Train\" คือ รถไฟ", wrongFeedback: "รถไฟวิ่งบนราง = Train", keyword: "train = รถไฟ"  },
  { id: 'v04', quest: 'vocabulary', question: "\"Plane\" หมายถึงอะไร?", options: ["เรือ","เครื่องบิน","รถไฟ","รถบัส"], answer: 1, correctFeedback: "เยี่ยมมาก! \"Plane\" คือเครื่องบิน", wrongFeedback: "Plane = Airplane = เครื่องบิน", keyword: "plane = เครื่องบิน"  },
  { id: 'v05', quest: 'vocabulary', question: "\"Hospital\" คือสถานที่ใด?", options: ["ธนาคาร","ที่ทำการไปรษณีย์","โรงพยาบาล","ตลาด"], answer: 2, correctFeedback: "ถูกต้อง! \"Hospital\" คือ โรงพยาบาล", wrongFeedback: "Hospital = โรงพยาบาล", keyword: "hospital = โรงพยาบาล"  },
  { id: 'v06', quest: 'vocabulary', question: "\"Airport\" คืออะไร?", options: ["ท่าเรือ","สนามบิน","สถานีรถไฟ","โรงแรม"], answer: 1, correctFeedback: "ถูกแล้ว! \"Airport\" = สนามบิน", wrongFeedback: "Air = อากาศ, Port = ท่า → Airport = สนามบิน", keyword: "airport = สนามบิน"  },
  { id: 'v07', quest: 'vocabulary', question: "\"Restaurant\" แปลว่าอะไร?", options: ["ร้านกาแฟ","โรงแรม","ร้านอาหาร","ซุปเปอร์มาร์เก็ต"], answer: 2, correctFeedback: "เก่งมาก! \"Restaurant\" คือ ร้านอาหาร", wrongFeedback: "Restaurant = ร้านอาหาร", keyword: "restaurant = ร้านอาหาร"  },
  { id: 'v08', quest: 'vocabulary', question: "\"Ship\" กับ \"Boat\" ต่างกันอย่างไร?", options: ["Ship ใหญ่กว่า Boat","Boat ใหญ่กว่า Ship","เหมือนกันทุกอย่าง","Ship วิ่งบนบก"], answer: 0, correctFeedback: "ถูกเลย! Ship เป็นเรือขนาดใหญ่", wrongFeedback: "Ship = เรือขนาดใหญ่ | Boat = เรือขนาดเล็ก", keyword: "ship = เรือใหญ่ | boat = เรือเล็ก"  },
  { id: 'v09', quest: 'vocabulary', question: "ข้อใดคือสถานที่ฝากเงิน?", options: ["Market","Bank","School","Hospital"], answer: 1, correctFeedback: "ถูกต้อง! Bank = ธนาคาร", wrongFeedback: "Bank = ธนาคาร", keyword: "bank = ธนาคาร"  },
  { id: 'v10', quest: 'vocabulary', question: "\"Van\" คือยานพาหนะชนิดใด?", options: ["รถตู้","รถกระบะ","รถยนต์","รถจักรยาน"], answer: 0, correctFeedback: "ถูกแล้ว! Van = รถตู้", wrongFeedback: "Van = รถตู้", keyword: "van = รถตู้"  },
  { id: 'v11', quest: 'vocabulary', question: "\"Taxi\" แปลว่าอะไร?", options: ["รถบัส","รถแท็กซี่","รถตู้","รถจักรยานยนต์"], answer: 1, correctFeedback: "ถูกต้อง! Taxi = รถแท็กซี่", wrongFeedback: "Taxi = รถแท็กซี่", keyword: "taxi = รถแท็กซี่"  },
  { id: 'v12', quest: 'vocabulary', question: "\"Post Office\" คืออะไร?", options: ["โรงพยาบาล","ที่ทำการไปรษณีย์","สถานีตำรวจ","ธนาคาร"], answer: 1, correctFeedback: "เก่งมาก! Post Office = ที่ทำการไปรษณีย์", wrongFeedback: "Post = ไปรษณีย์, Office = สำนักงาน", keyword: "post office = ไปรษณีย์"  },
  { id: 'v13', quest: 'vocabulary', question: "\"Coffee Shop\" คืออะไร?", options: ["ร้านอาหาร","ร้านหนังสือ","ร้านกาแฟ","ร้านขายยา"], answer: 2, correctFeedback: "ถูกต้อง! Coffee Shop = ร้านกาแฟ", wrongFeedback: "Coffee Shop = ร้านกาแฟ", keyword: "coffee shop = ร้านกาแฟ"  },
  { id: 'v14', quest: 'vocabulary', question: "\"Bus\" แปลว่าอะไร?", options: ["รถไฟ","รถเมล์/รถบัส","รถแท็กซี่","เครื่องบิน"], answer: 1, correctFeedback: "ถูกแล้ว! Bus = รถเมล์", wrongFeedback: "Bus = รถเมล์หรือรถบัส", keyword: "bus = รถเมล์"  },
  { id: 'v15', quest: 'vocabulary', question: "\"Market\" คืออะไร?", options: ["โรงเรียน","ตลาด","โรงพยาบาล","สนามบิน"], answer: 1, correctFeedback: "เก่งมาก! Market = ตลาด", wrongFeedback: "Market = ตลาด", keyword: "market = ตลาด"  },
  { id: 'v16', quest: 'vocabulary', question: "\"Library\" คือสถานที่ใด?", options: ["ห้องสมุด","โรงยิม","โรงอาหาร","ห้องเรียน"], answer: 0, correctFeedback: "ถูกต้อง! Library = ห้องสมุด", wrongFeedback: "Library = ห้องสมุด (มีหนังสือให้อ่าน)", keyword: "library = ห้องสมุด"  },
  { id: 'v17', quest: 'vocabulary', question: "\"Police Station\" คืออะไร?", options: ["สถานีดับเพลิง","สถานีรถไฟ","สถานีตำรวจ","สถานีอนามัย"], answer: 2, correctFeedback: "เก่งมาก! Police = ตำรวจ, Station = สถานี", wrongFeedback: "Police Station = สถานีตำรวจ", keyword: "police station = สถานีตำรวจ"  },
  { id: 'v18', quest: 'vocabulary', question: "ข้อใดคือ \"สตรอเบอร์รี่\" ในภาษาอังกฤษ?", options: ["Apple","Banana","Strawberry","Orange"], answer: 2, correctFeedback: "ถูกแล้ว! Strawberry = สตรอเบอร์รี่", wrongFeedback: "Strawberry = สตรอเบอร์รี่", keyword: "strawberry = สตรอเบอร์รี่"  },
  { id: 'v19', quest: 'vocabulary', question: "\"Window\" แปลว่าอะไร?", options: ["ประตู","หน้าต่าง","หลังคา","พื้น"], answer: 1, correctFeedback: "ถูกต้อง! Window = หน้าต่าง", wrongFeedback: "Window = หน้าต่าง | Door = ประตู", keyword: "window = หน้าต่าง"  },
  { id: 'v20', quest: 'vocabulary', question: "\"Breakfast\" คือมื้ออาหารเวลาใด?", options: ["มื้อเช้า","มื้อกลางวัน","มื้อเย็น","มื้อดึก"], answer: 0, correctFeedback: "ถูกเลย! Breakfast = อาหารมื้อเช้า", wrongFeedback: "Breakfast = อาหารเช้า | Lunch = กลางวัน | Dinner = เย็น", keyword: "breakfast = อาหารเช้า"  },
  { id: 'v21', quest: 'vocabulary', question: "\"Bicycle\" แปลว่าอะไร?", options: ["รถยนต์","รถจักรยาน","รถบัส","รถไฟ"], answer: 1, correctFeedback: "เก่งมาก! \"Bicycle\" แปลว่า รถจักรยาน", wrongFeedback: "Bi = สอง, cycle = วงล้อ ดังนั้น Bicycle = รถจักรยาน", keyword: "bicycle = รถจักรยาน"  },
  { id: 'v22', quest: 'vocabulary', question: "\"Motorcycle\" แปลว่าอะไร?", options: ["รถไฟ","รถเรือ","รถจักรยานยนต์","รถบรรทุก"], answer: 2, correctFeedback: "ถูกต้อง! \"Motorcycle\" คือ รถจักรยานยนต์", wrongFeedback: "Motor = เครื่องยนต์, Cycle = วงล้อ → Motorcycle = รถจักรยานยนต์", keyword: "motorcycle = รถจักรยานยนต์"  },
  { id: 'v23', quest: 'vocabulary', question: "ยานพาหนะชนิดใดที่วิ่งบนรางเหล็ก?", options: ["Bus","Taxi","Train","Van"], answer: 2, correctFeedback: "ใช่เลย! \"Train\" คือ รถไฟ", wrongFeedback: "รถไฟวิ่งบนราง = Train", keyword: "train = รถไฟ"  },
  { id: 'v24', quest: 'vocabulary', question: "\"Plane\" หมายถึงอะไร?", options: ["เรือ","เครื่องบิน","รถไฟ","รถบัส"], answer: 1, correctFeedback: "เยี่ยมมาก! \"Plane\" คือเครื่องบิน", wrongFeedback: "Plane = Airplane = เครื่องบิน", keyword: "plane = เครื่องบิน"  },
  { id: 'v25', quest: 'vocabulary', question: "\"Hospital\" คือสถานที่ใด?", options: ["ธนาคาร","ที่ทำการไปรษณีย์","โรงพยาบาล","ตลาด"], answer: 2, correctFeedback: "ถูกต้อง! \"Hospital\" คือ โรงพยาบาล", wrongFeedback: "Hospital = โรงพยาบาล", keyword: "hospital = โรงพยาบาล"  },
  { id: 'v26', quest: 'vocabulary', question: "\"Airport\" คืออะไร?", options: ["ท่าเรือ","สนามบิน","สถานีรถไฟ","โรงแรม"], answer: 1, correctFeedback: "ถูกแล้ว! \"Airport\" = สนามบิน", wrongFeedback: "Air = อากาศ, Port = ท่า → Airport = สนามบิน", keyword: "airport = สนามบิน"  },
  { id: 'v27', quest: 'vocabulary', question: "\"Restaurant\" แปลว่าอะไร?", options: ["ร้านกาแฟ","โรงแรม","ร้านอาหาร","ซุปเปอร์มาร์เก็ต"], answer: 2, correctFeedback: "เก่งมาก! \"Restaurant\" คือ ร้านอาหาร", wrongFeedback: "Restaurant = ร้านอาหาร", keyword: "restaurant = ร้านอาหาร"  },
  { id: 'v28', quest: 'vocabulary', question: "\"Ship\" กับ \"Boat\" ต่างกันอย่างไร?", options: ["Ship ใหญ่กว่า Boat","Boat ใหญ่กว่า Ship","เหมือนกันทุกอย่าง","Ship วิ่งบนบก"], answer: 0, correctFeedback: "ถูกเลย! Ship เป็นเรือขนาดใหญ่", wrongFeedback: "Ship = เรือขนาดใหญ่ | Boat = เรือขนาดเล็ก", keyword: "ship = เรือใหญ่ | boat = เรือเล็ก"  },
  { id: 'v29', quest: 'vocabulary', question: "ข้อใดคือสถานที่ฝากเงิน?", options: ["Market","Bank","School","Hospital"], answer: 1, correctFeedback: "ถูกต้อง! Bank = ธนาคาร", wrongFeedback: "Bank = ธนาคาร", keyword: "bank = ธนาคาร"  },
  { id: 'v30', quest: 'vocabulary', question: "\"Van\" คือยานพาหนะชนิดใด?", options: ["รถตู้","รถกระบะ","รถยนต์","รถจักรยาน"], answer: 0, correctFeedback: "ถูกแล้ว! Van = รถตู้", wrongFeedback: "Van = รถตู้", keyword: "van = รถตู้"  },
  { id: 'v31', quest: 'vocabulary', question: "\"Taxi\" แปลว่าอะไร?", options: ["รถบัส","รถแท็กซี่","รถตู้","รถจักรยานยนต์"], answer: 1, correctFeedback: "ถูกต้อง! Taxi = รถแท็กซี่", wrongFeedback: "Taxi = รถแท็กซี่", keyword: "taxi = รถแท็กซี่"  },
  { id: 'v32', quest: 'vocabulary', question: "\"Post Office\" คืออะไร?", options: ["โรงพยาบาล","ที่ทำการไปรษณีย์","สถานีตำรวจ","ธนาคาร"], answer: 1, correctFeedback: "เก่งมาก! Post Office = ที่ทำการไปรษณีย์", wrongFeedback: "Post = ไปรษณีย์, Office = สำนักงาน", keyword: "post office = ไปรษณีย์"  },
  { id: 'v33', quest: 'vocabulary', question: "\"Coffee Shop\" คืออะไร?", options: ["ร้านอาหาร","ร้านหนังสือ","ร้านกาแฟ","ร้านขายยา"], answer: 2, correctFeedback: "ถูกต้อง! Coffee Shop = ร้านกาแฟ", wrongFeedback: "Coffee Shop = ร้านกาแฟ", keyword: "coffee shop = ร้านกาแฟ"  },
  { id: 'v34', quest: 'vocabulary', question: "\"Bus\" แปลว่าอะไร?", options: ["รถไฟ","รถเมล์/รถบัส","รถแท็กซี่","เครื่องบิน"], answer: 1, correctFeedback: "ถูกแล้ว! Bus = รถเมล์", wrongFeedback: "Bus = รถเมล์หรือรถบัส", keyword: "bus = รถเมล์"  },
  { id: 'v35', quest: 'vocabulary', question: "\"Market\" คืออะไร?", options: ["โรงเรียน","ตลาด","โรงพยาบาล","สนามบิน"], answer: 1, correctFeedback: "เก่งมาก! Market = ตลาด", wrongFeedback: "Market = ตลาด", keyword: "market = ตลาด"  },
  { id: 'v36', quest: 'vocabulary', question: "\"Library\" คือสถานที่ใด?", options: ["ห้องสมุด","โรงยิม","โรงอาหาร","ห้องเรียน"], answer: 0, correctFeedback: "ถูกต้อง! Library = ห้องสมุด", wrongFeedback: "Library = ห้องสมุด (มีหนังสือให้อ่าน)", keyword: "library = ห้องสมุด"  },
  { id: 'v37', quest: 'vocabulary', question: "\"Police Station\" คืออะไร?", options: ["สถานีดับเพลิง","สถานีรถไฟ","สถานีตำรวจ","สถานีอนามัย"], answer: 2, correctFeedback: "เก่งมาก! Police = ตำรวจ, Station = สถานี", wrongFeedback: "Police Station = สถานีตำรวจ", keyword: "police station = สถานีตำรวจ"  },
  { id: 'v38', quest: 'vocabulary', question: "ข้อใดคือ \"สตรอเบอร์รี่\" ในภาษาอังกฤษ?", options: ["Apple","Banana","Strawberry","Orange"], answer: 2, correctFeedback: "ถูกแล้ว! Strawberry = สตรอเบอร์รี่", wrongFeedback: "Strawberry = สตรอเบอร์รี่", keyword: "strawberry = สตรอเบอร์รี่"  },
  { id: 'v39', quest: 'vocabulary', question: "\"Window\" แปลว่าอะไร?", options: ["ประตู","หน้าต่าง","หลังคา","พื้น"], answer: 1, correctFeedback: "ถูกต้อง! Window = หน้าต่าง", wrongFeedback: "Window = หน้าต่าง | Door = ประตู", keyword: "window = หน้าต่าง"  },
  { id: 'v40', quest: 'vocabulary', question: "\"Breakfast\" คือมื้ออาหารเวลาใด?", options: ["มื้อเช้า","มื้อกลางวัน","มื้อเย็น","มื้อดึก"], answer: 0, correctFeedback: "ถูกเลย! Breakfast = อาหารมื้อเช้า", wrongFeedback: "Breakfast = อาหารเช้า | Lunch = กลางวัน | Dinner = เย็น", keyword: "breakfast = อาหารเช้า"  },
  { id: 'v41', quest: 'vocabulary', question: "\"Bicycle\" แปลว่าอะไร?", options: ["รถยนต์","รถจักรยาน","รถบัส","รถไฟ"], answer: 1, correctFeedback: "เก่งมาก! \"Bicycle\" แปลว่า รถจักรยาน", wrongFeedback: "Bi = สอง, cycle = วงล้อ ดังนั้น Bicycle = รถจักรยาน", keyword: "bicycle = รถจักรยาน"  },
  { id: 'v42', quest: 'vocabulary', question: "\"Motorcycle\" แปลว่าอะไร?", options: ["รถไฟ","รถเรือ","รถจักรยานยนต์","รถบรรทุก"], answer: 2, correctFeedback: "ถูกต้อง! \"Motorcycle\" คือ รถจักรยานยนต์", wrongFeedback: "Motor = เครื่องยนต์, Cycle = วงล้อ → Motorcycle = รถจักรยานยนต์", keyword: "motorcycle = รถจักรยานยนต์"  },
  { id: 'v43', quest: 'vocabulary', question: "ยานพาหนะชนิดใดที่วิ่งบนรางเหล็ก?", options: ["Bus","Taxi","Train","Van"], answer: 2, correctFeedback: "ใช่เลย! \"Train\" คือ รถไฟ", wrongFeedback: "รถไฟวิ่งบนราง = Train", keyword: "train = รถไฟ"  },
  { id: 'v44', quest: 'vocabulary', question: "\"Plane\" หมายถึงอะไร?", options: ["เรือ","เครื่องบิน","รถไฟ","รถบัส"], answer: 1, correctFeedback: "เยี่ยมมาก! \"Plane\" คือเครื่องบิน", wrongFeedback: "Plane = Airplane = เครื่องบิน", keyword: "plane = เครื่องบิน"  },
  { id: 'v45', quest: 'vocabulary', question: "\"Hospital\" คือสถานที่ใด?", options: ["ธนาคาร","ที่ทำการไปรษณีย์","โรงพยาบาล","ตลาด"], answer: 2, correctFeedback: "ถูกต้อง! \"Hospital\" คือ โรงพยาบาล", wrongFeedback: "Hospital = โรงพยาบาล", keyword: "hospital = โรงพยาบาล"  },
  { id: 'v46', quest: 'vocabulary', question: "\"Airport\" คืออะไร?", options: ["ท่าเรือ","สนามบิน","สถานีรถไฟ","โรงแรม"], answer: 1, correctFeedback: "ถูกแล้ว! \"Airport\" = สนามบิน", wrongFeedback: "Air = อากาศ, Port = ท่า → Airport = สนามบิน", keyword: "airport = สนามบิน"  },
  { id: 'v47', quest: 'vocabulary', question: "\"Restaurant\" แปลว่าอะไร?", options: ["ร้านกาแฟ","โรงแรม","ร้านอาหาร","ซุปเปอร์มาร์เก็ต"], answer: 2, correctFeedback: "เก่งมาก! \"Restaurant\" คือ ร้านอาหาร", wrongFeedback: "Restaurant = ร้านอาหาร", keyword: "restaurant = ร้านอาหาร"  },
  { id: 'v48', quest: 'vocabulary', question: "\"Ship\" กับ \"Boat\" ต่างกันอย่างไร?", options: ["Ship ใหญ่กว่า Boat","Boat ใหญ่กว่า Ship","เหมือนกันทุกอย่าง","Ship วิ่งบนบก"], answer: 0, correctFeedback: "ถูกเลย! Ship เป็นเรือขนาดใหญ่", wrongFeedback: "Ship = เรือขนาดใหญ่ | Boat = เรือขนาดเล็ก", keyword: "ship = เรือใหญ่ | boat = เรือเล็ก"  },
  { id: 'v49', quest: 'vocabulary', question: "ข้อใดคือสถานที่ฝากเงิน?", options: ["Market","Bank","School","Hospital"], answer: 1, correctFeedback: "ถูกต้อง! Bank = ธนาคาร", wrongFeedback: "Bank = ธนาคาร", keyword: "bank = ธนาคาร"  },
  { id: 'v50', quest: 'vocabulary', question: "\"Van\" คือยานพาหนะชนิดใด?", options: ["รถตู้","รถกระบะ","รถยนต์","รถจักรยาน"], answer: 0, correctFeedback: "ถูกแล้ว! Van = รถตู้", wrongFeedback: "Van = รถตู้", keyword: "van = รถตู้"  }
];

export const vocabularyQuestions = buildVocabularyAssessment();

export const signsQuestions = [
  { id: 's01', quest: 'signs', question: "\"No Parking\" หมายความว่าอะไร?", options: ["ห้ามจอดรถ","ที่จอดรถ","ห้ามแซง","ทางเดินรถ"], answer: 0, correctFeedback: "ถูกต้อง! No Parking = ห้ามจอดรถ", wrongFeedback: "No + คำนาม = ห้าม... | Parking = การจอดรถ", keyword: "No Parking = ห้ามจอดรถ"  },
  { id: 's02', quest: 'signs', question: "\"No U-turn\" หมายความว่าอะไร?", options: ["ห้ามเลี้ยวซ้าย","ห้ามกลับรถ","ให้กลับรถ","ห้ามเลี้ยวขวา"], answer: 1, correctFeedback: "ถูก! No U-turn = ห้ามกลับรถ", wrongFeedback: "U-turn คือการกลับรถรูปตัว U", keyword: "No U-turn = ห้ามกลับรถ"  },
  { id: 's03', quest: 'signs', question: "\"No Horn\" หมายความว่าอะไร?", options: ["ห้ามใช้เสียงแตร","ห้ามเข้า","ห้ามส่งเสียง","ระวังเสียงดัง"], answer: 0, correctFeedback: "ถูกต้อง! No Horn = ห้ามบีบแตร", wrongFeedback: "Horn = แตรรถ", keyword: "No Horn = ห้ามบีบแตร"  },
  { id: 's04', quest: 'signs', question: "\"School Zone\" หมายความว่าอะไร?", options: ["สนามเด็กเล่น","เขตโรงเรียน","โรงเรียนปิด","ห้ามเด็กเข้า"], answer: 1, correctFeedback: "ถูกเลย! School Zone = เขตโรงเรียน", wrongFeedback: "School = โรงเรียน, Zone = เขต", keyword: "School Zone = เขตโรงเรียน", image: "/images/school_sign.svg" },
  { id: 's05', quest: 'signs', question: "\"Fire Exit\" หมายความว่าอะไร?", options: ["ทางออกฉุกเฉิน","ห้ามก่อไฟ","ถังดับเพลิง","เขตอันตราย"], answer: 0, correctFeedback: "ถูกต้อง! Fire Exit = ทางออกฉุกเฉิน (หนีไฟ)", wrongFeedback: "Fire = ไฟ, Exit = ทางออก", keyword: "Fire Exit = ทางออกฉุกเฉิน"  },
  { id: 's06', quest: 'signs', question: "\"Wet Floor\" หมายความว่าอะไร?", options: ["ห้ามเดิน","พื้นเปียก/ระวังลื่น","ทำความสะอาด","ห้ามวิ่ง"], answer: 1, correctFeedback: "ถูกแล้ว! Wet Floor = พื้นเปียก", wrongFeedback: "Wet = เปียก, Floor = พื้น", keyword: "Wet Floor = พื้นเปียก"  },
  { id: 's07', quest: 'signs', question: "\"No Photography\" หมายความว่าอะไร?", options: ["ห้ามถ่ายรูป","ห้ามใช้กล้อง","ถ่ายรูปได้","ห้ามเข้า"], answer: 0, correctFeedback: "ถูกต้อง! No Photography = ห้ามถ่ายรูป", wrongFeedback: "Photography = การถ่ายภาพ", keyword: "No Photography = ห้ามถ่ายรูป"  },
  { id: 's08', quest: 'signs', question: "\"No Pets Allowed\" หมายความว่าอะไร?", options: ["นำสัตว์เลี้ยงเข้าได้","ห้ามนำสัตว์เลี้ยงเข้า","ห้ามส่งเสียง","เขตสัตว์"], answer: 1, correctFeedback: "ถูกเลย! ห้ามนำสัตว์เลี้ยงเข้า", wrongFeedback: "Pets = สัตว์เลี้ยง, Allowed = อนุญาต", keyword: "No Pets Allowed = ห้ามสัตว์เลี้ยงเข้า"  },
  { id: 's09', quest: 'signs', question: "\"Toilet\" หมายความว่าอะไร?", options: ["ห้องนอน","ห้องน้ำ","ห้องรับแขก","ทางออก"], answer: 1, correctFeedback: "ถูกต้อง! Toilet = ห้องน้ำ", wrongFeedback: "Toilet = ห้องน้ำ", keyword: "Toilet = ห้องน้ำ", image: "/images/male_toilet.jpg" },
  { id: 's10', quest: 'signs', question: "\"Traffic Light\" คืออะไร?", options: ["ไฟฉุกเฉิน","ไฟสัญญาณจราจร","ป้ายหยุด","ไฟเตือน"], answer: 1, correctFeedback: "ถูกแล้ว! Traffic Light = สัญญาณไฟจราจร", wrongFeedback: "Traffic = จราจร, Light = ไฟ", keyword: "Traffic Light = ไฟจราจร"  },
  { id: 's11', quest: 'signs', question: "\"No Smoking\" หมายความว่าอะไร?", options: ["ห้ามสูบบุหรี่","เขตสูบบุหรี่","ห้ามจุดไฟ","ระวังควัน"], answer: 0, correctFeedback: "ถูกต้อง! No Smoking = ห้ามสูบบุหรี่", wrongFeedback: "Smoke = ควัน/สูบ", keyword: "No Smoking = ห้ามสูบบุหรี่"  },
  { id: 's12', quest: 'signs', question: "Read the sign: What should you do?", options: ["Go ahead","Stop and do not enter","Run quickly","Turn left"], answer: 1, correctFeedback: "ถูกเลย! ป้าย No Entry = Stop and do not enter (ห้ามเข้า)", wrongFeedback: "No Entry = ห้ามเข้า (Stop and do not enter)", keyword: "No Entry = ห้ามเข้า", image: "/images/no_entry.svg" },
  { id: 's13', quest: 'signs', question: "ป้าย \"Stop\" สีแดงหมายความว่าอย่างไร?", options: ["ไปต่อได้","ขับช้าๆ","หยุด","เลี้ยวขวา"], answer: 2, correctFeedback: "ถูกต้อง! Stop = หยุด", wrongFeedback: "Stop แปลว่า หยุด", keyword: "Stop = หยุด"  },
  { id: 's14', quest: 'signs', question: "\"Speed Limit 50\" หมายความว่าอะไร?", options: ["ขับช้ากว่า 50","จำกัดความเร็วไม่เกิน 50","ขับเร็ว 50 ขึ้นไป","ระยะทาง 50 กม."], answer: 1, correctFeedback: "ถูกแล้ว! Speed Limit = จำกัดความเร็ว", wrongFeedback: "Speed = ความเร็ว, Limit = ขีดจำกัด", keyword: "Speed Limit = จำกัดความเร็ว"  },
  { id: 's15', quest: 'signs', question: "\"No Food or Drink\" หมายความว่าอะไร?", options: ["ขายอาหาร","กินได้","ห้ามนำอาหารและเครื่องดื่มเข้า","ห้องอาหาร"], answer: 2, correctFeedback: "ถูกต้อง! ห้ามกินหรือดื่ม", wrongFeedback: "Food = อาหาร, Drink = เครื่องดื่ม", keyword: "No Food or Drink = ห้ามกิน/ดื่ม"  },
  { id: 's16', quest: 'signs', question: "\"Danger\" หมายความว่าอะไร?", options: ["ปลอดภัย","อันตราย","ห้ามเข้า","ทางออก"], answer: 1, correctFeedback: "ถูกเลย! Danger = อันตราย", wrongFeedback: "Danger = อันตราย", keyword: "Danger = อันตราย"  },
  { id: 's17', quest: 'signs', question: "\"Beware of Dog\" หมายความว่าอะไร?", options: ["ห้ามนำสุนัขเข้า","ระวังสุนัขดุ","ขายสุนัข","สวนสุนัข"], answer: 1, correctFeedback: "ถูกต้อง! Beware = ระวัง", wrongFeedback: "Beware of = ระวัง...", keyword: "Beware of Dog = ระวังสุนัข"  },
  { id: 's18', quest: 'signs', question: "\"Keep Left\" หมายความว่าอะไร?", options: ["ชิดขวา","ชิดซ้าย","ตรงไป","หยุด"], answer: 1, correctFeedback: "ถูกแล้ว! Keep Left = ชิดซ้าย", wrongFeedback: "Keep = รักษาไว้, Left = ซ้าย", keyword: "Keep Left = ชิดซ้าย"  },
  { id: 's19', quest: 'signs', question: "ป้ายรูปคนกำลังล้ม หมายความว่าอะไร?", options: ["ห้ามล้ม","พื้นลื่น","ห้ามวิ่ง","ให้กระโดด"], answer: 1, correctFeedback: "ถูกต้อง! หมายถึง Slippery Floor (พื้นลื่น)", wrongFeedback: "รูปคนล้มแปลว่าพื้นลื่น ระวัง!", keyword: "Slippery = ลื่น"  },
  { id: 's20', quest: 'signs', question: "\"Do Not Touch\" หมายความว่าอะไร?", options: ["ห้ามจับ","จับได้","ระวังของแตก","ห้ามถ่ายรูป"], answer: 0, correctFeedback: "ถูกเลย! Touch = สัมผัส/จับ", wrongFeedback: "Do Not = ห้าม, Touch = จับ", keyword: "Do Not Touch = ห้ามจับ"  },
  { id: 's21', quest: 'signs', question: "\"No Parking\" หมายความว่าอะไร?", options: ["ห้ามจอดรถ","ที่จอดรถ","ห้ามแซง","ทางเดินรถ"], answer: 0, correctFeedback: "ถูกต้อง! No Parking = ห้ามจอดรถ", wrongFeedback: "No + คำนาม = ห้าม... | Parking = การจอดรถ", keyword: "No Parking = ห้ามจอดรถ"  },
  { id: 's22', quest: 'signs', question: "\"No U-turn\" หมายความว่าอะไร?", options: ["ห้ามเลี้ยวซ้าย","ห้ามกลับรถ","ให้กลับรถ","ห้ามเลี้ยวขวา"], answer: 1, correctFeedback: "ถูก! No U-turn = ห้ามกลับรถ", wrongFeedback: "U-turn คือการกลับรถรูปตัว U", keyword: "No U-turn = ห้ามกลับรถ"  },
  { id: 's23', quest: 'signs', question: "\"No Horn\" หมายความว่าอะไร?", options: ["ห้ามใช้เสียงแตร","ห้ามเข้า","ห้ามส่งเสียง","ระวังเสียงดัง"], answer: 0, correctFeedback: "ถูกต้อง! No Horn = ห้ามบีบแตร", wrongFeedback: "Horn = แตรรถ", keyword: "No Horn = ห้ามบีบแตร"  },
  { id: 's24', quest: 'signs', question: "\"School Zone\" หมายความว่าอะไร?", options: ["สนามเด็กเล่น","เขตโรงเรียน","โรงเรียนปิด","ห้ามเด็กเข้า"], answer: 1, correctFeedback: "ถูกเลย! School Zone = เขตโรงเรียน", wrongFeedback: "School = โรงเรียน, Zone = เขต", keyword: "School Zone = เขตโรงเรียน"  },
  { id: 's25', quest: 'signs', question: "\"Fire Exit\" หมายความว่าอะไร?", options: ["ทางออกฉุกเฉิน","ห้ามก่อไฟ","ถังดับเพลิง","เขตอันตราย"], answer: 0, correctFeedback: "ถูกต้อง! Fire Exit = ทางออกฉุกเฉิน (หนีไฟ)", wrongFeedback: "Fire = ไฟ, Exit = ทางออก", keyword: "Fire Exit = ทางออกฉุกเฉิน"  },
  { id: 's26', quest: 'signs', question: "\"Wet Floor\" หมายความว่าอะไร?", options: ["ห้ามเดิน","พื้นเปียก/ระวังลื่น","ทำความสะอาด","ห้ามวิ่ง"], answer: 1, correctFeedback: "ถูกแล้ว! Wet Floor = พื้นเปียก", wrongFeedback: "Wet = เปียก, Floor = พื้น", keyword: "Wet Floor = พื้นเปียก"  },
  { id: 's27', quest: 'signs', question: "\"No Photography\" หมายความว่าอะไร?", options: ["ห้ามถ่ายรูป","ห้ามใช้กล้อง","ถ่ายรูปได้","ห้ามเข้า"], answer: 0, correctFeedback: "ถูกต้อง! No Photography = ห้ามถ่ายรูป", wrongFeedback: "Photography = การถ่ายภาพ", keyword: "No Photography = ห้ามถ่ายรูป"  },
  { id: 's28', quest: 'signs', question: "\"No Pets Allowed\" หมายความว่าอะไร?", options: ["นำสัตว์เลี้ยงเข้าได้","ห้ามนำสัตว์เลี้ยงเข้า","ห้ามส่งเสียง","เขตสัตว์"], answer: 1, correctFeedback: "ถูกเลย! ห้ามนำสัตว์เลี้ยงเข้า", wrongFeedback: "Pets = สัตว์เลี้ยง, Allowed = อนุญาต", keyword: "No Pets Allowed = ห้ามสัตว์เลี้ยงเข้า"  },
  { id: 's29', quest: 'signs', question: "\"Toilet\" หมายความว่าอะไร?", options: ["ห้องนอน","ห้องน้ำ","ห้องรับแขก","ทางออก"], answer: 1, correctFeedback: "ถูกต้อง! Toilet = ห้องน้ำ", wrongFeedback: "Toilet = ห้องน้ำ", keyword: "Toilet = ห้องน้ำ"  },
  { id: 's30', quest: 'signs', question: "\"Traffic Light\" คืออะไร?", options: ["ไฟฉุกเฉิน","ไฟสัญญาณจราจร","ป้ายหยุด","ไฟเตือน"], answer: 1, correctFeedback: "ถูกแล้ว! Traffic Light = สัญญาณไฟจราจร", wrongFeedback: "Traffic = จราจร, Light = ไฟ", keyword: "Traffic Light = ไฟจราจร"  },
  { id: 's31', quest: 'signs', question: "\"No Smoking\" หมายความว่าอะไร?", options: ["ห้ามสูบบุหรี่","เขตสูบบุหรี่","ห้ามจุดไฟ","ระวังควัน"], answer: 0, correctFeedback: "ถูกต้อง! No Smoking = ห้ามสูบบุหรี่", wrongFeedback: "Smoke = ควัน/สูบ", keyword: "No Smoking = ห้ามสูบบุหรี่"  },
  { id: 's32', quest: 'signs', question: "\"No Entry\" หมายความว่าอะไร?", options: ["ทางเข้า","ห้ามเข้า","ทางออก","ห้ามออก"], answer: 1, correctFeedback: "ถูกเลย! No Entry = ห้ามเข้า", wrongFeedback: "Entry = การเข้าไป", keyword: "No Entry = ห้ามเข้า"  },
  { id: 's33', quest: 'signs', question: "ป้าย \"Stop\" สีแดงหมายความว่าอย่างไร?", options: ["ไปต่อได้","ขับช้าๆ","หยุด","เลี้ยวขวา"], answer: 2, correctFeedback: "ถูกต้อง! Stop = หยุด", wrongFeedback: "Stop แปลว่า หยุด", keyword: "Stop = หยุด"  },
  { id: 's34', quest: 'signs', question: "\"Speed Limit 50\" หมายความว่าอะไร?", options: ["ขับช้ากว่า 50","จำกัดความเร็วไม่เกิน 50","ขับเร็ว 50 ขึ้นไป","ระยะทาง 50 กม."], answer: 1, correctFeedback: "ถูกแล้ว! Speed Limit = จำกัดความเร็ว", wrongFeedback: "Speed = ความเร็ว, Limit = ขีดจำกัด", keyword: "Speed Limit = จำกัดความเร็ว"  },
  { id: 's35', quest: 'signs', question: "\"No Food or Drink\" หมายความว่าอะไร?", options: ["ขายอาหาร","กินได้","ห้ามนำอาหารและเครื่องดื่มเข้า","ห้องอาหาร"], answer: 2, correctFeedback: "ถูกต้อง! ห้ามกินหรือดื่ม", wrongFeedback: "Food = อาหาร, Drink = เครื่องดื่ม", keyword: "No Food or Drink = ห้ามกิน/ดื่ม"  },
  { id: 's36', quest: 'signs', question: "\"Danger\" หมายความว่าอะไร?", options: ["ปลอดภัย","อันตราย","ห้ามเข้า","ทางออก"], answer: 1, correctFeedback: "ถูกเลย! Danger = อันตราย", wrongFeedback: "Danger = อันตราย", keyword: "Danger = อันตราย"  },
  { id: 's37', quest: 'signs', question: "\"Beware of Dog\" หมายความว่าอะไร?", options: ["ห้ามนำสุนัขเข้า","ระวังสุนัขดุ","ขายสุนัข","สวนสุนัข"], answer: 1, correctFeedback: "ถูกต้อง! Beware = ระวัง", wrongFeedback: "Beware of = ระวัง...", keyword: "Beware of Dog = ระวังสุนัข"  },
  { id: 's38', quest: 'signs', question: "\"Keep Left\" หมายความว่าอะไร?", options: ["ชิดขวา","ชิดซ้าย","ตรงไป","หยุด"], answer: 1, correctFeedback: "ถูกแล้ว! Keep Left = ชิดซ้าย", wrongFeedback: "Keep = รักษาไว้, Left = ซ้าย", keyword: "Keep Left = ชิดซ้าย"  },
  { id: 's39', quest: 'signs', question: "ป้ายรูปคนกำลังล้ม หมายความว่าอะไร?", options: ["ห้ามล้ม","พื้นลื่น","ห้ามวิ่ง","ให้กระโดด"], answer: 1, correctFeedback: "ถูกต้อง! หมายถึง Slippery Floor (พื้นลื่น)", wrongFeedback: "รูปคนล้มแปลว่าพื้นลื่น ระวัง!", keyword: "Slippery = ลื่น"  },
  { id: 's40', quest: 'signs', question: "\"Do Not Touch\" หมายความว่าอะไร?", options: ["ห้ามจับ","จับได้","ระวังของแตก","ห้ามถ่ายรูป"], answer: 0, correctFeedback: "ถูกเลย! Touch = สัมผัส/จับ", wrongFeedback: "Do Not = ห้าม, Touch = จับ", keyword: "Do Not Touch = ห้ามจับ"  },
  { id: 's41', quest: 'signs', question: "\"No Parking\" หมายความว่าอะไร?", options: ["ห้ามจอดรถ","ที่จอดรถ","ห้ามแซง","ทางเดินรถ"], answer: 0, correctFeedback: "ถูกต้อง! No Parking = ห้ามจอดรถ", wrongFeedback: "No + คำนาม = ห้าม... | Parking = การจอดรถ", keyword: "No Parking = ห้ามจอดรถ"  },
  { id: 's42', quest: 'signs', question: "\"No U-turn\" หมายความว่าอะไร?", options: ["ห้ามเลี้ยวซ้าย","ห้ามกลับรถ","ให้กลับรถ","ห้ามเลี้ยวขวา"], answer: 1, correctFeedback: "ถูก! No U-turn = ห้ามกลับรถ", wrongFeedback: "U-turn คือการกลับรถรูปตัว U", keyword: "No U-turn = ห้ามกลับรถ"  },
  { id: 's43', quest: 'signs', question: "\"No Horn\" หมายความว่าอะไร?", options: ["ห้ามใช้เสียงแตร","ห้ามเข้า","ห้ามส่งเสียง","ระวังเสียงดัง"], answer: 0, correctFeedback: "ถูกต้อง! No Horn = ห้ามบีบแตร", wrongFeedback: "Horn = แตรรถ", keyword: "No Horn = ห้ามบีบแตร"  },
  { id: 's44', quest: 'signs', question: "\"School Zone\" หมายความว่าอะไร?", options: ["สนามเด็กเล่น","เขตโรงเรียน","โรงเรียนปิด","ห้ามเด็กเข้า"], answer: 1, correctFeedback: "ถูกเลย! School Zone = เขตโรงเรียน", wrongFeedback: "School = โรงเรียน, Zone = เขต", keyword: "School Zone = เขตโรงเรียน"  },
  { id: 's45', quest: 'signs', question: "\"Fire Exit\" หมายความว่าอะไร?", options: ["ทางออกฉุกเฉิน","ห้ามก่อไฟ","ถังดับเพลิง","เขตอันตราย"], answer: 0, correctFeedback: "ถูกต้อง! Fire Exit = ทางออกฉุกเฉิน (หนีไฟ)", wrongFeedback: "Fire = ไฟ, Exit = ทางออก", keyword: "Fire Exit = ทางออกฉุกเฉิน"  },
  { id: 's46', quest: 'signs', question: "\"Wet Floor\" หมายความว่าอะไร?", options: ["ห้ามเดิน","พื้นเปียก/ระวังลื่น","ทำความสะอาด","ห้ามวิ่ง"], answer: 1, correctFeedback: "ถูกแล้ว! Wet Floor = พื้นเปียก", wrongFeedback: "Wet = เปียก, Floor = พื้น", keyword: "Wet Floor = พื้นเปียก"  },
  { id: 's47', quest: 'signs', question: "\"No Photography\" หมายความว่าอะไร?", options: ["ห้ามถ่ายรูป","ห้ามใช้กล้อง","ถ่ายรูปได้","ห้ามเข้า"], answer: 0, correctFeedback: "ถูกต้อง! No Photography = ห้ามถ่ายรูป", wrongFeedback: "Photography = การถ่ายภาพ", keyword: "No Photography = ห้ามถ่ายรูป"  },
  { id: 's48', quest: 'signs', question: "\"No Pets Allowed\" หมายความว่าอะไร?", options: ["นำสัตว์เลี้ยงเข้าได้","ห้ามนำสัตว์เลี้ยงเข้า","ห้ามส่งเสียง","เขตสัตว์"], answer: 1, correctFeedback: "ถูกเลย! ห้ามนำสัตว์เลี้ยงเข้า", wrongFeedback: "Pets = สัตว์เลี้ยง, Allowed = อนุญาต", keyword: "No Pets Allowed = ห้ามสัตว์เลี้ยงเข้า"  },
  { id: 's49', quest: 'signs', question: "\"Toilet\" หมายความว่าอะไร?", options: ["ห้องนอน","ห้องน้ำ","ห้องรับแขก","ทางออก"], answer: 1, correctFeedback: "ถูกต้อง! Toilet = ห้องน้ำ", wrongFeedback: "Toilet = ห้องน้ำ", keyword: "Toilet = ห้องน้ำ"  },
  { id: 's50', quest: 'signs', question: "\"Traffic Light\" คืออะไร?", options: ["ไฟฉุกเฉิน","ไฟสัญญาณจราจร","ป้ายหยุด","ไฟเตือน"], answer: 1, correctFeedback: "ถูกแล้ว! Traffic Light = สัญญาณไฟจราจร", wrongFeedback: "Traffic = จราจร, Light = ไฟ", keyword: "Traffic Light = ไฟจราจร"  }
];

export const directionsQuestions = [
  { id: 'd01', quest: 'directions', question: "\"Go straight\" หมายความว่าอะไร?", options: ["เลี้ยวซ้าย","ตรงไป","เลี้ยวขวา","หยุด"], answer: 1, correctFeedback: "ถูกต้อง! Go straight = ตรงไป", wrongFeedback: "straight = ตรง", keyword: "go straight = ตรงไป"  },
  { id: 'd02', quest: 'directions', question: "\"Turn left\" หมายความว่าอะไร?", options: ["เลี้ยวขวา","ตรงไป","เลี้ยวซ้าย","กลับหลัง"], answer: 2, correctFeedback: "ถูก! Turn left = เลี้ยวซ้าย", wrongFeedback: "left = ซ้าย", keyword: "turn left = เลี้ยวซ้าย"  },
  { id: 'd03', quest: 'directions', question: "\"Turn right\" หมายความว่าอะไร?", options: ["เลี้ยวซ้าย","ตรงไป","กลับหลัง","เลี้ยวขวา"], answer: 3, correctFeedback: "ถูกแล้ว! Turn right = เลี้ยวขวา", wrongFeedback: "right = ขวา", keyword: "turn right = เลี้ยวขวา"  },
  { id: 'd04', quest: 'directions', question: "\"Next to\" หมายความว่าอะไร?", options: ["ตรงข้าม","ติดกับ/ข้างๆ","ระหว่าง","ด้านหลัง"], answer: 1, correctFeedback: "ถูกต้อง! Next to = ติดกับ", wrongFeedback: "Next to = ติดกับ", keyword: "next to = ติดกับ"  },
  { id: 'd05', quest: 'directions', question: "\"Opposite\" หมายความว่าอะไร?", options: ["ใกล้กับ","ด้านหลัง","ตรงข้าม","ด้านบน"], answer: 2, correctFeedback: "ถูกเลย! Opposite = ตรงข้าม", wrongFeedback: "Opposite = ตรงข้าม", keyword: "opposite = ตรงข้าม"  },
  { id: 'd06', quest: 'directions', question: "\"Between\" หมายความว่าอะไร?", options: ["ด้านหน้า","ระหว่าง","ด้านหลัง","ใกล้ๆ"], answer: 1, correctFeedback: "ถูกต้อง! Between = ระหว่าง", wrongFeedback: "Between = ระหว่าง (2 สิ่ง)", keyword: "between = ระหว่าง"  },
  { id: 'd07', quest: 'directions', question: "\"Near\" หมายความว่าอะไร?", options: ["ไกล","ใกล้","ตรงข้าม","ระหว่าง"], answer: 1, correctFeedback: "ถูกแล้ว! Near = ใกล้", wrongFeedback: "Near = ใกล้ ↔ Far = ไกล", keyword: "near = ใกล้"  },
  { id: 'd08', quest: 'directions', question: "\"Behind\" หมายความว่าอะไร?", options: ["ด้านหน้า","ด้านข้าง","ด้านหลัง","ด้านบน"], answer: 2, correctFeedback: "ถูกต้อง! Behind = ด้านหลัง", wrongFeedback: "Behind = ด้านหลัง", keyword: "behind = ด้านหลัง"  },
  { id: 'd09', quest: 'directions', question: "The hospital is ___ the school and the bank.", options: ["opposite","between","near","behind"], answer: 1, correctFeedback: "ถูกต้อง! อยู่ระหว่าง 2 สิ่งใช้ between", wrongFeedback: "มี A and B ต้องใช้ between (ระหว่าง)", keyword: "between A and B"  },
  { id: 'd10', quest: 'directions', question: "\"On the right\" หมายความว่าอะไร?", options: ["ทางซ้ายมือ","ตรงหน้า","ทางขวามือ","ด้านหลัง"], answer: 2, correctFeedback: "ถูกแล้ว! On the right = ทางขวามือ", wrongFeedback: "right = ขวา", keyword: "on the right = ขวามือ"  },
  { id: 'd11', quest: 'directions', question: "\"On the left\" หมายความว่าอะไร?", options: ["ทางซ้ายมือ","ทางขวามือ","ด้านหน้า","ตรงข้าม"], answer: 0, correctFeedback: "ถูกต้อง! On the left = ทางซ้ายมือ", wrongFeedback: "left = ซ้าย", keyword: "on the left = ซ้ายมือ"  },
  { id: 'd12', quest: 'directions', question: "\"Turn around\" หมายความว่าอะไร?", options: ["เลี้ยวขวา","ตรงไป","กลับหลังหัน","ข้ามถนน"], answer: 2, correctFeedback: "ถูกเลย! Turn around = กลับหลังหัน/กลับรถ", wrongFeedback: "around = รอบๆ, turn around = หันกลับ", keyword: "turn around = กลับหลัง"  },
  { id: 'd13', quest: 'directions', question: "\"On the corner\" หมายความว่าอะไร?", options: ["บนเพดาน","ตรงมุมถนน","กลางซอย","หน้าบ้าน"], answer: 1, correctFeedback: "ถูกต้อง! Corner = มุม", wrongFeedback: "corner = มุมถนน", keyword: "on the corner = ตรงมุม"  },
  { id: 'd14', quest: 'directions', question: "\"Cross the road\" หมายความว่าอะไร?", options: ["ข้ามถนน","เดินตามถนน","สร้างถนน","จอดรถ"], answer: 0, correctFeedback: "ถูกแล้ว! Cross = ข้าม, Road = ถนน", wrongFeedback: "cross = ข้าม, road = ถนน", keyword: "cross the road = ข้ามถนน"  },
  { id: 'd15', quest: 'directions', question: "\"Walk past\" หมายความว่าอะไร?", options: ["เดินช้าๆ","วิ่งผ่าน","เดินผ่านไป","หยุดเดิน"], answer: 2, correctFeedback: "ถูกต้อง! Walk = เดิน, past = ผ่าน", wrongFeedback: "past = ผ่าน", keyword: "walk past = เดินผ่าน"  },
  { id: 'd16', quest: 'directions', question: "\"In front of\" หมายความว่าอะไร?", options: ["ด้านหลัง","ด้านหน้า","ด้านข้าง","ตรงกลาง"], answer: 1, correctFeedback: "ถูกเลย! In front of = ด้านหน้า", wrongFeedback: "front = หน้า", keyword: "in front of = ด้านหน้า"  },
  { id: 'd17', quest: 'directions', question: "\"Go along this street\" หมายความว่าอะไร?", options: ["ไปตามถนนเส้นนี้","เลี้ยวซ้าย","เลี้ยวขวา","กลับรถ"], answer: 0, correctFeedback: "ถูกต้อง! Go along = ไปตามทาง", wrongFeedback: "along = ไปตาม, street = ถนน", keyword: "go along = ไปตามทาง"  },
  { id: 'd18', quest: 'directions', question: "\"Take the first right\" หมายความว่าอะไร?", options: ["เลี้ยวขวาแยกที่สอง","เลี้ยวขวาแยกแรก","เลี้ยวซ้ายแยกแรก","ตรงไปแยกแรก"], answer: 1, correctFeedback: "ถูกแล้ว! first = แรก, right = ขวา", wrongFeedback: "first = อันแรก, right = ขวา", keyword: "first right = ขวาแยกแรก"  },
  { id: 'd19', quest: 'directions', question: "\"At the traffic light\" หมายความว่าอะไร?", options: ["ที่ป้ายรถเมล์","ที่สถานีตำรวจ","ที่ไฟจราจร","ที่ทางม้าลาย"], answer: 2, correctFeedback: "ถูกต้อง! Traffic light = ไฟจราจร", wrongFeedback: "traffic light = ไฟจราจร", keyword: "traffic light = ไฟจราจร"  },
  { id: 'd20', quest: 'directions', question: "\"Over there\" หมายความว่าอะไร?", options: ["ตรงนี้","ตรงนั้น/ตรงนู้น","ด้านหลัง","ข้างล่าง"], answer: 1, correctFeedback: "ถูกเลย! Over there = ตรงนู้น", wrongFeedback: "here = ตรงนี้, there = ตรงนั้น", keyword: "over there = ตรงนั้น"  },
  { id: 'd21', quest: 'directions', question: "\"Go straight\" หมายความว่าอะไร?", options: ["เลี้ยวซ้าย","ตรงไป","เลี้ยวขวา","หยุด"], answer: 1, correctFeedback: "ถูกต้อง! Go straight = ตรงไป", wrongFeedback: "straight = ตรง", keyword: "go straight = ตรงไป"  },
  { id: 'd22', quest: 'directions', question: "\"Turn left\" หมายความว่าอะไร?", options: ["เลี้ยวขวา","ตรงไป","เลี้ยวซ้าย","กลับหลัง"], answer: 2, correctFeedback: "ถูก! Turn left = เลี้ยวซ้าย", wrongFeedback: "left = ซ้าย", keyword: "turn left = เลี้ยวซ้าย"  },
  { id: 'd23', quest: 'directions', question: "\"Turn right\" หมายความว่าอะไร?", options: ["เลี้ยวซ้าย","ตรงไป","กลับหลัง","เลี้ยวขวา"], answer: 3, correctFeedback: "ถูกแล้ว! Turn right = เลี้ยวขวา", wrongFeedback: "right = ขวา", keyword: "turn right = เลี้ยวขวา"  },
  { id: 'd24', quest: 'directions', question: "\"Next to\" หมายความว่าอะไร?", options: ["ตรงข้าม","ติดกับ/ข้างๆ","ระหว่าง","ด้านหลัง"], answer: 1, correctFeedback: "ถูกต้อง! Next to = ติดกับ", wrongFeedback: "Next to = ติดกับ", keyword: "next to = ติดกับ"  },
  { id: 'd25', quest: 'directions', question: "\"Opposite\" หมายความว่าอะไร?", options: ["ใกล้กับ","ด้านหลัง","ตรงข้าม","ด้านบน"], answer: 2, correctFeedback: "ถูกเลย! Opposite = ตรงข้าม", wrongFeedback: "Opposite = ตรงข้าม", keyword: "opposite = ตรงข้าม"  },
  { id: 'd26', quest: 'directions', question: "\"Between\" หมายความว่าอะไร?", options: ["ด้านหน้า","ระหว่าง","ด้านหลัง","ใกล้ๆ"], answer: 1, correctFeedback: "ถูกต้อง! Between = ระหว่าง", wrongFeedback: "Between = ระหว่าง (2 สิ่ง)", keyword: "between = ระหว่าง"  },
  { id: 'd27', quest: 'directions', question: "\"Near\" หมายความว่าอะไร?", options: ["ไกล","ใกล้","ตรงข้าม","ระหว่าง"], answer: 1, correctFeedback: "ถูกแล้ว! Near = ใกล้", wrongFeedback: "Near = ใกล้ ↔ Far = ไกล", keyword: "near = ใกล้"  },
  { id: 'd28', quest: 'directions', question: "\"Behind\" หมายความว่าอะไร?", options: ["ด้านหน้า","ด้านข้าง","ด้านหลัง","ด้านบน"], answer: 2, correctFeedback: "ถูกต้อง! Behind = ด้านหลัง", wrongFeedback: "Behind = ด้านหลัง", keyword: "behind = ด้านหลัง"  },
  { id: 'd29', quest: 'directions', question: "The hospital is ___ the school and the bank.", options: ["opposite","between","near","behind"], answer: 1, correctFeedback: "ถูกต้อง! อยู่ระหว่าง 2 สิ่งใช้ between", wrongFeedback: "มี A and B ต้องใช้ between (ระหว่าง)", keyword: "between A and B"  },
  { id: 'd30', quest: 'directions', question: "\"On the right\" หมายความว่าอะไร?", options: ["ทางซ้ายมือ","ตรงหน้า","ทางขวามือ","ด้านหลัง"], answer: 2, correctFeedback: "ถูกแล้ว! On the right = ทางขวามือ", wrongFeedback: "right = ขวา", keyword: "on the right = ขวามือ"  },
  { id: 'd31', quest: 'directions', question: "\"On the left\" หมายความว่าอะไร?", options: ["ทางซ้ายมือ","ทางขวามือ","ด้านหน้า","ตรงข้าม"], answer: 0, correctFeedback: "ถูกต้อง! On the left = ทางซ้ายมือ", wrongFeedback: "left = ซ้าย", keyword: "on the left = ซ้ายมือ"  },
  { id: 'd32', quest: 'directions', question: "\"Turn around\" หมายความว่าอะไร?", options: ["เลี้ยวขวา","ตรงไป","กลับหลังหัน","ข้ามถนน"], answer: 2, correctFeedback: "ถูกเลย! Turn around = กลับหลังหัน/กลับรถ", wrongFeedback: "around = รอบๆ, turn around = หันกลับ", keyword: "turn around = กลับหลัง"  },
  { id: 'd33', quest: 'directions', question: "\"On the corner\" หมายความว่าอะไร?", options: ["บนเพดาน","ตรงมุมถนน","กลางซอย","หน้าบ้าน"], answer: 1, correctFeedback: "ถูกต้อง! Corner = มุม", wrongFeedback: "corner = มุมถนน", keyword: "on the corner = ตรงมุม"  },
  { id: 'd34', quest: 'directions', question: "\"Cross the road\" หมายความว่าอะไร?", options: ["ข้ามถนน","เดินตามถนน","สร้างถนน","จอดรถ"], answer: 0, correctFeedback: "ถูกแล้ว! Cross = ข้าม, Road = ถนน", wrongFeedback: "cross = ข้าม, road = ถนน", keyword: "cross the road = ข้ามถนน"  },
  { id: 'd35', quest: 'directions', question: "\"Walk past\" หมายความว่าอะไร?", options: ["เดินช้าๆ","วิ่งผ่าน","เดินผ่านไป","หยุดเดิน"], answer: 2, correctFeedback: "ถูกต้อง! Walk = เดิน, past = ผ่าน", wrongFeedback: "past = ผ่าน", keyword: "walk past = เดินผ่าน"  },
  { id: 'd36', quest: 'directions', question: "\"In front of\" หมายความว่าอะไร?", options: ["ด้านหลัง","ด้านหน้า","ด้านข้าง","ตรงกลาง"], answer: 1, correctFeedback: "ถูกเลย! In front of = ด้านหน้า", wrongFeedback: "front = หน้า", keyword: "in front of = ด้านหน้า"  },
  { id: 'd37', quest: 'directions', question: "\"Go along this street\" หมายความว่าอะไร?", options: ["ไปตามถนนเส้นนี้","เลี้ยวซ้าย","เลี้ยวขวา","กลับรถ"], answer: 0, correctFeedback: "ถูกต้อง! Go along = ไปตามทาง", wrongFeedback: "along = ไปตาม, street = ถนน", keyword: "go along = ไปตามทาง"  },
  { id: 'd38', quest: 'directions', question: "\"Take the first right\" หมายความว่าอะไร?", options: ["เลี้ยวขวาแยกที่สอง","เลี้ยวขวาแยกแรก","เลี้ยวซ้ายแยกแรก","ตรงไปแยกแรก"], answer: 1, correctFeedback: "ถูกแล้ว! first = แรก, right = ขวา", wrongFeedback: "first = อันแรก, right = ขวา", keyword: "first right = ขวาแยกแรก"  },
  { id: 'd39', quest: 'directions', question: "\"At the traffic light\" หมายความว่าอะไร?", options: ["ที่ป้ายรถเมล์","ที่สถานีตำรวจ","ที่ไฟจราจร","ที่ทางม้าลาย"], answer: 2, correctFeedback: "ถูกต้อง! Traffic light = ไฟจราจร", wrongFeedback: "traffic light = ไฟจราจร", keyword: "traffic light = ไฟจราจร"  },
  { id: 'd40', quest: 'directions', question: "\"Over there\" หมายความว่าอะไร?", options: ["ตรงนี้","ตรงนั้น/ตรงนู้น","ด้านหลัง","ข้างล่าง"], answer: 1, correctFeedback: "ถูกเลย! Over there = ตรงนู้น", wrongFeedback: "here = ตรงนี้, there = ตรงนั้น", keyword: "over there = ตรงนั้น"  },
  { id: 'd41', quest: 'directions', question: "\"Go straight\" หมายความว่าอะไร?", options: ["เลี้ยวซ้าย","ตรงไป","เลี้ยวขวา","หยุด"], answer: 1, correctFeedback: "ถูกต้อง! Go straight = ตรงไป", wrongFeedback: "straight = ตรง", keyword: "go straight = ตรงไป"  },
  { id: 'd42', quest: 'directions', question: "\"Turn left\" หมายความว่าอะไร?", options: ["เลี้ยวขวา","ตรงไป","เลี้ยวซ้าย","กลับหลัง"], answer: 2, correctFeedback: "ถูก! Turn left = เลี้ยวซ้าย", wrongFeedback: "left = ซ้าย", keyword: "turn left = เลี้ยวซ้าย"  },
  { id: 'd43', quest: 'directions', question: "\"Turn right\" หมายความว่าอะไร?", options: ["เลี้ยวซ้าย","ตรงไป","กลับหลัง","เลี้ยวขวา"], answer: 3, correctFeedback: "ถูกแล้ว! Turn right = เลี้ยวขวา", wrongFeedback: "right = ขวา", keyword: "turn right = เลี้ยวขวา"  },
  { id: 'd44', quest: 'directions', question: "\"Next to\" หมายความว่าอะไร?", options: ["ตรงข้าม","ติดกับ/ข้างๆ","ระหว่าง","ด้านหลัง"], answer: 1, correctFeedback: "ถูกต้อง! Next to = ติดกับ", wrongFeedback: "Next to = ติดกับ", keyword: "next to = ติดกับ"  },
  { id: 'd45', quest: 'directions', question: "\"Opposite\" หมายความว่าอะไร?", options: ["ใกล้กับ","ด้านหลัง","ตรงข้าม","ด้านบน"], answer: 2, correctFeedback: "ถูกเลย! Opposite = ตรงข้าม", wrongFeedback: "Opposite = ตรงข้าม", keyword: "opposite = ตรงข้าม"  },
  { id: 'd46', quest: 'directions', question: "\"Between\" หมายความว่าอะไร?", options: ["ด้านหน้า","ระหว่าง","ด้านหลัง","ใกล้ๆ"], answer: 1, correctFeedback: "ถูกต้อง! Between = ระหว่าง", wrongFeedback: "Between = ระหว่าง (2 สิ่ง)", keyword: "between = ระหว่าง"  },
  { id: 'd47', quest: 'directions', question: "\"Near\" หมายความว่าอะไร?", options: ["ไกล","ใกล้","ตรงข้าม","ระหว่าง"], answer: 1, correctFeedback: "ถูกแล้ว! Near = ใกล้", wrongFeedback: "Near = ใกล้ ↔ Far = ไกล", keyword: "near = ใกล้"  },
  { id: 'd48', quest: 'directions', question: "\"Behind\" หมายความว่าอะไร?", options: ["ด้านหน้า","ด้านข้าง","ด้านหลัง","ด้านบน"], answer: 2, correctFeedback: "ถูกต้อง! Behind = ด้านหลัง", wrongFeedback: "Behind = ด้านหลัง", keyword: "behind = ด้านหลัง"  },
  { id: 'd49', quest: 'directions', question: "The hospital is ___ the school and the bank.", options: ["opposite","between","near","behind"], answer: 1, correctFeedback: "ถูกต้อง! อยู่ระหว่าง 2 สิ่งใช้ between", wrongFeedback: "มี A and B ต้องใช้ between (ระหว่าง)", keyword: "between A and B"  },
  { id: 'd50', quest: 'directions', question: "\"On the right\" หมายความว่าอะไร?", options: ["ทางซ้ายมือ","ตรงหน้า","ทางขวามือ","ด้านหลัง"], answer: 2, correctFeedback: "ถูกแล้ว! On the right = ทางขวามือ", wrongFeedback: "right = ขวา", keyword: "on the right = ขวามือ"  }
];

export const marketQuestions = [
  { id: 'm01', quest: 'market', question: "\"How much is it?\" หมายความว่าอะไร?", options: ["สิ่งนี้คืออะไร?","ราคาเท่าไหร่?","มีไหม?","ซื้อได้ไหม?"], answer: 1, correctFeedback: "ถูกต้อง! How much is it? = ราคาเท่าไหร่?", wrongFeedback: "How much = เท่าไหร่", keyword: "How much = ราคาเท่าไหร่"  },
  { id: 'm02', quest: 'market', question: "\"It's fifty baht.\" หมายความว่าอะไร?", options: ["ห้าร้อยบาท","ห้าสิบบาท","สิบห้าบาท","ห้าบาท"], answer: 1, correctFeedback: "ถูกเลย! Fifty = 50", wrongFeedback: "Fifty = 50, Fifteen = 15", keyword: "fifty = 50"  },
  { id: 'm03', quest: 'market', question: "\"Can I have a bag, please?\" หมายความว่าอะไร?", options: ["ขอถุงหน่อยได้ไหม?","ราคาเท่าไหร่?","มีถุงไหม?","ไม่ต้องถุง"], answer: 0, correctFeedback: "ถูกต้อง! Can I have... = ขอ...ได้ไหม?", wrongFeedback: "bag = ถุง", keyword: "Can I have = ขอ..."  },
  { id: 'm04', quest: 'market', question: "\"Do you have apples?\" ตอบว่าอะไรถ้ามีแอปเปิ้ล?", options: ["No, I don't.","Yes, we do.","I don't know.","How much?"], answer: 1, correctFeedback: "ถูกแล้ว! Yes, we do. = มีครับ/ค่ะ", wrongFeedback: "ถาม Do ตอบ Yes/No do", keyword: "Yes, we do = มี"  },
  { id: 'm05', quest: 'market', question: "\"Three for twenty baht.\" หมายความว่าอะไร?", options: ["สามชิ้นสิบบาท","ชิ้นละสามบาท","สามชิ้นยี่สิบบาท","ยี่สิบชิ้นสามบาท"], answer: 2, correctFeedback: "ถูกต้อง! Three (3) for twenty (20)", wrongFeedback: "Three = 3, Twenty = 20", keyword: "three = 3, twenty = 20"  },
  { id: 'm06', quest: 'market', question: "\"Here's your change.\" หมายความว่าอะไร?", options: ["นี่คือสินค้าของคุณ","นี่คือเงินทอนของคุณ","คุณจ่ายครบแล้ว","ขอบคุณ"], answer: 1, correctFeedback: "ถูกเลย! Change = เงินทอน", wrongFeedback: "Change = เงินทอน", keyword: "change = เงินทอน"  },
  { id: 'm07', quest: 'market', question: "\"I'd like to buy some oranges.\" หมายความว่าอะไร?", options: ["ฉันชอบส้ม","ฉันต้องการซื้อส้ม","ส้มอยู่ที่ไหน?","ส้มราคาเท่าไหร่?"], answer: 1, correctFeedback: "ถูกต้อง! I'd like to = ฉันต้องการ, buy = ซื้อ", wrongFeedback: "buy = ซื้อ", keyword: "buy = ซื้อ"  },
  { id: 'm08', quest: 'market', question: "\"That's too expensive!\" หมายความว่าอะไร?", options: ["ถูกมาก!","แพงเกินไป!","พอดีเลย!","ลดราคาได้ไหม?"], answer: 1, correctFeedback: "ถูกแล้ว! expensive = แพง, too = เกินไป", wrongFeedback: "expensive = แพง", keyword: "expensive = แพง"  },
  { id: 'm09', quest: 'market', question: "\"Can you give me a discount?\" หมายความว่าอะไร?", options: ["ลดราคาให้หน่อยได้ไหม?","ราคาเท่าไหร่?","มีสินค้าไหม?","ฉันไม่ซื้อ"], answer: 0, correctFeedback: "ถูกต้อง! discount = ส่วนลด", wrongFeedback: "discount = ส่วนลด", keyword: "discount = ส่วนลด"  },
  { id: 'm10', quest: 'market', question: "\"What's this?\" ตอบอย่างไรถ้าเป็น \"มะม่วง\"?", options: ["It's a mango.","It's a banana.","It's a papaya.","It's a guava."], answer: 0, correctFeedback: "ถูกเลย! Mango = มะม่วง", wrongFeedback: "Mango = มะม่วง", keyword: "mango = มะม่วง"  },
  { id: 'm11', quest: 'market', question: "\"Do you have any change?\" หมายความว่าอะไร?", options: ["คุณมีเงินทอนไหม?","คุณเปลี่ยนใจไหม?","ราคาเท่าไหร่?","เงินทอนอยู่ไหน?"], answer: 0, correctFeedback: "ถูกต้อง! change = เงินทอน", wrongFeedback: "change ในที่นี้แปลว่าเงินทอน", keyword: "change = เงินทอน"  },
  { id: 'm12', quest: 'market', question: "\"I'll take this one.\" หมายความว่าอะไร?", options: ["ฉันไม่เอา","ฉันจะเอาชิ้นนี้","ฉันจะไปที่อื่น","อันนี้แพงไป"], answer: 1, correctFeedback: "ถูกแล้ว! I'll take... = ฉันจะเอา...", wrongFeedback: "take = เอา/รับ", keyword: "take this one = เอาชิ้นนี้"  },
  { id: 'm13', quest: 'market', question: "\"It's very cheap.\" หมายความว่าอะไร?", options: ["แพงมาก","สวยมาก","ถูกมาก","ใหญ่มาก"], answer: 2, correctFeedback: "ถูกต้อง! cheap = ถูก", wrongFeedback: "cheap = ถูก, expensive = แพง", keyword: "cheap = ถูก"  },
  { id: 'm14', quest: 'market', question: "\"Can I try it on?\" ใช้เมื่อต้องการทำอะไร?", options: ["ขอลดราคา","ขอชิม","ขอลองสวมใส่","ขอเปลี่ยนไซส์"], answer: 2, correctFeedback: "ถูกเลย! try it on = ลองสวมดู", wrongFeedback: "try on = ลองใส่", keyword: "try on = ลองใส่เสื้อผ้า"  },
  { id: 'm15', quest: 'market', question: "\"What size do you wear?\" หมายความว่าอะไร?", options: ["คุณใส่ไซส์อะไร?","คุณชอบสีอะไร?","คุณมีไซส์ไหม?","ราคาเท่าไหร่?"], answer: 0, correctFeedback: "ถูกต้อง! wear = สวมใส่, size = ขนาด", wrongFeedback: "size = ไซส์", keyword: "what size = ไซส์อะไร"  },
  { id: 'm16', quest: 'market', question: "\"Do you take credit cards?\" หมายความว่าอะไร?", options: ["คุณมีบัตรไหม?","รับบัตรเครดิตไหม?","เครดิตการ์ดคืออะไร?","จ่ายด้วยเงินสดไหม?"], answer: 1, correctFeedback: "ถูกแล้ว! take = รับ (ในที่นี้คือรับบัตร)", wrongFeedback: "take credit cards = รับบัตรเครดิต", keyword: "take credit cards = รับบัตร"  },
  { id: 'm17', quest: 'market', question: "\"It's out of stock.\" หมายความว่าอะไร?", options: ["สินค้าอยู่ในสต็อก","สินค้าหมด","สินค้าราคาถูก","สินค้ามาใหม่"], answer: 1, correctFeedback: "ถูกต้อง! out of = หมด", wrongFeedback: "out of stock = สินค้าหมด", keyword: "out of stock = ของหมด"  },
  { id: 'm18', quest: 'market', question: "\"A bottle of water\" คืออะไร?", options: ["น้ำหนึ่งแก้ว","น้ำหนึ่งขวด","น้ำหนึ่งแพ็ค","น้ำผลไม้"], answer: 1, correctFeedback: "ถูกเลย! bottle = ขวด", wrongFeedback: "bottle = ขวด", keyword: "bottle = ขวด"  },
  { id: 'm19', quest: 'market', question: "\"Two kilos of pork\" คืออะไร?", options: ["ไก่สองกิโล","เนื้อสองกิโล","หมูสองกิโล","ปลาสองกิโล"], answer: 2, correctFeedback: "ถูกต้อง! pork = เนื้อหมู", wrongFeedback: "pork = หมู, beef = เนื้อวัว, chicken = ไก่", keyword: "pork = หมู"  },
  { id: 'm20', quest: 'market', question: "\"The total is 100 baht.\" หมายความว่าอะไร?", options: ["ราคาสินค้า 100 บาท","เงินทอน 100 บาท","ยอดรวมทั้งหมด 100 บาท","จ่ายมา 100 บาท"], answer: 2, correctFeedback: "ถูกแล้ว! total = ยอดรวม", wrongFeedback: "total = ยอดรวม/ทั้งหมด", keyword: "total = รวมทั้งหมด"  },
  { id: 'm21', quest: 'market', question: "\"How much is it?\" หมายความว่าอะไร?", options: ["สิ่งนี้คืออะไร?","ราคาเท่าไหร่?","มีไหม?","ซื้อได้ไหม?"], answer: 1, correctFeedback: "ถูกต้อง! How much is it? = ราคาเท่าไหร่?", wrongFeedback: "How much = เท่าไหร่", keyword: "How much = ราคาเท่าไหร่"  },
  { id: 'm22', quest: 'market', question: "\"It's fifty baht.\" หมายความว่าอะไร?", options: ["ห้าร้อยบาท","ห้าสิบบาท","สิบห้าบาท","ห้าบาท"], answer: 1, correctFeedback: "ถูกเลย! Fifty = 50", wrongFeedback: "Fifty = 50, Fifteen = 15", keyword: "fifty = 50"  },
  { id: 'm23', quest: 'market', question: "\"Can I have a bag, please?\" หมายความว่าอะไร?", options: ["ขอถุงหน่อยได้ไหม?","ราคาเท่าไหร่?","มีถุงไหม?","ไม่ต้องถุง"], answer: 0, correctFeedback: "ถูกต้อง! Can I have... = ขอ...ได้ไหม?", wrongFeedback: "bag = ถุง", keyword: "Can I have = ขอ..."  },
  { id: 'm24', quest: 'market', question: "\"Do you have apples?\" ตอบว่าอะไรถ้ามีแอปเปิ้ล?", options: ["No, I don't.","Yes, we do.","I don't know.","How much?"], answer: 1, correctFeedback: "ถูกแล้ว! Yes, we do. = มีครับ/ค่ะ", wrongFeedback: "ถาม Do ตอบ Yes/No do", keyword: "Yes, we do = มี"  },
  { id: 'm25', quest: 'market', question: "\"Three for twenty baht.\" หมายความว่าอะไร?", options: ["สามชิ้นสิบบาท","ชิ้นละสามบาท","สามชิ้นยี่สิบบาท","ยี่สิบชิ้นสามบาท"], answer: 2, correctFeedback: "ถูกต้อง! Three (3) for twenty (20)", wrongFeedback: "Three = 3, Twenty = 20", keyword: "three = 3, twenty = 20"  },
  { id: 'm26', quest: 'market', question: "\"Here's your change.\" หมายความว่าอะไร?", options: ["นี่คือสินค้าของคุณ","นี่คือเงินทอนของคุณ","คุณจ่ายครบแล้ว","ขอบคุณ"], answer: 1, correctFeedback: "ถูกเลย! Change = เงินทอน", wrongFeedback: "Change = เงินทอน", keyword: "change = เงินทอน"  },
  { id: 'm27', quest: 'market', question: "\"I'd like to buy some oranges.\" หมายความว่าอะไร?", options: ["ฉันชอบส้ม","ฉันต้องการซื้อส้ม","ส้มอยู่ที่ไหน?","ส้มราคาเท่าไหร่?"], answer: 1, correctFeedback: "ถูกต้อง! I'd like to = ฉันต้องการ, buy = ซื้อ", wrongFeedback: "buy = ซื้อ", keyword: "buy = ซื้อ"  },
  { id: 'm28', quest: 'market', question: "\"That's too expensive!\" หมายความว่าอะไร?", options: ["ถูกมาก!","แพงเกินไป!","พอดีเลย!","ลดราคาได้ไหม?"], answer: 1, correctFeedback: "ถูกแล้ว! expensive = แพง, too = เกินไป", wrongFeedback: "expensive = แพง", keyword: "expensive = แพง"  },
  { id: 'm29', quest: 'market', question: "\"Can you give me a discount?\" หมายความว่าอะไร?", options: ["ลดราคาให้หน่อยได้ไหม?","ราคาเท่าไหร่?","มีสินค้าไหม?","ฉันไม่ซื้อ"], answer: 0, correctFeedback: "ถูกต้อง! discount = ส่วนลด", wrongFeedback: "discount = ส่วนลด", keyword: "discount = ส่วนลด"  },
  { id: 'm30', quest: 'market', question: "\"What's this?\" ตอบอย่างไรถ้าเป็น \"มะม่วง\"?", options: ["It's a mango.","It's a banana.","It's a papaya.","It's a guava."], answer: 0, correctFeedback: "ถูกเลย! Mango = มะม่วง", wrongFeedback: "Mango = มะม่วง", keyword: "mango = มะม่วง"  },
  { id: 'm31', quest: 'market', question: "\"Do you have any change?\" หมายความว่าอะไร?", options: ["คุณมีเงินทอนไหม?","คุณเปลี่ยนใจไหม?","ราคาเท่าไหร่?","เงินทอนอยู่ไหน?"], answer: 0, correctFeedback: "ถูกต้อง! change = เงินทอน", wrongFeedback: "change ในที่นี้แปลว่าเงินทอน", keyword: "change = เงินทอน"  },
  { id: 'm32', quest: 'market', question: "\"I'll take this one.\" หมายความว่าอะไร?", options: ["ฉันไม่เอา","ฉันจะเอาชิ้นนี้","ฉันจะไปที่อื่น","อันนี้แพงไป"], answer: 1, correctFeedback: "ถูกแล้ว! I'll take... = ฉันจะเอา...", wrongFeedback: "take = เอา/รับ", keyword: "take this one = เอาชิ้นนี้"  },
  { id: 'm33', quest: 'market', question: "\"It's very cheap.\" หมายความว่าอะไร?", options: ["แพงมาก","สวยมาก","ถูกมาก","ใหญ่มาก"], answer: 2, correctFeedback: "ถูกต้อง! cheap = ถูก", wrongFeedback: "cheap = ถูก, expensive = แพง", keyword: "cheap = ถูก"  },
  { id: 'm34', quest: 'market', question: "\"Can I try it on?\" ใช้เมื่อต้องการทำอะไร?", options: ["ขอลดราคา","ขอชิม","ขอลองสวมใส่","ขอเปลี่ยนไซส์"], answer: 2, correctFeedback: "ถูกเลย! try it on = ลองสวมดู", wrongFeedback: "try on = ลองใส่", keyword: "try on = ลองใส่เสื้อผ้า"  },
  { id: 'm35', quest: 'market', question: "\"What size do you wear?\" หมายความว่าอะไร?", options: ["คุณใส่ไซส์อะไร?","คุณชอบสีอะไร?","คุณมีไซส์ไหม?","ราคาเท่าไหร่?"], answer: 0, correctFeedback: "ถูกต้อง! wear = สวมใส่, size = ขนาด", wrongFeedback: "size = ไซส์", keyword: "what size = ไซส์อะไร"  },
  { id: 'm36', quest: 'market', question: "\"Do you take credit cards?\" หมายความว่าอะไร?", options: ["คุณมีบัตรไหม?","รับบัตรเครดิตไหม?","เครดิตการ์ดคืออะไร?","จ่ายด้วยเงินสดไหม?"], answer: 1, correctFeedback: "ถูกแล้ว! take = รับ (ในที่นี้คือรับบัตร)", wrongFeedback: "take credit cards = รับบัตรเครดิต", keyword: "take credit cards = รับบัตร"  },
  { id: 'm37', quest: 'market', question: "\"It's out of stock.\" หมายความว่าอะไร?", options: ["สินค้าอยู่ในสต็อก","สินค้าหมด","สินค้าราคาถูก","สินค้ามาใหม่"], answer: 1, correctFeedback: "ถูกต้อง! out of = หมด", wrongFeedback: "out of stock = สินค้าหมด", keyword: "out of stock = ของหมด"  },
  { id: 'm38', quest: 'market', question: "\"A bottle of water\" คืออะไร?", options: ["น้ำหนึ่งแก้ว","น้ำหนึ่งขวด","น้ำหนึ่งแพ็ค","น้ำผลไม้"], answer: 1, correctFeedback: "ถูกเลย! bottle = ขวด", wrongFeedback: "bottle = ขวด", keyword: "bottle = ขวด"  },
  { id: 'm39', quest: 'market', question: "\"Two kilos of pork\" คืออะไร?", options: ["ไก่สองกิโล","เนื้อสองกิโล","หมูสองกิโล","ปลาสองกิโล"], answer: 2, correctFeedback: "ถูกต้อง! pork = เนื้อหมู", wrongFeedback: "pork = หมู, beef = เนื้อวัว, chicken = ไก่", keyword: "pork = หมู"  },
  { id: 'm40', quest: 'market', question: "\"The total is 100 baht.\" หมายความว่าอะไร?", options: ["ราคาสินค้า 100 บาท","เงินทอน 100 บาท","ยอดรวมทั้งหมด 100 บาท","จ่ายมา 100 บาท"], answer: 2, correctFeedback: "ถูกแล้ว! total = ยอดรวม", wrongFeedback: "total = ยอดรวม/ทั้งหมด", keyword: "total = รวมทั้งหมด"  },
  { id: 'm41', quest: 'market', question: "\"How much is it?\" หมายความว่าอะไร?", options: ["สิ่งนี้คืออะไร?","ราคาเท่าไหร่?","มีไหม?","ซื้อได้ไหม?"], answer: 1, correctFeedback: "ถูกต้อง! How much is it? = ราคาเท่าไหร่?", wrongFeedback: "How much = เท่าไหร่", keyword: "How much = ราคาเท่าไหร่"  },
  { id: 'm42', quest: 'market', question: "\"It's fifty baht.\" หมายความว่าอะไร?", options: ["ห้าร้อยบาท","ห้าสิบบาท","สิบห้าบาท","ห้าบาท"], answer: 1, correctFeedback: "ถูกเลย! Fifty = 50", wrongFeedback: "Fifty = 50, Fifteen = 15", keyword: "fifty = 50"  },
  { id: 'm43', quest: 'market', question: "\"Can I have a bag, please?\" หมายความว่าอะไร?", options: ["ขอถุงหน่อยได้ไหม?","ราคาเท่าไหร่?","มีถุงไหม?","ไม่ต้องถุง"], answer: 0, correctFeedback: "ถูกต้อง! Can I have... = ขอ...ได้ไหม?", wrongFeedback: "bag = ถุง", keyword: "Can I have = ขอ..."  },
  { id: 'm44', quest: 'market', question: "\"Do you have apples?\" ตอบว่าอะไรถ้ามีแอปเปิ้ล?", options: ["No, I don't.","Yes, we do.","I don't know.","How much?"], answer: 1, correctFeedback: "ถูกแล้ว! Yes, we do. = มีครับ/ค่ะ", wrongFeedback: "ถาม Do ตอบ Yes/No do", keyword: "Yes, we do = มี"  },
  { id: 'm45', quest: 'market', question: "\"Three for twenty baht.\" หมายความว่าอะไร?", options: ["สามชิ้นสิบบาท","ชิ้นละสามบาท","สามชิ้นยี่สิบบาท","ยี่สิบชิ้นสามบาท"], answer: 2, correctFeedback: "ถูกต้อง! Three (3) for twenty (20)", wrongFeedback: "Three = 3, Twenty = 20", keyword: "three = 3, twenty = 20"  },
  { id: 'm46', quest: 'market', question: "\"Here's your change.\" หมายความว่าอะไร?", options: ["นี่คือสินค้าของคุณ","นี่คือเงินทอนของคุณ","คุณจ่ายครบแล้ว","ขอบคุณ"], answer: 1, correctFeedback: "ถูกเลย! Change = เงินทอน", wrongFeedback: "Change = เงินทอน", keyword: "change = เงินทอน"  },
  { id: 'm47', quest: 'market', question: "\"I'd like to buy some oranges.\" หมายความว่าอะไร?", options: ["ฉันชอบส้ม","ฉันต้องการซื้อส้ม","ส้มอยู่ที่ไหน?","ส้มราคาเท่าไหร่?"], answer: 1, correctFeedback: "ถูกต้อง! I'd like to = ฉันต้องการ, buy = ซื้อ", wrongFeedback: "buy = ซื้อ", keyword: "buy = ซื้อ"  },
  { id: 'm48', quest: 'market', question: "\"That's too expensive!\" หมายความว่าอะไร?", options: ["ถูกมาก!","แพงเกินไป!","พอดีเลย!","ลดราคาได้ไหม?"], answer: 1, correctFeedback: "ถูกแล้ว! expensive = แพง, too = เกินไป", wrongFeedback: "expensive = แพง", keyword: "expensive = แพง"  },
  { id: 'm49', quest: 'market', question: "\"Can you give me a discount?\" หมายความว่าอะไร?", options: ["ลดราคาให้หน่อยได้ไหม?","ราคาเท่าไหร่?","มีสินค้าไหม?","ฉันไม่ซื้อ"], answer: 0, correctFeedback: "ถูกต้อง! discount = ส่วนลด", wrongFeedback: "discount = ส่วนลด", keyword: "discount = ส่วนลด"  },
  { id: 'm50', quest: 'market', question: "\"What's this?\" ตอบอย่างไรถ้าเป็น \"มะม่วง\"?", options: ["It's a mango.","It's a banana.","It's a papaya.","It's a guava."], answer: 0, correctFeedback: "ถูกเลย! Mango = มะม่วง", wrongFeedback: "Mango = มะม่วง", keyword: "mango = มะม่วง"  }
];

export const conversationQuestions = [
  { id: 'c01', quest: 'conversation', question: "A: \"Thank you very much!\" B: ตอบอย่างไร?", options: ["I'm sorry.","You're welcome.","That's all right.","Yes, please."], answer: 1, correctFeedback: "ถูกต้อง! You're welcome = ด้วยความยินดี", wrongFeedback: "Thank you → You're welcome.", keyword: "You're welcome = ยินดี"  },
  { id: 'c02', quest: 'conversation', question: "A: \"I'm sorry for being late.\" B: ตอบอย่างไร?", options: ["You're welcome.","Nice to meet you.","That's all right.","Yes, please."], answer: 2, correctFeedback: "ถูกเลย! That's all right = ไม่เป็นไร", wrongFeedback: "I'm sorry → That's all right.", keyword: "That's all right = ไม่เป็นไร"  },
  { id: 'c03', quest: 'conversation', question: "A: \"Can I help you?\" B: ตอบอย่างไรถ้าต้องการความช่วยเหลือ?", options: ["No, thank you.","That's all right.","Yes, please.","I'm fine."], answer: 2, correctFeedback: "ถูกต้อง! Yes, please = ได้เลยค่ะ", wrongFeedback: "ต้องการความช่วยเหลือ ตอบ Yes, please.", keyword: "Yes, please = ได้ครับ"  },
  { id: 'c04', quest: 'conversation', question: "A: \"May I go out, please?\" B: ครูตอบอย่างไรถ้าอนุญาต?", options: ["No, you may not.","Yes, you may.","That's all right.","Of course not."], answer: 1, correctFeedback: "ถูกแล้ว! อนุญาตใช้ Yes, you may.", wrongFeedback: "ถาม May I ตอบ Yes, you may.", keyword: "Yes, you may = อนุญาต"  },
  { id: 'c05', quest: 'conversation', question: "A: \"What's the matter?\" B: ตอบอย่างไรถ้าปวดหัว?", options: ["I'm happy.","I have a headache.","I'm hungry.","I'm fine."], answer: 1, correctFeedback: "ถูกต้อง! headache = ปวดหัว", wrongFeedback: "headache = ปวดศีรษะ", keyword: "headache = ปวดหัว"  },
  { id: 'c06', quest: 'conversation', question: "A: \"Nice to meet you.\" B: ตอบอย่างไร?", options: ["I'm fine, thanks.","Nice to meet you, too.","You're welcome.","That's all right."], answer: 1, correctFeedback: "ถูกเลย! ตอบเติม too ด้านท้าย", wrongFeedback: "Nice to meet you, too. = ยินดีที่ได้รู้จักเช่นกัน", keyword: "Nice to meet you, too."  },
  { id: 'c07', quest: 'conversation', question: "A: \"Can I borrow your pen?\" B: ตอบอย่างไรถ้าให้ยืม?", options: ["No, you can't.","I don't have one.","Yes, here you are.","I'm sorry."], answer: 2, correctFeedback: "ถูกต้อง! Here you are = นี่ไง (ยื่นให้)", wrongFeedback: "Here you are แปลว่า นี่ยังไงล่ะ (ตอนยื่นของให้)", keyword: "Here you are = ยื่นของให้"  },
  { id: 'c08', quest: 'conversation', question: "A: \"How are you?\" B: ตอบว่าอะไรถ้าสบายดี?", options: ["I'm sick.","I'm fine, thank you.","Not so good.","I'm busy."], answer: 1, correctFeedback: "ถูกแล้ว! I'm fine = สบายดี", wrongFeedback: "How are you? = สบายดีไหม?", keyword: "I'm fine = สบายดี"  },
  { id: 'c09', quest: 'conversation', question: "A: \"Excuse me, where is the toilet?\" ประโยคนี้ใช้ในสถานการณ์ใด?", options: ["ขอโทษที่ทำผิด","ขอแทรกเพื่อถามทาง","ทักทายกัน","บอกลา"], answer: 1, correctFeedback: "ถูกต้อง! Excuse me ใช้ขัดจังหวะเพื่อถาม", wrongFeedback: "Excuse me ใช้เวลาขอแทรกเพื่อถามอะไรบางอย่าง", keyword: "Excuse me = ขออนุญาต/ขอโทษที่ขัดจังหวะ"  },
  { id: 'c10', quest: 'conversation', question: "A: \"Goodbye!\" B: ตอบว่าอะไร?", options: ["Hello!","Goodbye! / Bye!","Nice to meet you.","How are you?"], answer: 1, correctFeedback: "ถูกเลย! ตอบ Goodbye ได้เลย", wrongFeedback: "Goodbye → Goodbye", keyword: "Goodbye = ลาก่อน"  },
  { id: 'c11', quest: 'conversation', question: "A: \"What time is it?\" B: ควรตอบว่าอย่างไร?", options: ["It's blue.","It's 10 o'clock.","It's heavy.","It's Monday."], answer: 1, correctFeedback: "ถูกต้อง! ถามเวลา ตอบเวลา", wrongFeedback: "What time = เวลาเท่าไหร่", keyword: "What time = ถามเวลา"  },
  { id: 'c12', quest: 'conversation', question: "A: \"Where are you from?\" B: ตอบอย่างไร?", options: ["I am 12.","I am fine.","I am from Thailand.","I am a student."], answer: 2, correctFeedback: "ถูกแล้ว! ถาม Where from ตอบประเทศ/ที่มา", wrongFeedback: "Where from = มาจากไหน", keyword: "Where are you from = มาจากไหน"  },
  { id: 'c13', quest: 'conversation', question: "A: \"How old are you?\" B: ตอบอย่างไร?", options: ["I am from Japan.","I am 12 years old.","I like apples.","I am fine."], answer: 1, correctFeedback: "ถูกต้อง! How old = อายุเท่าไหร่", wrongFeedback: "How old = ถามอายุ", keyword: "How old = อายุ"  },
  { id: 'c14', quest: 'conversation', question: "A: \"What do you do?\" B: ควรตอบว่าอะไร?", options: ["I am reading.","I am a student.","I am here.","I do homework."], answer: 1, correctFeedback: "ถูกเลย! What do you do = คุณทำอาชีพอะไร", wrongFeedback: "What do you do = ทำอาชีพอะไร ไม่ใช่กำลังทำอะไร", keyword: "What do you do = อาชีพอะไร"  },
  { id: 'c15', quest: 'conversation', question: "A: \"What's your favorite subject?\" B: ตอบอย่างไร?", options: ["I like pizza.","I like cats.","I like English.","I like blue."], answer: 2, correctFeedback: "ถูกต้อง! subject = วิชา", wrongFeedback: "subject = วิชาเรียน", keyword: "favorite subject = วิชาที่ชอบ"  },
  { id: 'c16', quest: 'conversation', question: "A: \"Would you like some tea?\" B: ตอบรับอย่างไร?", options: ["Yes, I am.","No, I don't.","Yes, please.","No, it isn't."], answer: 2, correctFeedback: "ถูกแล้ว! Would you like...? ตอบ Yes, please.", wrongFeedback: "ตอบรับข้อเสนอใช้ Yes, please.", keyword: "Would you like...? → Yes, please."  },
  { id: 'c17', quest: 'conversation', question: "A: \"Have a nice weekend.\" B: ตอบอย่างไร?", options: ["You too.","I am fine.","Sorry.","Yes, I do."], answer: 0, correctFeedback: "ถูกต้อง! You too = คุณก็เช่นกัน", wrongFeedback: "อวยพรมา ให้ตอบ You too (คุณก็เช่นกัน)", keyword: "You too = คุณก็เช่นกัน"  },
  { id: 'c18', quest: 'conversation', question: "A: \"Congratulations!\" B: ตอบอย่างไร?", options: ["I'm sorry.","Thank you.","That's all right.","You're welcome."], answer: 1, correctFeedback: "ถูกเลย! มีคนยินดีด้วย ก็ต้องขอบคุณ", wrongFeedback: "Congratulations = ยินดีด้วย ตอบ Thank you", keyword: "Congratulations → Thank you"  },
  { id: 'c19', quest: 'conversation', question: "A: \"I lost my dog.\" B: ควรตอบอย่างไรเพื่อแสดงความเสียใจ?", options: ["Congratulations!","I'm sorry to hear that.","You're welcome.","That's good."], answer: 1, correctFeedback: "ถูกต้อง! I'm sorry to hear that = เสียใจที่ได้ยินแบบนั้น", wrongFeedback: "I'm sorry to hear that ใช้แสดงความเห็นใจ", keyword: "sorry to hear that = เห็นใจ"  },
  { id: 'c20', quest: 'conversation', question: "A: \"Let's go to the park.\" B: ตอบตกลงอย่างไร?", options: ["That's a good idea.","I don't know.","I'm sorry.","You're wrong."], answer: 0, correctFeedback: "ถูกแล้ว! That's a good idea = เป็นความคิดที่ดี", wrongFeedback: "Let's... เป็นการชักชวน ตอบรับด้วย That's a good idea.", keyword: "That's a good idea = ความคิดที่ดี"  },
  { id: 'c21', quest: 'conversation', question: "A: \"Thank you very much!\" B: ตอบอย่างไร?", options: ["I'm sorry.","You're welcome.","That's all right.","Yes, please."], answer: 1, correctFeedback: "ถูกต้อง! You're welcome = ด้วยความยินดี", wrongFeedback: "Thank you → You're welcome.", keyword: "You're welcome = ยินดี"  },
  { id: 'c22', quest: 'conversation', question: "A: \"I'm sorry for being late.\" B: ตอบอย่างไร?", options: ["You're welcome.","Nice to meet you.","That's all right.","Yes, please."], answer: 2, correctFeedback: "ถูกเลย! That's all right = ไม่เป็นไร", wrongFeedback: "I'm sorry → That's all right.", keyword: "That's all right = ไม่เป็นไร"  },
  { id: 'c23', quest: 'conversation', question: "A: \"Can I help you?\" B: ตอบอย่างไรถ้าต้องการความช่วยเหลือ?", options: ["No, thank you.","That's all right.","Yes, please.","I'm fine."], answer: 2, correctFeedback: "ถูกต้อง! Yes, please = ได้เลยค่ะ", wrongFeedback: "ต้องการความช่วยเหลือ ตอบ Yes, please.", keyword: "Yes, please = ได้ครับ"  },
  { id: 'c24', quest: 'conversation', question: "A: \"May I go out, please?\" B: ครูตอบอย่างไรถ้าอนุญาต?", options: ["No, you may not.","Yes, you may.","That's all right.","Of course not."], answer: 1, correctFeedback: "ถูกแล้ว! อนุญาตใช้ Yes, you may.", wrongFeedback: "ถาม May I ตอบ Yes, you may.", keyword: "Yes, you may = อนุญาต"  },
  { id: 'c25', quest: 'conversation', question: "A: \"What's the matter?\" B: ตอบอย่างไรถ้าปวดหัว?", options: ["I'm happy.","I have a headache.","I'm hungry.","I'm fine."], answer: 1, correctFeedback: "ถูกต้อง! headache = ปวดหัว", wrongFeedback: "headache = ปวดศีรษะ", keyword: "headache = ปวดหัว"  },
  { id: 'c26', quest: 'conversation', question: "A: \"Nice to meet you.\" B: ตอบอย่างไร?", options: ["I'm fine, thanks.","Nice to meet you, too.","You're welcome.","That's all right."], answer: 1, correctFeedback: "ถูกเลย! ตอบเติม too ด้านท้าย", wrongFeedback: "Nice to meet you, too. = ยินดีที่ได้รู้จักเช่นกัน", keyword: "Nice to meet you, too."  },
  { id: 'c27', quest: 'conversation', question: "A: \"Can I borrow your pen?\" B: ตอบอย่างไรถ้าให้ยืม?", options: ["No, you can't.","I don't have one.","Yes, here you are.","I'm sorry."], answer: 2, correctFeedback: "ถูกต้อง! Here you are = นี่ไง (ยื่นให้)", wrongFeedback: "Here you are แปลว่า นี่ยังไงล่ะ (ตอนยื่นของให้)", keyword: "Here you are = ยื่นของให้"  },
  { id: 'c28', quest: 'conversation', question: "A: \"How are you?\" B: ตอบว่าอะไรถ้าสบายดี?", options: ["I'm sick.","I'm fine, thank you.","Not so good.","I'm busy."], answer: 1, correctFeedback: "ถูกแล้ว! I'm fine = สบายดี", wrongFeedback: "How are you? = สบายดีไหม?", keyword: "I'm fine = สบายดี"  },
  { id: 'c29', quest: 'conversation', question: "A: \"Excuse me, where is the toilet?\" ประโยคนี้ใช้ในสถานการณ์ใด?", options: ["ขอโทษที่ทำผิด","ขอแทรกเพื่อถามทาง","ทักทายกัน","บอกลา"], answer: 1, correctFeedback: "ถูกต้อง! Excuse me ใช้ขัดจังหวะเพื่อถาม", wrongFeedback: "Excuse me ใช้เวลาขอแทรกเพื่อถามอะไรบางอย่าง", keyword: "Excuse me = ขออนุญาต/ขอโทษที่ขัดจังหวะ"  },
  { id: 'c30', quest: 'conversation', question: "A: \"Goodbye!\" B: ตอบว่าอะไร?", options: ["Hello!","Goodbye! / Bye!","Nice to meet you.","How are you?"], answer: 1, correctFeedback: "ถูกเลย! ตอบ Goodbye ได้เลย", wrongFeedback: "Goodbye → Goodbye", keyword: "Goodbye = ลาก่อน"  },
  { id: 'c31', quest: 'conversation', question: "A: \"What time is it?\" B: ควรตอบว่าอย่างไร?", options: ["It's blue.","It's 10 o'clock.","It's heavy.","It's Monday."], answer: 1, correctFeedback: "ถูกต้อง! ถามเวลา ตอบเวลา", wrongFeedback: "What time = เวลาเท่าไหร่", keyword: "What time = ถามเวลา"  },
  { id: 'c32', quest: 'conversation', question: "A: \"Where are you from?\" B: ตอบอย่างไร?", options: ["I am 12.","I am fine.","I am from Thailand.","I am a student."], answer: 2, correctFeedback: "ถูกแล้ว! ถาม Where from ตอบประเทศ/ที่มา", wrongFeedback: "Where from = มาจากไหน", keyword: "Where are you from = มาจากไหน"  },
  { id: 'c33', quest: 'conversation', question: "A: \"How old are you?\" B: ตอบอย่างไร?", options: ["I am from Japan.","I am 12 years old.","I like apples.","I am fine."], answer: 1, correctFeedback: "ถูกต้อง! How old = อายุเท่าไหร่", wrongFeedback: "How old = ถามอายุ", keyword: "How old = อายุ"  },
  { id: 'c34', quest: 'conversation', question: "A: \"What do you do?\" B: ควรตอบว่าอะไร?", options: ["I am reading.","I am a student.","I am here.","I do homework."], answer: 1, correctFeedback: "ถูกเลย! What do you do = คุณทำอาชีพอะไร", wrongFeedback: "What do you do = ทำอาชีพอะไร ไม่ใช่กำลังทำอะไร", keyword: "What do you do = อาชีพอะไร"  },
  { id: 'c35', quest: 'conversation', question: "A: \"What's your favorite subject?\" B: ตอบอย่างไร?", options: ["I like pizza.","I like cats.","I like English.","I like blue."], answer: 2, correctFeedback: "ถูกต้อง! subject = วิชา", wrongFeedback: "subject = วิชาเรียน", keyword: "favorite subject = วิชาที่ชอบ"  },
  { id: 'c36', quest: 'conversation', question: "A: \"Would you like some tea?\" B: ตอบรับอย่างไร?", options: ["Yes, I am.","No, I don't.","Yes, please.","No, it isn't."], answer: 2, correctFeedback: "ถูกแล้ว! Would you like...? ตอบ Yes, please.", wrongFeedback: "ตอบรับข้อเสนอใช้ Yes, please.", keyword: "Would you like...? → Yes, please."  },
  { id: 'c37', quest: 'conversation', question: "A: \"Have a nice weekend.\" B: ตอบอย่างไร?", options: ["You too.","I am fine.","Sorry.","Yes, I do."], answer: 0, correctFeedback: "ถูกต้อง! You too = คุณก็เช่นกัน", wrongFeedback: "อวยพรมา ให้ตอบ You too (คุณก็เช่นกัน)", keyword: "You too = คุณก็เช่นกัน"  },
  { id: 'c38', quest: 'conversation', question: "A: \"Congratulations!\" B: ตอบอย่างไร?", options: ["I'm sorry.","Thank you.","That's all right.","You're welcome."], answer: 1, correctFeedback: "ถูกเลย! มีคนยินดีด้วย ก็ต้องขอบคุณ", wrongFeedback: "Congratulations = ยินดีด้วย ตอบ Thank you", keyword: "Congratulations → Thank you"  },
  { id: 'c39', quest: 'conversation', question: "A: \"I lost my dog.\" B: ควรตอบอย่างไรเพื่อแสดงความเสียใจ?", options: ["Congratulations!","I'm sorry to hear that.","You're welcome.","That's good."], answer: 1, correctFeedback: "ถูกต้อง! I'm sorry to hear that = เสียใจที่ได้ยินแบบนั้น", wrongFeedback: "I'm sorry to hear that ใช้แสดงความเห็นใจ", keyword: "sorry to hear that = เห็นใจ"  },
  { id: 'c40', quest: 'conversation', question: "A: \"Let's go to the park.\" B: ตอบตกลงอย่างไร?", options: ["That's a good idea.","I don't know.","I'm sorry.","You're wrong."], answer: 0, correctFeedback: "ถูกแล้ว! That's a good idea = เป็นความคิดที่ดี", wrongFeedback: "Let's... เป็นการชักชวน ตอบรับด้วย That's a good idea.", keyword: "That's a good idea = ความคิดที่ดี"  },
  { id: 'c41', quest: 'conversation', question: "A: \"Thank you very much!\" B: ตอบอย่างไร?", options: ["I'm sorry.","You're welcome.","That's all right.","Yes, please."], answer: 1, correctFeedback: "ถูกต้อง! You're welcome = ด้วยความยินดี", wrongFeedback: "Thank you → You're welcome.", keyword: "You're welcome = ยินดี"  },
  { id: 'c42', quest: 'conversation', question: "A: \"I'm sorry for being late.\" B: ตอบอย่างไร?", options: ["You're welcome.","Nice to meet you.","That's all right.","Yes, please."], answer: 2, correctFeedback: "ถูกเลย! That's all right = ไม่เป็นไร", wrongFeedback: "I'm sorry → That's all right.", keyword: "That's all right = ไม่เป็นไร"  },
  { id: 'c43', quest: 'conversation', question: "A: \"Can I help you?\" B: ตอบอย่างไรถ้าต้องการความช่วยเหลือ?", options: ["No, thank you.","That's all right.","Yes, please.","I'm fine."], answer: 2, correctFeedback: "ถูกต้อง! Yes, please = ได้เลยค่ะ", wrongFeedback: "ต้องการความช่วยเหลือ ตอบ Yes, please.", keyword: "Yes, please = ได้ครับ"  },
  { id: 'c44', quest: 'conversation', question: "A: \"May I go out, please?\" B: ครูตอบอย่างไรถ้าอนุญาต?", options: ["No, you may not.","Yes, you may.","That's all right.","Of course not."], answer: 1, correctFeedback: "ถูกแล้ว! อนุญาตใช้ Yes, you may.", wrongFeedback: "ถาม May I ตอบ Yes, you may.", keyword: "Yes, you may = อนุญาต"  },
  { id: 'c45', quest: 'conversation', question: "A: \"What's the matter?\" B: ตอบอย่างไรถ้าปวดหัว?", options: ["I'm happy.","I have a headache.","I'm hungry.","I'm fine."], answer: 1, correctFeedback: "ถูกต้อง! headache = ปวดหัว", wrongFeedback: "headache = ปวดศีรษะ", keyword: "headache = ปวดหัว"  },
  { id: 'c46', quest: 'conversation', question: "A: \"Nice to meet you.\" B: ตอบอย่างไร?", options: ["I'm fine, thanks.","Nice to meet you, too.","You're welcome.","That's all right."], answer: 1, correctFeedback: "ถูกเลย! ตอบเติม too ด้านท้าย", wrongFeedback: "Nice to meet you, too. = ยินดีที่ได้รู้จักเช่นกัน", keyword: "Nice to meet you, too."  },
  { id: 'c47', quest: 'conversation', question: "A: \"Can I borrow your pen?\" B: ตอบอย่างไรถ้าให้ยืม?", options: ["No, you can't.","I don't have one.","Yes, here you are.","I'm sorry."], answer: 2, correctFeedback: "ถูกต้อง! Here you are = นี่ไง (ยื่นให้)", wrongFeedback: "Here you are แปลว่า นี่ยังไงล่ะ (ตอนยื่นของให้)", keyword: "Here you are = ยื่นของให้"  },
  { id: 'c48', quest: 'conversation', question: "A: \"How are you?\" B: ตอบว่าอะไรถ้าสบายดี?", options: ["I'm sick.","I'm fine, thank you.","Not so good.","I'm busy."], answer: 1, correctFeedback: "ถูกแล้ว! I'm fine = สบายดี", wrongFeedback: "How are you? = สบายดีไหม?", keyword: "I'm fine = สบายดี"  },
  { id: 'c49', quest: 'conversation', question: "A: \"Excuse me, where is the toilet?\" ประโยคนี้ใช้ในสถานการณ์ใด?", options: ["ขอโทษที่ทำผิด","ขอแทรกเพื่อถามทาง","ทักทายกัน","บอกลา"], answer: 1, correctFeedback: "ถูกต้อง! Excuse me ใช้ขัดจังหวะเพื่อถาม", wrongFeedback: "Excuse me ใช้เวลาขอแทรกเพื่อถามอะไรบางอย่าง", keyword: "Excuse me = ขออนุญาต/ขอโทษที่ขัดจังหวะ"  },
  { id: 'c50', quest: 'conversation', question: "A: \"Goodbye!\" B: ตอบว่าอะไร?", options: ["Hello!","Goodbye! / Bye!","Nice to meet you.","How are you?"], answer: 1, correctFeedback: "ถูกเลย! ตอบ Goodbye ได้เลย", wrongFeedback: "Goodbye → Goodbye", keyword: "Goodbye = ลาก่อน"  }
];

export const readingQuestions = [
  { id: 'r01', quest: 'reading', question: "Where did Lisa go?", options: ["To the school","To the fruit market","To the hospital","To the restaurant"], answer: 1, correctFeedback: "ถูกต้อง! Lisa went to a fruit market", wrongFeedback: "ประโยคแรกบอกชัดเจนว่า went to a fruit market", keyword: "fruit market = ตลาดผลไม้" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r02', quest: 'reading', question: "What did Lisa buy?", options: ["Only apples","Apples and bananas","Apples, oranges, and bananas","Oranges and mangoes"], answer: 2, correctFeedback: "ถูกเลย! She bought apples, oranges, and bananas", wrongFeedback: "ดูประโยคที่ 2 จะมีผลไม้ 3 ชนิด", keyword: "bought apples, oranges, and bananas" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r03', quest: 'reading', question: "What did Lisa want to make?", options: ["A cake","A fruit salad","A smoothie","A sandwich"], answer: 1, correctFeedback: "ถูกต้อง! to make a fruit salad", wrongFeedback: "ประโยคที่ 2 บอกว่า to make a fruit salad", keyword: "make a fruit salad" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r04', quest: 'reading', question: "How does Tom go to school?", options: ["By bus","By car","By bicycle","On foot"], answer: 2, correctFeedback: "ถูกแล้ว! goes to school by bicycle", wrongFeedback: "He goes to school by bicycle", keyword: "by bicycle" , passage: "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him." },
  { id: 'r05', quest: 'reading', question: "How does Tom's teacher feel about him?", options: ["Worried","Angry","Proud","Sad"], answer: 2, correctFeedback: "ถูกต้อง! teacher is very proud", wrongFeedback: "ประโยคสุดท้ายบอกว่า proud (ภูมิใจ)", keyword: "proud of = ภูมิใจ" , passage: "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him." },
  { id: 'r06', quest: 'reading', question: "What is the weather like in the morning?", options: ["Rainy","Cloudy","Sunny","Windy"], answer: 2, correctFeedback: "ถูกเลย! Today is a sunny day", wrongFeedback: "ตอนต้นบอกว่า sunny (แดดออก)", keyword: "sunny = แดดออก" , passage: "Today is a sunny day. Sam and his friends are playing football in the park. They are having a great time. In the evening, the sky becomes cloudy and it starts to rain." },
  { id: 'r07', quest: 'reading', question: "What are Sam and his friends doing?", options: ["Swimming","Playing football","Reading books","Watching TV"], answer: 1, correctFeedback: "ถูกต้อง! are playing football", wrongFeedback: "ประโยคที่ 2 บอกว่า playing football", keyword: "playing football" , passage: "Today is a sunny day. Sam and his friends are playing football in the park. They are having a great time. In the evening, the sky becomes cloudy and it starts to rain." },
  { id: 'r08', quest: 'reading', question: "How many children are in Nong's family?", options: ["Two","Three","Four","Five"], answer: 2, correctFeedback: "ถูกแล้ว! Nong + 2 brothers + 1 sister = 4", wrongFeedback: "นับพี่น้องทั้งหมดรวมตัว Nong ด้วย ได้ 4 คน", keyword: "4 children" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r09', quest: 'reading', question: "What is Nong's father's job?", options: ["Teacher","Doctor","Police","Farmer"], answer: 1, correctFeedback: "ถูกต้อง! father is a doctor", wrongFeedback: "My father is a doctor.", keyword: "doctor = หมอ" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r10', quest: 'reading', question: "Which word best describes Nong's family?", options: ["Small","Big","Sad","Rich"], answer: 1, correctFeedback: "ถูกเลย! I have a big family", wrongFeedback: "ประโยคที่ 2 บอกว่า big family", keyword: "big family = ครอบครัวใหญ่" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r11', quest: 'reading', question: "What color is Milo?", options: ["Black and white","Brown and white","All brown","Black and brown"], answer: 1, correctFeedback: "ถูกต้อง! brown and white", wrongFeedback: "ประโยคที่ 2: He is brown and white.", keyword: "brown and white" , passage: "Milo is my pet dog. He is brown and white. He loves to eat chicken and play with a red ball in the garden. He sleeps under my bed every night." },
  { id: 'r12', quest: 'reading', question: "What does Milo like to eat?", options: ["Fish","Beef","Pork","Chicken"], answer: 3, correctFeedback: "ถูกแล้ว! He loves to eat chicken", wrongFeedback: "He loves to eat chicken", keyword: "eat chicken" , passage: "Milo is my pet dog. He is brown and white. He loves to eat chicken and play with a red ball in the garden. He sleeps under my bed every night." },
  { id: 'r13', quest: 'reading', question: "Where does Milo sleep?", options: ["In the garden","On the bed","Under the bed","In the kitchen"], answer: 2, correctFeedback: "ถูกต้อง! He sleeps under my bed", wrongFeedback: "He sleeps under my bed (ใต้เตียง)", keyword: "under my bed" , passage: "Milo is my pet dog. He is brown and white. He loves to eat chicken and play with a red ball in the garden. He sleeps under my bed every night." },
  { id: 'r14', quest: 'reading', question: "Where did the class go?", options: ["To the museum","To the park","To the zoo","To the hospital"], answer: 2, correctFeedback: "ถูกเลย! went to the zoo", wrongFeedback: "ประโยคแรกบอก went to the zoo", keyword: "zoo = สวนสัตว์" , passage: "Yesterday, my class went to the zoo. We saw many animals. The elephants were eating bananas. The monkeys were jumping on trees. It was a fun trip." },
  { id: 'r15', quest: 'reading', question: "What were the elephants eating?", options: ["Apples","Leaves","Bananas","Grass"], answer: 2, correctFeedback: "ถูกต้อง! elephants were eating bananas", wrongFeedback: "ประโยคที่ 3 บอกว่า eating bananas", keyword: "eating bananas" , passage: "Yesterday, my class went to the zoo. We saw many animals. The elephants were eating bananas. The monkeys were jumping on trees. It was a fun trip." },
  { id: 'r16', quest: 'reading', question: "What were the monkeys doing?", options: ["Sleeping","Eating bananas","Drinking water","Jumping on trees"], answer: 3, correctFeedback: "ถูกแล้ว! jumping on trees", wrongFeedback: "The monkeys were jumping on trees.", keyword: "jumping on trees" , passage: "Yesterday, my class went to the zoo. We saw many animals. The elephants were eating bananas. The monkeys were jumping on trees. It was a fun trip." },
  { id: 'r17', quest: 'reading', question: "Whose birthday is it?", options: ["Mary's mother","Mary","Mary's friend","Tom"], answer: 1, correctFeedback: "ถูกต้อง! Mary's birthday", wrongFeedback: "Today is Mary's birthday.", keyword: "Mary's birthday" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r18', quest: 'reading', question: "How old is Mary?", options: ["10","11","12","13"], answer: 2, correctFeedback: "ถูกเลย! She is 12 years old.", wrongFeedback: "She is 12 years old.", keyword: "12 years old" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r19', quest: 'reading', question: "What kind of cake did her mother bake?", options: ["Strawberry cake","Vanilla cake","Chocolate cake","Coffee cake"], answer: 2, correctFeedback: "ถูกต้อง! chocolate cake", wrongFeedback: "baked a chocolate cake", keyword: "chocolate cake" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r20', quest: 'reading', question: "How does Mary feel?", options: ["Angry","Sad","Happy","Tired"], answer: 2, correctFeedback: "ถูกแล้ว! She is very happy.", wrongFeedback: "ประโยคสุดท้ายบอกว่า She is very happy.", keyword: "happy = มีความสุข" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r21', quest: 'reading', question: "Where did Lisa go?", options: ["To the school","To the fruit market","To the hospital","To the restaurant"], answer: 1, correctFeedback: "ถูกต้อง! Lisa went to a fruit market", wrongFeedback: "ประโยคแรกบอกชัดเจนว่า went to a fruit market", keyword: "fruit market = ตลาดผลไม้" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r22', quest: 'reading', question: "What did Lisa buy?", options: ["Only apples","Apples and bananas","Apples, oranges, and bananas","Oranges and mangoes"], answer: 2, correctFeedback: "ถูกเลย! She bought apples, oranges, and bananas", wrongFeedback: "ดูประโยคที่ 2 จะมีผลไม้ 3 ชนิด", keyword: "bought apples, oranges, and bananas" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r23', quest: 'reading', question: "What did Lisa want to make?", options: ["A cake","A fruit salad","A smoothie","A sandwich"], answer: 1, correctFeedback: "ถูกต้อง! to make a fruit salad", wrongFeedback: "ประโยคที่ 2 บอกว่า to make a fruit salad", keyword: "make a fruit salad" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r24', quest: 'reading', question: "How does Tom go to school?", options: ["By bus","By car","By bicycle","On foot"], answer: 2, correctFeedback: "ถูกแล้ว! goes to school by bicycle", wrongFeedback: "He goes to school by bicycle", keyword: "by bicycle" , passage: "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him." },
  { id: 'r25', quest: 'reading', question: "How does Tom's teacher feel about him?", options: ["Worried","Angry","Proud","Sad"], answer: 2, correctFeedback: "ถูกต้อง! teacher is very proud", wrongFeedback: "ประโยคสุดท้ายบอกว่า proud (ภูมิใจ)", keyword: "proud of = ภูมิใจ" , passage: "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him." },
  { id: 'r26', quest: 'reading', question: "What is the weather like in the morning?", options: ["Rainy","Cloudy","Sunny","Windy"], answer: 2, correctFeedback: "ถูกเลย! Today is a sunny day", wrongFeedback: "ตอนต้นบอกว่า sunny (แดดออก)", keyword: "sunny = แดดออก" , passage: "Today is a sunny day. Sam and his friends are playing football in the park. They are having a great time. In the evening, the sky becomes cloudy and it starts to rain." },
  { id: 'r27', quest: 'reading', question: "What are Sam and his friends doing?", options: ["Swimming","Playing football","Reading books","Watching TV"], answer: 1, correctFeedback: "ถูกต้อง! are playing football", wrongFeedback: "ประโยคที่ 2 บอกว่า playing football", keyword: "playing football" , passage: "Today is a sunny day. Sam and his friends are playing football in the park. They are having a great time. In the evening, the sky becomes cloudy and it starts to rain." },
  { id: 'r28', quest: 'reading', question: "How many children are in Nong's family?", options: ["Two","Three","Four","Five"], answer: 2, correctFeedback: "ถูกแล้ว! Nong + 2 brothers + 1 sister = 4", wrongFeedback: "นับพี่น้องทั้งหมดรวมตัว Nong ด้วย ได้ 4 คน", keyword: "4 children" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r29', quest: 'reading', question: "What is Nong's father's job?", options: ["Teacher","Doctor","Police","Farmer"], answer: 1, correctFeedback: "ถูกต้อง! father is a doctor", wrongFeedback: "My father is a doctor.", keyword: "doctor = หมอ" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r30', quest: 'reading', question: "Which word best describes Nong's family?", options: ["Small","Big","Sad","Rich"], answer: 1, correctFeedback: "ถูกเลย! I have a big family", wrongFeedback: "ประโยคที่ 2 บอกว่า big family", keyword: "big family = ครอบครัวใหญ่" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r31', quest: 'reading', question: "What color is Milo?", options: ["Black and white","Brown and white","All brown","Black and brown"], answer: 1, correctFeedback: "ถูกต้อง! brown and white", wrongFeedback: "ประโยคที่ 2: He is brown and white.", keyword: "brown and white" , passage: "Milo is my pet dog. He is brown and white. He loves to eat chicken and play with a red ball in the garden. He sleeps under my bed every night." },
  { id: 'r32', quest: 'reading', question: "What does Milo like to eat?", options: ["Fish","Beef","Pork","Chicken"], answer: 3, correctFeedback: "ถูกแล้ว! He loves to eat chicken", wrongFeedback: "He loves to eat chicken", keyword: "eat chicken" , passage: "Milo is my pet dog. He is brown and white. He loves to eat chicken and play with a red ball in the garden. He sleeps under my bed every night." },
  { id: 'r33', quest: 'reading', question: "Where does Milo sleep?", options: ["In the garden","On the bed","Under the bed","In the kitchen"], answer: 2, correctFeedback: "ถูกต้อง! He sleeps under my bed", wrongFeedback: "He sleeps under my bed (ใต้เตียง)", keyword: "under my bed" , passage: "Milo is my pet dog. He is brown and white. He loves to eat chicken and play with a red ball in the garden. He sleeps under my bed every night." },
  { id: 'r34', quest: 'reading', question: "Where did the class go?", options: ["To the museum","To the park","To the zoo","To the hospital"], answer: 2, correctFeedback: "ถูกเลย! went to the zoo", wrongFeedback: "ประโยคแรกบอก went to the zoo", keyword: "zoo = สวนสัตว์" , passage: "Yesterday, my class went to the zoo. We saw many animals. The elephants were eating bananas. The monkeys were jumping on trees. It was a fun trip." },
  { id: 'r35', quest: 'reading', question: "What were the elephants eating?", options: ["Apples","Leaves","Bananas","Grass"], answer: 2, correctFeedback: "ถูกต้อง! elephants were eating bananas", wrongFeedback: "ประโยคที่ 3 บอกว่า eating bananas", keyword: "eating bananas" , passage: "Yesterday, my class went to the zoo. We saw many animals. The elephants were eating bananas. The monkeys were jumping on trees. It was a fun trip." },
  { id: 'r36', quest: 'reading', question: "What were the monkeys doing?", options: ["Sleeping","Eating bananas","Drinking water","Jumping on trees"], answer: 3, correctFeedback: "ถูกแล้ว! jumping on trees", wrongFeedback: "The monkeys were jumping on trees.", keyword: "jumping on trees" , passage: "Yesterday, my class went to the zoo. We saw many animals. The elephants were eating bananas. The monkeys were jumping on trees. It was a fun trip." },
  { id: 'r37', quest: 'reading', question: "Whose birthday is it?", options: ["Mary's mother","Mary","Mary's friend","Tom"], answer: 1, correctFeedback: "ถูกต้อง! Mary's birthday", wrongFeedback: "Today is Mary's birthday.", keyword: "Mary's birthday" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r38', quest: 'reading', question: "How old is Mary?", options: ["10","11","12","13"], answer: 2, correctFeedback: "ถูกเลย! She is 12 years old.", wrongFeedback: "She is 12 years old.", keyword: "12 years old" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r39', quest: 'reading', question: "What kind of cake did her mother bake?", options: ["Strawberry cake","Vanilla cake","Chocolate cake","Coffee cake"], answer: 2, correctFeedback: "ถูกต้อง! chocolate cake", wrongFeedback: "baked a chocolate cake", keyword: "chocolate cake" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r40', quest: 'reading', question: "How does Mary feel?", options: ["Angry","Sad","Happy","Tired"], answer: 2, correctFeedback: "ถูกแล้ว! She is very happy.", wrongFeedback: "ประโยคสุดท้ายบอกว่า She is very happy.", keyword: "happy = มีความสุข" , passage: "Today is Mary's birthday. She is 12 years old. Her mother baked a chocolate cake for her. Her friends gave her many presents. She is very happy." },
  { id: 'r41', quest: 'reading', question: "Where did Lisa go?", options: ["To the school","To the fruit market","To the hospital","To the restaurant"], answer: 1, correctFeedback: "ถูกต้อง! Lisa went to a fruit market", wrongFeedback: "ประโยคแรกบอกชัดเจนว่า went to a fruit market", keyword: "fruit market = ตลาดผลไม้" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r42', quest: 'reading', question: "What did Lisa buy?", options: ["Only apples","Apples and bananas","Apples, oranges, and bananas","Oranges and mangoes"], answer: 2, correctFeedback: "ถูกเลย! She bought apples, oranges, and bananas", wrongFeedback: "ดูประโยคที่ 2 จะมีผลไม้ 3 ชนิด", keyword: "bought apples, oranges, and bananas" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r43', quest: 'reading', question: "What did Lisa want to make?", options: ["A cake","A fruit salad","A smoothie","A sandwich"], answer: 1, correctFeedback: "ถูกต้อง! to make a fruit salad", wrongFeedback: "ประโยคที่ 2 บอกว่า to make a fruit salad", keyword: "make a fruit salad" , passage: "Lisa went to a fruit market on Saturday morning. She bought apples, oranges, and bananas to make a fruit salad. The fruit salad was delicious!" },
  { id: 'r44', quest: 'reading', question: "How does Tom go to school?", options: ["By bus","By car","By bicycle","On foot"], answer: 2, correctFeedback: "ถูกแล้ว! goes to school by bicycle", wrongFeedback: "He goes to school by bicycle", keyword: "by bicycle" , passage: "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him." },
  { id: 'r45', quest: 'reading', question: "How does Tom's teacher feel about him?", options: ["Worried","Angry","Proud","Sad"], answer: 2, correctFeedback: "ถูกต้อง! teacher is very proud", wrongFeedback: "ประโยคสุดท้ายบอกว่า proud (ภูมิใจ)", keyword: "proud of = ภูมิใจ" , passage: "Tom is a good student. He goes to school by bicycle every day. He studies hard and always does his homework. His teacher is very proud of him." },
  { id: 'r46', quest: 'reading', question: "What is the weather like in the morning?", options: ["Rainy","Cloudy","Sunny","Windy"], answer: 2, correctFeedback: "ถูกเลย! Today is a sunny day", wrongFeedback: "ตอนต้นบอกว่า sunny (แดดออก)", keyword: "sunny = แดดออก" , passage: "Today is a sunny day. Sam and his friends are playing football in the park. They are having a great time. In the evening, the sky becomes cloudy and it starts to rain." },
  { id: 'r47', quest: 'reading', question: "What are Sam and his friends doing?", options: ["Swimming","Playing football","Reading books","Watching TV"], answer: 1, correctFeedback: "ถูกต้อง! are playing football", wrongFeedback: "ประโยคที่ 2 บอกว่า playing football", keyword: "playing football" , passage: "Today is a sunny day. Sam and his friends are playing football in the park. They are having a great time. In the evening, the sky becomes cloudy and it starts to rain." },
  { id: 'r48', quest: 'reading', question: "How many children are in Nong's family?", options: ["Two","Three","Four","Five"], answer: 2, correctFeedback: "ถูกแล้ว! Nong + 2 brothers + 1 sister = 4", wrongFeedback: "นับพี่น้องทั้งหมดรวมตัว Nong ด้วย ได้ 4 คน", keyword: "4 children" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r49', quest: 'reading', question: "What is Nong's father's job?", options: ["Teacher","Doctor","Police","Farmer"], answer: 1, correctFeedback: "ถูกต้อง! father is a doctor", wrongFeedback: "My father is a doctor.", keyword: "doctor = หมอ" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." },
  { id: 'r50', quest: 'reading', question: "Which word best describes Nong's family?", options: ["Small","Big","Sad","Rich"], answer: 1, correctFeedback: "ถูกเลย! I have a big family", wrongFeedback: "ประโยคที่ 2 บอกว่า big family", keyword: "big family = ครอบครัวใหญ่" , passage: "My name is Nong. I have a big family. I have a father, a mother, two brothers, and one sister. My father is a doctor. My mother is a teacher. We all live together happily." }
];

export const grammarQuestions = [
  { id: 'g01', quest: 'grammar', question: "She ____ football every day.", options: ["play","plays","playing","played"], answer: 1, correctFeedback: "ถูกต้อง! ประธานเอกพจน์ กริยาเติม s (Present Simple)", wrongFeedback: "every day = Present Simple, She ต้องคู่กับกริยาเติม s", keyword: "She plays (Present Simple)"  },
  { id: 'g02', quest: 'grammar', question: "They ____ TV right now.", options: ["watch","watches","are watching","watched"], answer: 2, correctFeedback: "ถูกเลย! right now บอกว่ากำลังทำ = are watching", wrongFeedback: "right now = Present Continuous (is/am/are + V-ing)", keyword: "are watching"  },
  { id: 'g03', quest: 'grammar', question: "I ____ to school yesterday.", options: ["go","goes","going","went"], answer: 3, correctFeedback: "ถูกต้อง! yesterday = อดีต ต้องใช้ went", wrongFeedback: "yesterday (เมื่อวาน) ต้องใช้กริยาช่อง 2 คือ went", keyword: "yesterday = went"  },
  { id: 'g04', quest: 'grammar', question: "He ____ already eaten lunch.", options: ["has","have","had","is"], answer: 0, correctFeedback: "ถูกแล้ว! He ใช้กับ has (Present Perfect)", wrongFeedback: "Present Perfect: He has + V3", keyword: "He has"  },
  { id: 'g05', quest: 'grammar', question: "The dog is sleeping ____ the table.", options: ["on","under","in","at"], answer: 1, correctFeedback: "ถูกต้อง! หมานอน \"ใต้\" โต๊ะ (under)", wrongFeedback: "under = ใต้, on = บน, in = ใน", keyword: "under = ใต้"  },
  { id: 'g06', quest: 'grammar', question: "____ is your name?", options: ["Where","What","Who","When"], answer: 1, correctFeedback: "ถูกเลย! What is your name? = ชื่ออะไร", wrongFeedback: "What = อะไร", keyword: "What = อะไร"  },
  { id: 'g07', quest: 'grammar', question: "____ are you from?", options: ["When","What","Where","Who"], answer: 2, correctFeedback: "ถูกต้อง! Where are you from? = มาจากไหน", wrongFeedback: "Where = ที่ไหน", keyword: "Where = ที่ไหน"  },
  { id: 'g08', quest: 'grammar', question: "I have ____ apple in my bag.", options: ["a","an","the","some"], answer: 1, correctFeedback: "ถูกแล้ว! apple นำหน้าด้วยสระ ใช้ an", wrongFeedback: "apple ขึ้นต้นด้วย a,e,i,o,u ใช้ an", keyword: "an apple"  },
  { id: 'g09', quest: 'grammar', question: "He is taller ____ his brother.", options: ["then","than","to","from"], answer: 1, correctFeedback: "ถูกต้อง! เปรียบเทียบกว่าใช้ than", wrongFeedback: "taller than = สูงกว่า (than ไม่ใช่ then)", keyword: "taller than"  },
  { id: 'g10', quest: 'grammar', question: "Look at ____ birds in the sky!", options: ["this","that","these","those"], answer: 3, correctFeedback: "ถูกเลย! birds เติม s และอยู่ไกล (in the sky) ใช้ those", wrongFeedback: "พหูพจน์อยู่ไกลใช้ those", keyword: "those = เหล่านั้น (ไกล)"  },
  { id: 'g11', quest: 'grammar', question: "____ you like some coffee?", options: ["Do","Are","Would","Have"], answer: 2, correctFeedback: "ถูกต้อง! Would you like = เสนอให้ (สุภาพ)", wrongFeedback: "ใช้ Would you like... เพื่อเสนอสิ่งของอย่างสุภาพ", keyword: "Would you like"  },
  { id: 'g12', quest: 'grammar', question: "I was born ____ 2010.", options: ["in","on","at","by"], answer: 0, correctFeedback: "ถูกแล้ว! กับปี (Year) ใช้ in", wrongFeedback: "ปี ค.ศ. ใช้ in (เช่น in 2010)", keyword: "in + ปี"  },
  { id: 'g13', quest: 'grammar', question: "My birthday is ____ Monday.", options: ["in","on","at","by"], answer: 1, correctFeedback: "ถูกต้อง! กับวัน (Day) ใช้ on", wrongFeedback: "วันในสัปดาห์ ใช้ on (เช่น on Monday)", keyword: "on + วัน"  },
  { id: 'g14', quest: 'grammar', question: "The movie starts ____ 8 o'clock.", options: ["in","on","at","to"], answer: 2, correctFeedback: "ถูกเลย! กับเวลาตามเข็มนาฬิกา ใช้ at", wrongFeedback: "เวลาที่แน่นอน ใช้ at (เช่น at 8 o'clock)", keyword: "at + เวลา"  },
  { id: 'g15', quest: 'grammar', question: "Tom is the ____ boy in the class.", options: ["tall","taller","tallest","most tall"], answer: 2, correctFeedback: "ถูกต้อง! the นำหน้าขั้นสุด (tallest)", wrongFeedback: "มี the นำหน้า ต้องเป็นขั้นสุด เติม -est", keyword: "the tallest = สูงที่สุด"  },
  { id: 'g16', quest: 'grammar', question: "She doesn't ____ any brothers or sisters.", options: ["has","have","having","had"], answer: 1, correctFeedback: "ถูกแล้ว! หลัง doesn't ต้องเป็นกริยาช่อง 1 ไม่เติมอะไร (have)", wrongFeedback: "does/doesn't ดึง s/es ไปแล้ว กริยาตามมาต้องเป็น have", keyword: "doesn't have"  },
  { id: 'g17', quest: 'grammar', question: "I ____ to the cinema tomorrow.", options: ["will go","go","went","going"], answer: 0, correctFeedback: "ถูกต้อง! tomorrow = อนาคต ใช้ will go", wrongFeedback: "tomorrow (พรุ่งนี้) ต้องใช้อนาคต = will go", keyword: "will + V1 = อนาคต"  },
  { id: 'g18', quest: 'grammar', question: "____ pencil is this? - It's mine.", options: ["Who","What","Where","Whose"], answer: 3, correctFeedback: "ถูกเลย! Whose = ของใคร", wrongFeedback: "Whose = ของใคร (ถามหาเจ้าของ)", keyword: "Whose = ของใคร"  },
  { id: 'g19', quest: 'grammar', question: "Please give it to ____.", options: ["I","my","me","mine"], answer: 2, correctFeedback: "ถูกต้อง! ตามหลังบุพบท (to) ต้องเป็นกรรม (me)", wrongFeedback: "to me (me เป็นกรรมของประโยค)", keyword: "to me (กรรม)"  },
  { id: 'g20', quest: 'grammar', question: "They are very good ____ playing football.", options: ["in","on","at","with"], answer: 2, correctFeedback: "ถูกแล้ว! สำนวน good at = เก่งในเรื่อง...", wrongFeedback: "good at + คำนาม/V-ing แปลว่า เก่งเรื่อง...", keyword: "good at = เก่งในเรื่อง"  },
  { id: 'g21', quest: 'grammar', question: "She ____ football every day.", options: ["play","plays","playing","played"], answer: 1, correctFeedback: "ถูกต้อง! ประธานเอกพจน์ กริยาเติม s (Present Simple)", wrongFeedback: "every day = Present Simple, She ต้องคู่กับกริยาเติม s", keyword: "She plays (Present Simple)"  },
  { id: 'g22', quest: 'grammar', question: "They ____ TV right now.", options: ["watch","watches","are watching","watched"], answer: 2, correctFeedback: "ถูกเลย! right now บอกว่ากำลังทำ = are watching", wrongFeedback: "right now = Present Continuous (is/am/are + V-ing)", keyword: "are watching"  },
  { id: 'g23', quest: 'grammar', question: "I ____ to school yesterday.", options: ["go","goes","going","went"], answer: 3, correctFeedback: "ถูกต้อง! yesterday = อดีต ต้องใช้ went", wrongFeedback: "yesterday (เมื่อวาน) ต้องใช้กริยาช่อง 2 คือ went", keyword: "yesterday = went"  },
  { id: 'g24', quest: 'grammar', question: "He ____ already eaten lunch.", options: ["has","have","had","is"], answer: 0, correctFeedback: "ถูกแล้ว! He ใช้กับ has (Present Perfect)", wrongFeedback: "Present Perfect: He has + V3", keyword: "He has"  },
  { id: 'g25', quest: 'grammar', question: "The dog is sleeping ____ the table.", options: ["on","under","in","at"], answer: 1, correctFeedback: "ถูกต้อง! หมานอน \"ใต้\" โต๊ะ (under)", wrongFeedback: "under = ใต้, on = บน, in = ใน", keyword: "under = ใต้"  },
  { id: 'g26', quest: 'grammar', question: "____ is your name?", options: ["Where","What","Who","When"], answer: 1, correctFeedback: "ถูกเลย! What is your name? = ชื่ออะไร", wrongFeedback: "What = อะไร", keyword: "What = อะไร"  },
  { id: 'g27', quest: 'grammar', question: "____ are you from?", options: ["When","What","Where","Who"], answer: 2, correctFeedback: "ถูกต้อง! Where are you from? = มาจากไหน", wrongFeedback: "Where = ที่ไหน", keyword: "Where = ที่ไหน"  },
  { id: 'g28', quest: 'grammar', question: "I have ____ apple in my bag.", options: ["a","an","the","some"], answer: 1, correctFeedback: "ถูกแล้ว! apple นำหน้าด้วยสระ ใช้ an", wrongFeedback: "apple ขึ้นต้นด้วย a,e,i,o,u ใช้ an", keyword: "an apple"  },
  { id: 'g29', quest: 'grammar', question: "He is taller ____ his brother.", options: ["then","than","to","from"], answer: 1, correctFeedback: "ถูกต้อง! เปรียบเทียบกว่าใช้ than", wrongFeedback: "taller than = สูงกว่า (than ไม่ใช่ then)", keyword: "taller than"  },
  { id: 'g30', quest: 'grammar', question: "Look at ____ birds in the sky!", options: ["this","that","these","those"], answer: 3, correctFeedback: "ถูกเลย! birds เติม s และอยู่ไกล (in the sky) ใช้ those", wrongFeedback: "พหูพจน์อยู่ไกลใช้ those", keyword: "those = เหล่านั้น (ไกล)"  },
  { id: 'g31', quest: 'grammar', question: "____ you like some coffee?", options: ["Do","Are","Would","Have"], answer: 2, correctFeedback: "ถูกต้อง! Would you like = เสนอให้ (สุภาพ)", wrongFeedback: "ใช้ Would you like... เพื่อเสนอสิ่งของอย่างสุภาพ", keyword: "Would you like"  },
  { id: 'g32', quest: 'grammar', question: "I was born ____ 2010.", options: ["in","on","at","by"], answer: 0, correctFeedback: "ถูกแล้ว! กับปี (Year) ใช้ in", wrongFeedback: "ปี ค.ศ. ใช้ in (เช่น in 2010)", keyword: "in + ปี"  },
  { id: 'g33', quest: 'grammar', question: "My birthday is ____ Monday.", options: ["in","on","at","by"], answer: 1, correctFeedback: "ถูกต้อง! กับวัน (Day) ใช้ on", wrongFeedback: "วันในสัปดาห์ ใช้ on (เช่น on Monday)", keyword: "on + วัน"  },
  { id: 'g34', quest: 'grammar', question: "The movie starts ____ 8 o'clock.", options: ["in","on","at","to"], answer: 2, correctFeedback: "ถูกเลย! กับเวลาตามเข็มนาฬิกา ใช้ at", wrongFeedback: "เวลาที่แน่นอน ใช้ at (เช่น at 8 o'clock)", keyword: "at + เวลา"  },
  { id: 'g35', quest: 'grammar', question: "Tom is the ____ boy in the class.", options: ["tall","taller","tallest","most tall"], answer: 2, correctFeedback: "ถูกต้อง! the นำหน้าขั้นสุด (tallest)", wrongFeedback: "มี the นำหน้า ต้องเป็นขั้นสุด เติม -est", keyword: "the tallest = สูงที่สุด"  },
  { id: 'g36', quest: 'grammar', question: "She doesn't ____ any brothers or sisters.", options: ["has","have","having","had"], answer: 1, correctFeedback: "ถูกแล้ว! หลัง doesn't ต้องเป็นกริยาช่อง 1 ไม่เติมอะไร (have)", wrongFeedback: "does/doesn't ดึง s/es ไปแล้ว กริยาตามมาต้องเป็น have", keyword: "doesn't have"  },
  { id: 'g37', quest: 'grammar', question: "I ____ to the cinema tomorrow.", options: ["will go","go","went","going"], answer: 0, correctFeedback: "ถูกต้อง! tomorrow = อนาคต ใช้ will go", wrongFeedback: "tomorrow (พรุ่งนี้) ต้องใช้อนาคต = will go", keyword: "will + V1 = อนาคต"  },
  { id: 'g38', quest: 'grammar', question: "____ pencil is this? - It's mine.", options: ["Who","What","Where","Whose"], answer: 3, correctFeedback: "ถูกเลย! Whose = ของใคร", wrongFeedback: "Whose = ของใคร (ถามหาเจ้าของ)", keyword: "Whose = ของใคร"  },
  { id: 'g39', quest: 'grammar', question: "Please give it to ____.", options: ["I","my","me","mine"], answer: 2, correctFeedback: "ถูกต้อง! ตามหลังบุพบท (to) ต้องเป็นกรรม (me)", wrongFeedback: "to me (me เป็นกรรมของประโยค)", keyword: "to me (กรรม)"  },
  { id: 'g40', quest: 'grammar', question: "They are very good ____ playing football.", options: ["in","on","at","with"], answer: 2, correctFeedback: "ถูกแล้ว! สำนวน good at = เก่งในเรื่อง...", wrongFeedback: "good at + คำนาม/V-ing แปลว่า เก่งเรื่อง...", keyword: "good at = เก่งในเรื่อง"  },
  { id: 'g41', quest: 'grammar', question: "She ____ football every day.", options: ["play","plays","playing","played"], answer: 1, correctFeedback: "ถูกต้อง! ประธานเอกพจน์ กริยาเติม s (Present Simple)", wrongFeedback: "every day = Present Simple, She ต้องคู่กับกริยาเติม s", keyword: "She plays (Present Simple)"  },
  { id: 'g42', quest: 'grammar', question: "They ____ TV right now.", options: ["watch","watches","are watching","watched"], answer: 2, correctFeedback: "ถูกเลย! right now บอกว่ากำลังทำ = are watching", wrongFeedback: "right now = Present Continuous (is/am/are + V-ing)", keyword: "are watching"  },
  { id: 'g43', quest: 'grammar', question: "I ____ to school yesterday.", options: ["go","goes","going","went"], answer: 3, correctFeedback: "ถูกต้อง! yesterday = อดีต ต้องใช้ went", wrongFeedback: "yesterday (เมื่อวาน) ต้องใช้กริยาช่อง 2 คือ went", keyword: "yesterday = went"  },
  { id: 'g44', quest: 'grammar', question: "He ____ already eaten lunch.", options: ["has","have","had","is"], answer: 0, correctFeedback: "ถูกแล้ว! He ใช้กับ has (Present Perfect)", wrongFeedback: "Present Perfect: He has + V3", keyword: "He has"  },
  { id: 'g45', quest: 'grammar', question: "The dog is sleeping ____ the table.", options: ["on","under","in","at"], answer: 1, correctFeedback: "ถูกต้อง! หมานอน \"ใต้\" โต๊ะ (under)", wrongFeedback: "under = ใต้, on = บน, in = ใน", keyword: "under = ใต้"  },
  { id: 'g46', quest: 'grammar', question: "____ is your name?", options: ["Where","What","Who","When"], answer: 1, correctFeedback: "ถูกเลย! What is your name? = ชื่ออะไร", wrongFeedback: "What = อะไร", keyword: "What = อะไร"  },
  { id: 'g47', quest: 'grammar', question: "____ are you from?", options: ["When","What","Where","Who"], answer: 2, correctFeedback: "ถูกต้อง! Where are you from? = มาจากไหน", wrongFeedback: "Where = ที่ไหน", keyword: "Where = ที่ไหน"  },
  { id: 'g48', quest: 'grammar', question: "I have ____ apple in my bag.", options: ["a","an","the","some"], answer: 1, correctFeedback: "ถูกแล้ว! apple นำหน้าด้วยสระ ใช้ an", wrongFeedback: "apple ขึ้นต้นด้วย a,e,i,o,u ใช้ an", keyword: "an apple"  },
  { id: 'g49', quest: 'grammar', question: "He is taller ____ his brother.", options: ["then","than","to","from"], answer: 1, correctFeedback: "ถูกต้อง! เปรียบเทียบกว่าใช้ than", wrongFeedback: "taller than = สูงกว่า (than ไม่ใช่ then)", keyword: "taller than"  },
  { id: 'g50', quest: 'grammar', question: "Look at ____ birds in the sky!", options: ["this","that","these","those"], answer: 3, correctFeedback: "ถูกเลย! birds เติม s และอยู่ไกล (in the sky) ใช้ those", wrongFeedback: "พหูพจน์อยู่ไกลใช้ those", keyword: "those = เหล่านั้น (ไกล)"  }
];

export const illnessQuestions = [

  // --- อิมพอร์ตจาก 1.8 สุขภาพและสวัสดิการ.pdf ---
  { id: 'i_pdf_01', quest: 'illness', question: "Your friend says, 'I feel sick.' What do you say?", options: ["Let’s go to the hospital.", "Let’s play football.", "Let’s watch TV.", "Let’s go shopping."], answer: 0, correctFeedback: "ถูกต้อง! เมื่อเพื่อนป่วยควรพาไปโรงพยาบาล", wrongFeedback: "I feel sick = ฉันรู้สึกป่วย ควรแนะนำ Let's go to the hospital.", keyword: "sick = ป่วย" },
  { id: 'i_pdf_02', quest: 'illness', question: "The doctor says, 'Take this medicine.' What do you answer?", options: ["No, thank you.", "OK, I will.", "I don’t like school.", "See you later."], answer: 1, correctFeedback: "ถูกต้อง! เป็นคำตอบรับคำแนะนำของหมอ", wrongFeedback: "หมอสั่งให้กินยา (Take this medicine) ควรตอบรับว่า OK, I will.", keyword: "take this medicine = กินยานี้" },
  { id: 'i_pdf_03', quest: 'illness', question: "You see someone washing hands. What do you say?", options: ["Why are you dancing?", "That’s good! It keeps you healthy.", "Let’s eat candy!", "Don’t do that."], answer: 1, correctFeedback: "ถูกต้อง! การล้างมือช่วยให้สุขภาพดี (healthy)", wrongFeedback: "washing hands = ล้างมือ ช่วยให้ keeps you healthy (สุขภาพดี)", keyword: "washing hands = ล้างมือ" },
  { id: 'i_pdf_04', quest: 'illness', question: "You want to ask a nurse about your health. What do you say?", options: ["What is your favorite food?", "Can you help me?", "Where is the school?", "Do you play football?"], answer: 1, correctFeedback: "ถูกต้อง! เป็นการขอความช่วยเหลืออย่างสุภาพ", wrongFeedback: "ต้องการถามพยาบาล ควรเริ่มด้วย Can you help me? (ช่วยฉันหน่อยได้ไหม)", keyword: "ask a nurse = ถามพยาบาล" },
  { id: 'i_pdf_05', quest: 'illness', question: "You need to take medicine. What do you ask?", options: ["Can I sleep now?", "Where is the teacher?", "When do I take the medicine?", "Is this your pencil?"], answer: 2, correctFeedback: "ถูกต้อง! ต้องถามว่าควรกินยาตอนไหน (When)", wrongFeedback: "ต้องกินยา (take medicine) ควรจะถามเวลาว่า When do I take the medicine?", keyword: "When do I take = ฉันต้องกิน(ยา)ตอนไหน" },
  { id: 'i_pdf_06', quest: 'illness', question: "What does this symbol mean? (สัญลักษณ์เตียง/ตึกที่มีกากบาทแดง)", options: ["School", "Hospital", "Library", "Playground"], answer: 1, correctFeedback: "ถูกต้อง! เป็นสัญลักษณ์ของโรงพยาบาล", wrongFeedback: "สัญลักษณ์ 🏥 หรือเครื่องหมายบวกสีแดง หมายถึง Hospital", keyword: "symbol = สัญลักษณ์" },
  { id: 'i_pdf_07', quest: 'illness', question: "Who helps the doctor?", options: ["Teacher", "Nurse", "Driver", "Farmer"], answer: 1, correctFeedback: "ถูกต้อง! พยาบาล (Nurse) มีหน้าที่ช่วยหมอ", wrongFeedback: "คนที่ช่วยหมอ (helps the doctor) คือ Nurse (พยาบาล)", keyword: "helps the doctor = ช่วยหมอ" },
  { id: 'i_pdf_08', quest: 'illness', question: "What do you take when you are sick?", options: ["Candy", "Rice", "Medicine", "Water"], answer: 2, correctFeedback: "ถูกต้อง! เมื่อป่วยเราควรกินยา (Medicine)", wrongFeedback: "เวลาป่วย (sick) ต้องกินยา (medicine)", keyword: "sick = ป่วย, medicine = ยา" },
  { id: 'i_pdf_09', quest: 'illness', question: "What helps you stay healthy?", options: ["Sleeping late", "Eating vegetables", "Playing games all night", "Watching TV all day"], answer: 1, correctFeedback: "ถูกต้อง! การกินผักช่วยให้ร่างกายแข็งแรง", wrongFeedback: "อยู่ให้สุขภาพดี (stay healthy) ควร Eating vegetables (กินผัก)", keyword: "stay healthy = รักษาสุขภาพ" },
  { id: 'i_pdf_10', quest: 'illness', question: "This symbol means: 💉", options: ["Water", "Candy", "Medicine", "Vaccination"], answer: 3, correctFeedback: "ถูกต้อง! สัญลักษณ์เข็มฉีดยาหมายถึงการฉีดวัคซีน", wrongFeedback: "เข็มฉีดยา 💉 หมายถึง Vaccination (การฉีดวัคซีน)", keyword: "vaccination = ฉีดวัคซีน" },

  { id: 'il01', quest: 'illness', question: '"I have a headache." หมายความว่าอย่างไร?', options: ['ฉันปวดท้อง','ฉันปวดศีรษะ','ฉันเป็นหวัด','ฉันปวดฟัน'], answer: 1, correctFeedback: 'ถูกต้อง! headache = ปวดศีรษะ', wrongFeedback: 'headache = head (หัว) + ache (ปวด) = ปวดหัว', keyword: 'headache = ปวดศีรษะ' },
  { id: 'il02', quest: 'illness', question: '"I have a stomachache." แปลว่าอะไร?', options: ['ปวดหัว','ปวดหลัง','ปวดท้อง','ปวดขา'], answer: 2, correctFeedback: 'ถูกแล้ว! stomachache = ปวดท้อง', wrongFeedback: 'stomach = กระเพาะ/ท้อง + ache = ปวด', keyword: 'stomachache = ปวดท้อง' },
  { id: 'il03', quest: 'illness', question: '"Fever" หมายถึงอาการใด?', options: ['ไอ','จาม','มีไข้','เป็นหวัด'], answer: 2, correctFeedback: 'ถูกต้อง! Fever = มีไข้', wrongFeedback: 'Fever = มีไข้ (อุณหภูมิร่างกายสูง)', keyword: 'fever = มีไข้' },
  { id: 'il04', quest: 'illness', question: '"I have a cold." แปลว่าอะไร?', options: ['ฉันหนาว','ฉันเป็นหวัด','ฉันปวดหัว','ฉันเจ็บคอ'], answer: 1, correctFeedback: 'ถูกแล้ว! have a cold = เป็นหวัด', wrongFeedback: '"have a cold" = เป็นหวัด (ไม่ใช่แค่ความเย็น)', keyword: 'have a cold = เป็นหวัด' },
  { id: 'il05', quest: 'illness', question: '"Cough" หมายถึงอะไร?', options: ['จาม','ไอ','อาเจียน','วิงเวียน'], answer: 1, correctFeedback: 'ถูกต้อง! Cough = ไอ', wrongFeedback: 'Cough = ไอ | Sneeze = จาม', keyword: 'cough = ไอ' },
  { id: 'il06', quest: 'illness', question: '"Sneeze" แปลว่าอะไร?', options: ['ไอ','จาม','คัน','แสบ'], answer: 1, correctFeedback: 'เก่งมาก! Sneeze = จาม', wrongFeedback: 'Sneeze = จาม | Cough = ไอ', keyword: 'sneeze = จาม' },
  { id: 'il07', quest: 'illness', question: 'ถ้าต้องการบอกแพทย์ว่า "เจ็บคอ" จะพูดว่าอย่างไร?', options: ['I have a sore back.','I have a sore throat.','I have a stomachache.','I have a headache.'], answer: 1, correctFeedback: 'ถูกต้อง! sore throat = เจ็บคอ', wrongFeedback: 'sore throat = เจ็บคอ (throat = ลำคอ)', keyword: 'sore throat = เจ็บคอ' },
  { id: 'il08', quest: 'illness', question: '"Medicine" หมายถึงอะไร?', options: ['แพทย์','ยา','โรงพยาบาล','พยาบาล'], answer: 1, correctFeedback: 'ถูกแล้ว! Medicine = ยา', wrongFeedback: 'Medicine = ยา | Doctor = แพทย์', keyword: 'medicine = ยา' },
  { id: 'il09', quest: 'illness', question: '"Nurse" แปลว่าอะไร?', options: ['แพทย์','ทันตแพทย์','พยาบาล','เภสัชกร'], answer: 2, correctFeedback: 'ถูกต้อง! Nurse = พยาบาล', wrongFeedback: 'Nurse = พยาบาล | Doctor = แพทย์', keyword: 'nurse = พยาบาล' },
  { id: 'il10', quest: 'illness', question: '"Toothache" แปลว่าอะไร?', options: ['ปวดหัว','ปวดท้อง','ปวดฟัน','ปวดขา'], answer: 2, correctFeedback: 'ถูกแล้ว! toothache = ปวดฟัน', wrongFeedback: 'tooth = ฟัน + ache = ปวด = ปวดฟัน', keyword: 'toothache = ปวดฟัน' },
  { id: 'il11', quest: 'illness', question: '"Dizzy" หมายถึงอาการใด?', options: ['คลื่นไส้','วิงเวียนศีรษะ','อ่อนเพลีย','ใจสั่น'], answer: 1, correctFeedback: 'ถูกต้อง! Dizzy = วิงเวียนศีรษะ', wrongFeedback: 'Dizzy = วิงเวียนศีรษะ', keyword: 'dizzy = วิงเวียน' },
  { id: 'il12', quest: 'illness', question: '"I feel nauseous." แปลว่าอะไร?', options: ['ฉันรู้สึกปวดหัว','ฉันรู้สึกคลื่นไส้','ฉันรู้สึกเหนื่อย','ฉันรู้สึกหนาว'], answer: 1, correctFeedback: 'ถูกแล้ว! nauseous = คลื่นไส้', wrongFeedback: 'nauseous = คลื่นไส้ อยากอาเจียน', keyword: 'nauseous = คลื่นไส้' },
  { id: 'il13', quest: 'illness', question: '"Allergy" หมายความว่าอะไร?', options: ['โรคหัวใจ','ภูมิแพ้','โรคหอบ','โรคเบาหวาน'], answer: 1, correctFeedback: 'ถูกต้อง! Allergy = ภูมิแพ้', wrongFeedback: 'Allergy = ภูมิแพ้ (แพ้อาหาร แพ้ฝุ่น ฯลฯ)', keyword: 'allergy = ภูมิแพ้' },
  { id: 'il14', quest: 'illness', question: 'ข้อใดแปลว่า "รับประทานยา"?', options: ['take medicine','make medicine','give medicine','buy medicine'], answer: 0, correctFeedback: 'ถูกแล้ว! take medicine = รับประทานยา', wrongFeedback: 'take medicine = รับประทานยา (take = รับประทาน/กิน)', keyword: 'take medicine = กินยา' },
  { id: 'il15', quest: 'illness', question: '"Pharmacy" คืออะไร?', options: ['โรงพยาบาล','คลินิก','ร้านขายยา','ห้องฉุกเฉิน'], answer: 2, correctFeedback: 'ถูกต้อง! Pharmacy = ร้านขายยา', wrongFeedback: 'Pharmacy = ร้านขายยา (Pharmacist = เภสัชกร)', keyword: 'pharmacy = ร้านขายยา' },
  { id: 'il16', quest: 'illness', question: '"Rest" ในบริบทการเจ็บป่วยหมายถึงอะไร?', options: ['ออกกำลังกาย','พักผ่อน','รับประทานยา','ไปหาหมอ'], answer: 1, correctFeedback: 'ถูกต้อง! Rest = พักผ่อน', wrongFeedback: 'Rest = พักผ่อน เป็นสิ่งสำคัญเมื่อเจ็บป่วย', keyword: 'rest = พักผ่อน' },
  { id: 'il17', quest: 'illness', question: '"I broke my arm." แปลว่าอะไร?', options: ['ฉันแขนเจ็บ','ฉันแขนหัก','ฉันแขนบวม','ฉันแขนชา'], answer: 1, correctFeedback: 'ถูกแล้ว! broke = หัก (past tense ของ break)', wrongFeedback: 'break/broke = หัก → I broke my arm = แขนหัก', keyword: 'broke my arm = แขนหัก' },
  { id: 'il18', quest: 'illness', question: 'ถ้าต้องการพบแพทย์จะพูดว่าอย่างไร?', options: ['I want to see a doctor.','I want to be a doctor.','I have a doctor.','I see the doctor yesterday.'], answer: 0, correctFeedback: 'ถูกต้อง! see a doctor = พบแพทย์', wrongFeedback: '"see a doctor" = ไปพบแพทย์', keyword: 'see a doctor = พบแพทย์' },
  { id: 'il19', quest: 'illness', question: '"Bandage" หมายถึงอะไร?', options: ['ยาแก้ปวด','ผ้าพันแผล','สเปรย์ยา','เข็มฉีดยา'], answer: 1, correctFeedback: 'ถูกต้อง! Bandage = ผ้าพันแผล', wrongFeedback: 'Bandage = ผ้าพันแผล', keyword: 'bandage = ผ้าพันแผล' },
  { id: 'il20', quest: 'illness', question: '"Ambulance" คืออะไร?', options: ['รถดับเพลิง','รถฉุกเฉิน/รถพยาบาล','รถตำรวจ','รถบัส'], answer: 1, correctFeedback: 'เก่งมาก! Ambulance = รถพยาบาล', wrongFeedback: 'Ambulance = รถพยาบาล/รถฉุกเฉิน', keyword: 'ambulance = รถพยาบาล' },
];

export const jobsQuestions = [
  { id: 'j01', quest: 'jobs', question: '"Doctor" แปลว่าอะไร?', options: ['ครู','แพทย์','วิศวกร','ทนายความ'], answer: 1, correctFeedback: 'ถูกต้อง! Doctor = แพทย์', wrongFeedback: 'Doctor = แพทย์', keyword: 'doctor = แพทย์' },
  { id: 'j02', quest: 'jobs', question: '"Teacher" แปลว่าอะไร?', options: ['นักเรียน','ครู','ผู้บริหาร','พนักงาน'], answer: 1, correctFeedback: 'ถูกแล้ว! Teacher = ครู', wrongFeedback: 'Teacher = ครู | Student = นักเรียน', keyword: 'teacher = ครู' },
  { id: 'j03', quest: 'jobs', question: '"Police Officer" คืออาชีพอะไร?', options: ['ทหาร','ตำรวจ','นักดับเพลิง','เจ้าหน้าที่ศุลกากร'], answer: 1, correctFeedback: 'ถูกต้อง! Police Officer = ตำรวจ', wrongFeedback: 'Police Officer = เจ้าหน้าที่ตำรวจ', keyword: 'police officer = ตำรวจ' },
  { id: 'j04', quest: 'jobs', question: '"Firefighter" แปลว่าอะไร?', options: ['นักมวย','นักดับเพลิง','ทหาร','ยาม'], answer: 1, correctFeedback: 'เก่งมาก! Firefighter = นักดับเพลิง', wrongFeedback: 'Fire = ไฟ, Fighter = นักสู้ → Firefighter = นักดับเพลิง', keyword: 'firefighter = นักดับเพลิง' },
  { id: 'j05', quest: 'jobs', question: '"Engineer" แปลว่าอะไร?', options: ['สถาปนิก','วิศวกร','ช่างไฟ','นักวิทยาศาสตร์'], answer: 1, correctFeedback: 'ถูกต้อง! Engineer = วิศวกร', wrongFeedback: 'Engineer = วิศวกร', keyword: 'engineer = วิศวกร' },
  { id: 'j06', quest: 'jobs', question: '"Chef" คืออาชีพใด?', options: ['พนักงานเสิร์ฟ','พ่อครัว/แม่ครัว','คนล้างจาน','เจ้าของร้าน'], answer: 1, correctFeedback: 'ถูกแล้ว! Chef = พ่อครัว/แม่ครัว', wrongFeedback: 'Chef = พ่อครัวหรือแม่ครัวมืออาชีพ', keyword: 'chef = พ่อครัว' },
  { id: 'j07', quest: 'jobs', question: '"Pilot" แปลว่าอะไร?', options: ['นักบิน','ช่างซ่อมเครื่องบิน','พนักงานต้อนรับบนเครื่องบิน','ผู้ควบคุมการบิน'], answer: 0, correctFeedback: 'ถูกต้อง! Pilot = นักบิน', wrongFeedback: 'Pilot = นักบิน (คนขับเครื่องบิน)', keyword: 'pilot = นักบิน' },
  { id: 'j08', quest: 'jobs', question: '"Farmer" แปลว่าอะไร?', options: ['คนขับรถ','ชาวประมง','เกษตรกร/ชาวนา','คนสวน'], answer: 2, correctFeedback: 'เยี่ยม! Farmer = เกษตรกร/ชาวนา', wrongFeedback: 'Farmer = เกษตรกร (คนทำนา/ไร่)', keyword: 'farmer = เกษตรกร' },
  { id: 'j09', quest: 'jobs', question: '"Lawyer" คืออาชีพใด?', options: ['แพทย์','ผู้พิพากษา','ทนายความ','อัยการ'], answer: 2, correctFeedback: 'ถูกต้อง! Lawyer = ทนายความ', wrongFeedback: 'Lawyer = ทนายความ', keyword: 'lawyer = ทนายความ' },
  { id: 'j10', quest: 'jobs', question: '"Artist" แปลว่าอะไร?', options: ['นักดนตรี','ศิลปิน','นักแสดง','นักเขียน'], answer: 1, correctFeedback: 'ถูกแล้ว! Artist = ศิลปิน', wrongFeedback: 'Artist = ศิลปิน (คนที่สร้างงานศิลปะ)', keyword: 'artist = ศิลปิน' },
  { id: 'j11', quest: 'jobs', question: '"Dentist" คืออาชีพอะไร?', options: ['แพทย์ทั่วไป','ทันตแพทย์','จักษุแพทย์','เภสัชกร'], answer: 1, correctFeedback: 'ถูกต้อง! Dentist = ทันตแพทย์', wrongFeedback: 'Dentist = ทันตแพทย์ (หมอฟัน) | Dent = ฟัน', keyword: 'dentist = ทันตแพทย์' },
  { id: 'j12', quest: 'jobs', question: '"Scientist" แปลว่าอะไร?', options: ['วิศวกร','นักวิทยาศาสตร์','นักคณิตศาสตร์','นักประดิษฐ์'], answer: 1, correctFeedback: 'เก่งมาก! Scientist = นักวิทยาศาสตร์', wrongFeedback: 'Scientist = นักวิทยาศาสตร์', keyword: 'scientist = นักวิทยาศาสตร์' },
  { id: 'j13', quest: 'jobs', question: '"What do you do?" ในบริบทงานหมายความว่าอะไร?', options: ['คุณทำอะไรอยู่ตอนนี้?','คุณทำงานอะไร?','คุณอยู่ที่ไหน?','คุณไปทำงานเมื่อไหร่?'], answer: 1, correctFeedback: 'ถูกต้อง! "What do you do?" = คุณทำงานอะไร?', wrongFeedback: '"What do you do?" ถามเกี่ยวกับอาชีพ', keyword: 'What do you do? = ทำงานอะไร?' },
  { id: 'j14', quest: 'jobs', question: '"Architect" คืออาชีพใด?', options: ['วิศวกร','สถาปนิก','นักออกแบบตกแต่ง','ช่างก่อสร้าง'], answer: 1, correctFeedback: 'ถูกแล้ว! Architect = สถาปนิก', wrongFeedback: 'Architect = สถาปนิก (ออกแบบอาคาร)', keyword: 'architect = สถาปนิก' },
  { id: 'j15', quest: 'jobs', question: '"I am a nurse." แปลว่าอะไร?', options: ['ฉันอยากเป็นพยาบาล','ฉันรู้จักพยาบาล','ฉันเป็นพยาบาล','ฉันช่วยพยาบาล'], answer: 2, correctFeedback: 'ถูกต้อง! I am a nurse. = ฉันเป็นพยาบาล', wrongFeedback: 'I am = ฉันเป็น → I am a nurse = ฉันเป็นพยาบาล', keyword: 'I am a nurse. = ฉันเป็นพยาบาล' },
  { id: 'j16', quest: 'jobs', question: '"Accountant" แปลว่าอะไร?', options: ['นักบัญชี','นักเศรษฐศาสตร์','พนักงานธนาคาร','ผู้จัดการ'], answer: 0, correctFeedback: 'เก่งมาก! Accountant = นักบัญชี', wrongFeedback: 'Accountant = นักบัญชี', keyword: 'accountant = นักบัญชี' },
  { id: 'j17', quest: 'jobs', question: '"Waiter/Waitress" คืออาชีพอะไร?', options: ['พ่อครัว','พนักงานเสิร์ฟ','แคชเชียร์','ผู้จัดการร้าน'], answer: 1, correctFeedback: 'ถูกแล้ว! Waiter/Waitress = พนักงานเสิร์ฟ', wrongFeedback: 'Waiter (ชาย) / Waitress (หญิง) = พนักงานเสิร์ฟ', keyword: 'waiter/waitress = พนักงานเสิร์ฟ' },
  { id: 'j18', quest: 'jobs', question: '"Soldier" แปลว่าอะไร?', options: ['ตำรวจ','นักดับเพลิง','ทหาร','ยาม'], answer: 2, correctFeedback: 'ถูกต้อง! Soldier = ทหาร', wrongFeedback: 'Soldier = ทหาร', keyword: 'soldier = ทหาร' },
  { id: 'j19', quest: 'jobs', question: '"Journalist" คืออาชีพใด?', options: ['บรรณาธิการ','นักข่าว/ผู้สื่อข่าว','นักเขียน','พิธีกร'], answer: 1, correctFeedback: 'ถูกต้อง! Journalist = นักข่าว', wrongFeedback: 'Journalist = นักข่าว/ผู้สื่อข่าว', keyword: 'journalist = นักข่าว' },
  { id: 'j20', quest: 'jobs', question: '"She works in a hospital." เธอน่าจะประกอบอาชีพอะไร?', options: ['ครู','แพทย์หรือพยาบาล','วิศวกร','ทนายความ'], answer: 1, correctFeedback: 'ถูกต้อง! ทำงานในโรงพยาบาลน่าจะเป็นแพทย์หรือพยาบาล', wrongFeedback: 'hospital = โรงพยาบาล → น่าจะเป็นแพทย์หรือพยาบาล', keyword: 'hospital worker = แพทย์/พยาบาล' },
];

export const foodQuestions = [

  // --- อิมพอร์ตจาก 1.5 อาหาร.pdf ---
  { id: 'f_pdf_01', quest: 'food', question: "Your foreign friend asks, 'What is your favorite Thai food?' What do you answer?", options: ["I like pizza.", "I love papaya salad.", "I go to school.", "I read books."], answer: 1, correctFeedback: "ถูกต้อง! Papaya salad (ส้มตำ) เป็นอาหารไทย", wrongFeedback: "คำถามถามถึงอาหารไทย (Thai food)", keyword: "favorite Thai food = อาหารไทยที่ชอบ" },
  { id: 'f_pdf_02', quest: 'food', question: "You are at a restaurant and want to order fried rice. What will you say?", options: ["I want fried rice, please.", "I go swimming.", "I like cartoons.", "It’s too cold."], answer: 0, correctFeedback: "เยี่ยมมาก! เป็นประโยคสุภาพในการสั่งอาหาร", wrongFeedback: "คุณต้องการสั่งอาหาร ต้องตอบ I want fried rice, please.", keyword: "order = สั่งอาหาร" },
  { id: 'f_pdf_03', quest: 'food', question: "Your friend says, 'I don’t like spicy food.' What should you say?", options: ["Try green curry!", "Let’s eat salad instead.", "Eat more chili.", "I don’t like food."], answer: 1, correctFeedback: "ถูกต้อง! สลัดไม่เผ็ด เหมาะสำหรับคนไม่กินเผ็ด", wrongFeedback: "ถ้าเพื่อนไม่ชอบเผ็ด (don't like spicy) ต้องแนะนำอาหารที่ไม่เผ็ด เช่น สลัด", keyword: "don't like spicy food = ไม่ชอบอาหารเผ็ด" },
  { id: 'f_pdf_04', quest: 'food', question: "A waiter asks, 'Eat here or take away?' What is the best answer?", options: ["In the car.", "To school.", "Eat here, please.", "Go to bed."], answer: 2, correctFeedback: "ถูกต้อง! Eat here = ทานที่ร้าน", wrongFeedback: "Eat here = ทานที่ร้าน / Take away = นำกลับบ้าน", keyword: "Eat here or take away = ทานที่นี่หรือกลับบ้าน" },
  { id: 'f_pdf_05', quest: 'food', question: "You want to describe pizza to your friend. What do you say?", options: ["Pizza is spicy soup.", "Pizza is sweet rice.", "Pizza is round and has cheese.", "Pizza is green curry."], answer: 2, correctFeedback: "ถูกต้อง! พิซซ่ามีลักษณะกลมและมีชีส", wrongFeedback: "พิซซ่าต้องกลม (round) และมีชีส (cheese)", keyword: "describe = อธิบายลักษณะ" },
  { id: 'f_pdf_06', quest: 'food', question: "What is a popular spicy Thai food?", options: ["Sushi", "Hamburger", "Papaya salad", "Spaghetti"], answer: 2, correctFeedback: "ถูกต้อง! ส้มตำเป็นอาหารไทยที่มีรสเผ็ด", wrongFeedback: "Spicy Thai food = อาหารไทยรสเผ็ด (Papaya salad)", keyword: "spicy Thai food = อาหารไทยรสเผ็ด" },
  { id: 'f_pdf_07', quest: 'food', question: "What food is from Japan?", options: ["Curry", "Sushi", "Fried rice", "Noodles"], answer: 1, correctFeedback: "ถูกต้อง! ซูชิเป็นอาหารญี่ปุ่น", wrongFeedback: "Sushi มาจากญี่ปุ่น (Japan)", keyword: "from Japan = มาจากญี่ปุ่น" },
  { id: 'f_pdf_08', quest: 'food', question: "Which one is a dessert?", options: ["Sticky rice with mango", "Pizza", "Sandwich", "Pasta"], answer: 0, correctFeedback: "ถูกต้อง! ข้าวเหนียวมะม่วงเป็นของหวาน (Dessert)", wrongFeedback: "Dessert แปลว่าของหวาน", keyword: "dessert = ของหวาน" },
  { id: 'f_pdf_09', quest: 'food', question: "What do you eat with chopsticks?", options: ["Sandwich", "Noodles", "Hamburger", "Fried rice"], answer: 1, correctFeedback: "ถูกต้อง! บะหมี่/ก๋วยเตี๋ยวใช้ตะเกียบกิน", wrongFeedback: "chopsticks = ตะเกียบ ใช้กิน Noodles", keyword: "chopsticks = ตะเกียบ" },
  { id: 'f_pdf_10', quest: 'food', question: "What is a symbol for eating at a place? (ป้าย 🍽️)", options: ["Sleep here", "Eat here", "No entry", "Trash bin"], answer: 1, correctFeedback: "ถูกต้อง! สัญลักษณ์รูปช้อนส้อมหมายถึงทานที่นี่", wrongFeedback: "รูปช้อนส้อม 🍽️ หมายถึง Eat here (ทานที่ร้าน)", keyword: "symbol = สัญลักษณ์" },

  { id: 'f01', quest: 'food', question: '"Rice" แปลว่าอะไร?', options: ['ข้าว','ขนมปัง','เส้นก๋วยเตี๋ยว','มันฝรั่ง'], answer: 0, correctFeedback: 'ถูกต้อง! Rice = ข้าว', wrongFeedback: 'Rice = ข้าว | Bread = ขนมปัง', keyword: 'rice = ข้าว' },
  { id: 'f02', quest: 'food', question: '"I would like to order, please." ใช้พูดในสถานการณ์ใด?', options: ['ชำระเงิน','สั่งอาหาร','ขอเมนู','เรียกพนักงาน'], answer: 1, correctFeedback: 'ถูกแล้ว! ใช้สั่งอาหาร', wrongFeedback: '"I would like to order" = ฉันอยากสั่ง (อาหาร)', keyword: 'I would like to order = ขอสั่ง' },
  { id: 'f03', quest: 'food', question: '"Spicy" แปลว่าอะไร?', options: ['หวาน','เปรี้ยว','เผ็ด','เค็ม'], answer: 2, correctFeedback: 'ถูกต้อง! Spicy = เผ็ด', wrongFeedback: 'Spicy = เผ็ด | Sweet = หวาน | Sour = เปรี้ยว', keyword: 'spicy = เผ็ด' },
  { id: 'f04', quest: 'food', question: '"Menu" แปลว่าอะไร?', options: ['ใบเสร็จ','รายการอาหาร/เมนู','ใบสั่งอาหาร','ป้ายร้าน'], answer: 1, correctFeedback: 'ถูกต้อง! Menu = รายการอาหาร', wrongFeedback: 'Menu = เมนูรายการอาหาร', keyword: 'menu = เมนูอาหาร' },
  { id: 'f05', quest: 'food', question: '"How much is this dish?" ถามถึงอะไร?', options: ['รสชาติ','ราคาของจานนี้','วิธีทำ','ส่วนผสม'], answer: 1, correctFeedback: 'ถูกแล้ว! How much = ราคาเท่าไหร่', wrongFeedback: 'How much = เท่าไหร่ → ถามราคา', keyword: 'How much = ราคาเท่าไหร่' },
  { id: 'f06', quest: 'food', question: '"Delicious" แปลว่าอะไร?', options: ['จืด','อร่อย','เผ็ด','หอม'], answer: 1, correctFeedback: 'ถูกต้อง! Delicious = อร่อย', wrongFeedback: 'Delicious = อร่อยมาก', keyword: 'delicious = อร่อย' },
  { id: 'f07', quest: 'food', question: '"Vegetarian" หมายถึงอะไร?', options: ['คนชอบกินเนื้อ','คนกินมังสวิรัติ','คนแพ้อาหาร','คนกินอาหารทะเล'], answer: 1, correctFeedback: 'ถูกแล้ว! Vegetarian = มังสวิรัติ (ไม่กินเนื้อสัตว์)', wrongFeedback: 'Vegetarian = คนกินมังสวิรัติ (vegetable = ผัก)', keyword: 'vegetarian = มังสวิรัติ' },
  { id: 'f08', quest: 'food', question: '"Bill, please." ใช้พูดในสถานการณ์ใด?', options: ['สั่งอาหาร','ขอเมนู','ขอใบเสร็จ/เก็บเงิน','ขอน้ำ'], answer: 2, correctFeedback: 'ถูกต้อง! Bill = ใบเสร็จ/ค่าอาหาร', wrongFeedback: '"Bill, please" = ขอบิล/เก็บเงินด้วย', keyword: 'Bill please = ขอบิล' },
  { id: 'f09', quest: 'food', question: '"Dessert" แปลว่าอะไร?', options: ['เครื่องดื่ม','ของว่าง','ของหวาน','อาหารเช้า'], answer: 2, correctFeedback: 'เก่งมาก! Dessert = ของหวาน', wrongFeedback: 'Dessert = ของหวาน | Desert (ทะเลทราย) ต่างกัน!', keyword: 'dessert = ของหวาน' },
  { id: 'f10', quest: 'food', question: '"I am allergic to seafood." แปลว่าอะไร?', options: ['ฉันชอบอาหารทะเล','ฉันแพ้อาหารทะเล','ฉันไม่กินอาหารทะเล','ฉันสั่งอาหารทะเล'], answer: 1, correctFeedback: 'ถูกแล้ว! allergic to = แพ้', wrongFeedback: 'allergic to = แพ้ → allergic to seafood = แพ้อาหารทะเล', keyword: 'allergic to = แพ้' },
  { id: 'f11', quest: 'food', question: '"Sweet" แปลว่าอะไร?', options: ['เผ็ด','เปรี้ยว','หวาน','ขม'], answer: 2, correctFeedback: 'ถูกต้อง! Sweet = หวาน', wrongFeedback: 'Sweet = หวาน | Bitter = ขม | Sour = เปรี้ยว', keyword: 'sweet = หวาน' },
  { id: 'f12', quest: 'food', question: '"Fresh" ในบริบทอาหารหมายถึงอะไร?', options: ['สุก','สด','แช่แข็ง','ปรุงสำเร็จ'], answer: 1, correctFeedback: 'ถูกแล้ว! Fresh = สด', wrongFeedback: 'Fresh = สด เช่น fresh vegetables = ผักสด', keyword: 'fresh = สด' },
  { id: 'f13', quest: 'food', question: '"May I have the menu?" แปลว่าอะไร?', options: ['ฉันขอสั่งอาหารได้ไหม','ขอเมนูได้ไหม','อาหารอร่อยไหม','ฉันขอน้ำได้ไหม'], answer: 1, correctFeedback: 'ถูกต้อง! May I have the menu? = ขอดูเมนูได้ไหม', wrongFeedback: '"May I have..." = ขอ... ได้ไหม', keyword: 'May I have the menu? = ขอเมนู' },
  { id: 'f14', quest: 'food', question: '"Salty" แปลว่าอะไร?', options: ['หวาน','เผ็ด','เค็ม','เปรี้ยว'], answer: 2, correctFeedback: 'ถูกแล้ว! Salty = เค็ม', wrongFeedback: 'Salty = เค็ม | Salt = เกลือ', keyword: 'salty = เค็ม' },
  { id: 'f15', quest: 'food', question: '"Take away" หมายความว่าอะไร?', options: ['นั่งทานที่ร้าน','สั่งผ่านแอป','สั่งกลับบ้าน/ห่อกลับ','จองโต๊ะ'], answer: 2, correctFeedback: 'ถูกต้อง! Take away = ห่อกลับบ้าน', wrongFeedback: 'Take away = ซื้อกลับ/ห่อกลับ (ไม่กินที่ร้าน)', keyword: 'take away = ห่อกลับ' },
  { id: 'f16', quest: 'food', question: '"Boiled" ในการปรุงอาหารหมายถึงอะไร?', options: ['ทอด','ย่าง','ต้ม','นึ่ง'], answer: 2, correctFeedback: 'ถูกแล้ว! Boiled = ต้ม', wrongFeedback: 'Boiled = ต้ม | Fried = ทอด | Grilled = ย่าง | Steamed = นึ่ง', keyword: 'boiled = ต้ม' },
  { id: 'f17', quest: 'food', question: '"Fried" ในการปรุงอาหารหมายถึงอะไร?', options: ['ต้ม','ทอด','อบ','นึ่ง'], answer: 1, correctFeedback: 'ถูกต้อง! Fried = ทอด', wrongFeedback: 'Fried = ทอด | Fried rice = ข้าวผัด', keyword: 'fried = ทอด' },
  { id: 'f18', quest: 'food', question: '"Can I get a refill?" ถามถึงอะไร?', options: ['ขอเพิ่มอาหาร','ขอเติมเครื่องดื่ม','ขอเปลี่ยนเมนู','ขอใบเสร็จ'], answer: 1, correctFeedback: 'ถูกแล้ว! refill = เติม (เครื่องดื่ม)', wrongFeedback: 'refill = การเติมซ้ำ → get a refill = ขอเติม', keyword: 'refill = เติม' },
  { id: 'f19', quest: 'food', question: '"Bread" แปลว่าอะไร?', options: ['ข้าว','ขนมปัง','แป้ง','เค้ก'], answer: 1, correctFeedback: 'ถูกต้อง! Bread = ขนมปัง', wrongFeedback: 'Bread = ขนมปัง', keyword: 'bread = ขนมปัง' },
  { id: 'f20', quest: 'food', question: '"I am full." ในบริบทอาหารหมายความว่าอะไร?', options: ['ฉันหิวมาก','ฉันอิ่มแล้ว','ฉันไม่ชอบอาหาร','ฉันรอพนักงาน'], answer: 1, correctFeedback: 'ถูกแล้ว! I am full. = ฉันอิ่มแล้ว', wrongFeedback: 'full = เต็ม/อิ่ม → I am full = ฉันอิ่มแล้ว', keyword: 'I am full = อิ่มแล้ว' },
];

export const numbersQuestions = [
  { id: 'n01', quest: 'numbers', question: '"Hundred" แปลว่าอะไร?', options: ['สิบ','ร้อย','พัน','หมื่น'], answer: 1, correctFeedback: 'ถูกต้อง! Hundred = ร้อย', wrongFeedback: 'Hundred = ร้อย | Thousand = พัน', keyword: 'hundred = ร้อย' },
  { id: 'n02', quest: 'numbers', question: '"Thousand" แปลว่าอะไร?', options: ['ร้อย','พัน','หมื่น','แสน'], answer: 1, correctFeedback: 'ถูกแล้ว! Thousand = พัน', wrongFeedback: 'Thousand = พัน | Million = ล้าน', keyword: 'thousand = พัน' },
  { id: 'n03', quest: 'numbers', question: 'ราคา "Three hundred baht" เท่ากับกี่บาท?', options: ['30','300','3,000','30,000'], answer: 1, correctFeedback: 'ถูกต้อง! Three hundred = สามร้อย = 300', wrongFeedback: 'Three hundred = 3 × 100 = 300', keyword: 'three hundred = 300' },
  { id: 'n04', quest: 'numbers', question: '"What time is it?" ถามถึงอะไร?', options: ['วันที่เท่าไหร่','กี่โมงแล้ว','ราคาเท่าไหร่','อายุเท่าไหร่'], answer: 1, correctFeedback: 'ถูกแล้ว! What time is it? = กี่โมงแล้ว?', wrongFeedback: 'What time = เวลา → กี่โมงแล้ว?', keyword: 'What time is it? = กี่โมงแล้ว' },
  { id: 'n05', quest: 'numbers', question: '"It is half past two." หมายความว่ากี่โมง?', options: ['1:30','2:15','2:30','2:45'], answer: 2, correctFeedback: 'ถูกต้อง! half past two = 2:30 น.', wrongFeedback: 'half past = ครึ่งชั่วโมง past two = หลังสองโมง → 2:30', keyword: 'half past two = 2:30' },
  { id: 'n06', quest: 'numbers', question: '"It is a quarter to three." หมายความว่ากี่โมง?', options: ['3:15','2:45','3:45','2:15'], answer: 1, correctFeedback: 'ถูกต้อง! quarter to three = 2:45 น.', wrongFeedback: 'quarter to three = ก่อนสามโมง 15 นาที = 2:45', keyword: 'quarter to three = 2:45' },
  { id: 'n07', quest: 'numbers', question: '"The shirt costs fifty baht." เสื้อราคาเท่าไหร่?', options: ['15 บาท','50 บาท','500 บาท','5 บาท'], answer: 1, correctFeedback: 'ถูกแล้ว! fifty = 50', wrongFeedback: 'fifty = 50 | fifteen = 15 | five = 5', keyword: 'fifty = 50' },
  { id: 'n08', quest: 'numbers', question: '"Double" แปลว่าอะไร?', options: ['ครึ่ง','สาม','สองเท่า','สี่เท่า'], answer: 2, correctFeedback: 'ถูกต้อง! Double = สองเท่า', wrongFeedback: 'Double = สองเท่า | Half = ครึ่งหนึ่ง', keyword: 'double = สองเท่า' },
  { id: 'n09', quest: 'numbers', question: '"How old are you?" ถามถึงอะไร?', options: ['คุณสูงเท่าไหร่','คุณอายุเท่าไหร่','คุณหนักเท่าไหร่','คุณชื่ออะไร'], answer: 1, correctFeedback: 'ถูกแล้ว! How old = อายุเท่าไหร่', wrongFeedback: 'How old are you? = คุณอายุเท่าไหร่?', keyword: 'How old are you? = อายุเท่าไหร่' },
  { id: 'n10', quest: 'numbers', question: '"I am twelve years old." แปลว่าอะไร?', options: ['ฉันอายุสิบขวบ','ฉันอายุสิบสองขวบ','ฉันอายุยี่สิบขวบ','ฉันอายุสิบสองปี (ปี ค.ศ.)'], answer: 1, correctFeedback: 'ถูกต้อง! twelve = สิบสอง', wrongFeedback: 'twelve = 12 → I am twelve years old = อายุ 12 ปี', keyword: 'twelve = 12' },
  { id: 'n11', quest: 'numbers', question: '"Second" ในบริบทตัวเลขลำดับหมายถึงอะไร?', options: ['ที่หนึ่ง','ที่สอง','วินาที','ครั้งที่สอง'], answer: 1, correctFeedback: 'ถูกแล้ว! Second (ลำดับ) = ที่สอง', wrongFeedback: 'Second = ที่สอง (ordinal) หรือ วินาที (เวลา)', keyword: 'second = ที่สอง' },
  { id: 'n12', quest: 'numbers', question: '"The temperature is thirty-five degrees." อุณหภูมิเท่าไหร่?', options: ['25°','30°','35°','45°'], answer: 2, correctFeedback: 'ถูกต้อง! thirty-five = 35', wrongFeedback: 'thirty-five = 35 → 35 degrees', keyword: 'thirty-five = 35' },
  { id: 'n13', quest: 'numbers', question: '"Dozen" หมายถึงจำนวนเท่าไหร่?', options: ['6','10','12','20'], answer: 2, correctFeedback: 'เก่งมาก! Dozen = 12 ชิ้น/ดิสสัน', wrongFeedback: 'A dozen = 12 ชิ้น (เช่น a dozen eggs = ไข่ 12 ฟอง)', keyword: 'dozen = 12' },
  { id: 'n14', quest: 'numbers', question: '"My phone number is 081-234-5678." ในประโยคนี้ "081" คืออะไร?', options: ['รหัสไปรษณีย์','รหัสประเทศ','รหัสพื้นที่/เบอร์ต้น','รหัสบ้าน'], answer: 2, correctFeedback: 'ถูกต้อง! 081 คือรหัสต้นของเบอร์โทร', wrongFeedback: 'ในเบอร์โทรศัพท์ไทย 3 ตัวแรกคือรหัสต้น', keyword: 'phone number prefix = รหัสต้น' },
  { id: 'n15', quest: 'numbers', question: '"Half" แปลว่าอะไร?', options: ['ทั้งหมด','สองเท่า','ครึ่งหนึ่ง','หนึ่งในสาม'], answer: 2, correctFeedback: 'ถูกต้อง! Half = ครึ่งหนึ่ง', wrongFeedback: 'Half = ครึ่ง (1/2) | Double = สองเท่า', keyword: 'half = ครึ่ง' },
  { id: 'n16', quest: 'numbers', question: '"The store opens at nine a.m." ร้านเปิดกี่โมง?', options: ['9:00 น. (เช้า)','9:00 น. (เย็น)','19:00 น.','21:00 น.'], answer: 0, correctFeedback: 'ถูกแล้ว! a.m. = เช้า (ก่อนเที่ยง)', wrongFeedback: 'a.m. = ante meridiem = ก่อนเที่ยง (เช้า) | p.m. = บ่าย/เย็น', keyword: 'a.m. = เช้า | p.m. = บ่าย' },
  { id: 'n17', quest: 'numbers', question: 'ข้อใดเขียนตัวเลข "1,500" ถูกต้องในภาษาอังกฤษ?', options: ['One hundred and fifty','Fifteen hundred','One thousand five hundred','One five zero zero'], answer: 2, correctFeedback: 'ถูกต้อง! One thousand five hundred = 1,500', wrongFeedback: '1,500 = One thousand five hundred (พันห้าร้อย)', keyword: '1,500 = one thousand five hundred' },
  { id: 'n18', quest: 'numbers', question: '"The class has twenty-eight students." ห้องเรียนมีนักเรียนกี่คน?', options: ['18','20','28','82'], answer: 2, correctFeedback: 'ถูกต้อง! twenty-eight = 28', wrongFeedback: 'twenty = 20, eight = 8 → twenty-eight = 28', keyword: 'twenty-eight = 28' },
  { id: 'n19', quest: 'numbers', question: '"Midnight" แปลว่าอะไร?', options: ['เที่ยงวัน','เที่ยงคืน','รุ่งเช้า','บ่ายสาม'], answer: 1, correctFeedback: 'ถูกแล้ว! Midnight = เที่ยงคืน', wrongFeedback: 'Midnight = เที่ยงคืน | Noon = เที่ยงวัน', keyword: 'midnight = เที่ยงคืน' },
  { id: 'n20', quest: 'numbers', question: '"The price is two hundred and fifty baht." ราคาเท่าไหร่?', options: ['200 บาท','250 บาท','205 บาท','2,050 บาท'], answer: 1, correctFeedback: 'ถูกต้อง! two hundred and fifty = 250', wrongFeedback: 'two hundred (200) and fifty (50) = 250 บาท', keyword: 'two hundred and fifty = 250' },
];

import {
  questionWordQuestions,
  signDetectiveQuestions,
  conversationRescueQuestions,
  mapEscapeQuestions,
  readingDetectiveQuestions
} from './chapter3_questions';

// ── 12 Chapter 5 Topic Questions ─────────────────────────────
export const pronounsQuestions = [
  { id: 'pq1', question: 'John plays with ___ dog in the park.', translation: 'จอห์นเล่นกับสุนัขของ___ในสวนสาธารณะ', options: ['his', 'him', 'he', 'himself'], answer: 0, correctFeedback: 'ถูกต้อง! John เป็นผู้ชาย ใช้แสดงความเป็นเจ้าของ = his', wrongFeedback: 'John (ผู้ชาย) สรรพนามแสดงความเป็นเจ้าของคือ his', keyword: 'John (ผู้ชาย) → his' },
  { id: 'pq2', question: 'Mary finished ___ homework early.', translation: 'แมรี่ทำการบ้านของ___เสร็จแต่เช้า', options: ['her', 'hers', 'she', 'herself'], answer: 0, correctFeedback: 'ถูกต้อง! Mary เป็นผู้หญิง ใช้ her homework', wrongFeedback: 'Mary (ผู้หญิง) แสดงความเป็นเจ้าของคือ her', keyword: 'Mary (ผู้หญิง) → her' },
  { id: 'pq3', question: 'This cat cleans ___ every day.', translation: 'แมวตัวนี้ทำความสะอาดตัวมันเองทุกๆ วัน', options: ['itself', 'its', 'it', 'himself'], answer: 0, correctFeedback: 'ถูกต้อง! แมวทำความสะอาดตัวมันเอง = itself (Reflexive)', wrongFeedback: 'สัตว์ทำความสะอาดตัวเองใช้ itself', keyword: 'cat → itself' },
  { id: 'pq4', question: 'That pen is not yours. It is ___.', translation: 'ปากกาแท่งนั้นไม่ใช่ของคุณ มันคือ___', options: ['mine', 'my', 'me', 'myself'], answer: 0, correctFeedback: 'ถูกต้อง! mine = ของฉัน (ไม่มีคำนามตามหลัง)', wrongFeedback: 'ลงท้ายประโยคแสดงความเป็นเจ้าของใช้ mine', keyword: 'ของฉัน (ไม่มีนามตาม) → mine' },
  { id: 'pq5', question: 'Teacher told ___ to sit down.', translation: 'คุณครูบอกให้___นั่งลง', options: ['us', 'we', 'our', 'ourselves'], answer: 0, correctFeedback: 'ถูกต้อง! us = พวกเรา (รูปกรรมหลังกริยา told)', wrongFeedback: 'หลังกริยาต้องใช้สรรพนามรูปกรรม (us)', keyword: 'หลังกริยา → รูปกรรม us' }
];

export const quantifiersQuestions = [
  { id: 'nqq1', question: 'There are two ___ under the table.', translation: 'มี___สองตัวอยู่ใต้โต๊ะ', options: ['mice', 'mouses', 'mouse', 'mices'], answer: 0, correctFeedback: 'ถูกต้อง! mouse เปลี่ยนเป็น mice เมื่อเป็นพหูพจน์', wrongFeedback: 'mouse พหูพจน์คือ mice (หนูหลายตัว)', keyword: 'mouse → mice' },
  { id: 'nqq2', question: 'I wash my ___ before sleeping.', translation: 'ฉันล้าง___ของฉันก่อนเข้านอน', options: ['feet', 'foots', 'foot', 'feets'], answer: 0, correctFeedback: 'ถูกต้อง! foot สองข้างเป็น feet', wrongFeedback: 'foot พหูพจน์คือ feet (เท้าสองข้าง)', keyword: 'foot → feet' },
  { id: 'nqq3', question: 'Do you have ___ milk in the fridge?', translation: 'คุณมีนมในตู้เย็นบ้างไหม?', options: ['any', 'some', 'many', 'few'], answer: 0, correctFeedback: 'ถูกต้อง! ใช้ any ในประโยคคำถาม', wrongFeedback: 'ประโยคคำถามใช้นามนับไม่ได้ใช้ any', keyword: 'คำถาม → any' },
  { id: 'nqq4', question: 'There is ___ water in the bottle.', translation: 'มีน้ำอยู่ในขวด', options: ['some', 'many', 'few', 'any'], answer: 0, correctFeedback: 'ถูกต้อง! ใช้ some ในประโยคบอกเล่ากับนามนับไม่ได้', wrongFeedback: 'ประโยคบอกเล่าใช้นามนับไม่ได้ใช้ some', keyword: 'บอกเล่า + นับไม่ได้ → some' },
  { id: 'nqq5', question: 'How ___ books do you read?', translation: 'คุณอ่านหนังสือจำนวนกี่เล่ม?', options: ['many', 'much', 'little', 'some'], answer: 0, correctFeedback: 'ถูกต้อง! books เป็นนามนับได้พหูพจน์ใช้ How many', wrongFeedback: 'books นับได้พหูพจน์ใช้ How many', keyword: 'books นับได้ → How many' }
];

export const adjectivesCompQuestions = [
  { id: 'acq1', question: 'An elephant is ___ than a dog.', translation: 'ช้างตัว___กว่าสุนัข', options: ['bigger', 'big', 'biggest', 'more big'], answer: 0, correctFeedback: 'ถูกต้อง! เปรียบเทียบสองสิ่งขั้นกว่าใช้ -er + than', wrongFeedback: 'มีคำว่า than ตามหลัง ต้องใช้ขั้นกว่า (bigger)', keyword: 'than → bigger' },
  { id: 'acq2', question: 'Mount Everest is the ___ mountain in the world.', translation: 'ยอดเขาเอเวอเรสต์เป็นภูเขาที่___ที่สุดในโลก', options: ['highest', 'higher', 'high', 'more high'], answer: 0, correctFeedback: 'ถูกต้อง! ขั้นสุดมี the นำหน้าใช้ -est (the highest)', wrongFeedback: 'มีคำว่า the นำหน้า ต้องใช้ขั้นสุด (highest)', keyword: 'the → highest' },
  { id: 'acq3', question: 'This exam is ___ than yesterday\'s exam.', translation: 'การสอบชุดนี้___กว่าเมื่อวาน', options: ['easier', 'easy', 'easiest', 'more easy'], answer: 0, correctFeedback: 'ถูกต้อง! easy เปลี่ยนเป็นง่ายกว่า = easier', wrongFeedback: 'easy เปลี่ยน y เป็น i แล้วเติม -er = easier', keyword: 'easy → easier' },
  { id: 'acq4', question: 'She is the ___ student in our class.', translation: 'เธอเป็นนักเรียนที่___ที่สุดในห้องเรียน', options: ['best', 'good', 'better', 'more good'], answer: 0, correctFeedback: 'ถูกต้อง! good ขั้นสุดคือ the best (ดีที่สุด)', wrongFeedback: 'good ขั้นสุดคือ the best', keyword: 'good → the best' }
];

export const prepositionsQuestions = [
  { id: 'prq1', question: 'My birthday is ___ October 31st.', translation: 'วันเกิดของฉันตรงกับวันที่ 31 ตุลาคม', options: ['on', 'in', 'at', 'under'], answer: 0, correctFeedback: 'ถูกต้อง! มีวันที่ระบุแน่นอนใช้ on', wrongFeedback: 'วันที่ระบุแน่นอน (October 31st) ใช้ on', keyword: 'วันที่ระบุ → on' },
  { id: 'prq2', question: 'He gets up ___ 6:00 a.m. every day.', translation: 'เขาตื่นนอนเวลา 6 โมงเช้าทุกวัน', options: ['at', 'on', 'in', 'by'], answer: 0, correctFeedback: 'ถูกต้อง! เวลาตามนาฬิกา (6:00 a.m.) ใช้ at', wrongFeedback: 'ระบุเวลาเป็นชั่วโมงใช้ at', keyword: 'เวลาชั่วโมง → at' },
  { id: 'prq3', question: 'We usually go to the beach ___ summer.', translation: 'พวกเรามักจะไปเที่ยวทะเลในฤดูร้อน', options: ['in', 'on', 'at', 'with'], answer: 0, correctFeedback: 'ถูกต้อง! ฤดูกาล (summer) ใช้ in', wrongFeedback: 'ฤดูกาลและเดือนใช้ in', keyword: 'ฤดูกาล → in' },
  { id: 'prq4', question: 'The cat is sleeping ___ the bed.', translation: 'แมวนอนอยู่บนเตียง', options: ['on', 'at', 'in', 'to'], answer: 0, correctFeedback: 'ถูกต้อง! อยู่บนพื้นผิวใช้ on', wrongFeedback: 'อยู่บนเตียงใช้ on the bed', keyword: 'บนพื้นผิว → on' }
];

export const clothesQuestions = [
  { id: 'clq1', question: 'She wears a ___ when it rains outside.', translation: 'เธอสวม___เมื่อข้างนอกฝนตก', options: ['raincoat', 'sunglasses', 'trousers', 'shorts'], answer: 0, correctFeedback: 'ถูกต้อง! ฝนตกใช้ raincoat (เสื้อกันฝน)', wrongFeedback: 'rains = ฝนตก ต้องใส่ raincoat', keyword: 'rains → raincoat' },
  { id: 'clq2', question: 'Put on your ___ because it is very cold.', translation: 'สวม___ของคุณซะ เพราะอากาศหนาวมาก', options: ['sweater', 'swimsuit', 'cap', 't-shirt'], answer: 0, correctFeedback: 'ถูกต้อง! อากาศหนาวใช้ sweater (เสื้อกันหนาว)', wrongFeedback: 'cold = อากาศหนาว ต้องใส่ sweater', keyword: 'cold → sweater' },
  { id: 'clq3', question: 'Students wear school ___ from Monday to Friday.', translation: 'นักเรียนสวม___โรงเรียนตั้งแต่วันจันทร์ถึงศุกร์', options: ['uniform', 'jacket', 'sunglasses', 'pyjamas'], answer: 0, correctFeedback: 'ถูกต้อง! นักเรียนใส่ชุดนักเรียน = uniform', wrongFeedback: 'ชุดนักเรียนเรียกว่า school uniform', keyword: 'ชุดนักเรียน = uniform' },
  { id: 'clq4', question: 'You put on ___ before putting on your shoes.', translation: 'คุณสวม___ก่อนที่จะสวมรองเท้า', options: ['socks', 'hat', 'belt', 'ring'], answer: 0, correctFeedback: 'ถูกต้อง! ใส่ถุงเท้า (socks) ก่อนใส่รองเท้า', wrongFeedback: 'ใส่ก่อนรองเท้าคือ socks (ถุงเท้า)', keyword: 'ก่อนรองเท้า → socks' }
];

export const weatherQuestions = [
  { id: 'wq1', question: 'Don\'t forget your umbrella! It is ___ today.', translation: 'อย่าลืมร่มของคุณนะ! วันนี้ฝนตก', options: ['rainy', 'sunny', 'hot', 'foggy'], answer: 0, correctFeedback: 'ถูกต้อง! ร่ม (umbrella) ใช้เมื่อ rainy (ฝนตก)', wrongFeedback: 'umbrella = ร่ม สภาพอากาศคือ rainy', keyword: 'umbrella → rainy' },
  { id: 'wq2', question: 'Put on your sweater. The weather is very ___.', translation: 'สวมเสื้อกันหนาวของคุณซะ สภาพอากาศหนาวมาก', options: ['cold', 'hot', 'sunny', 'warm'], answer: 0, correctFeedback: 'ถูกต้อง! เสื้อกันหนาว (sweater) ใช้เมื่อ cold (หนาว)', wrongFeedback: 'sweater = เสื้อกันหนาว สภาพอากาศคือ cold', keyword: 'sweater → cold' },
  { id: 'wq3', question: 'Trees lose their leaves in ___.', translation: 'ต้นไม้จะร่วงผลัดใบในฤดูใบไม้ร่วง', options: ['autumn', 'spring', 'summer', 'winter'], answer: 0, correctFeedback: 'ถูกต้อง! ใบไม้ร่วงในฤดูใบไม้ร่วง (autumn)', wrongFeedback: 'ใบไม้ร่วงเรียกว่า autumn/fall', keyword: 'ใบไม้ร่วง → autumn' },
  { id: 'wq4', question: 'The sun is shining brightly. It is a ___ day.', translation: 'ดวงอาทิตย์ส่องแสงสว่างจ้า วันนี้เป็นวันที่แดดแจ่มใส', options: ['sunny', 'rainy', 'windy', 'snowy'], answer: 0, correctFeedback: 'ถูกต้อง! แดดออกสว่าง = sunny', wrongFeedback: 'sun is shining = sunny (แดดจัด)', keyword: 'sun shining → sunny' }
];

export const emotionsQuestions = [
  { id: 'emq1', question: 'I won 1st place in the exam! I feel very ___.', translation: 'ฉันสอบได้อันดับที่ 1! ฉันรู้สึก___มาก', options: ['happy', 'sad', 'angry', 'scared'], answer: 0, correctFeedback: 'ถูกต้อง! ชนะที่ 1 รู้สึก happy (มีความสุข)', wrongFeedback: 'สอบได้ที่ 1 ย่อมรู้สึก happy', keyword: 'won 1st place → happy' },
  { id: 'emq2', question: 'The little girl cried because she lost her doll. She was ___.', translation: 'เด็กหญิงร้องไห้เพราะเธอทำตุ๊กตาหาย เธอรู้สึก___', options: ['sad', 'happy', 'excited', 'proud'], answer: 0, correctFeedback: 'ถูกต้อง! ร้องไห้ตุ๊กตาหาย = sad (เศร้า)', wrongFeedback: 'cried (ร้องไห้) แสดงว่ารู้สึก sad', keyword: 'cried → sad' },
  { id: 'emq3', question: 'He saw a big spider in his room and felt ___.', translation: 'เขาเห็นแมงมุมยักษ์ในห้องและรู้สึก___', options: ['scared', 'happy', 'sleepy', 'hungry'], answer: 0, correctFeedback: 'ถูกต้อง! เจอแมงมุมยักษ์รู้สึก scared (กลัว)', wrongFeedback: 'เจอแมงมุมน่ากลัวรู้สึก scared', keyword: 'spider → scared' },
  { id: 'emq4', question: 'After running for two hours, Tom was very ___.', translation: 'หลังจากวิ่งนานถึง 2 ชั่วโมง ทอมรู้สึก___มาก', options: ['tired', 'angry', 'confused', 'proud'], answer: 0, correctFeedback: 'ถูกต้อง! วิ่งนาน 2 ชั่วโมงรู้สึก tired (เหนื่อย)', wrongFeedback: 'วิ่งนานรู้สึก tired (เหนื่อย)', keyword: 'running 2 hours → tired' }
];

export const countriesQuestions = [
  { id: 'cnq1', question: 'Ken is from Japan. He is ___.', translation: 'เคนมาจากประเทศญี่ปุ่น เขาเป็นคนสัญชาติ___', options: ['Japanese', 'Japan', 'Chinese', 'Thai'], answer: 0, correctFeedback: 'ถูกต้อง! มาจากประเทศ Japan สัญชาติคือ Japanese', wrongFeedback: 'จากประเทศ Japan สัญชาติคือ Japanese', keyword: 'Japan → Japanese' },
  { id: 'cnq2', question: 'Lisa is from Thailand. She speaks ___.', translation: 'ลิซ่ามาจากประเทศไทย เธอพูดภาษา___', options: ['Thai', 'Thailand', 'English', 'Japanese'], answer: 0, correctFeedback: 'ถูกต้อง! ภาษาประจำชาติไทยคือ Thai', wrongFeedback: 'ภาษาประจำประเทศไทยคือ Thai', keyword: 'Thailand → Thai' },
  { id: 'cnq3', question: 'Where are you from? — I am from ___.', translation: 'คุณมาจากที่ไหน? — ฉันมาจาก___', options: ['Thailand', 'Thai', 'American', 'Chinese'], answer: 0, correctFeedback: 'ถูกต้อง! ถาม from ต้องตอบชื่อประเทศ (Thailand)', wrongFeedback: 'from ต้องตามด้วยชื่อประเทศ (Thailand)', keyword: 'from + ประเทศ (Thailand)' },
  { id: 'cnq4', question: 'Tom is from America. His nationality is ___.', translation: 'ทอมมาจากประเทศอเมริกา สัญชาติของเขาคือ___', options: ['American', 'America', 'English', 'Japanese'], answer: 0, correctFeedback: 'ถูกต้อง! สัญชาติอเมริกันคือ American', wrongFeedback: 'สัญชาติจาก America คือ American', keyword: 'America → American' }
];

export const shapesQuestions = [
  { id: 'shq1', question: 'A basketball has a ___ shape.', translation: 'ลูกบาสเกตบอลมีรูปทรง___', options: ['circle', 'square', 'triangle', 'star'], answer: 0, correctFeedback: 'ถูกต้อง! ลูกบาสเกตบอลทรงกลม = circle', wrongFeedback: 'ลูกบาสเกตบอลเป็นวงกลม (circle)', keyword: 'basketball → circle' },
  { id: 'shq2', question: 'A box has four equal sides. It is a ___.', translation: 'กล่องใบนี้มีด้านเท่ากัน 4 ด้าน มันคือรูปทรง___', options: ['square', 'circle', 'triangle', 'oval'], answer: 0, correctFeedback: 'ถูกต้อง! สี่เหลี่ยมด้านเท่าคือ square', wrongFeedback: 'ด้านเท่า 4 ด้านคือ square (สี่เหลี่ยมจัตุรัส)', keyword: 'four equal sides → square' },
  { id: 'shq3', question: 'A slice of pizza looks like a ___.', translation: 'พิซซ่าหนึ่งชิ้นดูคล้ายกับรูปทรง___', options: ['triangle', 'circle', 'square', 'star'], answer: 0, correctFeedback: 'ถูกต้อง! ชิ้นพิซซ่าทรงสามเหลี่ยม = triangle', wrongFeedback: 'พิซซ่าหั่นชิ้นเป็นสามเหลี่ยม (triangle)', keyword: 'slice of pizza → triangle' },
  { id: 'shq4', question: 'An egg has an ___ shape.', translation: 'ไข่ไก่มีรูปทรง___', options: ['oval', 'square', 'triangle', 'circle'], answer: 0, correctFeedback: 'ถูกต้อง! ไข่มีรูปทรงวงรี = oval', wrongFeedback: 'รูปไข่/วงรีเรียกว่า oval', keyword: 'egg → oval' }
];

export const environmentQuestions = [
  { id: 'evq1', question: 'We should ___ paper and plastic bottles.', translation: 'พวกเราควร___กระดาษและขวดพลาสติก', options: ['recycle', 'burn', 'throw', 'litter'], answer: 0, correctFeedback: 'ถูกต้อง! รีไซเคิลกระดาษและขวดพลาสติก = recycle', wrongFeedback: 'เพื่อสิ่งแวดล้อมควร recycle', keyword: 'bottles → recycle' },
  { id: 'evq2', question: 'Turn off the lights when leaving to ___ energy.', translation: 'ปิดไฟเมื่อออกจากห้องเพื่อ___พลังงาน', options: ['save', 'use', 'waste', 'buy'], answer: 0, correctFeedback: 'ถูกต้อง! ปิดไฟเพื่อประหยัดพลังงาน = save energy', wrongFeedback: 'ปิดไฟ = save energy (ประหยัดพลังงาน)', keyword: 'turn off lights → save' },
  { id: 'evq3', question: 'Planting ___ helps clean the air.', translation: 'การปลูกต้นไม้ช่วยให้อากาศบริสุทธิ์', options: ['trees', 'trash', 'cars', 'plastic'], answer: 0, correctFeedback: 'ถูกต้อง! ปลูกต้นไม้ช่วยให้อากาศบริสุทธิ์ = trees', wrongFeedback: 'ช่วยฟอกอากาศคือการปลูก trees', keyword: 'clean air → trees' },
  { id: 'evq4', question: 'Do not throw trash into rivers to prevent water ___.', translation: 'อย่าทิ้งขยะลงในแม่น้ำเพื่อป้องกันมลพิษทางน้ำ', options: ['pollution', 'recycle', 'saving', 'trees'], answer: 0, correctFeedback: 'ถูกต้อง! ขยะในแม่น้ำทำให้เกิดมลพิษทางน้ำ = pollution', wrongFeedback: 'มลพิษทางน้ำเรียกว่า water pollution', keyword: 'trash in rivers → pollution' }
];

export const subjectsQuestions = [
  { id: 'sbq1', question: 'My favorite subject is ___ because I like numbers.', translation: 'วิชาที่ฉันชอบที่สุดคือ___เพราะฉันชอบตัวเลข', options: ['Math', 'Art', 'P.E.', 'Music'], answer: 0, correctFeedback: 'ถูกต้อง! ตัวเลขและการคำนวณ = Math (คณิตศาสตร์)', wrongFeedback: 'numbers (ตัวเลข) คือวิชา Math', keyword: 'numbers → Math' },
  { id: 'sbq2', question: 'We play football and run in ___ class.', translation: 'พวกเราเล่นฟุตบอลและวิ่งในวิชา___', options: ['P.E.', 'Math', 'Science', 'English'], answer: 0, correctFeedback: 'ถูกต้อง! เล่นฟุตบอลและออกกำลังกาย = P.E. (พละ)', wrongFeedback: 'เล่นฟุตบอลในวิชา P.E.', keyword: 'play football → P.E.' },
  { id: 'sbq3', question: 'She draws pictures and paints in ___ class.', translation: 'เธอวาดรูปและระบายสีในวิชา___', options: ['Art', 'Science', 'Math', 'History'], answer: 0, correctFeedback: 'ถูกต้อง! วาดภาพระบายสี = Art (ศิลปะ)', wrongFeedback: 'draws pictures (วาดภาพ) คือวิชา Art', keyword: 'draws pictures → Art' },
  { id: 'sbq4', question: 'We do experiments in the laboratory during ___ class.', translation: 'พวกเราทำการทดลองในห้องแล็บระหว่างวิชา___', options: ['Science', 'P.E.', 'Art', 'Thai'], answer: 0, correctFeedback: 'ถูกต้อง! ทดลองในห้องแล็บ = Science (วิทยาศาสตร์)', wrongFeedback: 'experiments (การทดลอง) คือวิชา Science', keyword: 'experiments → Science' }
];

export const tensesQuestions = [
  { id: 'tenq1', question: 'He ___ football every Sunday afternoon.', translation: 'เขาเล่นฟุตบอลทุกๆ บ่ายวันอาทิตย์', options: ['plays', 'is playing', 'played', 'will play'], answer: 0, correctFeedback: 'ถูกต้อง! กิจวัตรทำประจำ (every Sunday) ใช้ Present Simple (plays)', wrongFeedback: 'every Sunday บอกความเป็นกิจวัตร ใช้ V1 (plays)', keyword: 'every Sunday → plays' },
  { id: 'tenq2', question: 'Look! She is ___ dinner in the kitchen right now.', translation: 'ดูสิ! ตอนนี้เธอกำลังทำอาหารอยู่ในครัว', options: ['cooking', 'cooks', 'cooked', 'will cook'], answer: 0, correctFeedback: 'ถูกต้อง! กำลังทำอยู่ตอนนี้ (right now) ใช้ is cooking', wrongFeedback: 'right now กำลังทำ ใช้ is + V-ing (cooking)', keyword: 'right now → is cooking' },
  { id: 'tenq3', question: 'We ___ the national museum yesterday.', translation: 'พวกเราได้ไปเที่ยวพิพิธภัณฑ์แห่งชาติเมื่อวานนี้', options: ['visited', 'visit', 'are visiting', 'will visit'], answer: 0, correctFeedback: 'ถูกต้อง! อดีต (yesterday) ใช้ Past Simple V2 (visited)', wrongFeedback: 'yesterday บอกอดีต ต้องใช้กริยาช่อง 2 (visited)', keyword: 'yesterday → visited' },
  { id: 'tenq4', question: 'They ___ to Bangkok tomorrow morning.', translation: 'พวกเขาจะบินไปกรุงเทพฯ ในเช้าวันพรุ่งนี้', options: ['will fly', 'flew', 'are flying', 'fly'], answer: 0, correctFeedback: 'ถูกต้อง! อนาคต (tomorrow) ใช้ Future Simple (will fly)', wrongFeedback: 'tomorrow บอกอนาคต ใช้ will + V1 (will fly)', keyword: 'tomorrow → will fly' }
];

export const weatherQuestions_2 = [
  { id: 'w_pdf_01', quest: 'weather_seasons', question: "You are in Canada in December. The weather is cold and snowy. What should you wear?", options: ["T-shirt and shorts", "Coat, scarf, and gloves", "Swimsuit", "Sandals"], answer: 1, correctFeedback: "ถูกต้อง! อากาศหนาว (cold and snowy) ต้องใส่เสื้อโค้ท ผ้าพันคอ และถุงมือ", wrongFeedback: "cold and snowy = หนาวและมีหิมะ ต้องใส่ Coat, scarf, gloves", keyword: "cold and snowy = หนาวมีหิมะ" },
  { id: 'w_pdf_02', quest: 'weather_seasons', question: "In autumn in the USA, the leaves on trees usually…", options: ["fall and change color", "grow new flowers", "become green", "stay the same"], answer: 0, correctFeedback: "ถูกต้อง! ฤดูใบไม้ร่วง ใบไม้จะเปลี่ยนสีและร่วงหล่น", wrongFeedback: "autumn = ฤดูใบไม้ร่วง (leaves fall and change color)", keyword: "autumn = ฤดูใบไม้ร่วง" },
  { id: 'w_pdf_03', quest: 'weather_seasons', question: "It is very hot in July in Spain. What activity is the most suitable?", options: ["Skiing in the mountains", "Going to the beach", "Making a snowman", "Planting rice"], answer: 1, correctFeedback: "ถูกต้อง! อากาศร้อน (very hot) เหมาะกับการไปชายหาด", wrongFeedback: "very hot = ร้อนมาก เหมาะกับ Going to the beach", keyword: "very hot = ร้อนมาก" },
  { id: 'w_pdf_04', quest: 'weather_seasons', question: "In winter, many families in Europe decorate their houses with lights. What festival is this?", options: ["Halloween", "Easter", "Thanksgiving", "Christmas"], answer: 3, correctFeedback: "ถูกต้อง! คริสต์มาสอยู่ในฤดูหนาวและมีการประดับไฟ", wrongFeedback: "winter = ฤดูหนาว เทศกาลในฤดูหนาวคือ Christmas", keyword: "winter = ฤดูหนาว" },
  { id: 'w_pdf_05', quest: 'weather_seasons', question: "In spring, the weather is usually…", options: ["cool and flowers bloom", "very hot", "very cold and snowy", "dry and dusty"], answer: 0, correctFeedback: "ถูกต้อง! ฤดูใบไม้ผลิ อากาศจะเย็นสบายและดอกไม้บาน", wrongFeedback: "spring = ฤดูใบไม้ผลิ (cool and flowers bloom)", keyword: "spring = ฤดูใบไม้ผลิ" },
  { id: 'w_pdf_06', quest: 'weather_seasons', question: "Which season is after summer in the UK?", options: ["Winter", "Spring", "Autumn", "Summer again"], answer: 2, correctFeedback: "ถูกต้อง! หลังฤดูร้อนคือฤดูใบไม้ร่วง (Autumn)", wrongFeedback: "หลังจาก summer คือ autumn (ใบไม้ร่วง)", keyword: "after summer = หลังฤดูร้อน" },
  { id: 'w_pdf_07', quest: 'weather_seasons', question: "Tom is planning a picnic in England. He checks the weather forecast: 'It will rain tomorrow.' What should he do?", options: ["Bring sunglasses", "Wear sandals", "Go swimming", "Take an umbrella"], answer: 3, correctFeedback: "ถูกต้อง! ถ้ารู้ว่าฝนจะตก (rain) ก็ต้องพกร่ม (umbrella)", wrongFeedback: "rain = ฝนตก ต้องใช้ umbrella (ร่ม)", keyword: "rain = ฝนตก" },
  { id: 'w_pdf_08', quest: 'weather_seasons', question: "In the USA, many people eat turkey and celebrate with family in November. What season is this?", options: ["Winter", "Autumn", "Spring", "Summer"], answer: 1, correctFeedback: "ถูกต้อง! เดือนพฤศจิกายนในอเมริกาอยู่ในช่วงฤดูใบไม้ร่วง (Autumn)", wrongFeedback: "พฤศจิกายน (November) คือ Autumn", keyword: "November = พฤศจิกายน (Autumn)" },
  { id: 'w_pdf_09', quest: 'weather_seasons', question: "Which of the following sentences is correct?", options: ["In summer, people wear coats and boots.", "In winter, people go skiing.", "In spring, it always snows.", "In autumn, people swim in the sea."], answer: 1, correctFeedback: "ถูกต้อง! ในฤดูหนาว ผู้คนจะไปเล่นสกี", wrongFeedback: "In winter, people go skiing. (ฤดูหนาวไปเล่นสกี)", keyword: "winter = ฤดูหนาว, skiing = เล่นสกี" },
  { id: 'w_pdf_10', quest: 'weather_seasons', question: "You are in Australia in January. What is the weather usually like?", options: ["Cold and snowy", "Rainy and stormy", "Hot and sunny", "Foggy and freezing"], answer: 2, correctFeedback: "ถูกต้อง! ออสเตรเลียอยู่ซีกโลกใต้ เดือนมกราคมคือฤดูร้อน", wrongFeedback: "ออสเตรเลียในเดือนมกราคมคือฤดูร้อน (Hot and sunny)", keyword: "Australia in January = ออสเตรเลียเดือนมกราคม (ฤดูร้อน)" },
];

export const emotionsQuestions_2 = [
  { id: 'e_pdf_01', quest: 'emotions_feelings', question: "You studied hard and got full marks on a test. What would you probably say?", options: ["I’m so happy today!", "I’m very tired.", "I don’t like tests.", "Let’s go home."], answer: 0, correctFeedback: "ถูกต้อง! ได้คะแนนเต็มต้องรู้สึกดีใจ (happy)", wrongFeedback: "สอบได้คะแนนเต็ม (full marks) ต้องรู้สึกมีความสุข (I'm so happy)", keyword: "full marks = คะแนนเต็ม, happy = มีความสุข" },
  { id: 'e_pdf_02', quest: 'emotions_feelings', question: "Your friend looks worried. What should you ask?", options: ["Are you OK?", "I’m sleepy.", "Let’s play football.", "Good morning."], answer: 0, correctFeedback: "ถูกต้อง! เห็นเพื่อนกังวล ควรถามว่า Are you OK? (คุณโอเคไหม)", wrongFeedback: "เพื่อนหน้าตากังวล (worried) ควรถามด้วยความห่วงใยว่า Are you OK?", keyword: "worried = กังวล, Are you OK? = เป็นอะไรไหม" },
  { id: 'e_pdf_03', quest: 'emotions_feelings', question: "Your little brother broke your toy but he says sorry. What is the best response?", options: ["I hate you.", "It’s OK. Don’t worry.", "I want a new toy.", "Go away."], answer: 1, correctFeedback: "ถูกต้อง! ควรให้อภัยและบอกว่าไม่เป็นไร", wrongFeedback: "เมื่อมีคนขอโทษ (says sorry) ควรตอบรับคำขอโทษว่า It's OK. Don't worry.", keyword: "sorry = ขอโทษ, It's OK = ไม่เป็นไร" },
  { id: 'e_pdf_04', quest: 'emotions_feelings', question: "You are nervous before speaking on stage. What will you say to your friend?", options: ["I feel scared.", "I’m very tall.", "I like ice cream.", "Let’s go to the park."], answer: 0, correctFeedback: "ถูกต้อง! ประหม่าหรือตื่นเต้น มักจะรู้สึกกลัว (scared)", wrongFeedback: "nervous แปลว่า ประหม่า/กังวล ตรงกับความรู้สึก scared (กลัว)", keyword: "nervous = ประหม่า, scared = กลัว" },
  { id: 'e_pdf_05', quest: 'emotions_feelings', question: "Your teacher praises you for doing a good job. What should you say?", options: ["You’re welcome.", "Thank you, teacher.", "I don’t care.", "Never mind."], answer: 1, correctFeedback: "ถูกต้อง! เมื่อได้รับคำชม ควรกล่าวขอบคุณ", wrongFeedback: "มีคนชม (praises) ควรตอบขอบคุณ (Thank you)", keyword: "praises = ชื่นชม" },
  { id: 'e_pdf_06', quest: 'emotions_feelings', question: "You are excited because your family will go to the zoo tomorrow. What might you say?", options: ["I can’t wait!", "I am bored.", "I don’t like animals.", "It’s raining."], answer: 0, correctFeedback: "ถูกต้อง! I can't wait แปลว่า รอไม่ไหวแล้ว (ตื่นเต้นมาก)", wrongFeedback: "รู้สึกตื่นเต้น (excited) มักพูดว่า I can't wait! (อดใจรอไม่ไหวแล้ว)", keyword: "excited = ตื่นเต้น, I can't wait = อดใจรอไม่ไหว" },
  { id: 'e_pdf_07', quest: 'emotions_feelings', question: "Your friend is very sad because he lost his bag. What can you say to comfort him?", options: ["Don’t cry. I can help you.", "I don’t care.", "I’m so hungry.", "I like your bag."], answer: 0, correctFeedback: "ถูกต้อง! เป็นการปลอบใจและเสนอความช่วยเหลือ", wrongFeedback: "เพื่อนเศร้า (sad) ควรปลอบใจว่า Don't cry (อย่าร้องไห้) I can help you.", keyword: "sad = เศร้า, comfort = ปลอบใจ" },
  { id: 'e_pdf_08', quest: 'emotions_feelings', question: "You feel angry because someone took your seat. What might you say politely?", options: ["Excuse me, this is my seat.", "Get out now!", "I don’t like you.", "That’s funny."], answer: 0, correctFeedback: "ถูกต้อง! เป็นการทวงที่นั่งอย่างสุภาพ", wrongFeedback: "แม้จะโกรธ แต่ควรทวงที่นั่งอย่างสุภาพด้วย Excuse me, this is my seat.", keyword: "politely = อย่างสุภาพ, seat = ที่นั่ง" },
  { id: 'e_pdf_09', quest: 'emotions_feelings', question: "After playing football, you feel very tired. What can you say?", options: ["I need some rest.", "I’m very tall.", "Let’s study math.", "I don’t like shoes."], answer: 0, correctFeedback: "ถูกต้อง! เหนื่อย (tired) ก็ต้องพักผ่อน (rest)", wrongFeedback: "tired แปลว่า เหนื่อย ต้องบอกว่า I need some rest. (ฉันต้องการพักผ่อน)", keyword: "tired = เหนื่อย, rest = พักผ่อน" },
  { id: 'e_pdf_10', quest: 'emotions_feelings', question: "Your friend gives you a birthday gift. What should you say?", options: ["Thank you very much!", "Give me more.", "I don’t like this.", "Where are you going?"], answer: 0, correctFeedback: "ถูกต้อง! ได้รับของขวัญต้องกล่าวขอบคุณอย่างสุภาพ", wrongFeedback: "ได้รับของขวัญ (gift) ต้องตอบขอบคุณ (Thank you very much!)", keyword: "gift = ของขวัญ, Thank you = ขอบคุณ" },
];


export const aboutMyselfQuestions = [
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_1",
    "quest": "about_myself",
    "question": "A: 'What is your name?'\nB: '_____\'",
    "options": [
      "I am fine.",
      "My name is Ben.",
      "I like football.",
      "I am 11 years old."
    ],
    "answer": 1,
    "correctFeedback": "ถามชื่อ 'What is your name?' ต้องตอบ 'My name is Ben.' (ฉันชื่อเบน)",
    "wrongFeedback": "เมื่อมีคนถามชื่อ (name) ตอบ 'My name is...'",
    "keyword": "name = ชื่อ"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_2",
    "quest": "about_myself",
    "question": "Anna says, 'I am eleven years old.' How old is Anna?",
    "options": [
      "10",
      "11",
      "12",
      "9"
    ],
    "answer": 1,
    "correctFeedback": "Anna พูดว่า 'I am eleven years old.' แปลว่าเธออายุ 11 ปี",
    "wrongFeedback": "eleven = 11 ดังนั้น Anna อายุ 11 ปี",
    "keyword": "age = อายุ"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_3",
    "quest": "about_myself",
    "question": "A: 'Where do you study?'\nB: '_____\'",
    "options": [
      "I study at Ban Nong School.",
      "I play football.",
      "I am 11 years old.",
      "I like reading books."
    ],
    "answer": 0,
    "correctFeedback": "ถามสถานที่เรียน 'Where do you study?' ตอบ 'I study at Ban Nong School.' (ฉันเรียนที่โรงเรียนบ้านหนอง)",
    "wrongFeedback": "study แปลว่า เรียน ถามว่าเรียนที่ไหน ต้องตอบชื่อโรงเรียน",
    "keyword": "study = เรียน"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_4",
    "quest": "about_myself",
    "question": "Ben says, 'I like football.' What does Ben like?",
    "options": [
      "Drawing",
      "Reading",
      "Swimming",
      "Football"
    ],
    "answer": 3,
    "correctFeedback": "Ben พูดว่า 'I like football.' แปลว่าเขาชอบฟุตบอล",
    "wrongFeedback": "football = กีฬาฟุตบอล",
    "keyword": "like = ชอบ"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_5",
    "quest": "about_myself",
    "question": "Read the name tag: 'My name is Nina.' What is her name?",
    "options": [
      "Mina",
      "Lina",
      "Nina",
      "Tina"
    ],
    "answer": 2,
    "correctFeedback": "'My name is Nina.' หมายถึงชื่อของเธอคือ Nina",
    "wrongFeedback": "ป้ายชื่อบอกว่า Nina",
    "keyword": "name tag = ป้ายชื่อ"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_6",
    "quest": "about_myself",
    "question": "Read the sentence: 'I live in Nakhon Ratchasima.' Where does the person live?",
    "options": [
      "Bangkok",
      "Chiang Mai",
      "Phuket",
      "Nakhon Ratchasima"
    ],
    "answer": 3,
    "correctFeedback": "ประโยคบอกว่า 'I live in Nakhon Ratchasima.' แปลว่าเขาอาศัยอยู่ที่นครราชสีมา",
    "wrongFeedback": "live in = อาศัยอยู่ที่...",
    "keyword": "live = อาศัยอยู่"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_7",
    "quest": "about_myself",
    "question": "A: 'What do you like to do in your free time?'\nB: '_____\'",
    "options": [
      "I am 12 years old.",
      "I like reading books.",
      "I am in Prathom 6.",
      "I am Thai."
    ],
    "answer": 1,
    "correctFeedback": "ถามสิ่งที่ชอบทำ 'What do you like to do?' ตอบ 'I like reading books.' (ฉันชอบอ่านหนังสือ)",
    "wrongFeedback": "like reading = ชอบอ่านหนังสือ ตรงกับคำถามความชอบ",
    "keyword": "like to do = ชอบทำ"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_8",
    "quest": "about_myself",
    "question": "Mark says, 'I am in Prathom 6.' What grade is Mark in?",
    "options": [
      "Grade 4",
      "Grade 5",
      "Grade 6",
      "Grade 7"
    ],
    "answer": 2,
    "correctFeedback": "Prathom 6 คือชั้นประถมศึกษาปีที่ 6 (Grade 6)",
    "wrongFeedback": "Prathom 6 = Grade 6 (ป.6)",
    "keyword": "grade = ชั้นเรียน"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_9",
    "quest": "about_myself",
    "question": "'I am Thai.' What is this person's nationality?",
    "options": [
      "American",
      "Japanese",
      "Thai",
      "Chinese"
    ],
    "answer": 2,
    "correctFeedback": "'I am Thai.' แปลว่า ฉันเป็นคนไทย (สัญชาติไทย)",
    "wrongFeedback": "Thai = สัญชาติไทย / คนไทย",
    "keyword": "nationality = สัญชาติ"
  },
  {
    "id": "pdf_1.1_เกี่ยวกับตนเอง_10",
    "quest": "about_myself",
    "question": "Jane says, 'I study at Ban Nong School.' Where does Jane go to study?",
    "options": [
      "To a hospital",
      "To a park",
      "To a zoo",
      "To a school"
    ],
    "answer": 3,
    "correctFeedback": "'I study at Ban Nong School.' แปลว่าเรียนที่โรงเรียน (School)",
    "wrongFeedback": "Ban Nong School = โรงเรียนบ้านหนอง (School)",
    "keyword": "school = โรงเรียน"
  }
];

export const familyQuestions = [
  {
    "id": "pdf_1.2_ครอบครัว_1",
    "quest": "family",
    "question": "What does this symbol mean?",
    "options": [
      "Teacher",
      "Hospital",
      "Family",
      "School"
    ],
    "answer": 2,
    "correctFeedback": "เป็นสัญลักษณ์ของครอบครัว (Family)",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol",
    "image": "/assessment/quest-scenes/family-parents-v1.webp"
  },
  {
    "id": "pdf_1.2_ครอบครัว_2",
    "quest": "family",
    "question": "Anna says, 'This is my mother.' Who is Anna talking about?",
    "options": [
      "Her sister",
      "Her aunt",
      "Her mom",
      "Her cousin"
    ],
    "answer": 2,
    "correctFeedback": "คำว่า 'mother' หมายถึงแม่",
    "wrongFeedback": "Incorrect.",
    "keyword": "mother"
  },
  {
    "id": "pdf_1.2_ครอบครัว_3",
    "quest": "family",
    "question": "Ben has two brothers. How many brothers does Ben have?",
    "options": [
      "One",
      "Two",
      "Three",
      "Four"
    ],
    "answer": 1,
    "correctFeedback": "'has two brothers' แปลว่า มีพี่น้องชายสองคน",
    "wrongFeedback": "Incorrect.",
    "keyword": "brothers"
  },
  {
    "id": "pdf_1.2_ครอบครัว_4",
    "quest": "family",
    "question": "'My grandmother is 70 years old.' Who is 70?",
    "options": [
      "His aunt",
      "His grandmother",
      "His mom",
      "His cousin"
    ],
    "answer": 1,
    "correctFeedback": "คำว่า 'grandmother' หมายถึง ย่า/ยาย",
    "wrongFeedback": "Incorrect.",
    "keyword": "grandmother"
  },
  {
    "id": "pdf_1.2_ครอบครัว_5",
    "quest": "family",
    "question": "This is my uncle. He is a farmer. What is his job?",
    "options": [
      "Teacher",
      "Doctor",
      "Farmer",
      "Driver"
    ],
    "answer": 2,
    "correctFeedback": "ประโยคบอกว่าเขาเป็นชาวนา (farmer)",
    "wrongFeedback": "Incorrect.",
    "keyword": "job"
  },
  {
    "id": "pdf_1.2_ครอบครัว_6",
    "quest": "family",
    "question": "What does this symbol represent?",
    "options": [
      "Hospital",
      "School",
      "Home",
      "Park"
    ],
    "answer": 2,
    "correctFeedback": "เป็นสัญลักษณ์ของบ้าน (Home)",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol",
    "image": "/images/home.svg"
  },
  {
    "id": "pdf_1.2_ครอบครัว_7",
    "quest": "family",
    "question": "Lisa lives with her parents. Who does she live with?",
    "options": [
      "Friends",
      "Teacher",
      "Cousins",
      "Parents"
    ],
    "answer": 3,
    "correctFeedback": "'parents' หมายถึงพ่อแม่",
    "wrongFeedback": "Incorrect.",
    "keyword": "parents"
  },
  {
    "id": "pdf_1.2_ครอบครัว_8",
    "quest": "family",
    "question": "John says, 'I love my family.' What does John love?",
    "options": [
      "His dog",
      "His school",
      "His family",
      "His toys"
    ],
    "answer": 2,
    "correctFeedback": "'I love my family' แปลว่า ฉันรักครอบครัวของฉัน",
    "wrongFeedback": "Incorrect.",
    "keyword": "family"
  },
  {
    "id": "pdf_1.2_ครอบครัว_9",
    "reviewStatus": "quarantined",
    "reviewNote": "Codex 2026-10-13: stem asks whose mother; none of the choices correctly expresses the cousin's mother. Retain original item pending revision.",
    "quest": "family",
    "question": "My cousin is my aunt's son. Who is his mother?",
    "options": [
      "His grandmother",
      "His sister",
      "His aunt",
      "His cousin"
    ],
    "answer": 2,
    "correctFeedback": "ลูกของ aunt (ป้า/น้า) คือ cousin (ลูกพี่ลูกน้อง)",
    "wrongFeedback": "Incorrect.",
    "keyword": "aunt"
  },
  {
    "id": "pdf_1.2_ครอบครัว_10",
    "quest": "family",
    "question": "Who is your father's father?",
    "options": [
      "Uncle",
      "Brother",
      "Grandfather",
      "Cousin"
    ],
    "answer": 2,
    "correctFeedback": "พ่อของพ่อ คือ grandfather (ปู่/ตา)",
    "wrongFeedback": "Incorrect.",
    "keyword": "grandfather"
  }
].map(restoreFamilyMedia);

export const schoolQuestions = [
  {
    "id": "pdf_1.3_โรงเรียน_1",
    "quest": "school",
    "question": "What does this symbol mean?",
    "options": [
      "Playground",
      "School",
      "Office",
      "Shop"
    ],
    "answer": 1,
    "correctFeedback": "คือสัญลักษณ์ของโรงเรียน",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol",
    "image": "/images/school_sign.svg"
  },
  {
    "id": "pdf_1.3_โรงเรียน_2",
    "quest": "school",
    "question": "We eat lunch at the ______.",
    "options": [
      "Library",
      "Classroom",
      "Canteen",
      "Office"
    ],
    "answer": 2,
    "correctFeedback": "โรงอาหารคือที่ที่นักเรียนกินข้าวกลางวัน",
    "wrongFeedback": "Incorrect.",
    "keyword": "lunch"
  },
  {
    "id": "pdf_1.3_โรงเรียน_3",
    "quest": "school",
    "question": "Who teaches you at school?",
    "options": [
      "Nurse",
      "Driver",
      "Teacher",
      "Janitor"
    ],
    "answer": 2,
    "correctFeedback": "ครูคือผู้สอนในโรงเรียน",
    "wrongFeedback": "Incorrect.",
    "keyword": "teach"
  },
  {
    "id": "pdf_1.3_โรงเรียน_4",
    "quest": "school",
    "question": "I read books in the ______.",
    "options": [
      "Canteen",
      "Library",
      "Office",
      "Playground"
    ],
    "answer": 1,
    "correctFeedback": "ห้องสมุดคือที่อ่านหนังสือ",
    "wrongFeedback": "Incorrect.",
    "keyword": "books"
  },
  {
    "id": "pdf_1.3_โรงเรียน_5",
    "quest": "school",
    "question": "Where do you play with your friends?",
    "options": [
      "Library",
      "Playground",
      "Classroom",
      "Office"
    ],
    "answer": 1,
    "correctFeedback": "สนามเด็กเล่นคือที่เล่นกับเพื่อน",
    "wrongFeedback": "Incorrect.",
    "keyword": "play"
  },
  {
    "id": "pdf_1.3_โรงเรียน_6",
    "quest": "school",
    "question": "What do you wear to school?",
    "options": [
      "Pajamas",
      "Uniform",
      "Suit",
      "Jeans"
    ],
    "answer": 1,
    "correctFeedback": "นักเรียนใส่ชุดยูนิฟอร์มไปโรงเรียน",
    "wrongFeedback": "Incorrect.",
    "keyword": "wear"
  },
  {
    "id": "pdf_1.3_โรงเรียน_7",
    "quest": "school",
    "question": "Who is the head of the school?",
    "options": [
      "Teacher",
      "Student",
      "Principal",
      "Driver"
    ],
    "answer": 2,
    "correctFeedback": "ผู้อำนวยการคือหัวหน้าโรงเรียน",
    "wrongFeedback": "Incorrect.",
    "keyword": "head"
  },
  {
    "id": "pdf_1.3_โรงเรียน_8",
    "quest": "school",
    "question": "What rings at the start of class?",
    "options": [
      "Phone",
      "Alarm",
      "Bell",
      "Clock"
    ],
    "answer": 2,
    "correctFeedback": "ระฆังเป็นสัญญาณเริ่มชั้นเรีย",
    "wrongFeedback": "Incorrect.",
    "keyword": "rings"
  },
  {
    "id": "pdf_1.3_โรงเรียน_9",
    "quest": "school",
    "question": "Where do you sit in class?",
    "options": [
      "Table",
      "Chair",
      "Desk",
      "Bed"
    ],
    "answer": 2,
    "correctFeedback": "นักเรียนมักนั่งที่โต๊ะในห้องเรียน",
    "wrongFeedback": "Incorrect.",
    "keyword": "sit"
  },
  {
    "id": "pdf_1.3_โรงเรียน_10",
    "quest": "school",
    "question": "The teacher writes on the ______.",
    "options": [
      "Wall",
      "Window",
      "Blackboard",
      "Floor"
    ],
    "answer": 2,
    "correctFeedback": "ครูเขียนบนกระดานดำ",
    "wrongFeedback": "Incorrect.",
    "keyword": "writes"
  }
];


export const set3Questions = [
  {
    "id": "pdf_3.1_1",
    "quest": "conversation",
    "question": "What do you say when you meet someone in the morning?",
    "options": [
      "A. Good night",
      "B. Good morning",
      "C. Goodbye",
      "D. See you later"
    ],
    "answer": 1,
    "correctFeedback": "Good morning ใช้ทักทายตอนเช้า",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.1_2",
    "quest": "conversation",
    "question": "A: How are you?\nB: __________",
    "options": [
      "A. I’m twelve",
      "B. I’m from Thailand",
      "C. I’m fine, thank you",
      "D. My name is Anne"
    ],
    "answer": 2,
    "correctFeedback": "'I’m fine, thank you.' เป็นคำตอบที่เหมาะกับ 'How are you?'",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.1_3",
    "quest": "conversation",
    "question": "What is the correct reply to: 'Nice to meet you.'?",
    "options": [
      "A. You too",
      "B. Me too",
      "C. Nice to meet you, too",
      "D. See you again"
    ],
    "answer": 2,
    "correctFeedback": "'Nice to meet you, too.' คือคำตอบที่สุภาพและถูกต้อง",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.2_1",
    "quest": "conversation",
    "question": "What do you say when you leave your friend?",
    "options": [
      "A. Hello",
      "B. Good night",
      "C. Goodbye",
      "D. How are you?"
    ],
    "answer": 2,
    "correctFeedback": "'Goodbye' ใช้เมื่อต้องจากกัน",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.2_2",
    "quest": "conversation",
    "question": "A: Take care!\nB: __________",
    "options": [
      "A. You too",
      "B. Thank you",
      "C. Welcome",
      "D. Yes, I am"
    ],
    "answer": 0,
    "correctFeedback": "'You too' เป็นคำตอบที่เหมาะกับ 'Take care'",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.2_3",
    "quest": "conversation",
    "question": "What is a good sentence to say before going to bed?",
    "options": [
      "A. Good morning",
      "B. Good night",
      "C. See you later",
      "D. Take care"
    ],
    "answer": 1,
    "correctFeedback": "'Good night' ใช้ก่อนนอนเท่านั้น",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.3_1",
    "quest": "conversation",
    "question": "A: Here’s your book.\nB: __________",
    "options": [
      "A. Hello",
      "B. Thank you",
      "C. Goodbye",
      "D. I’m fine"
    ],
    "answer": 1,
    "correctFeedback": "'Thank you' เหมาะกับสถานการณ์ได้รับของ",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.3_2",
    "quest": "conversation",
    "question": "A: Thank you very much.\nB: __________",
    "options": [
      "A. You too",
      "B. You’re welcome",
      "C. See you",
      "D. Good morning"
    ],
    "answer": 1,
    "correctFeedback": "'You’re welcome' ใช้ตอบคำขอบคุณ",
    "wrongFeedback": ""
  },
  {
    "id": "pdf_3.3_3",
    "quest": "conversation",
    "question": "What should you say when someone gives you a gift?",
    "options": [
      "A. Take care",
      "B. Thanks!",
      "C. Good night",
      "D. I’m hungry"
    ],
    "answer": 1,
    "correctFeedback": "'Thanks!' เหมาะสมเมื่อได้รับของขวัญ",
    "wrongFeedback": ""
  }
];

export const set5Questions = [
  {
    "id": "pdf_set5_0",
    "quest": "signs",
    "question": "What should you do when the teacher says, “Be quiet”?",
    "options": [
      "A. Talk with friends",
      "B. Sing a song",
      "C. Stop talking",
      "D. Open your book"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_1",
    "quest": "signs",
    "question": "“Sit down” means:",
    "options": [
      "A. Stand up",
      "B. Take a seat",
      "C. Go out",
      "D. Line up"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_2",
    "quest": "signs",
    "question": "When you hear “Line up”, what should you do?",
    "options": [
      "A. Run around",
      "B. Get into a line",
      "C. Sit on the floor",
      "D. Clean the board"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_3",
    "quest": "signs",
    "question": "“Open your book” means:",
    "options": [
      "A. Close the book",
      "B. Write a book",
      "C. Read a book",
      "D. Turn the book open"
    ],
    "answer": 3,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_4",
    "quest": "signs",
    "question": "What does “Don’t run” tell you to do?",
    "options": [
      "A. Walk",
      "B. Jump",
      "C. Run",
      "D. Sit down"
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_5",
    "quest": "signs",
    "question": "You are in the classroom. Your teacher says, “Please open your book to page ten.” What should you do?",
    "options": [
      "A. Close your book",
      "B. Write your name",
      "C. Turn to page ten",
      "D. Put your book away"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_6",
    "quest": "signs",
    "question": "During the flag ceremony, the teacher says, “Line up and be quiet.” What should you do?",
    "options": [
      "A. Talk with friends",
      "B. Get in line and stop talking",
      "C. Run to the classroom",
      "D. Sit down and chat"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_7",
    "quest": "signs",
    "question": "Your classmate is running in the hallway. The teacher says, “Don’t run!” What does this mean?",
    "options": [
      "A. Keep running",
      "B. Walk slowly",
      "C. Jump",
      "D. Sit down"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_8",
    "quest": "signs",
    "question": "Your teacher says, “Listen carefully.” What should you do?",
    "options": [
      "A. Talk loudly",
      "B. Cover your ears",
      "C. Pay attention",
      "D. Start singing"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_9",
    "quest": "signs",
    "question": "In class, the teacher says, “Take out your English book.” What should you do?",
    "options": [
      "A. Hide your book",
      "B. Put your book away",
      "C. Take your English book out",
      "D. Open your notebook"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_10",
    "quest": "signs",
    "question": "You are in class and want your friend to open the window. What is the politest way to ask?",
    "options": [
      "A. Open the window now!",
      "B. Can you open the window, please?",
      "C. Open it!",
      "D. Why don’t you open it now?"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_11",
    "quest": "signs",
    "question": "Your teacher is carrying many books. What would you say to offer help?",
    "options": [
      "A. I will not help you.",
      "B. Let me help you with those.",
      "C. You can carry them.",
      "D. Why do you carry so many?"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_12",
    "quest": "signs",
    "question": "You want to borrow a pencil from your classmate. What would you say?",
    "options": [
      "A. Give me your pencil!",
      "B. Can I borrow your pencil, please?",
      "C. I need your pencil.",
      "D. This is my pencil now."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_13",
    "quest": "signs",
    "question": "You need to go to the toilet during class. What should you say to your teacher?",
    "options": [
      "A. I’m going now!",
      "B. Can I go to the toilet, please?",
      "C. I don't care, I’ll go.",
      "D. Toilet time."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_14",
    "quest": "signs",
    "question": "You want your friend to speak more slowly. What is a good way to say it?",
    "options": [
      "A. Stop talking so fast!",
      "B. Speak slowly!",
      "C. Could you speak more slowly, please?",
      "D. Say it now!"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_15",
    "quest": "signs",
    "question": "You want someone to pass the salt at lunch. What will you say?",
    "options": [
      "A. Give me the salt!",
      "B. Could you pass the salt, please?",
      "C. I want salt.",
      "D. Move the salt now."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_16",
    "quest": "signs",
    "question": "You are entering a room. What should you say to get someone’s attention politely?",
    "options": [
      "A. Hey!",
      "B. Hello!",
      "C. Yo!",
      "D. Excuse me."
    ],
    "answer": 3,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_17",
    "quest": "signs",
    "question": "You want a friend to help you with homework. What is the polite way to ask?",
    "options": [
      "A. Help me now!",
      "B. I can't do this.",
      "C. Can you help me with my homework, please?",
      "D. Give me answers."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_18",
    "quest": "signs",
    "question": "You want your classmate to be quiet. What is the best way to say it?",
    "options": [
      "A. Shut up!",
      "B. Be quiet!",
      "C. Could you be quiet, please?",
      "D. Stop it now."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_19",
    "quest": "signs",
    "question": "You are on a bus and want to sit. You see an empty seat. What should you say to the person next to it?",
    "options": [
      "A. Move!",
      "B. I want that seat.",
      "C. Can I sit here, please?",
      "D. This is my seat now."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_20",
    "quest": "signs",
    "question": "Anna is teaching her little brother how to brush his teeth. She says: 1. Get your toothbrush. 2. Put some toothpaste on it. 3. Brush your teeth for 2 minutes. What should he do second?",
    "options": [
      "A. Brush his teeth",
      "B. Rinse his mouth",
      "C. Put toothpaste on the toothbrush",
      "D. Get the toothbrush"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_21",
    "quest": "signs",
    "question": "The teacher gives this instruction in class: \"Open your book to page 18. Read the story quietly. Then, answer the three questions below.\" What should the students do last?",
    "options": [
      "A. Open the book",
      "B. Read the story",
      "C. Ask the teacher",
      "D. Answer the questions"
    ],
    "answer": 3,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_22",
    "quest": "signs",
    "question": "Jane wants to make a sandwich. She: 1. Takes out the bread. 2. Spreads peanut butter on it. 3. Puts the slices together. What is the first thing Jane does?",
    "options": [
      "A. Put the slices together",
      "B. Take out the bread",
      "C. Eat the sandwich",
      "D. Spread peanut butter"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_23",
    "quest": "signs",
    "question": "You see this instruction at the park: “Pick up your trash. Put it in the bin. Wash your hands after.” What should you do before washing your hands?",
    "options": [
      "A. Eat lunch",
      "B. Pick flowers",
      "C. Pick up trash and put it in the bin",
      "D. Go home"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_24",
    "quest": "signs",
    "question": "Your mom tells you: \"Take off your shoes. Wash your hands. Come to the table.\" What do you do before going to the table?",
    "options": [
      "A. Eat dinner",
      "B. Say thank you",
      "C. Wash your hands",
      "D. Watch TV"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_25",
    "quest": "signs",
    "question": "The teacher says: “Color the picture first. Then, write three sentences about it.” What is the second task?",
    "options": [
      "A. Color the picture",
      "B. Look at the picture",
      "C. Write three sentences",
      "D. Read the story"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_26",
    "quest": "signs",
    "question": "At school, you see this poster: \"Before you enter the computer room: 1. Take off your shoes. 2. Put them on the shelf. 3. Line up quietly.\" Which is the second step?",
    "options": [
      "A. Put shoes on shelf",
      "B. Go into the room",
      "C. Line up",
      "D. Run inside"
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_27",
    "quest": "signs",
    "question": "Ben is showing how to wash dishes. He says: “First, rinse the plates. Next, use soap and a sponge. Then rinse again and dry.” What comes after rinsing the plates?",
    "options": [
      "A. Dry the plates",
      "B. Use soap and sponge",
      "C. Eat food",
      "D. Put plates away"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_28",
    "quest": "signs",
    "question": "Your science teacher says: “Step 1: Put water in the glass. Step 2: Drop the tablet. Step 3: Wait and write what happens.” Which is the last step?",
    "options": [
      "A. Drop the tablet",
      "B. Put water in the glass",
      "C. Write what happens",
      "D. Clean the glass"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set5_29",
    "quest": "signs",
    "question": "Look at this classroom rule: “Clean your desk. Put your books in your bag. Then stand behind your chair.” What should students do last?",
    "options": [
      "A. Put books in the bag",
      "B. Clean the desk",
      "C. Sit down",
      "D. Stand behind the chair"
    ],
    "answer": 3,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  }
];

export const set7Questions = [
  {
    "id": "pdf_set7_0",
    "quest": "reading",
    "question": "Which sentence best describes the picture?",
    "options": [
      "A. They are going to school on a sunny day.",
      "B. They are walking to school in the rain.",
      "C. They are sleeping at home.",
      "D. They are playing in the classroom."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/rain-school-v1.webp"
  },
  {
    "id": "pdf_set7_1",
    "quest": "reading",
    "question": "What is the girl doing?",
    "options": [
      "A. She is having breakfast.",
      "B. She is brushing her teeth.",
      "C. She is studying English.",
      "D. She is playing football."
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/breakfast-v1.webp"
  },
  {
    "id": "pdf_set7_2",
    "quest": "reading",
    "question": "What can you say about the boy?",
    "options": [
      "A. He is helping to clean the classroom.",
      "B. He is reading a book quietly.",
      "C. He is sleeping in the classroom.",
      "D. He is playing games with friends."
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/clean-classroom-v1.webp"
  },
  {
    "id": "pdf_set7_3",
    "quest": "reading",
    "question": "What does the sign mean?",
    "options": [
      "A. You can smoke here.",
      "B. Don’t smoke in this area.",
      "C. Smoking is good for your health.",
      "D. Everyone must smoke."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/no_smoking.svg"
  },
  {
    "id": "pdf_set7_4",
    "quest": "reading",
    "question": "Which sentence is correct?",
    "options": [
      "A. The teacher is teaching and the students are listening.",
      "B. The teacher is sleeping.",
      "C. The students are playing football.",
      "D. The students are cleaning the classroom."
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/student-reading-v1.webp"
  },
  {
    "id": "pdf_set7_5",
    "quest": "reading",
    "question": "Which sentence matches the picture?",
    "options": [
      "A. The students are shouting.",
      "B. The library is very noisy.",
      "C. The students are reading quietly.",
      "D. The teacher is playing music."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/library-reading-v1.webp"
  },
  {
    "id": "pdf_set7_6",
    "quest": "reading",
    "question": "What can you infer from the picture?",
    "options": [
      "A. The man is happy.",
      "B. The man can’t call because there is no signal.",
      "C. The man is playing games happily.",
      "D. The man is watching a movie."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/no-signal-v2.webp"
  },
  {
    "id": "pdf_set7_7",
    "quest": "reading",
    "question": "Which sentence is suitable?",
    "options": [
      "A. They are throwing trash on the floor.",
      "B. They are cleaning the school area.",
      "C. They are fighting with each other.",
      "D. They are sleeping under the tree."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/clean-school-v1.webp"
  },
  {
    "id": "pdf_set7_8",
    "quest": "reading",
    "question": "Which is the best sentence for the picture?",
    "options": [
      "A. The boy is helping an old man cross the road.",
      "B. The boy is playing football with the old man.",
      "C. The boy is running away.",
      "D. The boy is waiting for a bus."
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/crossing-road-v1.webp"
  },
  {
    "id": "pdf_set7_9",
    "quest": "reading",
    "question": "What can you say about this situation?",
    "options": [
      "A. The students are noisy and not paying attention.",
      "B. The students are studying quietly.",
      "C. The teacher is happy with the students.",
      "D. The students are cleaning the classroom."
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/assessment/quest-scenes/noisy-classroom-v1.webp"
  },
  {
    "id": "pdf_set7_10",
    "quest": "reading",
    "question": "Which direction should you take to reach the café from point A?",
    "options": [
      "A. Go straight, then turn left at the post office.",
      "B. Go straight, then turn right at the post office.",
      "C. Go straight, then turn left at the bank.",
      "D. Turn left immediately."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/town_map.svg"
  },
  {
    "id": "pdf_set7_11",
    "quest": "reading",
    "question": "Where is the bookstore relative to the school?",
    "options": [
      "A. Behind the school",
      "B. Next to the school on the right",
      "C. In front of the school",
      "D. On the left side of the school"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/school_map.svg"
  },
  {
    "id": "pdf_set7_12",
    "quest": "reading",
    "question": "If you pass the living room, what room comes next?",
    "options": [
      "A. Bathroom",
      "B. Kitchen",
      "C. Bedroom",
      "D. Garden"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/house_map.svg"
  },
  {
    "id": "pdf_set7_13",
    "quest": "reading",
    "question": "What is the third step in the process?",
    "options": [
      "A. Start",
      "B. Write",
      "C. Read",
      "D. Check"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/flowchart.svg"
  },
  {
    "id": "pdf_set7_14",
    "quest": "reading",
    "question": "If you leave the school and go north, then east, you reach which place?",
    "options": [
      "A. Hospital",
      "B. Store",
      "C. Library",
      "D. Park"
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/town_map.svg"
  },
  {
    "id": "pdf_set7_15",
    "quest": "reading",
    "question": "Which bar chart is correct?",
    "options": [
      "A. Red sold the most.",
      "B. Red sold more than blue.",
      "C. Blue sold more than green.",
      "D. Blue sold less than green."
    ],
    "answer": 3,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/bar_colors.svg"
  },
  {
    "id": "pdf_set7_16",
    "quest": "reading",
    "question": "Which statement is true?",
    "options": [
      "A. The value in 2021 is the highest among the three years.",
      "B. The value in 2022 is higher than in 2021.",
      "C. The value in 2020 is higher than in 2022.",
      "D. The value in 2020 is the lowest."
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/bar_years.svg"
  },
  {
    "id": "pdf_set7_17",
    "quest": "reading",
    "question": "Which would be the correct sequence sentence?",
    "options": [
      "A. After school, students go to class then go home.",
      "B. Students go to class in the morning, then lunch, then after school, then home.",
      "C. Students go home first, then after school, then have lunch.",
      "D. Students have lunch, then go to class, then morning, then home."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set7_18",
    "quest": "reading",
    "question": "Which sentence best describes the trend?",
    "options": [
      "A. The English average rose steadily each year.",
      "B. The English average peaked in 2563 then declined in 2564.",
      "C. The English average in 2564 is the highest.",
      "D. The average dropped every year."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/bar_english.svg"
  },
  {
    "id": "pdf_set7_19",
    "quest": "reading",
    "question": "From the bar chart, which statement is correct?",
    "options": [
      "A. The population increased from 2566 to 2567.",
      "B. The population in 2568 is higher than in 2567.",
      "C. The population decreased each year from 2566 to 2568.",
      "D. The population in 2566 was the lowest among the three."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/bar_population.svg"
  },
  {
    "id": "pdf_set7_20",
    "quest": "reading",
    "question": "Which sentence is true about the English averages?",
    "options": [
      "A. The average in 2564 is higher than in 2563.",
      "B. The English average increased from 2562 to 2563.",
      "C. The English average stayed the same from 2563 to 2564.",
      "D. The English average in 2562 was the highest."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/table_scores.svg"
  },
  {
    "id": "pdf_set7_21",
    "quest": "reading",
    "question": "Which subject shows a greater change between 2563 and 2564?",
    "options": [
      "A. Mathematics",
      "B. English",
      "C. Both change equally",
      "D. Neither changes"
    ],
    "answer": 0,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/table_scores.svg"
  },
  {
    "id": "pdf_set7_22",
    "quest": "reading",
    "question": "What is the difference in math average between 2564 and 2562?",
    "options": [
      "A. 6.0",
      "B. 7.0",
      "C. 5.0",
      "D. 10.0"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/table_scores.svg"
  },
  {
    "id": "pdf_set7_23",
    "quest": "reading",
    "question": "Which sentence describes the trend in mathematics?",
    "options": [
      "A. The math average dropped from 2563 to 2564.",
      "B. The math average was lowest in 2564.",
      "C. The math average rose sharply in 2564.",
      "D. The math average stayed flat from 2562 to 2563."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/table_scores.svg"
  },
  {
    "id": "pdf_set7_24",
    "quest": "reading",
    "question": "Which question can be answered from the table?",
    "options": [
      "A. How many students took the exams?",
      "B. What was the average English score in 2563?",
      "C. Who scored the highest in math?",
      "D. Which school had the best results?"
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect.",
    "image": "/images/table_scores.svg"
  },
  {
    "id": "pdf_set7_25",
    "quest": "reading",
    "question": "Mary: “I think we should plant more trees in our school.” What does Mary mean?",
    "options": [
      "A. She wants fewer trees.",
      "B. She agrees that trees are unnecessary.",
      "C. She suggests planting more trees.",
      "D. She refuses to plant trees."
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set7_26_v2",
    "quest": "reading",
    "itemVersion": "reading-paraphrase-v2",
    "question": "Tom: “In my opinion, playing outside is better than playing video games.” Which sentence expresses his view?",
    "options": [
      "A. He thinks video games are better.",
      "B. He prefers playing outside to playing video games.",
      "C. He doesn’t like playing at all.",
      "D. He wants to stop playing."
    ],
    "answer": 1,
    "correctFeedback": "Tom says playing outside is better than playing video games. The answer restates his preference without adding a reason about health.",
    "wrongFeedback": "Look for the sentence that restates Tom's preference. The text does not say why he prefers playing outside."
  },
  {
    "id": "pdf_set7_27",
    "quest": "reading",
    "question": "A: “Do you agree with this idea?” B: “Yes, I do. Because it helps our health.” What is B doing?",
    "options": [
      "A. Asking a question",
      "B. Giving a fact",
      "C. Expressing agreement with a reason",
      "D. Disagreeing politely"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set7_28",
    "quest": "reading",
    "question": "The author writes: “I feel that students should have more time for art class.” Which phrase indicates opinion?",
    "options": [
      "A. students should",
      "B. have more time",
      "C. I feel that",
      "D. art class"
    ],
    "answer": 2,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_set7_29",
    "quest": "reading",
    "question": "Jack: “I believe reading books is fun.” If you disagree, what could you say?",
    "options": [
      "A. I believe it too.",
      "B. I don’t think so.",
      "C. Yes, reading is fun.",
      "D. You must read more."
    ],
    "answer": 1,
    "correctFeedback": "Correct!",
    "wrongFeedback": "Incorrect."
  }
].map(restoreSourceMedia);


export const yesNoExtracted = [
  {
    "id": "pdf_2.1_YesNoQuestions_1",
    "quest": "yes_no",
    "question": "You see your friend looking sad. What do you ask?",
    "options": [
      "Are you okay?",
      "Do you want pizza?",
      "What is your name?",
      "Where is the book?"
    ],
    "answer": 0,
    "correctFeedback": "ใช้ถามเมื่อเห็นเพื่อนมีท่าทางเศร้า",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_2",
    "quest": "yes_no",
    "question": "You are at school. Your teacher asks: “Did you do your homework?”",
    "options": [
      "Yes, I did.",
      "I go to school.",
      "My name is Tom.",
      "It is sunny."
    ],
    "answer": 0,
    "correctFeedback": "เป็นคำตอบ Yes/No ที่เหมาะสมกับคำถามในอดีต",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_3",
    "quest": "yes_no",
    "question": "You meet a new friend. What do you ask?",
    "options": [
      "Are you new here?",
      "What color is it?",
      "Where are my shoes?",
      "Let’s go to lunch."
    ],
    "answer": 0,
    "correctFeedback": "ใช้ทักทายเพื่อนใหม่ด้วยคำถาม Yes/No",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_4",
    "quest": "yes_no",
    "question": "You want to play outside. What should you ask your mom?",
    "options": [
      "Can I play outside?",
      "What is your name?",
      "I want to sleep.",
      "Are you tired?"
    ],
    "answer": 0,
    "correctFeedback": "ใช้ขออนุญาตด้วย Can + Subject",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_5",
    "quest": "yes_no",
    "question": "Your friend has a new toy. What can you ask?",
    "options": [
      "Is that your toy?",
      "Do you like school?",
      "Is it raining?",
      "What time is it?"
    ],
    "answer": 0,
    "correctFeedback": "ใช้ถามสิ่งของเป็นของเพื่อนหรือไม่",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_6",
    "quest": "yes_no",
    "question": "Which one is a Yes/No question?",
    "options": [
      "What do you like?",
      "Where do you live?",
      "Do you like ice cream?",
      "How old are you?"
    ],
    "answer": 2,
    "correctFeedback": "เป็น Yes/No Question เพราะตอบได้ว่า Yes หรือ No",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_7",
    "quest": "yes_no",
    "question": "What is the correct answer to: 'Is it raining?'",
    "options": [
      "I like cats.",
      "Yes, it is.",
      "It is a dog.",
      "I am happy."
    ],
    "answer": 1,
    "correctFeedback": "เป็นคำตอบที่ถูกต้องของ Is it raining?",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_8",
    "quest": "yes_no",
    "question": "Which one is NOT a Yes/No question?",
    "options": [
      "Are you hungry?",
      "Can you swim?",
      "What do you want to eat?",
      "Do you like apples?"
    ],
    "answer": 2,
    "correctFeedback": "ไม่ใช่ Yes/No Question เพราะต้องตอบรายละเอียด",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_9",
    "quest": "yes_no",
    "question": "Which is a correct Yes/No question?",
    "options": [
      "He is teacher?",
      "Do you have a book?",
      "You go home?",
      "Eat you food?"
    ],
    "answer": 1,
    "correctFeedback": "เป็นประโยคคำถามที่ถูกหลักไวยากรณ์",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.1_YesNoQuestions_10",
    "quest": "yes_no",
    "question": "How do you answer: 'Can he run fast?'",
    "options": [
      "Yes, I am.",
      "Yes, he can.",
      "No, I do.",
      "He don’t like."
    ],
    "answer": 1,
    "correctFeedback": "เป็นการตอบคำถาม Yes/No ที่ถูกต้องของ Can he run fast?",
    "wrongFeedback": "Incorrect."
  }
];

export const qwExtracted = [
  {
    "id": "pdf_2.2_WhQuestions_1",
    "quest": "question_words",
    "question": "You see this sign at the zoo: 'Do not feed the animals.' What does it mean?",
    "options": [
      "You can feed the animals.",
      "You must bring food.",
      "You are not allowed to feed the animals.",
      "You should play with the animals."
    ],
    "answer": 2,
    "correctFeedback": "ป้ายเตือน 'Do not feed the animals.' แปลว่า ห้ามให้อาหารสัตว์",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_2",
    "quest": "question_words",
    "question": "A student asks: 'Where is the library?' What is the best reply?",
    "options": [
      "I like reading.",
      "It’s next to the office.",
      "Yes, I do.",
      "I have a book."
    ],
    "answer": 1,
    "correctFeedback": "คำถาม 'Where is the library?' ควรตอบด้วยตำแหน่งสถานที่",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_3",
    "quest": "question_words",
    "question": "Your friend asks: 'Why are you sad?' What could you say?",
    "options": [
      "Because I lost my pencil.",
      "I like pizza.",
      "I go to school.",
      "Under the table."
    ],
    "answer": 0,
    "correctFeedback": "ถามว่า 'Why are you sad?' ต้องตอบเหตุผล เช่น Because...",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_4",
    "quest": "question_words",
    "question": "Teacher says: 'When is your birthday?' What will you answer?",
    "options": [
      "It is red.",
      "I am fine.",
      "On December 12th.",
      "Two books."
    ],
    "answer": 2,
    "correctFeedback": "When ถามเวลา ควรตอบเป็นวันที่หรือช่วงเวลา",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_5",
    "quest": "question_words",
    "question": "A sign says: 'What should you do in a fire?' What is the purpose?",
    "options": [
      "To describe a pet",
      "To give directions for safety",
      "To ask about lunch",
      "To tell a joke"
    ],
    "answer": 1,
    "correctFeedback": "ป้ายแบบนี้มักใช้ในสถานการณ์ฉุกเฉินเพื่อให้คำแนะนำ",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_6",
    "quest": "question_words",
    "question": "Which one is a Wh-question?",
    "options": [
      "Are you tired?",
      "Do you like books?",
      "What are you doing?",
      "Can you swim?"
    ],
    "answer": 2,
    "correctFeedback": "Wh-Question จะขึ้นต้นด้วย What, When, Where, Why, Who, How",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_7",
    "quest": "question_words",
    "question": "What is the correct answer to: 'Where do you live?'",
    "options": [
      "I live in Bangkok.",
      "Yes, I do.",
      "No, I don’t.",
      "I am fine."
    ],
    "answer": 0,
    "correctFeedback": "คำถาม Where ต้องตอบด้วยสถานที่",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_8",
    "quest": "question_words",
    "question": "Which question asks about time?",
    "options": [
      "Where is your house?",
      "When is the test?",
      "Why are you happy?",
      "Who is your teacher?"
    ],
    "answer": 1,
    "correctFeedback": "When ใช้ถามเกี่ยวกับเวลา",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_9",
    "quest": "question_words",
    "question": "What does 'Why' ask for?",
    "options": [
      "A place",
      "A reason",
      "A name",
      "A time"
    ],
    "answer": 1,
    "correctFeedback": "Why ใช้ถามเหตุผล",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.2_WhQuestions_10",
    "quest": "question_words",
    "question": "Which is the best answer to: 'How do you go to school?'",
    "options": [
      "At 8 o'clock.",
      "By bus.",
      "In the park.",
      "Because I like it."
    ],
    "answer": 1,
    "correctFeedback": "'How' ถามถึงวิธีการ คำตอบที่เหมาะคือ 'By bus.'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_1",
    "quest": "question_words",
    "question": "You see a sign: 'How do you wash your hands properly?' What does this sign try to do?",
    "options": [
      "Show the time",
      "Tell a story",
      "Give safety advice",
      "Ask for help"
    ],
    "answer": 2,
    "correctFeedback": "ป้ายให้คำแนะนำด้านสุขภาพ การล้างมืออย่างถูกวิธี",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_2",
    "quest": "question_words",
    "question": "Your friend asks: 'How do you get to school every day?' What should you say?",
    "options": [
      "I get up at 6 a.m.",
      "By bus.",
      "In the morning.",
      "With my books."
    ],
    "answer": 1,
    "correctFeedback": "ถามถึงวิธีการไปโรงเรียน ควรตอบว่า 'By bus.'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_3",
    "quest": "question_words",
    "question": "Teacher: 'How do you feel today?' What is the best reply?",
    "options": [
      "I’m in grade 6.",
      "I walk to school.",
      "I feel happy.",
      "I eat rice."
    ],
    "answer": 2,
    "correctFeedback": "ถามว่า 'รู้สึกอย่างไร' คำตอบที่เหมาะคือ 'I feel happy.'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_4",
    "quest": "question_words",
    "question": "A student shows a chart: 'How many students like apples?' What is the question asking?",
    "options": [
      "The kind of fruit",
      "The number of students",
      "The color of apples",
      "The names of students"
    ],
    "answer": 1,
    "correctFeedback": "คำถามถามถึงจำนวนของนักเรียนที่ชอบแอปเปิล",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_5",
    "quest": "question_words",
    "question": "A sign says: 'How can we save water?' What does this mean?",
    "options": [
      "You must use more water",
      "It gives a reason",
      "It asks for ideas to help",
      "It tells a joke"
    ],
    "answer": 2,
    "correctFeedback": "เป็นคำถามเชิงเสนอแนวทางในการประหยัดน้ำ",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_6",
    "quest": "question_words",
    "question": "Which question uses 'How' to ask about quantity?",
    "options": [
      "How old are you?",
      "How do you go to school?",
      "How many books do you have?",
      "How are you?"
    ],
    "answer": 2,
    "correctFeedback": "'How many' ใช้ถามจำนวนที่นับได้ เช่น หนังสือ",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_7",
    "quest": "question_words",
    "question": "What is the correct question for: 'I am ten years old.'?",
    "options": [
      "How old are you?",
      "How are you?",
      "How much is this?",
      "How do you go to school?"
    ],
    "answer": 0,
    "correctFeedback": "'I am ten years old.' คำถามที่ใช้คือ 'How old are you?'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_8",
    "quest": "question_words",
    "question": "What is the answer to: 'How long is the movie?'?",
    "options": [
      "It is two hours.",
      "It is in the cinema.",
      "It is very good.",
      "It is about animals."
    ],
    "answer": 0,
    "correctFeedback": "'How long' ถามถึงระยะเวลา คำตอบคือ 'It is two hours.'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_9",
    "quest": "question_words",
    "question": "Which one is a question about distance?",
    "options": [
      "How much is this?",
      "How far is your school?",
      "How do you feel?",
      "How long is the break?"
    ],
    "answer": 1,
    "correctFeedback": "'How far' ใช้ถามเกี่ยวกับระยะทาง",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.3_How_10",
    "quest": "question_words",
    "question": "What is the question for: 'I feel tired.'?",
    "options": [
      "How are you?",
      "How do you go to school?",
      "How far is it?",
      "How many books do you have?"
    ],
    "answer": 0,
    "correctFeedback": "คำตอบ 'I feel tired.' สอดคล้องกับคำถาม 'How are you?'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_1",
    "quest": "question_words",
    "question": "You see this sign in a school: 'Do you want milk or juice?' What should you do?",
    "options": [
      "Throw the cup",
      "Choose one to drink",
      "Ask for food",
      "Say goodbye"
    ],
    "answer": 1,
    "correctFeedback": "ป้ายถามให้เลือกระหว่างเครื่องดื่มสองชนิด",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_2",
    "quest": "question_words",
    "question": "A friend asks: 'Do you play football or basketball?' What is a good reply?",
    "options": [
      "I eat pizza.",
      "I like red.",
      "I play football.",
      "I go to school."
    ],
    "answer": 2,
    "correctFeedback": "ถามว่าเล่นกีฬาอะไร ควรตอบ 'I play football.'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_3",
    "quest": "question_words",
    "question": "You hear: 'Do you want to read or draw?' What does this mean?",
    "options": [
      "Choose one activity",
      "Sleep",
      "Run fast",
      "Watch TV"
    ],
    "answer": 0,
    "correctFeedback": "เป็นคำถามเลือกกิจกรรม",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_4",
    "quest": "question_words",
    "question": "At a zoo, someone asks: 'Do you like elephants or lions more?' What are they asking?",
    "options": [
      "What zoo it is",
      "What animal you prefer",
      "What you ate",
      "What you bought"
    ],
    "answer": 1,
    "correctFeedback": "เป็นคำถามเกี่ยวกับสัตว์ที่ชอบมากกว่า",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_5",
    "quest": "question_words",
    "question": "You hear: 'Do you want to go by bus or train?' What do you need to decide?",
    "options": [
      "What color you like",
      "What to eat",
      "How to travel",
      "What to wear"
    ],
    "answer": 2,
    "correctFeedback": "เป็นคำถามเกี่ยวกับวิธีเดินทาง",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_6",
    "quest": "question_words",
    "question": "Which sentence is an Or-Question?",
    "options": [
      "What is your name?",
      "Do you like cats or dogs?",
      "Where is your bag?",
      "How old are you?"
    ],
    "answer": 1,
    "correctFeedback": "เป็นคำถามที่มี 'or' และใช้โครงสร้างถูกต้อง",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_7",
    "quest": "question_words",
    "question": "Choose the correct Or-Question:",
    "options": [
      "Do you go home?",
      "You go or stay?",
      "Do you go or stay?",
      "Do go you or stay?"
    ],
    "answer": 2,
    "correctFeedback": "ประโยค C เป็น Or-Question ที่ถูกต้องตามหลักไวยากรณ์",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_8",
    "quest": "question_words",
    "question": "What is the best answer to: 'Do you want apples or bananas?'",
    "options": [
      "I want apples.",
      "I am ten.",
      "I play games.",
      "I run fast."
    ],
    "answer": 0,
    "correctFeedback": "ตอบเลือกอย่างใดอย่างหนึ่งจากคำถาม",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_9",
    "quest": "question_words",
    "question": "What is the question for: 'I want juice.'?",
    "options": [
      "Do you run or jump?",
      "Do you drink tea or coffee?",
      "Do you want milk or juice?",
      "Do you eat rice?"
    ],
    "answer": 2,
    "correctFeedback": "คำถามที่สอดคล้องกับคำตอบคือ 'Do you want milk or juice?'",
    "wrongFeedback": "Incorrect."
  },
  {
    "id": "pdf_2.4_OrQuestions_10",
    "quest": "question_words",
    "question": "Which one is NOT an Or-Question?",
    "options": [
      "Do you like blue or red?",
      "Do you walk or run?",
      "Where do you live?",
      "Do you eat fish or chicken?"
    ],
    "answer": 2,
    "correctFeedback": "'Where do you live?' ไม่มี 'or' ไม่ใช่ Or-Question",
    "wrongFeedback": "Incorrect."
  }
];

export const set1Part2 = [
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_1",
    "quest": "environment",
    "question": "You see this sign: (Recycle symbol). What should you do?",
    "options": [
      "Throw garbage on the ground",
      "Recycle bottles and cans",
      "Burn trash",
      "Ignore it"
    ],
    "answer": 1,
    "correctFeedback": "คือสัญลักษณ์การรีไซเคิล",
    "wrongFeedback": "Incorrect.",
    "keyword": "sign"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_2",
    "quest": "environment",
    "question": "Your friend throws garbage on the ground. What do you say?",
    "options": [
      "Good job!",
      "Let’s recycle it!",
      "Throw more!",
      "I don't care."
    ],
    "answer": 1,
    "correctFeedback": "เป็นประโยคแนะนำให้ช่วยกันแยกขยะอย่างเหมาะสม",
    "wrongFeedback": "Incorrect.",
    "keyword": "garbage"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_3",
    "quest": "environment",
    "question": "You want to save water. What will you say?",
    "options": [
      "Let’s play with water.",
      "Turn off the tap.",
      "Keep it running.",
      "Use more water."
    ],
    "answer": 1,
    "correctFeedback": "การปิดก๊อกน้ำช่วยประหยัดน้ำ",
    "wrongFeedback": "Incorrect.",
    "keyword": "water"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_4",
    "quest": "environment",
    "question": "Someone cuts down many trees. What can you say?",
    "options": [
      "That’s good for nature.",
      "Great job!",
      "Let’s plant more trees instead.",
      "Let’s cut more."
    ],
    "answer": 2,
    "correctFeedback": "การปลูกต้นไม้ช่วยเพิ่มพื้นที่สีเขียว",
    "wrongFeedback": "Incorrect.",
    "keyword": "trees"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_5",
    "quest": "environment",
    "question": "You see trash in the river. What should you say?",
    "options": [
      "It looks nice.",
      "Let’s clean it up.",
      "Let it be.",
      "Jump in it."
    ],
    "answer": 1,
    "correctFeedback": "เป็นการแสดงความรับผิดชอบต่อสิ่งแวดล้อม",
    "wrongFeedback": "Incorrect.",
    "keyword": "trash"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_6",
    "quest": "environment",
    "question": "What does this symbol mean? (Recycle symbol)",
    "options": [
      "Pollution",
      "Burning",
      "Recycle",
      "Trash bin"
    ],
    "answer": 2,
    "correctFeedback": "คือสัญลักษณ์ของการรีไซเคิล",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_7",
    "quest": "environment",
    "question": "Where should you put garbage?",
    "options": [
      "In the forest",
      "On the road",
      "In the river",
      "In the trash bin"
    ],
    "answer": 3,
    "correctFeedback": "ควรทิ้งขยะลงถังขยะ",
    "wrongFeedback": "Incorrect.",
    "keyword": "garbage"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_8",
    "quest": "environment",
    "question": "Which one is good for the environment?",
    "options": [
      "Throwing trash",
      "Recycling",
      "Cutting trees",
      "Burning leaves"
    ],
    "answer": 1,
    "correctFeedback": "การรีไซเคิลช่วยลดขยะและรักษาสิ่งแวดล้อม",
    "wrongFeedback": "Incorrect.",
    "keyword": "environment"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_9",
    "quest": "environment",
    "question": "Why do we plant trees?",
    "options": [
      "To make air dirty",
      "For fun only",
      "To get clean air and shade",
      "To destroy nature"
    ],
    "answer": 2,
    "correctFeedback": "ต้นไม้ช่วยให้อากาศบริสุทธิ์และให้ร่มเงา",
    "wrongFeedback": "Incorrect.",
    "keyword": "trees"
  },
  {
    "id": "pdf_1.4_สิ่งแวดล้อม_10",
    "quest": "environment",
    "question": "What should you not do?",
    "options": [
      "Save water",
      "Recycle",
      "Throw garbage in the river",
      "Plant trees"
    ],
    "answer": 2,
    "correctFeedback": "เป็นสิ่งที่ไม่ควรทำเพราะทำให้แม่น้ำสกปรก",
    "wrongFeedback": "Incorrect.",
    "keyword": "garbage"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_1",
    "quest": "drinks",
    "question": "Your friend is thirsty and asks you, 'What do you want to drink?' What do you say?",
    "options": [
      "I want orange juice.",
      "I go to school.",
      "I like dogs.",
      "I read books."
    ],
    "answer": 0,
    "correctFeedback": "เป็นการตอบคำถามแบบสุภาพเมื่อต้องการเครื่องดื่ม",
    "wrongFeedback": "Incorrect.",
    "keyword": "drink"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_2",
    "quest": "drinks",
    "question": "At a café, the staff asks, 'Hot or cold?' What is the best answer?",
    "options": [
      "Yes, I do.",
      "I want a cold drink.",
      "My name is Ann.",
      "I am ten years old."
    ],
    "answer": 1,
    "correctFeedback": "เป็นคำตอบที่เหมาะสมเมื่อต้องเลือกเครื่องดื่มร้อนหรือเย็น",
    "wrongFeedback": "Incorrect.",
    "keyword": "hot or cold"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_3",
    "quest": "drinks",
    "question": "Your friend says, 'I don’t like sweet drinks.' What do you say?",
    "options": [
      "Try soda!",
      "Have some chocolate milk!",
      "Try lime juice. It’s sour.",
      "Drink orange soda."
    ],
    "answer": 2,
    "correctFeedback": "น้ำมะนาวเปรี้ยว เหมาะกับคนไม่ชอบหวาน",
    "wrongFeedback": "Incorrect.",
    "keyword": "sweet"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_4",
    "quest": "drinks",
    "question": "You want to offer a Thai drink to your guest. What do you say?",
    "translation": "คุณต้องการเสนอเครื่องดื่มไทยให้แขก คุณควรพูดว่าอย่างไร?",
    "options": [
      "Would you like some Thai iced tea?",
      "Where do you live?",
      "What time is it?",
      "Can you draw a cat?"
    ],
    "answer": 0,
    "correctFeedback": "Would you like some Thai iced tea? หมายถึง รับชาไทยเย็นสักหน่อยไหม ใช้เสนอเครื่องดื่มอย่างสุภาพ ส่วน Do you like Thai iced tea? ใช้ถามว่าชอบชาไทยเย็นหรือไม่",
    "wrongFeedback": "Incorrect.",
    "keyword": "Thai drink"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_5",
    "quest": "drinks",
    "question": "Someone says, 'I’m cold.' What drink should you suggest?",
    "options": [
      "Iced soda",
      "Hot chocolate",
      "Cold milk",
      "Orange smoothie"
    ],
    "answer": 1,
    "correctFeedback": "เหมาะสำหรับอากาศหนาวเพราะเป็นเครื่องดื่มร้อน",
    "wrongFeedback": "Incorrect.",
    "keyword": "cold"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_6",
    "quest": "drinks",
    "question": "What drink is orange and sweet?",
    "options": [
      "Coconut juice",
      "Thai iced tea",
      "Lime juice",
      "Water"
    ],
    "answer": 1,
    "correctFeedback": "ชาเย็นไทยมีสีส้มและรสหวาน",
    "wrongFeedback": "Incorrect.",
    "keyword": "orange"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_7",
    "quest": "drinks",
    "question": "Which drink is usually served in a box? (Juice box symbol)",
    "options": [
      "Herbal tea",
      "Juice box",
      "Coffee",
      "Soda"
    ],
    "answer": 1,
    "correctFeedback": "กล่องน้ำผลไม้คือ Juice box",
    "wrongFeedback": "Incorrect.",
    "keyword": "box"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_8",
    "quest": "drinks",
    "question": "What is a red herbal drink?",
    "options": [
      "Coconut juice",
      "Roselle juice",
      "Milk",
      "Hot chocolate"
    ],
    "answer": 1,
    "correctFeedback": "น้ำกระเจี๊ยบเป็นเครื่องดื่มสมุนไพรสีแดง",
    "wrongFeedback": "Incorrect.",
    "keyword": "red"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_9",
    "quest": "drinks",
    "question": "What drink is good for your bones?",
    "options": [
      "Soda",
      "Milk",
      "Tea",
      "Smoothie"
    ],
    "answer": 1,
    "correctFeedback": "นมมีแคลเซียมช่วยบำรุงกระดูก",
    "wrongFeedback": "Incorrect.",
    "keyword": "bones"
  },
  {
    "id": "pdf_1.6_เครื่องดื่ม_10",
    "quest": "drinks",
    "question": "What does this symbol mean? (Hot drink)",
    "options": [
      "Ice",
      "Cold drink",
      "Hot drink",
      "No drinking"
    ],
    "answer": 2,
    "correctFeedback": "เป็นสัญลักษณ์ของเครื่องดื่มร้อน",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_1",
    "quest": "free_time_recreation",
    "question": "Your friend asks, 'What do you do in your free time?' What do you answer?",
    "options": [
      "I eat breakfast.",
      "I read books.",
      "I go to school.",
      "I wash dishes."
    ],
    "answer": 1,
    "correctFeedback": "เป็นคำตอบที่เหมาะสมสำหรับคำถามเกี่ยวกับเวลาว่าง",
    "wrongFeedback": "Incorrect.",
    "keyword": "free time"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_2",
    "quest": "free_time_recreation",
    "question": "You want to invite a friend to play football. What do you say?",
    "options": [
      "Let’s play football together!",
      "Do you like fish?",
      "I go to bed now.",
      "Let’s do homework."
    ],
    "answer": 0,
    "correctFeedback": "เป็นประโยคชวนเพื่อนเล่นฟุตบอล",
    "wrongFeedback": "Incorrect.",
    "keyword": "football"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_3",
    "quest": "free_time_recreation",
    "question": "Your friend says, 'I like drawing.' What do you say?",
    "options": [
      "Me too! I draw pictures every day.",
      "I don't like water.",
      "Let’s watch TV.",
      "Do you like pizza?"
    ],
    "answer": 0,
    "correctFeedback": "แสดงความเห็นตรงกันเกี่ยวกับกิจกรรมวาดภาพ",
    "wrongFeedback": "Incorrect.",
    "keyword": "drawing"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_4",
    "quest": "free_time_recreation",
    "question": "You see someone listening to music. What should you say?",
    "options": [
      "What are you eating?",
      "That music sounds fun!",
      "Let’s do math.",
      "Can I help you clean?"
    ],
    "answer": 1,
    "correctFeedback": "ตอบสนองต่อคนที่กำลังฟังเพลงได้อย่างเหมาะสม",
    "wrongFeedback": "Incorrect.",
    "keyword": "music"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_5",
    "quest": "free_time_recreation",
    "question": "You want to ask about someone’s hobby. What do you say?",
    "options": [
      "What is your hobby?",
      "Where are you going?",
      "What is your name?",
      "What do you eat?"
    ],
    "answer": 0,
    "correctFeedback": "เป็นคำถามที่ใช้สอบถามงานอดิเรก",
    "wrongFeedback": "Incorrect.",
    "keyword": "hobby"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_6",
    "quest": "free_time_recreation",
    "question": "What activity uses this symbol (Game controller)?",
    "options": [
      "Reading",
      "Drawing",
      "Playing games",
      "Sleeping"
    ],
    "answer": 2,
    "correctFeedback": "เป็นสัญลักษณ์ของการเล่นเกม",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_7",
    "quest": "free_time_recreation",
    "question": "What does (Palette) mean?",
    "options": [
      "Listening to music",
      "Drawing",
      "Watching TV",
      "Playing football"
    ],
    "answer": 1,
    "correctFeedback": "หมายถึงศิลปะหรือการวาดภาพ",
    "wrongFeedback": "Incorrect.",
    "keyword": "palette"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_8",
    "quest": "free_time_recreation",
    "question": "What do you usually do at the park?",
    "options": [
      "Ride a bike",
      "Sleep",
      "Read a book",
      "Watch TV"
    ],
    "answer": 0,
    "correctFeedback": "สวนสาธารณะมักเป็นที่ปั่นจักรยาน",
    "wrongFeedback": "Incorrect.",
    "keyword": "park"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_9",
    "quest": "free_time_recreation",
    "question": "What is a good activity for relaxing?",
    "options": [
      "Fighting",
      "Painting",
      "Running fast",
      "Studying math"
    ],
    "answer": 1,
    "correctFeedback": "การวาดภาพเป็นกิจกรรมผ่อนคลาย",
    "wrongFeedback": "Incorrect.",
    "keyword": "relaxing"
  },
  {
    "id": "pdf_1.7_เวลาว่างและนันทนาการ_10",
    "quest": "free_time_recreation",
    "question": "What can you do in the water?",
    "options": [
      "Draw pictures",
      "Watch TV",
      "Swim",
      "Listen to music"
    ],
    "answer": 2,
    "correctFeedback": "กิจกรรมที่ทำในน้ำคือการว่ายน้ำ",
    "wrongFeedback": "Incorrect.",
    "keyword": "water"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_1",
    "quest": "buying_selling",
    "question": "You want to buy a toy. What do you say?",
    "options": [
      "I want to buy this toy.",
      "I want to sleep now.",
      "I like blue.",
      "Let’s go swimming."
    ],
    "answer": 0,
    "correctFeedback": "แสดงความต้องการซื้อของอย่างชัดเจน",
    "wrongFeedback": "Incorrect.",
    "keyword": "buy"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_2",
    "quest": "buying_selling",
    "question": "The seller says, 'It costs 20 baht.' What do you answer?",
    "options": [
      "Thank you. Here is the money.",
      "I go to school.",
      "I don’t like apples.",
      "Let’s go home."
    ],
    "answer": 0,
    "correctFeedback": "ตอบกลับอย่างเหมาะสมเมื่อทราบราคา",
    "wrongFeedback": "Incorrect.",
    "keyword": "baht"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_3",
    "quest": "buying_selling",
    "question": "You get change after paying. What do you say?",
    "options": [
      "Give me more.",
      "Thank you!",
      "I want to play.",
      "That is expensive."
    ],
    "answer": 1,
    "correctFeedback": "เป็นมารยาทดีเมื่อได้รับเงินทอน",
    "wrongFeedback": "Incorrect.",
    "keyword": "change"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_4",
    "quest": "buying_selling",
    "question": "You want to know the price. What do you ask?",
    "options": [
      "Where are you going?",
      "What is your name?",
      "How much is it?",
      "Do you like pizza?"
    ],
    "answer": 2,
    "correctFeedback": "เป็นคำถามที่ใช้สอบถามราคาสินค้า",
    "wrongFeedback": "Incorrect.",
    "keyword": "price"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_5",
    "quest": "buying_selling",
    "question": "A shopkeeper shows a red shirt. What do you say?",
    "options": [
      "Do you have it in blue?",
      "I want rice.",
      "I like dogs.",
      "I am sleepy."
    ],
    "answer": 0,
    "correctFeedback": "แสดงการสอบถามทางเลือกของสินค้า",
    "wrongFeedback": "Incorrect.",
    "keyword": "red shirt"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_6",
    "quest": "buying_selling",
    "question": "What does this symbol mean? (Shopping cart)",
    "options": [
      "School",
      "Shopping cart",
      "Playground",
      "Discount"
    ],
    "answer": 1,
    "correctFeedback": "หมายถึงรถเข็นในซูเปอร์มาร์เก็ต",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_7",
    "quest": "buying_selling",
    "question": "What do you get after you pay?",
    "options": [
      "Water",
      "Bag",
      "Change",
      "Book"
    ],
    "answer": 2,
    "correctFeedback": "หลังจากจ่ายเงินจะได้รับเงินทอน",
    "wrongFeedback": "Incorrect.",
    "keyword": "pay"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_8",
    "quest": "buying_selling",
    "question": "What does (Credit card) mean?",
    "options": [
      "Money",
      "Credit card",
      "Receipt",
      "Food"
    ],
    "answer": 1,
    "correctFeedback": "หมายถึงบัตรเครดิต",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_9",
    "quest": "buying_selling",
    "question": "What is the person who sells things called?",
    "options": [
      "Teacher",
      "Doctor",
      "Seller",
      "Driver"
    ],
    "answer": 2,
    "correctFeedback": "คนขายของเรียกว่า seller",
    "wrongFeedback": "Incorrect.",
    "keyword": "sells"
  },
  {
    "id": "pdf_1.9_การซื้อ-ขาย_10",
    "quest": "buying_selling",
    "question": "If something is cheap, it means:",
    "options": [
      "The price is low",
      "The price is high",
      "It is broken",
      "It is new"
    ],
    "answer": 0,
    "correctFeedback": "cheap หมายถึงราคาถูก",
    "wrongFeedback": "Incorrect.",
    "keyword": "cheap"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_1",
    "quest": "weather",
    "question": "You see someone carrying an umbrella. What do you say?",
    "options": [
      "Is it raining?",
      "Do you want to play?",
      "Are you hungry?",
      "Let’s go shopping."
    ],
    "answer": 0,
    "correctFeedback": "เป็นคำถามที่เหมาะเมื่อเห็นคนถือร่ม",
    "wrongFeedback": "Incorrect.",
    "keyword": "umbrella"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_2",
    "quest": "weather",
    "question": "Your friend says, 'It’s hot today.' What do you answer?",
    "options": [
      "Yes, I wear my jacket.",
      "Yes, I drink cold water.",
      "Yes, I eat noodles.",
      "Yes, I go to school."
    ],
    "answer": 1,
    "correctFeedback": "เป็นการตอบสนองต่ออากาศร้อนอย่างเหมาะสม",
    "wrongFeedback": "Incorrect.",
    "keyword": "hot"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_3",
    "quest": "weather",
    "question": "You are going outside and it’s raining. What do you do?",
    "options": [
      "Take an umbrella.",
      "Take sunglasses.",
      "Take a fan.",
      "Take a book."
    ],
    "answer": 0,
    "correctFeedback": "ร่มเหมาะกับสภาพอากาศฝนตก",
    "wrongFeedback": "Incorrect.",
    "keyword": "raining"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_4",
    "quest": "weather",
    "question": "Your friend asks, 'What’s the weather like?' What do you say?",
    "options": [
      "I go to school.",
      "It is sunny.",
      "I like cats.",
      "I am hungry."
    ],
    "answer": 1,
    "correctFeedback": "เป็นคำตอบที่ถูกต้องเมื่อถูกถามเกี่ยวกับอากาศ",
    "wrongFeedback": "Incorrect.",
    "keyword": "weather"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_5",
    "quest": "weather",
    "question": "You want to know today’s weather. What do you ask?",
    "options": [
      "What is your name?",
      "How old are you?",
      "What’s the weather like today?",
      "Do you like pizza?"
    ],
    "answer": 2,
    "correctFeedback": "เป็นคำถามที่ใช้ถามสภาพอากาศ",
    "wrongFeedback": "Incorrect.",
    "keyword": "weather"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_6",
    "quest": "weather",
    "question": "What does this symbol mean? (Sun)",
    "options": [
      "Rainy",
      "Sunny",
      "Cloudy",
      "Snowy"
    ],
    "answer": 1,
    "correctFeedback": "คือสัญลักษณ์ของแดดจัด",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_7",
    "quest": "weather",
    "question": "What do you wear when the weather is cold?",
    "options": [
      "T-shirt",
      "Jacket",
      "Cap",
      "Shorts"
    ],
    "answer": 1,
    "correctFeedback": "ใส่เสื้อแจ็คเก็ตเมื่ออากาศหนาว",
    "wrongFeedback": "Incorrect.",
    "keyword": "cold"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_8",
    "quest": "weather",
    "question": "What does this symbol mean? (Rainy cloud)",
    "options": [
      "Snowy",
      "Sunny",
      "Rainy",
      "Windy"
    ],
    "answer": 2,
    "correctFeedback": "แปลว่าฝนตก",
    "wrongFeedback": "Incorrect.",
    "keyword": "symbol"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_9",
    "quest": "weather",
    "question": "What is the word for white, frozen rain?",
    "options": [
      "Rain",
      "Snow",
      "Cloud",
      "Wind"
    ],
    "answer": 1,
    "correctFeedback": "หิมะคือฝนแช่แข็งที่ตกลงมา",
    "wrongFeedback": "Incorrect.",
    "keyword": "frozen"
  },
  {
    "id": "pdf_1.10_ลมฟ้าอากาศ_10",
    "quest": "weather",
    "question": "If it is windy, what moves?",
    "options": [
      "Books",
      "Water",
      "Air",
      "Food"
    ],
    "answer": 2,
    "correctFeedback": "ลมคือการเคลื่อนที่ของอากาศ",
    "wrongFeedback": "Incorrect.",
    "keyword": "windy"
  }
];

export const QUESTS = [


  { id: 'about_myself', chapter: 1, name: 'About Myself', description: 'ข้อมูลส่วนตัว ความชอบ และการแนะนำตนเอง', icon: '🙋‍♂️', color: 'from-sky-500 to-indigo-500', questions: preserveQuestionIds(aboutMyselfQuestions, EXPANDED_ONET_ASSESSMENTS.about_myself) },
  { id: 'family', chapter: 1, name: 'Family & Home', description: 'ครอบครัว เครือญาติ และชีวิตในบ้าน', icon: '👨‍👩‍👧‍👦', color: 'from-amber-500 to-orange-500', questions: preserveQuestionIds(familyQuestions, EXPANDED_ONET_ASSESSMENTS.family) },
  { id: 'school', chapter: 1, name: 'School & Classroom', description: 'โรงเรียน ห้องเรียน และอุปกรณ์การเรียน', icon: '🏫', color: 'from-emerald-500 to-teal-500', questions: [
    ...preserveQuestionIds([...schoolQuestions, ...set1Part2], EXPANDED_ONET_ASSESSMENTS.school),
    set1Part2.find(question => question.id === 'pdf_1.6_เครื่องดื่ม_4'),
  ].filter(Boolean) },

  // ── Chapter 1: The Foundation (Basic Vocab & Grammar) ──
  { id: 'vocabulary', chapter: 1, name: 'Vocab Village', description: 'คำศัพท์รอบตัว ยานพาหนะ สถานที่', icon: '📚', color: 'from-blue-600 to-cyan-500', questions: vocabularyQuestions },
  { id: 'numbers', chapter: 1, name: 'Number Arena', description: 'ตัวเลข ราคา และการบอกเวลา', icon: '🔢', color: 'from-violet-600 to-purple-500', questions: EXPANDED_ONET_ASSESSMENTS.numbers },
  { id: 'weather_seasons', chapter: 1, name: 'Weather & Seasons', description: 'สภาพอากาศและฤดูกาล', icon: '🌤️', color: 'from-yellow-500 to-amber-400', questions: weatherQuestions_2 },
  { id: 'food', chapter: 1, name: 'Food Festival', description: 'อาหารและการสั่งอาหาร', icon: '🍜', color: 'from-red-600 to-orange-500', questions: preserveQuestionIds(foodQuestions, O_NET_QUEST_UPGRADES.food) },
  { id: 'illness', chapter: 1, name: 'Health Clinic', description: 'คำศัพท์การเจ็บป่วยและสุขภาพ', icon: '🏥', color: 'from-teal-600 to-cyan-500', questions: preserveQuestionIds(illnessQuestions, O_NET_QUEST_UPGRADES.illness) },
  { id: 'shapes_colors', chapter: 1, name: 'Shapes & Colors', description: 'รูปทรงและสีสัน', icon: '🎨', color: 'from-purple-600 to-indigo-500', questions: ch5QuizQuestions('shapes_colors') },
  { id: 'grammar', chapter: 1, name: 'O-NET Blueprint Boss', description: 'ข้อสอบจำลอง O-NET 32 ข้อตาม Test Blueprint', icon: '⚡', color: 'from-pink-600 to-rose-500', questions: finalBossQuestions, isExam: true },

  // ── Chapter 2: Social Interactions ──
  { id: 'conversation', chapter: 2, name: 'Conversation Café', description: 'บทสนทนาทักทาย ขอบคุณ ขอโทษ', icon: '💬', color: 'from-purple-600 to-violet-500', questions: balanceDraftQuestionOptions(uniqueQuestions([...conversationQuestions, ...set3Questions])), unlockCondition: ['Chapter1'] },
  { id: 'conversation_rescue', chapter: 2, name: 'Conversation Rescue', description: 'มารยาทสังคมและการขอความช่วยเหลือ', icon: '🤝', color: 'from-pink-600 to-rose-700', questions: balanceDraftQuestionOptions(conversationRescueQuestions), unlockCondition: ['Chapter1'] },
  { id: 'emotions_feelings', chapter: 2, name: 'Emotions & Feelings', description: 'อารมณ์และความรู้สึก', icon: '😊', color: 'from-emerald-500 to-teal-400', questions: balanceDraftQuestionOptions(emotionsQuestions_2), unlockCondition: ['Chapter1'] },
  { id: 'jobs', chapter: 2, name: 'Career World', description: 'อาชีพและการทำงาน', icon: '👷', color: 'from-orange-600 to-amber-500', questions: EXPANDED_ONET_ASSESSMENTS.jobs, unlockCondition: ['Chapter1'] },
  { id: 'market', chapter: 2, name: 'Market Quest', description: 'การซื้อขายในตลาด', icon: '🛒', color: 'from-yellow-500 to-amber-400', questions: preserveQuestionIds(marketQuestions, O_NET_QUEST_UPGRADES.market), unlockCondition: ['Chapter1'] },
  { id: 'chapter2_boss', chapter: 2, name: 'Social Challenge', description: 'ข้อสอบ O-NET และโจทย์คละทักษะ', icon: '⚔️', color: 'from-rose-600 to-orange-500', questions: OFFICIAL_ONET_BOSS_QUESTIONS.chapter2_boss, supplementalBossQuestions: BOSS_ACTIVITY_QUESTIONS.chapter2_boss, assessmentCount: 10, requiredAssessmentFocus: BOSS_ACTIVITY_FOCUS, isExam: true, unlockCondition: ['Chapter1'] },

  // ── Chapter 3: The Interrogation Room (Question Mastery) ──
  { id: 'question_words', chapter: 3, name: 'Question Word Gate', description: 'ฝึกวิเคราะห์คำถาม Wh-Questions', icon: '🕵️', color: 'from-purple-700 to-indigo-800', questions: questionWordQuestions, unlockCondition: ['Chapter2'] },
  { id: 'pronouns_master', chapter: 3, name: 'Pronoun World', description: 'วิเคราะห์สรรพนามในคำถาม', icon: '👥', color: 'from-fuchsia-600 to-pink-500', questions: EXPANDED_ONET_ASSESSMENTS.pronouns_master, unlockCondition: ['Chapter2'] },
  { id: 'tenses_arena', chapter: 3, name: 'Tense Mastery', description: 'จับผิด Tense ในประโยคคำถาม', icon: '⏳', color: 'from-yellow-600 to-orange-500', questions: ch5QuizQuestions('tenses_arena'), unlockCondition: ['Chapter2'] },
  { id: 'strategy_boss', chapter: 3, name: 'The Question Sphinx', description: 'ข้อสอบ O-NET และโจทย์คละทักษะ', icon: '👑', color: 'from-red-700 to-rose-900', questions: OFFICIAL_ONET_BOSS_QUESTIONS.strategy_boss, supplementalBossQuestions: BOSS_ACTIVITY_QUESTIONS.strategy_boss, assessmentCount: 10, requiredAssessmentFocus: BOSS_ACTIVITY_FOCUS, isExam: true, unlockCondition: ['Chapter2'] },

  // ── Chapter 4: Data Detective (Reading & Interpretation) ──
  { id: 'signs', chapter: 4, name: 'Signs City', description: 'อ่านป้ายและสัญลักษณ์', icon: '🚦', color: 'from-red-600 to-orange-500', questions: preserveQuestionIds(signsQuestions, O_NET_QUEST_UPGRADES.signs), unlockCondition: ['Chapter3'] },
  { id: 'sign_detective', chapter: 4, name: 'Sign Detective', description: 'วิเคราะห์ป้ายแบบลึก', icon: '🔍', color: 'from-slate-700 to-gray-900', questions: signDetectiveQuestions, unlockCondition: ['Chapter3'] },
  { id: 'directions', chapter: 4, name: 'Direction Maze', description: 'คำบอกทิศทางและแผนที่', icon: '🧭', color: 'from-green-600 to-emerald-500', questions: preserveQuestionIds(directionsQuestions, O_NET_QUEST_UPGRADES.directions), unlockCondition: ['Chapter3'] },
  { id: 'prepositions_hub', chapter: 4, name: 'Preposition Portal', description: 'ตำแหน่งและสถานที่', icon: '📍', color: 'from-emerald-600 to-teal-500', questions: EXPANDED_ONET_ASSESSMENTS.prepositions_hub, unlockCondition: ['Chapter3'] },
  { id: 'map_escape', chapter: 4, name: 'Map Escape', description: 'วิเคราะห์แผนผังและทิศทาง', icon: '🗺️', color: 'from-emerald-700 to-teal-900', questions: mapEscapeQuestions, unlockCondition: ['Chapter3'] },
  { id: 'reading', chapter: 4, name: 'Reading Dungeon', description: 'การอ่านจับใจความ', icon: '📖', color: 'from-indigo-600 to-blue-700', questions: uniqueQuestions([...readingQuestions, ...set7Questions]), unlockCondition: ['Chapter3'] },
  { id: 'reading_detective', chapter: 4, name: 'Reading Detective', description: 'หา keyword จาก passage', icon: '🕵️‍♂️', color: 'from-amber-700 to-orange-900', questions: readingDetectiveQuestions, unlockCondition: ['Chapter3'] },
  { id: 'finalboss', chapter: 4, name: 'The Logic Dragon', description: 'ข้อสอบ O-NET และโจทย์คละทักษะ', icon: '🐉', color: 'from-amber-500 to-yellow-400', questions: OFFICIAL_ONET_BOSS_QUESTIONS.finalboss, supplementalBossQuestions: BOSS_ACTIVITY_QUESTIONS.finalboss, assessmentCount: 10, requiredAssessmentFocus: BOSS_ACTIVITY_FOCUS, isExam: true, unlockCondition: ['Chapter3'] },

  // ── Chapter 5: Expansion / Extra Quests ──
  { id: 'nouns_quantifiers', chapter: 5, name: 'Countable & Quantifiers', description: 'คำนามและปริมาณ', icon: '🥛', color: 'from-cyan-600 to-blue-500', questions: EXPANDED_ONET_ASSESSMENTS.nouns_quantifiers },
  { id: 'adjectives_comp', chapter: 5, name: 'Adjective & Comparison', description: 'การเปรียบเทียบ', icon: '📏', color: 'from-amber-600 to-yellow-500', questions: EXPANDED_ONET_ASSESSMENTS.adjectives_comp },
  { id: 'clothes_fashion', chapter: 5, name: 'Clothes & Fashion', description: 'เครื่องแต่งกาย', icon: '👕', color: 'from-pink-600 to-rose-500', questions: ch5QuizQuestions('clothes_fashion') },
  { id: 'world_countries', chapter: 5, name: 'Countries & Nationalities', description: 'ประเทศและสัญชาติ', icon: '🇹🇭', color: 'from-red-600 to-rose-500', questions: EXPANDED_ONET_ASSESSMENTS.world_countries },
  { id: 'nature_environment', chapter: 5, name: 'Eco & Environment', description: 'สิ่งแวดล้อม', icon: '🌿', color: 'from-green-600 to-emerald-500', questions: EXPANDED_ONET_ASSESSMENTS.nature_environment },
  { id: 'school_subjects', chapter: 5, name: 'School Subjects', description: 'วิชาเรียน', icon: '📚', color: 'from-blue-600 to-cyan-500', questions: EXPANDED_ONET_ASSESSMENTS.school_subjects },
  { id: 'culture_festivals', chapter: 5, name: 'Festivals & Culture', description: 'เทศกาล วันสำคัญ และวัฒนธรรม', icon: '🎉', color: 'from-pink-600 to-amber-500', questions: cultureQuestions },
  { id: 'chapter5_boss', chapter: 5, name: 'Knowledge Challenge', description: 'ข้อสอบ O-NET จริงแบบบูรณาการ', icon: '⚔️', color: 'from-violet-600 to-pink-500', questions: OFFICIAL_ONET_BOSS_QUESTIONS.chapter5_boss, isExam: true },
];

export const preTestQuestions = [
  ...vocabularyQuestions.slice(0, 3),
  ...signsQuestions.slice(0, 3),
  ...directionsQuestions.slice(0, 3),
  ...marketQuestions.slice(0, 3),
  ...conversationQuestions.slice(0, 3),
  ...readingQuestions.slice(0, 3).map(question => ({
    ...question,
    itemVersion: 'pretest-reading-v1',
    mediaReview: { status: 'verified', version: 'pretest-reading-v1', reviewer: 'Codex', date: '2026-10-13', scope: 'legacy_pretest_rendering', note: 'Existing inline Lisa passage checked for completeness and answer consistency; no official-source or human content approval implied.' },
  })),
  ...grammarQuestions.slice(0, 2),
];
