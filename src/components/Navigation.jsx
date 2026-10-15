import UIIcon, { UIIconText } from './UIIcon';
import { useApp } from '../App';
import { QUEST_PALETTES } from '../utils/questPalette';

const NAV_ITEMS = [
  { id: 'map',    icon: '🗺️', label: 'Quest', tone: 'sky' },
  { id: 'review', icon: '🧠', label: 'Review', tone: 'rose' },
  { id: 'badge',  icon: '🏅', label: 'Badge', tone: 'lilac' },
  { id: 'ranking', icon: '🏆', label: 'Ranking', tone: 'peach' },
  { id: 'report', icon: '📊', label: 'Report', tone: 'mint' },
];

export default function Navigation() {
  const { page, navigate } = useApp();

  return (
    <nav className="nav-bottom">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-btn ${page === item.id ? 'active' : ''}`}
          style={{ '--nav-ink': QUEST_PALETTES[item.tone].ink, '--nav-soft': QUEST_PALETTES[item.tone].soft }}
          aria-current={page === item.id ? 'page' : undefined}
          onClick={() => navigate(item.id)}
        >
          <span className="text-xl"><UIIcon value={item.icon} /></span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
