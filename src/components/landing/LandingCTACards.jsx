import { ArrowRight, Gamepad2, Backpack, GraduationCap } from 'lucide-react';
import { useApp } from '../../App';

export default function LandingCTACards() {
  const { navigate } = useApp();
  return (
    <div className="landing-cta-group">
      <button onClick={() => navigate('student-login')} className="landing-primary-action" aria-label="เริ่มเรียน">
        <Backpack className="landing-action-icon" size={30} aria-hidden="true" />
        <span className="landing-action-copy"><strong>เริ่มผจญภัยกันเลย</strong><span>เข้าเรียนด้วยรหัสโรงเรียน</span></span>
        <ArrowRight className="landing-action-arrow" size={24} aria-hidden="true" />
      </button>
      <div className="landing-secondary-actions">
        <button onClick={() => navigate('demo')}><Gamepad2 size={20} aria-hidden="true" />ทดลองเล่น</button>
        <button onClick={() => navigate('teacher-login')}><GraduationCap size={20} aria-hidden="true" />เข้าสู่ระบบครู</button>
      </div>
    </div>
  );
}
