// The credit pilot is compiled on only by scripts/preview-vocabulary-credits.mjs.
// Never adapt the synthetic session endpoint into production authentication.
export function vocabularyCreditsPilotEnabled(student) {
  return import.meta.env.DEV && import.meta.env.VITE_VOCAB_CREDITS_PILOT === 'true'
    && globalThis.location?.hostname === '127.0.0.1' && student?.isDemo === true;
}
const API = '/__vocabulary-credits/v2';
export const CREDIT_ERROR_MESSAGES = {
  unauthorized: 'เซสชันทดลองหมดอายุ กรุณาเปิดบัญชีสมมติอีกครั้ง',
  incomplete_set: 'ชุดนี้ยังมีคำศัพท์ไม่ครบ จึงยังเปิดรับแต้มไม่ได้',
  previous_step_required: 'ทำขั้นก่อนหน้าให้ครบ แล้วกลับมาฝึกขั้นนี้ได้เลย',
  activity_not_complete: 'กิจกรรมยังไม่ครบทุกคำ จึงยังบันทึกว่าผ่านไม่ได้',
  meaning_unavailable: 'คำนี้ยังไม่มีคำแปลที่พร้อมใช้ในบทนี้ จึงไม่หักแต้ม',
  content_changed: 'ชุดคำศัพท์มีการปรับปรุง กรุณาเปิดกิจกรรมใหม่',
  insufficient_credits: 'แต้มไม่พอ เปิดเรียนคำนี้ฟรีในส่วนฝึกศัพท์ได้',
  translation_disabled: 'ครูปิดคำแปลใน Quest นี้ ยังกลับไปเรียนคำศัพท์ฟรีได้',
  assessment_no_translation: 'กิจกรรมนี้ให้ทำด้วยตนเอง ไม่สามารถใช้แต้มแลกคำแปลได้',
  quote_changed: 'สิทธิ์หรือราคาเปลี่ยนแล้ว กรุณากดคำศัพท์เพื่อตรวจอีกครั้ง',
  policy_changed: 'มีการเปลี่ยนสิทธิ์แล้ว กรุณารีเฟรชก่อนบันทึกอีกครั้ง',
  first_response_locked: 'บันทึกคำตอบแรกแล้ว ไม่สามารถเปลี่ยนคำตอบเดิมได้',
  forbidden: 'คุณไม่มีสิทธิ์จัดการนักเรียนคนนี้',
};
export function createVocabularyCreditsClient(fixture) {
  let token = null;
  const key = `eqai-credit-pilot-v2:${fixture}`;
  try { token = sessionStorage.getItem(key); } catch { /* Storage may be disabled. */ }
  async function call(operation, body = {}) {
    let response;
    try {
      response = await fetch(`${API}/${operation}`, { method: 'POST', cache: 'no-store', credentials: 'omit',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
    } catch { throw new Error('เชื่อมต่อไม่ได้ ยังไม่ยืนยันการบันทึก กรุณาลองอีกครั้ง'); }
    let data; try { data = await response.json(); } catch { throw new Error('ยังเชื่อมต่อระบบแต้มทดลองไม่ได้'); }
    if (!response.ok) {
      const error = new Error(CREDIT_ERROR_MESSAGES[data.error] || 'ดำเนินการไม่สำเร็จ กรุณาลองอีกครั้ง');
      error.code = data.error; throw error;
    }
    if (['finish', 'reveal', 'policy'].includes(operation)) window.dispatchEvent(new CustomEvent('vocabulary-credits-updated', { detail: { fixture } }));
    return data;
  }
  return {
    call,
    async connect() {
      if (token) {
        try { await call(fixture.startsWith('teacher_') ? 'roster' : 'state'); return; }
        catch (error) { if (error.code !== 'unauthorized') throw error; }
      }
      const session = await call('session', { fixture });
      token = session.token;
      try { sessionStorage.setItem(key, token); } catch { /* In-memory session still works. */ }
    },
  };
}
export function currentCreditStudentFixture() {
  try { const value = sessionStorage.getItem('eqai-credit-student-fixture-v2'); return ['student_a', 'student_b', 'student_c'].includes(value) ? value : 'student_a'; }
  catch { return 'student_a'; }
}
