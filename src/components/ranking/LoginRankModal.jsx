import OnboardingDialog from '../OnboardingDialog';

export default function LoginRankModal({ rank, total, loading = false, onClose, open = false }) {
  if (!open && rank == null) return null;
  const validRank = Number.isInteger(rank) && rank > 0 && Number.isInteger(total) && total >= rank;
  return <OnboardingDialog titleId="rank-welcome-title" className="welcome-adventure-card" onDismiss={onClose}>
    <div className="welcome-adventure-art" aria-hidden="true"><img src="/assets/onboarding/welcome-compass-v1.png" alt="" /></div>
    <h2 id="rank-welcome-title">ยินดีต้อนรับกลับมา!</h2>
    <p className="welcome-adventure-intro">พร้อมออกเดินทางไปด้วยกันอีกครั้งไหม?</p>
    <div className="rank-welcome-score">
      <p>อันดับของคุณในห้องเรียน</p>
      {loading ? <p role="status">กำลังโหลดอันดับของคุณ...</p> : validRank ? <div><strong>{rank}</strong><span>/ {total}</span></div> : <p role="status">ยังโหลดอันดับไม่ได้ในขณะนี้<br />เริ่มเรียนและสะสม XP ต่อได้เลย</p>}
    </div>
    <p className="rank-welcome-message">{validRank && !loading && rank === 1 ? 'ยอดเยี่ยม! คุณคือที่ 1 ของห้อง รักษาตำแหน่งไว้นะ!'
      : !loading && rank <= 3 && validRank ? 'เก่งมาก! คุณอยู่ใน Top 3 ของห้องแล้ว!'
      : 'ลุยต่อไป! ทำภารกิจเพื่อสะสม XP และไต่อันดับขึ้นไปอีก!'}</p>
    <button className="eq-btn onboarding-action" onClick={onClose}>เริ่มผจญภัยต่อ</button>
  </OnboardingDialog>;
}
