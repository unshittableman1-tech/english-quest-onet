import { useApp } from '../App';
import Home from '../pages/Home';
import { useState } from 'react';
import CuteUpdateModal from './CuteUpdateModal';
import SchoolApplicationModal from './SchoolApplicationModal';

export default function LandingPage() {
  const { navigate, isDemoMode } = useApp();
  const [warmingUp, setWarmingUp] = useState(false);
  const [applyingSchool, setApplyingSchool] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('student_hero');
  const [selectedCycle, setSelectedCycle] = useState('monthly');

  const handleOpenApplication = (planId = 'student_hero', cycle = 'monthly') => {
    setSelectedPlanId(planId);
    setSelectedCycle(cycle);
    setApplyingSchool(true);
  };

  return <>
    <Home
      demoMode={isDemoMode}
      onStart={() => isDemoMode ? navigate('demo') : setWarmingUp(true)}
      onDemo={() => navigate('demo')}
      onTeacher={() => navigate('teacher-login')}
      onSchoolApply={(planId, cycle) => handleOpenApplication(planId, cycle)}
      onSelectPlan={(plan, cycle) => handleOpenApplication(plan.id, cycle)}
    />
    <CuteUpdateModal
      isOpen={warmingUp}
      onClose={() => setWarmingUp(false)}
      onContinue={() => { setWarmingUp(false); navigate('student-login'); }}
    />
    <SchoolApplicationModal
      isOpen={applyingSchool}
      initialPlanId={selectedPlanId}
      initialCycle={selectedCycle}
      onClose={() => setApplyingSchool(false)}
    />
  </>;
}
