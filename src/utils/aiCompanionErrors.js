const AI_COMPANION_ERRORS = {
  verified_attempt_required: {
    kind: 'pending',
    message: 'คำอธิบายเพิ่มเติมจะเปิดหลังจบภารกิจ เมื่อระบบบันทึกคำตอบครั้งแรกเรียบร้อยแล้ว',
  },
  unauthorized: { kind: 'error', message: 'กรุณาเข้าสู่ระบบนักเรียนอีกครั้ง' },
  forbidden: { kind: 'error', message: 'บัญชีนี้ไม่มีสิทธิ์ขอคำอธิบายสำหรับข้อนี้' },
  question_not_found: { kind: 'error', message: 'ยังไม่มีคำอธิบายเพิ่มเติมสำหรับข้อนี้' },
  not_a_mistake: { kind: 'error', message: 'ระบบไม่พบคำตอบผิดที่ยืนยันแล้วสำหรับข้อนี้' },
  rate_limited: { kind: 'error', message: 'ใช้ผู้ช่วยครบจำนวนครั้งชั่วคราวแล้ว กรุณาลองใหม่ภายหลัง' },
  service_unavailable: { kind: 'error', message: 'ผู้ช่วยเรียนรู้ยังไม่พร้อมใช้งาน กรุณาใช้คำอธิบายจากบทเรียนด้านบน' },
};

export function getAICompanionIssue(code) {
  return AI_COMPANION_ERRORS[code] || {
    kind: 'error',
    message: 'ไม่สามารถขอคำอธิบายเพิ่มเติมได้ในขณะนี้',
  };
}
