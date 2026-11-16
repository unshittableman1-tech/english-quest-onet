// Authored practice items for Grade 6 O-NET preparation. These are original
// questions based on the existing lesson objectives, not copied exam items.
const item = (quest, index, question, options, answer, explanation, extra = {}) => ({
  id: `${quest}_onet_${String(index).padStart(2, '0')}`,
  quest,
  question,
  options,
  answer,
  correctFeedback: explanation,
  wrongFeedback: explanation,
  keyword: explanation,
  itemVersion: 'onet-context-v1',
  intendedMode: 'practice_assessment',
  difficulty: index <= 3 ? 'foundational' : 'application',
  ...extra,
});

export const onetSignsQuestions = [
  item('signs', 1, 'You see this sign near a school gate. What should a driver do?', ['Drive faster', 'Slow down and watch for children', 'Park in front of the gate', 'Sound the horn'], 1, 'School Zone เตือนให้ลดความเร็วและระวังเด็ก', { image: '/learning/signs/school-zone-v3.png', imageAlt: 'ป้าย School Zone มีภาพเด็กกำลังข้ามถนน' }),
  item('signs', 2, 'Mali sees this sign on a museum wall. What must she do?', ['Take photos quietly', 'Turn off the lights', 'Not take photographs', 'Leave her bag outside'], 2, 'ป้าย No Photography หมายถึงห้ามถ่ายภาพ', { image: '/learning/signs/no-photography-v3.png', imageAlt: 'ป้ายห้ามถ่ายภาพ รูปกล้องมีเส้นทับ' }),
  item('signs', 3, 'The floor has just been cleaned. Which sign should be placed there?', ['Wet Floor', 'No Parking', 'Fire Exit', 'School Zone'], 0, 'พื้นเพิ่งทำความสะอาดอาจลื่น จึงควรใช้ป้าย Wet Floor'),
  item('signs', 4, 'A sign says “LIBRARY: SILENCE PLEASE.” What should students do?', ['Speak softly', 'Eat snacks', 'Run between shelves', 'Play music'], 0, 'Silence Please ขอให้ผู้ใช้สถานที่เงียบหรือพูดเบา ๆ'),
  item('signs', 5, 'During a fire drill, which sign shows the safest way out of the building?', ['No Entry', 'Fire Exit', 'No Parking', 'No Pets'], 1, 'Fire Exit ระบุทางออกที่ใช้หนีไฟหรือออกในเหตุฉุกเฉิน', { image: '/learning/signs/fire-exit-v3.png', imageAlt: 'ป้าย Fire Exit แสดงคนวิ่งไปยังทางออก' }),
  item('signs', 6, 'The notice says: “POOL CLOSED FROM 1–3 P.M.” When can Ben swim?', ['At 1:30 p.m.', 'At 2:00 p.m.', 'At 2:45 p.m.', 'At 3:30 p.m.'], 3, 'สระปิดตั้งแต่ 13.00–15.00 น. จึงว่ายได้เวลา 15.30 น.'),
  item('signs', 7, 'A shop door says “OPEN 9 A.M.–6 P.M.” Tina arrives at 6:15 p.m. What will she find?', ['The shop is closed', 'The shop is opening', 'The shop is crowded', 'The shop is free'], 0, 'เวลา 18.15 น. เลยเวลาปิด 18.00 น. ร้านจึงปิดแล้ว'),
  item('signs', 8, 'You are carrying a puppy. Which sign means you cannot enter?', ['No Horn', 'No Pets', 'No U-turn', 'No Parking'], 1, 'No Pets หมายถึงห้ามนำสัตว์เลี้ยงเข้า', { image: '/learning/signs/no-pets-v3.png', imageAlt: 'ป้ายห้ามนำสัตว์เลี้ยงเข้า รูปสุนัขมีเส้นทับ' }),
  item('signs', 9, 'A notice in the canteen says “PLEASE RETURN YOUR TRAY.” What should you do after eating?', ['Leave the tray on the table', 'Take the tray home', 'Put the tray at the return point', 'Give the tray to a friend'], 2, 'Return your tray คือให้นำถาดไปคืนยังจุดรับคืน'),
  item('signs', 10, 'The sign says “KEEP OFF THE GRASS.” Where should visitors walk?', ['On the grass', 'On the flower bed', 'On the footpath', 'Across the field'], 2, 'Keep off the grass ห้ามเหยียบสนามหญ้า จึงควรเดินบนทางเท้า'),
];

export const onetDirectionsQuestions = [
  item('directions', 1, 'Look at the town map. The library is east of the school. Which way should Nan walk from the school?', ['North', 'South', 'East', 'West'], 2, 'East คือทิศตะวันออก ซึ่งอยู่ทางขวาของแผนที่', { image: '/images/town_map.svg', imageAlt: 'แผนที่เมืองแสดงโรงเรียน ห้องสมุด ถนน และสถานที่สำคัญ' }),
  item('directions', 2, 'A: Excuse me, how can I get to the bank?\nB: Go straight and turn left at the traffic lights. What should A do first?', ['Turn left', 'Go straight', 'Cross the bridge', 'Turn right'], 1, 'คำสั่งแรกคือ Go straight'),
  item('directions', 3, 'The post office is between the bank and the café. Which place is next to both?', ['The school', 'The hospital', 'The post office', 'The market'], 2, 'สถานที่ที่อยู่ระหว่างสองแห่งย่อมอยู่ติดกับทั้งสองแห่ง'),
  item('directions', 4, 'Tom is facing north. He turns right. Which direction is he facing now?', ['East', 'West', 'South', 'North'], 0, 'เมื่อหันหน้าไปทิศเหนือแล้วเลี้ยวขวา จะหันไปทิศตะวันออก'),
  item('directions', 5, 'Which instruction best matches the picture?', ['Turn left', 'Turn right', 'Go straight', 'Go back'], 0, 'ลูกศรในภาพแสดงการเลี้ยวซ้าย', { image: '/learning/directions/turn-left-v2.png', imageAlt: 'ลูกศรบนถนนโค้งไปทางซ้าย' }),
  item('directions', 6, 'The hospital is opposite the supermarket. Where is the supermarket?', ['Behind the hospital', 'Across from the hospital', 'Inside the hospital', 'Next to the bank'], 1, 'Opposite มีความหมายเดียวกับ across from คืออยู่ฝั่งตรงข้าม'),
  item('directions', 7, 'A tourist asks for the nearest toilet. Which reply is the most helpful?', ['I like this town.', 'It is next to the information desk.', 'The desk is brown.', 'Yes, I am a tourist.'], 1, 'คำตอบที่ดีต้องบอกตำแหน่งของห้องน้ำอย่างชัดเจน'),
  item('directions', 8, 'Walk past the bakery. The bus stop is on your right. What do you pass before reaching the bus stop?', ['The bakery', 'The hospital', 'The school', 'The bridge'], 0, 'คำสั่งระบุให้เดินผ่าน bakery ก่อนถึงป้ายรถประจำทาง'),
  item('directions', 9, 'Which sentence correctly describes the picture?', ['The ball is behind the box.', 'The ball is between two boxes.', 'The ball is on the box.', 'The ball is far from the boxes.'], 1, 'Between หมายถึงอยู่ระหว่างสิ่งสองสิ่ง', { image: '/learning/directions/between-v2.png', imageAlt: 'วัตถุหนึ่งอยู่ตรงกลางระหว่างวัตถุสองชิ้น' }),
  item('directions', 10, 'A: Is the station far from here?\nB: No. It is only a five-minute walk. What does B mean?', ['The station is closed', 'The station is nearby', 'The station is crowded', 'The station is underground'], 1, 'ใช้เวลาเดินเพียงห้านาที แสดงว่าสถานีอยู่ใกล้'),
];

export const onetMarketQuestions = [
  item('market', 1, 'Customer: How much are these oranges?\nSeller: They are 60 baht a kilo.\nHow much are two kilos?', ['60 baht', '90 baht', '120 baht', '160 baht'], 2, '60 บาทต่อกิโลกรัม สองกิโลกรัมราคา 120 บาท'),
  item('market', 2, 'A shirt costs 250 baht. It is on sale for 50 baht off. How much is it now?', ['50 baht', '200 baht', '250 baht', '300 baht'], 1, 'ลด 50 บาทจาก 250 บาท เหลือ 200 บาท'),
  item('market', 3, 'Customer: Excuse me, do you have this T-shirt in a larger size?\nWhat does the customer want?', ['A cheaper T-shirt', 'A different color', 'A bigger T-shirt', 'Two T-shirts'], 2, 'Larger size หมายถึงขนาดใหญ่ขึ้น'),
  item('market', 4, 'The sign says “BUY 2, GET 1 FREE.” If Pim pays for two notebooks, how many does she receive?', ['One', 'Two', 'Three', 'Four'], 2, 'ซื้อสองชิ้นและได้รับฟรีอีกหนึ่งชิ้น รวมเป็นสามชิ้น'),
  item('market', 5, 'Seller: Here is your change, 35 baht.\nCustomer: ______', ['How much is it?', 'Thank you.', 'I am sorry.', 'Never mind.'], 1, 'เมื่่อได้รับเงินทอนควรกล่าว Thank you'),
  item('market', 6, 'A market closes at 7 p.m. Joe arrives at 6:45 p.m. How long can he shop?', ['15 minutes', '30 minutes', '45 minutes', 'One hour'], 0, 'จาก 18.45 ถึง 19.00 น. มีเวลา 15 นาที'),
  item('market', 7, 'Which product should be kept in a refrigerator?', ['A notebook', 'Fresh milk', 'A pencil', 'A T-shirt'], 1, 'นมสดควรเก็บในตู้เย็นเพื่อรักษาคุณภาพ'),
  item('market', 8, 'The receipt shows: bread 35 baht, milk 25 baht, eggs 40 baht. What is the total?', ['60 baht', '75 baht', '90 baht', '100 baht'], 3, '35 + 25 + 40 เท่ากับ 100 บาท'),
  item('market', 9, 'Customer: May I try these shoes on?\nWhat does the customer want to do?', ['Pay for the shoes', 'Wear the shoes to check the size', 'Return the shoes', 'Clean the shoes'], 1, 'Try on คือทดลองสวมเพื่อดูว่าขนาดพอดีหรือไม่'),
  item('market', 10, 'Which sentence is the most polite way to ask for a price?', ['Give me the price.', 'How much is this, please?', 'This is too expensive.', 'I want it now.'], 1, 'How much is this, please? เป็นคำถามราคาที่สุภาพ'),
];

export const onetFoodQuestions = [
  item('food', 1, 'Look at the picture. Which meal is usually eaten in the morning?', ['Breakfast', 'Lunch', 'Dinner', 'Dessert'], 0, 'Breakfast คืออาหารเช้า', { image: '/assessment/quest-scenes/breakfast-v1.webp', imageAlt: 'นักเรียนหญิงกำลังรับประทานอาหารเช้าที่มีขนมปัง ไข่ เครื่องดื่ม และผลไม้' }),
  item('food', 2, 'Waiter: Are you ready to order?\nCustomer: ______', ['Yes, I would like fried rice, please.', 'No, I do not cook.', 'The table is ready.', 'I am a waiter.'], 0, 'การตอบรับคำสั่งอาหารควรบอกเมนูที่ต้องการอย่างสุภาพ'),
  item('food', 3, 'Nida does not eat meat. Which meal is best for her?', ['Beef noodles', 'Grilled chicken', 'Vegetable salad', 'Pork fried rice'], 2, 'Vegetable salad ไม่มีเนื้อสัตว์ จึงเหมาะกับผู้ที่ไม่รับประทานเนื้อ'),
  item('food', 4, 'The soup is too hot to eat now. What should you do?', ['Wait for it to cool', 'Add more fire', 'Put it in your bag', 'Eat it very quickly'], 0, 'อาหารร้อนเกินไปควรรอให้เย็นลงก่อนเพื่อความปลอดภัย'),
  item('food', 5, 'Which menu item is shown in the picture?', ['Pizza', 'Pancakes', 'Chicken soup', 'Fried rice'], 3, 'ภาพเป็นข้าวผัด', { image: '/learning/food/fried-rice-v1.png', imageAlt: 'จานข้าวผัดใส่ผักและไข่' }),
  item('food', 6, 'Ben is allergic to peanuts. Which question should he ask before ordering?', ['Is this dish spicy?', 'Does this dish contain peanuts?', 'How large is the plate?', 'Who cooked this dish?'], 1, 'ผู้แพ้ถั่วควรถามว่าอาหารมีถั่วเป็นส่วนประกอบหรือไม่'),
  item('food', 7, 'Menu: sandwich 45 baht, juice 25 baht. Ann has 60 baht. What can she buy?', ['A sandwich and juice', 'Only a sandwich', 'Two sandwiches', 'Two juices and a sandwich'], 1, 'แซนด์วิชราคา 45 บาทซื้อได้ แต่แซนด์วิชกับน้ำผลไม้รวม 70 บาท'),
  item('food', 8, 'Waiter: Would you like anything to drink?\nCustomer: ______', ['A glass of water, please.', 'The soup is delicious.', 'I ate at noon.', 'This chair is blue.'], 0, 'คำถามถามถึงเครื่องดื่ม จึงควรตอบ A glass of water, please.'),
  item('food', 9, 'Which instruction should come first when making a fruit salad?', ['Serve it to your friends', 'Wash the fruit', 'Put the empty bowl away', 'Eat the salad'], 1, 'ควรล้างผลไม้ก่อนเตรียมหรือรับประทาน'),
  item('food', 10, 'Look at the food label. Today is 15 May. What is the safest choice?', ['Eat it immediately', 'Do not eat it', 'Add sugar to it', 'Give it to a friend'], 1, 'วันที่ปัจจุบันเลยวันที่ควรบริโภคก่อน จึงไม่ควรรับประทาน', {
    image: '/assessment/quest-scenes/best-before-yogurt-v1.jpg',
    imageAlt: 'A sealed yogurt cup with a label that reads BEST BEFORE 12 MAY',
  }),
];

export const onetIllnessQuestions = [
  item('illness', 1, 'Look at the picture. What is the matter with the boy?', ['He has a headache.', 'He has a toothache.', 'He has a cough.', 'He has a backache.'], 1, 'เด็กจับแก้มบริเวณฟัน แสดงว่าปวดฟัน', { image: '/learning/illness/toothache-v1.png', imageAlt: 'เด็กจับแก้มและแสดงอาการปวดฟัน' }),
  item('illness', 2, 'Nok has a high fever. What should she do?', ['Play outside in the sun', 'Rest and tell an adult', 'Drink an energy drink', 'Go swimming'], 1, 'เมื่อมีไข้สูงควรพักผ่อนและแจ้งผู้ใหญ่เพื่อรับการดูแล'),
  item('illness', 3, 'Doctor: How long have you had this cough?\nPatient: ______', ['For three days.', 'At the hospital.', 'Twice a day.', 'With my mother.'], 0, 'How long ถามระยะเวลา จึงตอบ For three days.'),
  item('illness', 4, 'Tim fell off his bicycle and hurt his arm. What should his friend do first?', ['Ask an adult for help', 'Tell him to keep riding', 'Leave him alone', 'Give him candy'], 0, 'เมื่อเพื่อนได้รับบาดเจ็บควรขอความช่วยเหลือจากผู้ใหญ่ก่อน'),
  item('illness', 5, 'Which sentence best matches the picture?', ['She has a stomach ache.', 'She has an earache.', 'She has a runny nose.', 'She has a sore throat.'], 3, 'ภาพแสดงอาการเจ็บคอ', { image: '/learning/illness/sore-throat-v1.png', imageAlt: 'เด็กจับลำคอและมีสีหน้าเจ็บปวด' }),
  item('illness', 6, 'You have a cold and need to sneeze. What is the best thing to do?', ['Cover your mouth and nose', 'Sneeze toward your friend', 'Share your tissue', 'Touch everyone’s desk'], 0, 'ควรปิดปากและจมูกเมื่อจามเพื่อลดการแพร่เชื้อ'),
  item('illness', 7, 'Pharmacist: Take this medicine after meals. When should May take it?', ['Before eating', 'While cooking', 'After eating', 'Only at midnight'], 2, 'After meals หมายถึงหลังรับประทานอาหาร'),
  item('illness', 8, 'Pete says, “My stomach hurts after I eat too much.” What advice is best?', ['Eat more quickly', 'Eat less and rest', 'Run immediately', 'Drink five soft drinks'], 1, 'เมื่อปวดท้องเพราะกินมากเกินไป ควรกินให้น้อยลงและพัก'),
  item('illness', 9, 'Which person needs emergency help most urgently?', ['A child with a small paper cut', 'A child who cannot breathe', 'A child with tired legs', 'A child who feels hungry'], 1, 'หายใจไม่ได้เป็นภาวะฉุกเฉิน ต้องรีบขอความช่วยเหลือ'),
  item('illness', 10, 'A: You look pale. Are you all right?\nB: ______', ['I feel dizzy.', 'I like blue.', 'I am twelve.', 'I walk to school.'], 0, 'I feel dizzy บอกอาการเวียนศีรษะและตอบคำถามเรื่องสุขภาพได้ตรงบริบท'),
];

export const O_NET_QUEST_UPGRADES = {
  signs: onetSignsQuestions,
  directions: onetDirectionsQuestions,
  market: onetMarketQuestions,
  food: onetFoodQuestions,
  illness: onetIllnessQuestions,
};
