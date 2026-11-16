import { getItemLearningFeedback } from '../utils/itemLearningLinks';

export default function LinkedLearningFeedback({ question, learningMode, questId }) {
  const content = getItemLearningFeedback(question, {
    mode: learningMode, phase: 'after_answer', questId,
  });
  if (!content) return null;
  return <section className="feedback-explanation" aria-label="เชื่อมคำศัพท์กับการอ่านโจทย์">
    <h3>โจทย์ถามอะไร และใช้หลักฐานตรงไหน</h3>
    <p><strong>โจทย์ถาม:</strong> {content.questionMeaningTh}</p>
    <p><strong>วิธีอ่านคำถาม:</strong> {content.patternTh}</p>
    <p>{content.explanationTh}</p>
    <ul>{content.evidence.map((e,index)=><li key={index}>
      <q lang="en">{e.quote}</q> — {e.explanationTh}
    </li>)}</ul>
    <h3>คำศัพท์ที่เกี่ยวข้อง</h3>
    <ul>{content.vocabulary.map(v=><li key={v.catalogId}><span lang="en">{v.word}</span> = {v.meaningTh}</li>)}</ul>
    <h3>เหตุผลของแต่ละตัวเลือก</h3>
    <ul>{content.optionExplanations.map(o=><li key={o.option}>
      <span lang="en">{o.option}</span> — {o.explanationTh}
    </li>)}</ul>
    <p><strong>ฝึกต่อ:</strong> {content.remediation.activityTh}</p>
  </section>;
}
