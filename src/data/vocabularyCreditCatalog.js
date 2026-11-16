// Read-through projection of existing content, not an independently maintained word bank.
import { VOCAB_CATEGORIES, getDrillCards } from './vocabDrill';
import { QUEST_VOCABULARY_LINKS } from './questVocabulary';
import { getQuestVocabularyDeck } from './questVocabularyDecks';
import { getVocabularyAssignmentCatalog } from './vocabularyAssignmentCatalog';
import { VOCAB_DICTIONARY } from './vocab_dictionary';
import { QUESTS } from './questions';
import { getQuestionStimuli, isPracticeQuestionReady } from '../utils/questionMedia';
import { vocabularyWord, vocabularyWordId } from '../utils/vocabWordEvidence';
import { normalizeCreditText, creditFingerprint, questCreditActivityId, segmentCreditText } from '../utils/vocabularyCreditText';
import { hintRevealsAnswer } from '../utils/hintSafety';

export const CREDIT_TRAINING_STEPS = [
  { id: 'study', label: 'เรียนการ์ดให้ครบ' },
  { id: 'memory', label: 'จับคู่ให้ครบ' },
  { id: 'check', label: 'ตรวจความหมายและทบทวนคำที่ยังผิด' },
];
export function buildVocabularyCreditCatalog() {
  const words = getVocabularyAssignmentCatalog();
  const sets = [];
  const addSet = (id, title, cards, missingWords = []) => {
    const unique = new Map();
    for (const card of cards) {
      const wordId = vocabularyWordId(card);
      if (!wordId || !card.backThai || unique.has(wordId)) continue;
      unique.set(wordId, { id: wordId, wordId, front: card.front || vocabularyWord(card), frontType: card.frontType || 'text',
        frontLabel: vocabularyWord(card), back: vocabularyWord(card), backThai: card.backThai,
        image: card.image, imageAlt: card.imageAlt, example: card.example, exampleThai: card.exampleThai, hint: card.hint });
    }
    const list = [...unique.values()];
    sets.push({ id, title, cards: list, missingWords,
      version: `training-v2-${creditFingerprint(JSON.stringify(list.map(card => [card.wordId, card.backThai])))}`,
      steps: CREDIT_TRAINING_STEPS, eligible: list.length >= 2 && missingWords.length === 0 });
  };
  for (const category of VOCAB_CATEGORIES) addSet(`category:${category.id}`, category.name, getDrillCards(category));
  for (const questId of Object.keys(QUEST_VOCABULARY_LINKS)) {
    const deck = getQuestVocabularyDeck(questId);
    addSet(`quest:${questId}`, `ศัพท์ของด่าน ${QUESTS.find(quest => quest.id === questId)?.name || questId}`, deck.cards, deck.missingWords);
  }

  const byForm = new Map();
  const addMeaning = (form, meaningTh, wordId = null) => {
    const key = normalizeCreditText(form);
    if (!key || !/[a-z]/i.test(key) || !meaningTh) return;
    if (!byForm.has(key)) byForm.set(key, { form: key, meanings: new Set(), wordIds: new Set() });
    byForm.get(key).meanings.add(meaningTh);
    if (wordId) byForm.get(key).wordIds.add(wordId);
  };
  for (const word of words) addMeaning(word.word, word.meaningTh, word.id);
  for (const [form, meaning] of Object.entries(VOCAB_DICTIONARY)) addMeaning(form, meaning);
  const glosses = new Map();
  const makeGloss = (form, meanings, wordIds) => {
    const meaningTh = [...new Set(meanings)].join(' / ');
    const id = `gloss:${creditFingerprint(JSON.stringify([form, meaningTh, [...wordIds].sort()]))}`;
    if (glosses.has(id) && JSON.stringify(glosses.get(id).wordIds) !== JSON.stringify([...wordIds])) throw Error('Gloss ID collision');
    const gloss = { id, form, meaningTh, wordIds: [...wordIds], source: 'existing-vocabulary-and-dictionary' };
    glosses.set(id, gloss); return { id, form };
  };
  const globalTerms = [...byForm.values()].map(row => makeGloss(row.form, [...row.meanings], [...row.wordIds]));
  const activities = {};
  function addActivity(activity, preferredCards = [], vocab = {}, blockedMeanings = []) {
    const terms = new Map(globalTerms.map(term => [term.form, term]));
    for (const card of preferredCards) terms.set(normalizeCreditText(vocabularyWord(card)), makeGloss(normalizeCreditText(vocabularyWord(card)), [card.backThai], [vocabularyWordId(card)]));
    for (const [form, meaning] of Object.entries(vocab || {})) {
      if (typeof meaning === 'string') terms.set(normalizeCreditText(form), makeGloss(normalizeCreditText(form), [meaning], []));
    }
    const texts = activity.texts.filter(text => typeof text === 'string');
    const inActivity = new Map();
    for (const text of texts) {
      for (const part of segmentCreditText(text, [...terms.values()])) if (part.term) inActivity.set(part.term.form, part.term);
      for (const word of text.match(/[a-z]+(?:['’][a-z]+)?/gi) || []) {
        const form = normalizeCreditText(word);
        inActivity.set(form, terms.get(form) || { id: `missing:${form}`, form, missing: true });
      }
    }
    const usableTerms = [...inActivity.values()].filter(term => !hintRevealsAnswer(glosses.get(term.id)?.meaningTh, blockedMeanings));
    activities[activity.id] = { ...activity, terms: usableTerms,
      version: `gloss-v2-${creditFingerprint(JSON.stringify([texts, usableTerms]))}` };
  }
  const travelCards = sets.find(set => set.id === 'quest:vocabulary')?.cards || [];
  addActivity({ id: 'travel-reading-v2', kind: 'practice', title: 'ลองใช้แต้มกับคำที่ต้องการแปล',
    texts: ['Mali takes a bus to the airport.', 'Her brother travels by train.'] }, travelCards);
  addActivity({ id: 'travel-assessment-v2', kind: 'assessment', title: 'โหมดประเมิน', texts: ['Her brother travels by train.'] });
  for (const quest of QUESTS.filter(row => !row.isExam && row.id !== 'finalboss')) {
    const cards = sets.find(set => set.id === `quest:${quest.id}`)?.cards || [];
    for (const question of (quest.questions || []).filter(isPracticeQuestionReady)) {
      const texts = [question.question, ...(question.options || question.choices || []), question.reasonQuestion, ...(question.reasonChoices || [])];
      for (const stimulus of getQuestionStimuli(question)) {
        if (stimulus.type === 'passage') texts.push(stimulus.title, stimulus.text);
        if (stimulus.type === 'sequence') texts.push(stimulus.title, ...stimulus.steps);
        if (stimulus.type === 'table') texts.push(stimulus.title, ...stimulus.columns, ...stimulus.rows.flat().map(String));
      }
      addActivity({ id: questCreditActivityId(quest.id, question), kind: 'practice', title: quest.name, texts }, cards, question.vocab, question.options || question.choices || []);
    }
  }
  return { version: 2, words, sets, glosses: [...glosses.values()], activities };
}
