import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Rocket, Star, X } from 'lucide-react';

export default function LoginRankModal({ rank, total, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (rank == null) return; // Check for both null and undefined
    
    // Slight delay for animation
    const t = setTimeout(() => {
      setShow(true);
      
      // Fire confetti if rank is high (Top 3)
      if (rank <= 3) {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.38 },
          colors: ['#f59e0b', '#fbbf24', '#fcd34d'] // Gold/Yellow
        });
      } else {
        // Normal confetti
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.38 }
        });
      }
    }, 100);

    return () => clearTimeout(t);
  }, [rank]);

  if (rank == null) return null;

  return (
    <div className={`rank-welcome-back ${show ? 'is-visible' : ''}`} role="dialog" aria-modal="true" aria-labelledby="rank-welcome-title">
      <div className="rank-welcome-card">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="rank-welcome-close"
          aria-label="ปิด"
        >
          <X aria-hidden="true" />
        </button>

        <div className="rank-welcome-content">
          <span className="rank-welcome-star"><Star aria-hidden="true" /></span>
          <h2 id="rank-welcome-title">ยินดีต้อนรับกลับมา!</h2>
          <div className="rank-welcome-score">
            <p>อันดับของคุณในห้องเรียน</p>
            <div><strong>{rank}</strong><span>/ {total}</span></div>
          </div>
          <p className="rank-welcome-message">
            {rank === 1 ? 'ยอดเยี่ยม! คุณคือที่ 1 ของห้อง รักษาตำแหน่งไว้นะ!' 
             : rank <= 3 ? 'เก่งมาก! คุณอยู่ใน Top 3 ของห้องแล้ว!'
             : 'ลุยต่อไป! ทำภารกิจเพื่อสะสม XP และไต่อันดับขึ้นไปอีก!'}
          </p>
          <button onClick={onClose} className="eq-btn rank-welcome-action">เริ่มผจญภัยต่อ <Rocket aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}
