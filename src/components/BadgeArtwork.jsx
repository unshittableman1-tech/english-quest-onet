import { BADGES } from '../data/badges';

const BADGE_INDEX = new Map(BADGES.map((badge, index) => [badge.id, index]));
const ATLAS_COLUMNS = 7;
const ATLAS_ROWS = 6;

export default function BadgeArtwork({ badgeId, className = '', label }) {
  const index = BADGE_INDEX.get(badgeId) ?? 0;
  const column = index % ATLAS_COLUMNS;
  const row = Math.floor(index / ATLAS_COLUMNS);
  const style = {
    '--badge-atlas-x': `${(column / (ATLAS_COLUMNS - 1)) * 100}%`,
    '--badge-atlas-y': `${(row / (ATLAS_ROWS - 1)) * 100}%`,
    backgroundImage: "url('/assets/badges/achievement-medals-v1.png')",
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${ATLAS_COLUMNS * 100}% ${ATLAS_ROWS * 100}%`,
    backgroundPosition: 'var(--badge-atlas-x) var(--badge-atlas-y)',
  };

  return (
    <span
      className={`badge-artwork ${className}`.trim()}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    />
  );
}
