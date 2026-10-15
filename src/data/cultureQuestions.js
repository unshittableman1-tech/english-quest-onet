// ============================================================
// cultureQuestions.js — Standard ต 2.1 (Culture & Festivals) Question Pool
// ข้อมูลอ้างอิง: English Worksheet P6 (หน้า 43-48), 01ใบงานประกอบการติว O-NET ป.6 (หน้า 34-39),
// ch3_missions.js (rd_festival), RealOnetSimulator.jsx
// ============================================================

const cultureQuestionDrafts = [
  {
    id: 'cult_01',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'introductory',
    question: 'When is Halloween celebrated?',
    translation: 'วันฮาโลวีนตรงกับวันใด?',
    options: ['October 31st', 'December 25th', 'April 13th', 'February 14th'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! วันฮาโลวีนตรงกับวันที่ 31 ตุลาคม (October 31st)',
    wrongFeedback: 'Halloween is celebrated on the 31st of October (31 ตุลาคม)',
    keyword: 'Halloween = October 31st',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 43)',
      technique: 'holiday_dates'
    }
  },
  {
    id: 'cult_02',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'introductory',
    question: 'What do children say when they go from house to house on Halloween?',
    translation: 'เด็กๆ พูดอะไรเมื่อไปเคาะประตูตามบ้านในวันฮาโลวีน?',
    options: ['Trick or Treat', 'Merry Christmas', 'Happy New Year', 'Happy Birthday'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! เด็กๆ จะพูดว่า "Trick or Treat" เพื่อขอลูกกวาดหรือขนมหวาน',
    wrongFeedback: 'ในวัน Halloween เด็กๆ จะพูด "Trick or Treat"',
    keyword: 'Halloween activity = Trick or Treat',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 43)',
      technique: 'cultural_activity'
    }
  },
  {
    id: 'cult_03',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'introductory',
    question: 'What is a jack-o\'-lantern made from?',
    translation: 'ตะเกียงแจ็กโอแลนเทิร์นทำมาจากอะไร?',
    options: ['A carved pumpkin', 'A watermelon', 'A pine tree', 'A paper box'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! Jack-o\'-lantern คือฟักทองแกะสลักใบหน้าแล้วใส่เทียนไว้ข้างใน',
    wrongFeedback: 'Jack-o\'-lantern = a carved pumpkin (ฟักทองแกะสลัก)',
    keyword: 'jack-o\'-lantern = carved pumpkin',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 43)',
      technique: 'cultural_symbol'
    }
  },
  {
    id: 'cult_04',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'introductory',
    question: 'When is Christmas Day celebrated?',
    translation: 'วันคริสต์มาสตรงกับวันใด?',
    options: ['December 25th', 'December 31st', 'November 25th', 'January 1st'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! วันคริสต์มาสตรงกับวันที่ 25 ธันวาคม (December 25th)',
    wrongFeedback: 'Christmas Day is on December 25th',
    keyword: 'Christmas = December 25th',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 46-47)',
      technique: 'holiday_dates'
    }
  },
  {
    id: 'cult_05',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'application',
    question: 'Joe is decorating a pine tree with candy canes, lights, and glittering balls. Which festival is he celebrating?',
    translation: 'โจกำลังตกแต่งต้นสนด้วยลูกกวาดไม้เท้า แสงไฟ และลูกบอลระยิบระยับ เขากำลังเฉลิมฉลองเทศกาลใด?',
    options: ['Christmas Day', 'Songkran Day', 'Halloween Day', 'Valentine\'s Day'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! การตกแต่งต้นสน (pine tree/Christmas tree) คือเทศกาล Christmas',
    wrongFeedback: 'ตกแต่งต้นสน (pine tree) ด้วย candy canes และ lights คือ Christmas Day',
    keyword: 'pine tree decoration = Christmas',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_match',
      title: 'English Worksheet P6 — Festival (Page 48 item d)',
      technique: 'context_clue'
    }
  },
  {
    id: 'cult_06',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'introductory',
    question: 'On February 14th, people give roses and chocolates to show love. What day is it?',
    translation: 'ในวันที่ 14 กุมภาพันธ์ ผู้คนมอบดอกกุหลาบและช็อกโกแลตเพื่อแสดงความรัก วันนี้คือวันอะไร?',
    options: ['Valentine\'s Day', 'Mother\'s Day', 'Christmas Day', 'New Year\'s Day'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! วันที่ 14 กุมภาพันธ์คือวันวาเลนไทน์ (Valentine\'s Day)',
    wrongFeedback: 'February 14th + roses and chocolates = Valentine\'s Day',
    keyword: 'February 14th = Valentine\'s Day',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_match',
      title: 'English Worksheet P6 — Festival (Page 48 item b)',
      technique: 'holiday_dates'
    }
  },
  {
    id: 'cult_07',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'application',
    question: 'When is the Songkran Festival celebrated in Thailand?',
    translation: 'เทศกาลสงกรานต์ในประเทศไทยตรงกับช่วงเวลาใด?',
    options: ['13 to 15 April', '13 to 15 May', '25 to 27 December', '31 October'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! เทศกาลสงกรานต์เริ่มตั้งแต่วันที่ 13 ถึง 15 เมษายน (13 to 15 April)',
    wrongFeedback: 'Songkran begins from 13 to 15 April (13-15 เมษายน)',
    keyword: 'Songkran = 13 to 15 April',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 45)',
      technique: 'thai_culture'
    }
  },
  {
    id: 'cult_08',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'application',
    question: 'During Songkran Day, how do young Thai people express respect to their elders?',
    translation: 'ในช่วงวันสงกรานต์ เยาวชนไทยแสดงความเคารพต่อผู้อาวุโสอย่างไร?',
    options: [
      'By pouring scented water onto their hands',
      'By giving ghost masks and candies',
      'By decorating a pine tree with lights',
      'By giving roses and sweet chocolates'
    ],
    answer: 0,
    correctFeedback: 'ถูกต้อง! การรดน้ำดำหัวผู้ใหญ่ด้วยน้ำอบไทย (pouring scented water onto hands) เป็นประเพณีแสดงความเคารพ',
    wrongFeedback: 'รดน้ำขอพรผู้ใหญ่ = pouring scented water onto elders\' hands',
    keyword: 'respect elders = scented water',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_match',
      title: 'English Worksheet P6 — Festival (Page 48 item e)',
      technique: 'thai_culture'
    }
  },
  {
    id: 'cult_09',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'application',
    question: 'When is Loy Krathong Day celebrated in Thailand?',
    translation: 'วันลอยกระทงในประเทศไทยจัดขึ้นเมื่อใด?',
    options: [
      'On the Full-Moon Day of the Twelfth Lunar Month',
      'On the first day of January',
      'On the 31st of October',
      'On the 13th of April'
    ],
    answer: 0,
    correctFeedback: 'ถูกต้อง! วันลอยกระทงตรงกับวันเพ็ญเดือน 12 (Full-Moon Day of the Twelfth Lunar Month)',
    wrongFeedback: 'Loy Krathong = Full-Moon Day of the Twelfth Lunar Month (วันเพ็ญเดือนสิบสอง)',
    keyword: 'Loy Krathong = Full-Moon Day of Twelfth Lunar Month',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 44)',
      technique: 'thai_culture'
    }
  },
  {
    id: 'cult_10',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'application',
    question: 'What does a traditional Krathong usually contain?',
    translation: 'กระทงตามประเพณีดั้งเดิมมักประกอบด้วยสิ่งใดบ้าง?',
    options: [
      'A candle, three joss-sticks, flowers and coins',
      'A water gun and containers of water',
      'Pumpkins, candy canes and chocolate',
      'A Christmas card, bells and a pine tree'
    ],
    answer: 0,
    correctFeedback: 'ถูกต้อง! ในกระทงประกอบด้วย เทียน (candle) ธูป 3 ดอก (three joss-sticks) ดอกไม้ (flowers) และเหรียญ (coins)',
    wrongFeedback: 'กระทงใส่: candle, three joss-sticks, flowers and coins',
    keyword: 'Krathong = candle, joss-sticks, flowers',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_passage',
      title: 'English Worksheet P6 — Festival (Page 44)',
      technique: 'thai_culture'
    }
  },
  {
    id: 'cult_11',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/2',
    difficulty: 'introductory',
    question: 'In Thailand, what flower do children usually give to their mothers on Mother\'s Day?',
    translation: 'ในประเทศไทย เด็กๆ มักมอบดอกไม้ชนิดใดให้คุณแม่ในวันแม่แห่งชาติ?',
    options: ['Jasmine', 'Rose', 'Sunflower', 'Lotus'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! ดอกมะลิ (Jasmine) คือดอกไม้สัญลักษณ์ประจำวันแม่แห่งชาติ',
    wrongFeedback: 'วันแม่ (Mother\'s Day) มอบดอกมะลิ = Jasmine',
    keyword: 'Mother\'s Day = Jasmine',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'worksheet_match',
      title: 'English Worksheet P6 — Festival (Page 48 item c)',
      technique: 'cultural_symbol'
    }
  },
  {
    id: 'cult_12',
    quest: 'culture_festivals',
    skill: 'reading',
    standard: 'ต 2.1',
    indicator: 'ต 2.1 ป.6/1',
    difficulty: 'application',
    question: 'In Western countries, what do people typically say to greet each other at midnight on December 31st?',
    translation: 'ในประเทศตะวันตก ผู้คนมักกล่าวทักทายกันว่าอย่างไรเมื่อถึงเวลาเที่ยงคืนของวันที่ 31 ธันวาคม?',
    options: ['Happy New Year!', 'Happy Halloween!', 'Merry Christmas!', 'Happy Valentine\'s Day!'],
    answer: 0,
    correctFeedback: 'ถูกต้อง! เที่ยงคืนวันที่ 31 ธันวาคม คือการเข้าสู่ปีใหม่ ผู้คนจะอวยพรว่า "Happy New Year!"',
    wrongFeedback: 'เข้าสู่ปีใหม่ตอนเที่ยงคืนวันที่ 31 ธันวาคม → Happy New Year!',
    keyword: 'midnight Dec 31st = Happy New Year',
    reviewStatus: 'approved',
    approvedModes: ['practice_assessment', 'school_final_50', 'onet_blueprint_32'],
    source: {
      type: 'curriculum_culture',
      title: 'New Year Celebration Greetings',
      technique: 'greeting_convention'
    }
  }
];

// Authored by an agent from the cited worksheets and explicitly reviewed by the
// workspace owner in the Culture review page. A later approval also covers this Chapter 5 practice Quiz.
export const cultureQuestions = cultureQuestionDrafts.map(question => ({
  ...question,
  itemVersion: 'culture-draft-v1',
  reviewStatus: 'approved',
  approvedModes: ['onet_blueprint_32', 'practice_assessment'],
  scoringPolicy: 'first_response_v1',
  contentReview: {
    status: 'approved_for_blueprint',
    reviewer: 'workspace_owner',
    approvedBy: 'workspace_owner',
    approvedAt: '2026-10-14',
    approvalSource: 'explicit_user_chat_after_culture_review',
    practiceApprovalSource: 'explicit_user_chat_after_chapter5_quiz_proposal',
    version: 'culture-draft-v1',
  },
  mediaReview: {
    status: 'not_required',
    version: 'culture-draft-v1',
    reviewer: 'workspace_owner',
  },
}));
