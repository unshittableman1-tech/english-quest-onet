import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const { VOCAB_CATEGORIES, VOCAB_GROUPS, getDrillMission, getDrillCards } = await import('../src/data/vocabDrill.js');
const { VOCAB_CATEGORY_ARTWORK, getVocabCategoryArtwork } = await import('../src/data/vocabCategoryArtwork.js');
const { QUESTS, preTestQuestions } = await import('../src/data/questions.js');
const hasCategoryVisual = (card, category) => Boolean(card.imageAlt && (
  card.image?.startsWith(`/learning/${category}/`) || card.image?.startsWith('/learning/vocab-supplemental/')
));
test('every Vocab Drill category uses an existing illustrated PNG thumbnail', async () => {
  assert.equal(Object.keys(VOCAB_CATEGORY_ARTWORK).length, VOCAB_CATEGORIES.length);
  for (const category of VOCAB_CATEGORIES) {
    const artwork = getVocabCategoryArtwork(category.id);
    assert.match(artwork, /\.png$/);
    await access(fileURLToPath(new URL(`../public${artwork}`, import.meta.url)));
  }
});
test('54 vocab categories resolve exact decks without an unrelated mission fallback', () => {
  assert.equal(VOCAB_CATEGORIES.length, 54);
  assert.equal(new Set(VOCAB_CATEGORIES.map(c => c.id)).size, 54);
  for (const cat of VOCAB_CATEGORIES) {
    assert.ok(VOCAB_GROUPS.some(g => g.id === cat.group));
    const mission = getDrillMission(cat);
    assert.ok(mission, cat.id);
    if (!cat.deckId) assert.equal(mission.id, cat.missionId);
    const cards = getDrillCards(cat);
    assert.ok(cards.length >= 2, `${cat.id} must contain at least 2 cards for game choices`);
    assert.equal(new Set(cards.map(c => c.id)).size, cards.length, cat.id);
    for (const c of cards) assert.ok((c.frontLabel || c.back) && c.back && c.backThai, `${cat.id}: ${c.id}`);
  }
  assert.equal(getDrillMission({ questId: 'vocabulary', missionId: 'missing' }), null);
  assert.deepEqual(getDrillCards({ deckId: 'missing' }), []);
  const food = getDrillCards(VOCAB_CATEGORIES.find(c => c.id === 'food'));
  assert.equal(food[0].back, 'Fried rice');
  assert.equal(food[0].backThai, 'ข้าวผัด');
});
test('career flashcards label the illustrated occupation rather than its workplace', () => {
  const cards = getDrillCards(VOCAB_CATEGORIES.find(c => c.id === 'jobs'));
  const words = ['doctor', 'teacher', 'pilot', 'chef', 'librarian', 'firefighter', 'vet', 'postman'];
  assert.deepEqual(cards.slice(0, 8).map(c => c.front), words);
  assert.deepEqual(cards.slice(0, 8).map(c => c.back), words);
  assert.equal(cards[0].hint, 'สถานที่ทำงาน: hospital');
  assert.equal(cards[2].hint, 'สถานที่ทำงาน: airport');
});
test('country flashcards explicitly distinguish countries and nationalities without flag glyphs', () => {
  const cards = getDrillCards(VOCAB_CATEGORIES.find(c => c.id === 'countries'));
  assert.deepEqual(cards.slice(0, 6).map(c => c.front), ['Thailand', 'Japan', 'China', 'Korea', 'England', 'America']);
  assert.deepEqual(cards.slice(0, 6).map(c => c.back), ['Thai', 'Japanese', 'Chinese', 'Korean', 'English / British', 'American']);
  assert.ok(cards.slice(0, 6).every(c => c.frontCaption === 'ประเทศ (Country)' && c.backCaption === 'สัญชาติ (Nationality)'));
  assert.ok(cards.every(c => !/\p{Regional_Indicator}/u.test(c.front + c.back)));
});
test('Culture and Festivals deck covers requested dates, activities and symbols as learning-only vocabulary', () => {
  const category = VOCAB_CATEGORIES.find(c => c.id === 'culture_festivals');
  const mission = getDrillMission(category);
  const cards = getDrillCards(category);
  assert.equal(mission.assessmentEligible, false);
  assert.equal(mission.curriculumStandard, 'ต 2.1');
  assert.equal(cards.length, 31);
  assert.ok(cards.every(c => c.standard === 'ต 2.1' && c.learningOnly && c.example && c.exampleThai));
  const words = new Set(cards.map(c => c.back));
  for (const expected of ['Halloween', 'October 31st', 'trick or treat', 'jack-o’-lantern', 'Christmas Day', 'December 25th', 'candy cane', 'Valentine’s Day', 'February 14th', 'Songkran Day', 'scented water', 'Loy Krathong Day', 'full moon', 'joss sticks', 'Mother’s Day', 'jasmine', 'Happy New Year!']) {
    assert.ok(words.has(expected), expected);
  }
});
test('Culture and Festivals deck exposes a reviewed visual for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'culture_festivals');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 31);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/culture_festivals/') && card.imageAlt));
});
test('new action and routine decks have distinct meanings, bilingual examples and learning-only provenance', () => {
  for (const [id, size] of [['verbs', 12], ['daily_routine', 10]]) {
    const category = VOCAB_CATEGORIES.find(c => c.id === id);
    const mission = getDrillMission(category);
    const cards = getDrillCards(category);
    assert.equal(cards.length, size);
    assert.equal(mission.assessmentEligible, false);
    assert.equal(mission.contentStatus, 'authored_learning');
    assert.equal(new Set(cards.map(c => c.backThai)).size, size);
    for (const c of cards) assert.ok(c.example && c.exampleThai && c.frontType === 'text');
    cards[0].back = 'changed';
    assert.notEqual(getDrillCards(category)[0].back, 'changed');
  }
  const routine = getDrillCards(VOCAB_CATEGORIES.find(c => c.id === 'daily_routine'));
  assert.notEqual(routine.find(c => c.back === 'wake up').backThai, routine.find(c => c.back === 'get up').backThai);
  const illustrated = ['verbs', 'daily_routine'].flatMap(id => getDrillCards(VOCAB_CATEGORIES.find(c => c.id === id)));
  assert.equal(illustrated.filter(c => c.image).length, 22);
  assert.equal(new Set(illustrated.map(c => c.image)).size, 22);
  for (const c of illustrated) {
    const png = readFileSync(`public${c.image}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(c.imageAlt && c.illustrationReview === 'technical_check_only' && c.illustrationVersion === 'vocab-illustrations-v1');
  }
  assert.equal(QUESTS.length, 36);
  assert.equal(preTestQuestions.length, 20);
});
test('transport and place legacy decks expose complete reviewed illustration metadata', () => {
  const expected = { transport: 12, place: 10 };
  const illustrated = Object.entries(expected).flatMap(([id, size]) => {
    const category = VOCAB_CATEGORIES.find(c => c.id === id);
    const cards = getDrillCards(category);
    assert.equal(cards.length, size);
    return cards;
  });
  assert.equal(illustrated.length, 22);
  assert.equal(new Set(illustrated.map(c => c.image)).size, 22);
  for (const c of illustrated.slice(0, 20)) {
    const png = readFileSync(`public${c.image}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(c.imageAlt);
    assert.equal(c.illustrationReview, 'technical_check_only');
    assert.equal(c.illustrationVersion, 'vocab-legacy-batch3-v1');
    assert.equal(c.illustrationSource, 'md/Vocab Illustration Generation Batch 3.json');
  }
});

test('illness deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'illness');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/illness/') && card.imageAlt));
});

test('career deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'jobs');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'jobs')));
});
test('food deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'food');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'food')));
});
test('clothes deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'clothes');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'clothes')));
});
test('weather deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'weather');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'weather')));
});
test('emotions deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'emotions');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'emotions')));
});
test('countries deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'countries');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'countries')));
});
test('shapes deck exposes one exact visual asset for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'shapes');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'shapes')));
});
test('environment deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'environment');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'environment')));
});
test('subjects deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'subjects');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'subjects')));
});
test('signs deck exposes one exact symbol asset for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'signs');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/signs/') && card.imageAlt));
});
test('directions deck exposes one exact positional diagram for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'directions');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 12);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/directions/') && card.imageAlt));
});
test('greeting deck exposes one transparent situation illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'greeting');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'greeting')));
});
test('question word deck exposes one semantic diagram for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'question_words');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/question_words/') && card.imageAlt));
});
test('tenses deck exposes one timeline diagram for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'tenses');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.every(card => hasCategoryVisual(card, 'tenses')));
});
test('remaining grammar decks expose a visual for every learning card', () => {
  const expected = { numbers: 10, pronouns: 10, quantifiers: 10 };
  for (const [id, count] of Object.entries(expected)) {
    const category = VOCAB_CATEGORIES.find(item => item.id === id);
    const cards = getDrillCards(category);
    assert.equal(cards.length, count);
    assert.ok(cards.every(card => hasCategoryVisual(card, id)));
  }
});
test('ordinal cards use a distinct position visual for every number', async () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'numbers');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.equal(new Set(cards.map(card => card.image)).size, 10);
  for (const [index, card] of cards.entries()) {
    assert.match(card.image, new RegExp(`/ordinal-${index + 1}(?:st|nd|rd|th)-v1\\.svg$`));
    await access(fileURLToPath(new URL(`../public${card.image}`, import.meta.url)));
  }
});
test('pronoun deck uses the dedicated transparent cartoon PNG set', async () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'pronouns');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 10);
  assert.ok(cards.slice(0, 7).every(card => /^\/learning\/pronouns\/[a-z]+-v2\.png$/.test(card.image)));

  await Promise.all(cards.map(card => access(fileURLToPath(new URL(`../public${card.image}`, import.meta.url)))));
});
test('illustrated cards retain their visuals and explicit text decks have accessible word labels', async () => {
  let total = 0;
  for (const category of VOCAB_CATEGORIES) {
    const cards = getDrillCards(category);
    total += cards.length;
    if (category.presentation === 'text') {
      assert.ok(cards.every(card => card.frontType === 'text' && card.frontLabel && card.backThai));
      continue;
    }
    assert.ok(cards.every(card => card.image && card.imageAlt), `${category.id} must not contain text-only cards`);
    await Promise.all(cards.map(card => access(fileURLToPath(new URL(`../public${card.image}`, import.meta.url)))));
  }
  assert.equal(total, 861);
});
test('cleanSpeechText sanitizes emojis, flags, arrows and glosses for speech output', async () => {
  const { cleanSpeechText } = await import('../src/utils/useSpeech.js');
  assert.equal(cleanSpeechText('doctor 👨‍⚕️'), 'doctor');
  assert.equal(cleanSpeechText('Math 🔢'), 'Math');
  assert.equal(cleanSpeechText('Thailand 🇹🇭'), 'Thailand');
  assert.equal(cleanSpeechText('What = อะไร'), 'What');
  assert.equal(cleanSpeechText('I → me → my → mine → myself'), 'I, me, my, mine, myself');

  for (const cat of VOCAB_CATEGORIES) {
    const cards = getDrillCards(cat);
    for (const c of cards) {
      const prompt = (c.frontLabel && /[A-Za-z]/.test(c.frontLabel) && !/[\u0E00-\u0E7F]/.test(c.frontLabel))
        ? c.frontLabel
        : (c.front && /[A-Za-z]/.test(c.front) && !/[\u0E00-\u0E7F]/.test(c.front))
          ? c.front
          : (c.back || c.frontLabel || c.front || '');
      const cleaned = cleanSpeechText(prompt);
      assert.ok(cleaned.length > 0, `${cat.id} ${c.id} speech prompt must not be empty`);
      assert.equal(/[\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(cleaned), false, `${cat.id} ${c.id} must not contain emojis or flags`);
    }
  }
});
