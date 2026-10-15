import UIIcon, { UIIconText } from './UIIcon';
import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function BadgeModal({ badge, badges, onClose }) {
  const [show, setShow] = useState(false);
  const earned = badges?.length ? badges : badge ? [badge] : [];
  const reward = earned.reduce((sum, item) => sum + (Number(item.xpReward) || 0), 0);

  useEffect(() => {
    let frameId;
    // Slight delay for animation
    const timer = setTimeout(() => {
      setShow(true);
      playBadgeSound();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      // Fire confetti
      const duration = 900;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          disableForReducedMotion: true,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        });
        confetti({
          particleCount: 5,
          disableForReducedMotion: true,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        });

        if (Date.now() < end) {
          frameId = requestAnimationFrame(frame);
        }
      };
      frame();
    }, 100);

    return () => { clearTimeout(timer); cancelAnimationFrame(frameId); };
  }, []);

  const playBadgeSound = () => {
    try {
      const audio = new Audio('/sounds/levelup.mp3'); // Reuse level up sound or add a new one
      audio.volume = 0.6;
      audio.play().catch(() => {});
    } catch(e) {}
  };

  if (!badge) return null;

  return (
    <div className="badge-reward fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${show ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        role="dialog" aria-modal="true" aria-labelledby="badge-reward-title"
        className={`relative w-full max-w-sm glass-card border-2 border-amber-300 p-6 text-center shadow-2xl transition-all duration-500 transform animate-bounce-in max-h-[85svh] overflow-y-auto ${
          show ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'
        }`}
      >
        <div className="relative">
          <h2 id="badge-reward-title" className="text-xl font-bold text-amber-800 mb-6">
            {earned.length > 1 ? `ได้รับ ${earned.length} Badge ใหม่!` : 'ได้รับ Badge ใหม่!'}
          </h2>

          <div className="w-24 h-24 mx-auto mb-4 bg-amber-50 border-2 border-amber-300 rounded-full flex items-center justify-center text-5xl shadow-lg">
            <UIIcon value={badge.icon} />
          </div>

          {earned.length > 1 ? <ul className="text-left mb-4 divide-y divide-amber-200">{earned.map(item => <li key={item.id} className="py-3"><strong className="text-amber-800"><UIIcon value={item.icon} /> {item.name}</strong><p className="text-slate-600 text-sm">{item.description}</p></li>)}</ul> : <><h3 className="text-2xl font-black text-amber-800 mb-2">
            {badge.name}
          </h3>

          <p className="text-slate-600 text-sm mb-4">
            {badge.description}
          </p></>}

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl py-2 px-4 mb-6 inline-block">
            <span className="text-emerald-700 font-bold text-lg">+{reward} XP</span>
          </div>

          <button
            onClick={onClose}
            className="btn-primary w-full py-3 text-lg"
          >
            สุดยอด!
          </button>
        </div>
      </div>
    </div>
  );
}
