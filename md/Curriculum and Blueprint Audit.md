# Curriculum and Blueprint Audit

วันที่ตรวจ: 2026-10-13

อัปเดตประกอบ: [ตารางจับคู่ SET1-SET7 ครบ 44 หัวข้อ](<C:/Users/Omarov/Desktop/o net2/md/SET1-SET7 Curriculum Mapping.md>) ตรวจ checklist Word ทั้ง 8 ไฟล์แล้ว ให้ใช้ตารางนี้ประกอบก่อนตัดสินใจเพิ่มหรือย้ายด่าน โครงสร้าง 6 โลกในรายงานนี้ยังเป็นข้อเสนอเบื้องต้น ไม่ใช่แผนย้ายที่อนุมัติแล้ว

## 1. ข้อสรุปสำหรับตัดสินใจ

**ยังไม่ควรรับรองว่าเกมครอบคลุมเอกสารครบ เรียงง่ายไปยากครบ หรือสร้างข้อสอบตรง Test Blueprint O-NET ป.6 แล้ว**

เกมมีเนื้อหาที่เกี่ยวข้องจำนวนมากและมี UI ฝึกเรียนที่ดีขึ้น แต่ยังมีปัญหาด่านไม่มี Quiz, หน่วยปะปน, ข้อซ้ำ, โหมดสอบคนละรูปแบบ และการแสดงสิ่งเร้าไม่ครบในหน้าสอบ

แนะนำให้เพิ่ม milestone **Content QA / Curriculum Alignment** ก่อนเดินหน้าเปิดขาย โดยไม่จำเป็นต้องรื้อ frontend หรือเปลี่ยน quest ID ทั้งหมด

รายงานนี้เป็นการตรวจโครงสร้างคลังทั้งหมดร่วมกับตรวจเอกสารและตัวอย่างเนื้อหา ไม่ใช่การรับรองความถูกต้องของเฉลยทุกข้อ ความยากเชิงสถิติ หรือสิทธิ์นำเอกสารไปใช้เชิงพาณิชย์

## 2. ขอบเขตและวิธีตรวจ

- อ่านข้อมูลข้อสอบที่โปรแกรม import จริงจาก `QUESTS`, mission catalogs, LESSONS, Pre-test, Arena pools, Final Boss และโค้ด Simulator
- ตรวจสคริปต์สุ่มจริงใน QuizPage, ExamMode และ getFinalExamPool ไม่อนุมานจากชื่อปุ่มหรือคำอธิบายโหมด
- สกัดข้อความ PDF ใน workspace 62 ไฟล์ ตัดไฟล์ที่ hash ซ้ำ 11 ไฟล์ เหลือ 51 ไฟล์ไม่ซ้ำ รวม 853 หน้า
- PDF หลักที่ผู้ใช้แนบ 5 เล่มรวม 472 หน้า; ตรวจโครงสร้าง/หัวข้อและตัวอย่างหน้า ไม่ได้ตรวจเฉลยด้วยมือครบทุกหน้า
- เทียบข้อความโจทย์กับ PDF เพื่อหาตัวอย่างแหล่งที่มา การไม่พบข้อความตรงกันไม่พิสูจน์ว่าเนื้อหาขาด เพราะมีภาพ ข้อเขียน และการดัดแปลงโจทย์
- แสดงภาพหน้าเอกสารที่เกี่ยวข้องจริง รวมตาราง Blueprint ไม่ใช้ text extraction อย่างเดียวกับตารางที่มีเซลล์รวม
- ตรวจเอกสารทางการปี 2568 และ 2569 จาก สทศ. ณ วันที่ตรวจ
- จำลอง getFinalExamPool 500 ชุด ด้วย seed 20261013; เป็นการทดสอบการประกอบชุดในเครื่อง ไม่ใช่ผลนักเรียนจริง
- ไม่แก้ข้อสอบ ไม่แก้ production database และไม่ย้ายความก้าวหน้านักเรียนในรอบวิเคราะห์นี้

หลักฐานที่รันซ้ำได้:

- [สคริปต์ตรวจคลัง](<C:/Users/Omarov/Desktop/o net2/scratch/audit_question_bank.mjs>)
- [ผลตรวจคลัง JSON](<C:/Users/Omarov/Desktop/o net2/scratch/content-audit/bank.json>)
- [ตาราง coverage ของทุกด่าน CSV](<C:/Users/Omarov/Desktop/o net2/scratch/content-audit/quest-coverage.csv>)
- [รายการเอกสารและ hash](<C:/Users/Omarov/Desktop/o net2/scratch/content-audit/documents.json>)
- [ตัวอย่างข้อความที่ตรงแหล่ง PDF](<C:/Users/Omarov/Desktop/o net2/scratch/content-audit/source-text-matches.json>)

## 3. ไฟล์แนบเหมาะใช้เป็นอะไร

| เอกสาร | หลักฐานที่ตรวจ | การใช้ที่เหมาะสม / ข้อจำกัด |
|---|---|---|
| [01 ใบงานประกอบการติว](<C:/Users/Omarov/Desktop/o net2/01ใบงานประกอบการติว O-NET ป.6.pdf>), 99 หน้า | หน้า PDF 2-18 ยานพาหนะ/สถานที่/ทิศทาง/ป้าย, 19-39 เสื้อผ้า/ซื้อขาย/อาหาร/เทศกาล, 46-61 รูปทรง/ประเทศ/อารมณ์/วิชา, 62-87 งานอดิเรก/กีฬา/สิ่งแวดล้อม/ตัวเลข/ห้องเรียน | เหมาะสร้างภาพจับคู่ บทสนทนา และสถานการณ์; ไม่ใช่จำนวนข้อหรือสัดส่วน Blueprint โดยตัวมันเอง |
| [03 เฉลยสำหรับครู](<C:/Users/Omarov/Desktop/o net2/03เฉลยใบงานประกอบการติว O-NET ป.6 สำหรับครู แยก.pdf>), 51 หน้า | หน้า PDF 2-5 แสดงเฉลยภาพและคำศัพท์ที่สอดคล้องกับใบงานชุดแรก | ใช้จับคู่คำตอบกับใบงานตามหน้า/กิจกรรม ไม่ควรนำเฉลยมาทำเป็นข้อใหม่แล้วนับเป็น coverage เพิ่ม |
| [English Worksheet P6](<C:/Users/Omarov/Desktop/o net2/English Worksheet P6.pdf>), 50 หน้า | Greeting หน้า 2-5, Noun 6-11, Pronoun 12-26, Occupation 27-28, Place 29-30, Quantifiers 31-37, Question Words 38-42, Festival 43-48, Adjective 49-50 | เป็นแหล่ง scaffold พื้นฐานที่ควรอยู่ก่อนโจทย์สองขั้น ไม่ควรยึดรหัสตัวชี้วัดที่พิมพ์บนใบงานโดยไม่ตรวจเทียบ Blueprint ทางการ |
| [ชุดติวพิชิตข้อสอบ ปี 2568](<C:/Users/Omarov/Desktop/o net2/ชุดติวพิชิตข้อสอบวิชาภาษาอังกฤษ O-NET ปี 2568.pdf>), 255 หน้า | สารบัญหน้า PDF 3-4; ตาราง Blueprint เป็นภาพหน้า 5-10; มีเนื้อหาป้าย วัฒนธรรม เสียง/intonation วรรคตอน บทสนทนา grammar และข้อสอบย้อนหลัง | เหมาะเป็นกรอบตรวจช่องว่างและตัวอย่างระดับข้อสอบ; ในเกมยังไม่มี source/page mapping ที่ยืนยันนำเข้าครบ |
| [โค้งหักศอก](<C:/Users/Omarov/Desktop/o net2/โค้งหักศอก ติว o-net.pdf>), 17 หน้า | หน้า 1 ระบุชัดว่า **O-NET ภาษาอังกฤษ ม.3**; หน้า 1-2 เป็นสูตรสถานการณ์/คำตอบ | ใช้คัดเทคนิคที่เหมาะกับ ป.6 เท่านั้น ไม่ควรใช้โครงสร้าง Part หรือความยากทั้งเล่มเป็นเกณฑ์ ป.6 |
| [restore_level_title.cjs](<C:/Users/Omarov/Desktop/o net2/restore_level_title.cjs>) | อ่านแล้วเป็นสคริปต์ต่อฟังก์ชัน getLevelTitle ลง scoring.js | ไม่ใช่เอกสารหลักสูตร ไม่ใช่ระบบจัดความยาก; ชื่อ Level ตาม XP ไม่พิสูจน์ทักษะ และไม่ควรรันซ้ำเพื่อตรวจเนื้อหา |

ตัวอย่างที่ต้องใช้ดุลพินิจมากกว่าคัดลอก: SET1 เครื่องดื่ม หน้า PDF 5 ใช้คำถาม offer a Thai drink แต่ตัวเลือกเดิมเป็น Do you like Thai iced tea? เกมเพิ่งปรับเป็น Would you like some Thai iced tea? ให้ตรงเจตนาแล้ว แสดงว่าแม้มีแหล่ง PDF ก็ต้องตรวจความหมายของโจทย์กับเฉลยอีกครั้ง

## 4. Blueprint ทางการและสิ่งที่เกมทำอยู่

แหล่งทางการ:

- [หน้ารวมปี 2568](https://www.niets.or.th/th/content/view/26632)
- [Blueprint ภาษาอังกฤษ ป.6 ปี 2568](https://www.niets.or.th/uploads/editor/files/O-NET/TB%20Eng%20p6-68%20%2823-8-68%29.pdf)
- [หน้ารวมปี 2569](https://www.niets.or.th/th/catalog/view/212)
- [Blueprint ภาษาอังกฤษ ป.6 ปี 2569](https://www.niets.or.th/uploads/editor/files/O-NET/TB_63EngP6%20O_NET69.pdf)

ตรวจตารางทั้งสองปีแล้ว: 32 ข้อ, ปรนัย 4 ตัวเลือก 1 คำตอบ, ข้อละ 3.125 คะแนน, 100 คะแนน, 60 นาที

| กลุ่มมาตรฐาน | จำนวนข้อ | สัดส่วน | หมายเหตุในการติดแท็ก |
|---|---:|---:|---|
| ต 1.1 | 6 | 18.75% | รวม ป.6/3 และ ป.6/4 ไม่ใช่ 6 ข้อต่อแต่ละตัวชี้วัด |
| ต 1.2 | 10 | 31.25% | กลุ่มการสื่อสาร โต้ตอบ คำสั่ง ขอร้อง ความต้องการ ข้อมูลและความรู้สึก |
| ต 1.3 | 6 | 18.75% | ข้อมูลตนเอง/สิ่งแวดล้อม ภาพ/ผัง/กราฟ/ตาราง และความคิดเห็น |
| ต 2.1 | 2 | 6.25% | เทศกาลและชีวิตความเป็นอยู่ของเจ้าของภาษา |
| ต 2.2 | 4 | 12.50% | เปรียบเทียบภาษา/วัฒนธรรม เสียง วรรคตอน และลำดับคำ |
| ต 4.1 | 4 | 12.50% | ใช้ภาษาในห้องเรียนและสถานศึกษา |

**ห้ามเทียบหนึ่งต่อหนึ่งว่า signs = ต 1.1 หรือ grammar = ต 2.2 ทุกข้อ** ต้องดูว่าข้อนั้นวัดอะไร ตัวอย่างคำว่า food อาจอยู่ได้หลายมาตรฐานตามงานที่ให้ทำ

| โหมดในเกม | สิ่งที่ตรวจพบ | ข้อสรุป |
|---|---|---|
| Quiz รายด่าน | สุ่มรายการในด่านสูงสุด 10 ข้อ ด้วย sort(Math.random); ไม่มี quota ตามตัวชี้วัด/ความยาก | เหมาะเป็น practice ไม่ใช่ข้อสอบ Blueprint |
| Pre-test | มี 20 ข้อ กระจาย 7 หมวดทักษะเดิม | เป็น diagnostic แบบย่อ ยังไม่ใช่ O-NET จำลอง |
| Full Mock / Final Exam Simulation | 30 ข้อ 30 นาที; สุ่มจาก pool ทั้งก้อน | ทั้งจำนวน เวลา และ quota ไม่ตรงสนามจริงตาม Blueprint ที่ตรวจ |
| สอบปลายภาค | 50 ข้อ 60 นาที ข้อละ 2 คะแนน | ใช้เป็นข้อสอบภายในโรงเรียนได้ แต่ห้ามเรียกว่า O-NET ตรง Blueprint โดยไม่มีอีก profile |
| Real O-NET Simulator 5 Parts | 45 ข้อ 45 นาที; หมวด 10/10/10/10/5 | เป็นชุดฝึกที่ตั้งเอง ไม่ใช่ Blueprint ป.6 ทางการ |

### ผลจำลองชุดปลายภาค 500 ชุด

ทุกชุดได้ quota ที่โค้ดกำหนด: grammar 10, reading 10, conversation 8, signs 8, vocabulary 5, directions 3, food 2, classroom 2, question_words 2

ดังนั้นระบบ **ทำ quota ภายในได้ แต่ quota นี้ไม่ใช่ quota มาตรฐานทางการ** และข้อมูลไม่ได้ติด standard/indicator จึงยังคำนวณสัดส่วนที่แท้จริงตามมาตรฐานไม่ได้

พบคำถามชนิด two_step ในชุดที่สุ่ม 0-6 ข้อต่อชุด; 485/500 ชุดมีอย่างน้อยหนึ่งข้อ ขณะที่ ExamMode ไม่แสดงส่วนเหตุผล จึงต้องแปลงหรือแยก pool ก่อนใช้สอบแบบ MCQ

481/500 ชุดมีข้อที่เก็บ image และ 466/500 มีข้อที่เก็บ passage แต่โค้ด ExamMode แสดงเฉพาะ question/options ไม่ render image/passage ผลนี้เป็นการตรวจ data + renderer ไม่ใช่ผลทำข้อสอบของนักเรียน

การ deduplicate ชุดปลายภาคใช้ข้อความ question อย่างเดียว จึงอาจทิ้งข้อที่ใช้คำถามเหมือนกันแต่คนละภาพ เช่น What does this symbol mean? ของ family กับ school ต้องใช้ item/stimulus identity แทน

## 5. คุณภาพและการแบ่งคลังปัจจุบัน

- 33 ด่าน; จำนวนรายการใน QUESTS รวม 697, เหลือ 460 signatures เมื่อเทียบ question + passage + image + ตัวเลือก + เฉลย + เหตุผล
- 237 รายการเกินจาก signatures ระดับคลังรวม; ส่วนซ้ำภายในด่านรวม 207 รายการ บางส่วนซ้ำข้ามบอสโดยตั้งใจ ไม่ควรสรุปว่าทุกการซ้ำเป็นบั๊ก
- Vocabulary / Grammar / Market / Directions แต่ละด่านมี 50 รายการ แต่มีเนื้อหาไม่ซ้ำตามนิยามข้างต้นเพียง 20 signatures
- ไม่พบ difficulty, standard, indicator, blueprintCode, source, sourcePage ในข้อมูล QUESTS ที่ตรวจ
- มี translation field 73 รายการ; ไม่ใช่ตัวเลขคำแปลทั้งหมดที่แสดงได้ เพราะมี dictionary fallback และโจทย์ภาษาไทยอยู่แล้ว
- MiniLesson มีตรงกับด่านปัจจุบัน 8/33 ด่าน; ด่านที่ไม่มี lesson ข้ามไป Quiz เลย
- ตรวจโครงสร้าง options/answer แล้วไม่พบ answer index หลุดช่วงใน 697 รายการ; **ไม่ได้ยืนยันว่าเฉลยถูกทางภาษาและบริบททุกข้อ**

### ปัญหาที่ต้องแก้ก่อนเพิ่มด่าน

1. **Quiz ว่าง 3 ด่าน:** shapes_colors, tenses_arena, clothes_fashion เพราะ ch5QuizQuestions ดึงเฉพาะ mission type fill_blank แต่สามด่านนี้เป็น flashcard/matching/rearrange
2. **ติด progression สำหรับผู้เรียนใหม่:** scoring ต้องผ่านทุกด่าน; จำลองผ่านด่านที่มีข้อสอบทั้งหมดในบท 1 แล้ว conversation ในบท 2 ยังไม่ปลดล็อก เพราะ shapes_colors ไม่มีทางผ่าน Quiz ปัจจุบัน Game Mission completion ให้ XP แต่ไม่ได้ตั้ง questPassed
3. **หน่วย School ปะปน 50/60 ข้อ:** set1Part2 นำสิ่งแวดล้อม เครื่องดื่ม เวลาว่าง ซื้อขาย และอากาศหมวดละ 10 ข้อไปต่อใน school; ไม่ควรถือว่าเป็นการวัด classroom 60 ข้อ
4. **SET5 คำสั่ง/ขอร้อง/คำแนะนำอยู่ใน Signs:** เนื้อหาเกี่ยวข้องกับ communication แต่รวมอยู่กับป้าย ทำให้รายงานทักษะและ quota จากชื่อด่านคลาดเคลื่อน
5. **Reading รวมโจทย์ภาพ ผัง กราฟ ตาราง และความคิดเห็น:** มีประโยชน์แต่ควรแยก subskills ไม่ใช่ถือว่าทั้งหมดเป็น passage comprehension
6. **ข้อมูล Boss ไม่ใช่หลักสูตรคนละชุด:** QUESTS finalboss ใช้ strategyBossQuestions เดียวกับ strategy_boss ขณะที่หน้าสอบ FinalBoss import finalBossQuestions อีกชุด 30 ข้อ ต้องกำหนดแหล่งหลักและทำรายงานให้ตรง
7. **Pre-test ตัวหารผิดในบางเส้นทาง:** ข้อสอบจริง 20 ข้อ แต่ App.completePreTest คิดเปอร์เซ็นต์หาร 30; savePreTest ไม่เก็บ total และ scoring fallback total=30 ต้องเก็บ total/version และแก้ข้อมูลรายงานที่เกี่ยวข้องก่อนใช้วัด growth
8. **Simulator เดาคำตอบได้:** ข้อสอบ 45 ข้อกำหนด ans:0 ทุกข้อ และ render opts โดยไม่ shuffle; การเลือก A ทุกข้อจึงไม่ใช่หลักฐานทักษะ
9. **Simulator reading ไม่ตรงบทอ่าน:** passage เรื่อง Mike รองรับคำถามต้นชุด แต่ท้ายชุดถาม Halloween โดยไม่มีข้อความรองรับ ต้องแยก stimulus หรือจัดเป็น culture item
10. **การสอนแบบสูตรตายตัวเสี่ยง:** How ไม่ได้แปลว่าคำตอบเป็น feeling หรือ by+vehicle เสมอ; Main idea ไม่จำเป็นต้องอยู่แค่ประโยคแรก/ท้าย เปลี่ยนเป็นกลยุทธ์พร้อมเงื่อนไขและตัวอย่างโต้แย้ง
11. **schema เฉลยสองขั้น:** บางข้อมูลเก็บ feedback.bothCorrect/mainRightReasonWrong/... แต่หน้าต่างเฉลยใช้ correctFeedback/wrongFeedback จึงอาจได้คำอธิบาย generic ต้อง normalize ให้ renderer อ่านตรง schema

### ตารางทุกด่าน

ตัวเลขไม่ซ้ำเป็น signature ไม่ใช่จำนวนทักษะที่วัดได้ และไม่รวมคำถามทั้งหมดในมินิเกม

| บท | ด่าน | รายการ Quiz | ไม่ซ้ำ | ข้อเสนอหลัก |
|---:|---|---:|---:|---|
| 1 | About Myself | 10 | 10 | เพิ่ม lesson และฝึก self-introduction ก่อนสอบ |
| 1 | Family & Home | 10 | 10 | ใช้ family tree จริง เพิ่มอ่านความสัมพันธ์ |
| 1 | School & Classroom | 60 | 60 | แยก 5 หัวข้อที่ต่อผิดหน่วย |
| 1 | Vocab Village | 50 | 20 | ตัดซ้ำ แยกชุดศัพท์ตามบริบท |
| 1 | Number Arena | 20 | 20 | เพิ่ม date/time/ordinal และการอ่านข้อมูล |
| 1 | Weather & Seasons | 4 | 4 | เติม Quiz และเชื่อม culture อย่างมีบริบท |
| 1 | Food Festival | 30 | 30 | แยก food/ordering/culture เป็น subskills |
| 1 | Health Clinic | 30 | 30 | แยก symptom/asking advice/safety |
| 1 | Shapes & Colors | 0 | 0 | เติม assessment ที่ใช้รูปจริง ไม่บังคับผ่านด่านว่าง |
| 1 | Grammar Boss | 50 | 20 | ย้ายหลังพื้นฐาน pronoun/tense และตัดซ้ำ |
| 2 | Conversation Café | 59 | 29 | แยก greeting/thanks/apology/leave-taking |
| 2 | Conversation Rescue | 8 | 8 | สอนรูปแบบโต้ตอบก่อนโจทย์สองขั้น |
| 2 | Emotions & Feelings | 4 | 4 | เพิ่มชอบ/ไม่ชอบและ because/เหตุผล |
| 2 | Career World | 20 | 20 | ผูกข้อมูลบุคคล/สถานที่ทำงาน |
| 2 | Market Quest | 50 | 20 | ตัดซ้ำ แยก price/change/polite exchange |
| 3 | Question Word Gate | 10 | 10 | ให้ Yes/No, WH, How, Or พร้อมบริบทก่อน reasoning |
| 3 | Pronoun World | 5 | 5 | ย้ายพื้นฐานให้มาก่อน conversation/grammar boss |
| 3 | Tense Mastery | 0 | 0 | เติม Quiz และแยกเรียนรูปประโยคจาก checkpoint |
| 3 | The Question Sphinx | 15 | 15 | ใช้เป็น checkpoint reasoning ไม่ใช่ mock ทางการ |
| 4 | Signs City | 80 | 53 | ย้าย SET5 ออกและเพิ่ม visual sign tasks |
| 4 | Sign Detective | 8 | 8 | เพิ่มข้อที่ต้องตีความเงื่อนไขไม่ใช่แปลคำ |
| 4 | Direction Maze | 50 | 20 | ใช้แผนที่และตัดซ้ำ |
| 4 | Preposition Portal | 4 | 4 | วางพื้นฐานก่อนอ่านแผนที่ |
| 4 | Map Escape | 4 | 4 | เพิ่มการตามเส้นทางหลายขั้น |
| 4 | Reading Dungeon | 80 | 50 | แยก text/image/chart/table/opinion |
| 4 | Reading Detective | 4 | 4 | เติม main idea/inference/evidence |
| 4 | The Logic Dragon | 15 | 15 | จัด source ให้ตรง FinalBoss หน้าสอบจริง |
| 5 | Countable & Quantifiers | 5 | 5 | ย้ายเป็น foundation ก่อนการซื้อขาย |
| 5 | Adjective & Comparison | 4 | 4 | ย้ายพื้นฐานก่อน describing/data comparison |
| 5 | Clothes & Fashion | 0 | 0 | เติม Quiz ผูกการเลือกเสื้อผ้าตามสถานการณ์ |
| 5 | Countries & Nationalities | 3 | 3 | เพิ่มสถานการณ์ ไม่เน้นท่องชื่ออย่างเดียว |
| 5 | Eco & Environment | 2 | 2 | รวมข้อ environment ที่ไปอยู่ school และเพิ่มเหตุผล |
| 5 | School Subjects | 3 | 3 | ใช้ timetable / preference / schedule |

## 6. ง่ายไปยากหรือยัง

**ยังยืนยันไม่ได้ และโค้ดไม่ได้ควบคุมลำดับความยาก** การเรียง chapter หรือ XP Level ไม่ใช่ตัวแทน difficulty

- ไม่พบ difficulty tags ใน QUESTS; Quiz สุ่มจากทั้งด่านทันที
- พื้นฐาน pronoun/quantifier/adjective/preposition บางส่วนอยู่หลังโจทย์ grammar และ two-step
- จำนวนข้อแต่ละด่านต่างกันมาก: 0, 2, 3, 4, 5 ไปจนถึง 80 รายการ ทำให้คะแนนผ่านแต่ละด่านไม่ได้มีความหนักแน่นเท่ากัน
- 13 ด่านมี Quiz 1-9 ข้อ; ยังไม่ควรตีความคะแนน 100% ของชุด 2 ข้อเท่ากับความชำนาญจากข้อใหม่หลายรูปแบบ
- การตอบถูกหลังเห็นเฉลยควรแยกจาก first-attempt accuracy; XP เป็นแรงจูงใจ ไม่ใช่คะแนนวัดทักษะ

ข้อเสนอระดับความยากต่อ subskill (เป็นแนวทางออกแบบ ไม่ใช่สัดส่วนที่ สทศ. กำหนด):

1. Foundation: จับคู่ภาพ/ศัพท์หรือประโยคตรงความหมาย มีตัวช่วย
2. Application: บทสนทนาหรือข้อความใหม่ ต้องเลือกใช้คำให้เข้าบริบท ลดตัวช่วย
3. Transfer: รวมข้อมูล 2 จุด อ่านผัง/ตาราง อธิบายเหตุผล หรือแก้สถานการณ์ใหม่

เริ่มเป้าหมายคลัง 30-45 ข้อไม่ซ้ำต่อด่านหลัก โดยมี 10-15 ข้อต่อระดับเป็นประมาณการสำหรับวางแผน ปรับตามขอบเขตจริง ไม่เพิ่มจำนวนด้วยการทำสำเนา หลัง pilot ให้ครูทวน difficulty และใช้ first-attempt accuracy/เวลา/ตัวลวงช่วยปรับ ไม่อ้างว่าเป็นความยากมาตรฐานก่อนมีข้อมูล

## 7. โครงสร้างหน่วยที่เสนอ

แยก **ลำดับสอน** ออกจาก **กลุ่มมาตรฐานสำหรับออกข้อสอบ** ไม่จำเป็นต้องมีจำนวน chapter เท่ากับจำนวนมาตรฐาน

| โลก/หน่วย | สิ่งที่เรียน | ด่านเดิมที่ควรนำมาใช้ |
|---|---|---|
| 1 Starter Island | ศัพท์รูปธรรม ตัวเลข วันเวลา รูปทรง pronoun และโครงสร้างพื้นฐาน | vocabulary, numbers, shapes_colors, pronouns_master, nouns_quantifiers, adjectives_comp, tenses_arena, prepositions_hub |
| 2 Everyday Life | ตนเอง ครอบครัว โรงเรียน อาหาร/เครื่องดื่ม สุขภาพ อาชีพ สิ่งแวดล้อม งานอดิเรก | about_myself, family, school, food, illness, jobs, weather_seasons, clothes_fashion, nature_environment, school_subjects; ย้ายข้อปะปนจาก school |
| 3 Communication Village | ทักทาย ขอบคุณ ขอโทษ ขอร้อง อนุญาต เสนอ/ปฏิเสธ ความรู้สึกและความคิดเห็น | conversation, conversation_rescue, market, emotions_feelings; ย้าย SET5 จาก signs |
| 4 Reading & Data | คำถามในบริบท ป้าย ผัง กราฟ ตาราง เรื่องสั้น ใจความและเหตุผล | question_words, signs, sign_detective, directions, map_escape, reading, reading_detective |
| 5 Culture & Language Lab | วัฒนธรรม/เทศกาลและการเปรียบเทียบ เสียง/intonation วรรคตอน ลำดับคำ | world_countries เป็นส่วนย่อย; เพิ่ม Festival Bridge / Sound & Sentence Lab ที่เชื่อมมาตรฐานจริง |
| 6 Strategy Checkpoints | ทบทวนแบบบูรณาการ ตอบและเลือกเหตุผล พร้อมกลับซ่อมทักษะเฉพาะ | grammar เป็น checkpoint หลังเรียน foundation, strategy_boss, finalboss |
| สนามสอบแยก | diagnostic / practice mock / official-profile simulation / school final | Arena และโหมดสอบเดิม แต่ตั้งชื่อและ profile ให้ไม่สับสน |

แนวทางนี้ต้องมี prerequisite ระดับ subskill ไม่ใช่ล็อกทุกอย่างจนผ่านบทใหญ่ทั้งหมด และรักษา quest IDs/attempt history เดิมผ่าน mapping/version ห้ามล้างคะแนนผู้ใช้เพื่อจัด chapter ใหม่

## 8. เกมที่ควรเพิ่มหรือเปลี่ยน

| เกม/กิจกรรม | จุดที่วัด | ข้อเสนอ |
|---|---|---|
| Picture & Symbol Match | ความสัมพันธ์ภาพกับประโยค ไม่ใช่แปลศัพท์อย่างเดียว | ใช้ภาพจริงที่จำเป็นต่อการตอบ; เติม Shapes/Clothes assessment ก่อน |
| Classroom Quest / Help & Requests | ภาษาห้องเรียน ขอร้อง อนุญาต ขอช่วย เสนอช่วย | แยกจาก Signs; ใช้บทสนทนามีบทบาทและบริบท |
| Daily Routine & Hobbies | วันเวลา ลำดับกิจกรรม และการให้ข้อมูล | เพิ่ม subquests จากข้อที่อยู่ school ผิดหมวดและเอกสาร SET6 |
| Chart & Table Detective | เปรียบเทียบ/อ่านข้อมูล/แสดงความคิดเห็น | แยกจาก reading รวม; แสดงตารางหรือกราฟครบและไม่บอกเฉลยด้วยสี |
| Festival Bridge | ข้อมูลและเปรียบเทียบวัฒนธรรมไทยกับเจ้าของภาษา | เป็นช่องว่างที่ยังไม่มีด่านเฉพาะชัดเจน ใช้ข้อมูลจากใบงาน/Blueprint ที่ทวนแล้ว |
| Sound & Sentence Lab | intonation วรรคตอน ลำดับคำและความต่างภาษา | เป็นเกมฝึก ไม่ประกาศเป็น official listening section โดยไม่มีหลักฐาน |
| Evidence Boss | เลือกคำตอบและหลักฐาน/เหตุผล | รักษา two-step สำหรับ practice; แปลงเป็น one-answer MCQ ใน official exam profile |

ไม่จำเป็นต้องเพิ่มทุกเกมทันที: priority คือซ่อมด่านว่างและโยกเนื้อหาผิดหน่วยก่อน แล้วเพิ่มเฉพาะช่องว่างที่ coverage matrix ยืนยัน

## 9. การออกข้อสอบให้ตรง Blueprint

1. สร้าง schema กลาง: itemId, itemVersion, primaryStandard, indicator, secondarySkills, topic, difficulty, cognitiveLevel, itemType, stimulusId, sourceFile/sourcePage, correctAnswer, explanation, reviewStatus
2. ให้ครูตรวจและอนุมัติแท็กหลักจากสิ่งที่วัด ไม่ใช้ชื่อด่านแทนมาตรฐาน ข้อหนึ่งนับ quota หลักเพียงหนึ่งกลุ่ม
3. แยก profile อย่างน้อย `practice`, `onet_p6_2569`, `school_final_50`; ระบุปีไว้ ไม่เขียนว่าตรง Blueprint แบบไม่บอกปี
4. official profile เลือก MCQ ที่ approved เท่านั้นตาม 6/10/6/2/4/4 และเวลา/คะแนนที่ตรง; ถ้าคลังไม่พอ ต้องแจ้งว่าออกชุดไม่ได้ ไม่เงียบไปเติม general questions
5. กำหนดข้อย่อยขั้นต่ำภายในกลุ่มสำหรับ coverage เป็นนโยบายสำนักเรียนแยกจาก quota ทางการ ไม่อ้างจำนวนย่อยที่ Blueprint ไม่กำหนด
6. สุ่มไม่ซ้ำโดย item identity + stimulus; รักษากลุ่ม passage/table กับคำถามที่เกี่ยวข้อง ไม่ dedupe จาก stem อย่างเดียว
7. สุ่มตัวเลือกและ remap answer อย่างถูกต้อง; รักษาตัวเลือกแบบลำดับ/ข้อความที่อ้าง A-D และตรวจคำตอบไม่กระจุกตำแหน่งเดียว
8. ตรวจ renderer รองรับ image/passage/table ทุกข้อ; ไม่เอา two-step ไปแสดงเป็น one-step แบบเงียบ ๆ
9. เก็บ seed, item versions และ blueprintVersion ใน attempt เพื่อย้อนตรวจรายงานได้
10. เพิ่ม tests ตรวจ profile totals/quotas, approved-only, no duplicates, missing stimulus, finite scoring, empty bank, insufficient quotas และสัดส่วนเมื่อสุ่มหลาย seed

ยังไม่ควรสร้างกราฟเปอร์เซ็นต์ alignment ต่อมาตรฐานจากคลังเดิม เพราะไม่มีแท็กมาตรฐานที่ผ่านการตรวจ ตัวเลขเปอร์เซ็นต์ในรายงานนี้เป็นเฉพาะ quota ทางการและผลนับโครงสร้าง ไม่ใช่คะแนนรับรองคุณภาพหลักสูตร

## 10. UI ที่เหมาะกับเกมการศึกษา

- แยกหน้าเล่นตามเจตนา: เรียนรู้ / ฝึกใช้ / ท้าทาย / จำลองสอบ แทนแสดงชื่อ component เช่น CLASSIC หรือ quest ID
- MissionSelect ใช้ชื่อด่านจริง เป้าหมายทักษะ และลำดับแนะนำ; มี lesson แบบสั้นก่อน activity โดยไม่บังคับเปิด tutorial ยาวทุกครั้ง
- แผนที่ใช้ตัวละคร/ฉาก/สีประจำโลกเพื่อความสนุก ส่วนโจทย์เป็นพื้นที่สงบแบบที่ปรับแล้ว; ไม่เพิ่มแอนิเมชันรบกวนขณะอ่าน
- โจทย์ภาพและบทอ่าน: desktop แสดงสิ่งเร้ากับคำถามข้างกันเมื่อพอดี; mobile เรียงสิ่งเร้าก่อนคำถาม มี zoom ภาพและตารางไม่ล้น
- เน้นศัพท์เป้าหมาย ไม่ขีดเส้นใต้ทุกคำ; ปุ่มเสียงแยกจากปุ่มเลือกคำตอบ
- แสดงความสำเร็จจากทักษะ: คะแนนครั้งแรก/คะแนนล่าสุด/จำนวนข้อใหม่ที่ผ่าน/ข้อที่ทบทวนสำเร็จ แยกจากดาวสะสมและ XP
- ด่านว่างใช้สถานะไม่เปิดประเมิน พร้อมไม่กีดขวางเส้นทางเรียนตามนโยบายที่ชัดเจน ไม่แสดงพร้อมเล่นจนถึงหน้าไม่มีข้อสอบ
- คำตอบผิดใน practice: เฉลยเพื่อเรียนรู้ ไม่หักค่าดูเฉลยเพิ่ม; ถ้าจะทดสอบ mastery ต้องใช้ข้อใหม่ ไม่ใช้คำตอบที่เพิ่งเผยเป็นหลักฐานเดียว
- โหมดจำลองสอบ: ไม่มีแปล/คำใบ้/เฉลย/คำอธิบายระหว่างสอบ; ปุ่มเสียงใช้ตาม profile ไม่เปิดตัวช่วยเกินกว่าที่กำหนด; มีปักหมุดข้อและแผงสถานะคำตอบ
- ครูเห็น coverage matrix ตามตัวชี้วัดและระดับ difficulty ที่ตรวจแล้ว พร้อมกลุ่มที่ข้อมูลยังไม่พอ ไม่ใช้ completion count เพียงอย่างเดียว
- ขนาดตัวอักษรโจทย์ประมาณ 18-22px, ปุ่มสัมผัสอย่างน้อย 44px, focus ชัด, ไม่พึ่งสีอย่างเดียว, reduced motion และคำอธิบายภาพที่ไม่เฉลยคำตอบโดยไม่ตั้งใจ

## 11. ลำดับทำจริงและเกณฑ์ผ่าน

### A. แก้ความถูกต้องที่กีดขวางการเรียนก่อน

- ซ่อม Quiz ว่าง 3 ด่านหรือกำหนด assessment ทางเลือกที่บันทึกผ่านได้จริง
- ทดสอบนักเรียนใหม่ตั้งแต่บท 1 จนเปิดบท 2 โดยไม่ใช้ข้อมูลเก่าเปิดทาง
- แก้ denominator Pre-test และบันทึกจำนวนข้อ/เวอร์ชันจริง
- ทำ renderer สอบให้แสดง image/passage ครบ และป้องกัน item type ที่ไม่รองรับ
- แก้ Simulator คำตอบ A ทุกข้อ และชื่อ/จำนวน/เวลาให้ตรง profile ที่ประกาศ

### B. จัดคลังและตรวจเฉลย

- ตัดซ้ำในด่านหลัก แยก School/Signs/Reading ที่ปะปน พร้อม mapping ประวัติเดิม
- Normalize เฉลย two-step และแยกผลก่อน/หลังดูเฉลย
- ตรวจเฉลยและตัวลวงโดยครู อ้าง source/page และบันทึกการดัดแปลงเนื้อหา
- ตรวจสิทธิ์การใช้เอกสาร/ภาพก่อนนำเข้าขาย ไม่ถือว่าไฟล์ที่มีอยู่ในเครื่องแปลว่าเผยแพร่ต่อได้ทันที

### C. ทำ Blueprint Engine และปรับเส้นทางเรียน

- ติด standard/indicator/difficulty ให้ครบ approved pool
- ทำ official profile 32 ข้อ แล้วทดสอบ quota หลาย seed
- ออกแบบแผนที่ 6 โลกแบบ mapping IDs เดิม + แยกสนามสอบ
- เติมด่านที่ coverage ขาดจริง และ pilot เพื่อดูความยาก/คุณภาพตัวลวง

### Definition of Done สำหรับ milestone นี้

- ไม่มี mandatory quest ที่ประเมินผ่านไม่ได้
- ข้อสอบทุกข้อใน official pool ผ่าน review และแสดง stimulus ครบ
- ไม่เกิดข้อซ้ำในกระดาษเดียวกัน และได้ quota ที่ตรวจซ้ำได้
- Pre/Post/Growth ใช้ total และ profile ที่เปรียบเทียบกันได้
- มี curriculum coverage ราย indicator พร้อมแยก unknown/unreviewed
- ครูตรวจเนื้อหา ตัวลวง และแหล่งที่มาครบตาม approved release
- เล่นได้ตั้งแต่นักเรียนใหม่จนจบเส้นทางบน desktop/mobile โดยไม่ล้างข้อมูลเดิม

สถานะ: รายงานและข้อเสนอเท่านั้น ยังไม่ได้ implement การเปลี่ยนหลักสูตร/คลัง/Blueprint Engine
