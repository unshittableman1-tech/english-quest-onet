const source = {
  file: 'pdf_blueprints/SET1/1.2 ครอบครัว.pdf',
  sha256: '580df49430f886017ebd417508978c0ee60c49391405a0ae13839225c62733f6',
  answerPage: 7,
  relationship: 'adapted_practice_not_literal_image_copy',
};

const patches = {
  'pdf_1.2_ครอบครัว_1': {
    question: 'Which word matches the picture?',
    image: '/assessment/family/f01-v1.png',
    imageAlt: 'ผู้ใหญ่สองคนกับเด็กสองคนยืนใกล้กัน ผู้ใหญ่วางมือบนไหล่เด็ก',
    source: { ...source, stimulusPage: 4, questionPage: 4, questionNumber: 1 },
    change: 'ใช้ภาพวาดใหม่แทนสัญลักษณ์ในใบงาน ปรับคำถามให้ถามจากภาพ คงตัวเลือกและเฉลย C. Family',
    correctFeedback: 'ภาพแสดงพ่อแม่กับลูก จึงตรงกับคำว่า Family ซึ่งหมายถึงครอบครัว',
  },
  'pdf_1.2_ครอบครัว_6': {
    question: 'Which word matches the picture?',
    image: '/assessment/family/f06-v1.png',
    imageAlt: 'อาคารพักอาศัยหลังเล็ก มีหลังคาสีแดง ประตู หน้าต่าง และบันไดหน้าทางเข้า',
    source: { ...source, stimulusPage: 5, questionPage: 5, questionNumber: 6 },
    change: 'ใช้ภาพวาดที่พักอาศัยใหม่แทนสัญลักษณ์บ้านในใบงาน คงตัวเลือกและเฉลย C. Home',
    correctFeedback: 'Home หมายถึงบ้านหรือที่อยู่อาศัย ภาพนี้เป็นบ้านพักอาศัย',
  },
  'pdf_1.2_ครอบครัว_9': {
    options: ['My grandmother', 'My sister', 'My aunt', 'My cousin'],
    source: { ...source, stimulusPage: 6, questionPage: 6, questionNumber: 9 },
    change: 'ต้นฉบับหน้า 6-7 ใช้ His aunt ซึ่งหมายถึงป้าของลูกพี่ลูกน้อง ปรับเป็น My aunt ให้หมายถึงแม่ของลูกพี่ลูกน้องตามข้อมูลในโจทย์',
    correctFeedback: 'My cousin is my aunt\'s son หมายถึงลูกพี่ลูกน้องเป็นลูกชายของป้าหรือน้าของฉัน ดังนั้นแม่ของเขาคือ My aunt ไม่ใช่ His aunt',
  },
};

export function restoreFamilyMedia(question) {
  const patch = patches[question.id];
  if (!patch) return question;
  const hasImage = Boolean(patch.image);
  return {
    ...question, ...patch,
    itemVersion: 'family-media-v2',
    wrongFeedback: patch.correctFeedback,
    reviewStatus: 'approved', approvedModes: ['practice_assessment'], intendedMode: 'practice_assessment',
    reviewNote: 'Owner approved family-media-v2 after Family preview; practice only, not SET7 or official exams.',
    contentReview: { status: 'approved_for_practice', reviewer: 'Codex', date: '2026-10-13', approvedBy: 'workspace_owner', approvedAt: '2026-10-13', approvalSource: 'explicit_user_chat_after_family_media_preview' },
    mediaRequired: hasImage,
    mediaReview: { status: hasImage ? 'verified' : 'not_required', version: 'family-media-v2', reviewer: 'workspace_owner', approvedAt: '2026-10-13', scope: 'practice_assessment' },
    sourceCheck: { status: 'compared', reviewer: 'Codex', date: '2026-10-13', method: 'Rendered source pages 4-7 + extracted text + pronoun consistency check', rightsStatus: 'pending_owner_confirmation' },
    ...(hasImage ? {
      mediaSource: { kind: 'generated_illustration', tool: 'built_in_image_gen', assetVersion: 'v1', promptManifest: 'md/Family Image Generation.json' },
      accessibilityReview: 'pending_equivalence_review',
    } : {}),
    legacySnapshot: { question: question.question, options: [...question.options], answer: question.answer, image: question.image || null, reviewStatus: question.reviewStatus || null },
  };
}
