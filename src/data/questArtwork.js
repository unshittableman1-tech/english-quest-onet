export const QUEST_ARTWORK = Object.freeze({
  about_myself: '/learning/emotions/happy-v1.png',
  family: '/assessment/family/f01-v1.png',
  school: '/learning/places/school-v1.png',
  vocabulary: '/learning/transport/plane-v1.png',
  numbers: '/learning/subjects/math-v1.png',
  weather_seasons: '/learning/weather/sunny-v1.png',
  food: '/learning/food/fried-rice-v1.png',
  illness: '/learning/jobs/doctor-v1.png',
  shapes_colors: '/learning/subjects/art-v1.png',
  grammar: '/learning/routines/do-my-homework-v1.png',

  conversation: '/learning/greeting/nice-to-meet-you-v1.png',
  conversation_rescue: '/learning/greeting/ask-for-help-v1.png',
  emotions_feelings: '/learning/emotions/excited-v1.png',
  jobs: '/learning/jobs/teacher-v1.png',
  market: '/learning/places/market-v1.png',
  chapter2_boss: '/learning/greeting/thank-you-v1.png',

  question_words: '/learning/emotions/confused-v1.png',
  pronouns_master: '/learning/greeting/how-are-you-v1.png',
  c3_labeling_lab: '/learning/places/school-v1.png',
  c3_ordering_quest: '/learning/subjects/english-v1.png',
  tenses_arena: '/learning/routines/wake-up-v1.png',
  c3_graph_comparison: '/learning/subjects/math-v1.png',
  strategy_boss: '/learning/emotions/proud-v1.png',

  signs: '/learning/signs/traffic-light-v3.png',
  sign_detective: '/learning/signs/no-parking-v3.png',
  directions: '/learning/directions/turn-right-v2.png',
  prepositions_hub: '/learning/directions/between-v2.png',
  map_escape: '/learning/directions/go-straight-v2.png',
  reading: '/learning/verbs/read-v1.png',
  reading_detective: '/learning/jobs/librarian-v1.png',
  finalboss: '/learning/culture_festivals/halloween-v1.png',

  nouns_quantifiers: '/learning/food/chicken-soup-v1.png',
  adjectives_comp: '/learning/clothes/cap-and-hat-v1.png',
  clothes_fashion: '/learning/clothes/jacket-v1.png',
  world_countries: '/learning/countries/thailand-thai-v1.png',
  nature_environment: '/learning/environment/plant-trees-v1.png',
  school_subjects: '/learning/subjects/english-v1.png',
  culture_festivals: '/learning/culture_festivals/songkran-v1.png',
  chapter5_boss: '/learning/culture_festivals/christmas-v1.png',
});

export function getQuestArtwork(questId) {
  return QUEST_ARTWORK[questId] || null;
}
