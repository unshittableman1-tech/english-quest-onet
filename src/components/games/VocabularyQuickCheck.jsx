import { useRef, useState } from 'react';
import { vocabularyWord } from '../../utils/vocabWordEvidence';
import { useSpeech } from '../../utils/useSpeech';
import { Volume2, Square } from 'lucide-react';

const shuffled = items => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
};
export default function VocabularyQuickCheck({ cards, title, onBack, onEvidence, onComplete, distractorCards = cards, embedded = false }) {
  const Container = embedded ? 'section' : 'main';
  const { speak, stop, speaking, supported } = useSpeech();
  const [questions] = useState(() => shuffled(cards).map(card => {
    const meanings = new Map(distractorCards.filter(other => other.id !== card.id && other.backThai !== card.backThai).map(other => [other.backThai, other]));
    return { card, options: shuffled([card, ...shuffled([...meanings.values()]).slice(0, 3)]) };
  }));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [assistedCount, setAssistedCount] = useState(0);
  const [assistedCorrectCount, setAssistedCorrectCount] = useState(0);
  const [usedAudio, setUsedAudio] = useState(false);
  const audioUsed = useRef(false);
  const locked = useRef(false);
  const current = questions[index];
  if (!current) return <Container className="vocab-quick-check"><h1>ตรวจคำศัพท์ครบแล้ว</h1><p>ตอบถูก {correctCount}/{questions.length} คำ</p><p>ตอบถูกโดยไม่ใช้เสียงช่วย {correctCount - assistedCorrectCount}/{questions.length - assistedCount} คำ · ตอบถูกโดยใช้เสียงช่วย {assistedCorrectCount}/{assistedCount} คำ</p><p>ผลนี้เป็นการจำความหมายในแบบฝึก ยังไม่ใช่การยืนยันว่าใช้คำศัพท์ในประโยคใหม่ได้</p><button className="btn-primary" onClick={onComplete || onBack}>{onComplete ? 'บันทึกผลกิจกรรม' : 'กลับไปดูคำที่ควรฝึก'}</button></Container>;
  const listen = () => {
    if (speaking) { stop(); return; }
    if (!locked.current) {
      audioUsed.current = true;
      setUsedAudio(true);
    }
    speak(vocabularyWord(current.card), { lang: 'en-US' });
  };
  const choose = option => {
    if (locked.current) return;
    locked.current = true;
    const correct = option.id === current.card.id;
    setSelected(option.id);
    if (correct) setCorrectCount(previous => previous + 1);
    if (audioUsed.current) {
      setAssistedCount(previous => previous + 1);
      if (correct) setAssistedCorrectCount(previous => previous + 1);
    }
    stop();
    onEvidence?.({ card: current.card, selectedCardId: option.id, mode: 'quick_check', correct, assisted: audioUsed.current, observationId: String(index) });
  };
  return <Container className="vocab-quick-check">
    <button onClick={() => { stop(); onBack(); }}>← กลับ</button>
    <h1>{title}</h1>
    <p>ตรวจคำศัพท์ {index + 1}/{questions.length} · เลือกความหมาย</p>
    <div className="vocab-check-prompt">
      <h2 lang="en">{vocabularyWord(current.card)}</h2>
      <button type="button" className="vocab-check-audio" disabled={!supported} aria-label={speaking ? 'หยุดเสียงคำศัพท์' : 'ฟังเสียงคำศัพท์'} aria-pressed={speaking} onClick={listen}>
        {speaking ? <Square size={20} aria-hidden="true" /> : <Volume2 size={22} aria-hidden="true" />}
        {speaking ? 'หยุดเสียง' : 'ฟังเสียง'}
      </button>
    </div>
    <p className="vocab-evidence-note" aria-live="polite">{!supported ? 'เบราว์เซอร์นี้ไม่รองรับเสียงอ่าน ยังเลือกคำตอบได้ตามปกติ' : usedAudio ? 'ข้อนี้ใช้เสียงช่วย · บันทึกแยกจากการตอบโดยไม่ใช้ตัวช่วย' : 'กดฟังซ้ำได้ · อ่านเฉพาะคำศัพท์ ไม่อ่านคำแปลหรือช้อยส์'}</p>
    <div className="vocab-check-options">{current.options.map(option => <button key={option.id} className={selected === option.id ? 'is-selected' : ''} disabled={selected !== null} onClick={() => choose(option)}>{option.backThai}</button>)}</div>
    {selected !== null && <><p role="status">{selected === current.card.id ? 'ถูกต้อง' : `ลองจำอีกครั้ง: ${current.card.backThai}`}</p><button className="btn-primary" onClick={() => { stop(); locked.current = false; audioUsed.current = false; setUsedAudio(false); setSelected(null); setIndex(previous => previous + 1); }}>{index + 1 === questions.length ? 'ดูผล' : 'คำต่อไป'}</button></>}
  </Container>;
}
