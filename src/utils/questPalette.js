export const QUEST_PALETTES = {
  sky: { ink: '#226386', soft: '#E1F1FC', edge: '#9BCBE8', surface: '#F7FBFF' },
  rose: { ink: '#9A4567', soft: '#FBE4ED', edge: '#E8AFC6', surface: '#FFF8FB' },
  mint: { ink: '#216B59', soft: '#DDF3E9', edge: '#9DD6BD', surface: '#F6FCF9' },
  lilac: { ink: '#70519A', soft: '#EEE5FB', edge: '#C8B4E4', surface: '#FBF8FF' },
  peach: { ink: '#92512C', soft: '#FCE8D9', edge: '#E6BE9D', surface: '#FFFAF6' },
  lemon: { ink: '#74601D', soft: '#F7EFCB', edge: '#D9CA87', surface: '#FFFDF5' },
};
const TOPIC_TONES = {
  about_myself: 'sky', family: 'rose', school: 'mint', vocabulary: 'lilac',
  numbers: 'sky', weather_seasons: 'lemon', food: 'peach', illness: 'mint',
  shapes_colors: 'rose', grammar: 'lilac', clothes_fashion: 'peach',
};
export function getQuestPalette(quest) {
  const tones = Object.keys(QUEST_PALETTES);
  const tone = TOPIC_TONES[quest.id] || tones[[...String(quest.id)].reduce((sum, c) => sum + c.charCodeAt(0), 0) % tones.length];
  return { tone, ...QUEST_PALETTES[tone] };
}
