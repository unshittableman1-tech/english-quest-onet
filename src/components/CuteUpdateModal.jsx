import { useEffect, useRef, useState } from 'react';
import OnboardingDialog from './OnboardingDialog';

export default function CuteUpdateModal({ isOpen, onClose, onContinue }) {
  const [preparing, setPreparing] = useState(false);
  const timer = useRef(null);
  useEffect(() => {
    setPreparing(false);
    return () => clearTimeout(timer.current);
  }, [isOpen]);
  if (!isOpen) return null;
  const handleUpdate = () => {
    if (preparing) return;
    setPreparing(true);
    timer.current = setTimeout(() => {
      setPreparing(false);
      onContinue?.();
    }, 1500);
  };
  return <OnboardingDialog titleId="warmup-title" className="warmup-card" onDismiss={preparing ? undefined : onClose}>
    <div className="warmup-art" aria-hidden="true">
      <img src="/assets/onboarding/adventure-pack-v1.png" alt="" />
    </div>
    <h2 id="warmup-title">{preparing ? 'กำลังเติมพลังระบบ...' : 'ชาร์จพลังก่อนเริ่มเควสต์!'}</h2>
    <p className="warmup-description">เตรียมรหัสโรงเรียน รหัสนักเรียน และ PIN<br className="warmup-break" /> แล้วไปเริ่มการผจญภัยกันเลย</p>
    <button className="eq-btn onboarding-action" disabled={preparing} onClick={handleUpdate} aria-busy={preparing}>
      {preparing ? 'กำลังเข้าสู่หน้าล็อกอิน...' : 'ไปหน้าเข้าสู่ระบบ'}
    </button>
    {preparing && <p className="onboarding-status" role="status">เตรียมหน้าล็อกอิน กรุณารอสักครู่</p>}
    {!preparing && onClose && <button className="onboarding-skip" onClick={onClose}>กลับหน้าหลัก</button>}
  </OnboardingDialog>;
}
