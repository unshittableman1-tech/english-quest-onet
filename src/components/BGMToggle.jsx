import UIIcon, { UIIconText } from './UIIcon';
import { useState, useEffect } from 'react';
import { toggleBGM } from '../utils/audio';

export default function BGMToggle({ aboveNavigation = false }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    const newState = toggleBGM();
    setIsPlaying(newState);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isPlaying ? 'ปิดเพลงประกอบ' : 'เปิดเพลงประกอบ'}
      aria-pressed={isPlaying}
      className={`bgm-toggle ${aboveNavigation ? 'above-navigation' : ''} fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-2xl z-50 transition-all duration-300 hover:scale-110 active:scale-95 ${
        isPlaying 
          ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-violet-500/50' 
          : 'bg-slate-50 border-2 border-amber-200 text-slate-500 hover:bg-slate-700'
      }`}
      title={isPlaying ? "ปิดเพลงประกอบ" : "เปิดเพลงประกอบ"}
    >
      <UIIconText value={isPlaying ? '🎵' : '🔇'} />
      {isPlaying && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
      )}
    </button>
  );
}
