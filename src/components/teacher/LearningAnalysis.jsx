import { useState } from 'react';
import { BarChart3, BookOpen, ChevronRight, ClipboardList, FileSearch, Users, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { summarizeQuestScores, getTeacherVerifiedIndicators } from '../../utils/learningAnalysis';
import '../../styles/learningAnalysis.css';

const tabs = [
  { id: 'indicators', label: 'รายตัวชี้วัด', Icon: ClipboardList },
  { id: 'skills', label: 'รายทักษะ', Icon: BarChart3 },
  { id: 'quests', label: 'ราย Quest', Icon: BookOpen },
];

export default function LearningAnalysis({ students, formatQuestLabel, onQuest, onStudentList, onQuestionReview, dataUnavailable = false }) {
  const [view, setView] = useState('indicators');
  const quests = summarizeQuestScores(students);
  const verifiedIndicators = getTeacherVerifiedIndicators();

  if (dataUnavailable) {
    return (
      <section className="learning-analysis">
        <div className="learning-analysis-panel" role="status">
          <h3>ยังไม่สามารถยืนยันข้อมูลห้องเรียนล่าสุด</h3>
          <p>กรุณารอโหลดข้อมูลหรือกดรีเฟรชก่อนดูผลการเรียนรู้</p>
        </div>
      </section>
    );
  }

  return (
    <section className="learning-analysis" aria-labelledby="learning-analysis-title">
      <header className="learning-analysis-intro">
        <div>
          <p className="learning-analysis-kicker">มองเห็นหลักฐาน เพื่อวางแผนการสอน</p>
          <h3 id="learning-analysis-title">วิเคราะห์ผลการเรียนรู้</h3>
          <p>ดูข้อมูลของนักเรียน {students.length} คนในห้องที่เลือก โดยแยกผลประเมินออกจากผลฝึก</p>
        </div>
        <span>
          <Users size={17} aria-hidden="true" /> {students.length} คน
        </span>
      </header>

      <div className="learning-analysis-tabs" role="group" aria-label="เลือกมุมมองผลการเรียนรู้">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => setView(id)}>
            <Icon size={17} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {view === 'indicators' && (
        <section className="learning-analysis-panel" aria-labelledby="indicator-title">
          <div className="learning-analysis-heading">
            <div>
              <span className="learning-analysis-eyebrow">ผลประเมินตามหลักสูตร</span>
              <h4 id="indicator-title">รายตัวชี้วัด</h4>
              <p>ใช้คำตอบรายข้อที่บันทึกแล้วและจับคู่กับตัวชี้วัดที่ผ่านการตรวจสอบ</p>
            </div>
            {verifiedIndicators.length > 0 ? (
              <span className="learning-analysis-pending is-verified">
                <CheckCircle2 size={13} aria-hidden="true" /> ยืนยันแล้ว {verifiedIndicators.length} ข้อ
              </span>
            ) : (
              <span className="learning-analysis-pending">รอหลักฐาน</span>
            )}
          </div>

          {verifiedIndicators.length > 0 && (
            <div className="learning-analysis-verified-list">
              <div className="verified-header">
                <Sparkles size={16} aria-hidden="true" />
                <strong>ตัวชี้วัดที่ครูผู้สอนตรวจยืนยันแล้ว ({verifiedIndicators.length} ข้อ)</strong>
              </div>
              <div className="verified-grid">
                {verifiedIndicators.map((item) => (
                  <article key={item.id} className="verified-item-card">
                    <div className="verified-item-top">
                      <span className="verified-item-id">รหัสข้อ {item.id}</span>
                      <strong className="verified-item-std">{item.standard} {item.indicator}</strong>
                    </div>
                    {item.remedial && (
                      <div className="verified-remedial">
                        <span className="remedial-label"><Compass size={13} aria-hidden="true" /> จุดเน้นซ่อมเสริม:</span>
                        <p>{item.remedial.focus}</p>
                        <small>ฝึกต่อ: {item.remedial.recommendedVocab}</small>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="learning-analysis-empty">
            <FileSearch size={28} aria-hidden="true" />
            <h5>ยังไม่สามารถสรุปผลรายตัวชี้วัด</h5>
            <p>
              การจับคู่ข้อสอบกับตัวชี้วัดยังรอตรวจสอบ และยังไม่มีคำตอบรายข้อที่พร้อมนำมาวิเคราะห์ จึงยังไม่จัดอันดับจุดอ่อน
            </p>
            {onQuestionReview && (
              <button type="button" onClick={onQuestionReview}>
                ตรวจชุดข้อสอบ <ChevronRight size={16} />
              </button>
            )}
          </div>
          <p className="learning-analysis-footnote">
            เมื่อข้อมูลพร้อม จะแสดงจำนวนข้อ ผู้ตอบ และผลตอบถูกพร้อมระดับความเพียงพอของหลักฐาน
          </p>
        </section>
      )}

      {view === 'skills' && (
        <section className="learning-analysis-panel" aria-labelledby="skill-title">
          <div className="learning-analysis-heading">
            <div>
              <span className="learning-analysis-eyebrow">หลักฐานการเรียนรู้</span>
              <h4 id="skill-title">รายทักษะ</h4>
              <p>ติดตามทักษะจากหลักฐานที่ระบุแหล่งและขอบเขตได้</p>
            </div>
            <span className="learning-analysis-pending">ยังไม่มีสรุประดับห้อง</span>
          </div>
          <div className="learning-analysis-empty">
            <BarChart3 size={28} aria-hidden="true" />
            <h5>ยังไม่มีข้อมูลรายทักษะระดับห้องที่สรุปได้</h5>
            <p>ผล Quest ไม่ใช่คะแนนตัวชี้วัดโดยอัตโนมัติ สามารถดูหลักฐานรายทักษะที่มีอยู่ในรายงานนักเรียนแต่ละคนได้</p>
            <button type="button" onClick={onStudentList}>
              เปิดรายชื่อนักเรียน <ChevronRight size={16} />
            </button>
          </div>
        </section>
      )}

      {view === 'quests' && (
        <section className="learning-analysis-panel" aria-labelledby="quest-title">
          <div className="learning-analysis-heading">
            <div>
              <span className="learning-analysis-eyebrow">ผลการฝึก</span>
              <h4 id="quest-title">ราย Quest</h4>
              <p>คะแนนเฉลี่ยจากผลฝึกที่มีค่าถูกต้อง แสดงจำนวนผู้เรียนที่มีคะแนนในแต่ละด่าน</p>
            </div>
            <span className="learning-analysis-source">ไม่ใช่ผลรายตัวชี้วัด</span>
          </div>
          {quests.length ? (
            <div className="learning-analysis-quest-list">
              {quests.map((quest) => (
                <article className="learning-analysis-quest" key={quest.id}>
                  <div className="learning-analysis-quest-top">
                    <strong>{formatQuestLabel(quest.id)}</strong>
                    <span>
                      {quest.avg}% <small>· {quest.count} คนมีคะแนน</small>
                    </span>
                  </div>
                  <div className="learning-analysis-bar" aria-hidden="true">
                    <span style={{ width: `${quest.avg}%` }} />
                  </div>
                  <div className="learning-analysis-quest-bottom">
                    <span>ค่าเฉลี่ยจากคะแนนที่บันทึกไว้</span>
                    {quest.belowThreshold > 0 && (
                      <button
                        type="button"
                        onClick={() => onQuest({ id: quest.id, name: formatQuestLabel(quest.id) })}
                      >
                        ดูผู้เรียนต่ำกว่า 70% ({quest.belowThreshold} คน) <ChevronRight size={15} />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="learning-analysis-empty">
              <BookOpen size={28} aria-hidden="true" />
              <h5>ยังไม่มีคะแนน Quest ที่ตรวจสอบได้</h5>
              <p>เมื่อผู้เรียนฝึกและมีคะแนนที่บันทึกไว้ ผลจะแสดงในส่วนนี้</p>
            </div>
          )}
          <p className="learning-analysis-footnote">
            คะแนนฝึกอาจมาจากกิจกรรมและจำนวนครั้งที่ต่างกัน ควรดูรายละเอียดก่อนสรุปความต้องการรายบุคคล
          </p>
        </section>
      )}
    </section>
  );
}
