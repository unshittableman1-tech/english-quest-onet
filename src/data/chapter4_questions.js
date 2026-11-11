import { QUESTS } from './questions';
import { cultureQuestions } from './cultureQuestions';
import { getOnetRealYearPool } from './onetRealExamPools';
import { isPracticeQuestionReady, inspectQuestionMedia } from '../utils/questionMedia';
// src/data/chapter4_questions.js
// Chapter 4: O-NET Arena — Question Pools (O-NET ป.6 Style)
// Format: { id, skill, question, options:[4], answer(0-3), correctFeedback, wrongFeedback, keyword }
// Skills: signs | conversation | directions | reading | grammar | food | classroom | question_words

// ═══════════════════════════════════════════════
//  MINI MOCK POOL  (50 ข้อ — คละทักษะ)
// ═══════════════════════════════════════════════
export const miniMockPool = [
  // Signs
  { id:'mm01', skill:'signs', question:'ป้าย "No Smoking" หมายความว่าอะไร?', options:['ห้ามส่งเสียงดัง','ห้ามสูบบุหรี่','ห้ามถ่ายรูป','ห้ามนำอาหารเข้า'], answer:1, correctFeedback:'ถูกต้อง! No Smoking = ห้ามสูบบุหรี่', wrongFeedback:'Smoke = ควัน/บุหรี่ → No Smoking = ห้ามสูบบุหรี่', keyword:'No Smoking = ห้ามสูบบุหรี่' },
  { id:'mm02', skill:'signs', question:'ป้าย "Keep Out" หมายความว่าอะไร?', options:['ห้ามเข้า','ให้รักษาความสะอาด','ระวังสุนัข','ห้ามส่งเสียง'], answer:0, correctFeedback:'ถูกต้อง! Keep Out = ห้ามเข้า', wrongFeedback:'Keep Out = ห้ามเข้า (อย่าเข้ามา)', keyword:'Keep Out = ห้ามเข้า' },
  { id:'mm03', skill:'signs', question:'ป้าย "Wet Floor" เตือนอะไร?', options:['พื้นร้อน','พื้นแตก','พื้นลื่น','พื้นสกปรก'], answer:2, correctFeedback:'ถูกต้อง! Wet Floor = พื้นเปียก/ลื่น', wrongFeedback:'Wet = เปียก → Wet Floor = พื้นเปียก ระวังลื่น', keyword:'Wet Floor = พื้นเปียก ระวังลื่น' },
  { id:'mm04', skill:'signs', question:'ป้าย "Push" บนประตูหมายความว่าอย่างไร?', options:['ดึง','ผลัก','หมุน','เลื่อน'], answer:1, correctFeedback:'ถูกต้อง! Push = ผลัก', wrongFeedback:'Push = ผลัก | Pull = ดึง', keyword:'Push = ผลัก | Pull = ดึง' },
  { id:'mm05', skill:'signs', question:'ป้าย "Handle with Care" ต้องทำอย่างไร?', options:['รีบส่งด่วน','ระวังระหว่างขนย้าย','ส่งคืนทันที','ตรวจสอบก่อนรับ'], answer:1, correctFeedback:'ถูกต้อง! Handle with Care = ระวังระหว่างขนย้าย', wrongFeedback:'Handle = จัดการ, Care = ระมัดระวัง → ระวังในการขนย้าย', keyword:'Handle with Care = ระวังระหว่างขนย้าย' },
  // Conversation
  { id:'mm06', skill:'conversation', question:'A: "Can I help you?"\nB: "Yes, _____ is the nearest hospital?"', options:['where','what','when','who'], answer:0, correctFeedback:'ถูกต้อง! Where = ที่ไหน', wrongFeedback:'ถามสถานที่ใช้ Where', keyword:'Where = ที่ไหน' },
  { id:'mm07', skill:'conversation', question:'A: "How are you?"\nB: "_____"', options:['I am twelve.','Fine, thank you.','My name is Tom.','Yes, I do.'], answer:1, correctFeedback:'ถูกต้อง! Fine, thank you ตอบ How are you?', wrongFeedback:'"How are you?" ถามสุขภาพ ตอบ "Fine, thank you."', keyword:'How are you? → Fine, thank you.' },
  { id:'mm08', skill:'conversation', question:'A: "What time does the library open?"\nB: "It opens _____ 8 a.m."', options:['in','on','at','to'], answer:2, correctFeedback:'ถูกต้อง! at + เวลา', wrongFeedback:'บอกเวลาใช้ at เช่น at 8 a.m.', keyword:'at + เวลา เช่น at 8 a.m.' },
  { id:'mm09', skill:'conversation', question:'A: "May I borrow your pen?"\nB: "_____"', options:['Yes, please.','Sure, here you are.','No, I don\'t.','Yes, I can.'], answer:1, correctFeedback:'ถูกต้อง! Sure, here you are = แน่นอน นี่เลย', wrongFeedback:'ตอบขอยืม → Sure, here you are (ใช่, นี่เลย)', keyword:'Sure, here you are = แน่นอน' },
  { id:'mm10', skill:'conversation', question:'A: "How much is this shirt?"\nB: "It\'s _____ two hundred baht."', options:['in','at','on','for'], answer:3, correctFeedback:'ถูกต้อง! for = ในราคา', wrongFeedback:'บอกราคาใช้ for เช่น for 200 baht', keyword:'for 200 baht = ในราคา 200 บาท' },
  // Directions
  { id:'mm11', skill:'directions', question:'"Turn left at the traffic light" หมายความว่าอะไร?', options:['เลี้ยวขวาที่ไฟแดง','เลี้ยวซ้ายที่ไฟแดง','ตรงไปที่ไฟแดง','หยุดที่ไฟแดง'], answer:1, correctFeedback:'ถูกต้อง! Turn left = เลี้ยวซ้าย, traffic light = ไฟจราจร', wrongFeedback:'Left = ซ้าย | Right = ขวา | Traffic light = สัญญาณไฟจราจร', keyword:'Turn left = เลี้ยวซ้าย' },
  { id:'mm12', skill:'directions', question:'"Go straight for two blocks" หมายความว่าอะไร?', options:['เลี้ยวซ้าย 2 ครั้ง','ตรงไป 2 ช่วงตึก','หยุดหลัง 2 นาที','เดินถอยหลัง 2 ก้าว'], answer:1, correctFeedback:'ถูกต้อง! Go straight = ตรงไป, blocks = ช่วงตึก', wrongFeedback:'Go straight = ตรงไป, block = ช่วงตึก/ช่วงถนน', keyword:'Go straight for two blocks = ตรงไป 2 ช่วงตึก' },
  { id:'mm13', skill:'directions', question:'"The school is next to the park." หมายความว่าอะไร?', options:['โรงเรียนอยู่หน้าสวน','โรงเรียนอยู่หลังสวน','โรงเรียนอยู่ติดกับสวน','โรงเรียนอยู่ใกล้สวน'], answer:2, correctFeedback:'ถูกต้อง! next to = อยู่ติดกับ', wrongFeedback:'next to = ติดกับ, ข้างๆ | near = ใกล้', keyword:'next to = ติดกับ/อยู่ข้างๆ' },
  { id:'mm14', skill:'directions', question:'"It\'s across from the bank." หมายความว่าอะไร?', options:['อยู่ข้างๆ ธนาคาร','อยู่หลังธนาคาร','อยู่ตรงข้ามธนาคาร','อยู่ใกล้ธนาคาร'], answer:2, correctFeedback:'ถูกต้อง! across from = ตรงข้าม', wrongFeedback:'across from = ตรงข้ามกับ', keyword:'across from = ตรงข้าม' },
  { id:'mm15', skill:'directions', question:'ถ้าอยู่ที่โรงเรียนและต้องการไปร้านขายยาที่อยู่ทางขวา จะพูดว่าอย่างไร?', options:['Go left.','Turn right.','Go back.','Turn around.'], answer:1, correctFeedback:'ถูกต้อง! Turn right = เลี้ยวขวา', wrongFeedback:'Right = ขวา → Turn right = เลี้ยวขวา', keyword:'Turn right = เลี้ยวขวา' },
  // Reading
  { id:'mm16', skill:'reading', question:'Notice: "The library will be closed on Sunday for maintenance."\nห้องสมุดจะปิดวันใด?', options:['วันเสาร์','วันอาทิตย์','วันจันทร์','วันศุกร์'], answer:1, correctFeedback:'ถูกต้อง! Sunday = วันอาทิตย์', wrongFeedback:'Sunday = วันอาทิตย์ | Saturday = วันเสาร์', keyword:'Sunday = วันอาทิตย์' },
  { id:'mm17', skill:'reading', question:'Notice: "Sale! Buy 2 get 1 free. Valid until Friday."\nข้อความนี้บอกเกี่ยวกับอะไร?', options:['ชั่วโมงเปิด-ปิด','โปรโมชั่นสินค้า','กฎห้องสมุด','ตารางสอบ'], answer:1, correctFeedback:'ถูกต้อง! Sale/Buy 2 get 1 free = โปรโมชั่น', wrongFeedback:'Sale = ลดราคา, Buy 2 get 1 free = ซื้อ 2 แถม 1', keyword:'Sale = โปรโมชั่น/ลดราคา' },
  { id:'mm18', skill:'reading', question:'Text: "Tom wakes up at 6 a.m. every day. He has breakfast at 7 a.m."\nทอมกินข้าวเช้าเวลาใด?', options:['6.00 น.','7.00 น.','8.00 น.','9.00 น.'], answer:1, correctFeedback:'ถูกต้อง! He has breakfast at 7 a.m.', wrongFeedback:'breakfast = อาหารเช้า, at 7 a.m. = เวลา 7 โมงเช้า', keyword:'breakfast = อาหารเช้า' },
  { id:'mm19', skill:'reading', question:'Text: "Anna loves animals. She has two cats and a dog at home."\nแอนนามีสัตว์เลี้ยงทั้งหมดกี่ตัว?', options:['1','2','3','4'], answer:2, correctFeedback:'ถูกต้อง! สองแมว + หนึ่งหมา = 3 ตัว', wrongFeedback:'two cats (2 แมว) + a dog (1 หมา) = 3 ตัว', keyword:'two + one = three' },
  { id:'mm20', skill:'reading', question:'Text: "The store opens at 9 a.m. and closes at 9 p.m."\nร้านค้าเปิดทำการกี่ชั่วโมงต่อวัน?', options:['8 ชั่วโมง','10 ชั่วโมง','12 ชั่วโมง','14 ชั่วโมง'], answer:2, correctFeedback:'ถูกต้อง! 9 p.m. - 9 a.m. = 12 ชั่วโมง', wrongFeedback:'9 a.m. ถึง 9 p.m. = 12 ชั่วโมง', keyword:'9 a.m. to 9 p.m. = 12 hours' },
  // Grammar
  { id:'mm21', skill:'grammar', question:'She _____ to school every day.', options:['go','goes','going','went'], answer:1, correctFeedback:'ถูกต้อง! She goes (she/he/it + goes)', wrongFeedback:'ประธาน she ต้องใช้ goes ไม่ใช่ go', keyword:'He/She/It + verb+s' },
  { id:'mm22', skill:'grammar', question:'I _____ my homework yesterday.', options:['do','does','did','doing'], answer:2, correctFeedback:'ถูกต้อง! did = ทำ (past tense)', wrongFeedback:'yesterday บ่งบอก past tense → ใช้ did', keyword:'yesterday → past tense (did)' },
  { id:'mm23', skill:'grammar', question:'There _____ many students in the library.', options:['is','are','was','am'], answer:1, correctFeedback:'ถูกต้อง! There are + พหูพจน์', wrongFeedback:'many students (พหูพจน์) → There are', keyword:'There are + plural' },
  { id:'mm24', skill:'grammar', question:'She is _____ than her sister.', options:['tall','taller','tallest','most tall'], answer:1, correctFeedback:'ถูกต้อง! taller = เปรียบเทียบ 2 คน', wrongFeedback:'เปรียบ 2 สิ่ง → Comparative (er): tall → taller', keyword:'taller = สูงกว่า (2 คน)' },
  { id:'mm25', skill:'grammar', question:'_____ she speak English?', options:['Do','Does','Is','Are'], answer:1, correctFeedback:'ถูกต้อง! Does she (she → Does)', wrongFeedback:'ประธาน she ใช้ Does ในประโยคคำถาม', keyword:'Does she...? (ประธาน she/he/it)' },
  // Food
  { id:'mm26', skill:'food', question:'A: "May I take your order?"\nB: "_____, please."', options:['A glass of water','I am hungry','Yes, I have','No problem'], answer:0, correctFeedback:'ถูกต้อง! A glass of water = น้ำหนึ่งแก้ว', wrongFeedback:'การสั่งอาหาร: May I take your order → สั่งอาหาร/เครื่องดื่ม', keyword:'May I take your order? = ขอรับออเดอร์' },
  { id:'mm27', skill:'food', question:'"I\'d like a hamburger and _____." ควรใส่อะไรในช่องว่าง?', options:['a chips','some chips','the chip','chips of some'], answer:1, correctFeedback:'ถูกต้อง! some chips (นับไม่ได้/พหูพจน์ใช้ some)', wrongFeedback:'chips (มันฝรั่งทอด) = นับไม่ได้ใช้ some', keyword:'some chips = มันฝรั่งทอด (some + uncountable/plural)' },
  { id:'mm28', skill:'food', question:'"The meal comes with _____ salad." ควรใส่อะไร?', options:['a','an','the','some'], answer:3, correctFeedback:'ถูกต้อง! some salad (นับไม่ได้)', wrongFeedback:'salad = นับไม่ได้ ใช้ some', keyword:'some + uncountable noun' },
  { id:'mm29', skill:'food', question:'A: "Is the soup hot?"\nB: "Yes, _____ very hot."', options:['it\'s','they\'re','he\'s','she\'s'], answer:0, correctFeedback:'ถูกต้อง! it\'s (soup = สิ่งของ)', wrongFeedback:'soup = สิ่งของ ใช้ it', keyword:'soup → it' },
  { id:'mm30', skill:'food', question:'"Could I have the _____, please?" (ขอใบเสร็จ)', options:['bill','menu','order','receipt book'], answer:0, correctFeedback:'ถูกต้อง! bill = ใบเสร็จ/บิล', wrongFeedback:'bill = บิล/ใบเสร็จ ในร้านอาหาร', keyword:'bill = ใบเสร็จ (ร้านอาหาร)' },
  // Classroom
  { id:'mm31', skill:'classroom', question:'"Open your books to page 25." หมายความว่าอะไร?', options:['ปิดหนังสือ','เปิดหนังสือหน้า 25','หยิบหนังสือใหม่','อ่านหน้า 25'], answer:1, correctFeedback:'ถูกต้อง! Open your books = เปิดหนังสือ', wrongFeedback:'Open = เปิด, books = หนังสือ, page 25 = หน้า 25', keyword:'Open your books to page... = เปิดหนังสือหน้า...' },
  { id:'mm32', skill:'classroom', question:'"Raise your hand if you know the answer." หมายความว่าอะไร?', options:['ยืนขึ้นถ้ารู้คำตอบ','ยกมือถ้ารู้คำตอบ','พูดถ้ารู้คำตอบ','เขียนคำตอบ'], answer:1, correctFeedback:'ถูกต้อง! Raise your hand = ยกมือ', wrongFeedback:'Raise your hand = ยกมือ', keyword:'Raise your hand = ยกมือ' },
  { id:'mm33', skill:'classroom', question:'"Please be quiet!" หมายความว่าอะไร?', options:['รีบเข้าห้อง','เงียบหน่อย','อย่าลุกจากที่นั่ง','ทำการบ้าน'], answer:1, correctFeedback:'ถูกต้อง! Be quiet = เงียบ', wrongFeedback:'quiet = เงียบ → Be quiet = เงียบหน่อย', keyword:'Be quiet = เงียบ' },
  { id:'mm34', skill:'classroom', question:'"Turn in your homework." หมายความว่าอะไร?', options:['เริ่มทำการบ้าน','ส่งการบ้าน','แก้การบ้าน','รับการบ้านใหม่'], answer:1, correctFeedback:'ถูกต้อง! Turn in = ส่ง (การบ้าน)', wrongFeedback:'Turn in = ส่ง เช่น Turn in your homework = ส่งการบ้าน', keyword:'Turn in = ส่ง' },
  { id:'mm35', skill:'classroom', question:'"Pay attention, please." ครูต้องการให้นักเรียนทำอะไร?', options:['ออกไปข้างนอก','จ่ายเงิน','ตั้งใจฟัง','นั่งลง'], answer:2, correctFeedback:'ถูกต้อง! Pay attention = ตั้งใจฟัง', wrongFeedback:'Pay attention = ตั้งใจ/สนใจ ไม่ใช่ "จ่ายเงิน"', keyword:'Pay attention = ตั้งใจฟัง/สนใจ' },
  // Question Words
  { id:'mm36', skill:'question_words', question:'"_____ does the party start?" "At 7 p.m."', options:['Where','What','When','Who'], answer:2, correctFeedback:'ถูกต้อง! When = เมื่อไหร่', wrongFeedback:'ตอบเวลา (7 p.m.) → ถามด้วย When', keyword:'When = เมื่อไหร่ (ถามเวลา)' },
  { id:'mm37', skill:'question_words', question:'"_____ is your favourite colour?" "Blue."', options:['Who','What','Where','Why'], answer:1, correctFeedback:'ถูกต้อง! What = อะไร', wrongFeedback:'คำตอบคือสี (Blue) → ถามด้วย What', keyword:'What = อะไร' },
  { id:'mm38', skill:'question_words', question:'"_____ are you crying?" "Because I lost my bag."', options:['When','Who','Why','Where'], answer:2, correctFeedback:'ถูกต้อง! Why = ทำไม', wrongFeedback:'คำตอบขึ้น Because → ถามด้วย Why', keyword:'Why = ทำไม (ตอบด้วย Because)' },
  { id:'mm39', skill:'question_words', question:'"_____ students are in the class?" "Thirty."', options:['How many','How much','How long','How often'], answer:0, correctFeedback:'ถูกต้อง! How many = กี่ (นับได้)', wrongFeedback:'students (นับได้) + ตอบจำนวน → How many', keyword:'How many = กี่คน/กี่อัน (นับได้)' },
  { id:'mm40', skill:'question_words', question:'"_____ does it take to get there?" "About 20 minutes."', options:['How long','How many','How much','How often'], answer:0, correctFeedback:'ถูกต้อง! How long = นานเท่าไหร่', wrongFeedback:'ตอบเป็นเวลา (20 minutes) → How long', keyword:'How long = นานเท่าไหร่' },
  // Mixed rounds 2
  { id:'mm41', skill:'signs', question:'ป้าย "Emergency Exit" หมายความว่าอะไร?', options:['ทางออกหลัก','ทางเข้า','ทางออกฉุกเฉิน','ลิฟต์ฉุกเฉิน'], answer:2, correctFeedback:'ถูกต้อง! Emergency Exit = ทางออกฉุกเฉิน', wrongFeedback:'Emergency = ฉุกเฉิน, Exit = ทางออก', keyword:'Emergency Exit = ทางออกฉุกเฉิน' },
  { id:'mm42', skill:'grammar', question:'My brother _____ football every weekend.', options:['play','plays','played','playing'], answer:1, correctFeedback:'ถูกต้อง! brother (he) → plays', wrongFeedback:'My brother = He → plays (present simple, 3rd person)', keyword:'He/She/It + verb-s' },
  { id:'mm43', skill:'conversation', question:'A: "Excuse me, where is the post office?"\nB: "It\'s _____ this street."', options:['down','in','on','at'], answer:2, correctFeedback:'ถูกต้อง! on this street = อยู่บนถนนนี้', wrongFeedback:'บอกถนน ใช้ on เช่น on this street, on Main Street', keyword:'on + ถนน' },
  { id:'mm44', skill:'reading', question:'Sign: "Open: Mon-Sat 9am-6pm Closed: Sunday"\nวันใดที่ร้านเปิด?', options:['วันอาทิตย์','วันเสาร์','ทุกวัน','วันหยุดราชการ'], answer:1, correctFeedback:'ถูกต้อง! Mon-Sat = จันทร์-เสาร์ → วันเสาร์เปิด', wrongFeedback:'Mon-Sat = วันจันทร์ถึงวันเสาร์ → วันเสาร์เปิด', keyword:'Mon-Sat = จันทร์ถึงเสาร์' },
  { id:'mm45', skill:'grammar', question:'She _____ never been to Bangkok.', options:['have','has','had','is'], answer:1, correctFeedback:'ถูกต้อง! She has (present perfect)', wrongFeedback:'She (3rd person) + has + never + past participle', keyword:'She has never been... (Present Perfect)' },
  { id:'mm46', skill:'food', question:'"The soup is too _____ for me to eat." (เค็มเกินไป)', options:['spicy','salty','sour','sweet'], answer:1, correctFeedback:'ถูกต้อง! salty = เค็ม', wrongFeedback:'salty = เค็ม | spicy = เผ็ด | sour = เปรี้ยว | sweet = หวาน', keyword:'salty = เค็ม' },
  { id:'mm47', skill:'signs', question:'ป้าย "Out of Order" หมายความว่าอะไร?', options:['เต็มแล้ว','ปิดซ่อม/ใช้ไม่ได้','ห้ามเข้า','เปิดใหม่'], answer:1, correctFeedback:'ถูกต้อง! Out of Order = เสีย/ใช้ไม่ได้', wrongFeedback:'Out of Order = เสีย/ขัดข้อง ใช้ไม่ได้ชั่วคราว', keyword:'Out of Order = เสีย/ใช้ไม่ได้' },
  { id:'mm48', skill:'conversation', question:'A: "I\'m sorry I\'m late."\nB: "_____"', options:['Never mind.','Good luck.','That\'s great.','You\'re welcome.'], answer:0, correctFeedback:'ถูกต้อง! Never mind = ไม่เป็นไร', wrongFeedback:'ตอบรับคำขอโทษ → Never mind / Don\'t worry', keyword:'Never mind = ไม่เป็นไร' },
  { id:'mm49', skill:'grammar', question:'_____ apple a day keeps the doctor away.', options:['A','An','The','Some'], answer:1, correctFeedback:'ถูกต้อง! An apple (ขึ้นต้นด้วยเสียง vowel a-)', wrongFeedback:'apple ขึ้นต้นด้วยเสียงสระ /æ/ → ใช้ An', keyword:'An + vowel sound (a, e, i, o, u)' },
  { id:'mm50', skill:'directions', question:'"The hospital is between the school and the park." โรงพยาบาลอยู่ที่ไหน?', options:['ข้างๆ โรงเรียน','ตรงข้ามสวน','ระหว่างโรงเรียนกับสวน','หลังสวน'], answer:2, correctFeedback:'ถูกต้อง! between A and B = ระหว่าง A กับ B', wrongFeedback:'between = ระหว่าง (2 สิ่ง)', keyword:'between A and B = ระหว่าง A กับ B' },
];

// ═══════════════════════════════════════════════
//  SPEED MOCK POOL  (60 ข้อ — สั้น อ่านเร็ว)
// ═══════════════════════════════════════════════
export const speedMockPool = [
  { id:'sp01', skill:'signs', question:'ป้าย "Do Not Enter" คืออะไร?', options:['ห้ามเข้า','โปรดเข้า','ทางเข้า','ทางออก'], answer:0, correctFeedback:'ถูกต้อง! Do Not Enter = ห้ามเข้า', wrongFeedback:'Do Not = ห้าม, Enter = เข้า', keyword:'Do Not Enter = ห้ามเข้า' },
  { id:'sp02', skill:'grammar', question:'She _____ a teacher.', options:['am','is','are','be'], answer:1, correctFeedback:'ถูกต้อง! She is', wrongFeedback:'She → is', keyword:'She is' },
  { id:'sp03', skill:'vocabulary', question:'"Fast" มีความหมายตรงกับข้อใด?', options:['ช้า','เร็ว','ใหญ่','เล็ก'], answer:1, correctFeedback:'ถูกต้อง! Fast = เร็ว', wrongFeedback:'Fast = เร็ว ≠ Slow = ช้า', keyword:'Fast = เร็ว' },
  { id:'sp04', skill:'conversation', question:'A: "Thank you!" B: "_____"', options:['Sorry.','You\'re welcome.','Please.','Excuse me.'], answer:1, correctFeedback:'ถูกต้อง! You\'re welcome = ยินดี', wrongFeedback:'Thank you → You\'re welcome', keyword:'You\'re welcome = ยินดี' },
  { id:'sp05', skill:'grammar', question:'They _____ playing football now.', options:['is','am','are','be'], answer:2, correctFeedback:'ถูกต้อง! They are (playing)', wrongFeedback:'They → are', keyword:'They are + -ing' },
  { id:'sp06', skill:'signs', question:'ป้าย "Fragile" หมายความว่าอะไร?', options:['ของหนัก','ของแตกง่าย','ของร้อน','ของเย็น'], answer:1, correctFeedback:'ถูกต้อง! Fragile = แตกง่าย', wrongFeedback:'Fragile = บอบบาง/แตกง่าย', keyword:'Fragile = แตกง่าย' },
  { id:'sp07', skill:'vocabulary', question:'"Hungry" แปลว่าอะไร?', options:['ง่วงนอน','หิวข้าว','เหนื่อย','กลัว'], answer:1, correctFeedback:'ถูกต้อง! Hungry = หิว', wrongFeedback:'Hungry = หิวข้าว | Sleepy = ง่วง | Tired = เหนื่อย', keyword:'Hungry = หิว' },
  { id:'sp08', skill:'grammar', question:'_____ is your name?', options:['Who','What','Where','When'], answer:1, correctFeedback:'ถูกต้อง! What is your name?', wrongFeedback:'ถามชื่อ → What is your name?', keyword:'What is your name? = ชื่ออะไร?' },
  { id:'sp09', skill:'signs', question:'ป้าย "Beware of Dog" เตือนอะไร?', options:['ระวังรถ','ระวังสุนัข','ระวังลื่น','ระวังไฟ'], answer:1, correctFeedback:'ถูกต้อง! Beware of Dog = ระวังสุนัข', wrongFeedback:'Beware = ระวัง, Dog = สุนัข', keyword:'Beware of Dog = ระวังสุนัข' },
  { id:'sp10', skill:'vocabulary', question:'"Beautiful" หมายความว่าอะไร?', options:['น่าเกลียด','สวยงาม','เก่า','ใหม่'], answer:1, correctFeedback:'ถูกต้อง! Beautiful = สวยงาม', wrongFeedback:'Beautiful = สวยงาม | Ugly = น่าเกลียด', keyword:'Beautiful = สวยงาม' },
  { id:'sp11', skill:'grammar', question:'I _____ to school yesterday.', options:['go','goes','went','gone'], answer:2, correctFeedback:'ถูกต้อง! went (past of go)', wrongFeedback:'yesterday → past tense: go → went', keyword:'go → went (past)' },
  { id:'sp12', skill:'signs', question:'ป้าย "Staff Only" หมายความว่าอะไร?', options:['เฉพาะผู้จัดการ','เฉพาะพนักงาน','เฉพาะนักเรียน','เฉพาะแขก'], answer:1, correctFeedback:'ถูกต้อง! Staff Only = เฉพาะพนักงาน', wrongFeedback:'Staff = พนักงาน → Staff Only = เฉพาะพนักงาน', keyword:'Staff Only = เฉพาะพนักงาน' },
  { id:'sp13', skill:'vocabulary', question:'"Expensive" แปลว่าอะไร?', options:['ถูก','แพง','ใหม่','เก่า'], answer:1, correctFeedback:'ถูกต้อง! Expensive = แพง', wrongFeedback:'Expensive = แพง | Cheap = ถูก', keyword:'Expensive = แพง' },
  { id:'sp14', skill:'conversation', question:'A: "How old are you?" B: "I\'m _____."', options:['twelve years old','fine','at school','a student'], answer:0, correctFeedback:'ถูกต้อง! twelve years old = อายุ 12 ปี', wrongFeedback:'ถามอายุ (How old) → ตอบอายุ', keyword:'How old → อายุ' },
  { id:'sp15', skill:'grammar', question:'There _____ a cat under the table.', options:['are','is','am','be'], answer:1, correctFeedback:'ถูกต้อง! There is + เอกพจน์', wrongFeedback:'a cat (เอกพจน์) → There is', keyword:'There is + singular' },
  { id:'sp16', skill:'signs', question:'ป้าย "No Photography" หมายความว่าอะไร?', options:['ห้ามใช้โทรศัพท์','ห้ามถ่ายรูป','ห้ามนำกล้องเข้า','ห้ามวิดีโอ'], answer:1, correctFeedback:'ถูกต้อง! No Photography = ห้ามถ่ายรูป', wrongFeedback:'Photography = การถ่ายรูป → No Photography = ห้ามถ่ายรูป', keyword:'No Photography = ห้ามถ่ายรูป' },
  { id:'sp17', skill:'vocabulary', question:'"Difficult" หมายความว่าอะไร?', options:['ง่าย','ยาก','สนุก','น่าเบื่อ'], answer:1, correctFeedback:'ถูกต้อง! Difficult = ยาก', wrongFeedback:'Difficult = ยาก | Easy = ง่าย', keyword:'Difficult = ยาก | Easy = ง่าย' },
  { id:'sp18', skill:'grammar', question:'She _____ milk every morning.', options:['drink','drinks','drank','drinking'], answer:1, correctFeedback:'ถูกต้อง! She drinks (3rd person s)', wrongFeedback:'She → drinks (เติม s)', keyword:'She drinks = เธอดื่ม' },
  { id:'sp19', skill:'signs', question:'ป้าย "Caution: Hot Surface" เตือนอะไร?', options:['พื้นลื่น','พื้นเปียก','ผิวร้อน','ไฟฟ้าแรงสูง'], answer:2, correctFeedback:'ถูกต้อง! Hot Surface = ผิวร้อน', wrongFeedback:'Hot = ร้อน, Surface = พื้นผิว → ผิวร้อน ระวัง', keyword:'Hot Surface = ผิวร้อน' },
  { id:'sp20', skill:'vocabulary', question:'"Loud" แปลว่าอะไร?', options:['เงียบ','ดัง','ต่ำ','สูง'], answer:1, correctFeedback:'ถูกต้อง! Loud = ดัง', wrongFeedback:'Loud = ดัง | Quiet = เงียบ', keyword:'Loud = ดัง | Quiet = เงียบ' },
  { id:'sp21', skill:'grammar', question:'I will _____ you tomorrow.', options:['see','sees','saw','seeing'], answer:0, correctFeedback:'ถูกต้อง! will + V1 (base form)', wrongFeedback:'will + กริยาช่อง 1 (base form) เช่น will see', keyword:'will + base verb' },
  { id:'sp22', skill:'signs', question:'ป้าย "Sale 50% off" หมายความว่าอะไร?', options:['สินค้าหมด','ลดราคา 50%','ราคาพิเศษ 50 บาท','ซื้อ 50 ชิ้น'], answer:1, correctFeedback:'ถูกต้อง! Sale 50% off = ลดราคา 50%', wrongFeedback:'50% off = ลด 50 เปอร์เซ็นต์', keyword:'50% off = ลดราคา 50%' },
  { id:'sp23', skill:'vocabulary', question:'"Worried" หมายความว่าอะไร?', options:['ดีใจ','กังวล','โกรธ','แปลกใจ'], answer:1, correctFeedback:'ถูกต้อง! Worried = กังวล', wrongFeedback:'Worried = กังวลใจ | Happy = ดีใจ | Angry = โกรธ', keyword:'Worried = กังวล' },
  { id:'sp24', skill:'grammar', question:'He has _____ his lunch.', options:['finish','finishes','finished','finishing'], answer:2, correctFeedback:'ถูกต้อง! has finished (Present Perfect)', wrongFeedback:'has + past participle (finished)', keyword:'has/have + past participle' },
  { id:'sp25', skill:'signs', question:'ป้าย "Children Must Be Accompanied by an Adult" หมายความว่าอะไร?', options:['เด็กเข้าฟรี','เด็กต้องมีผู้ใหญ่ไปด้วย','เด็กห้ามเข้า','เด็กเข้าได้คนเดียว'], answer:1, correctFeedback:'ถูกต้อง! ต้องมีผู้ใหญ่พาเด็กเข้า', wrongFeedback:'Accompanied by = ไปพร้อมกับ, Adult = ผู้ใหญ่', keyword:'Accompanied by an Adult = มีผู้ใหญ่ไปด้วย' },
  { id:'sp26', skill:'vocabulary', question:'"Ill" แปลว่าอะไร?', options:['สุขภาพดี','ป่วย','แข็งแรง','ง่วง'], answer:1, correctFeedback:'ถูกต้อง! Ill = ป่วย', wrongFeedback:'Ill = ป่วย | Sick = ป่วย (ใช้แทนกันได้)', keyword:'Ill = ป่วย' },
  { id:'sp27', skill:'grammar', question:'We _____ basketball last Saturday.', options:['play','plays','played','playing'], answer:2, correctFeedback:'ถูกต้อง! played (past tense)', wrongFeedback:'last Saturday → past tense: play → played', keyword:'last Saturday → played' },
  { id:'sp28', skill:'conversation', question:'A: "What\'s the weather like today?" B: "It\'s _____."', options:['two o\'clock','Monday','sunny','August'], answer:2, correctFeedback:'ถูกต้อง! sunny = แดดออก (สภาพอากาศ)', wrongFeedback:'ถามสภาพอากาศ → ตอบสภาพอากาศ (sunny/rainy/cloudy)', keyword:'weather → sunny/rainy/cloudy' },
  { id:'sp29', skill:'signs', question:'ป้าย "Elevator Out of Service" หมายความว่าอะไร?', options:['ลิฟต์ใช้ได้ปกติ','ลิฟต์ขัดข้อง','ลิฟต์ปิดชั่วคราว','ลิฟต์เต็ม'], answer:1, correctFeedback:'ถูกต้อง! Out of Service = ขัดข้อง ใช้ไม่ได้', wrongFeedback:'Out of Service = ใช้ไม่ได้/ขัดข้อง', keyword:'Out of Service = ขัดข้อง' },
  { id:'sp30', skill:'vocabulary', question:'"Cloudy" แปลว่าอะไร?', options:['มีแดด','มีเมฆ','มีฝน','มีหิมะ'], answer:1, correctFeedback:'ถูกต้อง! Cloudy = มีเมฆ', wrongFeedback:'Cloudy = มีเมฆ | Sunny = มีแดด | Rainy = ฝนตก', keyword:'Cloudy = มีเมฆ' },
  { id:'sp31', skill:'grammar', question:'This is _____ book I told you about.', options:['a','an','the','some'], answer:2, correctFeedback:'ถูกต้อง! the (หนังสือที่พูดถึงแล้ว = specific)', wrongFeedback:'I told you about = พูดถึงแล้ว → ใช้ the (specific)', keyword:'the = specific (ที่พูดถึงแล้ว)' },
  { id:'sp32', skill:'conversation', question:'A: "Do you like English?" B: "Yes, _____ very much."', options:['I like it','I liked it','I will like it','I am liking'], answer:0, correctFeedback:'ถูกต้อง! I like it very much', wrongFeedback:'ตอบ Do you like = Yes, I like it', keyword:'Yes, I like it very much.' },
  { id:'sp33', skill:'signs', question:'ป้าย "Please Recycle" ขอให้ทำอะไร?', options:['ทิ้งขยะ','นำกลับมาใช้ใหม่','ลดการใช้น้ำ','ประหยัดไฟ'], answer:1, correctFeedback:'ถูกต้อง! Recycle = นำกลับมาใช้ใหม่', wrongFeedback:'Recycle = การรีไซเคิล = นำกลับมาใช้ใหม่', keyword:'Recycle = นำกลับมาใช้ใหม่' },
  { id:'sp34', skill:'vocabulary', question:'"Crowded" แปลว่าอะไร?', options:['เงียบสงบ','แออัด/คนเยอะ','กว้าง','ว่างเปล่า'], answer:1, correctFeedback:'ถูกต้อง! Crowded = แออัด คนเยอะ', wrongFeedback:'Crowded = มีคนเยอะ แออัด', keyword:'Crowded = แออัด' },
  { id:'sp35', skill:'grammar', question:'She _____ reading a book when I called.', options:['is','was','were','be'], answer:1, correctFeedback:'ถูกต้อง! was reading (Past Continuous)', wrongFeedback:'when I called → Past → was + reading', keyword:'was + -ing (Past Continuous)' },
  { id:'sp36', skill:'signs', question:'ป้าย "No Food or Drinks" ในห้องสมุดหมายความว่าอะไร?', options:['มีอาหารให้บริการ','ห้ามนำอาหารและเครื่องดื่มเข้า','ห้ามพูดคุย','ห้ามใช้โทรศัพท์'], answer:1, correctFeedback:'ถูกต้อง! No Food or Drinks = ห้ามนำอาหาร/เครื่องดื่มเข้า', wrongFeedback:'No = ห้าม, Food or Drinks = อาหารหรือเครื่องดื่ม', keyword:'No Food or Drinks = ห้ามนำอาหารเข้า' },
  { id:'sp37', skill:'vocabulary', question:'"Arrive" แปลว่าอะไร?', options:['ออกเดินทาง','มาถึง','แวะพัก','รอ'], answer:1, correctFeedback:'ถูกต้อง! Arrive = มาถึง', wrongFeedback:'Arrive = มาถึง | Depart/Leave = ออกเดินทาง', keyword:'Arrive = มาถึง' },
  { id:'sp38', skill:'grammar', question:'You should _____ more vegetables.', options:['eating','eats','ate','eat'], answer:3, correctFeedback:'ถูกต้อง! should + base verb', wrongFeedback:'should + กริยาช่อง 1: should eat', keyword:'should + base verb' },
  { id:'sp39', skill:'signs', question:'ป้าย "Quiet Please: Exam in Progress" หมายถึงอะไร?', options:['กำลังซ่อมแซม','กำลังสอบ ขอให้เงียบ','ห้องเรียนปิด','เปิดสอบเสริม'], answer:1, correctFeedback:'ถูกต้อง! Exam in Progress = กำลังสอบ', wrongFeedback:'Quiet = เงียบ, Exam in Progress = กำลังสอบ', keyword:'Exam in Progress = กำลังสอบ' },
  { id:'sp40', skill:'vocabulary', question:'"Ancient" แปลว่าอะไร?', options:['ทันสมัย','โบราณ/เก่าแก่','สวยงาม','ใหญ่โต'], answer:1, correctFeedback:'ถูกต้อง! Ancient = โบราณ เก่าแก่', wrongFeedback:'Ancient = โบราณ เก่าแก่มาก | Modern = ทันสมัย', keyword:'Ancient = โบราณ' },
  { id:'sp41', skill:'grammar', question:'If it rains, we _____ stay at home.', options:['will','would','can','shall'], answer:0, correctFeedback:'ถูกต้อง! If + present → will (first conditional)', wrongFeedback:'If + present simple → will + base verb', keyword:'If + present → will (1st conditional)' },
  { id:'sp42', skill:'conversation', question:'A: "Can you help me?" B: "Of course, _____ I can."', options:['what','that','you','I'], answer:3, correctFeedback:'ถูกต้อง! Of course, I can = แน่นอน ฉันช่วยได้', wrongFeedback:'"Of course, I can." = แน่นอน ฉันช่วยได้', keyword:'Of course, I can = แน่นอน' },
  { id:'sp43', skill:'signs', question:'ป้าย "Mind the Step" เตือนอะไร?', options:['ระวังหัว','ระวังบันได/ขั้น','ระวังรถ','ระวังสุนัข'], answer:1, correctFeedback:'ถูกต้อง! Mind the Step = ระวังขั้นบันได', wrongFeedback:'Mind = ระวัง, Step = ขั้น → ระวังขั้น', keyword:'Mind the Step = ระวังขั้นบันได' },
  { id:'sp44', skill:'vocabulary', question:'"Polite" แปลว่าอะไร?', options:['หยาบคาย','สุภาพ','ตลก','น่าเบื่อ'], answer:1, correctFeedback:'ถูกต้อง! Polite = สุภาพ', wrongFeedback:'Polite = สุภาพ | Rude = หยาบคาย', keyword:'Polite = สุภาพ | Rude = หยาบคาย' },
  { id:'sp45', skill:'grammar', question:'He has _____ for ten years.', options:['teach','teaches','taught','teaching'], answer:2, correctFeedback:'ถูกต้อง! has taught (Present Perfect)', wrongFeedback:'has + past participle: teach → taught', keyword:'teach → taught (irregular)' },
  { id:'sp46', skill:'signs', question:'ป้าย "No Littering: Fine 2,000 Baht" แปลว่าอะไร?', options:['ทิ้งขยะได้ฟรี','ห้ามทิ้งขยะ ปรับ 2,000 บาท','ทิ้งขยะที่นี่','พื้นที่ทิ้งขยะ'], answer:1, correctFeedback:'ถูกต้อง! No Littering = ห้ามทิ้งขยะ, Fine = ค่าปรับ', wrongFeedback:'Litter = ขยะ | No Littering = ห้ามทิ้งขยะ | Fine = ปรับ', keyword:'No Littering = ห้ามทิ้งขยะ | Fine = ค่าปรับ' },
  { id:'sp47', skill:'vocabulary', question:'"Generous" แปลว่าอะไร?', options:['ขี้เหนียว','ใจดี/ใจกว้าง','โลภ','ขี้อาย'], answer:1, correctFeedback:'ถูกต้อง! Generous = ใจกว้าง/ใจดี', wrongFeedback:'Generous = ใจกว้าง ชอบให้ | Selfish = เห็นแก่ตัว', keyword:'Generous = ใจกว้าง' },
  { id:'sp48', skill:'grammar', question:'The children _____ very tired after the trip.', options:['is','was','were','am'], answer:2, correctFeedback:'ถูกต้อง! The children were (plural)', wrongFeedback:'The children = พหูพจน์ → were', keyword:'children → were' },
  { id:'sp49', skill:'conversation', question:'A: "Is this seat taken?" B: "_____"', options:['No, please sit down.','Yes, thank you.','I don\'t know.','You\'re right.'], answer:0, correctFeedback:'ถูกต้อง! No, please sit down = ไม่มีคนนั่ง นั่งได้เลย', wrongFeedback:'"Is this seat taken?" = มีคนนั่งแล้วหรือเปล่า? → No = ไม่มี นั่งได้', keyword:'Is this seat taken? = มีคนนั่งไหม?' },
  { id:'sp50', skill:'signs', question:'ป้าย "Reserved Parking" หมายความว่าอะไร?', options:['ที่จอดรถสาธารณะ','ที่จอดรถจองไว้','ที่จอดรถฟรี','ห้ามจอดรถ'], answer:1, correctFeedback:'ถูกต้อง! Reserved = จองไว้ → ที่จอดจองสำรอง', wrongFeedback:'Reserved = สงวนไว้/จอง → Reserved Parking = ที่จอดสำรอง', keyword:'Reserved = จอง/สงวนไว้' },
  { id:'sp51', skill:'grammar', question:'I have never _____ sushi before.', options:['eat','eats','eaten','eating'], answer:2, correctFeedback:'ถูกต้อง! have never eaten (Present Perfect)', wrongFeedback:'have + past participle: eat → eaten', keyword:'have eaten (Present Perfect)' },
  { id:'sp52', skill:'vocabulary', question:'"Exhausted" แปลว่าอะไร?', options:['มีพลังงาน','อยากอาหาร','เหนื่อยมาก','ดีใจมาก'], answer:2, correctFeedback:'ถูกต้อง! Exhausted = เหนื่อยมาก/หมดแรง', wrongFeedback:'Exhausted = เหนื่อยสุดๆ มากกว่า tired', keyword:'Exhausted = เหนื่อยมาก/หมดแรง' },
  { id:'sp53', skill:'grammar', question:'She asked me _____ I was feeling well.', options:['that','if','what','which'], answer:1, correctFeedback:'ถูกต้อง! asked if = ถามว่า...หรือเปล่า', wrongFeedback:'asked if = ถามว่า...ไหม (Yes/No question)', keyword:'asked if = ถามว่า...หรือเปล่า' },
  { id:'sp54', skill:'conversation', question:'A: "Let\'s go to the movies!" B: "_____"', options:['That\'s a good idea!','I\'m sorry.','You\'re welcome.','Never mind.'], answer:0, correctFeedback:'ถูกต้อง! That\'s a good idea! = ความคิดดีมาก', wrongFeedback:'ตอบรับข้อเสนอ Let\'s... → That\'s a good idea!', keyword:'That\'s a good idea! = ความคิดดีมาก' },
  { id:'sp55', skill:'signs', question:'ป้าย "Admission Free" หมายความว่าอะไร?', options:['ห้ามเข้า','เข้าชมฟรี','ห้ามถ่ายรูป','จ่ายค่าเข้าชม'], answer:1, correctFeedback:'ถูกต้อง! Admission Free = เข้าฟรี ไม่เสียค่าใช้จ่าย', wrongFeedback:'Admission = ค่าเข้าชม | Free = ฟรี → Admission Free = ฟรี', keyword:'Admission Free = เข้าชมฟรี' },
  { id:'sp56', skill:'vocabulary', question:'"Immediately" แปลว่าอะไร?', options:['ช้าๆ','ภายหลัง','ทันที','บางครั้ง'], answer:2, correctFeedback:'ถูกต้อง! Immediately = ทันที', wrongFeedback:'Immediately = ทันที = right away | Soon = เร็วๆ นี้', keyword:'Immediately = ทันที' },
  { id:'sp57', skill:'grammar', question:'He _____ in Bangkok for five years.', options:['live','lives','has lived','living'], answer:2, correctFeedback:'ถูกต้อง! has lived (for 5 years = duration)', wrongFeedback:'for five years = ช่วงเวลาต่อเนื่อง → Present Perfect (has lived)', keyword:'for + duration → Present Perfect' },
  { id:'sp58', skill:'conversation', question:'A: "I\'ve lost my wallet." B: "_____"', options:['Oh dear! Let me help you look for it.','Congratulations!','That\'s great news!','You\'re welcome.'], answer:0, correctFeedback:'ถูกต้อง! Oh dear! แสดงความเป็นห่วงและเสนอช่วย', wrongFeedback:'lost wallet = แย่มาก → แสดงความเป็นห่วง: "Oh dear!"', keyword:'Oh dear! = โอ้โห! (แสดงความห่วงใย)' },
  { id:'sp59', skill:'signs', question:'ป้าย "Queue Here" หมายความว่าอะไร?', options:['ห้ามยืน','เข้าคิวที่นี่','ทางออก','รอที่นี่'], answer:1, correctFeedback:'ถูกต้อง! Queue = เข้าคิว', wrongFeedback:'Queue = ต่อคิว/เข้าแถว → Queue Here = เข้าคิวที่นี่', keyword:'Queue = เข้าคิว' },
  { id:'sp60', skill:'vocabulary', question:'"Curious" แปลว่าอะไร?', options:['เบื่อ','กลัว','อยากรู้อยากเห็น','เงียบ'], answer:2, correctFeedback:'ถูกต้อง! Curious = อยากรู้อยากเห็น', wrongFeedback:'Curious = สงสัย อยากรู้ | Bored = เบื่อ', keyword:'Curious = อยากรู้อยากเห็น' },
];

// ═══════════════════════════════════════════════
//  SKILL MIXED POOL  (80 ข้อ — Signs+Conv+Reading+Grammar)
// ═══════════════════════════════════════════════
export const skillMixedPool = [
  // === SIGNS (20) ===
  { id:'sm01', skill:'signs', question:'Notice: "This product contains nuts. May cause allergic reactions."\nสินค้านี้เตือนเกี่ยวกับอะไร?', options:['สินค้าราคาแพง','สินค้ามีส่วนผสมที่ทำให้แพ้ได้','สินค้าหมดอายุ','สินค้ามีน้ำตาลสูง'], answer:1, correctFeedback:'ถูกต้อง! nut = ถั่ว, allergic reaction = อาการแพ้', wrongFeedback:'contains nuts = มีถั่ว | allergic reaction = อาการแพ้', keyword:'nuts = ถั่ว | allergic = แพ้' },
  { id:'sm02', skill:'signs', question:'Label: "Shake well before use."\nต้องทำอะไรก่อนใช้?', options:['แช่ตู้เย็น','อ่านคำแนะนำ','เขย่าก่อนใช้','ต้มก่อนใช้'], answer:2, correctFeedback:'ถูกต้อง! Shake well = เขย่าให้เข้ากัน', wrongFeedback:'Shake = เขย่า | before use = ก่อนใช้', keyword:'Shake well before use = เขย่าก่อนใช้' },
  { id:'sm03', skill:'signs', question:'Sign: "Closed for renovation. Reopening March 1st."\nร้านปิดเพราะอะไร?', options:['วันหยุด','ปรับปรุงร้าน','สินค้าหมด','น้ำท่วม'], answer:1, correctFeedback:'ถูกต้อง! renovation = การปรับปรุง', wrongFeedback:'closed for renovation = ปิดเพื่อปรับปรุง', keyword:'renovation = การปรับปรุง' },
  { id:'sm04', skill:'signs', question:'Warning label: "Keep away from children."\nป้ายนี้ต้องการอะไร?', options:['เด็กห้ามใช้/ต้องเก็บให้ห่างเด็ก','เด็กใช้ได้','เด็กชอบสินค้านี้','ผู้ปกครองห้ามซื้อ'], answer:0, correctFeedback:'ถูกต้อง! Keep away from children = เก็บให้ห่างมือเด็ก', wrongFeedback:'Keep away from = เก็บให้ห่างจาก | children = เด็ก', keyword:'Keep away from children = เก็บห่างเด็ก' },
  { id:'sm05', skill:'signs', question:'Notice: "Lost and Found Office — Room 101"\nห้องนี้คือที่ทำอะไร?', options:['ห้องประชุม','ห้องจัดเก็บของหาย','ห้องสำนักงาน','ห้องรับแขก'], answer:1, correctFeedback:'ถูกต้อง! Lost and Found = ของหาย/ที่ทำการของหาย', wrongFeedback:'Lost = หาย | Found = พบ → ศูนย์รับของหาย', keyword:'Lost and Found = ศูนย์ของหาย' },
  { id:'sm06', skill:'signs', question:'Sign: "No Parking: 7am-9am and 4pm-6pm Weekdays"\nจอดรถได้เวลาใด?', options:['ทุกวัน ตลอด 24 ชั่วโมง','ช่วงชั่วโมงเร่งด่วน','วันเสาร์-อาทิตย์ตลอดวัน','ไม่สามารถจอดได้เลย'], answer:2, correctFeedback:'ถูกต้อง! ห้ามจอดวันธรรมดา เช้า-เย็น → วันหยุดจอดได้ทั้งวัน', wrongFeedback:'Weekdays = วันธรรมดา → วันเสาร์อาทิตย์ไม่มีข้อห้าม', keyword:'Weekdays = วันธรรมดา (จันทร์-ศุกร์)' },
  { id:'sm07', skill:'signs', question:'Label: "Best Before: Dec 2025"\nสินค้าหมดอายุเมื่อใด?', options:['ธันวาคม 2025','ธันวาคม 2024','มกราคม 2025','ตลอดไป'], answer:0, correctFeedback:'ถูกต้อง! Best Before = วันที่ดีที่สุดก่อน = ธ.ค. 2025', wrongFeedback:'Best Before = ควรใช้ก่อน | Dec = ธันวาคม', keyword:'Best Before = ควรใช้ก่อนวันที่ระบุ' },
  { id:'sm08', skill:'signs', question:'Notice: "Swimming Pool: No Diving Allowed"\nห้ามทำอะไรในสระ?', options:['ห้ามว่ายน้ำ','ห้ามกระโดดน้ำ','ห้ามวิ่ง','ห้ามนำอาหารเข้า'], answer:1, correctFeedback:'ถูกต้อง! No Diving = ห้ามกระโดดน้ำ', wrongFeedback:'Diving = การดำน้ำ/กระโดดน้ำ → No Diving = ห้ามกระโดด', keyword:'No Diving = ห้ามกระโดดน้ำ' },
  { id:'sm09', skill:'signs', question:'Label: "Store in a cool, dry place."\nต้องเก็บสินค้าอย่างไร?', options:['แช่แข็ง','เก็บที่เย็นและแห้ง','เก็บในที่แสงแดด','เก็บในน้ำ'], answer:1, correctFeedback:'ถูกต้อง! cool = เย็น, dry = แห้ง', wrongFeedback:'cool = เย็น | dry = แห้ง | store = เก็บ', keyword:'cool and dry = เย็นและแห้ง' },
  { id:'sm10', skill:'signs', question:'Notice in museum: "Please Do Not Touch the Exhibits"\nนักท่องเที่ยวต้องทำอะไร?', options:['สามารถจับสิ่งของได้','ห้ามจับสิ่งของจัดแสดง','ต้องสวมถุงมือ','ต้องถ่ายรูปสิ่งของ'], answer:1, correctFeedback:'ถูกต้อง! Do Not Touch = ห้ามจับ | Exhibits = สิ่งจัดแสดง', wrongFeedback:'Touch = แตะ/จับ | Exhibits = สิ่งจัดแสดง | Do Not = ห้าม', keyword:'Do Not Touch = ห้ามจับ' },
  { id:'sm11', skill:'signs', question:'Sign: "For External Use Only"\nยา/ผลิตภัณฑ์นี้ใช้อย่างไร?', options:['กินได้','ทาภายนอกเท่านั้น','ฉีดเข้าเส้น','ใช้ในที่มืด'], answer:1, correctFeedback:'ถูกต้อง! External Use Only = ใช้ภายนอกเท่านั้น (ทา ไม่กิน)', wrongFeedback:'External = ภายนอก | Use Only = ใช้เท่านั้น → ทาภายนอก', keyword:'External Use Only = ใช้ภายนอกเท่านั้น' },
  { id:'sm12', skill:'signs', question:'Notice: "Wet Paint — Do Not Touch"\nควรทำอะไร?', options:['ทาสีเพิ่ม','ระวังอย่าแตะสี','ล้างสีออก','ใช้สีนี้'], answer:1, correctFeedback:'ถูกต้อง! Wet Paint = สีเปียก ระวังอย่าแตะ', wrongFeedback:'Wet Paint = สีที่เพิ่งทาใหม่ (เปียก) → Do Not Touch = อย่าแตะ', keyword:'Wet Paint = สีเปียก (เพิ่งทา)' },
  { id:'sm13', skill:'signs', question:'Sign at hospital: "Visiting Hours: 2pm - 8pm Daily"\nสามารถเข้าเยี่ยมผู้ป่วยได้เมื่อใด?', options:['ตลอด 24 ชั่วโมง','14.00 - 20.00 น. ทุกวัน','8.00 - 14.00 น.','เฉพาะวันหยุด'], answer:1, correctFeedback:'ถูกต้อง! 2pm-8pm = 14.00-20.00 น.', wrongFeedback:'2pm = 14.00 | 8pm = 20.00 | Daily = ทุกวัน', keyword:'2pm = 14.00 | 8pm = 20.00' },
  { id:'sm14', skill:'signs', question:'Notice: "Maximum Capacity: 15 Persons"\nสถานที่นี้รองรับคนได้กี่คน?', options:['5 คน','10 คน','15 คน','50 คน'], answer:2, correctFeedback:'ถูกต้อง! Maximum Capacity 15 = รับได้สูงสุด 15 คน', wrongFeedback:'Maximum = สูงสุด | Capacity = ความจุ/ปริมาณ', keyword:'Maximum Capacity = ความจุสูงสุด' },
  { id:'sm15', skill:'signs', question:'Label on medicine: "Take 2 tablets twice a day after meals."\nต้องกินยาวันละกี่เม็ด?', options:['1 เม็ด','2 เม็ด','3 เม็ด','4 เม็ด'], answer:3, correctFeedback:'ถูกต้อง! 2 tablets × 2 times = 4 เม็ดต่อวัน', wrongFeedback:'2 tablets twice a day = 2 เม็ด × 2 ครั้ง = 4 เม็ด/วัน', keyword:'twice a day = วันละ 2 ครั้ง' },
  { id:'sm16', skill:'signs', question:'Sign: "Drive Slowly: School Zone"\nทำไมต้องขับช้า?', options:['ถนนเสียหาย','เป็นเขตโรงเรียน','ไฟแดง','ทางแคบ'], answer:1, correctFeedback:'ถูกต้อง! School Zone = เขตโรงเรียน', wrongFeedback:'School Zone = บริเวณโรงเรียน ต้องขับช้า', keyword:'School Zone = เขตโรงเรียน' },
  { id:'sm17', skill:'signs', question:'Notice: "Free Wi-Fi Available"\nบริการอะไรที่ให้ฟรี?', options:['อาหาร','น้ำดื่ม','อินเทอร์เน็ต Wi-Fi','หนังสือ'], answer:2, correctFeedback:'ถูกต้อง! Free Wi-Fi = Wi-Fi ฟรี', wrongFeedback:'Wi-Fi = อินเทอร์เน็ตไร้สาย | Free = ฟรี', keyword:'Free Wi-Fi = อินเทอร์เน็ตไร้สาย ฟรี' },
  { id:'sm18', skill:'signs', question:'Sign: "Please Take a Number and Wait"\nต้องทำอะไรก่อนรับบริการ?', options:['ยืนรอในคิว','รับบัตรคิวและรอ','ลงชื่อในสมุด','โทรแจ้งก่อน'], answer:1, correctFeedback:'ถูกต้อง! Take a Number = รับบัตรคิว | Wait = รอ', wrongFeedback:'Take a Number = รับบัตรหมายเลขคิว | Wait = รอ', keyword:'Take a Number = รับบัตรคิว' },
  { id:'sm19', skill:'signs', question:'Package label: "Assembly Required"\nผู้ซื้อต้องทำอะไร?', options:['ส่งคืนสินค้า','ประกอบชิ้นส่วนเอง','โทรหาช่าง','รออีก 3 วัน'], answer:1, correctFeedback:'ถูกต้อง! Assembly Required = ต้องประกอบเอง', wrongFeedback:'Assembly = การประกอบ | Required = จำเป็น → ต้องประกอบเอง', keyword:'Assembly Required = ต้องประกอบเอง' },
  { id:'sm20', skill:'signs', question:'Notice: "No Refund After 7 Days"\nลูกค้าสามารถคืนสินค้าได้ภายในกี่วัน?', options:['3 วัน','5 วัน','7 วัน','ไม่สามารถคืนได้เลย'], answer:2, correctFeedback:'ถูกต้อง! ภายใน 7 วัน คืนได้ หลังจากนั้นคืนไม่ได้', wrongFeedback:'No Refund After 7 Days = หลัง 7 วันคืนเงินไม่ได้ → ต้องคืนใน 7 วัน', keyword:'No Refund After 7 Days = คืนได้ภายใน 7 วัน' },
  // === CONVERSATION (20) ===
  { id:'sm21', skill:'conversation', question:'A: "Excuse me, could you tell me the way to the train station?"\nB: "_____"', options:['The train is late.','Go straight, then turn left at the corner.','I don\'t like trains.','The station is big.'], answer:1, correctFeedback:'ถูกต้อง! บอกทาง = Go straight, then turn left', wrongFeedback:'ถามทาง → บอกทิศทาง: Go straight, turn left/right', keyword:'Go straight then turn left/right = ตรงไปแล้วเลี้ยว' },
  { id:'sm22', skill:'conversation', question:'A: "Would you like some more tea?"\nB: "_____"', options:['Yes, please. Thank you.','No, I don\'t have tea.','Tea is hot.','The cup is empty.'], answer:0, correctFeedback:'ถูกต้อง! Yes, please. Thank you. = ขอบคุณ เอาด้วย', wrongFeedback:'Would you like...? = เสนอของ → Yes, please / No, thank you', keyword:'Yes, please / No, thank you' },
  { id:'sm23', skill:'conversation', question:'A: "I\'m not feeling well today."\nB: "_____"', options:['That\'s wonderful!','I\'m sorry to hear that.','What\'s your favourite food?','You should eat more.'], answer:1, correctFeedback:'ถูกต้อง! I\'m sorry to hear that = เสียใจที่ได้ยิน', wrongFeedback:'ไม่สบาย → ตอบแสดงความเป็นห่วง: I\'m sorry to hear that', keyword:'I\'m sorry to hear that = เสียใจที่ได้ยิน' },
  { id:'sm24', skill:'conversation', question:'A: "Happy Birthday, Lisa!"\nB: "_____"', options:['Thank you so much!','Good morning.','I\'m fine.','Nice to meet you.'], answer:0, correctFeedback:'ถูกต้อง! Thank you so much! = ขอบคุณมาก', wrongFeedback:'Happy Birthday! → Thank you so much!', keyword:'Happy Birthday → Thank you so much!' },
  { id:'sm25', skill:'conversation', question:'A: "What does \'humid\' mean?"\nB: "It means _____."', options:['very hot','wet and warm','very cold','dry and dusty'], answer:1, correctFeedback:'ถูกต้อง! humid = อากาศชื้น (ร้อนชื้น)', wrongFeedback:'humid = ชื้น มีความชื้นสูง (wet and warm)', keyword:'humid = ชื้น (อากาศชื้น)' },
  { id:'sm26', skill:'conversation', question:'A: "How long will the journey take?"\nB: "About _____ hours."', options:['few','two','some','many'], answer:1, correctFeedback:'ถูกต้อง! About two hours = ประมาณ 2 ชั่วโมง', wrongFeedback:'ตอบเวลาเป็นจำนวน → about two hours (ไม่ใช่ few/some/many)', keyword:'How long? → About two hours' },
  { id:'sm27', skill:'conversation', question:'A: "Can I speak to Mr. Johnson, please?"\nB: "I\'m sorry, he _____ right now."', options:['is not available','doesn\'t speak','not here','isn\'t came'], answer:0, correctFeedback:'ถูกต้อง! is not available = ไม่ว่าง/ไม่ได้อยู่', wrongFeedback:'not available = ไม่ว่าง → he is not available right now', keyword:'not available = ไม่ว่าง' },
  { id:'sm28', skill:'conversation', question:'A: "Could you repeat that, please?"\nB: "Of course. I said, \'The meeting is at 3 p.m.\'""\nA ต้องการอะไร?', options:['ให้พูดช้าลง','ให้พูดซ้ำอีกครั้ง','ให้เขียนลงกระดาษ','ให้พูดดังขึ้น'], answer:1, correctFeedback:'ถูกต้อง! Repeat = พูดซ้ำอีกครั้ง', wrongFeedback:'Repeat = ทำซ้ำ → Could you repeat? = พูดซ้ำได้ไหม', keyword:'Could you repeat? = พูดซ้ำได้ไหม' },
  { id:'sm29', skill:'conversation', question:'A: "It\'s really cold today, isn\'t it?"\nB: "_____"', options:['Yes, I need a coat.','No, it\'s raining.','The sun is out.','It\'s Monday.'], answer:0, correctFeedback:'ถูกต้อง! Yes, I need a coat = ใช่ ต้องใส่เสื้อกันหนาว', wrongFeedback:'cold → ต้องการเสื้อกันหนาว (coat)', keyword:'cold → need a coat' },
  { id:'sm30', skill:'conversation', question:'Librarian: "Can I help you?"\nStudent: "Yes, I\'m looking _____ a book about dinosaurs."', options:['at','for','to','on'], answer:1, correctFeedback:'ถูกต้อง! looking for = กำลังหา', wrongFeedback:'look for = มองหา, ค้นหา', keyword:'look for = มองหา' },
  { id:'sm31', skill:'conversation', question:'A: "Do you mind if I open the window?"\nB: "No, _____ at all."', options:['I don\'t mind','please don\'t','I mind','yes please'], answer:0, correctFeedback:'ถูกต้อง! No, I don\'t mind = ไม่ว่าอะไร เปิดได้เลย', wrongFeedback:'"Do you mind?" → "No, I don\'t mind." = ไม่ว่าอะไร (ทำได้เลย)', keyword:'No, I don\'t mind = ไม่ว่าอะไร' },
  { id:'sm32', skill:'conversation', question:'A: "Which bus goes to Central Park?"\nB: "Take bus number _____."', options:['Go left','Number 12','The big one','Near here'], answer:1, correctFeedback:'ถูกต้อง! ตอบหมายเลขรถบัส', wrongFeedback:'ถามรถบัสสาย → ตอบหมายเลขสาย', keyword:'Take bus number... = ขึ้นรถบัสสาย...' },
  { id:'sm33', skill:'conversation', question:'A: "What\'s your phone number?"\nB: "_____"', options:['It\'s 08x-xxx-xxxx.','I\'m twelve.','I live in Bangkok.','I\'m Thai.'], answer:0, correctFeedback:'ถูกต้อง! ตอบเบอร์โทรศัพท์', wrongFeedback:'ถามเบอร์โทร → ตอบตัวเลข เช่น 08x-xxx-xxxx', keyword:'phone number = เบอร์โทรศัพท์' },
  { id:'sm34', skill:'conversation', question:'A: "Shall we meet at the cinema at 6?"\nB: "_____, see you there!"', options:['Sounds good','I\'m not sure','It\'s far away','I don\'t like movies'], answer:0, correctFeedback:'ถูกต้อง! Sounds good = ฟังดูดี ตกลง', wrongFeedback:'ตอบรับนัดหมาย → Sounds good! / Sure! / Great!', keyword:'Sounds good = ฟังดูดี ตกลง' },
  { id:'sm35', skill:'conversation', question:'A: "Congratulations on passing your exam!"\nB: "_____"', options:['Thank you! I worked really hard.','I\'m so sorry.','Good morning.','No, I didn\'t.'], answer:0, correctFeedback:'ถูกต้อง! Thank you! ตอบรับคำชมเชย', wrongFeedback:'Congratulations → Thank you! I worked really hard.', keyword:'Congratulations! → Thank you!' },
  { id:'sm36', skill:'conversation', question:'Cashier: "That\'ll be 250 baht, please."\nCustomer: "Here you are. Can I have a _____?"', options:['menu','receipt','change','bill'], answer:1, correctFeedback:'ถูกต้อง! receipt = ใบเสร็จ (จากร้านค้า)', wrongFeedback:'หลังจ่ายเงิน → ขอ receipt (ใบเสร็จ)', keyword:'receipt = ใบเสร็จ' },
  { id:'sm37', skill:'conversation', question:'A: "Excuse me, is there a pharmacy nearby?"\nB: "Yes, there\'s one _____ the corner."', options:['around','in','through','along'], answer:0, correctFeedback:'ถูกต้อง! around the corner = แถวหัวมุมถนน', wrongFeedback:'around the corner = เลยหัวมุมไปหน่อย (ใกล้ๆ)', keyword:'around the corner = แถวหัวมุม' },
  { id:'sm38', skill:'conversation', question:'A: "How do you spell \'necessary\'?"\nB: "N-E-C-E-S-S-A-R-Y."\nA ถามเกี่ยวกับอะไร?', options:['การออกเสียง','การสะกดคำ','ความหมาย','การใช้คำ'], answer:1, correctFeedback:'ถูกต้อง! How do you spell? = สะกดอย่างไร?', wrongFeedback:'How do you spell? = สะกดอย่างไร?', keyword:'How do you spell? = สะกดอย่างไร?' },
  { id:'sm39', skill:'conversation', question:'A: "I\'m afraid I\'ve made a mistake."\nB: "_____"', options:['Don\'t worry, it can happen.','Congratulations!','That\'s wonderful!','I agree.'], answer:0, correctFeedback:'ถูกต้อง! Don\'t worry = ไม่เป็นไร', wrongFeedback:'ทำผิดพลาด → แสดงความเห็นใจ: Don\'t worry, it can happen', keyword:'Don\'t worry = ไม่เป็นไร' },
  { id:'sm40', skill:'conversation', question:'Doctor: "What seems to be the problem?"\nPatient: "I have a terrible _____ in my stomach."', options:['time','pain','worry','feel'], answer:1, correctFeedback:'ถูกต้อง! pain = ความเจ็บปวด', wrongFeedback:'pain = ความเจ็บปวด | I have a pain in... = ปวดที่...', keyword:'pain = ความเจ็บปวด' },
  // === READING (20) ===
  { id:'sm41', skill:'reading', question:'Text: "The Amazon rainforest is called the \'lungs of the Earth\' because it produces 20% of the world\'s oxygen."\nทำไมป่าแอมาซอนถูกเรียกว่า "ปอดของโลก"?', options:['เพราะมีสัตว์เยอะมาก','เพราะผลิตออกซิเจน 20% ของโลก','เพราะมีน้ำอุดมสมบูรณ์','เพราะอากาศเย็น'], answer:1, correctFeedback:'ถูกต้อง! ผลิตออกซิเจน 20% ของโลก', wrongFeedback:'produces 20% of the world\'s oxygen = ผลิต O2 ให้โลก 20%', keyword:'lungs of the Earth = ปอดของโลก' },
  { id:'sm42', skill:'reading', question:'Text: "The school fair will be held next Saturday. Students can join games, buy food, and watch performances."\nสิ่งที่ทำในงานแฟร์คือ?', options:['เรียนหนังสือพิเศษ','เล่นเกม ซื้ออาหาร ดูการแสดง','ทดสอบวิชา','ประชุมผู้ปกครอง'], answer:1, correctFeedback:'ถูกต้อง! games + food + performances = เล่นเกม ซื้ออาหาร ดูการแสดง', wrongFeedback:'fair = งานแฟร์: games, buy food, watch performances', keyword:'school fair = งานวัดของโรงเรียน' },
  { id:'sm43', skill:'reading', question:'Email: "Dear Mr. Smith, I am writing to apply for the English teacher position. I have 5 years of experience. Best regards, Jane."\nJane ส่งอีเมลเพื่ออะไร?', options:['สั่งซื้อสินค้า','สมัครงาน','ถามข้อมูล','บ่นเรื่องบริการ'], answer:1, correctFeedback:'ถูกต้อง! apply for = สมัคร (งาน)', wrongFeedback:'apply for the position = สมัครตำแหน่ง', keyword:'apply for = สมัคร' },
  { id:'sm44', skill:'reading', question:'Text: "If you feel unwell on the trip, please inform the tour guide immediately."\nควรบอกใครถ้าไม่สบาย?', options:['ผู้จัดการโรงแรม','แพทย์','ไกด์นำเที่ยว','คนขับรถ'], answer:2, correctFeedback:'ถูกต้อง! tour guide = ไกด์นำเที่ยว', wrongFeedback:'inform the tour guide = แจ้งไกด์', keyword:'tour guide = ไกด์นำเที่ยว' },
  { id:'sm45', skill:'reading', question:'Ad: "WANTED: Part-time staff. Working hours: 5pm-10pm, Mon-Fri. Salary: 8,000 baht/month."\nงานนี้ทำกี่ชั่วโมงต่อวัน?', options:['3 ชั่วโมง','5 ชั่วโมง','8 ชั่วโมง','10 ชั่วโมง'], answer:1, correctFeedback:'ถูกต้อง! 5pm-10pm = 5 ชั่วโมง', wrongFeedback:'5pm to 10pm = 5 ชั่วโมงต่อวัน', keyword:'5pm-10pm = 5 ชั่วโมง' },
  { id:'sm46', skill:'reading', question:'Text: "Ben is the oldest of the three brothers. His brother Mike is two years younger. Tom is the youngest."\nเรียงลำดับอายุจากมากไปน้อย?', options:['Ben-Tom-Mike','Tom-Mike-Ben','Ben-Mike-Tom','Mike-Ben-Tom'], answer:2, correctFeedback:'ถูกต้อง! Ben (แก่สุด) > Mike > Tom (อ่อนสุด)', wrongFeedback:'Ben = oldest (แก่สุด) | Mike = กลาง | Tom = youngest (อ่อนสุด)', keyword:'oldest > middle > youngest' },
  { id:'sm47', skill:'reading', question:'Leaflet: "Yoga class every Tuesday and Thursday, 6-7:30pm. Beginners welcome. Bring your own mat."\nต้องนำอะไรมาเอง?', options:['รองเท้ากีฬา','เสื่อโยคะ','ขวดน้ำ','หมวก'], answer:1, correctFeedback:'ถูกต้อง! Bring your own mat = นำเสื่อมาเอง', wrongFeedback:'mat = เสื่อ | Bring your own = นำมาเอง', keyword:'mat = เสื่อ' },
  { id:'sm48', skill:'reading', question:'Notice: "The last bus leaves at 10:30 p.m. There are no buses after midnight."\nรถบัสคันสุดท้ายออกกี่โมง?', options:['22:00 น.','22:30 น.','23:00 น.','24:00 น.'], answer:1, correctFeedback:'ถูกต้อง! 10:30 p.m. = 22:30 น.', wrongFeedback:'10:30 p.m. = 22:30 น. (คืน)', keyword:'10:30 p.m. = 22:30 น.' },
  { id:'sm49', skill:'reading', question:'Recipe: "Mix flour and sugar. Add eggs and milk. Bake for 30 minutes at 180°C."\nทำขนมนี้ต้องใช้เวลาอบนานเท่าใด?', options:['20 นาที','25 นาที','30 นาที','45 นาที'], answer:2, correctFeedback:'ถูกต้อง! Bake for 30 minutes = อบ 30 นาที', wrongFeedback:'Bake for 30 minutes = อบเป็นเวลา 30 นาที', keyword:'bake for 30 minutes = อบ 30 นาที' },
  { id:'sm50', skill:'reading', question:'Text: "Sara got 90 on her English test. Her score was the highest in the class. She was very proud."\nทำไม Sara ภูมิใจ?', options:['เพื่อนชม','ได้คะแนนสูงสุดในห้อง','ได้รางวัล','ครูชม'], answer:1, correctFeedback:'ถูกต้อง! highest score in class = คะแนนสูงสุดในห้อง', wrongFeedback:'highest in the class = สูงสุดในห้อง', keyword:'highest score = คะแนนสูงสุด' },
  { id:'sm51', skill:'reading', question:'Text: "Dolphins are very intelligent animals. They live in groups called pods. They communicate using clicks and whistles."\nปลาโลมาสื่อสารอย่างไร?', options:['ด้วยภาษากาย','ด้วยเสียงคลิกและเสียงหวีด','ด้วยสัมผัส','ด้วยสายตา'], answer:1, correctFeedback:'ถูกต้อง! clicks and whistles = เสียงคลิกและเสียงหวีด', wrongFeedback:'communicate using clicks and whistles = สื่อสารด้วยเสียงคลิกและหวีด', keyword:'clicks and whistles = เสียงสื่อสาร' },
  { id:'sm52', skill:'reading', question:'Instruction: "Switch off all lights before leaving the room."\nต้องทำอะไรก่อนออกจากห้อง?', options:['ล็อคประตู','ปิดไฟทุกดวง','เปิดแอร์','เก็บของ'], answer:1, correctFeedback:'ถูกต้อง! Switch off all lights = ปิดไฟทุกดวง', wrongFeedback:'Switch off = ปิด | all lights = ไฟทุกดวง', keyword:'switch off = ปิด (ไฟฟ้า)' },
  { id:'sm53', skill:'reading', question:'Text: "The market is open 7 days a week. On Sundays it closes 2 hours earlier than usual."\nตลาดปิดเร็วกว่าปกติกี่ชั่วโมงวันอาทิตย์?', options:['1 ชั่วโมง','2 ชั่วโมง','3 ชั่วโมง','ปิดทั้งวัน'], answer:1, correctFeedback:'ถูกต้อง! closes 2 hours earlier = ปิดเร็วกว่าปกติ 2 ชั่วโมง', wrongFeedback:'2 hours earlier = เร็วกว่าปกติ 2 ชั่วโมง', keyword:'2 hours earlier = เร็วกว่า 2 ชั่วโมง' },
  { id:'sm54', skill:'reading', question:'Text: "Nira studies every evening. She reads for at least an hour before bed. Her favourite subject is science."\nNira ชอบวิชาใดมากที่สุด?', options:['ภาษาอังกฤษ','คณิตศาสตร์','วิทยาศาสตร์','สังคม'], answer:2, correctFeedback:'ถูกต้อง! favourite subject is science = วิทยาศาสตร์', wrongFeedback:'favourite subject = วิชาที่ชอบที่สุด | science = วิทยาศาสตร์', keyword:'favourite subject = วิชาที่ชอบ' },
  { id:'sm55', skill:'reading', question:'Ad: "Get 20% off your next purchase when you spend over 500 baht."\nได้ส่วนลดเมื่อใด?', options:['ซื้อสินค้าทุกชนิด','ซื้อครบ 500 บาทขึ้นไป','เป็นสมาชิก','ซื้อครั้งแรก'], answer:1, correctFeedback:'ถูกต้อง! when you spend over 500 baht = ซื้อครบ 500 บาทขึ้นไป', wrongFeedback:'spend over 500 baht = ใช้จ่ายเกิน 500 บาท', keyword:'spend over 500 = ซื้อครบ 500+' },
  { id:'sm56', skill:'reading', question:'Text: "Please complete this form and return it to the office by Friday."\nต้องส่งแบบฟอร์มที่ไหน?', options:['ไปรษณีย์','ออนไลน์','สำนักงาน','ครู'], answer:2, correctFeedback:'ถูกต้อง! return it to the office = ส่งคืนที่สำนักงาน', wrongFeedback:'office = สำนักงาน | return to = ส่งคืนที่', keyword:'office = สำนักงาน' },
  { id:'sm57', skill:'reading', question:'Chart: Thai students: 25 | Foreign students: 15 | Total: 40\nนักเรียนต่างชาติมีกี่เปอร์เซ็นต์?', options:['25%','37.5%','50%','62.5%'], answer:1, correctFeedback:'ถูกต้อง! 15/40 × 100 = 37.5%', wrongFeedback:'15 ÷ 40 × 100 = 37.5%', keyword:'percent = จำนวน/รวม × 100' },
  { id:'sm58', skill:'reading', question:'Text: "Nam woke up late and missed the school bus. She had to walk to school, so she arrived 20 minutes late."\nทำไม Nam ไปโรงเรียนสาย?', options:['รถบัสเสีย','ตื่นสายและพลาดรถ','อยากเดิน','ลืมกระเป๋า'], answer:1, correctFeedback:'ถูกต้อง! woke up late + missed the bus = ตื่นสาย ไม่ทันรถ', wrongFeedback:'woke up late = ตื่นสาย | missed the bus = พลาดรถ', keyword:'miss the bus = ตกรถ/พลาดรถ' },
  { id:'sm59', skill:'reading', question:'Poster: "LOST: Black cat, white paws. Named Mochi. If found, please call 089-xxx-xxxx"\nควรทำอย่างไรถ้าพบแมวตัวนี้?', options:['นำแมวไปให้ตำรวจ','โทรหาเจ้าของ','นำแมวไปขาย','เก็บแมวไว้เอง'], answer:1, correctFeedback:'ถูกต้อง! call 089-xxx-xxxx = โทรหาเจ้าของ', wrongFeedback:'please call = โทรหาเบอร์ที่ระบุ = โทรหาเจ้าของ', keyword:'If found, please call = ถ้าพบโทรหา...' },
  { id:'sm60', skill:'reading', question:'Text: "The train to Chiang Mai departs at 6:00 pm and arrives the next morning at 7:30 am."\nการเดินทางใช้เวลาทั้งหมดนานเท่าใด?', options:['12 ชั่วโมง','13 ชั่วโมง 30 นาที','14 ชั่วโมง','15 ชั่วโมง 30 นาที'], answer:1, correctFeedback:'ถูกต้อง! 6pm ถึง 7:30am = 13 ชั่วโมง 30 นาที', wrongFeedback:'18:00 → 07:30 = 13 ชั่วโมง 30 นาที', keyword:'6pm to 7:30am = 13h 30min' },
  // === GRAMMAR (20) ===
  { id:'sm61', skill:'grammar', question:'She _____ to the market twice a week.', options:['go','goes','went','gone'], answer:1, correctFeedback:'ถูกต้อง! She goes (present simple, 3rd person)', wrongFeedback:'She (she/he/it) → goes', keyword:'She/He/It + verb-s' },
  { id:'sm62', skill:'grammar', question:'By the time we arrived, the movie _____.', options:['already started','has already started','had already started','already starts'], answer:2, correctFeedback:'ถูกต้อง! had already started (Past Perfect)', wrongFeedback:'By the time + past → Past Perfect (had + pp)', keyword:'had already started = Past Perfect' },
  { id:'sm63', skill:'grammar', question:'Neither she nor I _____ wrong.', options:['is','are','am','were'], answer:2, correctFeedback:'ถูกต้อง! Neither... nor I → am', wrongFeedback:'neither...nor I → กริยาตามประธานที่ใกล้กว่า = I → am', keyword:'neither...nor I → am' },
  { id:'sm64', skill:'grammar', question:'You should _____ the rules.', options:['follows','followed','follow','following'], answer:2, correctFeedback:'ถูกต้อง! should + base verb', wrongFeedback:'should + กริยาช่อง 1 (bare infinitive)', keyword:'should + base verb' },
  { id:'sm65', skill:'grammar', question:'The book _____ on the table belongs to me.', options:['lay','lying','lies','is lying'], answer:2, correctFeedback:'ถูกต้อง! lies (present simple = วางอยู่)', wrongFeedback:'The book lies on the table = หนังสืออยู่บนโต๊ะ (ความเป็นจริง)', keyword:'The book lies = หนังสือวางอยู่' },
  { id:'sm66', skill:'grammar', question:'I wish I _____ taller.', options:['am','is','were','be'], answer:2, correctFeedback:'ถูกต้อง! I wish + were (subjunctive)', wrongFeedback:'I wish + were (สมมติ ใช้ were กับทุกประธาน)', keyword:'I wish I were... (subjunctive)' },
  { id:'sm67', skill:'grammar', question:'He said that he _____ come tomorrow.', options:['will','would','can','shall'], answer:1, correctFeedback:'ถูกต้อง! said → reported speech → would', wrongFeedback:'said (past) → will → would (reported speech)', keyword:'will → would (reported speech)' },
  { id:'sm68', skill:'grammar', question:'_____ you finish your work?', options:['Did','Does','Do','Have'], answer:0, correctFeedback:'ถูกต้อง! Did you... (past tense question)', wrongFeedback:'คำถาม past tense ใช้ Did + subject + base verb', keyword:'Did + subject + base verb (past question)' },
  { id:'sm69', skill:'grammar', question:'The cake _____ by my mother last night.', options:['baked','is baked','was baked','had bake'], answer:2, correctFeedback:'ถูกต้อง! was baked (passive, past tense)', wrongFeedback:'last night → past passive: was + past participle', keyword:'was baked = ถูกอบ (passive past)' },
  { id:'sm70', skill:'grammar', question:'This is the girl _____ helped me.', options:['which','whose','whom','who'], answer:3, correctFeedback:'ถูกต้อง! who = ผู้ที่ (relative pronoun for person, subject)', wrongFeedback:'คนที่ทำ (subject) → who | คนที่ถูกทำ (object) → whom', keyword:'who = ผู้ที่ (relative pronoun)' },
  { id:'sm71', skill:'grammar', question:'I haven\'t seen him _____ last Monday.', options:['for','since','from','in'], answer:1, correctFeedback:'ถูกต้อง! since + specific time', wrongFeedback:'since + จุดเวลาที่เจาะจง (last Monday)', keyword:'since + specific time point' },
  { id:'sm72', skill:'grammar', question:'She is interested _____ learning English.', options:['in','on','at','for'], answer:0, correctFeedback:'ถูกต้อง! interested in = สนใจใน', wrongFeedback:'interested in = สนใจ (in + verb-ing)', keyword:'interested in + noun/verb-ing' },
  { id:'sm73', skill:'grammar', question:'The students are _____ their tests.', options:['take','takes','taking','taken'], answer:2, correctFeedback:'ถูกต้อง! are taking (present continuous)', wrongFeedback:'are + verb-ing = กำลัง...อยู่', keyword:'are + verb-ing = Present Continuous' },
  { id:'sm74', skill:'grammar', question:'It\'s important _____ your homework on time.', options:['doing','do','to do','done'], answer:2, correctFeedback:'ถูกต้อง! It\'s important to do (infinitive)', wrongFeedback:'It\'s important + to + base verb (infinitive)', keyword:'It\'s important to + verb' },
  { id:'sm75', skill:'grammar', question:'They _____ arrived when we called.', options:['just','have just','had just','has just'], answer:2, correctFeedback:'ถูกต้อง! had just arrived (past perfect)', wrongFeedback:'when we called → past → had just arrived (Past Perfect)', keyword:'had just + pp = Past Perfect' },
  { id:'sm76', skill:'grammar', question:'She speaks English very _____.', options:['good','well','better','best'], answer:1, correctFeedback:'ถูกต้อง! well (กริยาวิเศษณ์ = ดี)', wrongFeedback:'speaks (กริยา) → ใช้กริยาวิเศษณ์ well ไม่ใช่ good', keyword:'speaks well = พูดได้ดี (adverb)' },
  { id:'sm77', skill:'grammar', question:'_____ of the students passed the exam.', options:['Most','Almost','Much','Any'], answer:0, correctFeedback:'ถูกต้อง! Most of the students = นักเรียนส่วนใหญ่', wrongFeedback:'Most of = ส่วนใหญ่ของ | Almost = เกือบ (ใช้กับ all/every)', keyword:'Most of the... = ส่วนใหญ่ของ...' },
  { id:'sm78', skill:'grammar', question:'I\'ll call you _____ I get home.', options:['when','while','since','until'], answer:0, correctFeedback:'ถูกต้อง! when = เมื่อ (จะโทรเมื่อถึงบ้าน)', wrongFeedback:'when = เมื่อ | while = ขณะที่ | until = จนกว่า', keyword:'when = เมื่อ (เหตุการณ์เกิดขึ้น)' },
  { id:'sm79', skill:'grammar', question:'This is _____ interesting book I\'ve ever read.', options:['more','the most','a most','most'], answer:1, correctFeedback:'ถูกต้อง! the most interesting (superlative)', wrongFeedback:'I\'ve ever read → superlative: the most + adj', keyword:'the most + adj = superlative (เปรียบกับทุกสิ่ง)' },
  { id:'sm80', skill:'grammar', question:'She _____ finish her project by tomorrow.', options:['must to','have to','must','musts'], answer:2, correctFeedback:'ถูกต้อง! must + base verb (ไม่ต้องมี to)', wrongFeedback:'must + base verb (ไม่เติม to หลัง must)', keyword:'must + base verb (ไม่มี to)' },
];

// ═══════════════════════════════════════════════
//  FULL MOCK POOL  (100 ข้อ — คละทุกทักษะ)
// ═══════════════════════════════════════════════
// Draw from miniMockPool + speedMockPool + skillMixedPool + additional 30 unique questions
const fullMockAdditional = [
  { id:'fm01', skill:'signs', question:'Sign: "Trespassers will be prosecuted."\nป้ายนี้เตือนอะไร?', options:['ห้ามถ่ายรูป','บุกรุกจะถูกดำเนินคดี','ระวังสุนัข','ทรัพย์สินมีค่า'], answer:1, correctFeedback:'ถูกต้อง! Trespassers = ผู้บุกรุก, prosecuted = ถูกดำเนินคดี', wrongFeedback:'Trespass = บุกรุก | prosecuted = ดำเนินคดี', keyword:'Trespassers = ผู้บุกรุก' },
  { id:'fm02', skill:'grammar', question:'If I _____ rich, I would travel the world.', options:['am','was','were','be'], answer:2, correctFeedback:'ถูกต้อง! If I were (second conditional - สมมติ)', wrongFeedback:'สมมติปัจจุบัน: If + were → would + base', keyword:'If I were... (2nd conditional)' },
  { id:'fm03', skill:'conversation', question:'A: "Do you have this shirt in a larger size?"\nB: "Let me check for you.""\nA ต้องการอะไร?', options:['เสื้อสีอื่น','เสื้อไซส์ใหญ่กว่า','ราคาถูกกว่า','ของขวัญ'], answer:1, correctFeedback:'ถูกต้อง! larger size = ไซส์ที่ใหญ่กว่า', wrongFeedback:'larger size = ขนาดที่ใหญ่กว่า', keyword:'larger size = ไซส์ใหญ่กว่า' },
  { id:'fm04', skill:'reading', question:'Text: "There were 30 students at the beginning of the year. Five moved away, and three new students joined. How many students are there now?"\nมีนักเรียนกี่คนตอนนี้?', options:['25 คน','28 คน','32 คน','35 คน'], answer:1, correctFeedback:'ถูกต้อง! 30 - 5 + 3 = 28 คน', wrongFeedback:'30 - 5 (ย้ายออก) + 3 (เข้าใหม่) = 28 คน', keyword:'30 - 5 + 3 = 28' },
  { id:'fm05', skill:'grammar', question:'The news _____ very surprising.', options:['were','are','was','am'], answer:2, correctFeedback:'ถูกต้อง! The news = singular (ใช้ was)', wrongFeedback:'news = คำนามเอกพจน์เสมอ → was', keyword:'news = singular (was)' },
  { id:'fm06', skill:'signs', question:'Instruction: "In case of fire, do not use the elevator."\nควรทำอะไรเมื่อเกิดเพลิงไหม้?', options:['ใช้ลิฟต์ลงให้เร็ว','อย่าใช้ลิฟต์','กดปุ่มฉุกเฉินในลิฟต์','รอลิฟต์ที่ชั้น 1'], answer:1, correctFeedback:'ถูกต้อง! do not use the elevator = ห้ามใช้ลิฟต์', wrongFeedback:'In case of fire = เมื่อเกิดไฟไหม้ → ห้ามใช้ลิฟต์', keyword:'In case of fire = เมื่อเกิดไฟไหม้' },
  { id:'fm07', skill:'reading', question:'Ad: "Learn to swim! Classes for all ages. Beginners to advanced. Register at the front desk."\nหลักสูตรนี้เหมาะกับใคร?', options:['เฉพาะเด็ก','เฉพาะผู้ใหญ่','ทุกช่วงอายุและระดับ','เฉพาะนักว่ายน้ำระดับสูง'], answer:2, correctFeedback:'ถูกต้อง! all ages + beginners to advanced = ทุกอายุและระดับ', wrongFeedback:'all ages = ทุกวัย | beginners to advanced = ทุกระดับ', keyword:'all ages = ทุกวัย | beginners to advanced = ทุกระดับ' },
  { id:'fm08', skill:'grammar', question:'She _____ him before the meeting started.', options:['calls','called','has called','was calling'], answer:1, correctFeedback:'ถูกต้อง! called (past simple)', wrongFeedback:'before the meeting started → past → called', keyword:'before + past event → past simple' },
  { id:'fm09', skill:'conversation', question:'A: "I\'m thinking of going to Japan next year."\nB: "_____ That sounds amazing!"', options:['Oh really?','I\'m tired.','Not at all.','Go away.'], answer:0, correctFeedback:'ถูกต้อง! Oh really? = จริงเหรอ? (แสดงความสนใจ)', wrongFeedback:'ตอบรับข้อมูล → Oh really? That sounds amazing!', keyword:'Oh really? = จริงเหรอ? (สนใจ)' },
  { id:'fm10', skill:'reading', question:'Menu: "Today\'s Special: Grilled salmon with vegetables — 180 baht. Served until 3 pm."\nเมนูพิเศษวันนี้ราคาเท่าไหร่?', options:['80 บาท','100 บาท','150 บาท','180 บาท'], answer:3, correctFeedback:'ถูกต้อง! Today\'s Special = 180 baht', wrongFeedback:'grilled salmon... 180 baht', keyword:'Today\'s Special = เมนูพิเศษประจำวัน' },
  { id:'fm11', skill:'grammar', question:'_____ long has she lived here?', options:['What','Where','How','When'], answer:2, correctFeedback:'ถูกต้อง! How long = นานแค่ไหน', wrongFeedback:'How long = ถามระยะเวลา', keyword:'How long = นานแค่ไหน?' },
  { id:'fm12', skill:'signs', question:'Sign on door: "Pull"\nควรทำอย่างไรกับประตู?', options:['ผลัก','ดึง','เลื่อน','หมุน'], answer:1, correctFeedback:'ถูกต้อง! Pull = ดึง', wrongFeedback:'Pull = ดึง | Push = ผลัก', keyword:'Pull = ดึง | Push = ผลัก' },
  { id:'fm13', skill:'reading', question:'Text: "The competition is open to students aged 10-15. Entries must be submitted by email before April 30."\nอะไรคือกำหนดส่งผลงาน?', options:['30 มีนาคม','30 เมษายน','อายุ 10-15 ปี','ส่งทางไปรษณีย์'], answer:1, correctFeedback:'ถูกต้อง! before April 30 = ก่อน 30 เมษายน', wrongFeedback:'before April 30 = ก่อนวันที่ 30 เมษายน', keyword:'April = เมษายน | deadline = วันกำหนดส่ง' },
  { id:'fm14', skill:'grammar', question:'She told me _____ the door.', options:['close','to close','closing','closed'], answer:1, correctFeedback:'ถูกต้อง! told me to close (reported command)', wrongFeedback:'tell sb to do sth = บอกให้ใครทำอะไร', keyword:'tell sb to + base verb' },
  { id:'fm15', skill:'conversation', question:'A: "Could I have a window seat, please?"\nสถานการณ์นี้เกิดขึ้นที่ไหน?', options:['ร้านอาหาร','รถไฟ/เครื่องบิน','ห้องสมุด','โรงเรียน'], answer:1, correctFeedback:'ถูกต้อง! window seat = ที่นั่งริมหน้าต่าง บนรถไฟ/เครื่องบิน', wrongFeedback:'window seat = ที่นั่งริมหน้าต่าง → ใช้บน transport', keyword:'window seat = ที่นั่งริมหน้าต่าง' },
  { id:'fm16', skill:'grammar', question:'She is the _____ student in the class.', options:['more clever','most clever','cleverest','cleverer'], answer:2, correctFeedback:'ถูกต้อง! cleverest (superlative of clever)', wrongFeedback:'clever → cleverest (เอก-เสียงสั้น เติม -est)', keyword:'clever → cleverest (superlative)' },
  { id:'fm17', skill:'signs', question:'Notice: "Caution: Slippery When Wet"\nป้ายเตือนอะไร?', options:['พื้นแตก','พื้นลื่นเมื่อเปียก','ระวังอุปกรณ์','ระวังกระจก'], answer:1, correctFeedback:'ถูกต้อง! Slippery = ลื่น When Wet = เมื่อเปียก', wrongFeedback:'Slippery = ลื่น | When Wet = เมื่อเปียก', keyword:'Slippery When Wet = ลื่นเมื่อเปียก' },
  { id:'fm18', skill:'reading', question:'Text: "Mai gets up at 6 am, eats breakfast at 6:30, and leaves for school at 7 am. School starts at 8 am."\nMai มีเวลาเดินทางกี่ชั่วโมง?', options:['30 นาที','45 นาที','1 ชั่วโมง','1 ชั่วโมง 30 นาที'], answer:2, correctFeedback:'ถูกต้อง! ออก 7:00 ถึงโรงเรียน 8:00 = 1 ชั่วโมง', wrongFeedback:'leaves 7am, school starts 8am = 1 hour journey', keyword:'7am to 8am = 1 hour' },
  { id:'fm19', skill:'grammar', question:'The bag _____ I bought yesterday is red.', options:['whom','which','who','where'], answer:1, correctFeedback:'ถูกต้อง! which (relative pronoun สำหรับสิ่งของ)', wrongFeedback:'bag = สิ่งของ → which (ไม่ใช่ who)', keyword:'which = ที่ (สำหรับสิ่งของ)' },
  { id:'fm20', skill:'conversation', question:'Tour guide: "Please stay together and don\'t wander off."\nไกด์ต้องการอะไร?', options:['ให้นักท่องเที่ยวเดินเองได้','ให้ทุกคนอยู่ด้วยกัน','ให้รอที่นี่','ให้ถ่ายรูป'], answer:1, correctFeedback:'ถูกต้อง! stay together = อยู่ด้วยกัน don\'t wander off = อย่าเดินออกไปคนเดียว', wrongFeedback:'stay together = อยู่รวมกัน | don\'t wander off = อย่าออกไป', keyword:'stay together = อยู่ด้วยกัน' },
  { id:'fm21', skill:'grammar', question:'_____ of the two sisters is taller.', options:['Both','Neither','None','Which'], answer:1, correctFeedback:'ถูกต้อง! Neither = ไม่มีใครสักคน (ใน 2 คน)', wrongFeedback:'Neither of the two = ไม่มีใครใน 2 คน', keyword:'Neither of the two = ไม่มีใครสักคนใน 2 คน' },
  { id:'fm22', skill:'reading', question:'Timetable: Train A departs 08:15, arrives 11:45. Train B departs 09:00, arrives 12:00.\nTrain A ใช้เวลาเดินทางนานแค่ไหน?', options:['2 ชั่วโมง 30 นาที','3 ชั่วโมง','3 ชั่วโมง 30 นาที','4 ชั่วโมง'], answer:2, correctFeedback:'ถูกต้อง! 08:15 ถึง 11:45 = 3 ชั่วโมง 30 นาที', wrongFeedback:'11:45 - 08:15 = 3 ชั่วโมง 30 นาที', keyword:'11:45 - 8:15 = 3h 30min' },
  { id:'fm23', skill:'signs', question:'Instruction: "Press the green button to start, red button to stop."\nต้องกดปุ่มใดเพื่อหยุดเครื่อง?', options:['ปุ่มเขียว','ปุ่มแดง','ปุ่มเหลือง','ปุ่มน้ำเงิน'], answer:1, correctFeedback:'ถูกต้อง! red button = หยุด', wrongFeedback:'green = เริ่ม | red = หยุด', keyword:'red button = หยุด (stop)' },
  { id:'fm24', skill:'grammar', question:'He has been playing the piano _____ he was five.', options:['since','for','when','until'], answer:0, correctFeedback:'ถูกต้อง! since he was five = ตั้งแต่อายุ 5 ขวบ', wrongFeedback:'since + จุดเวลาที่เจาะจง (เขาอายุ 5)', keyword:'since + specific time = ตั้งแต่...' },
  { id:'fm25', skill:'conversation', question:'A: "I\'m going to visit my grandmother this weekend."\nB: "_____ Give her my regards."', options:['That\'s nice!','How scary!','That\'s too bad.','I\'m sorry.'], answer:0, correctFeedback:'ถูกต้อง! That\'s nice! = ดีจัง', wrongFeedback:'ข่าวดี → That\'s nice! + Give her my regards = ฝากความระลึกถึงด้วย', keyword:'That\'s nice! = ดีจัง' },
  { id:'fm26', skill:'grammar', question:'The higher you climb, _____ it gets.', options:['the cold','the more cold','colder','the colder'], answer:3, correctFeedback:'ถูกต้อง! the higher... the colder (parallel comparison)', wrongFeedback:'The + comparative... the + comparative = ยิ่ง...ยิ่ง...', keyword:'the + comparative, the + comparative' },
  { id:'fm27', skill:'reading', question:'Email: "I am sorry to inform you that the flight has been cancelled due to bad weather. Please contact us to reschedule."\nเหตุใดที่เที่ยวบินถูกยกเลิก?', options:['เครื่องบินเสีย','สนามบินปิด','สภาพอากาศไม่ดี','ขาดผู้โดยสาร'], answer:2, correctFeedback:'ถูกต้อง! due to bad weather = เพราะสภาพอากาศไม่ดี', wrongFeedback:'due to = เนื่องมาจาก | bad weather = อากาศไม่ดี', keyword:'due to bad weather = เนื่องจากสภาพอากาศ' },
  { id:'fm28', skill:'grammar', question:'She _____ to the dentist last month.', options:['go','goes','gone','went'], answer:3, correctFeedback:'ถูกต้อง! went (past tense of go)', wrongFeedback:'last month → past tense: go → went', keyword:'go → went (irregular past)' },
  { id:'fm29', skill:'signs', question:'Label: "Refrigerate After Opening"\nต้องทำอะไรหลังเปิดผลิตภัณฑ์?', options:['เก็บที่อุณหภูมิห้อง','แช่ตู้เย็น','แช่แข็ง','ทิ้งภายใน 1 วัน'], answer:1, correctFeedback:'ถูกต้อง! Refrigerate = แช่ตู้เย็น After Opening = หลังเปิด', wrongFeedback:'Refrigerate = แช่เย็น | After Opening = หลังเปิด', keyword:'Refrigerate = แช่ตู้เย็น' },
  { id:'fm30', skill:'reading', question:'Text: "You need 2 cups of flour, 1 cup of sugar, 3 eggs, and half a cup of butter to make this cake."\nต้องใช้ไข่กี่ฟองในสูตรนี้?', options:['1 ฟอง','2 ฟอง','3 ฟอง','4 ฟอง'], answer:2, correctFeedback:'ถูกต้อง! 3 eggs = ไข่ 3 ฟอง', wrongFeedback:'3 eggs = ไข่ 3 ฟอง', keyword:'3 eggs = ไข่ 3 ฟอง' },
];

export const fullMockPool = [
  ...miniMockPool.slice(0, 25),
  ...speedMockPool.slice(0, 25),
  ...skillMixedPool.slice(0, 20),
  ...fullMockAdditional,
];

// ═══════════════════════════════════════════════
//  FINAL EXAM SIMULATION POOL  (100 ข้อ — ยากขึ้น O-NET style)
// ═══════════════════════════════════════════════
export const finalSimPool = [
  // Reading Comprehension passages (harder)
  { id:'fs01', skill:'reading', question:'Passage: "Solar energy is produced by converting sunlight into electricity using solar panels. It is a clean, renewable energy source that does not produce greenhouse gases."\nข้อใดถูกต้องเกี่ยวกับพลังงานแสงอาทิตย์?', options:['ผลิตก๊าซเรือนกระจก','ใช้แล้วหมดไป','สะอาดและหมุนเวียนได้','ต้องใช้น้ำในการผลิต'], answer:2, correctFeedback:'ถูกต้อง! clean, renewable = สะอาดและหมุนเวียนได้', wrongFeedback:'clean = สะอาด | renewable = หมุนเวียนได้ | does not produce greenhouse gases = ไม่ก่อก๊าซเรือนกระจก', keyword:'renewable energy = พลังงานหมุนเวียน' },
  { id:'fs02', skill:'reading', question:'Passage: "The museum is open Tuesday to Sunday. On weekdays, it closes at 5 pm. On weekends, it stays open until 8 pm. Admission is free on the first Monday of each month — but it is closed on other Mondays."\nวันใดที่เข้าชมฟรี?', options:['ทุกวันจันทร์','วันจันทร์แรกของเดือน','ทุกวันหยุดสุดสัปดาห์','ทุกวันอาทิตย์'], answer:1, correctFeedback:'ถูกต้อง! free on the first Monday of each month', wrongFeedback:'first Monday = วันจันทร์แรกของเดือน | free = ฟรี', keyword:'first Monday of each month = วันจันทร์แรกของเดือน' },
  { id:'fs03', skill:'reading', question:'Passage: "Lek and Pim are best friends. Lek likes reading, while Pim prefers drawing. However, both of them enjoy playing badminton after school."\nLek และ Pim ทำกิจกรรมใดด้วยกัน?', options:['อ่านหนังสือ','วาดรูป','เล่นแบดมินตัน','ดูทีวี'], answer:2, correctFeedback:'ถูกต้อง! both enjoy playing badminton = ทั้งคู่ชอบเล่นแบดมินตัน', wrongFeedback:'both of them enjoy = ทั้งคู่ชอบ → badminton', keyword:'both = ทั้งคู่ | enjoy = ชอบ' },
  { id:'fs04', skill:'grammar', question:'The teacher, _____ has been teaching for 20 years, is retiring next month.', options:['who','which','that','whose'], answer:0, correctFeedback:'ถูกต้อง! who (relative pronoun for person, non-defining)', wrongFeedback:'teacher = คน → who | comma = non-defining relative clause', keyword:'who = ผู้ที่ (สำหรับคน)' },
  { id:'fs05', skill:'signs', question:'Airline boarding pass notice: "Boarding closes 15 minutes before departure."\nถ้าเครื่องบินออก 14:00 ต้องขึ้นเครื่องภายในเวลาใด?', options:['13:30','13:45','14:00','14:15'], answer:1, correctFeedback:'ถูกต้อง! 14:00 - 15 min = 13:45', wrongFeedback:'15 minutes before 14:00 = 13:45', keyword:'15 minutes before = ก่อน 15 นาที' },
  { id:'fs06', skill:'reading', question:'Advertisement: "Join our cooking class! Every Saturday, 10am-1pm. Maximum 8 students per class. Cost: 800 baht per session. Includes all ingredients."\nค่าใช้จ่ายรวมอะไรบ้าง?', options:['เฉพาะค่าสอน','ค่าสอนและวัตถุดิบ','เฉพาะวัตถุดิบ','ค่าสอนและอุปกรณ์'], answer:1, correctFeedback:'ถูกต้อง! Includes all ingredients = รวมวัตถุดิบทั้งหมด', wrongFeedback:'includes all ingredients = รวมวัตถุดิบ (ingredients) ทั้งหมด', keyword:'includes = รวม/ครอบคลุม' },
  { id:'fs07', skill:'grammar', question:'Not only _____ she speak Thai, but she also speaks English fluently.', options:['does','is','did','has'], answer:0, correctFeedback:'ถูกต้อง! Not only does she (inversion after Not only)', wrongFeedback:'Not only + does/is/has (auxiliary) + subject = inversion', keyword:'Not only does... but also... (inversion)' },
  { id:'fs08', skill:'conversation', question:'A: "I\'d like to return this blouse. It\'s the wrong size."\nB: "Do you have the receipt?"\nA: "Yes, here it is."\nB: "_____"\nB น่าจะพูดอะไรต่อไป?', options:['Thank you for shopping here.','Would you like to exchange it or get a refund?','Sorry, we don\'t accept returns.','The store is closed.'], answer:1, correctFeedback:'ถูกต้อง! ถามว่าต้องการเปลี่ยนหรือคืนเงิน', wrongFeedback:'คืนสินค้า → พนักงานถามว่า exchange (เปลี่ยน) หรือ refund (คืนเงิน)', keyword:'exchange = เปลี่ยน | refund = คืนเงิน' },
  { id:'fs09', skill:'reading', question:'Chart: Class test scores — Min: 45, Max: 95, Average: 72, Mode: 80\nคะแนนที่นักเรียนได้มากที่สุดคือเท่าไหร่?', options:['45','72','80','95'], answer:2, correctFeedback:'ถูกต้อง! Mode = 80 = คะแนนที่พบมากที่สุด', wrongFeedback:'Mode = ฐานนิยม = ค่าที่พบบ่อยที่สุด = 80', keyword:'Mode = ฐานนิยม (พบบ่อยที่สุด)' },
  { id:'fs10', skill:'grammar', question:'By the time the ambulance arrived, the patient _____ for help for over an hour.', options:['waited','has waited','was waiting','had been waiting'], answer:3, correctFeedback:'ถูกต้อง! had been waiting (Past Perfect Continuous)', wrongFeedback:'By the time + past → had been + -ing (continuous action in past)', keyword:'had been + -ing = Past Perfect Continuous' },
  { id:'fs11', skill:'signs', question:'Warning on medicine bottle: "Do not exceed recommended dose. If symptoms persist, consult a doctor."\nควรทำอะไรถ้าอาการไม่ดีขึ้น?', options:['กินยาเพิ่ม','หยุดกินยา','ปรึกษาแพทย์','ซื้อยาอื่น'], answer:2, correctFeedback:'ถูกต้อง! consult a doctor = ปรึกษาแพทย์', wrongFeedback:'If symptoms persist = ถ้าอาการยังอยู่ → consult a doctor = ปรึกษาแพทย์', keyword:'consult a doctor = ปรึกษาแพทย์' },
  { id:'fs12', skill:'reading', question:'Passage: "Children learn best when they are happy and relaxed. Stress can block the memory process. Good sleep, exercise, and fun activities improve learning outcomes."\nอะไรทำให้การเรียนรู้ดีขึ้น?', options:['การเรียนหนักตลอดเวลา','ความเครียด','การนอนหลับ ออกกำลังกาย กิจกรรมสนุก','การอ่านหนังสือเพียงอย่างเดียว'], answer:2, correctFeedback:'ถูกต้อง! Good sleep, exercise, and fun activities', wrongFeedback:'Good sleep + exercise + fun activities improve learning', keyword:'improve learning = ช่วยการเรียนรู้' },
  { id:'fs13', skill:'grammar', question:'The students _____ the exam for two hours when the teacher collected the papers.', options:['were taking','had been taking','took','have been taking'], answer:1, correctFeedback:'ถูกต้อง! had been taking (Past Perfect Continuous)', wrongFeedback:'when the teacher collected → past → had been taking', keyword:'had been + -ing (Past Perfect Continuous)' },
  { id:'fs14', skill:'conversation', question:'Travel agent: "The tour includes meals, accommodation, and transport."\nCustomer: "_____ Does it include travel insurance?"', options:['That sounds great.','I\'m not interested.','It\'s too expensive.','No, thanks.'], answer:0, correctFeedback:'ถูกต้อง! That sounds great. = ฟังดูดีมาก', wrongFeedback:'ฟังข้อมูลที่ดี → แสดงความสนใจ: That sounds great!', keyword:'That sounds great = ฟังดูดีมาก' },
  { id:'fs15', itemVersion:'fs15-key-v2', skill:'reading', question:'Text: "Jim scored 85 on maths, 78 on science, 91 on English, and 70 on Thai. What is his average score?"\nคะแนนเฉลี่ยของ Jim คือเท่าใด?', options:['80','81','82','83'], answer:1, correctFeedback:'ถูกต้อง! (85+78+91+70) ÷ 4 = 324 ÷ 4 = 81', wrongFeedback:'(85+78+91+70) = 324 ÷ 4 = 81 = คะแนนเฉลี่ย', keyword:'average = ค่าเฉลี่ย = ผลรวม÷จำนวน', sourceCheck: { kind:'arithmetic_key_correction', reviewer:'Codex', date:'2026-10-13', expression:'(85+78+91+70)/4', result:81 } },
  { id:'fs16', skill:'grammar', question:'I\'d rather _____ at home than go to the party.', options:['staying','stayed','stay','to stay'], answer:2, correctFeedback:'ถูกต้อง! I\'d rather + base verb', wrongFeedback:'I\'d rather = I would rather + base verb (ไม่มี to)', keyword:'I\'d rather + base verb (ไม่มี to)' },
  { id:'fs17', skill:'signs', question:'Notice on a product: "Return within 30 days for full refund. Item must be unused and in original packaging."\nเงื่อนไขการคืนเงินเต็มจำนวนคือ?', options:['คืนภายใน 30 วัน ไม่ใช้ บรรจุภัณฑ์เดิม','คืนภายใน 30 วันเท่านั้น','สินค้าไม่ใช้','บรรจุภัณฑ์เดิม'], answer:0, correctFeedback:'ถูกต้อง! ครบทั้ง 3 เงื่อนไข: 30 วัน + ไม่ใช้ + บรรจุภัณฑ์เดิม', wrongFeedback:'ต้องครบทุกเงื่อนไข: 30 days + unused + original packaging', keyword:'full refund conditions = ครบทุกเงื่อนไข' },
  { id:'fs18', skill:'reading', question:'Passage: "Robots are increasingly used in factories. They work faster than humans, do not need breaks, and make fewer mistakes. However, they cannot replace the creativity and decision-making skills of people."\nข้อใดที่หุ่นยนต์ทำไม่ได้?', options:['ทำงานเร็ว','ทำงานไม่หยุด','ตัดสินใจสร้างสรรค์','ทำงานแม่นยำ'], answer:2, correctFeedback:'ถูกต้อง! cannot replace creativity and decision-making = ไม่มีความคิดสร้างสรรค์', wrongFeedback:'cannot replace creativity and decision-making of people', keyword:'creativity = ความคิดสร้างสรรค์' },
  { id:'fs19', skill:'grammar', question:'She suggested _____ to the new restaurant for dinner.', options:['go','to go','going','gone'], answer:2, correctFeedback:'ถูกต้อง! suggested + verb-ing', wrongFeedback:'suggest + verb-ing (gerund)', keyword:'suggest + verb-ing' },
  { id:'fs20', skill:'signs', question:'Notice at a library: "Overdue books: 5 baht per day per book."\nถ้าคืนหนังสือสาย 3 วัน ต้องเสียค่าปรับเท่าไหร่?', options:['5 บาท','10 บาท','15 บาท','20 บาท'], answer:2, correctFeedback:'ถูกต้อง! 5 baht × 3 days = 15 baht', wrongFeedback:'5 baht per day × 3 days = 15 baht', keyword:'overdue fine = ค่าปรับหนังสือเกินกำหนด' },
  // Additional 80 questions mix
  ...miniMockPool.slice(25, 40),
  ...speedMockPool.slice(30, 50),
  ...skillMixedPool.slice(40, 60),
  ...fullMockAdditional.slice(0, 15),
];

// Pool สำหรับ Weakness Mock — แยกตาม skill
export const weaknessMockBySkill = {
  signs: [...miniMockPool.filter(q=>q.skill==='signs'), ...speedMockPool.filter(q=>q.skill==='signs'), ...skillMixedPool.filter(q=>q.skill==='signs')],
  conversation: [...miniMockPool.filter(q=>q.skill==='conversation'), ...skillMixedPool.filter(q=>q.skill==='conversation')],
  directions: [...miniMockPool.filter(q=>q.skill==='directions')],
  reading: [...miniMockPool.filter(q=>q.skill==='reading'), ...skillMixedPool.filter(q=>q.skill==='reading')],
  grammar: [...miniMockPool.filter(q=>q.skill==='grammar'), ...speedMockPool.filter(q=>q.skill==='grammar'), ...skillMixedPool.filter(q=>q.skill==='grammar')],
  food: [...miniMockPool.filter(q=>q.skill==='food')],
  classroom: [...miniMockPool.filter(q=>q.skill==='classroom')],
  question_words: [...miniMockPool.filter(q=>q.skill==='question_words')],
  vocabulary: [...speedMockPool.filter(q=>q.skill==='vocabulary')],
};

// ═══════════════════════════════════════════════
//  FINAL EXAM POOL GENERATOR (50 ข้อ 100 คะแนน)
//  สุ่มครอบคลุมทุกหัวข้อ (Stratified Sampling)
// ═══════════════════════════════════════════════

import { isSingleStepMcq } from '../utils/questionFormat';

function shuffleArray(arr) {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

/**
 * Returns a randomized pool of 50 unique questions sampled across all topics.
 * Covers: grammar(10), reading(10), conversation(8), signs(8), vocabulary(5),
 * directions(3), food(2), classroom(2), question_words(2) = exactly 50 questions!
 */
export function getFinalExamPool(targetCount = 50) {
  const allUnique = [];
  const seen = new Set();

  function addQuestions(arr) {
    if (!Array.isArray(arr)) return;
    for (const q of arr) {
      if (!q || !q.question) continue;
      if (!isSingleStepMcq(q) || ['pending_teacher', 'rejected', 'quarantined'].includes(q.reviewStatus)) continue;
      if (Array.isArray(q.approvedModes) && !q.approvedModes.includes('school_final_50')) continue;
      const inspection = inspectQuestionMedia(q);
      if (inspection.blocked || inspection.status === 'present_unverified') continue;
      const key = q.question.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        allUnique.push(q);
      }
    }
  }

  addQuestions(finalSimPool);
  addQuestions(fullMockPool);
  addQuestions(miniMockPool);
  addQuestions(skillMixedPool);
  addQuestions(speedMockPool);
  addQuestions(cultureQuestions);

    // Add all questions from the main QUESTS array
    QUESTS.forEach(questGroup => {
      let mappedSkill = questGroup.id;
      // Map quest categories to final exam skills
      if (['about_myself', 'family', 'school', 'food', 'weather_seasons', 'illness'].includes(questGroup.id)) mappedSkill = 'vocabulary';
      if (['directions'].includes(questGroup.id)) mappedSkill = 'directions';
      if (['conversation', 'conversation_rescue', 'emotions_feelings'].includes(questGroup.id)) mappedSkill = 'conversation';
      if (['signs', 'sign_detective'].includes(questGroup.id)) mappedSkill = 'signs';
      if (['grammar', 'tenses_boss'].includes(questGroup.id)) mappedSkill = 'grammar';
      if (['reading', 'reading_detective', 'finalboss'].includes(questGroup.id)) mappedSkill = 'reading';
      if (['question_words', 'yes_no'].includes(questGroup.id)) mappedSkill = 'question_words';

      questGroup.questions.forEach(q => {
        const qCopy = { ...q, skill: mappedSkill };
        addQuestions([qCopy]);
      });
    });

  if (weaknessMockBySkill) {
    Object.values(weaknessMockBySkill).forEach(addQuestions);
  }

  // Group by skill
  const bySkill = {};
  allUnique.forEach(q => {
    const s = q.skill || 'general';
    if (!bySkill[s]) bySkill[s] = [];
    bySkill[s].push(q);
  });

  // Balanced quota for 50 questions across all 9 skills
  const quota = {
    grammar: 10,
    reading: 10,
    conversation: 8,
    signs: 8,
    vocabulary: 5,
    directions: 3,
    food: 2,
    classroom: 2,
    question_words: 2,
  };

  let selected = [];
  const selectedKeys = new Set();

  for (const [skill, count] of Object.entries(quota)) {
    const pool = shuffleArray(bySkill[skill] || []);
    const picked = pool.slice(0, count);
    picked.forEach(q => {
      selected.push(q);
      selectedKeys.add(q.question.trim().toLowerCase());
    });
  }

  // If still below targetCount, fill with remaining unique questions
  if (selected.length < targetCount) {
    const remaining = shuffleArray(
      allUnique.filter(q => !selectedKeys.has(q.question.trim().toLowerCase()))
    );
    selected = selected.concat(remaining.slice(0, targetCount - selected.length));
  }

  return shuffleArray(selected.slice(0, targetCount));
}


/**
 * Returns a 32-question O-NET Full Simulation pool for a specific year (2566, 2567, 2568).
 * Balanced across 4 main O-NET domains:
 * - Conversation & Situations: 8 questions
 * - Signs, Notices & Directions: 8 questions
 * - Reading Comprehension: 8 questions
 * - Grammar, Vocabulary & Language Use: 8 questions
 * Total: 32 questions (60 minutes, 100 points)
 */
export function getOnetYearSimulationPool(year = 2566) {
  const y = Number(year);
  if (y === 2565 || y === 2566 || y === 2567) {
    return getOnetRealYearPool(y);
  }
  const allUnique = [];
  const seen = new Set();

  function addQuestions(arr) {
    if (!Array.isArray(arr)) return;
    for (const q of arr) {
      if (!q || !q.question) continue;
      if (!isSingleStepMcq(q) || !isPracticeQuestionReady(q)) continue;
      const key = q.question.trim().toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        allUnique.push(q);
      }
    }
  }

  addQuestions(finalSimPool);
  addQuestions(fullMockPool);
  addQuestions(miniMockPool);
  addQuestions(skillMixedPool);
  addQuestions(speedMockPool);
  addQuestions(cultureQuestions);

  QUESTS.forEach(questGroup => {
    let mappedSkill = questGroup.id;
    if (['about_myself', 'family', 'school', 'food', 'weather_seasons', 'illness'].includes(questGroup.id)) mappedSkill = 'vocabulary';
    if (['directions'].includes(questGroup.id)) mappedSkill = 'directions';
    if (['conversation', 'conversation_rescue', 'emotions_feelings'].includes(questGroup.id)) mappedSkill = 'conversation';
    if (['signs', 'sign_detective'].includes(questGroup.id)) mappedSkill = 'signs';
    if (['grammar', 'tenses_boss'].includes(questGroup.id)) mappedSkill = 'grammar';
    if (['reading', 'reading_detective', 'finalboss'].includes(questGroup.id)) mappedSkill = 'reading';
    if (['question_words', 'yes_no'].includes(questGroup.id)) mappedSkill = 'question_words';

    questGroup.questions.forEach(q => {
      addQuestions([{ ...q, skill: mappedSkill }]);
    });
  });

  if (weaknessMockBySkill) {
    Object.values(weaknessMockBySkill).forEach(addQuestions);
  }

  const byDomain = {
    conversation: allUnique.filter(q => ['conversation', 'conversation_rescue', 'emotions_feelings'].includes(q.skill)),
    signs: allUnique.filter(q => ['signs', 'sign_detective', 'directions'].includes(q.skill)),
    reading: allUnique.filter(q => ['reading', 'reading_detective', 'finalboss'].includes(q.skill)),
    grammar: allUnique.filter(q => ['grammar', 'tenses_boss', 'vocabulary', 'question_words', 'yes_no'].includes(q.skill)),
  };

  const seedOffset = (Number(year) - 2566) * 7;
  const quota = { conversation: 8, signs: 8, reading: 8, grammar: 8 };
  let selected = [];
  const selectedKeys = new Set();

  for (const [domain, count] of Object.entries(quota)) {
    const list = byDomain[domain] || [];
    const len = Math.max(1, list.length);
    const start = seedOffset % len;
    const rotated = list.slice(start).concat(list.slice(0, start));
    const pool = shuffleArray(rotated);
    for (const q of pool) {
      const key = q.question.trim().toLowerCase();
      if (!selectedKeys.has(key)) {
        selectedKeys.add(key);
        selected.push(q);
        if (selected.filter(item => (byDomain[domain] || []).includes(item)).length >= count) break;
      }
    }
  }

  // If still below 32, fill unique questions
  if (selected.length < 32) {
    const remaining = shuffleArray(allUnique.filter(q => !selectedKeys.has(q.question.trim().toLowerCase())));
    selected = selected.concat(remaining.slice(0, 32 - selected.length));
  }

  return shuffleArray(selected.slice(0, 32));
}

export const onetYear2565Pool = getOnetYearSimulationPool(2565);
export const onetYear2566Pool = getOnetYearSimulationPool(2566);
export const onetYear2567Pool = getOnetYearSimulationPool(2567);
export const onetYear2568Pool = getOnetYearSimulationPool(2568);
