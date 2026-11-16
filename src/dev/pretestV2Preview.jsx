import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { pretestV2Questions } from '../data/pretestV2';
import './pretestV2Preview.css';

function PretestV2Preview() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => Array(pretestV2Questions.length).fill(null));
  const [finished, setFinished] = useState(false);
  const question = pretestV2Questions[currentIndex];
  const score = answers.filter((answer, index) => answer === pretestV2Questions[index].answer).length;

  const selectAnswer = answer => {
    setAnswers(previous => previous.map((value, index) => index === currentIndex ? answer : value));
  };

  const restart = () => {
    setCurrentIndex(0);
    setAnswers(Array(pretestV2Questions.length).fill(null));
    setFinished(false);
  };

  return <main className="pretest-v2-shell">
    <header className="pretest-v2-header">
      <div>
        <span className="pretest-v2-eyebrow">English Quest AI · Local Staging</span>
        <h1>Pre-test v2 — อิง Blueprint</h1>
        <p>หน้าทดลองแยกจากแอปนักเรียน · ไม่มีการบันทึกคะแนน, XP หรือข้อมูลนักเรียน</p>
      </div>
      <a href="/">กลับหน้าแอป</a>
    </header>

    {finished ? <section className="pretest-v2-card pretest-v2-result" aria-live="polite">
      <h2>จบการทดลองทำข้อสอบ</h2>
      <p>คะแนนในหน้านี้เท่านั้น: <strong>{score}/{pretestV2Questions.length}</strong></p>
      <p>ผลนี้ไม่ได้บันทึกและไม่เปลี่ยนผล Pre-test เดิม</p>
      <button type="button" onClick={restart}>ทดลองใหม่</button>
    </section> : <>
      <div className="pretest-v2-progress" aria-label={`ข้อ ${currentIndex + 1} จาก ${pretestV2Questions.length}`}>
        <span>ข้อ {currentIndex + 1} จาก {pretestV2Questions.length}</span>
        <progress value={currentIndex} max={pretestV2Questions.length} />
      </div>
      <section className="pretest-v2-card">
        <span className="pretest-v2-standard">{question.standard}</span>
        {question.passage && <blockquote>{question.passage}</blockquote>}
        <h2>{question.prompt}</h2>
        {question.image && <img className="pretest-v2-stimulus" src={question.image} alt={question.imageAlt} />}
        <fieldset>
          <legend>เลือกคำตอบที่เหมาะสมที่สุดหนึ่งข้อ</legend>
          <div className={typeof question.options[0] === 'string' ? 'pretest-v2-options' : 'pretest-v2-map-options'}>
            {question.options.map((option, index) => <label key={index} className={answers[currentIndex] === index ? 'pretest-v2-option selected' : 'pretest-v2-option'}>
              <input type="radio" name={`question-${currentIndex}`} checked={answers[currentIndex] === index} onChange={() => selectAnswer(index)} />
              <span className="pretest-v2-letter">{String.fromCharCode(65 + index)}.</span>
              {typeof option === 'string' ? <span>{option}</span> : <img src={option.image} alt={option.alt} />}
            </label>)}
          </div>
        </fieldset>
        <div className="pretest-v2-actions">
          <button type="button" className="secondary" onClick={() => setCurrentIndex(index => index - 1)} disabled={currentIndex === 0}>ข้อก่อนหน้า</button>
          <button type="button" disabled={answers[currentIndex] === null} onClick={() => currentIndex + 1 === pretestV2Questions.length ? setFinished(true) : setCurrentIndex(index => index + 1)}>
            {currentIndex + 1 === pretestV2Questions.length ? 'ดูผลทดลอง' : 'ข้อต่อไป'}
          </button>
        </div>
      </section>
    </>}
  </main>;
}

createRoot(document.getElementById('pretest-v2-preview-root')).render(<PretestV2Preview />);
