/**
 * O-NET ADVENTURE — CONTENT INTELLIGENCE LAYER
 * Module: Exam Command Terms & Question Decoding
 * 
 * Based on empirical analysis of O-NET Grade 6 examination patterns.
 * Designed to train learners to decode what the question is asking
 * before attempting to answer, avoiding negative-question and scope traps.
 */

export const EXAM_COMMANDS = Object.freeze([
  {
    id: 'cmd_according_to',
    term: 'according to the passage / story / chart',
    thai: 'จากบทอ่าน / เรื่องราว / แผนภูมิ',
    skillTarget: 'reading_detail',
    cognitiveLevel: 'literal_comprehension',
    strategy: 'หาหลักฐานตรงๆ จากข้อความ ไม่คิดคาดเดาเอาเอง',
    trapWarning: 'ตัวเลือกที่พูดความจริงทั่วไปแต่ไม่มีในบทอ่าน ถือเป็นตัวเลือกหลอก',
    exampleStem: 'According to the passage, why did Mali arrive late?',
    optionsSample: [
      'Because she woke up late (มีระบุในเนื้อเรื่อง)',
      'Because traffic was bad (เรื่องจริงในชีวิตประจำวันแต่เนื้อเรื่องไม่ได้พูดถึง)'
    ]
  },
  {
    id: 'cmd_mainly_about',
    term: 'mainly about / main idea',
    thai: 'กล่าวถึงเรื่องใดเป็นหลัก / ใจความสำคัญ',
    skillTarget: 'main_idea',
    cognitiveLevel: 'global_summarization',
    strategy: 'มองภาพรวมทั้งเรื่อง มักสรุปอยู่ในประโยคแรกหรือประโยคสุดท้ายของย่อหน้า',
    trapWarning: 'ระวังตัวเลือกที่บอกรายละเอียดปลีกย่อย (Supporting Detail) ซึ่งจริงแต่ไม่ใช่ใจความหลัก',
    exampleStem: 'What is the passage mainly about?',
    optionsSample: [
      'How bees help plants grow (ใจความหลักครอบคลุมทั้งเรื่อง)',
      'The color of flower petals (เป็นแค่รายละเอียด 1 บรรทัด)'
    ]
  },
  {
    id: 'cmd_best_title',
    term: 'best title',
    thai: 'ชื่อเรื่องที่เหมาะสมที่สุด',
    skillTarget: 'summarization',
    cognitiveLevel: 'global_synthesis',
    strategy: 'เลือกชื่อที่ครอบคลุมเนื้อหาทั้งหมด ไม่แคบไปและไม่กว้างเกินไป',
    trapWarning: 'ชื่อเรื่องที่ระบุแค่ฉากเดียวหรือตัวละครรองไม่ใช่ชื่อเรื่องที่ดีที่สุด',
    exampleStem: 'What is the best title for this story?',
    optionsSample: [
      'A Day at the National Park (ครอบคลุมกิจกรรมทั้งหมด)',
      'Buying an Ice Cream (เป็นแค่ฉากเปิดเรื่อง)'
    ]
  },
  {
    id: 'cmd_purpose',
    term: 'purpose / why did the author write this',
    thai: 'จุดประสงค์ของผู้เขียน / เขียนขึ้นเพื่ออะไร',
    skillTarget: 'pragmatics',
    cognitiveLevel: 'author_intent',
    strategy: 'ดูประเภทงานเขียน: แจ้งเพื่อทราบ (inform), เชิญชวน (invite), เตือนภัย (warn), หรือขอความร่วมมือ',
    trapWarning: 'อย่าสับสนระหว่างเนื้อหาในข้อความกับเจตนาของผู้เขียน',
    exampleStem: 'What is the purpose of this announcement?',
    optionsSample: [
      'To inform students about the new library hours (แจ้งเพื่อทราบ)',
      'To sell new English books (ไม่ใช่จุดประสงค์)'
    ]
  },
  {
    id: 'cmd_probably_likely',
    term: 'probably / most likely',
    thai: 'น่าจะ... / เป็นไปได้มากที่สุด',
    skillTarget: 'inference',
    cognitiveLevel: 'deductive_reasoning',
    strategy: 'ใช้คำบอกใบ้ (Clues) ในเรื่องประกอบกับเหตุผลเพื่ออนุมานสิ่งที่ไม่ได้เขียนตรงๆ',
    trapWarning: 'ต้องมีคำบอกใบ้รองรับเสมอ อย่าจินตนาการเกินกว่าหลักฐานในโจทย์',
    exampleStem: 'Where does this conversation most likely take place?',
    optionsSample: [
      'At a hospital (มีคำบอกใบ้: doctor, medicine, fever)',
      'At a zoo (ไม่มีคำบอกใบ้เกี่ยวกับสัตว์เลย)'
    ]
  },
  {
    id: 'cmd_infer',
    term: 'infer / can be concluded',
    thai: 'อนุมานได้ว่า / สรุปความได้ว่า',
    skillTarget: 'inference',
    cognitiveLevel: 'deep_comprehension',
    strategy: 'หาความจริงที่ซ่อนอยู่เบื้องหลังข้อมูลที่ระบุ',
    trapWarning: 'ข้อความที่คัดลอกคำในเนื้อเรื่องมาแบบเป๊ะๆ มักเป็นตัวลวง ข้อสรุปมักใช้คำที่มีความหมายเหมือนกัน (Paraphrase)',
    exampleStem: 'What can be inferred about Tom from his actions?',
    optionsSample: [
      'He is helpful and cares for animals (สรุปจากพฤติกรรม)',
      'He is very tall (ไม่มีข้อมูล)'
    ]
  },
  {
    id: 'cmd_except',
    term: 'EXCEPT / all ... except',
    thai: 'ยกเว้น / ทุกข้อถูกต้อง ยกเว้นข้อใด',
    skillTarget: 'negative_selection',
    cognitiveLevel: 'discrimination',
    strategy: 'มองหาข้อความที่เป็นเท็จ หรือข้อความที่ไม่ได้ถูกกล่าวถึงในเรื่อง',
    trapWarning: 'ระวังเผลอเลือกข้อที่ถูก เพราะสายตามักมองหาข้อความที่ตรงกับบทอ่าน',
    exampleStem: 'The recipe needs all of these ingredients EXCEPT ______.',
    optionsSample: [
      'Sugar (ในสูตรระบุว่า no sugar needed - ข้อนี้คือคำตอบ)',
      'Eggs (ในสูตรต้องใช้ 2 ฟอง - ข้อนี้ผิดเพราะมีในสูตร)'
    ]
  },
  {
    id: 'cmd_not_correct',
    term: 'NOT correct / NOT true',
    thai: 'ไม่ถูกต้อง / ไม่เป็นความจริง',
    skillTarget: 'negative_selection',
    cognitiveLevel: 'fact_verification',
    strategy: 'ตรวจสอบทีละตัวเลือก: กาเครื่องหมายถูกข้าง 3 ตัวเลือกที่จริง ตัวเลือกที่ผิดคือคำตอบ',
    trapWarning: 'นักเรียนมักเผลอเลือกตัวเลือกแรกที่อ่านเจอแล้วถูกต้องในบทอ่าน ลืมดูคำว่า NOT',
    exampleStem: 'Which statement is NOT correct according to the timetable?',
    optionsSample: [
      'The train leaves at 9:00 a.m. (ในตารางเขียน 9:30 - ข้อนี้ไม่ตรง จึงเป็นคำตอบ)',
      'The ticket costs 50 baht (ในตารางเขียน 50 บาทจริง - จึงไม่ใช่คำตอบ)'
    ]
  },
  {
    id: 'cmd_true_statement',
    term: 'TRUE / correct statement',
    thai: 'ข้อใดเป็นความจริง / ข้อใดถูกต้อง',
    skillTarget: 'fact_checking',
    cognitiveLevel: 'verification',
    strategy: 'จับคู่ตัวเลือกกับประโยคในบทอ่าน ตรวจสอบคำระบุปริมาณ เช่น all, some, none, always, never',
    trapWarning: 'ตัวเลือกที่มีคำเด็ดขาด เช่น always หรือ every มักผิดหากในเรื่องบอกแค่ usually หรือ sometimes',
    exampleStem: 'Which of the following statements is TRUE?',
    optionsSample: [
      'Children should wash hands before eating (ตรงกับคำแนะนำ)',
      'Students always arrive before 7:00 a.m. (ในเรื่องบอกแค่ some students)'
    ]
  },
  {
    id: 'cmd_sequence_before_after',
    term: 'before / after / first / then / finally',
    thai: 'ก่อน / หลัง / ลำดับเหตุการณ์',
    skillTarget: 'chronological_sequencing',
    cognitiveLevel: 'procedural_ordering',
    strategy: 'วงคำเชื่อมเวลา: Before X, do Y = ทำ Y ก่อนแล้วค่อยทำ X',
    trapWarning: 'อย่าเรียงตามลำดับคำที่ปรากฏในประโยค ให้แปลความหมายของคำว่า Before/After เสมอ',
    exampleStem: 'What should the student do AFTER washing the dishes?',
    optionsSample: [
      'Tidy the dining table (กิจกรรมที่ทำหลังล้างจาน)',
      'Eat lunch (กิจกรรมที่ทำก่อนล้างจาน)'
    ]
  },
  {
    id: 'cmd_contrast_however',
    term: 'however / although / but / instead',
    thai: 'อย่างไรก็ตาม / แม้ว่า / แต่',
    skillTarget: 'contrast_analysis',
    cognitiveLevel: 'context_tracking',
    strategy: 'ข้อมูลสำคัญหรือการเปลี่ยนแผนมักอยู่ "หลัง" คำเชื่อมขัดแย้งเหล่านี้',
    trapWarning: 'แผนการเดิมที่อยู่หน้า but/however มักถูกยกเลิกหรือเปลี่ยนแปลงแล้ว',
    exampleStem: 'We planned to play outside, but it started to rain. What will they do?',
    optionsSample: [
      'Play indoor board games instead (กิจกรรมที่สอดคล้องกับสถานการณ์หลัง but)',
      'Play football in the yard (แผนเดิมที่ถูกยกเลิกไปแล้ว)'
    ]
  },
  {
    id: 'cmd_which_sentence_correct',
    term: 'Which sentence is CORRECT? (Grammar & Structure)',
    thai: 'ประโยคใดถูกต้องตามหลักไวยากรณ์',
    skillTarget: 'grammar_syntax',
    cognitiveLevel: 'structural_accuracy',
    strategy: 'ตรวจประธานและกริยา (Subject-Verb Agreement), กริยาช่วย (Modal + V1), และ Tense',
    trapWarning: 'ตรวจกริยาหลัง do/does/did และ can/could ต้องเป็นกริยารูปพื้นฐาน (V1 แท้ ไม่เติม -s/-ed/-ing)',
    exampleStem: 'Which sentence has the correct word order and grammar?',
    optionsSample: [
      'She does not like spicy food. (ถูกต้อง: does not + V1)',
      'She does not likes spicy food. (ผิด: กริยาหลัง does not ห้ามเติม s)'
    ]
  }
]);

export function getExamCommandById(id) {
  return EXAM_COMMANDS.find(c => c.id === id) || null;
}
