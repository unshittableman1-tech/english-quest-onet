import { useEffect, useRef, useState } from 'react';
import { Check, LoaderCircle } from 'lucide-react';
import { STREAK_REWARDS, getStreakReward } from '../utils/scoring';
import OnboardingDialog from './OnboardingDialog';

export default function DailyRewardModal({ streakDays = 1, loading = false, error: statusError = '', onClaim, onComplete, onRetry, onSkip }) {
  const [pending, setPending] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const day = ((Math.max(1, streakDays) - 1) % 7) + 1;
  const reward = getStreakReward(streakDays);
  const handleClaim = async () => {
    if (busy.current || claimed || loading) return;
    busy.current = true; setPending(true); setError('');
    try {
      const receipt = await onClaim();
      if (!alive.current) return;
      setClaimed(true);
      await new Promise(resolve => setTimeout(resolve, 450));
      if (alive.current) onComplete(receipt);
    } catch (caught) {
      if (alive.current) setError(caught.message || 'รับรางวัลไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      busy.current = false;
      if (alive.current) setPending(false);
    }
  };
  const statusKnown = !loading && !statusError;
  return <OnboardingDialog titleId="daily-reward-title" className="daily-reward-card">
    <div className="daily-reward-hero" aria-hidden="true"><img src="/assets/onboarding/daily-treasure-v1.png" alt="" /></div>
    <h2 id="daily-reward-title">เช็คอินรับพลังวันนี้!</h2>
    <p className="daily-reward-intro">แวะมาทุกวัน แล้วเก็บรางวัลระหว่างทาง</p>
    <div className="onboarding-day-heading">{statusKnown ? `วันที่ ${day}` : statusError ? 'ยังตรวจสอบวันเช็กอินไม่ได้' : 'กำลังตรวจสอบวันเช็กอิน'}</div>
    <div className="onboarding-days" aria-label="รางวัลเช็คอิน 7 วัน">
      {STREAK_REWARDS.map((item, index) => <div key={index} className={`onboarding-day ${statusKnown && index + 1 === day ? 'is-current' : statusKnown && index + 1 < day ? 'is-done' : ''}`} aria-current={statusKnown && index + 1 === day ? 'step' : undefined}>
        <span>วันที่ {index + 1}</span><span className="onboarding-day-circle">{statusKnown && index + 1 < day ? <Check size={16} aria-hidden="true" /> : index + 1}</span><strong>+{item.xp} XP</strong>
      </div>)}
    </div>
    <div className="onboarding-reward"><span>รางวัลเช็กอินวันนี้</span><strong>{statusKnown ? `+${reward.xp} XP` : 'รอตรวจสอบ'}</strong></div>
    {(error || statusError) && <p className="onboarding-error" role="alert">{error || statusError}</p>}
    {statusError ? <button className="eq-btn onboarding-action" onClick={() => { setError(''); onRetry(); }}>ลองตรวจรางวัลอีกครั้ง</button>
      : <button className="eq-btn onboarding-action claim" disabled={pending || claimed || loading} onClick={handleClaim} aria-busy={pending || loading}>
        {claimed ? <><Check size={20} aria-hidden="true" />รับแล้ว!</> : pending ? 'กำลังรับรางวัล...' : loading ? <><LoaderCircle size={20} aria-hidden="true" />กำลังตรวจรางวัล...</> : 'รับรางวัล!'}
      </button>}
    <p className="onboarding-status" role="status">{claimed ? 'บันทึกรางวัลเรียบร้อยแล้ว' : 'รับได้วันละ 1 ครั้ง · เช็คอินต่อเนื่องเพื่อรับรางวัลเพิ่ม'}</p>
    {!pending && !claimed && <button className="onboarding-skip" onClick={onSkip}>ไว้รับภายหลัง · เริ่มเรียนก่อน</button>}
  </OnboardingDialog>;
}
