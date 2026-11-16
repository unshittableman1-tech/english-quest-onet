const valley = '/assets/chapter-worlds/valley.webp';

// Art is decorative. Quest contents and availability remain owned by QuestMap.
const themes = {
  1: { id: 1, name: 'The Dawnshore Valley', background: valley, tone: 'valley', motion: 'drift', isFallback: false },
  2: { id: 2, name: 'The Whispering Forest', background: '/assets/chapter-worlds/forest.webp', tone: 'forest', motion: 'drift', isFallback: false },
  3: { id: 3, name: 'The Aether Academy', background: '/assets/chapter-worlds/academy.webp', tone: 'academy', motion: 'shimmer', isFallback: false },
  4: { id: 4, name: 'The Skybound Islands', background: '/assets/chapter-worlds/sky.webp', tone: 'sky', motion: 'drift', isFallback: false },
  5: { id: 5, name: 'The Celestial Citadel', background: '/assets/chapter-worlds/crystal.webp', tone: 'crystal', motion: 'shimmer', isFallback: false },
};

export function getChapterWorldTheme(chapterId) {
  const theme = themes[chapterId] || themes[1];
  return { ...theme, decoration: decorations[theme.tone] };
}

const decorations = {
  valley: { image: '/assets/chapter-worlds/butterfly.webp', motion: 'flutter', count: 3 },
  forest: { image: '/assets/chapter-worlds/leaf.webp', motion: 'leaves', count: 3 },
  academy: { image: '/assets/avatar-proposals/05-magnifier.png', motion: 'levitate', count: 2 },
  sky: { image: '/assets/chapter-worlds/airship.webp', motion: 'sail', count: 2 },
  crystal: { image: '/assets/avatar-proposals/04-crystal-dictionary.png', motion: 'levitate', count: 2 },
};
