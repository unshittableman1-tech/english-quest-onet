import UIIcon, { UIIconText } from '../UIIcon';
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function RankShiftToast({ shift, onClose }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!shift) return;
    
    // Show instantly
    setShow(true);

    if (shift.direction === 'up') {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8, x: 0.8 },
        colors: ['#34d399', '#10b981', '#059669'] // Emerald greens
      });
    }

    // Auto-close after 5 seconds
    const t1 = setTimeout(() => setShow(false), 4500);
    const t2 = setTimeout(onClose, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shift, onClose]);

  if (!shift) return null;

  const isUp = shift.direction === 'up';

  return (
    <div className={`fixed bottom-24 right-4 z-[60] transition-all duration-500 transform ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
      <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[280px] max-w-sm border-2 ${
        isUp 
          ? 'bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border-emerald-500/50' 
          : 'bg-gradient-to-r from-slate-800/90 to-slate-900/90 border-amber-500/30'
      } backdrop-blur-md`}>
        
        <div className={`text-4xl ${isUp ? 'animate-bounce' : 'opacity-80'}`}>
          <UIIconText value={isUp ? '🚀' : '🥺'} />
        </div>
        
        <div className="flex-1">
          <h4 className={`font-bold text-lg leading-tight ${isUp ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isUp ? 'อันดับขึ้นแล้ว!' : 'อันดับตกลงมานิดหน่อย'}
          </h4>
          <p className="text-slate-600 text-sm mt-1">
            <UIIconText value={isUp ? `ตอนนี้คุณอยู่อันดับที่ ${shift.newRank} ของห้อง 🎉` : `ตอนนี้อยู่อันดับ ${shift.newRank} พยายามเข้านะ!`} />
          </p>
        </div>

        <button onClick={() => setShow(false)} className="text-slate-500 hover:text-slate-800 p-1">
          <UIIcon value={"✕"} />
        </button>
      </div>
    </div>
  );
}
