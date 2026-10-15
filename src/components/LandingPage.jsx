import { useApp } from '../App';
import Home from '../pages/Home';

export default function LandingPage() {
  const { navigate } = useApp();
  return <Home onStart={() => navigate('student-login')} onDemo={() => navigate('demo')} onTeacher={() => navigate('teacher-login')} />;
}
