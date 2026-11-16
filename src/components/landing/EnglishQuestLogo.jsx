import ThemeImage from '../../themes/ThemeImage';
export default function EnglishQuestLogo({ size = 'large' }) {
  const widths = { large: 500, small: 180, compact: 144 };
  return <ThemeImage assetKey="logo" classicSrc="/assets/english-quest-ai-logo-v1.png" alt="English Quest AI" width="1942" height="809" decoding="async" style={{ display: 'block', width: widths[size] || widths.large, maxWidth: '100%', height: 'auto', objectFit: 'contain', flexShrink: 0 }} />;
}
