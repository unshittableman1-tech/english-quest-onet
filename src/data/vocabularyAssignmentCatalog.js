import { VOCAB_CATEGORIES, getDrillCards } from './vocabDrill';
import { QUEST_VOCABULARY_LINKS } from './questVocabulary';
import { getQuestVocabularyDeck } from './questVocabularyDecks';
import { vocabularyWord, vocabularyWordId } from '../utils/vocabWordEvidence';
import { QUESTS } from './questions';
import { CHAPTER3_LOCAL_MISSIONS } from './chapter3LocalMissions';

export function getVocabularyAssignmentCatalog() {
  const words = new Map();
  const questNames = new Map([...QUESTS, ...CHAPTER3_LOCAL_MISSIONS].map(quest => [quest.id, quest.name]));
  const add = (card, group) => {
    const word = vocabularyWord(card);
    const id = vocabularyWordId(card);
    if (!word || !card.backThai || !id) return;
    if (!words.has(id)) words.set(id, { id, word, meaningTh: card.backThai, groups: [], front: word, frontLabel: word, back: word, backThai: card.backThai, frontType: 'text' });
    const row = words.get(id);
    if (!row.groups.includes(group)) row.groups.push(group);
  };
  for (const category of VOCAB_CATEGORIES) for (const card of getDrillCards(category)) add(card, category.name);
  for (const questId of Object.keys(QUEST_VOCABULARY_LINKS)) for (const card of getQuestVocabularyDeck(questId).cards) add(card, `Quest: ${questNames.get(questId) || questId}`);
  return [...words.values()].sort((first, second) => first.word.localeCompare(second.word, 'en'));
}
