import { useState } from 'react';
import { socialChallengeV3 } from '../data/socialChallengeV3';
import QuestionStimulus from './QuestionStimulus';
import '../styles/bossExam.css';

export default function SocialChallengeDemo({ onBack }) {
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const question = socialChallengeV3[answers.length];
  const finished = answers.length === socialChallengeV3.length;
  const score = socialChallengeV3.filter((item, index) => answers[index] === item.answer).length;
  const names = { conversation: 'Conversation Café', conversation_rescue: 'Conversation Rescue', emotions_feelings: 'Emotions & Feelings', jobs: 'Career World', market: 'Market Quest' };
  if (finished) return <main className="quiz-content"><section className="boss-question-card">
    <h1>Social Challenge · ผลทดลอง</h1><h2>{score}/20 · {score >= 14 ? 'ผ่าน' : 'ฝึกเพิ่มอีกนิด'}</h2><p>โหมด Demo ไม่บันทึก XP หรือผลนักเรียนจริง</p>
    {Object.entries(names).map(([id, name]) => { const items = socialChallengeV3.map((item, index) => ({ ...item, index })).filter(item => item.sourceQuest === id); return <p key={id}>{name}: {items.filter(item => answers[item.index] === item.answer).length}/{items.length}</p>; })}
    {socialChallengeV3.map((item, index) => <article key={item.id} style={{ marginBlock: 20 }}><strong>ข้อ {index + 1} · {answers[index] === item.answer ? 'ถูก' : 'ผิด'}</strong><p style={{ whiteSpace: 'pre-line' }}>{item.question}</p><p>คำตอบของคุณ: {item.options[answers[index]]}</p><p>เฉลย: {item.options[item.answer]} · {item.explanation}</p></article>)}
    <button className="btn-primary" onClick={onBack}>กลับ Quest Map</button>
  </section></main>;
  return <div className="quiz-workspace boss-exam-page"><header className="quiz-hud"><div className="quiz-hud-inner"><button onClick={onBack}>← กลับ</button><h1>Social Challenge · Demo</h1><p>ข้อ {answers.length + 1}/20 · ผ่าน 14 ข้อ</p></div></header>
    <main className="quiz-content"><section className="boss-question-card"><h2>เลือกคำตอบที่เหมาะสมที่สุด</h2><QuestionStimulus question={question} /><div className="boss-dialogue" lang="en">{question.question.split('\n').map((line, index) => <p key={index}>{line}</p>)}</div>
      <div className="boss-answer-list">{question.options.map((option, index) => <button key={option} className={`answer-option ${selected === index ? 'selected' : ''}`} aria-pressed={selected === index} onClick={() => setSelected(index)}><span className="answer-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span></button>)}</div>
      <button className="btn-primary boss-confirm" disabled={selected === null} onClick={() => { setAnswers(previous => [...previous, selected]); setSelected(null); }}>{answers.length === 19 ? 'ส่งคำตอบและดูผล' : 'ยืนยันคำตอบ'}</button><p>แสดงเฉลยหลังตอบครบ 20 ข้อ</p>
    </section></main></div>;
}
