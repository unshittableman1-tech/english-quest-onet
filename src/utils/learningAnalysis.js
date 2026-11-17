export function validQuestPercent(value) {
  if (typeof value !== 'number' && !(typeof value === 'string' && value.trim())) return null;
  const score = Number(value);
  return Number.isFinite(score) && score >= 0 && score <= 100 ? score : null;
}

export function summarizeQuestScores(students) {
  const groups = new Map();
  for (const student of students) {
    for (const [id, result] of Object.entries(student.questProgress || {})) {
      if (id === 'finalboss' || id === 'strategy_boss') continue;
      const score = validQuestPercent(result?.pct);
      if (score === null) continue;
      const group = groups.get(id) || { total: 0, count: 0, belowThreshold: 0 };
      group.total += score; group.count++;
      if (score < 70) group.belowThreshold++;
      groups.set(id, group);
    }
  }
  return Array.from(groups, ([id, group]) => ({ id, avg: Math.round(group.total / group.count), count: group.count, belowThreshold: group.belowThreshold }))
    .sort((a,b) => a.avg - b.avg || a.id.localeCompare(b.id));
}

export const REMEDIAL_PATHWAYS = Object.freeze({
  'ต 1.1': {
    focus: 'การตีความป้าย สัญลักษณ์ และข้อความสั้น',
    recommendedQuests: ['ch1_signs_rules', 'ch1_classroom'],
    recommendedVocab: 'ถอดรหัสข้อสอบ O-NET → คำสั่งข้อสอบ & ประโยคคำถามในข้อสอบ O-NET',
  },
  'ต 1.2': {
    focus: 'บทสนทนาประจำวัน การขออนุญาต และสำนวนตอบรับสุภาพ',
    recommendedQuests: ['ch2_dialogue', 'c3_question_words_assessment_v1'],
    recommendedVocab: 'การสื่อสาร → Greeting & Everyday English',
  },
  'ต 1.3': {
    focus: 'การอ่านตารางเวลา แผนภูมิแท่ง แผนภูมิวงกลม และลำดับเหตุการณ์',
    recommendedQuests: ['c3_graph_comparison', 'c3_ordering_words_v1'],
    recommendedVocab: 'คำศัพท์ใกล้ตัว → ตัวเลขและลำดับที่',
  },
  'ต 2.1': {
    focus: 'เทศกาล ประเพณี และวัฒนธรรมของเจ้าของภาษา',
    recommendedQuests: ['culture_master'],
    recommendedVocab: 'วัฒนธรรมและประเพณี (Culture & Festivals)',
  },
  'ต 2.2': {
    focus: 'ความต่างของโครงสร้างภาษา (ลำดับคำคุณศัพท์, เครื่องหมายวรรคตอน) และมารยาททางวัฒนธรรม',
    recommendedQuests: ['tenses_arena'],
    recommendedVocab: 'คู่คำตัดสินสอบ (Decisive Pairs)',
  },
  'ต 4.1': {
    focus: 'การสื่อสารในสถานการณ์จริงในโรงเรียน ห้องพยาบาล และห้องทดลอง',
    recommendedQuests: ['ch1_classroom', 'c3_labeling_classroom_v1'],
    recommendedVocab: 'คำสั่งข้อสอบ (Exam Commands)',
  },
});

export function getTeacherVerifiedIndicators(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem('eq_teacher_indicator_reviews_v1');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Object.entries(parsed).map(([id, info]) => ({
      id,
      standard: info.standard,
      indicator: info.indicator,
      verifiedAt: info.verifiedAt,
      status: info.status,
      remedial: REMEDIAL_PATHWAYS[info.standard] || null,
    }));
  } catch {
    return [];
  }
}

