export const CHAPTER3_LOCAL_MISSIONS = [
  { id: 'c3_labeling_lab', chapter: 3, name: 'Labeling Lab', description: 'จับคู่คำศัพท์กับจุดสำคัญในภาพห้องเรียน', previewOnly: true, previewHref: '/labeling-lab-preview.html' },
  { id: 'c3_ordering_quest', chapter: 3, name: 'Ordering Quest', description: 'เรียงคำเป็นประโยคและเรียงลำดับเหตุการณ์', previewOnly: true, previewHref: '/ordering-quest-preview.html' },
  { id: 'c3_graph_comparison', chapter: 3, name: 'Graph & Comparison', description: 'อ่านกราฟและเปรียบเทียบข้อมูลด้วยภาษาอังกฤษ', previewOnly: true, previewHref: '/graph-comparison-preview.html' },
];

export const localChapter3Enabled = () => ['localhost', '127.0.0.1'].includes(window.location.hostname);

export function withLocalChapter3Missions(chapter) {
  if (chapter.id !== 3 || !localChapter3Enabled()) return chapter;
  const byId = Object.fromEntries([...chapter.quests, ...CHAPTER3_LOCAL_MISSIONS].map(quest => [quest.id, quest]));
  return { ...chapter, quests: ['question_words', 'pronouns_master', 'c3_labeling_lab', 'c3_ordering_quest', 'tenses_arena', 'c3_graph_comparison', 'strategy_boss'].map(id => byId[id]).filter(Boolean).map(quest => ({ ...quest, previewOnly: false, learningLive: quest.id !== 'strategy_boss' })) };
}
