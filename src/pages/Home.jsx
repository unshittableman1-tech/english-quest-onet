import { ArrowRight, Award, BarChart3, BookCheck, Gamepad2, RotateCcw, Sparkles, Star } from 'lucide-react';
import PageShell from '../components/PageShell';
import PricingSection from '../components/PricingSection';
import logo from '../assets/logo.png';
import ThemeImage from '../themes/ThemeImage';

const FEATURES = [
  { Icon: BookCheck, title: 'O-NET Blueprint', text: 'ฝึกครบตามตัวชี้วัดสำคัญ 4 ทักษะ' },
  { Icon: RotateCcw, title: 'ทบทวนข้อผิด', text: 'จำจุดพลาดแล้วฝึกซ้ำอย่างฉลาด' },
  { Icon: BarChart3, title: 'รายงานสำหรับครู', text: 'เห็นความก้าวหน้าของทุกห้องเรียน' },
];

export default function Home({ onStart, onDemo, onTeacher, onSchoolApply, onSelectPlan, demoMode = false }) {
  return (
    <PageShell className="eq-home" right={
      <div className="flex items-center gap-2">
        {onSchoolApply && (
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            onClick={() => onSchoolApply('student_hero', 'monthly')}
          >
            ⭐ สมัครแพ็กเกจ (Pricing 2027)
          </button>
        )}
        <button className="eq-header-teacher" onClick={onTeacher} disabled={demoMode}>
          {demoMode ? 'ระบบครูปิดใน Demo' : 'เข้าสู่ระบบครู'}
        </button>
      </div>
    }>
      <section className="eq-home-hero" aria-labelledby="home-title">
        <div className="eq-home-gimmicks" aria-hidden="true">
          <span className="eq-robot-core" />
          <span className="eq-treasure-spark spark-one"><Star /></span>
          <span className="eq-treasure-spark spark-two"><Sparkles /></span>
          <span className="eq-treasure-spark spark-three"><Star /></span>
        </div>
        <ThemeImage className="eq-home-logo" assetKey="logo" classicSrc={logo} alt="English Quest AI" />
        <p className="eq-adventure-label">O-NET ADVENTURE ป.6</p>
        <h1 id="home-title">ภารกิจพิชิตอังกฤษ</h1>
        <p className="eq-home-lead">เรียนผ่านเกม สะสม XP พิชิต O-NET</p>
        <ul className="eq-chip-row" aria-label="จุดเด่น">
          <li><BookCheck aria-hidden="true" />ติว O-NET ป.6</li>
          <li><Star aria-hidden="true" />สะสม XP</li>
          <li><Award aria-hidden="true" />รับ Badge</li>
        </ul>
        <div className="eq-home-actions">
          <button className="eq-btn eq-start" onClick={onStart}>
            <Sparkles aria-hidden="true" /><span><strong>{demoMode ? 'เริ่มชม Demo' : 'เริ่มผจญภัยกันเลย'}</strong><small>{demoMode ? 'ข้อมูลสังเคราะห์ ไม่บันทึกขึ้นระบบจริง' : 'เข้าเรียนและรับภารกิจของวันนี้'}</small></span><ArrowRight aria-hidden="true" />
          </button>
          <p className="eq-login-note">เข้าเรียนด้วยรหัสโรงเรียน รหัสนักเรียน และ PIN</p>
          <div className="eq-demo-action">
            <button className="eq-btn ghost" onClick={onDemo}><Gamepad2 aria-hidden="true" />ทดลองเล่น</button>
            <small>โหมดทดลอง · ใช้ข้อมูลสังเคราะห์ ไม่บันทึก XP หรือข้อมูลจริง</small>
          </div>
        </div>
      </section>

      <section className="eq-feature-band" aria-label="ฟีเจอร์การเรียนรู้">
        {FEATURES.map(({ Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{text}</p></div></article>)}
      </section>

      <section className="eq-teacher-panel eq-card" aria-labelledby="teacher-title">
        <div>
          <p>สำหรับครูและโรงเรียน</p>
          <h2 id="teacher-title">ติดตามผลของทุกห้องเรียน</h2>
          <span>ดูความก้าวหน้า จุดที่ควรทบทวน และผลการฝึก O-NET ได้ในที่เดียว</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onSchoolApply && (
            <>
              <button
                type="button"
                className="eq-btn"
                style={{ background: '#f59e0b', color: '#020617', fontWeight: 900 }}
                onClick={() => onSchoolApply('school_starter', 'trial')}
              >
                🎁 ทดลองฟรี 15 วัน ยกโรงเรียน
              </button>
              <button
                type="button"
                className="eq-btn ghost"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                onClick={() => onSchoolApply()}
              >
                🏫 ขอใบเสนอราคา
              </button>
            </>
          )}
          <button className="eq-btn ghost" onClick={onTeacher} disabled={demoMode}>
            {demoMode ? 'ปิดใช้งานใน Demo' : 'ดู Teacher Hub'}<ArrowRight aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Pricing 2027 Section */}
      <PricingSection
        onApplySchool={(planId, cycle) => onSchoolApply ? onSchoolApply(planId, cycle) : null}
        onSelectPlan={(plan, cycle) => onSelectPlan ? onSelectPlan(plan, cycle) : (onSchoolApply && onSchoolApply(plan.id, cycle))}
      />

      <footer className="eq-footer">English Quest AI · ภาษาอังกฤษ O-NET ป.6</footer>
    </PageShell>
  );
}
