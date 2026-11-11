import UIIcon, { UIIconText } from './UIIcon';
import { useState } from 'react';
import SpeakButton from './SpeakButton';
import ConversationPractice from './ConversationPractice';

// ── TechniqueHub ──────────────────────────────────────────────
// Full O-NET Strategy & Cheat Sheet Hub


export const ALL_TECHNIQUES = [
  {
    id: 'part1',
    part: 'Part 1',
    title: '💬 Conversation Patterns (บทสนทนา)',
    icon: '💬',
    color: 'from-amber-400 to-orange-500',
    description: 'สูตรทักทาย ถามตอบ และตอบรับตามสถานการณ์ในชีวิตประจำวัน',
    rules: [
      { 
        q: 'How are you?', 
        qTh: 'คุณสบายดีไหม? / เป็นอย่างไรบ้าง?',
        a: "I'm fine / Not bad / Pretty good / OK", 
        aTh: 'ฉันสบายดี / ก็ไม่เลวนะ / ค่อนข้างดี / สบายดี',
        note: 'ตอบความรู้สึกสบายดี' 
      },
      { 
        q: 'Thank you very much.', 
        qTh: 'ขอบคุณมาก ๆ ครับ/ค่ะ',
        a: "You're welcome. / No problem. / Don't mention it.", 
        aTh: 'ด้วยความยินดี / ไม่มีปัญหา / ไม่เป็นไรเลย',
        note: 'ตอบรับคำขอบคุณ' 
      },
      { 
        q: "I'm sorry I'm late.", 
        qTh: 'ฉันขอโทษที่มาสายครับ/ค่ะ',
        a: "That's OK. / Never mind. / Don't worry.", 
        aTh: 'ไม่เป็นไรเลย / ช่างมันเถอะ / ไม่ต้องกังวลนะ',
        note: 'ตอบรับคำขอโทษ' 
      },
      { 
        q: 'Can I help you?', 
        qTh: 'มีอะไรให้ฉันช่วยไหมครับ/ค่ะ? (พนักงานถามลูกค้า)',
        a: "Yes, please. I'm looking for... / No, thank you.", 
        aTh: 'ช่วยหน่อยครับ กำลังหา... / ไม่เป็นไร ขอบคุณครับ',
        note: 'ในร้านค้า / ซื้อของ' 
      },
      { 
        q: 'Would you like some coffee?', 
        qTh: 'คุณอยากรับกาแฟไหมครับ/ค่ะ?',
        a: 'Yes, please. / No, thank you.', 
        aTh: 'รับครับ ขอบคุณครับ / ไม่รับครับ ขอบคุณครับ',
        note: 'การเสนอ / การชวน' 
      },
      { 
        q: 'May I go out, please?', 
        qTh: 'ขออนุญาตออกไปข้างนอกได้ไหมครับ/ค่ะ?',
        a: 'Yes, you may. / No, you may not.', 
        aTh: 'ได้เลย อนุญาต / ไม่อนุญาตนะ',
        note: 'ขออนุญาตออกนอกห้อง' 
      },
      { 
        q: 'Nice to meet you.', 
        qTh: 'ยินดีที่ได้รู้จักครับ/ค่ะ',
        a: 'Nice to meet you, too.', 
        aTh: 'ยินดีที่ได้รู้จักเช่นกันครับ/ค่ะ',
        note: 'ตัวอย่างคำตอบเมื่อทักทายคนเพิ่งรู้จัก' 
      },
      { 
        q: 'Goodbye!', 
        qTh: 'ลาก่อนนะ!',
        a: 'See you! / Take care! / Bye!', 
        aTh: 'แล้วเจอกันใหม่! / ดูแลตัวเองด้วยนะ! / บาย!',
        note: 'อำลา' 
      },
    ],
  },
  {
    id: 'part2',
    part: 'Part 2',
    title: '🚦 Signs & Notices (ป้ายสัญลักษณ์)',
    icon: '🚦',
    color: 'from-red-600 to-orange-500',
    description: 'สูตรถอดรหัสป้ายจราจรและป้ายเตือนในข้อสอบ O-NET',
    rules: [
      { 
        q: 'NO + V-ing / Noun', 
        qTh: 'โครงสร้างป้ายห้าม (เช่น No Smoking, No Parking)',
        a: 'ห้ามทำเด็ดขาด (ตัดช้อยส์ที่บอกว่าทำได้ทิ้ง)', 
        note: 'เช่น No Parking = ห้ามจอดรถ' 
      },
      { 
        q: 'FREE ...', 
        qTh: 'ของฟรี / บริการฟรี (เช่น Free WiFi, Buy 1 Get 1 Free)',
        a: 'ไม่ต้องจ่ายเงิน / ฟรี (ตัดช้อยส์ที่บอกว่าต้องจ่าย)', 
        note: 'เช่น Free Entry = เข้าฟรี ไม่เสียเงิน' 
      },
      { 
        q: '... ONLY', 
        qTh: '...เท่านั้น (เช่น Staff Only, Members Only)',
        a: 'อนุญาตเฉพาะกลุ่มนั้นเท่านั้น', 
        note: 'เช่น Staff Only = เฉพาะเจ้าหน้าที่/พนักงานเท่านั้น' 
      },
      { 
        q: 'OPEN / CLOSED', 
        qTh: 'เปิดทำการ / ปิดทำการ',
        a: 'ดูวันและเวลาทำการที่ระบุคู่กัน', 
        note: 'เช่น Closed on Sundays = ปิดทุกวันอาทิตย์' 
      },
      { 
        icon: '➡️', 
        q: 'ลูกศรชี้ ➡️', 
        qTh: 'สัญลักษณ์ลูกศรบอกทิศทาง',
        a: 'บอกทางเข้า/ออก หรือทิศทางการเดินรถ', 
        note: 'เช่น Entrance → (ทางเข้าให้เลี้ยวไปทางขวา)' 
      },
    ],
  },
  {
    id: 'part3',
    part: 'Part 3',
    title: '📖 Reading Comprehension (การอ่าน)',
    icon: '📖',
    color: 'from-indigo-600 to-blue-600',
    description: 'สูตร Q → Scan → Answer อ่านจับใจความรวดเร็ว',
    rules: [
      { 
        q: 'Who ... ?', 
        qTh: 'ใคร...?',
        a: 'มองหา: ชื่อคน, he, she, they, อาชีพ', 
        note: 'ถามบุคคลหรือผู้กระทำ' 
      },
      { 
        q: 'Where ... ?', 
        qTh: 'ที่ไหน...?',
        a: 'มองหา: ชื่อสถานที่, in/at/on..., ชื่อเมือง', 
        note: 'ถามตำแหน่งหรือสถานที่' 
      },
      { 
        q: 'When ... ?', 
        qTh: 'เมื่อไหร่ / เวลาใด...?',
        a: 'มองหา: เวลา, วัน, เดือน, ปี, o\'clock', 
        note: 'ถามช่วงเวลา' 
      },
      { 
        q: 'Why ... ?', 
        qTh: 'ทำไม / เพราะเหตุใด...?',
        a: 'มองหา: because (เพราะว่า), to + V1 (เพื่อจะ), so (ดังนั้น)', 
        note: 'ถามเหตุผลหรือสาเหตุ' 
      },
      { 
        q: 'How ... ?', 
        qTh: 'อย่างไร / ด้วยวิธีใด...?',
        a: 'มองหา: by + ยานพาหนะ (by bus, by car, by train) หรือ on foot', 
        note: 'ถามวิธีการหรือพาหนะ' 
      },
      { 
        q: 'How many ... ?', 
        qTh: 'มีจำนวนเท่าไหร่ (นับได้)...?',
        a: 'มองหา: ตัวเลขหรือจำนวนนับ (1, 2, 3...)', 
        note: 'ถามจำนวนของสิ่งของหรือคน' 
      },
      { 
        q: 'Main idea ... ?', 
        qTh: 'ใจความสำคัญคืออะไร...?',
        a: 'อ่านทั้งเรื่องและมองหาแนวคิดหลักที่ครอบคลุมเนื้อหาสำคัญที่สุด', 
        note: 'ถามใจความสำคัญของบทความ' 
      },
    ],
  },
  {
    id: 'part4',
    part: 'Part 4',
    title: '⚡ Grammar Indicators (คำใบ้ไวยากรณ์)',
    icon: '⚡',
    color: 'from-pink-600 to-rose-500',
    description: 'มองหาคำใบ้ (Indicator words) แล้วกาคำตอบทันที',
    rules: [
      { 
        q: 'yesterday / last... / ...ago', 
        qTh: 'เมื่อวานนี้ / ...ที่แล้ว / ...มาแล้ว (บอกอดีต)',
        a: 'กริยาช่อง 2 (went, ate, saw, played)', 
        note: 'Past Simple Tense (เหตุการณ์ในอดีต)' 
      },
      { 
        q: 'now / at the moment / Listen!', 
        qTh: 'ตอนนี้ / ในขณะนี้ / ฟังดูสิ! (กำลังเกิดขึ้นขณะพูด)',
        a: 'is / am / are + V-ing', 
        note: 'Present Continuous Tense' 
      },
      { 
        q: 'tomorrow / next... / soon', 
        qTh: 'พรุ่งนี้ / ...หน้า / เร็ว ๆ นี้ (บอกอนาคต)',
        a: 'will + V ช่อง 1 แท้ (ไม่เติมอะไรเลย)', 
        note: 'Future Simple Tense' 
      },
      { 
        q: 'always / usually / every day', 
        qTh: 'เสมอ / เป็นประจำ / ทุกๆ วัน (นิสัยหรือความจริง)',
        a: 'V1 (เติม -s/-es เมื่อประธานเป็น He/She/It)', 
        note: 'Present Simple Tense' 
      },
      { 
        q: '... than ...', 
        qTh: '...กว่า... (เปรียบเทียบระหว่าง 2 สิ่ง)',
        a: 'มักใช้ adjective ขั้นกว่า เช่น taller, faster หรือ more useful', 
        note: 'การเปรียบเทียบขั้นกว่า (Comparative)' 
      },
      { 
        q: 'the ... (ในประโยคเปรียบเทียบ)', 
        qTh: '...ที่สุด (เปรียบเทียบในกลุ่มตั้งแต่ 3 สิ่งขึ้นไป)',
        a: 'Adjective เติม -est หรือ the most ...', 
        note: 'การเปรียบเทียบขั้นสุด (Superlative)' 
      },
      { 
        q: "didn't / don't / doesn't", 
        qTh: 'รูปปฏิเสธของ Verb to do',
        a: 'กริยาช่อง 1 แท้เท่านั้น (ไม่เติม -s/-ed)', 
        note: 'หลัง v.to do = ต้องใช้ V1 แท้เสมอ' 
      },
      { 
        q: 'can / could / must / should', 
        qTh: 'สามารถ / ได้ / ต้อง / ควรจะ (กริยาช่วย Modal Verbs)',
        a: 'กริยาช่อง 1 แท้เท่านั้น (ห้ามผัน ไม่เติม -s/-ing/-ed)', 
        note: 'หลัง Modal Verb = ใช้ V1 แท้เสมอ' 
      },
    ],
  },
  {
    id: 'part5',
    part: 'Part 5',
    title: '📦 Sentence & Event Ordering (เรียงลำดับ)',
    icon: '📦',
    color: 'from-amber-500 to-yellow-500',
    description: 'สูตรเรียงลำดับเหตุการณ์ในชีวิตประจำวัน',
    rules: [
      { 
        q: 'คำบอกลำดับต้นประโยค', 
        qTh: 'คำเชื่อมบอกลำดับกาลเวลา',
        a: 'First / At first (เริ่ม) → Then / Next / After that (กลาง) → Finally / At last (จบ)', 
        aTh: 'อันดับแรก (เริ่ม) → จากนั้น/หลังจากนั้น (กลางเรื่อง) → ในที่สุด (จบเรื่อง)',
        note: 'หาคำเชื่อมก่อนเสมอในการเรียงประโยค' 
      },
      { 
        q: 'ลำดับซื้อตั๋ว / ขึ้นรถ', 
        qTh: 'สถานการณ์การเดินทางหรือซื้อตั๋ว',
        a: 'ไปถึง → ถามตั๋ว → จ่ายเงิน → รับตั๋ว → ขึ้นรถ/เข้าชม', 
        note: 'arrived → asked → paid → got ticket → got on' 
      },
      { 
        q: 'ลำดับปรุงอาหาร', 
        qTh: 'ขั้นตอนการทำอาหาร',
        a: 'เตรียมวัตถุดิบ → ผสม → ปรุง/ต้ม/ทอด → เสิร์ฟ → รับประทาน', 
        note: 'prepare → mix → cook → serve → eat' 
      },
      { 
        q: 'ลำดับประจำวัน', 
        qTh: 'กิจวัตรประจำวันตั้งแต่เช้าถึงไปเรียน',
        a: 'ตื่นนอน → แปรงฟัน → ทานอาหารเช้า → แต่งตัว → ไปโรงเรียน', 
        note: 'wake up → brush → breakfast → uniform → school' 
      },
    ],
  },
  {
    id: 'part6',
    part: 'Part 6',
    title: '🎯 Exam Command Decoder (ถอดรหัสคำสั่งข้อสอบ)',
    icon: '🎯',
    color: 'from-blue-500 to-indigo-600',
    description: '12 รูปแบบคำสั่งและคำถามที่พบบ่อยที่สุดในข้อสอบ O-NET พร้อมวิธีคิดและจุดที่มักลวง',
    rules: [
      {
        q: 'According to the passage,...',
        qTh: 'จากเรื่องที่อ่าน...',
        a: 'คำตอบอยู่ในเนื้อเรื่องตรงตัว (Direct Detail) สแกนหาคำสำคัญแล้วเทียบประโยค',
        aTh: 'ห้ามคิดไปเองโดยไม่อิงเนื้อเรื่อง',
        note: 'สแกนคีย์เวิร์ดในเรื่อง ตอบตามข้อเท็จจริง'
      },
      {
        q: 'What is the passage mainly about?',
        qTh: 'เรื่องนี้มีใจความสำคัญหลักเกี่ยวกับอะไร?',
        a: 'ใจความสำคัญภาพรวมทั้งเรื่อง (Main Idea) ครอบคลุมทุกย่อหน้า',
        aTh: 'ตัดช้อยส์ที่เจาะจงแค่ตัวอย่างย่อยหรือจุดเล็กจุดเดียว',
        note: 'มักอยู่ที่ประโยคแรกหรือประโยคสรุป'
      },
      {
        q: 'What is the best title for this passage?',
        qTh: 'ชื่อเรื่องใดเหมาะสมที่สุดสำหรับบทอ่านนี้?',
        a: 'ชื่อเรื่องที่ครอบคลุมแก่นเรื่อง ไม่แคบและไม่กว้างเกินไป',
        aTh: 'สรุปธีมหลักของเนื้อเรื่องทั้งหมด',
        note: 'Best title = Main Idea ฉบับกะทัดรัด'
      },
      {
        q: 'What is the purpose of this sign / text?',
        qTh: 'จุดประสงค์ของป้ายหรือข้อความนี้คืออะไร?',
        a: 'To inform (แจ้งข้อมูล) / To warn (เตือนอันตราย) / To invite (เชิญชวน)',
        aTh: 'สังเกตประเภทของข้อความ: ป้ายเตือน, ประกาศ หรือการขอร้อง',
        note: 'ดูคำกริยาขึ้นต้น เช่น Please, Do not, Welcome'
      },
      {
        q: 'Which of the following is NOT true / NOT correct?',
        qTh: 'ข้อใดต่อไปนี้ "ไม่ถูกต้อง"?',
        a: 'วงกลมคำว่า NOT ตัวใหญ่ทันที! โจทย์สั่งให้หาข้อที่ขัดแย้งกับเรื่อง',
        aTh: 'ตัด 3 ตัวเลือกที่ตรงกับเรื่องออก ตัวเลือกที่ไม่ตรงคือคำตอบ',
        note: 'ระวังกับดัก: อย่าเผลอเลือกข้อที่ถูกต้องตามเรื่อง'
      },
      {
        q: 'All of the following are mentioned EXCEPT...',
        qTh: 'ทุกข้อถูกกล่าวถึงในเรื่อง "ยกเว้น" ข้อใด?',
        a: 'เช็กช้อยส์ที่ปรากฏในบทอ่าน 3 ข้อ ข้อที่ไม่ปรากฏเลยคือคำตอบ',
        aTh: 'วงกลมคำว่า EXCEPT เสมอ',
        note: 'EXCEPT = ข้อยกเว้นที่เรื่องไม่ได้ระบุ'
      },
      {
        q: 'What can be inferred from the story?',
        qTh: 'จากเรื่อง สามารถสรุปความได้อย่างไร?',
        a: 'คิดเชื่อมโยงอย่างมีเหตุผลจากเบาะแสในเรื่อง (Inference)',
        aTh: 'เรื่องไม่ได้เขียนตรงๆ แต่มีร่องรอยหลักฐานชัดเจน',
        note: 'ต้องมีหลักฐานรองรับ ห้ามจินตนาการเกินเรื่อง'
      },
      {
        q: 'The word "it / they" refers to...',
        qTh: 'คำสรรพนามนี้หมายถึงคำนามใด?',
        a: 'ย้อนดูคำนามที่เพิ่งกล่าวถึงในประโยคก่อนหน้า (Pronoun Reference)',
        aTh: 'ตรวจพจน์: it = สิ่งเดียว / they = หลายสิ่งหรือหลายคน',
        note: 'ลองแทนคำนามลงในประโยคว่าความหมายลงตัวหรือไม่'
      },
    ],
  },
  {
    id: 'part7',
    part: 'Part 7',
    title: '🔊 Intonation Detective (จับคลื่นเสียงท้ายประโยค)',
    icon: '🔊',
    color: 'from-emerald-500 to-teal-600',
    description: 'กฎการออกเสียงสูง-ต่ำท้ายประโยค (Rising ↗ vs Falling ↘) ตามตัวชี้วัด ต 2.2 ป.6/1',
    rules: [
      {
        q: 'Yes / No Questions (กริยาช่วยนำหน้า)',
        qTh: 'Is, Am, Are, Do, Does, Did, Can, Could, May',
        a: 'ลงท้ายด้วยเสียงสูง Rising Intonation (↗)',
        aTh: 'เช่น "Are you ready? ↗", "Can you swim? ↗", "Does he like tea? ↗"',
        note: 'คำถามที่ต้องการคำตอบ ใช่ หรือ ไม่ใช่ เสียงจะขึ้นสูงท้ายประโยค'
      },
      {
        q: 'Wh- Questions (ถามหาข้อมูล)',
        qTh: 'Who, What, Where, When, Why, How',
        a: 'ลงท้ายด้วยเสียงต่ำ Falling Intonation (↘)',
        aTh: 'เช่น "Where do you live? ↘", "What is your name? ↘", "How are you? ↘"',
        note: 'คำถามที่ต้องการข้อมูล ท้ายประโยคจะลดเสียงลงต่ำ'
      },
      {
        q: 'Choice Questions (คำถามให้เลือกด้วย "or")',
        qTh: 'คำถามให้เลือกระหว่างสองสิ่งขึ้นไป',
        a: 'เสียงสูงตรงตัวเลือกแรก (↗) แล้วลงต่ำตรงตัวเลือกสุดท้าย (↘)',
        aTh: 'เช่น "Do you want tea (↗) or coffee? (↘)"',
        note: 'ขึ้นก่อนแล้วลงท้าย ชี้ชัดที่ตัวเลือกสุดท้าย'
      },
      {
        q: 'Polite Requests (ประโยคขอร้องสุภาพ)',
        qTh: 'ประโยคขอร้องที่ลงท้ายด้วย please',
        a: 'มักจบด้วยเสียงสูงนุ่มนวล Rising Intonation (↗)',
        aTh: 'เช่น "Could you help me, please? ↗"',
        note: 'แสดงความสุภาพและเปิดรับความช่วยเหลือ'
      },
      {
        q: 'Statements & Commands (บอกเล่าและคำสั่ง)',
        qTh: 'ประโยคบอกเล่าทั่วไปหรือประโยคสั่ง/ห้าม',
        a: 'ลงท้ายด้วยเสียงต่ำ Falling Intonation (↘)',
        aTh: 'เช่น "I walk to school. ↘", "Sit down, please. ↘"',
        note: 'เมื่อพูดจบประโยคบอกเล่าสมบูรณ์ เสียงจะลดต่ำลง'
      },
    ],
  },
  {
    id: 'part8',
    part: 'Part 8',
    title: '⚖️ Decisive Keyword Pairs (คู่คำตัดสินผลสอบ)',
    icon: '⚖️',
    color: 'from-violet-500 to-purple-600',
    description: 'คู่คำศัพท์และวลีที่ออกสอบบ่อยและเด็กมักสับสน พร้อมจุดสังเกตเพื่อเลือกช้อยส์ถูกต้อง',
    rules: [
      {
        q: 'borrow vs lend',
        qTh: 'ขอยืม vs ให้ยืม',
        a: 'borrow = ขอยืม (รับเข้ามาหาตัว) / lend = ให้ยืม (ส่งออกไปให้คนอื่น)',
        aTh: 'May I borrow your ruler? (ขอยืมไม้บรรทัดหน่อย) vs Can you lend me your ruler? (ให้ยืมไม้บรรทัดได้ไหม)',
        note: 'สูตรจำ: Borrow In (ขอยืมเข้า) / Lend Out (ให้ยืมออก)'
      },
      {
        q: 'postponed vs cancelled',
        qTh: 'เลื่อนเวลา vs ยกเลิกถาวร',
        a: 'postpone = เลื่อนวันเวลา (ยังมีจัดในอนาคต) / cancel = ยกเลิก (ไม่มีการจัดแล้ว)',
        aTh: 'The picnic is postponed to Sunday. (เลื่อนไปวันอาทิตย์)',
        note: 'ข้อสอบมักลวงว่ากิจกรรมถูก cancel แต่เนื้อเรื่องบอกว่า postpone'
      },
      {
        q: 'autumn vs fall',
        qTh: 'ฤดูใบไม้ร่วง (British vs American)',
        a: 'ความหมายเดียวกัน คือ "ฤดูใบไม้ร่วง" (ใบไม้เปลี่ยนสีและร่วงหล่น)',
        aTh: 'autumn นิยมในอังกฤษ (UK), fall นิยมในอเมริกา (US)',
        note: 'สภาพอากาศ cool, dry, leaves turn yellow/red'
      },
      {
        q: 'hand in vs hand out',
        qTh: 'ส่งงาน vs แจกจ่าย',
        a: 'hand in = ส่งงาน/มอบให้ครู / hand out = แจกจ่ายเอกสารให้นักเรียน',
        aTh: 'Please hand in your homework. (ส่งการบ้าน) vs The teacher hands out the test. (ครูแจกข้อสอบ)',
        note: 'In = เข้าไปหาครู / Out = กระจายออกไปหานักเรียน'
      },
      {
        q: 'slow down vs watch out',
        qTh: 'ชะลอความเร็ว vs ระวังอันตรายทันที',
        a: 'slow down = ลดความเร็วลง / watch out = ระวังอันตรายที่กำลังจะเกิดตรงหน้า',
        aTh: 'Watch out! The floor is wet. (ระวัง พื้นเปียก) vs Slow down near the school. (ชะลอความเร็ว)',
        note: 'ป้ายเตือนอุบัติเหตุมักใช้ Watch out / Look out'
      },
      {
        q: 'May I...? vs Could you...?',
        qTh: 'ขออนุญาตทำเอง vs ขอร้องให้อีกฝ่ายช่วยทำ',
        a: 'May I [V] = ขออนุญาตตนเองทำ / Could you [V] = ขอร้องให้อีกฝ่ายช่วยทำ',
        aTh: 'May I go out? (ฉันขอออกไปข้างนอกได้ไหม) vs Could you help me? (คุณช่วยฉันหน่อยได้ไหม)',
        note: 'ดูประธานหลัง Modal: I = เราทำเอง, You = ขอให้เขาทำ'
      },
    ],
  },
];

export default function TechniqueHub({ onBack }) {
  const [activePart, setActivePart] = useState('part1');
  const [practicing, setPracticing] = useState(false);
  const currentTech = ALL_TECHNIQUES.find(t => t.id === activePart) || ALL_TECHNIQUES[0];

  return (
    <div className="py-6 px-4 max-w-5xl mx-auto pb-16" spellCheck={false}>
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-300 shadow-md flex items-center gap-3.5 mb-5">
        {onBack && (
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-2xl bg-amber-100 hover:bg-amber-200 text-slate-950 shadow-sm flex items-center justify-center font-black text-lg border-2 border-amber-300 transition-all active:scale-95 shrink-0"
            title="กลับไปแผนที่"
          >
            <UIIcon value={"←"} />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-black text-slate-950 flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 rounded-xl border border-amber-300 text-xl inline-flex"><UIIcon value={"🧠"} /></span>
            สูตรลัด O-NET Technique Hub
          </h1>
          <p className="text-xs md:text-sm font-bold text-slate-700 mt-0.5">คลังสูตรลัดและเทคนิคตัดช้อยส์สำหรับพิชิตข้อสอบ O-NET ภาษาอังกฤษ</p>
        </div>
      </div>

      {/* Part Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {ALL_TECHNIQUES.map(tech => {
          const isActive = tech.id === activePart;
          return (
            <button
              key={tech.id}
              onClick={() => { setActivePart(tech.id); setPracticing(false); }}
              className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-black whitespace-nowrap transition-all flex items-center gap-2 border-2 shadow-sm ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300 scale-[1.02]'
                  : 'bg-white/95 hover:bg-white text-slate-800 border-slate-300 hover:text-slate-950 hover:border-amber-400'
              }`}
            >
              <span className="text-base"><UIIcon value={tech.icon} /></span>
              <span>{tech.part}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Part Card */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-amber-300 shadow-md mb-5">
        <div className="flex items-center gap-3.5 mb-2">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTech.color} flex items-center justify-center text-2xl shadow-md text-white shrink-0`}>
            <UIIcon value={currentTech.icon} />
          </div>
          <div>
            <span className="text-xs font-black text-amber-900 uppercase tracking-wider bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
              {currentTech.part}
            </span>
            <h2 className="text-lg md:text-xl font-black text-slate-950 mt-1">{currentTech.title}</h2>
          </div>
        </div>
        <p className="text-slate-800 font-bold text-xs md:text-sm leading-relaxed ml-1">{currentTech.description}</p>
        {!practicing && (
          <button type="button" onClick={() => setPracticing(true)} className="mt-4 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-600 px-5 py-2.5 font-black text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">ลองฝึก {currentTech.part}</button>
        )}
      </div>

      {practicing && <ConversationPractice key={activePart} part={activePart} title={currentTech.part} onClose={() => setPracticing(false)} />}
      {/* Rules list — 2 Columns on Desktop/Tablet, High-Contrast & Crisp */}
      {!practicing && <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {currentTech.rules.map((rule, idx) => (
          <div 
            key={idx} 
            className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border-2 border-amber-200/90 hover:border-amber-400 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between gap-3"
          >
            <div>
              {/* Question Row */}
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-amber-200">
                <div className="flex-1">
                  <div className="font-black text-slate-950 text-base md:text-lg flex items-center gap-2">
                    <span className="leading-snug">{rule.q}</span>
                    <SpeakButton text={rule.q} className="p-1 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors shrink-0" />
                  </div>
                  {rule.qTh && (
                    <div className="text-xs md:text-sm text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded border border-slate-300 font-bold shrink-0">แปล</span>
                      <span>{rule.qTh}</span>
                    </div>
                  )}
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 shrink-0 font-black font-mono">
                  #{idx + 1}
                </span>
              </div>

              {/* Answer Row */}
              <div className="bg-emerald-100/90 border-2 border-emerald-400/90 rounded-xl px-3 py-2 text-emerald-950 font-black text-sm md:text-base leading-relaxed mb-2 flex items-start gap-2">
                <span className="shrink-0 text-emerald-700 mt-0.5">
                  <UIIcon value={"👉"} />
                </span>
                <div className="flex-1">
                  <div className="break-words">{rule.a}</div>
                  {rule.aTh && (
                    <div className="text-xs md:text-sm text-emerald-800 font-medium mt-1.5 pt-1.5 border-t border-emerald-300/80 flex items-center gap-1.5">
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-200/80 text-emerald-900 rounded border border-emerald-400/60 font-bold shrink-0">แปล</span>
                      <span>{rule.aTh}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tip/Note Row */}
            {rule.note && (
              <div className="bg-amber-100/80 border border-amber-300 rounded-xl px-3 py-2 text-amber-950 text-xs md:text-sm font-bold flex items-start gap-2 leading-relaxed">
                <span className="shrink-0 text-amber-700 mt-0.5">
                  <UIIcon value={"💡"} />
                </span>
                <span className="break-words">{rule.note}</span>
              </div>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
}
