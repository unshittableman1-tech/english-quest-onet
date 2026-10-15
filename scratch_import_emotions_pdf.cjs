const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/questions.js');
let content = fs.readFileSync(filePath, 'utf8');

const newEmotionsQuestions = `export const emotionsQuestions = [
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

`;

// Insert array definition
content = content.replace(
  /export const QUESTS = \[/,
  newEmotionsQuestions + 'export const QUESTS = ['
);

// Replace placeholder with new array
content = content.replace(
  /questions: ch5QuizQuestions\('emotions_feelings'\)/g,
  "questions: emotionsQuestions"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added emotions PDF questions to questions.js.');
