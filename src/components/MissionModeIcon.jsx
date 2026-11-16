import { useState } from 'react';
import { BookOpen, ChartColumn, Gamepad2, Image, LetterText, MessagesSquare, Mic, Pencil, Puzzle, Rows3, ScrollText, Search, Shield, GalleryHorizontalEnd } from 'lucide-react';
import { getMissionArtwork, getMissionModeArtwork } from '../data/missionModeArtwork';

const FALLBACK_ICONS = {
  flashcard: GalleryHorizontalEnd, matching: Puzzle, fill_blank: Pencil,
  conversation: MessagesSquare, story_tap: BookOpen, rearrange: Rows3,
  spell: LetterText, voice: Mic, image_labeling: Image,
  graph_comparison: ChartColumn, quiz: ScrollText, boss: Shield,
  spell_clues: Search,
};

function ArtworkImage({ artwork }) {
  const [failed, setFailed] = useState(false);
  const FallbackIcon = FALLBACK_ICONS[artwork.id] || Gamepad2;
  return !artwork.src || failed
    ? <FallbackIcon className="mission-mode-icon-fallback" size={32} strokeWidth={1.8} />
    : <img src={artwork.src} alt="" width="144" height="144" decoding="async" onError={() => setFailed(true)} />;
}

// Decorative image: the action label is real text on the containing card.
export default function MissionModeIcon({ type, mission }) {
  const artwork = mission ? getMissionArtwork(mission) : getMissionModeArtwork(type);
  return <span className={`mission-mode-icon mission-mode-tone-${artwork.tone}`} data-mission-mode={artwork.id} aria-hidden="true">
    <ArtworkImage key={artwork.id} artwork={artwork} />
  </span>;
}
