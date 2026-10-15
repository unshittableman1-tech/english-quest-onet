export default function QuestionMediaGate({ status, onBack }) {
  return <main className="question-media-gate" role={status === 'error' ? 'alert' : 'status'}>
    <h2>{status === 'error' ? 'ยังไม่สามารถเริ่มชุดนี้ได้' : 'กำลังตรวจสื่อประกอบข้อสอบ'}</h2>
    {status === 'error' && <p>สื่อประกอบบางข้อยังไม่ผ่านการตรวจ ไม่ครบ หรือโหลดไม่ได้ ระบบหยุดชุดนี้และจะไม่ส่งผลสอบจากชุดที่หยุด</p>}
    <button type="button" onClick={onBack}>กลับ</button>
  </main>;
}
