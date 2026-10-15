import { ArrowRight, Award, BarChart3, BookCheck, Gamepad2, RotateCcw, School, Sparkles, Star } from 'lucide-react';
import PageShell from '../components/PageShell';
import logo from '../assets/logo.png';

const FEATURES = [
  { Icon: BookCheck, title: 'O-NET Blueprint', text: 'ฝึกครบตามตัวชี้วัดสำคัญ' },
  { Icon: RotateCcw, title: 'ทบทวนข้อผิด', text: 'จำจุดพลาดแล้วฝึกซ้ำอย่างฉลาด' },
  { Icon: BarChart3, title: 'รายงานสำหรับครู', text: 'เห็นความก้าวหน้าของทุกห้องเรียน' },
];

export default function Home({ onStart, onDemo, onTeacher }) {
  return (
    <PageShell className="eq-home" right={<button className="eq-header-teacher" onClick={onTeacher}>เข้าสู่ระบบครู</button>}>
      <section className="eq-home-hero" aria-labelledby="home-title">
        <div className="eq-home-gimmicks" aria-hidden="true">
          <span className="eq-robot-core" />
          <span className="eq-treasure-spark spark-one"><Star /></span>
          <span className="eq-treasure-spark spark-two"><Sparkles /></span>
          <span className="eq-treasure-spark spark-three"><Star /></span>
        </div>
        <img className="eq-home-logo" src={logo} alt="English Quest AI" />
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
            <Sparkles aria-hidden="true" /><span><strong>เริ่มผจญภัยกันเลย</strong><small>เข้าเรียนและรับภารกิจของวันนี้</small></span><ArrowRight aria-hidden="true" />
          </button>
          <div><button className="eq-btn ghost" onClick={onDemo}><Gamepad2 aria-hidden="true" />ทดลองเล่น</button><button className="eq-btn ghost" onClick={onTeacher}><School aria-hidden="true" />เข้าสู่ระบบครู</button></div>
        </div>
        <p className="eq-login-note">เข้าเรียนด้วยรหัสโรงเรียน ชั้น และเลขที่</p>
      </section>

      <section className="eq-feature-band" aria-label="ฟีเจอร์การเรียนรู้">
        {FEATURES.map(({ Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><div><h2>{title}</h2><p>{text}</p></div></article>)}
      </section>

      <section className="eq-teacher-panel eq-card" aria-labelledby="teacher-title">
        <div><p>สำหรับครูและโรงเรียน</p><h2 id="teacher-title">ติดตามผลของทุกห้องเรียน</h2><span>ดูความก้าวหน้า จุดที่ควรทบทวน และผลการฝึก O-NET ได้ในที่เดียว</span></div>
        <button className="eq-btn ghost" onClick={onTeacher}>เข้าสู่ระบบครู<ArrowRight aria-hidden="true" /></button>
      </section>
      <footer className="eq-footer">English Quest AI · ภาษาอังกฤษ O-NET ป.6</footer>
    </PageShell>
  );
}
