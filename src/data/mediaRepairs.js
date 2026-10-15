const tableSource = {
  file: 'pdf_blueprints/SET7/7.4 ตาราง.pdf',
  sha256: '41dd7a41e67fbac25ba5a88796a7065c0e6cb56c9ff7a770e8f1112e50595fc2',
  stimulusPage: 5, answerPage: 7,
};
const chartSource = {
  file: 'pdf_blueprints/SET7/7.3 แผนภูมิ.pdf',
  sha256: '00bf1ac023811100950a8d13f62cfafc5b6aa017bff5f14d898f7da17b0f245a',
  answerPage: 7,
};

export const scoreTable = {
  id: 'set7-average-scores', version: 'source-v1', type: 'table',
  title: 'Average Scores (2562-2564)',
  columns: ['Year (B.E.)', 'Mathematics average', 'English average'],
  rows: [['2562', 27.5, 28.8], ['2563', 27.8, 38.5], ['2564', 34.5, 33.1]],
};

const patches = {
  pdf_set7_15: {
    question: 'Which statement is correct about the bar chart?',
    stimuli: [{ id: 'set7-color-sales', version: 'source-v1', type: 'chart', chartType: 'bar', title: 'Sales Volume by Color Category', xLabel: 'Product color', yLabel: 'Units sold', maximum: 140, step: 20,
      points: [{ label: 'Blue', value: 100, color: '#2458dc' }, { label: 'Red', value: 80, color: '#dc3131' }, { label: 'Green', value: 120, color: '#188044' }] }],
    source: { ...chartSource, stimulusPage: 4, questionPage: 4, questionNumber: 1 },
    change: 'Restore source order and values; clarify stem, no change to keyed option D.',
    explanation: 'Blue ขายได้ 100 หน่วย น้อยกว่า Green ซึ่งขายได้ 120 หน่วย ส่วน Red ขายได้ 80 หน่วย',
  },
  pdf_set7_16: {
    stimuli: [{ id: 'set7-sales-trend', version: 'source-v1', type: 'chart', chartType: 'line', title: 'Sales Trend (2020-2022)', xLabel: 'Year', yLabel: 'Units sold', maximum: 70, step: 10,
      points: [{ label: '2020', value: 50 }, { label: '2021', value: 60 }, { label: '2022', value: 55 }] }],
    options: ['The value in 2021 is the highest among the three years.', 'The value in 2022 is higher than in 2021.', 'The value in 2020 is higher than in 2022.', 'The value in 2020 is the highest.'],
    source: { ...chartSource, stimulusPage: 4, questionPage: 4, questionNumber: 2 },
    change: 'Adapted distractor D: original A and D are both true (60 is highest; 50 is lowest). D now says highest, leaving only A true.',
    explanation: 'ปี 2021 มีค่า 60 หน่วย สูงกว่า 50 ในปี 2020 และ 55 ในปี 2022 จึงมีคำตอบถูกเพียงข้อ A ในเวอร์ชันปรับตัวลวงนี้',
  },
  pdf_set7_17: {
    stimuli: [{ id: 'set7-daily-timeline', version: 'source-v1', type: 'sequence', title: 'Daily Timeline', steps: ['Morning', 'Class', 'Lunch', 'After school', 'Home'] }],
    source: { ...chartSource, stimulusPage: 5, questionPage: 5, questionNumber: 3 },
    change: 'Restore missing sequence stimulus from source; no invented times.',
    explanation: 'ลำดับในผังคือ Morning → Class → Lunch → After school → Home ตัวเลือก B ตรงกับลำดับนี้',
  },
  pdf_set7_18: {
    stimuli: [{ id: 'set7-english-scores', version: 'source-v1', type: 'chart', chartType: 'bar', title: 'Average English Scores (2562-2564)', xLabel: 'Year (B.E.)', yLabel: 'Average score', maximum: 40, step: 10, precision: 1,
      points: [{ label: '2562', value: 28.8 }, { label: '2563', value: 38.5 }, { label: '2564', value: 33.1 }] }],
    source: { ...chartSource, stimulusPage: 5, questionPage: 5, questionNumber: 4 },
    change: 'Replace incorrect relative bar heights with source values and axis units.',
    explanation: 'คะแนนเพิ่มจาก 28.8 เป็น 38.5 แล้วลดเป็น 33.1 จึงสูงสุดในปี 2563 ก่อนลดลงในปี 2564',
  },
  pdf_set7_19: {
    stimuli: [{ id: 'set7-population', version: 'source-v1', type: 'chart', chartType: 'bar', title: 'Population (2566-2568)', xLabel: 'Year (B.E.)', yLabel: 'Population (millions)', maximum: 70, step: 10, precision: 2,
      points: [{ label: '2566', value: 66.30 }, { label: '2567', value: 66.05 }, { label: '2568', value: 65.93 }] }],
    source: { ...chartSource, stimulusPage: 6, questionPage: 6, questionNumber: 5 },
    change: 'Restore labeled source values; these are worksheet values, not verified current demographic statistics.',
    explanation: 'ข้อมูลในใบงานลดลงจาก 66.30 เป็น 66.05 และ 65.93 ล้านคนตามลำดับ จึงลดลงทุกปีที่แสดง',
  },
};

const tableExplanations = [
  'คะแนนภาษาอังกฤษเพิ่มจาก 28.8 ในปี 2562 เป็น 38.5 ในปี 2563 ก่อนลดเป็น 33.1 ในปี 2564',
  'เปรียบเทียบขนาดการเปลี่ยนแปลง: คณิตศาสตร์เพิ่ม 34.5 - 27.8 = 6.7 ส่วนภาษาอังกฤษลด 38.5 - 33.1 = 5.4 จึงเป็นคณิตศาสตร์',
  'ผลต่างคะแนนเฉลี่ยคณิตศาสตร์คือ 34.5 - 27.5 = 7.0',
  'คณิตศาสตร์เพิ่มเล็กน้อยจาก 27.5 เป็น 27.8 แล้วเพิ่มเป็น 34.5 ในปี 2564 จึงตรงกับตัวเลือก C',
  'ตารางให้ค่าเฉลี่ยภาษาอังกฤษปี 2563 เท่ากับ 38.5 แต่ไม่ได้ให้จำนวนนักเรียน ผู้ได้คะแนนสูงสุด หรืออันดับโรงเรียน',
];
for (let index = 0; index < 5; index++) {
  patches[`pdf_set7_${20 + index}`] = {
    stimuli: [scoreTable], source: { ...tableSource, questionPage: index === 4 ? 6 : 5, questionNumber: index + 1 },
    change: 'Replace invented SVG table values with structured source data; keep source answer key.',
    explanation: tableExplanations[index],
  };
}

export function restoreSourceMedia(question) {
  const patch = patches[question.id];
  if (!patch) return question;
  const { image, passage, ...original } = question;
  return {
    ...original, ...patch,
    itemVersion: 'media-repair-v2', mediaRequired: true,
    options: (patch.options || question.options).map(text => text.replace(/^[A-D]\.\s*/, '')),
    sourcePage: patch.source.questionPage,
    correctFeedback: patch.explanation, wrongFeedback: patch.explanation,
    reviewStatus: 'pending_teacher',
    mediaReview: { status: 'pending_teacher', version: 'media-repair-v2', reviewer: null },
    sourceCheck: { status: 'compared', reviewer: 'Codex', date: '2026-10-13', method: 'Rendered source pages + extracted text + numeric answer checks', rightsStatus: 'pending_owner_confirmation' },
  };
}
