const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/questions.js');
let content = fs.readFileSync(filePath, 'utf8');

const newFoodQuestions = `
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
`;

// Insert into foodQuestions
content = content.replace(
  /export const foodQuestions = \[/,
  'export const foodQuestions = [\n' + newFoodQuestions
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added PDF questions to foodQuestions.');
