import { CH1_MISSIONS } from './missions/ch1_missions';
import { CH2_MISSIONS } from './missions/ch2_missions';
import { CH5_MISSIONS } from './missions/ch5_missions';

const verbRows = [
  ['eat', 'กิน', 'I eat rice.', 'ฉันกินข้าว'],
  ['drink', 'ดื่ม', 'I drink water.', 'ฉันดื่มน้ำ'],
  ['read', 'อ่าน', 'I read a book.', 'ฉันอ่านหนังสือ'],
  ['write', 'เขียน', 'I write my name.', 'ฉันเขียนชื่อของฉัน'],
  ['walk', 'เดิน', 'I walk to school.', 'ฉันเดินไปโรงเรียน'],
  ['run', 'วิ่ง', 'I run in the park.', 'ฉันวิ่งในสวนสาธารณะ'],
  ['play', 'เล่น', 'I play football.', 'ฉันเล่นฟุตบอล'],
  ['listen', 'ฟัง', 'I listen to my teacher.', 'ฉันฟังคุณครู'],
  ['speak', 'พูด', 'I speak English.', 'ฉันพูดภาษาอังกฤษ'],
  ['open', 'เปิด', 'I open the door.', 'ฉันเปิดประตู'],
  ['close', 'ปิด', 'I close the window.', 'ฉันปิดหน้าต่าง'],
  ['help', 'ช่วย', 'I help my friend.', 'ฉันช่วยเพื่อน'],
];
const routineRows = [
  ['wake up', 'ตื่นนอน', 'I wake up at six.', 'ฉันตื่นนอนตอนหกโมง'],
  ['get up', 'ลุกจากที่นอน', 'I get up after I wake up.', 'ฉันลุกจากที่นอนหลังจากตื่น'],
  ['brush my teeth', 'แปรงฟันของฉัน', 'I brush my teeth every morning.', 'ฉันแปรงฟันทุกเช้า'],
  ['take a shower', 'อาบน้ำ', 'I take a shower in the morning.', 'ฉันอาบน้ำตอนเช้า'],
  ['get dressed', 'แต่งตัว', 'I get dressed for school.', 'ฉันแต่งตัวไปโรงเรียน'],
  ['have breakfast', 'กินอาหารเช้า', 'I have breakfast at seven.', 'ฉันกินอาหารเช้าตอนเจ็ดโมง'],
  ['go to school', 'ไปโรงเรียน', 'I go to school by bus.', 'ฉันไปโรงเรียนโดยรถบัส'],
  ['have lunch', 'กินอาหารกลางวัน', 'I have lunch at noon.', 'ฉันกินอาหารกลางวันตอนเที่ยง'],
  ['do my homework', 'ทำการบ้านของฉัน', 'I do my homework after school.', 'ฉันทำการบ้านหลังเลิกเรียน'],
  ['go to bed', 'เข้านอน', 'I go to bed at nine.', 'ฉันเข้านอนตอนสามทุ่ม'],
];
const cultureRows = [
  ['Halloween', 'วันฮาโลวีน', 'Halloween is on October 31st.', 'วันฮาโลวีนตรงกับวันที่ 31 ตุลาคม'],
  ['October 31st', 'วันที่ 31 ตุลาคม', 'Children celebrate Halloween on October 31st.', 'เด็กๆ ฉลองวันฮาโลวีนในวันที่ 31 ตุลาคม'],
  ['trick or treat', 'วลีขอขนมในวันฮาโลวีน', 'Children say, “Trick or treat!”', 'เด็กๆ พูดว่า “ทริกออร์ทรีต” เพื่อขอขนม'],
  ['jack-o’-lantern', 'โคมไฟฟักทองแกะสลัก', 'A jack-o’-lantern is made from a pumpkin.', 'โคมแจ็กโอแลนเทิร์นทำจากฟักทอง'],
  ['Christmas Day', 'วันคริสต์มาส', 'Christmas Day is on December 25th.', 'วันคริสต์มาสตรงกับวันที่ 25 ธันวาคม'],
  ['December 25th', 'วันที่ 25 ธันวาคม', 'Families celebrate Christmas on December 25th.', 'ครอบครัวฉลองคริสต์มาสในวันที่ 25 ธันวาคม'],
  ['decorate', 'ตกแต่ง', 'We decorate the Christmas tree.', 'พวกเราตกแต่งต้นคริสต์มาส'],
  ['pine tree', 'ต้นสน', 'They decorate a pine tree for Christmas.', 'พวกเขาตกแต่งต้นสนสำหรับวันคริสต์มาส'],
  ['lights', 'ไฟประดับ', 'Colorful lights shine on the tree.', 'ไฟหลากสีส่องสว่างบนต้นไม้'],
  ['candy cane', 'ลูกกวาดไม้เท้า', 'A candy cane is a Christmas sweet.', 'ลูกกวาดไม้เท้าเป็นขนมวันคริสต์มาส'],
  ['Valentine’s Day', 'วันวาเลนไทน์', 'Valentine’s Day is on February 14th.', 'วันวาเลนไทน์ตรงกับวันที่ 14 กุมภาพันธ์'],
  ['February 14th', 'วันที่ 14 กุมภาพันธ์', 'People celebrate love on February 14th.', 'ผู้คนเฉลิมฉลองความรักในวันที่ 14 กุมภาพันธ์'],
  ['rose', 'ดอกกุหลาบ', 'He gives her a red rose.', 'เขามอบดอกกุหลาบสีแดงให้เธอ'],
  ['chocolate', 'ช็อกโกแลต', 'Chocolate is a popular Valentine’s gift.', 'ช็อกโกแลตเป็นของขวัญวันวาเลนไทน์ที่นิยม'],
  ['Songkran Day', 'วันสงกรานต์', 'Songkran is the Thai New Year festival.', 'สงกรานต์เป็นเทศกาลปีใหม่ไทย'],
  ['April 13th–15th', 'วันที่ 13–15 เมษายน', 'Songkran is celebrated from April 13th to 15th.', 'สงกรานต์จัดขึ้นระหว่างวันที่ 13 ถึง 15 เมษายน'],
  ['scented water', 'น้ำอบหอม', 'People use scented water during Songkran.', 'ผู้คนใช้น้ำอบหอมในช่วงสงกรานต์'],
  ['pour water', 'รดน้ำ', 'Young people pour water on their elders’ hands.', 'เยาวชนรดน้ำบนมือของผู้ใหญ่'],
  ['elders', 'ผู้ใหญ่หรือผู้อาวุโส', 'Children show respect to their elders.', 'เด็กๆ แสดงความเคารพต่อผู้ใหญ่'],
  ['Loy Krathong Day', 'วันลอยกระทง', 'Families celebrate Loy Krathong together.', 'ครอบครัวฉลองวันลอยกระทงด้วยกัน'],
  ['full moon', 'พระจันทร์เต็มดวง', 'Loy Krathong is celebrated on a full-moon night.', 'ลอยกระทงจัดในคืนพระจันทร์เต็มดวง'],
  ['twelfth lunar month', 'เดือน 12 ตามปฏิทินจันทรคติ', 'The festival is held in the twelfth lunar month.', 'เทศกาลจัดขึ้นในวันเพ็ญเดือน 12'],
  ['krathong', 'กระทง', 'We float a krathong on the river.', 'พวกเราลอยกระทงในแม่น้ำ'],
  ['candle', 'เทียน', 'There is a candle in the krathong.', 'มีเทียนอยู่ในกระทง'],
  ['joss sticks', 'ธูป', 'People put joss sticks in a krathong.', 'ผู้คนใส่ธูปในกระทง'],
  ['flowers', 'ดอกไม้', 'The krathong is decorated with flowers.', 'กระทงตกแต่งด้วยดอกไม้'],
  ['coins', 'เหรียญ', 'Some people put coins in a krathong.', 'บางคนใส่เหรียญในกระทง'],
  ['Mother’s Day', 'วันแม่', 'Children give jasmine to their mothers.', 'เด็กๆ มอบดอกมะลิให้คุณแม่'],
  ['jasmine', 'ดอกมะลิ', 'Jasmine is a symbol of Mother’s Day in Thailand.', 'ดอกมะลิเป็นสัญลักษณ์วันแม่ในประเทศไทย'],
  ['New Year’s Day', 'วันปีใหม่', 'New Year’s Day is on January 1st.', 'วันปีใหม่ตรงกับวันที่ 1 มกราคม'],
  ['Happy New Year!', 'สวัสดีปีใหม่', 'We say, “Happy New Year!” to our friends.', 'พวกเรากล่าวว่า “สวัสดีปีใหม่” กับเพื่อนๆ'],
];
function learningDeck(id, rows, illustrations = [], metadata = {}) {
  return { id, type: 'flashcard', xpReward: 30, contentStatus: 'authored_learning', assessmentEligible: false,
    contentReview: { status: 'technical_language_check', reviewer: 'Codex', date: '2026-10-13', scope: 'learning_only' },
    ...metadata,
    cards: rows.map(([word, thai, example, exampleThai], i) => ({
      id: `${id}_${i + 1}`, front: word, frontType: 'text', frontLabel: word, back: word, backThai: thai, example, exampleThai,
      ...(illustrations[i] || {}),
      ...(metadata.cardMetadata || {}),
      ...(illustrations[i] ? { illustrationVersion: 'vocab-illustrations-v1', illustrationReview: 'technical_check_only', illustrationSource: 'md/Vocab Illustration Generation Batch 2.json' } : {}),
    })) };
}
const verbIllustrations = [
  ['eat', 'เด็กกำลังกินอาหารด้วยช้อนที่โต๊ะอาหาร'],
  ['drink', 'เด็กกำลังยกแก้วน้ำขึ้นดื่ม'],
  ['read', 'เด็กกำลังอ่านหนังสือที่เปิดอยู่'],
  ['write', 'เด็กกำลังใช้ดินสอเขียนในสมุด'],
  ['walk', 'เด็กกำลังเดินอย่างสบายพร้อมกระเป๋านักเรียน'],
  ['run', 'เด็กกำลังวิ่งด้วยท่าทางรวดเร็ว'],
  ['play', 'เด็กสองคนกำลังเล่นฟุตบอลด้วยกัน'],
  ['listen', 'เด็กตั้งใจฟังผู้ใหญ่ที่กำลังพูด'],
  ['speak', 'เด็กกำลังพูดกับเพื่อนโดยมีท่าทางสนทนา'],
  ['open', 'เด็กกำลังเปิดประตูให้กว้างขึ้น'],
  ['close', 'เด็กกำลังดึงประตูให้ปิดลง'],
  ['help', 'เด็กกำลังช่วยเพื่อนเก็บหนังสือจากพื้น'],
].map(([slug, imageAlt]) => ({ image: `/learning/verbs/${slug}-v1.png`, imageAlt }));
const routineIllustrations = [
  ['wake-up', 'เด็กเพิ่งลืมตา มือขยี้ตา ศีรษะยังอยู่บนหมอนและตัวยังนอนใต้ผ้าห่ม'],
  ['get-up', 'เด็กใช้มือดันที่นอนเพื่อลุกจากขอบเตียง เท้าทั้งสองอยู่บนพื้น'],
  ['brush-my-teeth', 'เด็กกำลังแปรงฟันอยู่หน้าอ่างล้างหน้า'],
  ['take-a-shower', 'ฝักบัวกำลังเปิดน้ำอยู่หลังม่านอาบน้ำทึบที่ปิดสนิท'],
  ['get-dressed', 'เด็กแต่งชุดนักเรียนครบแล้วและกำลังติดกระดุมเสื้อ'],
  ['have-breakfast', 'เด็กกำลังกินขนมปัง ผลไม้ และนมที่โต๊ะอาหารเช้า'],
  ['go-to-school', 'เด็กสะพายกระเป๋ากำลังเดินไปทางประตูโรงเรียน'],
  ['have-lunch', 'เด็กกำลังกินข้าวและผักจากถาดอาหารกลางวันที่โรงเรียน'],
  ['do-my-homework', 'เด็กกำลังใช้ดินสอทำแบบฝึกหัดในสมุดที่โต๊ะเรียน'],
  ['go-to-bed', 'เด็กสวมชุดนอนกำลังขึ้นเตียงและดึงผ้าห่มในเวลากลางคืน'],
].map(([slug, imageAlt]) => ({ image: `/learning/routines/${slug}-v1.png`, imageAlt }));
const cultureIllustrations = [
  ['halloween', 'ภาพวันฮาโลวีน มีโคมฟักทอง ลูกกวาด และค้างคาวประดับ'],
  ['halloween', 'ภาพวันฮาโลวีนสำหรับวันที่ 31 ตุลาคม'],
  ['halloween', 'ถังขนมและลูกกวาดสำหรับกิจกรรม Trick or Treat'],
  ['halloween', 'โคมไฟฟักทองแกะสลัก Jack-o’-lantern'],
  ['christmas', 'ต้นคริสต์มาสประดับไฟ ลูกกวาดไม้เท้า และของขวัญ'],
  ['christmas', 'ภาพวันคริสต์มาสสำหรับวันที่ 25 ธันวาคม'],
  ['christmas', 'ต้นสนที่กำลังตกแต่งด้วยไฟและเครื่องประดับ'],
  ['christmas', 'ต้นสนสำหรับเทศกาลคริสต์มาส'],
  ['christmas', 'ไฟประดับหลากสีบนต้นคริสต์มาส'],
  ['christmas', 'ลูกกวาดไม้เท้าสำหรับเทศกาลคริสต์มาส'],
  ['valentines-day', 'ดอกกุหลาบและช็อกโกแลตสำหรับวันวาเลนไทน์'],
  ['valentines-day', 'ภาพวันวาเลนไทน์สำหรับวันที่ 14 กุมภาพันธ์'],
  ['valentines-day', 'ดอกกุหลาบสีแดงสำหรับมอบเป็นของขวัญ'],
  ['valentines-day', 'กล่องช็อกโกแลตรูปหัวใจสำหรับมอบเป็นของขวัญ'],
  ['songkran', 'ภาพประเพณีรดน้ำขอพรผู้ใหญ่ในวันสงกรานต์'],
  ['songkran', 'ภาพวันสงกรานต์สำหรับวันที่ 13 ถึง 15 เมษายน'],
  ['songkran', 'น้ำอบหอมในขันเงินสำหรับประเพณีสงกรานต์'],
  ['songkran', 'เด็กกำลังรดน้ำบนมือผู้ใหญ่อย่างสุภาพ'],
  ['songkran', 'ผู้ใหญ่รับการรดน้ำขอพรในประเพณีสงกรานต์'],
  ['loy-krathong', 'กระทงดอกไม้ลอยบนผิวน้ำใต้พระจันทร์เต็มดวง'],
  ['loy-krathong', 'พระจันทร์เต็มดวงเหนือกระทงที่ลอยบนผิวน้ำ'],
  ['loy-krathong', 'ภาพวันเพ็ญเดือนสิบสองและกระทง'],
  ['loy-krathong', 'กระทงทำจากใบตองและดอกไม้'],
  ['loy-krathong', 'เทียนที่ปักอยู่ในกระทง'],
  ['loy-krathong', 'ธูปสามดอกที่ปักอยู่ในกระทง'],
  ['loy-krathong', 'ดอกไม้ที่ใช้ตกแต่งกระทง'],
  ['loy-krathong', 'เหรียญที่วางเป็นส่วนประกอบในกระทง'],
  ['mothers-new-year', 'พวงมาลัยดอกมะลิสำหรับวันแม่'],
  ['mothers-new-year', 'ดอกมะลิและพวงมาลัยดอกมะลิ'],
  ['mothers-new-year', 'ของขวัญและดาวประดับสำหรับวันปีใหม่'],
  ['mothers-new-year', 'ภาพการอวยพรปีใหม่ด้วยของขวัญและดาวประดับ'],
].map(([slug, imageAlt]) => ({ image: `/learning/culture_festivals/${slug}-v1.png`, imageAlt }));
const NEW_DECKS = {
  verbs: learningDeck('verbs_learning_v1', verbRows, verbIllustrations),
  daily_routine: learningDeck('daily_routine_learning_v1', routineRows, routineIllustrations),
  culture_festivals: learningDeck('culture_festivals_learning_v1', cultureRows, cultureIllustrations, {
    curriculumStandard: 'ต 2.1',
    sourceScope: 'owner_requested_festival_and_culture_vocabulary',
    cardMetadata: { standard: 'ต 2.1', learningOnly: true },
  }),
};
const LEGACY_ILLUSTRATIONS = {
  subjects: [
    ['sbm1', 'math', 'อุปกรณ์วิชาคณิตศาสตร์ มีลูกคิด ไม้บรรทัด และรูปทรงเรขาคณิต'],
    ['sbm2', 'science', 'อุปกรณ์วิทยาศาสตร์ มีขวดทดลอง กล้องจุลทรรศน์ และแบบจำลองอะตอม'],
    ['sbm3', 'english', 'หนังสือภาษาอังกฤษเปิดอยู่พร้อมฟองคำพูดและดินสอ'],
    ['sbm4', 'physical-education', 'อุปกรณ์พลศึกษา มีลูกฟุตบอล รองเท้ากีฬา และนกหวีด'],
    ['sbm5', 'art', 'อุปกรณ์ศิลปะ มีจานสี พู่กัน และดินสอสี'],
    ['sbm6', 'geography', 'อุปกรณ์ภูมิศาสตร์ มีลูกโลก แผนที่ และเข็มทิศ'],
  ],
  signs: [
    ['sf1', 'no-parking', 'ป้ายห้ามจอดรถ', 'svg'],
    ['sf2', 'no-u-turn', 'ป้ายห้ามกลับรถ', 'svg'],
    ['sf3', 'no-horn', 'ป้ายห้ามบีบแตร', 'svg'],
    ['sf4', 'school-zone', 'ป้ายเตือนเขตโรงเรียน', 'svg'],
    ['sf5', 'fire-exit', 'ป้ายทางออกฉุกเฉิน', 'svg'],
    ['sf6', 'wet-floor', 'ป้ายเตือนพื้นเปียก', 'svg'],
    ['sf7', 'no-photography', 'ป้ายห้ามถ่ายรูป', 'svg'],
    ['sf8', 'no-pets', 'ป้ายห้ามนำสัตว์เลี้ยงเข้า', 'svg'],
    ['sf9', 'toilet', 'ป้ายห้องน้ำ', 'svg'],
    ['sf10', 'traffic-light', 'สัญญาณไฟจราจร', 'svg'],
  ],
  directions: [
    ['df1', 'go-straight', 'ลูกศรชี้ตรงไปบนถนน', 'svg'],
    ['df2', 'turn-left', 'ถนนและลูกศรเลี้ยวซ้าย', 'svg'],
    ['df3', 'turn-right', 'ถนนและลูกศรเลี้ยวขวา', 'svg'],
    ['df4', 'on-the-left', 'วัตถุที่อยู่ทางซ้าย', 'svg'],
    ['df5', 'on-the-right', 'วัตถุที่อยู่ทางขวา', 'svg'],
    ['df6', 'next-to', 'วัตถุสองชิ้นวางอยู่ข้างกัน', 'svg'],
    ['df7', 'opposite', 'วัตถุสองชิ้นอยู่ตรงข้ามกัน', 'svg'],
    ['df8', 'between', 'วัตถุหนึ่งชิ้นอยู่ระหว่างวัตถุสองชิ้น', 'svg'],
    ['df9', 'near', 'หมุดตำแหน่งอยู่ใกล้บ้าน', 'svg'],
    ['df10', 'behind', 'วงกลมอยู่ด้านหลังสี่เหลี่ยม', 'svg'],
    ['df11', 'on-the-corner', 'หมุดตำแหน่งอยู่ตรงหัวมุมถนน', 'svg'],
    ['df12', 'in-front-of', 'วงกลมอยู่ด้านหน้าสี่เหลี่ยม', 'svg'],
  ],
  greeting: [
    ['cf1', 'how-are-you', 'นักเรียนสองคนทักทายและถามสารทุกข์สุกดิบ'],
    ['cf2', 'thank-you', 'นักเรียนกล่าวขอบคุณหลังได้รับหนังสือคืน'],
    ['cf3', 'sorry', 'นักเรียนกล่าวขอโทษและช่วยเก็บดินสอที่ทำตก'],
    ['cf4', 'ask-for-help', 'นักเรียนขอความช่วยเหลือในการถือหนังสือ'],
    ['cf5', 'nice-to-meet-you', 'นักเรียนสองคนจับมือเมื่อพบกันครั้งแรก'],
    ['cf6', 'goodbye', 'นักเรียนสองคนโบกมือลากัน'],
    ['cf7', 'offer-a-drink', 'คุณครูเสนอเครื่องดื่มให้อีกคนอย่างสุภาพ'],
    ['cf8', 'borrow-a-pen', 'นักเรียนขอยืมปากกาจากเพื่อนอย่างสุภาพ'],
  ],
  question_words: [
    ['rf1', 'what', 'ถุงปริศนาที่มีเครื่องหมายคำถาม ใช้ถามว่าสิ่งใด', 'svg'],
    ['rf2', 'where', 'หมุดตำแหน่งบนแผนที่ ใช้ถามว่าสถานที่ใด', 'svg'],
    ['rf3', 'when', 'ปฏิทินและนาฬิกา ใช้ถามว่าเมื่อใด', 'svg'],
    ['rf4', 'who', 'ภาพบุคคล ใช้ถามว่าใคร', 'svg'],
    ['rf5', 'why', 'ฟองความคิดและเครื่องหมายคำถาม ใช้ถามเหตุผล', 'svg'],
    ['rf6', 'how', 'เส้นทางจากจุดเริ่มต้นไปยังปลายทาง ใช้ถามวิธีการ', 'svg'],
    ['rf7', 'whose', 'บ้านและเครื่องหมายคำถาม ใช้ถามความเป็นเจ้าของ', 'svg'],
    ['rf8', 'how-many', 'วัตถุหลายชิ้นที่สามารถนับได้ ใช้ถามจำนวน', 'svg'],
    ['rf9', 'how-much', 'ธนบัตรและสัญลักษณ์ราคา ใช้ถามราคา', 'svg'],
    ['rf10', 'how-often', 'นาฬิกาและลูกศรวน ใช้ถามความถี่', 'svg'],
  ],
  tenses: [
    ['t1', 'present-simple', 'เส้นเวลาที่มีเหตุการณ์เกิดซ้ำ แทน Present Simple', 'svg'],
    ['t2', 'present-continuous', 'เส้นเวลาที่เน้นเหตุการณ์กำลังเกิดในขณะนี้ แทน Present Continuous', 'svg'],
    ['t3', 'past-simple', 'เส้นเวลาที่เน้นเหตุการณ์ทางซ้ายของปัจจุบัน แทน Past Simple', 'svg'],
    ['t4', 'future-simple', 'เส้นเวลาที่เน้นเหตุการณ์ทางขวาของปัจจุบัน แทน Future Simple', 'svg'],
  ],
  numbers: [
    ['nf1', 'ordinal-podium', 'แท่นรางวัลแสดงลำดับที่หนึ่ง ที่สอง และที่สาม', 'svg'],
    ['nf2', 'ordinal-podium', 'แท่นรางวัลแสดงลำดับที่หนึ่ง ที่สอง และที่สาม', 'svg'],
    ['nf3', 'ordinal-podium', 'แท่นรางวัลแสดงลำดับที่หนึ่ง ที่สอง และที่สาม', 'svg'],
    ['nf4', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
    ['nf5', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
    ['nf6', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
    ['nf7', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
    ['nf8', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
    ['nf9', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
    ['nf10', 'ordinal-podium', 'แท่นรางวัลสำหรับเรียนรู้ตัวเลขลำดับ', 'svg'],
  ],
  pronouns: [
    ['p1', 'i', 'บุคคลชี้เข้าหาตนเอง แทนสรรพนาม I', 'svg'],
    ['p2', 'you', 'ลูกศรชี้ไปยังบุคคล แทนสรรพนาม You', 'svg'],
    ['p3', 'he', 'บุคคลผู้ชายหนึ่งคน แทนสรรพนาม He', 'svg'],
    ['p4', 'she', 'บุคคลผู้หญิงหนึ่งคน แทนสรรพนาม She', 'svg'],
    ['p5', 'it', 'แมวหนึ่งตัว แทนสรรพนาม It', 'svg'],
    ['p6', 'we', 'กลุ่มบุคคลที่รวมผู้พูด แทนสรรพนาม We', 'svg'],
    ['p7', 'they', 'กลุ่มบุคคลหลายคน แทนสรรพนาม They', 'svg'],
  ],
  quantifiers: [
    ['nqm1', 'many', 'หนังสือหลายเล่ม แทน many สำหรับนามนับได้', 'svg'],
    ['nqm2', 'much', 'น้ำปริมาณมากในแก้ว แทน much สำหรับนามนับไม่ได้', 'svg'],
    ['nqm3', 'some', 'แอปเปิลจำนวนหนึ่ง แทน some', 'svg'],
    ['nqm4', 'any', 'ถุงที่มีเครื่องหมายคำถาม แทน any ในคำถามและปฏิเสธ', 'svg'],
    ['nqm5', 'a-few', 'ดินสอจำนวนเล็กน้อยที่นับได้ แทน a few', 'svg'],
    ['nqm6', 'a-little', 'น้ำปริมาณเล็กน้อยในแก้ว แทน a little', 'svg'],
  ],
  environment: [
    ['ev1', 'recycle', 'นักเรียนกำลังแยกกระดาษ แก้ว และพลาสติกลงถังรีไซเคิล'],
    ['ev2', 'garbage-trash', 'ถุงขยะและถังขยะมีฝาปิด'],
    ['ev3', 'plant-trees', 'นักเรียนกำลังใช้พลั่วปลูกต้นไม้เล็ก'],
    ['ev4', 'save-energy', 'มือกำลังปิดสวิตช์ไฟเพื่อประหยัดพลังงาน'],
    ['ev5', 'do-not-litter', 'นักเรียนกำลังทิ้งซองขนมลงถังขยะในสวน'],
    ['ev6', 'pollution', 'โรงงานปล่อยควันและน้ำเสียลงคลองที่มีขยะ'],
  ],
  shapes: [
    ['sh1', 'circle', 'วงกลมสีฟ้า', 'svg'],
    ['sh2', 'square', 'สี่เหลี่ยมจัตุรัสสีเขียว', 'svg'],
    ['sh3', 'triangle', 'สามเหลี่ยมสีเหลือง', 'svg'],
    ['sh4', 'diamond', 'สี่เหลี่ยมข้าวหลามตัดสีม่วง', 'svg'],
    ['sh5', 'star', 'รูปดาวสีชมพู', 'svg'],
    ['sh6', 'oval', 'วงรีสีส้ม', 'svg'],
    ['sh7', 'rectangle', 'สี่เหลี่ยมผืนผ้าสีเขียวอมฟ้า', 'svg'],
  ],
  countries: [
    ['cn1', 'thailand-thai', 'ประเทศไทย มีวัดไทย เจดีย์ และเรือหางยาว'],
    ['cn2', 'japan-japanese', 'ประเทศญี่ปุ่น มีภูเขาไฟฟูจิ ประตูโทริอิ และเจดีย์'],
    ['cn3', 'china-chinese', 'ประเทศจีน มีกำแพงเมืองจีนทอดผ่านภูเขา'],
    ['cn4', 'korea-korean', 'ประเทศเกาหลี มีบ้านฮันอกและเส้นขอบฟ้ากรุงโซล'],
    ['cn5', 'england-british', 'ประเทศอังกฤษ มีหอนาฬิกาเวสต์มินสเตอร์และรถโดยสารสีแดง'],
    ['cn6', 'america-american', 'ประเทศสหรัฐอเมริกา มีเทพีเสรีภาพและเส้นขอบฟ้านิวยอร์ก'],
  ],
  emotions: [
    ['e1', 'happy', 'นักเรียนยิ้มกว้างและยกมือด้วยความสุข'],
    ['e2', 'sad', 'นักเรียนก้มหน้า น้ำตาไหล และไหล่ตกด้วยความเศร้า'],
    ['e3', 'angry', 'นักเรียนขมวดคิ้วและกอดอกด้วยความโกรธ'],
    ['e4', 'scared-afraid', 'นักเรียนตาโตและถอยตัวด้วยความกลัว'],
    ['e5', 'excited', 'นักเรียนกระโดดและชูกำปั้นด้วยความตื่นเต้น'],
    ['e6', 'tired-sleepy', 'นักเรียนหาวและขยี้ตาด้วยความเหนื่อยและง่วง'],
    ['e7', 'proud', 'นักเรียนยืนอย่างภาคภูมิใจและชูถ้วยรางวัล'],
    ['e8', 'confused', 'นักเรียนเอียงศีรษะและแตะคางด้วยความสับสน'],
  ],
  weather: [
    ['w1', 'sunny', 'ทุ่งหญ้าและทะเลสาบใต้ท้องฟ้าแจ่มใสที่มีแสงแดด'],
    ['w2', 'rainy', 'ถนนในเมืองขณะฝนตก มีเมฆฝนและร่ม'],
    ['w3', 'snowy-cold', 'สวนที่มีหิมะตก ต้นไม้ปกคลุมด้วยหิมะและน้ำแข็ง'],
    ['w4', 'windy', 'ทุ่งหญ้าและต้นไม้เอนตามลมแรง มีใบไม้ปลิว'],
    ['w5', 'foggy', 'ทางเดินและต้นไม้ที่ค่อย ๆ เลือนหายในหมอกหนา'],
    ['w6', 'spring', 'สวนฤดูใบไม้ผลิที่ดอกไม้บานและมีผีเสื้อ'],
    ['w7', 'summer', 'ชายหาดฤดูร้อน มีแสงแดด ต้นปาล์ม และร่มชายหาด'],
    ['w8', 'autumn-fall', 'สวนฤดูใบไม้ร่วงที่มีใบไม้สีส้ม แดง และทอง'],
    ['w9', 'winter', 'ทิวทัศน์ฤดูหนาวที่มีหิมะ ต้นสน และตุ๊กตาหิมะ'],
  ],
  clothes: [
    ['c1', 'dress', 'ชุดกระโปรงสีฟ้า มองจากด้านหน้า'],
    ['c2', 'shirt-and-t-shirt', 'เสื้อเชิ้ตและเสื้อยืดวางคู่กัน'],
    ['c3', 'raincoat', 'เสื้อกันฝนสีเหลืองมีหมวกคลุม'],
    ['c4', 'trousers-and-jeans', 'กางเกงขายาวสีเข้มและกางเกงยีนส์วางคู่กัน'],
    ['c5', 'shoes', 'รองเท้าผ้าใบหนึ่งคู่'],
    ['c6', 'socks', 'ถุงเท้าลายทางหนึ่งคู่'],
    ['c7', 'cap-and-hat', 'หมวกแก๊ปและหมวกปีกกว้างวางคู่กัน'],
    ['c8', 'jacket', 'เสื้อแจ็คเก็ตซิปหน้าสีน้ำเงิน'],
  ],
  food: [
    ['fm1', 'fried-rice', 'ข้าวผัดใส่ไข่ แครอต และต้นหอมบนจาน'],
    ['fm2', 'papaya-salad', 'ส้มตำไทยใส่มะละกอ มะเขือเทศ ถั่วฝักยาว และถั่วลิสง'],
    ['fm3', 'tom-yum-kung', 'ต้มยำกุ้งในชาม มีกุ้ง เห็ด ตะไคร้ และใบมะกรูด'],
    ['fm4', 'pizza', 'พิซซ่าชีสหน้ามะเขือเทศ เห็ด และพริกหวาน'],
    ['fm5', 'hamburger', 'แฮมเบอร์เกอร์ใส่เนื้อ ชีส ผักกาด และมะเขือเทศ'],
    ['fm6', 'spaghetti', 'สปาเกตตีซอสมะเขือเทศและมีตบอลบนจาน'],
    ['fm7', 'pancake', 'แพนเค้กสามชั้นราดน้ำเชื่อม วางเนยและผลไม้'],
    ['fm8', 'chicken-soup', 'ซุปไก่น้ำใสใส่แครอตและสมุนไพรในชาม'],
  ],
  jobs: [
    ['jm1', 'doctor', 'แพทย์สวมเสื้อกาวน์และมีหูฟังแพทย์'],
    ['jm2', 'teacher', 'ครูกำลังถือหนังสือและชี้อธิบายบทเรียน'],
    ['jm3', 'pilot', 'นักบินสวมเครื่องแบบการบิน'],
    ['jm4', 'chef', 'เชฟสวมชุดทำอาหารและถือช้อนไม้กับหม้อ'],
    ['jm5', 'librarian', 'บรรณารักษ์ถือหนังสือและยืนข้างรถเข็นหนังสือ'],
    ['jm6', 'firefighter', 'นักดับเพลิงสวมชุดป้องกันและถือสายดับเพลิง'],
    ['jm7', 'vet', 'สัตวแพทย์สวมเสื้อกาวน์และอุ้มสุนัข'],
    ['jm8', 'postman', 'บุรุษไปรษณีย์สะพายกระเป๋าและถือจดหมาย'],
  ],
  illness: [
    ['if1', 'headache', 'เด็กกำลังใช้มือจับขมับทั้งสองข้างเพราะปวดหัว'],
    ['if2', 'runny-nose', 'เด็กใช้กระดาษทิชชูเช็ดน้ำมูก'],
    ['if3', 'toothache', 'เด็กใช้มือจับแก้มเพราะปวดฟัน'],
    ['if4', 'earache', 'เด็กใช้มือจับหูเพราะปวดหู'],
    ['if5', 'backache', 'เด็กใช้มือจับหลังส่วนล่างเพราะปวดหลัง'],
    ['if6', 'fever', 'ผู้ปกครองกำลังวัดไข้ให้เด็กด้วยเครื่องวัดอุณหภูมิ'],
    ['if7', 'sore-throat', 'เด็กใช้มือแตะลำคอเพราะเจ็บคอ'],
    ['if8', 'cold', 'เด็กเป็นหวัดห่มผ้าและถือกระดาษทิชชู'],
    ['if9', 'cough', 'เด็กกำลังไอใส่ข้อพับแขนอย่างถูกสุขลักษณะ'],
    ['if10', 'stomach-ache', 'เด็กใช้มือกุมท้องเพราะปวดท้อง'],
  ],
  transport: [
    ['vf1', 'plane', 'เครื่องบินโดยสาร'],
    ['vf2', 'car', 'รถยนต์นั่งส่วนบุคคล'],
    ['vf3', 'bus', 'รถโดยสารประจำทาง'],
    ['vf4', 'van', 'รถตู้โดยสาร'],
    ['vf5', 'bicycle', 'รถจักรยานสองล้อ'],
    ['vf6', 'ship', 'เรือเดินทะเลขนาดใหญ่'],
    ['vf7', 'train', 'รถไฟโดยสาร'],
    ['vf8', 'taxi', 'รถแท็กซี่'],
    ['vf9', 'boat', 'เรือใบขนาดเล็ก'],
    ['vf10', 'motorcycle', 'รถจักรยานยนต์'],
    ['vf11', 'ambulance', 'รถพยาบาลพร้อมไฟฉุกเฉิน'],
    ['vf12', 'pick-up-truck', 'รถกระบะสี่ประตู'],
  ],
  place: [
    ['vm1', 'hospital', 'อาคารโรงพยาบาลที่มีเครื่องหมายกาชาด'],
    ['vm2', 'school', 'อาคารโรงเรียนและสนามเด็กเล่น'],
    ['vm3', 'bank', 'อาคารธนาคาร'],
    ['vm4', 'airport', 'อาคารสนามบิน เครื่องบิน และหอบังคับการบิน'],
    ['vm5', 'market', 'แผงตลาดจำหน่ายผักและผลไม้'],
    ['vm6', 'restaurant', 'ร้านอาหารที่จัดโต๊ะพร้อมรับประทาน'],
    ['vm7', 'cinema', 'อาคารโรงภาพยนตร์พร้อมฟิล์มและตั๋ว'],
    ['vm8', 'post-office', 'อาคารไปรษณีย์และตู้ไปรษณีย์'],
  ],
};
const LEGACY_ILLUSTRATION_LOOKUP = Object.fromEntries(
  Object.entries(LEGACY_ILLUSTRATIONS).flatMap(([category, entries]) => entries.map(([id, slug, imageAlt, extension = 'png']) => [
    `${category}:${id}`,
    {
      image: category === 'signs'
        ? `/learning/signs/${slug}-v3.png`
        : category === 'directions'
          ? `/learning/directions/${slug}-v2.png`
        : `/learning/${category === 'place' ? 'places' : category}/${slug}-v1.${extension}`,
      imageAlt,
      illustrationVersion: 'vocab-legacy-batch3-v1',
      illustrationReview: 'technical_check_only',
      illustrationSource: 'md/Vocab Illustration Generation Batch 3.json',
    },
  ])),
);
export const VOCAB_GROUPS = [
  { id: 'words', name: 'คำศัพท์ใกล้ตัว' },
  { id: 'communication', name: 'การสื่อสาร' },
  { id: 'culture', name: 'เทศกาลและวัฒนธรรม' },
  { id: 'grammar', name: 'ภาษาและไวยากรณ์' },
];
export const VOCAB_CATEGORIES = [
  { id: 'verbs', name: 'กริยาพื้นฐาน (Action Verbs)', icon: '🏃', tone: 'mint', group: 'words', deckId: 'verbs' },
  { id: 'daily_routine', name: 'กิจวัตรประจำวัน (Daily Routine)', icon: '📅', tone: 'peach', group: 'words', deckId: 'daily_routine' },
  { id: 'transport', name: 'ยานพาหนะ (Transport)', icon: '🚗', tone: 'sky', group: 'words', questId: 'vocabulary', missionId: 'vocab_flip' },
  { id: 'place', name: 'สถานที่ (Places)', icon: '🏫', tone: 'mint', group: 'words', questId: 'vocabulary', missionId: 'vocab_match' },
  { id: 'illness', name: 'การเจ็บป่วย (Illness)', icon: '🏥', tone: 'rose', group: 'words', questId: 'illness', missionId: 'illness_flip' },
  { id: 'jobs', name: 'อาชีพ (Careers)', icon: '👷', tone: 'peach', group: 'words', questId: 'jobs', missionId: 'jobs_match' },
  { id: 'food', name: 'อาหาร (Food)', icon: '🍜', tone: 'lemon', group: 'words', questId: 'food', missionId: 'food_match' },
  { id: 'clothes', name: 'เครื่องแต่งกาย (Clothes)', icon: '👔', tone: 'lilac', group: 'words', questId: 'clothes_fashion', missionId: 'clothes_flip' },
  { id: 'weather', name: 'สภาพอากาศ (Weather)', icon: '🌤️', tone: 'sky', group: 'words', questId: 'weather_seasons', missionId: 'weather_flip' },
  { id: 'emotions', name: 'อารมณ์ความรู้สึก (Feelings)', icon: '😊', tone: 'rose', group: 'words', questId: 'emotions_feelings', missionId: 'emotions_flip' },
  { id: 'countries', name: 'ประเทศและสัญชาติ', icon: '🌍', tone: 'mint', group: 'words', questId: 'world_countries', missionId: 'countries_match' },
  { id: 'shapes', name: 'รูปทรง (Shapes)', icon: '🔷', tone: 'lilac', group: 'words', questId: 'shapes_colors', missionId: 'shapes_flip' },
  { id: 'environment', name: 'สิ่งแวดล้อม (Eco)', icon: '🌿', tone: 'mint', group: 'words', questId: 'nature_environment', missionId: 'env_flip' },
  { id: 'subjects', name: 'วิชาเรียน (Subjects)', icon: '📚', tone: 'sky', group: 'words', questId: 'school_subjects', missionId: 'sub_match' },
  { id: 'signs', name: 'ป้ายสัญลักษณ์ (Signs)', icon: '🚦', tone: 'peach', group: 'communication', questId: 'signs', missionId: 'signs_flip' },
  { id: 'directions', name: 'ทิศทาง (Directions)', icon: '🧭', tone: 'mint', group: 'communication', questId: 'directions', missionId: 'dir_flip' },
  { id: 'greeting', name: 'ทักทาย (Greeting)', icon: '💬', tone: 'rose', group: 'communication', questId: 'conversation', missionId: 'convo_flip' },
  { id: 'question_words', name: 'คำถาม WH-Questions', icon: '❓', tone: 'lilac', group: 'communication', questId: 'reading', missionId: 'reading_wh' },
  { id: 'culture_festivals', name: 'เทศกาลและวัฒนธรรม (Festivals & Culture)', icon: '🎉', tone: 'lemon', group: 'culture', deckId: 'culture_festivals' },
  { id: 'numbers', name: 'ตัวเลขลำดับ (Ordinal)', icon: '🔢', tone: 'lemon', group: 'grammar', questId: 'numbers', missionId: 'numbers_flip' },
  { id: 'pronouns', name: 'สรรพนาม (Pronouns)', icon: '👥', tone: 'rose', group: 'grammar', questId: 'pronouns_master', missionId: 'pm_flip' },
  { id: 'quantifiers', name: 'ปริมาณ (Quantifiers)', icon: '🥛', tone: 'sky', group: 'grammar', questId: 'nouns_quantifiers', missionId: 'nq_match' },
  { id: 'tenses', name: 'ไวยากรณ์ Tenses', icon: '⚡', tone: 'lilac', group: 'grammar', questId: 'tenses_arena', missionId: 'ten_flip' },
];
const MISSIONS = { ...CH1_MISSIONS, ...CH2_MISSIONS, ...CH5_MISSIONS };
export function getDrillMission(category) {
  if (!category) return null;
  if (category.deckId) return NEW_DECKS[category.deckId] || null;
  return MISSIONS[category.questId]?.find(m => m.id === category.missionId) || null;
}
export function getDrillCards(category) {
  const mission = getDrillMission(category);
  if (!mission) return [];
  const cards = mission.cards || (mission.pairs || []).map(p => {
    if (category.id === 'countries') {
      const country = p.left.replace(/[\p{Regional_Indicator}\ufe0f]/gu, '').trim();
      const nationalityThai = { cn1: 'สัญชาติไทย', cn2: 'สัญชาติญี่ปุ่น', cn3: 'สัญชาติจีน', cn4: 'สัญชาติเกาหลี', cn5: 'ชาวอังกฤษ / สัญชาติบริติช', cn6: 'สัญชาติอเมริกัน' }[p.id];
      return {
        id: p.id, front: country, frontLabel: country, frontType: 'text',
        frontCaption: 'ประเทศ (Country)',
        back: p.right, backCaption: 'สัญชาติ (Nationality)',
        backThai: nationalityThai,
        example: `Country: ${country}. Nationality: ${p.right}.`,
        exampleThai: `ประเทศ: ${p.leftThai} · ${nationalityThai}`,
      };
    }
    if (category.id === 'jobs') {
      const clean = value => value.replace(/[\p{Extended_Pictographic}\p{Regional_Indicator}\u200d\ufe0f]/gu, '').trim();
      const word = clean(p.left);
      return { id: p.id, front: word, frontType: 'text', frontLabel: word, back: word, backThai: p.leftThai, hint: `สถานที่ทำงาน: ${clean(p.right)}` };
    }
    // Food matching uses Thai on the left and an English label with artwork on the right.
    if (!p.leftThai && /\p{Script=Thai}/u.test(p.left) && /[A-Za-z]/.test(p.right)) {
      const parts = [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(p.right)].map(s => s.segment);
      const word = parts.filter(s => !/\p{Extended_Pictographic}/u.test(s)).join('').trim();
      const visual = parts.filter(s => /\p{Extended_Pictographic}/u.test(s)).join('');
      return { id: p.id, front: visual || word, frontType: visual ? 'symbol' : 'text', frontLabel: word, back: word, backThai: p.left };
    }
    return { id: p.id, front: p.right, frontLabel: p.left, back: p.left, backThai: p.leftThai };
  });
  return cards.map(c => ({
    ...c,
    frontType: c.frontType || (/[A-Za-z]/.test(c.front) ? 'text' : 'symbol'),
    ...(LEGACY_ILLUSTRATION_LOOKUP[`${category.id}:${c.id}`] || {}),
  }));
}
