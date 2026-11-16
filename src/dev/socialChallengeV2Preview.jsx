import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { socialChallengeV3 as questions } from '../data/socialChallengeV3';
import QuestionStimulus from '../components/QuestionStimulus';
import './pretestV2Preview.css';

function Preview() {
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const score = questions.filter(question => answers[question.id] === question.answer).length;
  return <main className="pretest-v2-shell">
    <header><h1>Social Challenge — Conversation V3</h1><p>20 ข้อ · 5 Quest · ผ่าน 14/20 · ชุดทดลอง ไม่มีการบันทึกคะแนนหรือ XP</p></header>
    <form onSubmit={event => { event.preventDefault(); setFinished(true); }}>
      {questions.map((question, index) => <section className="pretest-v2-card" key={question.id} style={{ background: 'white', padding: 24, marginBlock: 20, borderRadius: 20 }}>
        <p>{index + 1}/20 · {question.sourceQuest} · {question.indicator}</p>
        <h2 style={{ whiteSpace: 'pre-line', fontSize: 18 }}>{question.question}</h2>
        <QuestionStimulus question={question} />
        {question.options.map((option, optionIndex) => <label key={option} style={{ display: 'block', padding: 12 }}><input type="radio" required name={question.id} checked={answers[question.id] === optionIndex} disabled={finished} onChange={() => setAnswers(previous => ({ ...previous, [question.id]: optionIndex }))}/> {String.fromCharCode(65 + optionIndex)}. {option}</label>)}
        {finished && <p role="status">{answers[question.id] === question.answer ? 'ถูก' : 'ผิด'} · เฉลย {String.fromCharCode(65 + question.answer)} — {question.explanation}</p>}
      </section>)}
      {finished ? <><h2 role="status">คะแนน {score}/20 ({score * 5}%)</h2><button type="button" onClick={() => { setAnswers({}); setFinished(false); }}>ลองอีกครั้ง</button></> : <button type="submit">ส่งคำตอบทั้ง 20 ข้อ</button>}
    </form>
  </main>;
}

createRoot(document.getElementById('root')).render(<Preview />);
