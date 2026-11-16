import React from 'react';

export default function TierArtwork({ tier, className = '', decorative = false }) {
  if (!tier?.artwork) return null;
  return (
    <img
      src={tier.artwork}
      alt={decorative ? '' : `ตรา Rank ${tier.name}`}
      aria-hidden={decorative ? 'true' : undefined}
      className={`tier-artwork ${className}`}
    />
  );
}
