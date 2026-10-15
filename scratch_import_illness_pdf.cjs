const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/questions.js');
let content = fs.readFileSync(filePath, 'utf8');

const newIllnessQuestions = `
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
`;

// Insert into illnessQuestions
content = content.replace(
  /export const illnessQuestions = \[/,
  'export const illnessQuestions = [\n' + newIllnessQuestions
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added illness PDF questions to questions.js.');
