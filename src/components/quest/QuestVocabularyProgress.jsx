import { getQuestVocabularyDeck } from '../../data/questVocabularyDecks';
import { evidenceOwner, readWordEvidence, summarizeWords } from '../../utils/vocabWordEvidence';
import { vocabularyCreditsPilotEnabled } from '../../utils/vocabularyCreditsPilot';
import useVocabularyCreditAccount from '../../hooks/useVocabularyCreditAccount';

export default function QuestVocabularyProgress({ questId, student }) {
  const deck = getQuestVocabularyDeck(questId);
  const credits = useVocabularyCreditAccount({ enabled: vocabularyCreditsPilotEnabled(student) });
  const training = credits.state?.sets.find(set => set.id === 'quest:' + questId);
  if (!deck) return null;
  const summary = summarizeWords(readWordEvidence(evidenceOwner(student)), deck.cards);
  return <small>มีการ์ดฝึก {deck.cards.length}/{deck.words.length} คำ · ตอบถูกในแบบฝึก {summary.recognized}/{summary.total} คำ{training && <span> · ฝึกครบ {training.steps.filter(step => step.completed).length}/3 ขั้น {training.complete ? '✓ รับแต้มชุดนี้แล้ว' : ''}</span>}{deck.missingWords.length > 0 && <span> · กำลังเตรียมการ์ด: {deck.missingWords.join(', ')}</span>}</small>;
}
