import { useState } from 'react';
import { Bot, Lightbulb, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { requestMistakeExplanation } from '../utils/aiCompanionApi';

export default function AICompanionPanel({ questId, questionId, verificationPending = false }) {
  const [state, setState] = useState({ status: 'idle', payload: null, error: '' });
  const request = async () => {
    setState({ status: 'loading', payload: null, error: '' });
    try {
      const payload = await requestMistakeExplanation({ questId, questionId });
      setState({ status: 'done', payload, error: '' });
    } catch (error) {
      setState({ status: error.kind === 'pending' ? 'pending' : 'error', payload: null, error: error.message || 'เกิดข้อผิดพลาด' });
    }
  };
  const explanation = state.payload?.explanation;
  return <section className="ai-companion" aria-label="AI Learning Companion">
    <div className="ai-companion-heading"><span className="ai-companion-robot"><Bot size={22} /></span><div><h3>Explain My Mistake</h3><p>ผู้ช่วยเรียนรู้จะอธิบายหลังระบบยืนยันคำตอบแล้ว</p></div></div>
    {verificationPending && <p className="ai-companion-status" role="status">ทำภารกิจให้จบก่อน แล้วเปิดคำอธิบายเพิ่มเติมได้จากคลังข้อผิด</p>}
    {!verificationPending && state.status === 'idle' && <button type="button" className="ai-companion-button" onClick={request}><Sparkles size={17} />ให้โรบอทช่วยอธิบาย</button>}
    {state.status === 'loading' && <p className="ai-companion-status" role="status">โรบอทกำลังตรวจหลักฐานคำตอบ…</p>}
    {state.status === 'pending' && <p className="ai-companion-status" role="status"><AlertCircle size={16} />{state.error}</p>}
    {state.status === 'error' && <p className="ai-companion-error"><AlertCircle size={16} />{state.error}</p>}
    {explanation && <div className="ai-companion-answer">
      <span className={`ai-companion-mode ${state.payload.mode}`}>{state.payload.mode === 'ai' ? 'AI generated' : 'อ้างอิงคำตอบผิดครั้งแรก'}</span>
      <p><strong>จุดที่น่าจะสับสน</strong>{explanation.misconception}</p>
      <p><strong><Lightbulb size={15} /> คำใบ้</strong>{explanation.hint}</p>
      <p><strong><BookOpen size={15} /> หลักที่ควรรู้</strong>{explanation.concept}</p>
      <p><strong>ลองฝึกเพิ่ม</strong>{explanation.practiceExample}</p>
    </div>}
  </section>;
}
