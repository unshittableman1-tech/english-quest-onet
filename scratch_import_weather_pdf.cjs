const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/questions.js');
let content = fs.readFileSync(filePath, 'utf8');

const newWeatherQuestions = `export const weatherQuestions = [
  { id: 'w_pdf_01', quest: 'weather_seasons', question: "You are in Canada in December. The weather is cold and snowy. What should you wear?", options: ["T-shirt and shorts", "Coat, scarf, and gloves", "Swimsuit", "Sandals"], answer: 1, correctFeedback: "ถูกต้อง! อากาศหนาว (cold and snowy) ต้องใส่เสื้อโค้ท ผ้าพันคอ และถุงมือ", wrongFeedback: "cold and snowy = หนาวและมีหิมะ ต้องใส่ Coat, scarf, gloves", keyword: "cold and snowy = หนาวมีหิมะ" },
  { id: 'w_pdf_02', quest: 'weather_seasons', question: "In autumn in the USA, the leaves on trees usually…", options: ["fall and change color", "grow new flowers", "become green", "stay the same"], answer: 0, correctFeedback: "ถูกต้อง! ฤดูใบไม้ร่วง ใบไม้จะเปลี่ยนสีและร่วงหล่น", wrongFeedback: "autumn = ฤดูใบไม้ร่วง (leaves fall and change color)", keyword: "autumn = ฤดูใบไม้ร่วง" },
  { id: 'w_pdf_03', quest: 'weather_seasons', question: "It is very hot in July in Spain. What activity is the most suitable?", options: ["Skiing in the mountains", "Going to the beach", "Making a snowman", "Planting rice"], answer: 1, correctFeedback: "ถูกต้อง! อากาศร้อน (very hot) เหมาะกับการไปชายหาด", wrongFeedback: "very hot = ร้อนมาก เหมาะกับ Going to the beach", keyword: "very hot = ร้อนมาก" },
  { id: 'w_pdf_04', quest: 'weather_seasons', question: "In winter, many families in Europe decorate their houses with lights. What festival is this?", options: ["Halloween", "Easter", "Christmas", "Thanksgiving"], answer: 2, correctFeedback: "ถูกต้อง! คริสต์มาสอยู่ในฤดูหนาวและมีการประดับไฟ", wrongFeedback: "winter = ฤดูหนาว เทศกาลในฤดูหนาวคือ Christmas", keyword: "winter = ฤดูหนาว" },
  { id: 'w_pdf_05', quest: 'weather_seasons', question: "In spring, the weather is usually…", options: ["very hot", "very cold and snowy", "cool and flowers bloom", "dry and dusty"], answer: 2, correctFeedback: "ถูกต้อง! ฤดูใบไม้ผลิ อากาศจะเย็นสบายและดอกไม้บาน", wrongFeedback: "spring = ฤดูใบไม้ผลิ (cool and flowers bloom)", keyword: "spring = ฤดูใบไม้ผลิ" },
  { id: 'w_pdf_06', quest: 'weather_seasons', question: "Which season is after summer in the UK?", options: ["Winter", "Spring", "Autumn", "Summer again"], answer: 2, correctFeedback: "ถูกต้อง! หลังฤดูร้อนคือฤดูใบไม้ร่วง (Autumn)", wrongFeedback: "หลังจาก summer คือ autumn (ใบไม้ร่วง)", keyword: "after summer = หลังฤดูร้อน" },
  { id: 'w_pdf_07', quest: 'weather_seasons', question: "Tom is planning a picnic in England. He checks the weather forecast: 'It will rain tomorrow.' What should he do?", options: ["Bring sunglasses", "Take an umbrella", "Wear sandals", "Go swimming"], answer: 1, correctFeedback: "ถูกต้อง! ถ้ารู้ว่าฝนจะตก (rain) ก็ต้องพกร่ม (umbrella)", wrongFeedback: "rain = ฝนตก ต้องใช้ umbrella (ร่ม)", keyword: "rain = ฝนตก" },
  { id: 'w_pdf_08', quest: 'weather_seasons', question: "In the USA, many people eat turkey and celebrate with family in November. What season is this?", options: ["Winter", "Autumn", "Spring", "Summer"], answer: 1, correctFeedback: "ถูกต้อง! เดือนพฤศจิกายนในอเมริกาอยู่ในช่วงฤดูใบไม้ร่วง (Autumn)", wrongFeedback: "พฤศจิกายน (November) คือ Autumn", keyword: "November = พฤศจิกายน (Autumn)" },
  { id: 'w_pdf_09', quest: 'weather_seasons', question: "Which of the following sentences is correct?", options: ["In summer, people wear coats and boots.", "In winter, people go skiing.", "In spring, it always snows.", "In autumn, people swim in the sea."], answer: 1, correctFeedback: "ถูกต้อง! ในฤดูหนาว ผู้คนจะไปเล่นสกี", wrongFeedback: "In winter, people go skiing. (ฤดูหนาวไปเล่นสกี)", keyword: "winter = ฤดูหนาว, skiing = เล่นสกี" },
  { id: 'w_pdf_10', quest: 'weather_seasons', question: "You are in Australia in January. What is the weather usually like?", options: ["Cold and snowy", "Hot and sunny", "Rainy and stormy", "Foggy and freezing"], answer: 1, correctFeedback: "ถูกต้อง! ออสเตรเลียอยู่ซีกโลกใต้ เดือนมกราคมคือฤดูร้อน", wrongFeedback: "ออสเตรเลียในเดือนมกราคมคือฤดูร้อน (Hot and sunny)", keyword: "Australia in January = ออสเตรเลียเดือนมกราคม (ฤดูร้อน)" },
];

`;

// Find a good place to insert weatherQuestions, e.g., right before QUESTS array export
content = content.replace(
  /export const QUESTS = \[/,
  newWeatherQuestions + 'export const QUESTS = ['
);

// Replace ch5QuizQuestions('weather_seasons') with weatherQuestions
content = content.replace(
  /questions: ch5QuizQuestions\('weather_seasons'\)/g,
  "questions: weatherQuestions"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added weather PDF questions to questions.js.');
