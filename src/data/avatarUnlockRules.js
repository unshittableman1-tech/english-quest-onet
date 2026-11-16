// REVIEW VALUES ONLY. No code here enables production policy or awards XP.
export const COSMETIC_POLICY_VERSION='avatar-unlock-v13-draft';
const rule=(kind,id,group,type,target,reference,requirementTh)=>Object.freeze({kind,id,group,type,target,reference,requirementTh,approval:'DRAFT'});
export const AVATAR_UNLOCK_RULES=Object.freeze([
  rule('equipment','story-book','xp','DEFAULT',0,null,'ไอเทมเริ่มต้น ใช้ได้โดยไม่ต้องสะสม XP'),
  rule('equipment','map','xp','XP_THRESHOLD',300,null,'ข้อเสนอ: มี XP ที่ตรวจสอบแล้วครบ 300'),
  rule('equipment','compass','xp','XP_THRESHOLD',800,null,'ข้อเสนอ: มี XP ที่ตรวจสอบแล้วครบ 800'),
  rule('equipment','backpack','xp','LEVEL_THRESHOLD',5,null,'ข้อเสนอ: ถึง Level 5 จาก XP ที่ตรวจสอบแล้ว'),
  rule('equipment','lantern','xp','XP_THRESHOLD',1500,null,'ข้อเสนอ: มี XP ที่ตรวจสอบแล้วครบ 1,500'),
  rule('equipment','vocabulary-scroll','xp','XP_THRESHOLD',2500,null,'ข้อเสนอ: มี XP ที่ตรวจสอบแล้วครบ 2,500'),
  rule('equipment','vocabulary-stone','achievement','VOCAB_CATEGORY_COMPLETION',1,'daily_routine','ข้อเสนอ: ผ่านหมวด Daily Routine ที่ระบบยืนยัน'),
  rule('equipment','grammar-shield','achievement','QUEST_COMPLETION',1,'pronouns_master','ข้อเสนอ: ผ่าน Pronouns Master ที่ระบบยืนยัน'),
  rule('equipment','time-hourglass','achievement','CHAPTER_COMPLETION',1,'2','ข้อเสนอ: ผ่าน Chapter 2 ครบตามรายการที่ตรวจแล้ว'),
  rule('equipment','writing-quill','achievement','TEACHER_ASSIGNMENT_COMPLETION',1,'any','ข้อเสนอ: ทำงานที่ครูมอบหมายสำเร็จและระบบยืนยัน'),
  rule('effect','none','xp','DEFAULT',0,null,'ตัวเลือกเริ่มต้น ไม่มีเอฟเฟกต์'),
  rule('effect','soft_glow','xp','DEFAULT',0,null,'เอฟเฟกต์เริ่มต้น ใช้ได้โดยไม่ต้องสะสม XP'),
  rule('effect','explorer_spark','xp','XP_THRESHOLD',800,null,'ข้อเสนอ: มี XP ที่ตรวจสอบแล้วครบ 800'),
  rule('effect','ocean_breeze','achievement','VOCAB_CATEGORY_COMPLETION',1,'transport','ข้อเสนอ: ผ่านหมวด Transport ที่ระบบยืนยัน'),
  rule('effect','golden_sparkles','achievement','BADGE_COUNT',3,null,'ข้อเสนอ: ได้รับเหรียญจากระบบที่ตรวจแล้ว 3 เหรียญ'),
  rule('effect','forest_aura','achievement','QUEST_COMPLETION',1,'reading','ข้อเสนอ: ผ่าน Reading ที่ระบบยืนยัน'),
  rule('effect','star_halo','achievement','CHAPTER_COMPLETION',1,'2','ข้อเสนอ: ผ่าน Chapter 2 ครบตามรายการที่ตรวจแล้ว'),
  rule('effect','legendary_glow','achievement','BOSS_COMPLETION',1,'strategy_boss','ข้อเสนอ: ผ่าน The Question Sphinx ที่ระบบยืนยัน'),
  rule('effect','wisdom_aura','achievement','QUEST_COMPLETION',1,'pronouns_master','ข้อเสนอ: ผ่าน Pronouns Master ที่ระบบยืนยัน'),
  rule('effect','constellation_trail','achievement','TEACHER_ASSIGNMENT_COMPLETION',1,'any','ข้อเสนอ: ทำงานที่ครูมอบหมายสำเร็จและระบบยืนยัน'),
]);
export const getAvatarUnlockRule=(kind,id)=>AVATAR_UNLOCK_RULES.find(rule=>rule.kind===kind&&rule.id===id);
