import React from 'react';
import TierArtwork from './TierArtwork';

export default function TierBadge({ tier, onClick, className = '' }) {
  if (!tier) return null;

  const content = <>
    <TierArtwork tier={tier} className="tier-artwork-badge" />
    <span className={`text-xs font-black ${tier.color}`}>{tier.name}</span>
  </>;

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 shadow-sm transition-transform hover:scale-105 active:scale-95 ${className}`}
      aria-label={`ดูรายละเอียด Tier ${tier.name}`}
    >
      {content}
    </button>
  ) : (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 shadow-sm ${className}`}>
      {content}
    </span>
  );
}
