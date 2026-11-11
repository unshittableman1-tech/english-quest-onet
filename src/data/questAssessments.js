// Authored practice assessments based on existing lesson objectives, not copied O-NET items.
const sources = {
  shapes_colors: { file: 'src/data/missions/ch5_missions.js', missionIds: ['shapes_flip', 'shapes_match'], relationship: 'lesson_objectives', supportingPdf: '01ใบงานประกอบการติว O-NET ป.6.pdf', supportingPages: [46, 47] },
  clothes_fashion: { file: 'src/data/missions/ch5_missions.js', missionIds: ['clothes_flip', 'clothes_match'], relationship: 'lesson_objectives', supportingPdf: '01ใบงานประกอบการติว O-NET ป.6.pdf', supportingPages: [19, 20] },
  tenses_arena: { file: 'src/data/missions/ch5_missions.js', missionIds: ['ten_flip', 'ten_rearrange'], relationship: 'lesson_objectives' },
};

function item(quest, index, question, options, answer, explanation, extra = {}) {
  return { id: `${quest}_assessment_${String(index).padStart(2, '0')}`, quest,
    itemVersion: 'practice-draft-v1', question, options, answer,
    correctFeedback: explanation, wrongFeedback: explanation,
    reviewStatus: 'pending_teacher', intendedMode: 'practice_assessment',
    approvedModes: [],
    scoringPolicy: 'first_response_v1',
    source: sources[quest], difficulty: index <= 4 ? 'introductory' : 'application', difficultyStatus: 'provisional',
    contentReview: { status: 'technical_check_only', reviewer: 'Codex', date: '2026-10-13', teacher: null },
    ...extra };
}
const form = (number, description) => ({
  image: `/assessment/forms/f${number}.svg`, imageAlt: description, mediaRequired: true,
  mediaReview: { status: 'pending_teacher', version: 'practice-draft-v1', reviewer: null },
  accessibilityReview: 'pending_equivalence_review',
});
const clothingPictures = [
  ['c01', 'เสื้อแขนยาวสีเหลือง มีฮูดและกระดุมด้านหน้า ผิวผ้าเรียบมัน'],
  ['c02', 'สิ่งของผ้าถักสองชิ้น มีช่องเปิดที่ข้อเท้าและส่วนโค้งสำหรับส้นกับปลายเท้า'],
  ['c03', 'สิ่งของสวมเท้าสองข้าง มีเชือกผูกและพื้นยางสีขาว'],
  ['c04', 'สิ่งของผ้าสีน้ำเงินสำหรับสวมศีรษะ มีปีกโค้งยื่นด้านหน้า'],
  ['c01', 'เสื้อแขนยาวสีเหลือง มีฮูดและกระดุมด้านหน้า ผิวผ้าเรียบมัน'],
  ['c06', 'กรอบสีดำมีเลนส์สีเข้มสองข้าง สะพานเชื่อมและขาสำหรับคล้องหู'],
  ['c07', 'สิ่งของผ้าถักสีแดงสองข้าง แต่ละข้างมีส่วนสำหรับนิ้วทั้งห้า'],
  ['c08', 'เครื่องแต่งกายกีฬาแบบชิ้นเดียวสีแดง มีสายไหล่และช่องเปิดสำหรับขา'],
  ['c09', 'เสื้อคอปกแขนสั้นสีขาวกับกางเกงขาสั้นสีน้ำเงิน จัดเป็นชุดเดียวกัน'],
  ['c10', 'สายหนังสีน้ำตาลมีหัวโลหะและรูสำหรับปรับความยาว'],
];

export const shapesAssessment = [
  item('shapes_colors', 1, 'What shape is shown?', ['Circle', 'Triangle', 'Square', 'Rectangle'], 0, 'Circle คือวงกลม มีเส้นโค้งปิดและไม่มีมุม', form('01', 'รูปเส้นโค้งปิด ทุกจุดบนขอบห่างจากศูนย์กลางเท่ากัน')),
  item('shapes_colors', 2, 'What shape is shown?', ['Oval', 'Square', 'Circle', 'Triangle'], 1, 'Square คือสี่เหลี่ยมจัตุรัส มีสี่ด้านเท่ากันและสี่มุมฉาก', form('02', 'รูปสี่ด้านเท่ากันและสี่มุมฉาก')),
  item('shapes_colors', 3, 'What shape is shown?', ['Rectangle', 'Circle', 'Triangle', 'Oval'], 2, 'Triangle คือสามเหลี่ยม มีสามด้านและสามมุม', form('03', 'รูปปิดประกอบด้วยเส้นตรงสามเส้น')),
  item('shapes_colors', 4, 'What shape is shown?', ['Circle', 'Oval', 'Triangle', 'Rectangle'], 3, 'Rectangle ในภาพเป็นสี่เหลี่ยมผืนผ้าด้านยาวกับด้านสั้นต่างกันและมีสี่มุมฉาก', form('04', 'รูปสี่มุมฉาก แนวนอนยาวกว่าแนวตั้ง')),
  item('shapes_colors', 5, 'What shape is shown?', ['Oval', 'Square', 'Triangle', 'Circle'], 0, 'Oval คือวงรี ในภาพความกว้างมากกว่าความสูง', form('05', 'รูปเส้นโค้งปิด ความกว้างมากกว่าความสูง')),
  item('shapes_colors', 6, 'Which word matches the shape?', ['Circle', 'Diamond', 'Rectangle', 'Oval'], 1, 'Diamond ในกิจกรรมนี้คือรูปสี่เหลี่ยมข้าวหลามตัด ด้านเท่ากันและไม่มีมุมฉาก', form('06', 'รูปสี่ด้านเท่ากัน มีมุมแหลมสองมุมและมุมป้านสองมุม')),
  item('shapes_colors', 7, 'What color is the shape?', ['Red', 'Green', 'Blue', 'Yellow'], 2, 'Blue แปลว่าสีน้ำเงิน ภาพใช้สีน้ำเงิน', form('01', 'รูปทรงเติมสีน้ำเงิน')),
  item('shapes_colors', 8, 'What color is the shape?', ['Green', 'Blue', 'Yellow', 'Red'], 3, 'Red แปลว่าสีแดง ภาพใช้สีแดง', form('02', 'รูปทรงเติมสีแดง')),
  item('shapes_colors', 9, 'What color is the shape?', ['Green', 'Red', 'Blue', 'Yellow'], 0, 'Green แปลว่าสีเขียว ภาพใช้สีเขียว', form('03', 'รูปทรงเติมสีเขียว')),
  item('shapes_colors', 10, 'Which phrase matches the picture?', ['A red circle', 'A blue circle', 'A blue triangle', 'A green square'], 1, 'ภาพเป็นวงกลมสีน้ำเงิน จึงตรงกับ A blue circle', form('01', 'รูปเส้นโค้งปิด ทุกจุดบนขอบห่างจากศูนย์กลางเท่ากัน เติมสีน้ำเงิน')),
].map(question => ({
  ...question,
  reviewStatus: 'approved', approvedModes: ['practice_assessment'],
  contentReview: { ...question.contentReview, status: 'approved_for_practice', approvedBy: 'workspace_owner', approvedAt: '2026-10-13', approvalSource: 'explicit_user_chat_after_shapes_preview' },
  mediaReview: { status: 'verified', version: question.itemVersion, reviewer: 'workspace_owner', approvedAt: '2026-10-22', scope: 'practice_assessment' },
  mediaSource: { kind: 'authored_svg_illustration', style: '2.5d', assetVersion: 'v2', updatedAt: '2026-10-22' },
}));

export const clothesAssessment = [
  item('clothes_fashion', 1, 'คำใดหมายถึงเสื้อกันฝน?', ['Raincoat', 'Skirt', 'Shoes', 'Cap'], 0, 'Raincoat คือเสื้อกันฝน ใช้ป้องกันฝน'),
  item('clothes_fashion', 2, 'คำใดหมายถึงถุงเท้า?', ['Jacket', 'Socks', 'Dress', 'Hat'], 1, 'Socks คือถุงเท้า ส่วน shoes คือรองเท้า'),
  item('clothes_fashion', 3, 'คำใดหมายถึงรองเท้า?', ['Dress', 'Shirt', 'Shoes', 'Jeans'], 2, 'Shoes คือรองเท้า'),
  item('clothes_fashion', 4, 'คำใดหมายถึงหมวกแก๊ป?', ['Skirt', 'Socks', 'Jacket', 'Cap'], 3, 'Cap คือหมวกแก๊ป'),
  item('clothes_fashion', 5, 'It is raining. Which item is designed to keep your body dry?', ['Raincoat', 'Skirt', 'T-shirt', 'Shorts'], 0, 'Raincoat เป็นเสื้อกันฝนที่ออกแบบมาเพื่อป้องกันตัวเปียกฝน'),
  item('clothes_fashion', 6, 'Which item protects your eyes from bright sunlight?', ['Socks', 'Sunglasses', 'Gloves', 'Belt'], 1, 'Sunglasses คือแว่นกันแดด ใช้ป้องกันดวงตาจากแสงแดด'),
  item('clothes_fashion', 7, 'Which item is made to be worn on your hands?', ['Cap', 'Shoes', 'Gloves', 'Jeans'], 2, 'Gloves คือถุงมือ ใช้สวมที่มือ'),
  item('clothes_fashion', 8, 'Which item is made for swimming?', ['Jacket', 'Scarf', 'School uniform', 'Swimsuit'], 3, 'Swimsuit คือชุดว่ายน้ำ'),
  item('clothes_fashion', 9, 'At this school, students must wear the same required clothes. What are these clothes called?', ['A school uniform', 'A swimsuit', 'A raincoat', 'A scarf'], 0, 'School uniform คือเครื่องแบบนักเรียนที่โรงเรียนกำหนดให้สวม'),
  item('clothes_fashion', 10, 'Which item is used around the waist to hold up trousers?', ['Gloves', 'A belt', 'A cap', 'Socks'], 1, 'A belt คือเข็มขัด ใช้คาดที่เอวเพื่อช่วยยึดกางเกง', { source: { ...sources.clothes_fashion, additionalObjective: 'belt', supportingPdf: 'ชุดติวพิชิตข้อสอบวิชาภาษาอังกฤษ O-NET ปี 2568.pdf', supportingPages: [47], relationship: 'adapted_objective_not_literal_item' } }),
].map((question, index) => ({
  ...question,
  itemVersion: 'practice-illustrated-v2',
  question: index < 4 ? 'Which word matches the picture?' : question.question,
  image: `/assessment/clothes/${clothingPictures[index][0]}-v1.png`,
  imageAlt: clothingPictures[index][1], mediaRequired: true,
  reviewStatus: 'approved', approvedModes: ['practice_assessment'],
  contentReview: { ...question.contentReview, status: 'approved_for_practice', approvedBy: 'workspace_owner', approvedAt: '2026-10-13', approvalSource: 'explicit_user_chat_after_clothes_illustrated_preview' },
  mediaReview: { status: 'verified', version: 'practice-illustrated-v2', reviewer: 'workspace_owner', approvedAt: '2026-10-13', scope: 'practice_assessment' },
  mediaSource: { kind: 'generated_illustration', tool: 'built_in_image_gen', assetId: clothingPictures[index][0], assetVersion: 'v1', generatedAt: '2026-10-13', visualCheckBy: 'Codex', promptManifest: 'md/Clothing Image Generation.json' },
  accessibilityReview: 'pending_equivalence_review',
}));

export const tensesAssessment = [
  item('tenses_arena', 1, 'Choose the present simple form: He ___ football every Sunday.', ['plays', 'play', 'playing', 'played'], 0, 'Present simple กับ He ใช้ plays เติม s เพื่อบอกกิจวัตร'),
  item('tenses_arena', 2, 'Complete the present simple question: ___ she play football every Sunday?', ['Do', 'Does', 'Is', 'Are'], 1, 'Present simple question ใช้ Does กับ she แล้วตามด้วยกริยาช่อง 1'),
  item('tenses_arena', 3, 'Complete the present simple negative: They ___ play football on Mondays.', ['does not', 'is not', 'do not', 'are not'], 2, 'They ใช้ do not ตามด้วยกริยาช่อง 1 ใน present simple negative'),
  item('tenses_arena', 4, 'Look! She ___ dinner right now.', ['cook', 'cooked', 'cooks', 'is cooking'], 3, 'Look และ right now บอกว่ากำลังเกิดขึ้น ใช้ She is cooking'),
  item('tenses_arena', 5, 'Complete the present continuous question: What ___ they doing?', ['are', 'is', 'am', 'do'], 0, 'Present continuous question ใช้ are กับ they ตามด้วย doing'),
  item('tenses_arena', 6, 'I ___ my homework at the moment.', ['does', 'am doing', 'did', 'do'], 1, 'At the moment บอกว่ากำลังทำอยู่ ใช้ I am doing'),
  item('tenses_arena', 7, 'Yesterday, we ___ the zoo.', ['visit', 'visits', 'visited', 'visiting'], 2, 'Yesterday เป็นอดีต ใช้ visited ซึ่งเป็นกริยาช่อง 2'),
  item('tenses_arena', 8, 'Complete the past simple question: ___ they visit the zoo yesterday?', ['Do', 'Does', 'Are', 'Did'], 3, 'Past simple question ใช้ Did ตามด้วย visit ช่อง 1 ไม่ใช่ visited'),
  item('tenses_arena', 9, 'Complete the future simple sentence: They ___ fly to Bangkok tomorrow.', ['will', 'did', 'does', 'is'], 0, 'Future simple ใช้ will ตามด้วย fly ช่อง 1'),
  item('tenses_arena', 10, 'Complete the future simple question: ___ you travel tomorrow?', ['Did', 'Will', 'Does', 'Is'], 1, 'Future simple question ใช้ Will + subject + verb ช่อง 1'),
].map(question => ({
  ...question,
  reviewStatus: 'approved', approvedModes: ['practice_assessment'],
  contentReview: { ...question.contentReview, status: 'approved_for_practice', approvedBy: 'workspace_owner', approvedAt: '2026-10-13', approvalSource: 'explicit_user_chat_after_tenses_preview' },
  mediaReview: { status: 'not_required', version: question.itemVersion, reviewer: 'workspace_owner', approvedAt: '2026-10-13', scope: 'practice_assessment' },
}));

export const QUEST_ASSESSMENTS = { shapes_colors: shapesAssessment, clothes_fashion: clothesAssessment, tenses_arena: tensesAssessment };
