import { useState } from 'react';
import { BookOpen, LockKeyhole, Play, RotateCcw } from 'lucide-react';
import { getQuestArtwork } from '../../data/questArtwork';
import { getQuestPracticeStats } from '../../utils/questMapModel';
import { getQuestMissionSummary } from '../../utils/questMissionPanel';
import { getQuestVocabulary } from '../../data/questVocabulary';
import ResilientArtwork from '../ResilientArtwork';
import QuestVocabularyProgress from './QuestVocabularyProgress';
import '../../styles/questMissionPanel.css';

const statusLabels = { locked: 'ยังล็อก', passed: 'ผ่านแล้ว', unfinished: 'กำลังฝึก', new: 'พร้อมเริ่ม' };
const missionIllustrations = {
  family: { src: '/assessment/quest-scenes/family-parents-v1.webp', scene: true },
  vocabulary: { src: '/learning/places/airport-v1.png', scene: false },
};

export default function QuestMissionPanel({ quest, number, progress, learningState, onPlay, onVocab, actionRef, unlockConditions, bossGateMessage, onCheckBoss, bossCheckLoading, student }) {
  const [showConditions, setShowConditions] = useState(false);
  const summary = getQuestMissionSummary(quest);
  const stats = getQuestPracticeStats(progress);
  const hasStarHistory = Array.isArray(progress?.stars) && progress.stars.length > 0;
  const illustration = missionIllustrations[quest.id];
  const artwork = illustration?.src || getQuestArtwork(quest.id);
  const pct = progress?.pct !== null && progress?.pct !== undefined && Number.isFinite(Number(progress.pct))
    ? Math.max(0, Math.min(100, Number(progress.pct))) : null;
  const locked = learningState === 'locked';
  const requiredVocabulary = !quest.isExam ? getQuestVocabulary(quest.id) : null;
  const action = learningState === 'passed' ? 'เล่นอีกครั้ง' : learningState === 'unfinished' ? 'เล่นต่อ' : 'เริ่มภารกิจ';
  return (
    <aside className={`qm-quest-detail qm-mission-panel is-${learningState}`} aria-live="polite" aria-label="รายละเอียดภารกิจที่เลือก">
      <div className="qm-mission-body">
      <div className="qm-mission-main">
      <div className="qm-mission-intro">
      <div className={`qm-mission-art ${illustration?.scene ? 'is-scene' : 'is-illustration'}`} aria-label={`ด่านที่ ${number}`}>
        {artwork ? <ResilientArtwork src={artwork} alt={quest.name} eager fallback={<BookOpen />} /> : <BookOpen />}
        <span>{number}</span>
      </div>
      <div className="qm-quest-detail-copy qm-mission-info">
        <div className="qm-mission-title"><h4 id="qm-stage-title">{quest.name}</h4><em>{statusLabels[learningState]}</em></div>
        <p>{quest.description}</p>
        {summary.skills.length > 0 && <ul className="qm-mission-skills" aria-label="ทักษะที่ฝึก">{summary.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>}
      </div>
      </div>
        {requiredVocabulary && <section className="qm-required-vocabulary" aria-label="คำศัพท์จำเป็นสำหรับด่านนี้">
          <div className="qm-required-vocabulary-heading">
            <strong><img className="qm-mission-heading-art" src="/assets/exam-world/journal.webp" alt="" />คำศัพท์จำเป็น</strong>
            <QuestVocabularyProgress questId={quest.id} student={student} />
          </div>
          <ul>{requiredVocabulary.words.map(word => <li key={word}>{word}</li>)}</ul>
          <div className="qm-required-vocabulary-actions">
            <button type="button" onClick={() => onVocab?.(quest.id)}>ฝึกคำศัพท์ของด่าน</button>
            <small>แนะนำให้ฝึกก่อนเริ่ม · ยังไม่ใช้ล็อกด่าน</small>
          </div>
        </section>}
      <section className="qm-mission-objectives" aria-label="ภารกิจที่ต้องทำ">
        <h5><img className="qm-mission-heading-art" src="/assets/exam-world/compass.webp" alt="" />ภารกิจ</h5>
        {summary.objectives.length > 0 ? <ol>{summary.objectives.map(objective => <li key={objective}>{objective}</li>)}</ol> : <p>ดูรายละเอียดกิจกรรมเมื่อเข้าสู่ด่าน</p>}
        {summary.optionalActivities && <small>เลือกกิจกรรมฝึกได้ ไม่จำเป็นต้องทำครบทุกกิจกรรม</small>}
      </section>
      </div>
      <div className="qm-mission-sidebar">
      <section className="qm-mission-rewards" aria-label="ดาวสะสมของด่านนี้">
        <h5>ดาวสะสมของด่านนี้</h5>
        <div className={`qm-mission-reward-card ${hasStarHistory ? 'has-history' : 'is-unrecorded'} ${stats.stars === 0 ? 'is-empty' : ''}`}>
          {summary.hasQuiz || hasStarHistory ? <>
          <img className="qm-mission-star" src="/assets/lesson-world/reward-star.webp" alt="" />
          <span>{hasStarHistory ? 'ได้รับแล้ว' : 'ดาวจากแบบทดสอบ'}</span>
          <strong>{hasStarHistory ? `${stats.stars} ดาว` : 'ยังไม่มีประวัติดาว'}</strong>
          {hasStarHistory && <small>รวมทุกรอบที่บันทึกในด่านนี้</small>}
          {summary.hasQuiz && <small>แบบทดสอบ: สูงสุด 3 ดาวต่อรอบ ตามผลที่ทำได้</small>}
          </> : <p>ยังไม่มีข้อมูลรางวัลของด่านนี้</p>}
          <strong className="qm-mission-score">{pct === null ? 'ยังไม่มีคะแนนที่บันทึก' : `คะแนนที่บันทึก ${pct}%`}</strong>
        </div>
      </section>
      </div>
      </div>
      <div className="qm-mission-action">
        {bossGateMessage && <p role="status" className="qm-detail-locked">{bossGateMessage}</p>}
        {locked ? <>
          {bossGateMessage && onCheckBoss && <button type="button" className="qm-detail-conditions" disabled={bossCheckLoading} onClick={onCheckBoss}>{bossCheckLoading ? 'กำลังตรวจสิทธิ์…' : 'ตรวจสิทธิ์ Boss อีกครั้ง'}</button>}
          <button type="button" ref={actionRef} className="qm-detail-conditions" aria-expanded={showConditions} onClick={() => setShowConditions(value => !value)}><LockKeyhole />ดูเงื่อนไขปลดล็อก</button>
          <p className="qm-detail-locked" hidden={!showConditions}>{unlockConditions || (quest.isExam ? 'ผ่านทุกด่านในบทนี้ให้ครบก่อน' : `ผ่านบท ${Math.max(1, quest.chapter - 1)} และทบทวนข้อผิดให้ครบก่อน`)}</p>
        </> : <button type="button" ref={actionRef} className="qm-detail-action" onClick={() => onPlay(quest)}>{learningState === 'passed' ? <RotateCcw /> : <Play />}{action}</button>}
      </div>
    </aside>
  );
}
