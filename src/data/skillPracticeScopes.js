export const SKILL_PRACTICE_SCOPE_VERSION = 'practice-scope-v1';

export const SKILL_PRACTICE_SCOPES = Object.freeze([
  Object.freeze({ id: 'vocabulary', name: 'คำศัพท์', english: 'Vocabulary',
    scope: 'การตอบคำถามใน Vocab Village และประวัติ Vocab Drill แยกกัน',
    questIds: Object.freeze(['vocabulary']) }),
  Object.freeze({ id: 'reading', name: 'การอ่าน', english: 'Reading',
    scope: 'การตอบคำถามใน Reading Dungeon และ Reading Detective',
    questIds: Object.freeze(['reading', 'reading_detective']) }),
  Object.freeze({ id: 'grammar', name: 'การใช้ไวยากรณ์', english: 'Grammar',
    scope: 'สรรพนาม กาล คำนามและปริมาณ การเปรียบเทียบ และบุพบทในแบบฝึกที่เกี่ยวข้อง',
    questIds: Object.freeze(['pronouns_master', 'tenses_arena', 'nouns_quantifiers', 'adjectives_comp', 'prepositions_hub']) }),
]);
