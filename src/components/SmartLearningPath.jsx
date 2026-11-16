import { useState } from 'react';
import { BookOpenCheck, BrainCircuit, ChevronDown, ChevronRight, RotateCcw, ShieldCheck } from 'lucide-react';
import { buildSmartLearningPath } from '../utils/smartLearningPath';

export default function SmartLearningPath({ student, progress, unlocked, onNavigate, onSelectQuest, compact = false }) {
  const [showAll, setShowAll] = useState(false);
  const path = buildSmartLearningPath({ student, progress, unlocked });
  const [primary, ...secondary] = path.recommendations;

  function open(activity) {
    if (activity.type === 'review') onNavigate('review');
    else if (unlocked?.[activity.questId]) onNavigate('mission-select', activity.questId);
  }

  function recommendation(activity, index, featured = false) {
    const Icon = activity.type === 'review' ? RotateCcw : BookOpenCheck;
    const canOpen = activity.type === 'review' || Boolean(unlocked?.[activity.questId]);
    return <article key={activity.destinationId} className={`qm-smart-path-item${featured ? ' is-featured' : ''}`}>
      <span className="qm-smart-path-number">{index + 1}</span>
      <Icon className="qm-smart-path-activity-icon" aria-hidden="true" />
      <div>
        {featured && <strong className="qm-smart-path-priority">แนะนำอันดับแรก</strong>}
        <span>{activity.skill}</span>
        <h3>{activity.title}</h3>
        <p>{activity.reason}</p>
        <small>{activity.evidence}</small>
      </div>
      <button disabled={!canOpen} onClick={() => open(activity)} aria-label={`เริ่ม ${activity.title}`}>เริ่มฝึก<ChevronRight size={18} /></button>
    </article>;
  }

  if (compact) return <section className="qm-smart-path is-compact qm-smart-banner" aria-labelledby="qm-smart-path-title">
    <div className="qm-smart-banner-summary">
      <img className="qm-smart-banner-art" src="/assets/exam-world/compass.webp" width="42" height="42" alt="" />
      <div><p className="qm-eyebrow">คำแนะนำจากผลการเรียน</p><h2 id="qm-smart-path-title">{primary ? `แนะนำ: ${primary.title}` : 'เลือกด่านที่พร้อมเล่นบนแผนที่'}</h2></div>
      {primary && <button type="button" className="qm-secondary" onClick={() => primary.type !== 'review' && onSelectQuest ? onSelectQuest(primary.questId) : open(primary)}>{primary.type === 'review' ? 'ดูข้อที่ควรทบทวน' : 'ดูบนแผนที่'}<ChevronRight size={17} /></button>}
    </div>
    <details className="qm-smart-banner-details"><summary>ดูเหตุผลและคำแนะนำเพิ่มเติม</summary>
      <p>{path.evidenceStatus === 'verified-learning-data' ? 'แนะนำด้วยกฎจากคะแนนและข้อผิดที่บันทึก ไม่ใช่การวิเคราะห์โดย AI' : 'ยังมีข้อมูลไม่พอระบุจุดอ่อน จึงแนะนำจากด่านที่เปิดและลำดับการเรียน'}</p>
      {primary && <p>{primary.reason} · {primary.evidence}</p>}
      {!!secondary.length && <div className="qm-smart-path-list">{secondary.map((activity, index) => recommendation(activity, index + 1))}</div>}
      <p className="qm-smart-path-freedom">คำแนะนำไม่เปลี่ยนการปลดล็อก คุณยังเลือกด่านที่เปิดอยู่ได้ตามปกติ</p>
    </details>
  </section>;
  return <section className="qm-smart-path" aria-labelledby="qm-smart-path-title">
    <header className="qm-smart-path-heading">
      <div className="qm-smart-path-icon"><BrainCircuit aria-hidden="true" /></div>
      <div>
        <p className="qm-eyebrow">Smart Learning Path</p>
        <h2 id="qm-smart-path-title">เส้นทางฝึกที่เหมาะกับคุณ</h2>
        <p>{path.evidenceStatus === 'verified-learning-data'
          ? 'วิเคราะห์ด้วยกฎจากคะแนนและข้อผิดที่ระบบบันทึกแล้ว ไม่ใช่คำตอบจาก AI'
          : 'ยังมีข้อมูลไม่พอระบุจุดอ่อน จึงเริ่มจากด่านที่เปิดและเหมาะกับลำดับการเรียน'}</p>
      </div>
      <span className="qm-smart-path-trust"><ShieldCheck size={15} />อธิบายเหตุผลได้</span>
    </header>
    {primary && compact && primary.type !== 'review' && onSelectQuest ? <div className="qm-smart-map-tip"><span>แนะนำให้ลอง: <strong>{primary.title}</strong> · {primary.reason}</span><button type="button" onClick={() => onSelectQuest(primary.questId)}>ดูบนแผนที่<ChevronRight size={17} /></button></div> : primary && <div className="qm-smart-path-primary">{recommendation(primary, 0, true)}</div>}
    {secondary.length > 0 && <div className="qm-smart-path-secondary">
      <button className="qm-smart-path-toggle" type="button" aria-expanded={showAll} aria-controls="qm-smart-path-more" onClick={() => setShowAll(value => !value)}>
        {showAll ? 'ซ่อนคำแนะนำเพิ่มเติม' : `ดูคำแนะนำทั้งหมด (${secondary.length})`}
        <ChevronDown size={19} aria-hidden="true" />
      </button>
      {showAll && <div id="qm-smart-path-more" className="qm-smart-path-list">{secondary.map((activity, index) => recommendation(activity, index + 1))}</div>}
    </div>}
    <p className="qm-smart-path-freedom">คำแนะนำไม่เปลี่ยนการปลดล็อก คุณยังเลือกเล่นด่านอื่นที่เปิดอยู่ได้ตามปกติ</p>
    <div className="qm-ai-practice-status">
      <BrainCircuit size={18} aria-hidden="true" />
      <span><strong>AI Personalized Practice</strong> เตรียมระบบสร้างชุดฝึก 3–5 ข้อแล้ว แต่ยังไม่เปิดให้นักเรียนจนกว่าจะเชื่อม provider และมีพื้นที่ให้ครูตรวจอนุมัติ</span>
    </div>
  </section>;
}
