import { useApp } from '../App';
import { QUEST_PALETTES } from '../utils/questPalette';
import ResilientArtwork from './ResilientArtwork';

const NAV_ITEMS = [
  { id: 'map', artwork: '/assets/navigation/quest-nav-3d-v1-128.webp', label: 'แผนที่', english: 'Quest', tone: 'sky' },
  { id: 'vocab-drill', artwork: '/assets/navigation/vocab-nav-3d-v1-128.webp', label: 'คำศัพท์', english: 'Vocab', tone: 'mint' },
  { id: 'review', artwork: '/assets/navigation/review-nav-3d-v1-128.webp', label: 'ทบทวน', english: 'Review', tone: 'rose' },
  { id: 'badge', artwork: '/assets/navigation/badge-nav-3d-v1-128.webp', label: 'เหรียญ', english: 'Badge', tone: 'lilac' },
  { id: 'ranking', artwork: '/assets/ranking/podium-nav-3d-v1.png', label: 'อันดับ', english: 'Ranking', tone: 'peach' },
  { id: 'report', artwork: '/assets/navigation/report-nav-3d-v1-128.webp', label: 'ผลเรียน', english: 'Report', tone: 'mint' },
];

export default function Navigation() {
  const { page, navigate } = useApp();

  return (
    <nav className="nav-bottom" aria-label="เมนูการเรียนของนักเรียน">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          type="button"
          className={`nav-btn ${page === item.id ? 'active' : ''}`}
          style={{ '--nav-ink': QUEST_PALETTES[item.tone].ink, '--nav-soft': QUEST_PALETTES[item.tone].soft }}
          aria-current={page === item.id ? 'page' : undefined}
          aria-label={`${item.label} (${item.english})`}
          onClick={() => navigate(item.id)}
        >
          <ResilientArtwork className="nav-artwork" src={item.artwork} width="38" height="38" alt="" aria-hidden="true" eager fallback={<span className="nav-artwork-fallback" aria-hidden="true">{item.label.slice(0, 1)}</span>} />
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
