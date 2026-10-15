import test from 'node:test';
import assert from 'node:assert/strict';
import { QUEST_PALETTES, getQuestPalette } from '../src/utils/questPalette.js';
function luminance(hex) {
  const rgb = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
test('all six pastel ink pairs retain readable contrast on soft and surface colors', () => {
  assert.equal(Object.keys(QUEST_PALETTES).length, 6);
  for (const palette of Object.values(QUEST_PALETTES)) {
    for (const background of [palette.soft, palette.surface]) assert.ok((luminance(background) + .05) / (luminance(palette.ink) + .05) >= 4.5);
  }
});
test('topic colors stay stable independent of progress or ordering', () => {
  assert.equal(getQuestPalette({ id: 'family' }).tone, 'rose');
  assert.equal(getQuestPalette({ id: 'school' }).tone, 'mint');
  assert.deepEqual(getQuestPalette({ id: 'unknown', progress: 0 }), getQuestPalette({ id: 'unknown', progress: 100 }));
});
