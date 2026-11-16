import { scenarios } from './conversationPractice.js';

function make(id, topic, context, line, hint, correct, wrong1, wrong2, explanation) {
  const options = [
    { id: 'a', text: wrong1, explanation: 'ตัวเลือกนี้ไม่ตรงกับบริบท ลองอ่านสถานการณ์และคำใบ้อีกครั้ง' },
    { id: 'b', text: correct, correct: true, explanation },
    { id: 'c', text: wrong2, explanation: 'ตัวเลือกนี้ไม่ตรงกับบริบท ลองอ่านสถานการณ์และคำใบ้อีกครั้ง' },
  ];
  const offset = [...id].reduce ( (sum, char) => sum + char.charCodeAt(0), 0) % options.length;
  return { id, topic, context, line, hint, options: [...options.slice(offset), ...options.slice(0, offset)] };
}

const c = (i) => scenarios[i];
export const practiceBanks = {
  part1: [c(2), c(0), c(3),
    make('p1-help','ขอความช่วยเหลือ','คุณกำลังหาร้านหนังสือและต้องการความช่วยเหลือ','Can I help you?','ตอบรับและบอกสิ่งที่กำลังหา',"Yes, please. I'm looking for a bookshop.",'Goodbye.','No, thank you.','ตอบรับความช่วยเหลือและบอกสิ่งที่กำลังหา'),
    c(4),
    make('p1-permission','ขออนุญาต','ครูอนุญาตให้นักเรียนออกไปได้','May I go out, please?','เลือกคำตอบที่อนุญาต','Yes, you may.','No, you may not.','Thank you.','Yes, you may. เป็นการอนุญาต'),
    make('p1-meet','พบกันครั้งแรก','คุณพบเพื่อนใหม่และต้องการตอบรับคำทักทาย','Nice to meet you.','เลือกคำทักทายตอบ','Nice to meet you, too.','Good night.','I am sorry.','ใช้ตอบรับเมื่อรู้จักกันครั้งแรกได้'),
    make('p1-goodbye','กล่าวลา','เพื่อนกำลังกลับบ้านและบอกลา','Goodbye!','เลือกคำกล่าวลาตอบ','See you!','Yes, please.','How old are you?','See you! ใช้กล่าวลาได้'),
  ],
  part2: [
    make('p2-no','ป้ายห้าม','ป้ายบอกกฎบริเวณนี้','NO PARKING','No แสดงข้อห้าม','ห้ามจอดรถ','จอดรถฟรี','ทางออก','No parking หมายถึงห้ามจอดรถ'),
    make('p2-free','ฟรี','ร้านติดป้ายบริการ','FREE WIFI','Free หมายถึงไม่เสียค่าใช้จ่าย','ใช้ Wi-Fi ฟรี','ห้ามใช้ Wi-Fi','ต้องจ่ายค่า Wi-Fi','Free Wi-Fi หมายถึงมี Wi-Fi ให้ใช้ฟรี'),
    make('p2-only','เฉพาะ','หน้าห้องมีป้าย','STAFF ONLY','Only จำกัดกลุ่มผู้เข้าใช้','เฉพาะพนักงาน','ทุกคนเข้าได้','ปิดทุกวัน','Staff only จำกัดพื้นที่ให้พนักงาน'),
    make('p2-closed','วันทำการ','ต้องการไปห้องสมุดวันอาทิตย์','CLOSED ON SUNDAYS','Closed หมายถึงปิด','ห้องสมุดปิดวันอาทิตย์','ห้องสมุดเปิดเฉพาะวันอาทิตย์','เปิดทุกวัน','ป้ายบอกว่าปิดในวันอาทิตย์'),
    make('p2-arrow','ลูกศร','ป้ายนี้ชี้ทางเข้า','ENTRANCE →','ลูกศรชี้ไปทางใด','ทางเข้าอยู่ทางขวา','ทางเข้าอยู่ทางซ้าย','ห้ามเข้า','ลูกศรชี้ไปทางขวา'),
  ],
  part3: [
    make('p3-who','Who','อ่านข้อความ แล้วเลือกคำตอบ','Mali is the class leader. Who is the class leader?','Who ถามบุคคล','Mali','The classroom','Monday','ข้อความบอกว่า Mali เป็นหัวหน้าห้อง'),
    make('p3-where','Where','อ่านข้อความ แล้วเลือกสถานที่','Ben reads in the library. Where does Ben read?','Where ถามสถานที่','In the library','Ben','On Monday','ข้อความระบุสถานที่ว่า in the library'),
    make('p3-when','When','อ่านข้อความ แล้วเลือกเวลา','The class starts at nine. When does the class start?','When ถามเวลา','At nine','In the classroom','The teacher','ข้อความบอกเวลา at nine'),
    make('p3-why','Why','อ่านข้อความ แล้วเลือกเหตุผล','Nina takes an umbrella because it is raining. Why does Nina take an umbrella?','มองหาเหตุผลหลัง because','Because it is raining.','At school.','By bus.','because it is raining ให้เหตุผลว่าฝนกำลังตก'),
    make('p3-how','How','อ่านข้อความ แล้วเลือกวิธีเดินทาง','Tom goes to school by bus. How does Tom go to school?','มองหาวิธีเดินทาง','By bus','At school','Tom','ข้อความบอกว่าเดินทางโดยรถประจำทาง'),
    make('p3-many','How many','อ่านข้อความ แล้วเลือกจำนวน','There are five books on the desk. How many books are there?','How many ถามจำนวน','Five','On the desk','Books','ข้อความระบุจำนวนหนังสือห้าเล่ม'),
    make('p3-main','ใจความสำคัญ','เลือกใจความที่ครอบคลุมข้อความ','Bees visit flowers. They carry pollen between flowers and help plants grow.','คิดว่าทุกประโยคพูดถึงเรื่องใด','Bees help plants.','Bees drive buses.','Flowers are made of paper.','ทั้งสองประโยคกล่าวถึงผึ้งที่ช่วยพืช'),
  ],
  part4: [
    make('p4-past','Past Simple','เติมคำในเหตุการณ์ที่จบไปเมื่อวาน','Yesterday, I ___ to school.','yesterday บอกอดีต','went','go','going','went เป็นรูปอดีตของ go'),
    make('p4-now','Present Continuous','เติมคำสำหรับเหตุการณ์ที่กำลังเกิดขึ้น','She ___ a book right now.','ใช้ is + กริยาเติม ing','is reading','read','reads','is reading ใช้กับเหตุการณ์ที่กำลังเกิดขึ้น'),
    make('p4-future','Future','เติมประโยคเกี่ยวกับพรุ่งนี้','We ___ visit Grandma tomorrow.','หลัง will ใช้กริยารูปพื้นฐาน','will','are','did','will visit กล่าวถึงอนาคตในประโยคนี้'),
    make('p4-present','Present Simple','เลือกคำกริยาสำหรับกิจวัตร','He ___ to school every day.','ประธาน he ใช้กริยาเติม s ในประโยคนี้','walks','walk','walking','He walks ใช้บอกกิจวัตร'),
    make('p4-comparative','เปรียบเทียบขั้นกว่า','เติมคำเปรียบเทียบระหว่างสองสิ่ง','A giraffe is ___ than a goat.','คำว่า than ช่วยบอกการเปรียบเทียบ','taller','tallest','tall','taller than ใช้เปรียบเทียบความสูงระหว่างสองสิ่ง'),
    make('p4-superlative','เปรียบเทียบขั้นสุด','เลือกคำเมื่อเปรียบเทียบในกลุ่ม','Mali is the ___ student in the class.','the ร่วมกับขั้นสุด','tallest','taller','tall','the tallest บอกว่าสูงที่สุดในกลุ่มนี้'),
    make('p4-do','กริยาหลัง did not','เติมกริยาหลัง did not','He did not ___ yesterday.','หลัง did not ใช้กริยารูปพื้นฐาน','play','played','playing','did not ตามด้วย play รูปพื้นฐาน'),
    make('p4-modal','กริยาหลัง can','เติมกริยาหลัง can','Birds can ___.','หลัง can ใช้กริยารูปพื้นฐาน','fly','flies','flying','can ตามด้วย fly รูปพื้นฐาน'),
  ],
  part5: [
    make('p5-connectors','คำบอกลำดับ','เลือกลำดับคำเชื่อม','Which order shows beginning, middle, and end?','เริ่มด้วย First จบด้วย Finally','First → Next → Finally','Finally → First → Next','Next → Finally → First','First เริ่ม Next ดำเนินต่อ Finally จบ'),
    make('p5-ticket','ซื้อตั๋ว','เลือกขั้นตอนที่สมเหตุสมผล','You want to take a bus. What order makes sense?','ซื้อตั๋วก่อนขึ้นรถ','Buy a ticket → Get on the bus','Get on the bus → Buy a ticket','Go home → Buy a ticket','สถานการณ์นี้ซื้อตั๋วก่อนขึ้นรถ'),
    make('p5-cook','ทำอาหาร','เลือกขั้นตอนที่สมเหตุสมผล','What order makes sense when making soup?','เตรียมก่อนปรุง แล้วจึงเสิร์ฟ','Prepare → Cook → Serve','Serve → Prepare → Cook','Cook → Serve → Prepare','เตรียมส่วนผสม ปรุง แล้วเสิร์ฟ'),
    make('p5-daily','กิจวัตร','เลือกขั้นตอนที่สมเหตุสมผล','What order makes sense on a school morning?','ตื่นก่อนแล้วจึงไปโรงเรียน','Wake up → Get dressed → Go to school','Go to school → Wake up → Get dressed','Get dressed → Go to school → Wake up','ตื่นนอน แต่งตัว และไปโรงเรียนเป็นลำดับที่สมเหตุสมผล'),
  ],
  part6: [
    make('p6-according','According to','วิเคราะห์คำสั่งถามข้อเท็จจริงในเรื่อง','According to the story, what did Tom find in the garden?','According to คือข้อมูลตรงตัวจากเนื้อเรื่อง','ค้นหาคีย์เวิร์ดในเรื่อง แล้วตอบตามที่ระบุไว้ตรงๆ','คิดคำตอบจากความเห็นส่วนตัวโดยไม่อิงเนื้อเรื่อง','เลือกคำตอบที่ยาวที่สุดเสมอ','According to the passage สั่งให้ตอบข้อเท็จจริงที่ระบุไว้ในบทอ่านโดยตรง'),
    make('p6-mainly','Mainly about','วิเคราะห์คำสั่งถามใจความสำคัญ','What is this passage mainly about?','Mainly about คือใจความหลักที่ครอบคลุมทั้งเรื่อง','เลือกใจความภาพรวมที่ครอบคลุมทุกย่อหน้า','เลือกประโยคตัวอย่างแรกที่เห็นในบรรทัดแรกทันที','เลือกเรื่องที่น่าตื่นเต้นที่สุดแม้มีแค่ประโยคเดียว','Mainly about ถามหา Main Idea ภาพรวมทั้งเรื่อง ต้องไม่เจาะจงเฉพาะจุดย่อย'),
    make('p6-best-title','Best title','วิเคราะห์คำสั่งตั้งชื่อเรื่อง','What is the best title for this passage?','Best title สรุปใจความหลักเป็นชื่อเรื่อง','ชื่อเรื่องที่ครอบคลุมธีมหลัก ไม่แคบหรือกว้างเกินไป','ชื่อเรื่องที่กล่าวถึงตัวละครรองเพียงตัวเดียว','ชื่อเรื่องที่มีคำศัพท์ยากที่สุด','ชื่อเรื่องที่ดีที่สุดต้องสรุปแก่นของเนื้อหาทั้งหมดได้กระชับและตรงประเด็น'),
    make('p6-purpose','Purpose','วิเคราะห์คำสั่งถามจุดประสงค์ของผู้เขียน','What is the purpose of this announcement?','Purpose คือเจตนาของผู้สื่อสาร เช่น แจ้ง เตือน เชิญชวน','พิจารณาว่าผู้เขียนต้องการให้ผู้อ่านทำอะไร (แจ้ง/เตือน/ชวน)','นับจำนวนบรรทัดของประกาศ','ตอบชื่อผู้พิมพ์เอกสาร','Purpose วัดเจตนาของผู้สื่อสาร เช่น To inform, To warn, To invite'),
    make('p6-not-true','NOT true','วิเคราะห์คำสั่งปฏิเสธ (หาข้อผิด)','Which statement is NOT correct?','วงกลม NOT ทันที! โจทย์ต้องการข้อที่ผิดจากเรื่อง','หาข้อความที่ขัดแย้งกับเนื้อเรื่อง หรือไม่ได้กล่าวถึง','เลือกข้อความที่ถูกต้องตามเรื่องข้อแรกที่เจอ','เลือกข้อความที่เขียนสั้นที่สุด','ข้อสอบแบบ NOT ให้ระวังกับดัก เพราะมักเผลอเลือกข้อที่ถูกต้องตามบทอ่าน'),
    make('p6-except','EXCEPT','วิเคราะห์คำสั่งยกเว้น','All of the following animals are in the zoo EXCEPT...','EXCEPT แปลว่า ยกเว้น (มี 3 ข้อในเรื่อง อีกข้อไม่มี)','ตัด 3 ตัวเลือกที่มีในบทอ่านออก ตัวเลือกที่ไม่มีคือคำตอบ','เลือกสัตว์ชนิดแรกที่อ่านเจอในบรรทัดแรก','เลือกสัตว์ตัวที่น่ารักที่สุด','EXCEPT ถามหาตัวเลือกเดียวที่ไม่ได้ถูกกล่าวถึงในบทอ่าน'),
    make('p6-infer','Infer','วิเคราะห์คำสั่งสรุปความจากเบาะแส','From the story, we can infer that Peter feels...','Infer คือการคิดเชื่อมโยงอย่างมีเหตุผลจากหลักฐาน','วิเคราะห์พฤติกรรมในเรื่องแล้วอนุมานคำตอบที่มีหลักฐานรองรับ','เดาตามใจชอบโดยไม่มีข้อมูลในเรื่องรองรับ','ตอบไม่ได้เพราะเนื้อเรื่องไม่ได้พิมพ์คำนั้นตรงๆ','การ Infer ต้องเชื่อมโยงเบาะแสในเรื่องอย่างสมเหตุสมผล'),
    make('p6-pronoun','Pronoun Reference','วิเคราะห์คำสรรพนามอ้างอิง','What does the word "they" in line 3 refer to?','ย้อนดูคำนามพหูพจน์ในประโยคก่อนหน้า','ดูคำนามพหูพจน์ที่กล่าวถึงก่อนหน้า และลองแทนที่ความหมาย','เลือกคำนามตัวแรกของทั้งย่อหน้าเสมอ','เลือกสรรพนามตัวอื่นในประโยคถัดไป','สรรพนามจะแทนคำนามที่เพิ่งกล่าวถึงก่อนหน้า ต้องสอดคล้องเรื่องพจน์'),
  ],
  part7: [
    make('p7-yes-no','Yes/No Questions','พิจารณาระดับเสียงท้ายคำถาม Yes/No','Are you coming with us tomorrow?','คำถามขึ้นต้นด้วย Are ต้องการคำตอบ Yes หรือ No','ลงท้ายด้วยเสียงสูง Rising Intonation (↗)','ลงท้ายด้วยเสียงต่ำ Falling Intonation (↘)','ลงท้ายด้วยเสียงราบเรียบสม่ำเสมอ','Yes/No questions ที่ขึ้นต้นด้วยกริยาช่วย (Is, Am, Are, Do, Does, Can) จบด้วยเสียงสูง ↗'),
    make('p7-wh','Wh- Questions','พิจารณาระดับเสียงท้ายคำถาม Wh-','Where did you put the dictionary?','คำถามขึ้นต้นด้วย Where ถามหาสถานที่','ลงท้ายด้วยเสียงต่ำ Falling Intonation (↘)','ลงท้ายด้วยเสียงสูง Rising Intonation (↗)','ลงท้ายด้วยเสียงกระซิบ','Wh-questions (Who, What, Where, When, Why, How) จบด้วยเสียงต่ำ ↘'),
    make('p7-do-does','Do/Does Questions','พิจารณาระดับเสียงท้ายคำถาม Do/Does','Does your brother play football?','ขึ้นต้นด้วย Does เป็นคำถามแบบ Yes/No','ลงท้ายด้วยเสียงสูง Rising Intonation (↗)','ลงท้ายด้วยเสียงต่ำ Falling Intonation (↘)','ไม่มีการเปลี่ยนระดับเสียง','คำถามที่ขึ้นต้นด้วย Do/Does/Did เป็น Yes/No Question จบด้วยเสียงสูง ↗'),
    make('p7-choice','Choice Questions','พิจารณาระดับเสียงท้ายคำถามแบบมีตัวเลือก (or)','Would you like juice or milk?','มีคำเชื่อม or ให้เลือกระหว่างสองสิ่ง','เสียงสูงที่ juice (↗) แล้วลงต่ำที่ milk (↘)','เสียงต่ำที่ juice (↘) แล้วขึ้นสูงที่ milk (↗)','เสียงสูงทั้งสองตัวเลือก','Choice questions: ตัวเลือกแรกจะขึ้นเสียงสูง ↗ และตัวเลือกสุดท้ายจะลงเสียงต่ำ ↘'),
    make('p7-request','Polite Requests','พิจารณาระดับเสียงประโยคขอร้องสุภาพ','Could you pass the salt, please?','ประโยคขอร้องที่ลงท้ายด้วย please เพื่อความสุภาพ','ลงท้ายด้วยเสียงสูง Rising Intonation (↗)','ลงท้ายด้วยเสียงต่ำกระแทกกระทั้น (↘)','ออกเสียงต่ำสม่ำเสมอเหมือนประโยคคำสั่ง','Polite requests ลงท้ายด้วย please มักใช้เสียงสูง ↗ เพื่อแสดงความสุภาพและเป็นมิตร'),
    make('p7-statement','Statements','พิจารณาระดับเสียงท้ายประโยคบอกเล่า','The library opens at eight o\'clock.','ประโยคบอกเล่าข้อเท็จจริงทั่วไป','ลงท้ายด้วยเสียงต่ำ Falling Intonation (↘)','ลงท้ายด้วยเสียงสูง Rising Intonation (↗)','เว้นเสียงค้างไว้ตรงกลางประโยค','ประโยคบอกเล่า (Statements) และคำสั่ง (Commands) จบด้วยเสียงต่ำ ↘'),
  ],
  part8: [
    make('p8-borrow-lend','borrow vs lend','เลือกคำศัพท์ที่ถูกต้องระหว่างขอยืมกับให้ยืม','May I ___ your ruler? I forgot mine at home.','ผู้พูดเป็นฝ่ายรับของเข้ามาใช้งาน','borrow (ขอยืมเข้ามา)','lend (ให้ยืมออกไป)','break (ทำแตกหัก)','borrow = ขอยืม (รับเข้ามาหาตัว), lend = ให้ยืม (ส่งออกไปให้คนอื่น)'),
    make('p8-postpone-cancel','postponed vs cancelled','เลือกคำศัพท์ที่ถูกต้องเกี่ยวกับการเลื่อนหรือยกเลิก','The sports day was ___ to next Friday because of heavy rain.','ย้ายไปจัดวันศุกร์หน้า (ยังมีจัดอยู่ ไม่ได้ยกเลิกถาวร)','postponed (เลื่อนวันเวลาออกไป)','cancelled (ยกเลิกอย่างถาวร)','finished (เสร็จสิ้นไปแล้ว)','postpone = เลื่อนเวลา (มีจัดทีหลัง), cancel = ยกเลิกถาวร'),
    make('p8-autumn-fall','autumn vs fall','เปรียบเทียบคำศัพท์ British และ American English','In British English it is called autumn, but Americans call it ___.','คำศัพท์ American English ที่หมายถึงฤดูใบไม้ร่วง','fall','spring','winter','autumn (อังกฤษ) และ fall (อเมริกา) คือฤดูเดียวกัน คือฤดูใบไม้ร่วง'),
    make('p8-hand-in-out','hand in vs hand out','เลือก phrasal verb ให้ตรงกับการส่งงาน','Students must ___ their assignments before four o\'clock.','นำงานไปส่งมอบให้คุณครู','hand in (ส่งงานให้ครู)','hand out (แจกจ่ายเอกสาร)','hand off (ปล่อยมือ)','hand in = ส่งงาน/มอบให้, hand out = แจกจ่ายให้นักเรียน'),
    make('p8-slow-watch','slow down vs watch out','เลือกคำเตือนให้เหมาะกับสถานการณ์อันตราย','___! There is a broken glass on the floor.','เตือนอันตรายกะทันหันตรงหน้า','Watch out (ระวังอันตรายตรงหน้า)','Slow down (ลดความเร็ว)','Look for (ค้นหา)','Watch out / Look out ใช้เตือนอันตรายกะทันหัน, Slow down ใช้บอกให้ลดความเร็ว'),
    make('p8-may-could','May I vs Could you','เลือกรูปประโยคขอร้องหรือขออนุญาต','___ open the window, please? It is very hot.','ขอร้องให้อีกฝ่าย (you) เป็นผู้กระทำ','Could you (ขอร้องให้อีกฝ่ายช่วยทำ)','May I (ขออนุญาตตัวเองทำ)','Must you (เธอต้องทำ)','Could you ใช้ขอร้องให้อีกฝ่ายช่วยทำ, May I ใช้ขออนุญาตตนเองทำ'),
  ],
  part9: [
    make('p9-red-circle','ป้ายวงกลมแดง','ป้ายวงกลมสีแดงมีเส้นทแยงขีดทับ','A red circular sign with a slash across a camera','เส้นขีดทับสีแดงหมายถึงข้อห้าม','Do not take photos here.','You can take photos freely.','Buy a camera here.','ป้ายวงกลมขีดทับสีแดงหมายถึงข้อห้าม (Prohibition) เสมอ'),
    make('p9-yellow-triangle','ป้ายสามเหลี่ยมเตือน','ป้ายสามเหลี่ยมสีเหลืองมีรูปคนลื่น','A yellow triangular sign with a slipping figure','สีเหลืองสามเหลี่ยมเตือนให้ระวังอันตราย','Be careful, the floor is slippery.','You should run fast here.','No entry for anyone.','ป้ายสามเหลี่ยมสีเหลืองเป็นป้ายเตือนอันตราย (Warning sign)'),
    make('p9-green-rectangle','ป้ายสี่เหลี่ยมเขียว','ป้ายสี่เหลี่ยมสีเขียวพร้อมรูปคนวิ่งออกประตู','A green rectangular sign with a running figure','สีเขียวให้ข้อมูลความปลอดภัยหรือทางออก','Emergency exit is this way.','Do not enter this room.','Stop and wait here.','สีเขียวเป็นป้ายบอกทางหนีไฟหรือความปลอดภัย (Safety Information)'),
    make('p9-who-enter','เงื่อนไขการเข้าพื้นที่','ป้ายระบุ: Mask Required to Enter','Who can enter the building?','ดูเงื่อนไขในป้ายที่กำหนดไว้','A person wearing a face mask.','A person without a mask.','Anyone carrying food.','ป้ายกำหนดให้สวมหน้ากาก ผู้ที่สวมหน้ากากจึงสามารถเข้าได้'),
  ],
  part10: [
    make('p10-opposite','opposite vs next to','วิเคราะห์ตำแหน่งสถานที่ในแผนผัง','The library is on the other side of the street facing the bank.','อยู่คนละฝั่งถนน หันหน้าชนกัน','The library is opposite the bank.','The library is next to the bank.','The library is behind the bank.','อยู่คนละฝั่งถนนที่มีถนนคั่นกลางใช้คำว่า opposite'),
    make('p10-between','between A and B','วิเคราะห์สถานที่ซึ่งอยู่กึ่งกลาง','The post office has the bakery on its left and the clinic on its right.','อยู่ตรงกลางระหว่างสองสถานที่','It is between the bakery and the clinic.','It is behind the bakery.','It is on the corner.','สถานที่อยู่กึ่งกลางระหว่างสองจุดใช้ between A and B'),
    make('p10-walk-past','walk past then turn','วิเคราะห์คำสั่งบอกทาง','Walk past the pond, then turn left at the corner.','เดินผ่านสระน้ำไปก่อน แล้วจึงเลี้ยวซ้าย','Walk past the pond, then turn left.','Turn left before you see the pond.','Stop inside the pond.','walk past หมายถึงเดินผ่านสถานที่นั้นเลยไปข้างหน้าก่อน แล้วจึงเลี้ยว'),
    make('p10-corner','on the corner','วิเคราะห์อาคารตรงหัวมุมถนน','The bookstore is where Main Street meets Park Road.','อยู่ตรงจุดบรรจบของถนนสองสาย','It is on the corner of the streets.','It is inside the park.','It is behind the street.','สถานที่ตรงจุดตัดหัวมุมถนนใช้ on the corner'),
  ],
  part11: [
    make('p11-before','immediately before','วิเคราะห์คำถามเกี่ยวกับตารางเวลา','Science is at 10:00, and Math is at 09:00. Which subject is immediately before Science?','before แปลว่า ก่อนหน้าทันที','Math','English','Lunch','immediately before ถามหาวิชาที่เรียนก่อนหน้านั้นทันที'),
    make('p11-after','after lunch','วิเคราะห์กิจกรรมหลังพักกลางวัน','Lunch is 12:00-13:00, and Art starts at 13:00. What do students study after lunch?','after แปลว่า หลังจาก','Art','Science','Math','after lunch คือกิจกรรมที่เริ่มต้นหลังจากเวลาพักกลางวันสิ้นสุดลง'),
    make('p11-how-long','how long duration','คำนวณระยะเวลาการทำกิจกรรม','The presentation starts at 10:15 and finishes at 11:00. How long does it last?','นำเวลาสิ้นสุดลบเวลาเริ่มต้น: 11:00 - 10:15','45 minutes','30 minutes','1 hour','11:00 ลบด้วย 10:15 เท่ากับ 45 นาที'),
    make('p11-how-many-more','how many more difference','คำนวณผลต่างจากแผนภูมิแท่ง','20 students like football, and 12 like tennis. How many more students like football than tennis?','นำ 20 ลบ 12 เพื่อหาผลต่าง','8 students','32 students','12 students','How many more ... than ถามหาส่วนต่าง นำตัวเลขมาลบกัน 20 - 12 = 8'),
  ],
  part12: [
    make('p12-halloween','Halloween clues','จับคู่คีย์เวิร์ดของเทศกาลฮาโลวีน','October 31st, costumes, trick or treat, pumpkin lantern','สังเกตวันและสัญลักษณ์โคมฟักทอง','Halloween','Christmas','Easter','31 ตุลาคม พร้อมขนมและโคมฟักทองคือเทศกาล Halloween'),
    make('p12-christmas','Christmas clues','จับคู่คีย์เวิร์ดของวันคริสต์มาส','December 25th, Santa Claus coming down the chimney, stockings','สังเกตวันและซานตาคลอสลงปล่องไฟ','Christmas Day','Thanksgiving','New Year','25 ธันวาคม มีของขวัญในถุงเท้าและซานตาคลอสคือ Christmas Day'),
    make('p12-easter','Easter clues','จับคู่คีย์เวิร์ดของเทศกาลอีสเตอร์','Springtime, hunting for hidden colorful eggs in the garden','กิจกรรมตามหาไข่หลากสีในสวน','Easter Day','Halloween','Valentine\'s Day','การตามหาไข่หลากสีในฤดูใบไม้ผลิคือเทศกาล Easter'),
    make('p12-thanksgiving','Thanksgiving clues','จับคู่คีย์เวิร์ดวันขอบคุณพระเจ้า','Family dinner in November with roast turkey to give thanks for the harvest','ไก่งวงอบและขอบคุณผลผลิตในเดือนพฤศจิกายน','Thanksgiving Day','Christmas Day','Loy Krathong Day','รับประทานไก่งวงอบร่วมกับครอบครัวในเดือนพฤศจิกายนคือ Thanksgiving'),
  ],
  part13: [
    make('p13-may-i','May I go out','เลือกคำตอบที่ถูกต้องเมื่อนักเรียนขออนุญาตครู','Student: May I go out, please? Teacher: ___','ครูตอบรับการขออนุญาตอย่างสุภาพ','Yes, you may.','No, thank you.','You\'re welcome.','ถาม May I ตอบ Yes, you may. หรือ No, you may not.'),
    make('p13-could-you','Could you lend me','เลือกสำนวนขอยืมอุปกรณ์การเรียน','You forgot your ruler. What should you say to your friend?','ขอร้องให้เพื่อนเป็นฝ่ายให้ยืม (lend)','Could you lend me your ruler, please?','Can you borrow me your ruler?','May I lend your ruler?','ขอร้องให้เพื่อนช่วย ต้องใช้ Could you lend me (ไม่ใช่ borrow me)'),
    make('p13-feel-sick','Feeling sick in class','เลือกคำแนะนำเมื่อเพื่อนบอกว่าไม่สบาย','Friend: I don\'t feel good today. I have a headache. You: ___','ให้คำแนะนำที่เหมาะสมแก่อาการป่วย','You should go see the school nurse.','You should play football outside.','Congratulations!','เมื่อเพื่อนไม่สบาย ควรแนะนำให้ไปห้องพยาบาล (You should go see the school nurse)'),
    make('p13-thank-reply','Responding to thanks','เลือกคำตอบรับคำขอบคุณที่ถูกต้อง','Anna: Thank you very much for helping me. Ben: ___','ตอบรับคำขอบคุณอย่างสุภาพ','You\'re welcome.','I\'m sorry.','Never mind.','เมื่อมีคนกล่าว Thank you ต้องตอบรับด้วย You\'re welcome หรือ No problem'),
  ],
};

export function practiceRound(part, round) {
  const bank = practiceBanks[part] || [];
  const count = bank.length <= 5 ? 1 : 2;
  const size = Math.ceil(bank.length / count);
  if (!count) return [];
  const index = ((round % count) + count) % count;
  return bank.slice(index * size, index * size + size);
}
