import UIIcon, { UIIconText } from '../UIIcon';
import React from 'react';

export default function TierBadge({ tier, onClick, className = '' }) {
  if (!tier) return null;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 shadow-sm transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <span className="text-lg drop-shadow-sm"><UIIcon value={tier.icon} /></span>
      <span className={`text-xs font-black ${tier.color}`}>{tier.name}</span>
    </button>
  );
}
