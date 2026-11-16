import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { fetchStudent360 } from '../../utils/student360Api';
import { buildStudent360Model, formatStudent360Date } from '../../utils/student360Model';
import { QUESTS } from '../../data/questions';
import { QUEST_CHAPTERS } from '../../utils/questMapModel';
import { withLocalChapter3Missions } from '../../data/chapter3LocalMissions';
import SkillEvidenceProfile from '../report/SkillEvidenceProfile';
import OfficialExamTeacherPanel from './OfficialExamTeacherPanel';
import TeacherVocabularyAssignments, { VocabularyAssignmentHistory } from './TeacherVocabularyAssignments';
import '../../styles/student360.css';

const tabs = [['overview', 'ภาพรวม'], ['skills', 'หลักฐานทักษะ'], ['errors', 'ข้อผิดและหลักฐาน'], ['assign', 'มอบหมายซ่อมเสริม'], ['followup', 'ติดตามงาน']];
const empty = 'ยังไม่มีข้อมูลเพียงพอ';

export default function Student360Profile({ schoolId, studentId, actor, onClose, initialTab = 'overview', renderLegacyDetails }) {
  const [tab, setTab] = useState(tabs.some(([id]) => id === initialTab) ? initialTab : 'overview');
  const [revision, setRevision] = useState(0);
  const [load, setLoad] = useState({ status: 'loading' });
  const dialog = useRef(null);
  const titleId = useId();
  const key = JSON.stringify([schoolId, studentId, actor?.user_id, actor?.isDemo, actor?.authVerified, actor?.role, actor?.membership_role, actor?.school_membership_id]);
  useEffect(() => {
    const previous = document.activeElement;
    const element = dialog.current;
    element.showModal();
    return () => { element.close(); if (previous?.isConnected) previous.focus(); };
  }, []);
  useEffect(() => {
    let active = true;
    setLoad({ key, status: 'loading' });
    fetchStudent360(schoolId, studentId, actor).then(snapshot => {
      if (active) setLoad({ key, status: 'ready', snapshot });
    }).catch(error => {
      if (active) setLoad({ key, status: error.code === 'student360_forbidden' ? 'denied' : error.code === 'student360_unavailable' ? 'blocked' : 'error' });
    });
    return () => { active = false; };
  }, [schoolId, studentId, actor, key, revision]);
  const snapshot = load.key === key && load.status === 'ready' ? load.snapshot : null;
  const model = useMemo(() => snapshot ? buildStudent360Model(snapshot, QUESTS, QUEST_CHAPTERS.map(withLocalChapter3Missions)) : null, [snapshot]);
  const student = snapshot?.profile;
  const status = load.key === key ? load.status : 'loading';
  const selectTab = next => { setTab(next); };
  const onTabKey = (event, index) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setTab(tabs[next][0]);
    dialog.current.querySelectorAll('[role="tab"]')[next].focus();
  };
  return <dialog ref={dialog} className="student360" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="student360-shell">
      <header className="student360-header"><div><h2 id={titleId}>ข้อมูลรายบุคคล · Student 360°</h2>{student && <p>{student.name || empty} · {student.class || empty} · เลขที่ {student.number ?? '—'}</p>}</div><button type="button" className="student360-button" onClick={onClose} aria-label="ปิดข้อมูลรายบุคคล">ปิด</button></header>
      <div className="student360-body">
        {status === 'loading' && <p role="status">กำลังตรวจสิทธิ์และโหลดข้อมูลรายบุคคล…</p>}
        {status === 'denied' && <p role="alert">ไม่สามารถยืนยันสิทธิ์เข้าถึงนักเรียนคนนี้ กรุณาตรวจโรงเรียน ห้องที่ได้รับมอบหมาย หรือเข้าสู่ระบบใหม่</p>}
        {status === 'blocked' && <p role="alert">BLOCKED · ยังไม่เปิดตัวอ่าน Student 360° ที่ตรวจสิทธิ์รายบุคคลในฐานข้อมูล ไม่ใช้ข้อมูลค้างหรือสิทธิ์ทั้งโรงเรียนแทน และยังไม่มอบหมายงานจากหน้านี้</p>}
        {status === 'error' && <p role="alert">ยังโหลดข้อมูลไม่ได้ ไม่แสดงข้อผิดพลาดเป็นคะแนนศูนย์หรือสถานะส่งงานแล้ว</p>}
        {status !== 'loading' && <button type="button" className="student360-button" onClick={() => setRevision(value => value + 1)}>ตรวจสิทธิ์และโหลดใหม่</button>}
        {snapshot && <>
          <p className="student360-note">ข้อมูลที่ระบบส่งคืนเมื่อ {formatStudent360Date(snapshot.retrievedAt)} · ผลฝึกไม่ใช่การรับรองความสามารถทั้งหมด ไม่มีผลพูด/เขียนหรือการประเมินใหม่ให้คะแนนแทนข้อมูลที่ขาด</p>
          <div role="tablist" aria-label="ส่วนข้อมูล Student 360°" className="student360-tabs">{tabs.map(([id, label], index) => <button key={id} id={`${titleId}-${id}`} role="tab" type="button" aria-controls={`${titleId}-panel`} aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onKeyDown={event => onTabKey(event, index)} onClick={() => selectTab(id)}>{label}</button>)}</div>
          <section role="tabpanel" id={`${titleId}-panel`} aria-labelledby={`${titleId}-${tab}`} className="student360-panel" tabIndex={0}>
            {tab === 'overview' && <>
              <h3>ความคืบหน้าเกม — ไม่ใช่ระดับภาษาอังกฤษ</h3>
              <dl className="student360-metrics"><div><dt>XP</dt><dd>{student.xp ?? '—'}</dd></div><div><dt>Level</dt><dd>{student.level ?? '—'}</dd></div><div><dt>ด่านที่ผ่าน</dt><dd>{model.progress.completed}/{model.progress.total}</dd></div></dl>
              <p>Pre-test: {model.preTest.label}{model.preTest.percent !== null ? ` · ${model.preTest.percent}%` : ''}{model.preTest.total ? ` (${model.preTest.score}/${model.preTest.total})` : ''}</p>
              <h3>งานจากครู</h3><p>{model.assignments ? `งานทั้งหมด ${model.assignments.total} · ยังไม่ครบ ${model.assignments.pending} · ส่งครบตามบันทึก ${model.assignments.submitted}` : empty}</p>
              <OfficialExamTeacherPanel actor={actor} schoolId={schoolId} studentId={studentId} onRemediate={()=>selectTab('assign')}/>
              <h3>หลักฐานและขั้นต่อไป</h3><p>{model.profile.observations.length ? `มีคำตอบครั้งแรกที่จับคู่ได้ ${model.profile.observations.length} ข้อในรอบล่าสุดของด่านที่รองรับ` : empty}</p>
              <p>ยังไม่สามารถระบุจุดอ่อนได้จากข้อมูลที่มีโดยอัตโนมัติ ครูควรตรวจแหล่งข้อมูลและการใช้ตัวช่วยก่อนเลือกการสอนเสริม</p>
              <button type="button" className="student360-button" onClick={() => selectTab('errors')}>ตรวจข้อผิดและหลักฐาน</button>
              {renderLegacyDetails && <details><summary>ดูผลฝึกเดิมและสนามสอบ · ไม่ใช่คะแนนทักษะรวม</summary>{renderLegacyDetails(student)}</details>}
            </>}
            {tab === 'skills' && <><SkillEvidenceProfile profile={model.profile} showWordPractice={false} /><p>การ์ดข้างต้นอ่านผล Quest ไม่อ่านประวัติคำศัพท์ส่วนตัวจากเครื่องครู ผลคำศัพท์ที่ระบบส่งคืนแสดงแยกด้านล่าง</p><ul>{snapshot.vocabulary.rows.map((row, index) => <li key={`${row.word_id}:${row.category_id}:${index}`}><strong>{row.word}</strong> — {row.meaning_th}<p>ไม่ใช้ตัวช่วยตามบันทึก: ถูก {row.independent_correct ?? '—'}/{row.independent_attempts ?? '—'} · ใช้ตัวช่วย: ถูก {row.assisted_correct ?? '—'}/{row.assisted_attempts ?? '—'}</p><p>บริบท {row.category_id || 'ไม่ระบุ'} · ระบบรับผล {formatStudent360Date(row.last_received_at)} · ไม่ใช่ข้อยืนยันว่าไม่เคยเห็นโจทย์</p></li>)}</ul>{!snapshot.vocabulary.rows.length && <p>{empty}สำหรับผลคำศัพท์ที่ส่งถึงระบบ</p>}<p>Core Verbs / Verb Phrases / Phrasal Verbs / Question Patterns: {empty}สำหรับคะแนนแยกหมวด</p><p>Answer Accuracy มีเฉพาะผลครั้งแรกที่จับคู่ได้ · Question Understanding (0–2) และ Text Evidence (0–2): ยังไม่มีคะแนนแยก ไม่คำนวณจากช้อยส์ถูกเพียงอย่างเดียว</p></>}
            {tab === 'errors' && <>
              <h3>สิ่งที่สังเกตได้ ไม่ใช่คำวินิจฉัยจุดอ่อนถาวร</h3>
              {!model.errors.length && <p>{empty}สำหรับข้อผิดรายข้อที่จับคู่ได้</p>}
              <ul>{model.errors.map(item => <li key={`${item.id}:${item.version}`}><strong>คำตอบแรกไม่ถูก · {item.questId}</strong><p>รหัส {item.id} · เวอร์ชัน {item.version} · {formatStudent360Date(item.at)}</p><p>{item.corrected ? 'มีบันทึกตอบถูกหลังแก้ โดยไม่เพิ่มคะแนนครั้งแรก' : 'ยังไม่มีข้อมูลยืนยันการตอบแก้'}</p><p>ตัวช่วย คำแปล การเคยเห็นข้อ และการทำเองกับโจทย์ใหม่: ยังยืนยันไม่ได้</p></li>)}</ul>
              <h3>คำที่ครูอาจพิจารณาทบทวน</h3>
              <p>ข้อเสนอจากประวัติฝึกที่อุปกรณ์ส่ง ไม่ใช่คะแนนสอบที่เซิร์ฟเวอร์ตรวจคำตอบ ไม่วินิจฉัยจากผิดครั้งเดียว</p>
              {!model.wordNeeds.length && <p>ยังไม่สามารถระบุจุดอ่อนได้จากข้อมูลที่มี</p>}
              <ul>{model.wordNeeds.map((word, index) => <li key={`${word.wordId}:${word.categoryId}:${index}`}><strong>{word.word}</strong> · ตามบันทึกไม่ถูก {word.incorrect}/{word.attempts} ครั้งที่ระบุว่าไม่ใช้ตัวช่วย<p>{word.repeated ? 'พบมากกว่าหนึ่งครั้งในบริบทนี้ ครูอาจพิจารณาทบทวนเพิ่มเติม' : 'พบครั้งเดียว ยังไม่สรุปว่ามีจุดอ่อน'}</p></li>)}</ul>
              <button type="button" className="student360-button" onClick={() => selectTab('assign')}>เตรียมมอบหมายซ่อมเสริม</button>
            </>}
            {tab === 'assign' && (
              <div className="student360-assign-container">
                <TeacherVocabularyAssignments
                  schoolId={schoolId}
                  student={student}
                  evidenceRows={snapshot.vocabulary.rows}
                />
              </div>
            )}
            {tab === 'followup' && <><h3>งานและผลติดตามที่ระบบส่งคืน</h3><p>ส่งแล้วหมายถึงตอบครบตามระบบเดิม ไม่ใช่ครูตรวจแล้วหรือเชี่ยวชาญ ไม่สร้างสถานะ REVIEWED/COMPLETED ขึ้นเอง</p>{snapshot.assignments.status === 'available' ? snapshot.assignments.tasks.length ? <VocabularyAssignmentHistory tasks={snapshot.assignments.tasks} /> : <p>ยังไม่มีงานที่ระบบส่งคืนสำหรับนักเรียนคนนี้</p> : <p>{empty} · ตัวอ่านงานยังไม่พร้อมใช้งาน</p>}<p>ประวัติทุก attempt, การขอแก้, Fresh Check, Delayed Review และบันทึกครู: ยังไม่เชื่อมใน contract นี้ ไม่เขียนทับประวัติงานเดิม</p></>}
          </section>
        </>}
      </div>
    </div>
  </dialog>;
}
