// Original Grade 6 O-NET-style practice. These items assess language in
// context and are not copied from an official examination.
const q = (quest, n, question, options, answer, explanation, extra = {}) => ({
  id: `${quest}_context_${String(n).padStart(2, '0')}`, quest, question, options, answer,
  correctFeedback: explanation, wrongFeedback: explanation, keyword: explanation,
  itemVersion: 'onet-context-v1', intendedMode: 'practice_assessment', ...extra,
});

const pronouns = [
  q('pronouns_master',1,'Mina is my best friend. ___ lives next door.',['He','She','It','They'],1,'Mina เป็นผู้หญิงจึงใช้ She'),
  q('pronouns_master',2,'My parents are teachers. ___ work at the same school.',['We','It','They','He'],2,'My parents เป็นพหูพจน์จึงใช้ They'),
  q('pronouns_master',3,'This is my new bicycle. ___ is blue.',['They','He','She','It'],3,'สิ่งของหนึ่งชิ้นใช้ It'),
  q('pronouns_master',4,'Tom and I are classmates. ___ study together.',['We','They','You','It'],0,'Tom and I รวมผู้พูดจึงใช้ We'),
  q('pronouns_master',5,'A: Is this notebook yours? B: Yes, it is ___.',['mine','my','me','I'],0,'Mine เป็น possessive pronoun ใช้แทน my notebook'),
  q('pronouns_master',6,'Jane called Peter, but he did not hear ___.',['she','hers','her','they'],2,'หลังกริยา hear ต้องใช้ object pronoun her'),
  q('pronouns_master',7,'The boys made the model by ___.',['himself','ourselves','herself','themselves'],3,'The boys เป็นพหูพจน์ ใช้ themselves'),
  q('pronouns_master',8,'That red bag belongs to Kate. It is ___.',['her','hers','she','their'],1,'Hers แปลว่าของเธอและไม่ต้องมีคำนามตามหลัง'),
  q('pronouns_master',9,'Our teacher gave ___ some homework.',['we','our','us','ours'],2,'หลังกริยา gave ใช้ object pronoun us'),
  q('pronouns_master',10,'A: Who is at the door? B: It is ___.',['I','my','mine','me'],3,'หลัง It is ในบทสนทนาทั่วไปใช้ object pronoun me'),
];

const prepositions = [
  q('prepositions_hub',1,'The clock is ___ the wall.',['in','on','under','between'],1,'สิ่งที่ติดอยู่บนผนังใช้ on the wall'),
  q('prepositions_hub',2,'The cat is hiding ___ the table.',['under','over','between','opposite'],0,'อยู่ใต้โต๊ะใช้ under'),
  q('prepositions_hub',3,'The bank is ___ the post office and the café.',['behind','near','between','across'],2,'อยู่ตรงกลางสองสถานที่ใช้ between'),
  q('prepositions_hub',4,'Our classroom is ___ the second floor.',['at','on','in','from'],1,'ชั้นของอาคารใช้ on the second floor'),
  q('prepositions_hub',5,'Meet me ___ the bus stop at 7 a.m.',['at','on','between','under'],0,'จุดนัดหมายเฉพาะแห่งใช้ at'),
  q('prepositions_hub',6,'The library is opposite the park. It is ___ the street from the park.',['through','across','inside','behind'],1,'Across the street หมายถึงอยู่อีกฝั่งถนน'),
  q('prepositions_hub',7,'There is a small garden ___ our house.',['during','without','behind','until'],2,'ตำแหน่งด้านหลังบ้านใช้ behind'),
  q('prepositions_hub',8,'The picture shows a ball ___.',['between two boxes','above two boxes','inside a box','behind a box'],0,'ภาพแสดงวัตถุอยู่ระหว่างกล่องสองใบ',{image:'/learning/directions/between-v2.png',imageAlt:'ลูกบอลอยู่ตรงกลางระหว่างกล่องสองใบ'}),
  q('prepositions_hub',9,'The pharmacy is next to the clinic. Which statement is true?',['They are far apart.','They are beside each other.','The clinic is underground.','The pharmacy is inside the clinic.'],1,'Next to หมายถึงอยู่ข้างกัน'),
  q('prepositions_hub',10,'A bird is flying ___ the trees.',['below','between','above','inside'],2,'นกบินสูงกว่าต้นไม้ใช้ above'),
];

const quantifiers = [
  q('nouns_quantifiers',1,'How ___ water do you drink each day?',['many','much','few','several'],1,'Water เป็นคำนามนับไม่ได้ ใช้ How much'),
  q('nouns_quantifiers',2,'There are ___ apples in the basket.',['a little','much','any','five'],3,'Apples นับได้และมีจำนวนห้า ใช้ five'),
  q('nouns_quantifiers',3,'We do not have ___ milk left.',['any','many','a few','several'],0,'ประโยคปฏิเสธกับคำนามนับไม่ได้ใช้ any'),
  q('nouns_quantifiers',4,'Only ___ students came early, but most arrived later.',['much','a little','a few','any'],2,'Students นับได้และมีจำนวนน้อย ใช้ a few'),
  q('nouns_quantifiers',5,'Please add ___ sugar. The tea is already sweet.',['many','a little','a few','several'],1,'Sugar นับไม่ได้ ใช้ a little'),
  q('nouns_quantifiers',6,'How ___ books did you borrow?',['much','little','many','any'],2,'Books เป็นคำนามนับได้พหูพจน์ ใช้ How many'),
  q('nouns_quantifiers',7,'There is ___ rice in the pot, enough for everyone.',['some','many','a few','several'],0,'Rice นับไม่ได้ ใช้ some ในประโยคบอกเล่า'),
  q('nouns_quantifiers',8,'Which noun is uncountable?',['Bottle','Chair','Advice','Coin'],2,'Advice เป็นคำนามนับไม่ได้'),
  q('nouns_quantifiers',9,'I have two ___ for the school trip.',['luggage','luggages','piece of luggage','pieces of luggage'],3,'Luggage นับไม่ได้ ต้องใช้ two pieces of luggage'),
  q('nouns_quantifiers',10,'There are not ___ chairs for all the guests.',['enough','much','a little','any of'],0,'Enough chairs หมายถึงเก้าอี้เพียงพอ'),
];

const comparisons = [
  q('adjectives_comp',1,'An elephant is ___ than a dog.',['heavy','heaviest','heavier','more heavy'],2,'คำคุณศัพท์พยางค์สั้นใช้ heavier than'),
  q('adjectives_comp',2,'Mount Everest is ___ mountain in the world.',['high','higher','the higher','the highest'],3,'เปรียบเทียบที่สุดใช้ the highest'),
  q('adjectives_comp',3,'This book is ___ interesting than that one.',['more','most','much','many'],0,'Interesting ใช้ more ใน comparative'),
  q('adjectives_comp',4,'My two pencils are the same length. The red one is ___ the blue one.',['longer than','as long as','the longest','shorter than'],1,'ความยาวเท่ากันใช้ as long as'),
  q('adjectives_comp',5,'Today is 30°C. Yesterday was 25°C. Today is ___.',['colder','hottest','hotter','as cold as'],2,'30°C ร้อนกว่า 25°C ใช้ hotter'),
  q('adjectives_comp',6,'Of the three runners, May finished first. She was ___.',['the fastest','faster','fast','more fast'],0,'ในกลุ่มสามคนและเร็วที่สุดใช้ the fastest'),
  q('adjectives_comp',7,'A bicycle is usually ___ than a motorcycle.',['expensive','less expensive','most expensive','as expensive'],1,'จักรยานโดยทั่วไปมีราคาน้อยกว่า ใช้ less expensive'),
  q('adjectives_comp',8,'The blue box weighs 5 kg. The red box also weighs 5 kg. They are ___.',['heavier','lighter','the heaviest','equally heavy'],3,'น้ำหนักเท่ากันจึง equally heavy'),
  q('adjectives_comp',9,'Which sentence is correct?',['My sister is taller than me.','My sister is more tall than me.','My sister is tallest than me.','My sister taller me.'],0,'Tall ใช้ comparative ว่า taller than'),
  q('adjectives_comp',10,'The test was ___ than I expected, so I finished early.',['easy','easier','easiest','the easy'],1,'มี than จึงใช้ comparative easier'),
];

const countries = [
  q('world_countries',1,'Ken is from Japan. He is ___.',['Japan','Japanese','Chinese','Korean'],1,'คนจาก Japan มีสัญชาติ Japanese'),
  q('world_countries',2,'Which country is famous for the Great Wall?',['China','Thailand','Australia','England'],0,'กำแพงเมืองจีนอยู่ใน China'),
  q('world_countries',3,'A: Where are you from? B: ______',['I am Thai.','I speak Thai.','I am from Thailand.','I like Thailand.'],2,'คำถาม Where are you from? ตอบด้วยประเทศต้นทาง'),
  q('world_countries',4,'Emma is British. Which country is she from?',['Japan','England','China','Korea'],1,'British เป็นสัญชาติของ England/United Kingdom'),
  q('world_countries',5,'Which pair is correct?',['China–Chinese','Japan–Japanish','Thailand–Thailandese','Korea–Koreaish'],0,'China จับคู่กับสัญชาติ Chinese'),
  q('world_countries',6,'The class has an exchange student from Korea. He is ___.',['Korea','Korean','Koreanese','Koreanish'],1,'สัญชาติของ Korea คือ Korean'),
  q('world_countries',7,'Which language is mainly spoken in Japan?',['Japanese','Thai','Chinese','English only'],0,'ภาษาหลักของญี่ปุ่นคือ Japanese'),
  q('world_countries',8,'Look at the picture. Which sentence is correct?',['She is from China.','She is from Korea.','She is from Thailand.','She is from England.'],2,'ภาพชุดไทยสื่อถึงประเทศไทย',{image:'/learning/countries/thailand-thai-v1.png',imageAlt:'ตัวละครสวมชุดไทยพร้อมสัญลักษณ์ประเทศไทย'}),
  q('world_countries',9,'A visitor says, “I come from Beijing.” What is his nationality?',['Thai','Japanese','British','Chinese'],3,'Beijing อยู่ในประเทศจีน จึงมีสัญชาติ Chinese'),
  q('world_countries',10,'Which question asks about nationality?',['Where do you live?','What nationality are you?','What is your hobby?','How old are you?'],1,'What nationality are you? ถามสัญชาติ'),
];

const environment = [
  q('nature_environment',1,'Which action saves the most electricity?',['Leaving lights on','Turning off unused lights','Opening the refrigerator often','Using every appliance'],1,'ปิดไฟที่ไม่ใช้ช่วยประหยัดไฟ'),
  q('nature_environment',2,'The bin is marked “PAPER.” What should go into it?',['A glass bottle','A banana peel','An old newspaper','A plastic spoon'],2,'หนังสือพิมพ์เก่าเป็นกระดาษและนำไปรีไซเคิลได้'),
  q('nature_environment',3,'Which sentence best matches the picture?',['Throw rubbish here.','Do not litter.','Burn the rubbish.','Feed the animals.'],1,'ภาพสื่อถึงการห้ามทิ้งขยะ',{image:'/learning/environment/do-not-litter-v1.png',imageAlt:'ป้ายห้ามทิ้งขยะลงบนพื้น'}),
  q('nature_environment',4,'Why should we use a reusable bottle?',['To make more waste','To reduce plastic waste','To use more water','To make drinks warmer'],1,'ขวดใช้ซ้ำช่วยลดขยะพลาสติก'),
  q('nature_environment',5,'Smoke from many cars causes air ___.',['recycling','energy','pollution','planting'],2,'ควันรถก่อให้เกิด air pollution'),
  q('nature_environment',6,'Which is the best way to save water while brushing your teeth?',['Keep the tap running','Turn off the tap','Use hot water only','Brush for one minute'],1,'ปิดก๊อกระหว่างแปรงฟันช่วยประหยัดน้ำ'),
  q('nature_environment',7,'Our class wants more shade and cleaner air. What should we do?',['Cut down trees','Plant trees','Burn leaves','Use plastic bags'],1,'ปลูกต้นไม้ช่วยเพิ่มร่มเงาและปรับอากาศ'),
  q('nature_environment',8,'Which item can usually be recycled?',['A glass bottle','Food soup','Dirty tissue','Used chewing gum'],0,'ขวดแก้วสามารถนำไปรีไซเคิลได้'),
  q('nature_environment',9,'The beach is covered with rubbish. What should volunteers bring?',['Books and pencils','Bags and gloves','Blankets and pillows','Plates and cups'],1,'เก็บขยะควรใช้ถุงและถุงมือเพื่อความปลอดภัย'),
  q('nature_environment',10,'Which slogan best encourages environmental care?',['Use more, waste more.','Keep our planet clean.','Cut every tree.','Throw it anywhere.'],1,'Keep our planet clean เป็นข้อความรณรงค์รักษาสิ่งแวดล้อม'),
];

const subjects = [
  q('school_subjects',1,'We learn about plants and do experiments in ___.',['Art','Science','Music','History'],1,'การทดลองและพืชอยู่ในวิชา Science'),
  q('school_subjects',2,'Which subject uses numbers, shapes, and calculations?',['Math','English','P.E.','Art'],0,'ตัวเลข รูปทรง และการคำนวณเป็นวิชา Math'),
  q('school_subjects',3,'Nina enjoys drawing and painting. Which class will she probably like most?',['Geography','Science','Art','P.E.'],2,'การวาดภาพและระบายสีเป็นกิจกรรมวิชา Art'),
  q('school_subjects',4,'Students run and play volleyball in ___.',['Music','P.E.','English','Math'],1,'การออกกำลังกายและกีฬาอยู่ในวิชา P.E.'),
  q('school_subjects',5,'We study maps, countries, and rivers in ___.',['Geography','Art','Music','Computer'],0,'แผนที่ ประเทศ และแม่น้ำเป็นเนื้อหา Geography'),
  q('school_subjects',6,'A: When do we have English? B: ______',['In Room 4.','With Mr. Tom.','On Monday morning.','It is useful.'],2,'When ถามเวลา จึงตอบ On Monday morning'),
  q('school_subjects',7,'The timetable says “Music 10:00–11:00.” What happens at 10:30?',['The music class is in progress.','The music class is over.','Lunch begins.','Students go home.'],0,'10.30 น. อยู่ระหว่างเวลาเรียนดนตรี'),
  q('school_subjects',8,'Which item is most useful in an Art class?',['A paintbrush','A calculator','A football','A compass for direction'],0,'Paintbrush เป็นอุปกรณ์สำหรับวาดและระบายสี'),
  q('school_subjects',9,'Ben has Science before lunch and Math after lunch. Which class comes first?',['Math','English','Science','P.E.'],2,'Science อยู่ก่อน lunch จึงมาก่อน Math'),
  q('school_subjects',10,'Teacher: Please work in pairs and discuss the story. Which subject is most likely?', ['P.E.','English','Math','Art'],1,'การอ่านและอภิปรายเรื่องเป็นกิจกรรมในวิชา English'),
];

const numbers = [
  q('numbers',1,'The school bus leaves at 7:15 a.m. Mali arrives at 7:05 a.m. How early is she?',['5 minutes','10 minutes','15 minutes','20 minutes'],1,'จาก 7:05 ถึง 7:15 เป็นเวลา 10 นาที'),
  q('numbers',2,'A notebook costs 28 baht. How much do three notebooks cost?',['56 baht','74 baht','84 baht','94 baht'],2,'28 คูณ 3 เท่ากับ 84 บาท'),
  q('numbers',3,'The movie starts at 1:30 p.m. and ends at 3:00 p.m. How long is it?',['One hour','One hour and thirty minutes','Two hours','Two hours and thirty minutes'],1,'จาก 13.30 ถึง 15.00 น. เป็นเวลา 1 ชั่วโมง 30 นาที'),
  q('numbers',4,'Nina is the third runner to finish. Which word describes her position?',['First','Second','Third','Fourth'],2,'ลำดับที่สามเขียนว่า third'),
  q('numbers',5,'A book has 120 pages. Ken has read 75 pages. How many pages are left?',['35','45','55','65'],1,'120 ลบ 75 เหลือ 45 หน้า'),
  q('numbers',6,'The sign says “50% OFF.” A 200-baht bag now costs ___.',['50 baht','100 baht','150 baht','250 baht'],1,'ลดครึ่งหนึ่งของ 200 บาท เหลือ 100 บาท'),
  q('numbers',7,'Which time is a quarter past nine?',['9:15','9:30','9:45','10:15'],0,'A quarter past nine คือ 9:15'),
  q('numbers',8,'There are 36 students. They form groups of four. How many groups are there?',['6','8','9','12'],2,'36 หาร 4 ได้ 9 กลุ่ม'),
  q('numbers',9,'The temperature rises from 24°C to 31°C. How many degrees does it rise?',['5°C','6°C','7°C','8°C'],2,'31 ลบ 24 เท่ากับ 7°C'),
  q('numbers',10,'Look at the podium. Which label belongs to the winner?', ['1st','2nd','3rd','4th'],0,'ผู้ชนะอยู่ลำดับที่ 1 ใช้ 1st',{image:'/learning/numbers/ordinal-podium-v1.svg',imageAlt:'แท่นรางวัลสามระดับ ตำแหน่งผู้ชนะอยู่ตรงกลางสูงที่สุด'}),
];

const jobs = [
  q('jobs',1,'My mother examines sick people and works in a hospital. She is a ___.',['chef','doctor','pilot','teacher'],1,'ผู้ตรวจรักษาผู้ป่วยในโรงพยาบาลคือ doctor'),
  q('jobs',2,'Who should you call when a house is on fire?',['A librarian','A dentist','A firefighter','A farmer'],2,'Firefighter ทำหน้าที่ดับเพลิงและช่วยเหลือเหตุไฟไหม้'),
  q('jobs',3,'A: What does your father do? B: ______',['He is friendly.','He is a teacher.','He likes school.','He is at home.'],1,'What does ... do? ใช้ถามอาชีพ'),
  q('jobs',4,'Which person is shown in the picture?',['A pilot','A chef','A postman','A vet'],0,'ภาพแสดงนักบิน',{image:'/learning/jobs/pilot-v1.png',imageAlt:'นักบินสวมเครื่องแบบยืนอยู่ข้างเครื่องบิน'}),
  q('jobs',5,'A person who cooks meals in a restaurant is a ___.',['nurse','chef','mechanic','librarian'],1,'ผู้ประกอบอาหารในร้านอาหารคือ chef'),
  q('jobs',6,'Jane loves animals and wants to treat sick pets. What job suits her?',['Vet','Singer','Driver','Cashier'],0,'Vet หรือสัตวแพทย์รักษาสัตว์ป่วย'),
  q('jobs',7,'Who delivers letters and parcels to people’s homes?',['A farmer','A postman','A dentist','A waiter'],1,'Postman นำจดหมายและพัสดุไปส่ง'),
  q('jobs',8,'Mr. Lee helps students find books and keeps the library organized. He is a ___.',['scientist','librarian','police officer','baker'],1,'ผู้ดูแลหนังสือและช่วยผู้ใช้ห้องสมุดคือ librarian'),
  q('jobs',9,'Which question is most suitable in a job interview?',['What skills do you have?','What is your favorite snack?','Where is my pencil?','Can I play now?'],0,'การถามทักษะเหมาะสมกับการสัมภาษณ์งาน'),
  q('jobs',10,'A mechanic mainly works with ___.',['teeth','books','vehicles','medicine'],2,'Mechanic ซ่อมและดูแลยานพาหนะ'),
];

const aboutMyself = [
  q('about_myself',1,'A: Hello. My name is Tina. What is your name?\nB: ______',['I am fine.','My name is Nida.','I am eleven.','I live in Trang.'],1,'คำถาม What is your name? ต้องตอบชื่อ'),
  q('about_myself',2,'Read the profile. “Name: Mark | Age: 12 | Hobby: swimming” Which sentence is correct?',['Mark is twelve years old.','Mark likes cooking.','Mark is a teacher.','Mark cannot swim.'],0,'โปรไฟล์ระบุ Age: 12'),
  q('about_myself',3,'A: Where do you live?\nB: ______',['I live in Chiang Mai.','I go by bus.','I am Thai.','I am in Grade 6.'],0,'Where do you live? ถามสถานที่อยู่อาศัย'),
  q('about_myself',4,'Which question should you ask to learn about someone’s free-time activity?',['How old are you?','Where are you from?','What is your hobby?','What is your name?'],2,'What is your hobby? ใช้ถามงานอดิเรก'),
  q('about_myself',5,'Nina says, “I enjoy drawing pictures after school.” What is her hobby?',['Reading','Drawing','Dancing','Cycling'],1,'Enjoy drawing บอกว่างานอดิเรกคือการวาดภาพ'),
  q('about_myself',6,'Tom: I am from Thailand. I speak Thai and English. Which information is NOT given?',['His country','His languages','His age','His nationality'],2,'ข้อความไม่ได้ระบุอายุ'),
  q('about_myself',7,'You meet a new exchange student. Which sentence is the best introduction?',['Give me your bag.','Hi, I’m Nan. Nice to meet you.','You must sit here.','Where did you buy that?'],1,'การแนะนำตัวครั้งแรกควรสุภาพและบอกชื่อ'),
  q('about_myself',8,'Read the card. “Ben, Grade 6/2, Chess Club, Room 14.” Where should Ben go for his club?', ['Grade 6/2','The playground','Room 14','The library'],2,'บัตรระบุสถานที่ชมรมว่า Room 14'),
  q('about_myself',9,'A: How do you go to school?\nB: ______',['At seven o’clock.','With my sister.','By bicycle.','Every weekday.'],2,'How do you go...? ถามวิธีการเดินทาง จึงตอบ By bicycle'),
  q('about_myself',10,'Which sentence describes the person in the picture best?', ['She is a student.','She is a pilot.','She is a chef.','She is a doctor.'],0,'ภาพแสดงนักเรียนหญิงถือหนังสือ',{image:'/assessment/quest-scenes/student-reading-v1.webp',imageAlt:'นักเรียนหญิงยืนถือหนังสือและอุปกรณ์การเรียน'}),
];

const familyHome = [
  q('family',1,'Look at the family picture. Which word means the two adult parents together?', ['Cousins','Parents','Children','Grandparents'],1,'Parents หมายถึงพ่อและแม่',{image:'/assessment/quest-scenes/family-parents-v1.webp',imageAlt:'ครอบครัวประกอบด้วยผู้ใหญ่สองคนและเด็กสองคน',mediaReview:{status:'verified',version:'onet-context-v1',reviewer:'Codex',scope:'practice_assessment'}}),
  q('family',2,'Nok’s mother has a brother named Tom. Tom is Nok’s ___.',['uncle','cousin','nephew','grandfather'],0,'พี่หรือน้องชายของแม่คือ uncle'),
  q('family',3,'A: How many people are there in your family?\nB: ______',['They are kind.','There are five.','We live in Bangkok.','My father is tall.'],1,'How many ถามจำนวน จึงตอบ There are five.'),
  q('family',4,'May is Ann’s daughter. Ann is May’s ___.',['sister','aunt','mother','cousin'],2,'แม่ของลูกสาวคือ mother'),
  q('family',5,'Read the note. “Please feed the cat and close the windows before you leave. Mum.” What should the child do?', ['Open every window','Take the cat outside','Feed the cat and close the windows','Wait for Mum at school'],2,'ต้องทำตามคำสั่งทั้งสองอย่างในโน้ต'),
  q('family',6,'Which room is usually used for cooking?', ['Bedroom','Kitchen','Bathroom','Living room'],1,'Kitchen คือห้องครัวสำหรับทำอาหาร'),
  q('family',7,'Look at the house plan. The bathroom is next to the bedroom. Which statement is true?', ['The rooms are beside each other.','The bathroom is outside.','The bedroom is upstairs.','The rooms are far apart.'],0,'Next to หมายถึงอยู่ติดกัน',{image:'/images/house_map.svg',imageAlt:'แผนผังบ้านแสดงห้องนอน ห้องน้ำ ห้องครัว และห้องนั่งเล่น',mediaReview:{status:'verified',version:'onet-context-v1',reviewer:'Codex',scope:'practice_assessment'}}),
  q('family',8,'Dad is washing the car while Mum is cooking. What are they doing?', ['They are resting.','They are doing different household tasks.','They are going to work.','They are eating dinner.'],1,'ทั้งสองกำลังทำงานบ้านคนละอย่าง'),
  q('family',9,'Your grandmother carries two heavy bags. What should you say?', ['You must hurry.','May I help you?','Those bags are mine.','Leave them here alone.'],1,'May I help you? เป็นการเสนอความช่วยเหลืออย่างสุภาพ'),
  q('family',10,'The family has dinner at 6:30 p.m. Tina arrives home at 6:20 p.m. How long does she wait?', ['5 minutes','10 minutes','20 minutes','30 minutes'],1,'จาก 18.20 ถึง 18.30 น. เป็นเวลา 10 นาที'),
];

const schoolClassroom = [
  q('school',1,'Look at the notice. When can students NOT borrow books?', ['Monday','Wednesday','Friday','Saturday'],2,'ประกาศระบุว่าห้องสมุดปิดวันศุกร์',{image:'/assessment/quest-scenes/library-closed-friday-v1.webp',imageAlt:'ประกาศหน้าห้องสมุดระบุว่า LIBRARY CLOSED ON FRIDAY'}),
  q('school',2,'Teacher: Please hand in your homework before lunch. What must students do?', ['Finish lunch first','Submit their work before lunch','Take the homework home','Put it in the library'],1,'Hand in หมายถึงส่งงาน และกำหนดก่อนอาหารกลางวัน'),
  q('school',3,'Look at the school map. The library is opposite the office. Where is the office?', ['Across from the library','Behind the playground','Inside the library','Next to the gate'],0,'Opposite หมายถึงอยู่ฝั่งตรงข้าม',{image:'/images/school_map.svg',imageAlt:'แผนผังโรงเรียนแสดงห้องสมุด สำนักงาน สนาม และทางเข้า'}),
  q('school',4,'Timetable: Math 9:00, English 10:00, Science 11:00. What subject comes after English?', ['Math','Science','Art','P.E.'],1,'หลัง English เวลา 10.00 น. คือ Science เวลา 11.00 น.'),
  q('school',5,'A: Could I borrow your ruler, please?\nB: ______',['Sure. Here you are.','It is twenty centimetres.','I like Mathematics.','The ruler is blue.'],0,'คำตอบรับการขอยืมที่เหมาะสมคือ Sure. Here you are.'),
  q('school',6,'Students are doing an experiment with plants. Which room are they most likely in?', ['The gym','The science laboratory','The canteen','The music room'],1,'การทดลองวิทยาศาสตร์ทำในห้องปฏิบัติการ'),
  q('school',7,'The sign says “KEEP THE CLASSROOM CLEAN.” Which action follows the rule?', ['Leaving paper on the floor','Writing on the desk','Putting rubbish in the bin','Eating during the lesson'],2,'การทิ้งขยะลงถังช่วยรักษาห้องเรียนให้สะอาด',{image:'/assessment/quest-scenes/clean-classroom-v1.webp',imageAlt:'นักเรียนช่วยเก็บขยะใส่ถังในห้องเรียนที่เป็นระเบียบ'}),
  q('school',8,'Jane forgot her pencil case. What is the most polite thing to say?', ['Give me a pencil.','I want that pencil.','May I borrow a pencil, please?','Your pencil is mine.'],2,'May I borrow..., please? เป็นคำขอยืมที่สุภาพ'),
  q('school',9,'The football club meets from 3:30 to 4:30 p.m. How long is the meeting?', ['Thirty minutes','One hour','One hour and thirty minutes','Two hours'],1,'จาก 15.30 ถึง 16.30 น. เป็นเวลา 1 ชั่วโมง'),
  q('school',10,'Announcement: “Grade 6 students will visit the museum on 12 June. Bring lunch and water.” What should students bring?', ['A dictionary and ruler','Lunch and water','A football and hat','Paint and paper'],1,'ประกาศระบุให้นำ lunch and water'),
];

const balanced = questions => questions.map((question, index) => {
  const target = index % 4;
  const shift = (question.answer - target + 4) % 4;
  if (!shift) return question;
  return { ...question, options: [...question.options.slice(shift), ...question.options.slice(0, shift)], answer: target };
});

export const EXPANDED_ONET_ASSESSMENTS = Object.fromEntries(Object.entries({
  pronouns_master: pronouns,
  prepositions_hub: prepositions,
  nouns_quantifiers: quantifiers,
  adjectives_comp: comparisons,
  world_countries: countries,
  nature_environment: environment,
  school_subjects: subjects,
  numbers,
  jobs,
  about_myself: aboutMyself,
  family: familyHome,
  school: schoolClassroom,
}).map(([quest, questions]) => [quest, balanced(questions)]));
