import { GraduationCap, Home } from 'lucide-react';
import EnglishQuestLogo from './EnglishQuestLogo';
import { useApp } from '../../App';

export default function LandingNavbar() {
  const { navigate } = useApp();
  return (
    <nav className="landing-nav" aria-label="เมนูหลัก">
      <div className="landing-nav-inner">
        <button onClick={() => navigate('landing')} className="landing-nav-brand" aria-label="English Quest AI หน้าหลัก"><EnglishQuestLogo size="compact" /></button>
        <span className="landing-nav-current" aria-current="page"><Home size={19} aria-hidden="true" />หน้าหลัก</span>
        <button onClick={() => navigate('teacher-login')} className="landing-nav-teacher"><GraduationCap size={18} aria-hidden="true" /><span>เข้าสู่ระบบครู</span></button>
      </div>
    </nav>
  );
}
