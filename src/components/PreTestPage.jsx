import UIIcon, { UIIconText } from './UIIcon';
import { useState, useCallback } from 'react';
import { useApp } from '../App';
import { studentPretestQuestions } from '../data/pretestV2';
import QuestionStimulus from './QuestionStimulus';
import QuestionMediaGate from './QuestionMediaGate';
import useQuestionMedia from '../hooks/useQuestionMedia';
import { playClickSound, playLevelUpSound } from '../utils/audio';
import { readPendingPretest } from '../utils/pretestPersistence';
import '../styles/pretestPage.css';

const questions = studentPretestQuestions.map((item, index) => ({
  ...item,
  id: `pretest-v2-${index + 1}`,
  question: item.prompt,
  quest: item.standard,
  itemVersion: 'pretest-v2',
  mediaReview: { status: 'verified', reviewer: 'teacher', version: 'pretest-v2' },
}));

export default function PreTestPage() {
  const { completePreTest, navigate, handleLogout, student } = useApp();
  const [pending] = useState(() => {
    try { return readPendingPretest(student); } catch { return null; }
  });
  const [attemptId] = useState(() => pending?.attemptId || crypto.randomUUID());
  const [restored] = useState(() => {
    if (!pending || !Array.isArray(pending.answers) || pending.answers.length !== questions.length || pending.answers.some((answer, index) => answer.id !== questions[index].id || !Number.isInteger(answer.choice) || answer.choice < 0 || answer.choice > 3)) return null;
    return { categoryScores: {}, totalScore: null, responses: pending.answers };
  });
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [selected, setSelected]       = useState(null);
  const [answers, setAnswers]         = useState([]);
  const [showResult, setShowResult]   = useState(Boolean(restored));
  const [results, setResults]         = useState(restored);
  const [saveError, setSaveError] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── All hooks must be ABOVE any early returns ──────────────────
  const q = questions[currentIdx] || null;
  const { mediaStatus, onMediaFailure } = useQuestionMedia(questions);

  const handleSelect = useCallback((idx) => {
    playClickSound();
    setSelected(idx);
  }, []);

  const handleNext = useCallback(() => {
    if (!q) return;
    playClickSound();
    const newAnswers = [...answers, { q, selected }];
    setAnswers(newAnswers);

    if (currentIdx + 1 >= questions.length) {
      setResults({ categoryScores: {}, totalScore: null, responses: newAnswers.map(a => ({ id: a.q.id, choice: a.selected })) });
      setShowResult(true);
      playLevelUpSound();
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    }
  }, [selected, q, answers, currentIdx]);

  const handleContinue = useCallback(async () => {
    if (!results || saving) return;
    playClickSound();
    setSaving(true);
    setSaveError(null);
    try {
      await completePreTest(results.categoryScores, results.totalScore, { attemptId, answers: results.responses });
    } catch (error) {
      setSaveError('ยังยืนยันการบันทึกกับเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบการเชื่อมต่อและพื้นที่จัดเก็บ แล้วลองอีกครั้งโดยไม่ออกจากหน้านี้');
      setSaving(false);
    }
  }, [results, saving, completePreTest, attemptId]);

  // ── Early returns AFTER all hooks ─────────────────────────────
  if (questions.length && mediaStatus !== 'ready') return <QuestionMediaGate status={mediaStatus} onBack={() => navigate('landing')} />;
  if (showResult && results) {
    const hasScore = typeof results.totalScore === 'number';
    const pct = hasScore ? Math.round((results.totalScore / questions.length) * 100) : null;
    return (
      <div className="pretest-page pretest-result-page">
        <div className="pretest-result">
          <div className="pretest-result-icon"><UIIcon value={"📊"} /></div>
          <p className="pretest-overline">ทำครบแล้ว เก่งมาก!</p>
          <h2>ผลการทดสอบก่อนเรียน</h2>
          <p className="pretest-muted">Pre-test · {questions.length} ข้อ</p>
          {hasScore ? (
            <div className="pretest-result-score">
              <span className="pretest-result-number">{results.totalScore}<small> / {questions.length}</small></span>
              <span>{pct}% คะแนนรวมเบื้องต้น</span>
              <div className="pretest-meter"><span style={{ width: `${pct}%` }} /></div>
            </div>
          ) : (
            <div className="pretest-result-score">
              <span className="pretest-result-number">{questions.length}<small> / {questions.length}</small></span>
              <span>ตอบครบแล้วทั้ง {questions.length} ข้อ</span>
              <div className="pretest-meter"><span style={{ width: '100%' }} /></div>
            </div>
          )}
          <p className="pretest-save-note">กดปุ่มด้านล่างเพื่อส่งตรวจและบันทึกคะแนนกับเซิร์ฟเวอร์ก่อนเริ่มผจญภัย</p>
          {saveError && <p role="alert" className="pretest-error">{saveError}</p>}
          <button className="pretest-next" onClick={handleContinue} disabled={saving}>
            <UIIcon value={"🗺️"} /> {saving ? 'กำลังบันทึกและตรวจผล...' : 'ไป Quest Map!'}
          </button>
        </div>
      </div>
    );
  }

  // ── Main quiz UI ───────────────────────────────────────────────
  const progress = Math.round((currentIdx / questions.length) * 100);

  return (
    <div className="pretest-page">
      <main className="pretest-shell">
        <header className="pretest-header">
          <div className="pretest-header-top"><div className="pretest-heading"><span className="pretest-header-icon"><UIIcon value={"📝"} /></span><div><p className="pretest-overline">ก่อนเริ่มการผจญภัย</p><h1>Pre-test อิง Blueprint</h1></div></div><button type="button" onClick={handleLogout} className="pretest-logout">ออกจากระบบ</button></div>
          <div className="pretest-progress-label"><span>ความคืบหน้า</span><strong>ข้อ {currentIdx + 1} <span>จาก {questions.length}</span></strong></div>
          <div className="pretest-meter" role="progressbar" aria-label="ความคืบหน้าการสอบ" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={currentIdx}><span style={{ width: `${progress}%` }} /></div>
        </header>
        <div className="pretest-question">
          <div className="pretest-question-label"><span>คำถามที่ {currentIdx + 1}</span><span>เลือกคำตอบที่เหมาะสมที่สุด</span></div>
          <QuestionStimulus question={q} onFailure={onMediaFailure} />
          <p className="pretest-question-text">{q.question}</p>
        </div>
        <div className={q.options.some(option => typeof option !== 'string') ? 'pretest-options pretest-options-images' : 'pretest-options'}>
          {q.options.map((opt, i) => {
            let cls = 'option-btn pretest-option';
            if (i === selected) cls += ' is-selected';
            return (
              <button
                key={i}
                type="button"
                className={cls}
                onClick={() => handleSelect(i)}
                aria-pressed={i === selected}
              >
                <span className="pretest-option-letter">{String.fromCharCode(65 + i)}</span>
                {typeof opt === 'string' ? <span>{opt}</span> : <img src={opt.image} alt={opt.alt} className="block w-full rounded-lg" onError={onMediaFailure} />}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <button
            className="pretest-next"
            onClick={handleNext}
          >
            <UIIconText value={currentIdx + 1 >= questions.length ? '📊 ดูผลการทดสอบ' : 'ข้อต่อไป →'} />
          </button>
        )}

      </main>
    </div>
  );
}
