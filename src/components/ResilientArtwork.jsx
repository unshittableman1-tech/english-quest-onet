import { useEffect, useState } from 'react';

const retryUrl = source => {
  const separator = source.includes('?') ? '&' : '?';
  return `${source}${separator}eq_asset_retry=1`;
};

export default function ResilientArtwork({ src, alt = '', className = '', fallback = null, eager = false, ...props }) {
  const [attempt, setAttempt] = useState(0);
  useEffect(() => setAttempt(0), [src]);
  if (!src || attempt > 1) return fallback;
  return <img
    {...props}
    className={className}
    src={attempt === 0 ? src : retryUrl(src)}
    alt={alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    onError={() => setAttempt(value => value + 1)}
  />;
}
