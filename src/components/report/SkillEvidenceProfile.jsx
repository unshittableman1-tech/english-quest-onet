import { ArrowRight, BookOpen, Headphones, Info, Languages, MessageCircle, PencilLine, ScanSearch, ShieldCheck } from 'lucide-react';
import { formatSkillEvidenceDate } from '../../utils/skillEvidenceProfile';
import '../../styles/skillEvidenceProfile.css';

const icons = { vocabulary: Languages, reading: BookOpen, grammar: ShieldCheck };
const unmeasured = [
  { id: 'question_comprehension', name: 'ความเข้าใจโจทย์ · Question Understanding', Icon: ScanSearch,
    brief: 'รอหลักฐานการตีความสิ่งที่โจทย์ถาม',
    reason: 'ยังไม่มีคะแนนแยกว่าตีความสิ่งที่โจทย์ถามได้หรือไม่ จึงไม่อนุมานจากคะแนนด่าน Wh-Questions' },
  { id: 'text_evidence', name: 'การชี้หลักฐาน · Text Evidence', Icon: ScanSearch,
    brief: 'รอหลักฐานการเลือกข้อความสนับสนุนคำตอบ',
    reason: 'ยังไม่มีคะแนนแยกการเลือกข้อความสนับสนุนคำตอบ จึงไม่แยกทักษะนี้จากคะแนนรวมแบบสองขั้น' },
  { id: 'listening', name: 'การฟัง · Listening', Icon: Headphones,
    brief: 'ยังไม่มีผลทดสอบการฟังโดยเฉพาะ',
    reason: 'ยังไม่มีผลทดสอบการฟังที่แยกไว้ การกดฟังเสียงอ่านไม่ใช่ผลประเมินทักษะการฟัง' },
  { id: 'speaking', name: 'การพูด · Speaking', Icon: MessageCircle,
    brief: 'ยังไม่มีผลงานพูดที่มีผลประเมิน',
    reason: 'ยังไม่มีผลงานพูดที่ประเมินด้วยเกณฑ์ร่วมกัน' },
  { id: 'writing', name: 'การเขียน · Writing', Icon: PencilLine,
    brief: 'ยังไม่มีผลงานเขียนที่มีผลประเมิน',
    reason: 'ยังไม่มีผลงานเขียนที่ประเมินด้วยเกณฑ์ร่วมกัน' },
];

function UnmeasuredCard({ item, compact = false }) {
  const { id, name, Icon, brief, reason } = item;
  return <article className={`skill-evidence-card is-unmeasured ${compact ? 'is-compact' : ''}`} data-skill-evidence={id} aria-labelledby={`skill-evidence-${id}`}>
    <div className="skill-evidence-title"><span className="skill-evidence-icon"><Icon aria-hidden="true" /></span><h4 id={`skill-evidence-${id}`}>{name}</h4></div>
    <span className="skill-evidence-status">ยังไม่ประเมินแยก</span>
    {compact ? <p>{reason}</p> : <><p>{brief}</p><details className="skill-evidence-description"><summary><Info aria-hidden="true" />เหตุใดยังไม่มีคะแนน</summary><p>{reason}</p></details></>}
  </article>;
}

export default function SkillEvidenceProfile({ profile, isDemo = false, showWordPractice = true, practiceActions = {}, onPractice }) {
  const wordAnswers = profile.wordPractice.unassisted.total + profile.wordPractice.assisted.total;
  return (
    <section className="report-section skill-evidence-profile" aria-labelledby="skill-profile-heading">
      <header className="skill-profile-heading">
        <h2 id="skill-profile-heading">โปรไฟล์หลักฐานรายทักษะ</h2>
        <p>แยกจาก XP และจำนวนด่านที่ผ่าน · ยังไม่ใช่ระดับความสามารถภาษาอังกฤษหรือระดับ CEFR</p>
        <p className="skill-evidence-coverage">มีหลักฐานรายข้อจาก Quest {profile.skills.filter(skill => skill.total > 0).length} จาก 8 ทักษะ · ทักษะที่ไม่มีข้อมูลยังไม่ถือว่าได้คะแนนศูนย์</p>
        {isDemo && <p className="skill-profile-demo">ข้อมูลเดโมสำหรับทดลอง ไม่ใช่ผลของนักเรียนจริง</p>}
      </header>
      <details className="skill-profile-policy"><summary><Info aria-hidden="true" />วิธีอ่านคะแนนและหลักฐานทักษะ</summary><p>ใช้คำตอบครั้งแรกที่จับคู่รหัสและเวอร์ชันข้อได้ จากรอบล่าสุดของแต่ละด่าน ไม่ใช่ประวัติทุกครั้ง ข้อมูลตัวช่วยและการเคยเห็นโจทย์ใน Quest ยังไม่ครบ จึงยังยืนยันการทำเองกับโจทย์ใหม่ไม่ได้</p></details>
      <section className="skill-evidence-group" aria-labelledby="skill-practice-heading">
      <h3 id="skill-practice-heading">หลักฐานจากแบบฝึกในแอป</h3>
      <div className="skill-evidence-grid">
        {profile.skills.map(skill => {
          const Icon = icons[skill.id];
          const action = practiceActions[skill.id];
          return <article className="skill-evidence-card" data-skill-evidence={skill.id} key={skill.id} aria-labelledby={`skill-evidence-${skill.id}`}>
            <div className="skill-evidence-title"><span className="skill-evidence-icon"><Icon aria-hidden="true" /></span><h4 id={`skill-evidence-${skill.id}`}>{skill.name} · {skill.english}</h4></div>
            <span className={`skill-evidence-status is-${skill.status}`}>{skill.status === 'practice_only' ? 'มีหลักฐานจากแบบฝึก' : 'หลักฐานยังไม่พอ'}</span>
            <p className={`skill-evidence-result ${skill.total ? '' : 'is-empty'}`}>{skill.total ? <><strong>{skill.correct}/{skill.total}</strong><span>ตอบถูกครั้งแรกในข้อที่จับคู่ได้ ({skill.percent}%)</span></> : 'ยังไม่มีผลรายข้อจาก Quest ที่ใช้สรุปได้'}</p>
            {skill.total > 0 && <p>คะแนนนี้ไม่ใช่เปอร์เซ็นต์ความสามารถทั้งหมด · ยังไม่ทราบการใช้ตัวช่วยและความใหม่ของโจทย์</p>}
            {skill.corrected > 0 && <p>ตอบถูกหลังแก้ {skill.corrected} ข้อ โดยไม่เพิ่มคะแนนครั้งแรก</p>}
            {skill.id === 'vocabulary' && showWordPractice && <div className="skill-word-practice" aria-label="ผล Vocab Drill แยกตามตัวช่วย">
              <strong>Vocab Drill · แยกจากคะแนน Quest</strong>
              {wordAnswers ? <>
                {profile.wordPractice.unassisted.total > 0 && <p>ไม่ใช้ตัวช่วยตามบันทึก: ถูก {profile.wordPractice.unassisted.correct}/{profile.wordPractice.unassisted.total} คำตอบ</p>}
                {profile.wordPractice.assisted.total > 0 && <p>ใช้ตัวช่วยตามบันทึก: ถูก {profile.wordPractice.assisted.correct}/{profile.wordPractice.assisted.total} คำตอบ</p>}
              </> : <p>ยังไม่มีคำตอบในประวัติที่อ่านได้</p>}
              <details><summary>ขอบเขตประวัติคำศัพท์</summary><small>ประวัติบนเครื่องนี้อาจไม่ครบข้ามอุปกรณ์ และอาจมีคำหรือข้อซ้ำ ไม่ใช่จำนวนคำที่รู้หรือหลักฐานว่าจำได้ระยะยาว</small><p>{profile.wordPractice.unassisted.total ? 'มีคำตอบที่ระบุว่าไม่ใช้ตัวช่วยตามจำนวนข้างต้น' : 'ยังไม่มีคำตอบที่บันทึกว่าไม่ใช้ตัวช่วย'} · {profile.wordPractice.assisted.total ? 'มีคำตอบที่ระบุว่าใช้ตัวช่วยตามจำนวนข้างต้น' : 'ยังไม่มีคำตอบที่บันทึกว่าใช้ตัวช่วย'}</p></details>
            </div>}
            {skill.latestAt && <p>หลักฐานล่าสุด: {formatSkillEvidenceDate(skill.latestAt)}</p>}
            {skill.sources.length > 0 && <details><summary>ดูที่มาของข้อมูล</summary><ul>{skill.sources.map(source => <li key={`${source.questId}:${source.version}`}>
              <strong>{source.name}</strong><span>ถูก {source.correct}/{source.total} ข้อจากรอบล่าสุด · เวอร์ชัน {source.version} · {formatSkillEvidenceDate(source.at)}</span>
              <span>{source.rounds === null ? 'ไม่ทราบจำนวนรอบที่เคยฝึก' : `ประวัติบันทึก ${source.rounds} รอบ · ไม่ได้รวมคะแนนทุกรอบ`}</span>
              {source.timeBasis === 'quest_activity' && <span>วันที่นี้เป็นวันกิจกรรมของด่าน ไม่ใช่วันประเมินที่ยืนยันได้</span>}
            </li>)}</ul></details>}
            <details className="skill-evidence-description"><summary><Info aria-hidden="true" />ขอบเขตและขั้นต่อไป</summary><p>{skill.scope}</p><p>{skill.status === 'practice_only' ? 'ประเมินด้วยโจทย์ใหม่ที่ไม่ใช้ตัวช่วยก่อนสรุประดับทักษะ' : 'เริ่มเก็บหลักฐานจากแบบฝึกที่เกี่ยวข้อง โดยยังไม่ตัดสินระดับทักษะ'}</p></details>
            {onPractice && action && <div className="skill-evidence-next">{action.hint && <p>{action.hint}</p>}<button type="button" className="skill-practice-action" data-practice-kind={action.kind} onClick={() => onPractice(skill.id)}>{action.label}<ArrowRight aria-hidden="true" /></button></div>}
          </article>;
        })}
      </div>
      </section>
      <section className="skill-evidence-group is-awaiting" aria-labelledby="skill-awaiting-heading"><h3 id="skill-awaiting-heading">ทักษะที่ยังไม่มีผลประเมินแยก</h3><div className="skill-evidence-grid">{unmeasured.slice(0, 3).map(item => <UnmeasuredCard key={item.id} item={item} />)}</div></section>
      <section className="skill-evidence-group is-performance" aria-labelledby="skill-performance-heading"><h3 id="skill-performance-heading">ทักษะที่ต้องประเมินจากผลงาน</h3><div className="skill-evidence-grid">{unmeasured.slice(3).map(item => <UnmeasuredCard key={item.id} item={item} compact />)}</div></section>
      <footer className="skill-profile-limitations">
        <details><summary>ข้อจำกัดและข้อมูลที่ยังไม่นำมาสรุป</summary>
        <p>ประวัติด่านที่ไม่มีหลักฐานคำตอบรายข้อ {profile.excluded.aggregateOnly} ด่าน · ชุดข้อมูลไม่ครบหรือขัดกัน {profile.excluded.invalidRecords} ชุด · ข้อที่จับคู่ไม่ได้ {profile.excluded.unmatchedItems} ข้อ · ข้อที่ยังไม่พร้อมใช้ {profile.excluded.heldItems} ข้อ · ข้อซ้ำที่ขัดกัน {profile.excluded.ambiguousItems} ข้อ</p>
        <p>metadata ซ้ำกำกวม {profile.excluded.ambiguousMetadata} รายการ · เหตุการณ์ Vocab Drill ซ้ำขัดกัน {profile.wordPractice.conflictingEvents} รายการ ไม่นำมาคิดคะแนนในโปรไฟล์</p>
        <p>รายการเหล่านี้ไม่นำมาสรุปโปรไฟล์ แต่ประวัติด่านเดิมยังอยู่ด้านล่าง การจัดหมวดนี้เป็นขอบเขตแบบฝึกเบื้องต้น ไม่ใช่ผลรับรองการประเมินรายทักษะ</p>
        </details>
      </footer>
    </section>
  );
}
