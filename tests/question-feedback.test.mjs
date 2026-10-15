import './helpers/environment.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
const { getQuestionTranslation, getSpokenFeedbackText } = await import('../src/utils/questionTranslator.js');
const { QUESTS } = await import('../src/data/questions.js');

test('offering a Thai drink has a polite offer and an actual Thai question translation', () => {
  const question = QUESTS.flatMap(q => q.questions).find(q => q.id === 'pdf_1.6_เครื่องดื่ม_4');
  assert.ok(question);
  assert.equal(question.options[question.answer], 'Would you like some Thai iced tea?');
  assert.equal(getQuestionTranslation(question), 'คุณต้องการเสนอเครื่องดื่มไทยให้แขก คุณควรพูดว่าอย่างไร?');
  assert.ok(question.correctFeedback.includes('ใช้ถามว่าชอบ'));
});

test('missing translations do not masquerade as English questions or answer explanations', () => {
  const question = { question: 'Which object belongs to the visitor?', correctFeedback: 'คำตอบคือตัวเลือกที่สาม', translation: 'Which object belongs to the visitor?' };
  assert.equal(getQuestionTranslation(question), '');
  assert.equal(getSpokenFeedbackText(question, 'คำอธิบาย'), 'คำอธิบาย');
  assert.equal(getQuestionTranslation(null), '');
});

test('explicit translations, verified common sentences and Thai source questions remain usable', () => {
  assert.equal(getQuestionTranslation({ translation: 'คำแปลจริง' }), 'คำแปลจริง');
  assert.equal(getQuestionTranslation({ thaiTranslation: 'คำแปลจริง' }), 'คำแปลจริง');
  assert.equal(getQuestionTranslation({ questionThai: 'คำแปลจริง' }), 'คำแปลจริง');
  assert.equal(getQuestionTranslation({ question: 'How old are you?' }), 'คุณอายุเท่าไหร่?');
  assert.equal(getQuestionTranslation({ question: 'คำถามภาษาไทย' }), 'คำถามภาษาไทย');
});

test('partially translated dialogues are not presented as a complete Thai translation', () => {
  assert.equal(getQuestionTranslation({ question: 'A: How are you?\nB: A completely unknown response.' }), '');
  assert.ok(getQuestionTranslation({ question: 'A: How are you?\nB: Yes, ___ is the nearest hospital?' }).includes('โรงพยาบาล'));
});
