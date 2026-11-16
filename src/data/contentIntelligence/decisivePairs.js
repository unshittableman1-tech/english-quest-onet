/**
 * O-NET ADVENTURE — CONTENT INTELLIGENCE LAYER
 * Module: Decisive Contrast Pairs & Common Confusion Clues
 * 
 * High-utility lexical and conceptual contrast pairs identified from
 * empirical analysis of Primary 6 examination distractors and error review banks.
 */

export const DECISIVE_PAIRS = Object.freeze([
  {
    id: 'pair_borrow_lend',
    title: 'borrow (ขอยืม) vs lend (ให้ยืม)',
    category: 'verbs_confused',
    termA: {
      word: 'borrow (from)',
      thai: 'ขอยืม (เอาเข้ามาหาตัว)',
      example: 'May I borrow your dictionary?',
      exampleThai: 'ฉันขอยืมพจนานุกรมของคุณหน่อยได้ไหม?',
      memoryTip: 'Borrow = รับเข้ามา (In)'
    },
    termB: {
      word: 'lend (to)',
      thai: 'ให้ยืม (ส่งออกไปให้คนอื่น)',
      example: 'Could you lend me your dictionary, please?',
      exampleThai: 'คุณช่วยให้ฉันยืมพจนานุกรมหน่อยได้ไหม?',
      memoryTip: 'Lend = ให้ยืมออกไป (Out)'
    },
    examTrap: 'ในข้อสอบมักหลอกสลับประธาน: "Can you borrow me?" ผิด! ต้องใช้ "Could you lend me?" หรือ "May I borrow...?"'
  },
  {
    id: 'pair_postponed_cancelled',
    title: 'postponed (เลื่อน) vs cancelled (ยกเลิก)',
    category: 'school_notices',
    termA: {
      word: 'postponed / put off',
      thai: 'เลื่อนกำหนดการออกไป (ยังมีจัดอยู่)',
      example: 'The football match has been postponed until next Friday.',
      exampleThai: 'การแข่งขันฟุตบอลถูกเลื่อนออกไปเป็นวันศุกร์หน้า (ยังมีการแข่งขัน)',
      memoryTip: 'Postponed = เลื่อนเวลา แต่ยังจัด'
    },
    termB: {
      word: 'cancelled / called off',
      thai: 'ยกเลิกเด็ดขาด (ไม่มีการจัดแล้ว)',
      example: 'The picnic was cancelled due to heavy rain.',
      exampleThai: 'กิจกรรมปิกนิกถูกยกเลิกเนื่องจากฝนตกหนัก (ไม่มีการจัดแล้ว)',
      memoryTip: 'Cancelled = ยกเลิก ไม่จัดแล้ว'
    },
    examTrap: 'โจทย์ประกาศมักถามว่า "กิจกรรมจะจัดขึ้นเมื่อไหร่?" ถ้าระบุว่า postponed ให้หาเวลาใหม่ แต่ถ้า cancelled คำตอบคือไม่มีการจัด'
  },
  {
    id: 'pair_autumn_fall',
    title: 'autumn (UK) vs fall (US)',
    category: 'seasons_culture',
    termA: {
      word: 'autumn (British English)',
      thai: 'ฤดูใบไม้ร่วง (ภาษาอังกฤษแบบบริติช)',
      example: 'Leaves turn yellow and red in autumn.',
      exampleThai: 'ใบไม้เปลี่ยนเป็นสีเหลืองและแดงในฤดูใบไม้ร่วง',
      memoryTip: 'autumn = สำเนียงอังกฤษ (UK)'
    },
    termB: {
      word: 'fall (American English)',
      thai: 'ฤดูใบไม้ร่วง (ภาษาอังกฤษแบบอเมริกัน)',
      example: 'Schools in America usually start in the fall.',
      exampleThai: 'โรงเรียนในสหรัฐอเมริกามักเปิดเทอมในฤดูใบไม้ร่วง',
      memoryTip: 'fall = ใบไม้ร่วง (US)'
    },
    examTrap: 'โจทย์มักถามว่าคำใดหมายถึงฤดูเดียวกัน หรือถามความต่างระหว่าง British vs American English'
  },
  {
    id: 'pair_hand_in_out',
    title: 'hand in (ส่งงาน) vs hand out (แจกงาน)',
    category: 'classroom_commands',
    termA: {
      word: 'hand in / turn in',
      thai: 'ส่งงาน / ส่งการบ้านที่คุณครู',
      example: 'Please hand in your science project before Friday.',
      exampleThai: 'กรุณาส่งโครงงานวิทยาศาสตร์ก่อนวันศุกร์',
      memoryTip: 'Hand IN = ส่งเข้ามาให้ครู'
    },
    termB: {
      word: 'hand out / give out',
      thai: 'แจกจ่าย / แจกใบงานให้นักเรียน',
      example: 'The teacher hands out the test papers.',
      exampleThai: 'คุณครูแจกกระดาษข้อสอบให้นักเรียน',
      memoryTip: 'Hand OUT = แจกออกไปให้นักเรียน'
    },
    examTrap: 'เมื่อครูสั่ง "Hand in your paper" หมายถึงให้นักเรียนส่งงาน ไม่ใช่แจกกระดาษ'
  },
  {
    id: 'pair_slow_watch',
    title: 'slow down (ชะลอ) vs watch out (ระวัง)',
    category: 'safety_signs',
    termA: {
      word: 'slow down',
      thai: 'ชะลอความเร็ว / ขับช้าลง',
      example: 'Drivers should slow down in a school zone.',
      exampleThai: 'ผู้ขับขี่ควรชะลอความเร็วในเขตโรงเรียน',
      memoryTip: 'Slow = ลดความเร็ว'
    },
    termB: {
      word: 'watch out / look out',
      thai: 'ระมัดระวังอันตราย',
      example: 'Watch out for children crossing the street.',
      exampleThai: 'ระมัดระวังเด็กๆ ที่กำลังข้ามถนน',
      memoryTip: 'Watch out = ใช้สายตาระวังรอบตัว'
    },
    examTrap: 'ป้ายเตือนรูปเด็กข้ามถนน มักมีข้อความอธิบายคู่กัน: Drivers should slow down and watch out for children.'
  },
  {
    id: 'pair_may_could',
    title: 'May I (ฉันขอทำ) vs Could you (ช่วยทำให้ฉัน)',
    category: 'polite_requests',
    termA: {
      word: 'May I ...? / Can I ...?',
      thai: 'ฉันขออนุญาตทำสิ่งนี้ได้ไหม (ผู้พูดเป็นคนทำ)',
      example: 'May I open the window, please?',
      exampleThai: 'ฉันขออนุญาตเปิดหน้าต่างได้ไหมครับ? (ฉันเป็นคนเปิด)',
      memoryTip: 'May I = ฉันทำเอง'
    },
    termB: {
      word: 'Could you ...? / Would you ...?',
      thai: 'คุณช่วยทำสิ่งนี้ให้หน่อยได้ไหม (ขอร้องให้อีกคนทำ)',
      example: 'Could you open the window, please?',
      exampleThai: 'คุณช่วยเปิดหน้าต่างให้หน่อยได้ไหมครับ? (ขอให้คู่สนทนาเป็นคนเปิด)',
      memoryTip: 'Could you = ขอให้เธอทำ'
    },
    examTrap: 'ถ้ารู้สึกร้อนและนั่งอยู่ไกลหน้าต่าง ต้องพูดว่า "Could you open the window?" ไม่ใช่ "May I open the window?"'
  }
]);

export function getDecisivePairById(id) {
  return DECISIVE_PAIRS.find(p => p.id === id) || null;
}
