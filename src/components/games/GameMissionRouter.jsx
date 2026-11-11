import UIIcon, { UIIconText } from '../UIIcon';
import FlashcardGame from './FlashcardGame';
import MatchingGame from './MatchingGame';
import FillBlankGame from './FillBlankGame';
import ConvoGame from './ConvoGame';
import StoryTapGame from './StoryTapGame';
import RearrangeGame from './RearrangeGame';
import VoiceGame from './VoiceGame';
import SpellGame from './SpellGame';
import LabelingGame from './LabelingGame';
import GraphComparisonGame from './GraphComparisonGame';
import { TECHNIQUE_CARDS } from '../../data/missions/ch1_missions';

// ── GameMissionRouter ──────────────────────────────────────────
// Routes to the correct game component based on mission.type
// Props:
//   mission: the mission object with { type, ... }
//   onComplete: (xpEarned) => void
//   onBack: () => void

export default function GameMissionRouter({ mission, onComplete, onBack }) {
  if (!mission) return null;

  const techniqueCard = mission.techniqueCard ? TECHNIQUE_CARDS[mission.techniqueCard] : null;

  const props = { mission, onComplete, onBack };

  switch (mission.type) {
    case 'graph_comparison':
      return <GraphComparisonGame mission={mission} onBack={onBack} />;
    case 'image_labeling':
      return <LabelingGame mission={mission} onBack={onBack} />;
    case 'flashcard':
      return <FlashcardGame {...props} techniqueCard={techniqueCard} />;
    case 'matching':
      return <MatchingGame {...props} />;
    case 'fill_blank':
      return <FillBlankGame {...props} />;
    case 'conversation':
      return <ConvoGame {...props} />;
    case 'story_tap':
      return <StoryTapGame {...props} />;
    case 'rearrange':
      return <RearrangeGame {...props} />;
    case 'voice':
      return <VoiceGame {...props} />;
    case 'spell':
      return <SpellGame {...props} />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center">
            <div className="text-4xl mb-4"><UIIcon value={"🎮"} /></div>
            <p className="text-slate-800 font-bold">Unknown mission type: {mission.type}</p>
            <button onClick={onBack} className="mt-4 btn-ghost"><UIIcon value={"←"} /> กลับ</button>
          </div>
        </div>
      );
  }
}
