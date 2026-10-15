import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const { VOCAB_CATEGORIES, VOCAB_GROUPS, getDrillMission, getDrillCards } = await import('../src/data/vocabDrill.js');
const { QUESTS, preTestQuestions } = await import('../src/data/questions.js');
test('23 vocab categories resolve exact decks without an unrelated mission fallback', () => {
  assert.equal(VOCAB_CATEGORIES.length, 23);
  assert.equal(new Set(VOCAB_CATEGORIES.map(c => c.id)).size, 23);
  for (const cat of VOCAB_CATEGORIES) {
    assert.ok(VOCAB_GROUPS.some(g => g.id === cat.group));
    const mission = getDrillMission(cat);
    assert.ok(mission, cat.id);
    if (!cat.deckId) assert.equal(mission.id, cat.missionId);
    const cards = getDrillCards(cat);
    assert.ok(cards.length >= 4, cat.id);
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
  assert.deepEqual(cards.map(c => c.front), words);
  assert.deepEqual(cards.map(c => c.back), words);
  assert.equal(cards[0].hint, 'สถานที่ทำงาน: hospital');
  assert.equal(cards[2].hint, 'สถานที่ทำงาน: airport');
});
test('country flashcards explicitly distinguish countries and nationalities without flag glyphs', () => {
  const cards = getDrillCards(VOCAB_CATEGORIES.find(c => c.id === 'countries'));
  assert.deepEqual(cards.map(c => c.front), ['Thailand', 'Japan', 'China', 'Korea', 'England', 'America']);
  assert.deepEqual(cards.map(c => c.back), ['Thai', 'Japanese', 'Chinese', 'Korean', 'English / British', 'American']);
  assert.ok(cards.every(c => c.frontCaption === 'ประเทศ (Country)' && c.backCaption === 'สัญชาติ (Nationality)'));
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
  const expected = { transport: 12, place: 8 };
  const illustrated = Object.entries(expected).flatMap(([id, size]) => {
    const category = VOCAB_CATEGORIES.find(c => c.id === id);
    const cards = getDrillCards(category);
    assert.equal(cards.length, size);
    return cards;
  });
  assert.equal(illustrated.length, 20);
  assert.equal(new Set(illustrated.map(c => c.image)).size, 20);
  for (const c of illustrated) {
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
  assert.equal(cards.length, 8);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/jobs/') && card.imageAlt));
});
test('food deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'food');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 8);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/food/') && card.imageAlt));
});
test('clothes deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'clothes');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 8);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/clothes/') && card.imageAlt));
});
test('weather deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'weather');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 9);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/weather/') && card.imageAlt));
});
test('emotions deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'emotions');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 8);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/emotions/') && card.imageAlt));
});
test('countries deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'countries');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 6);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/countries/') && card.imageAlt));
});
test('shapes deck exposes one exact visual asset for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'shapes');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 7);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/shapes/') && card.imageAlt));
});
test('environment deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'environment');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 6);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/environment/') && card.imageAlt));
});
test('subjects deck exposes one transparent illustration for every learning card', () => {
  const category = VOCAB_CATEGORIES.find(item => item.id === 'subjects');
  const cards = getDrillCards(category);
  assert.equal(cards.length, 6);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/subjects/') && card.imageAlt));
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
  assert.equal(cards.length, 8);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/greeting/') && card.imageAlt));
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
  assert.equal(cards.length, 4);
  assert.ok(cards.every(card => card.image?.startsWith('/learning/tenses/') && card.imageAlt));
});
test('remaining grammar decks expose a visual for every learning card', () => {
  const expected = { numbers: 10, pronouns: 7, quantifiers: 6 };
  for (const [id, count] of Object.entries(expected)) {
    const category = VOCAB_CATEGORIES.find(item => item.id === id);
    const cards = getDrillCards(category);
    assert.equal(cards.length, count);
    assert.ok(cards.every(card => card.image?.startsWith(`/learning/${id}/`) && card.imageAlt));
  }
});
test('every Vocab Drill learning card now has a visual and accessible description', () => {
  let total = 0;
  for (const category of VOCAB_CATEGORIES) {
    const cards = getDrillCards(category);
    total += cards.length;
    assert.ok(cards.every(card => card.image && card.imageAlt), `${category.id} must not contain text-only cards`);
  }
  assert.equal(total, 216);
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
