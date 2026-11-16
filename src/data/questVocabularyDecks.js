import { getQuestVocabulary, QUEST_VOCABULARY_LINKS } from './questVocabulary';
import { VOCAB_CATEGORIES, getDrillCards } from './vocabDrill';
import { vocabularyWord } from '../utils/vocabWordEvidence';
import { QUEST_CORE_CARDS, QUEST_CORE_CONTEXT_CARDS } from './questCoreVocabulary';
import { CH1_MISSIONS } from './missions/ch1_missions';
import { CH2_MISSIONS } from './missions/ch2_missions';
import { CH3_MISSIONS } from './missions/ch3_missions';
import { CH5_MISSIONS } from './missions/ch5_missions';

const normalized = value => String(value).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9'\s-]/g, '').replace(/\s+/g, ' ').trim();
const aliases = { favorite: 'favourite' };
function matches(card, word) {
  const target = normalized(aliases[word] || word);
  const alternatives = [vocabularyWord(card), card.back, card.frontLabel].filter(Boolean).flatMap(value => value.split(/\s*\/\s*|\s*=\s*/));
  return alternatives.some(value => normalized(value.replace(/[^a-zA-Z0-9'’\s-]/g, '')) === target);
}
export function getQuestVocabularyDeck(questId) {
  const link = getQuestVocabulary(questId);
  if (!link) return null;
  const primary = VOCAB_CATEGORIES.find(category => category.id === link.categoryId);
  const primaryCards = primary ? getDrillCards(primary) : [];
  const missionCards = [CH1_MISSIONS, CH2_MISSIONS, CH3_MISSIONS, CH5_MISSIONS].flatMap(catalog => (catalog[questId] || []).flatMap(mission => (mission.cards || []).map(card => ({ ...card, originMissionId: mission.id }))));
  const all = VOCAB_CATEGORIES.flatMap(category => getDrillCards(category).map(card => ({ ...card, originCategoryId: category.id })));
  const cards = link.words.map(word => {
    const card = (QUEST_CORE_CONTEXT_CARDS[questId] || []).find(item => matches(item, word))
      || primaryCards.find(item => matches(item, word))
      || missionCards.find(item => matches(item, word))
      || QUEST_CORE_CARDS.find(item => matches(item, word))
      || all.find(item => matches(item, word));
    if (!card) return null;
    const projection = normalized(vocabularyWord(card)) !== normalized(aliases[word] || word)
      ? { front: word, frontLabel: word, frontType: 'text', back: word }
      : {};
    return { ...card, frontLabel: card.frontLabel || vocabularyWord(card), ...projection, linkedWord: word };
  }).filter(Boolean);
  return { ...link, questId, category: primary, cards, missingWords: link.words.filter(word => !cards.some(card => card.linkedWord === word)) };
}
export function auditQuestVocabulary() {
  return Object.keys(QUEST_VOCABULARY_LINKS).map(questId => {
    const deck = getQuestVocabularyDeck(questId);
    return { questId, categoryId: deck.categoryId, requested: deck.words.length, available: deck.cards.length, missingWords: deck.missingWords };
  });
}
