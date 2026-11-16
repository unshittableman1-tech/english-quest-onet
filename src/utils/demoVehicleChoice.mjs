const vehicles = Object.fromEntries(['bus', 'motorcycle', 'car', 'boat'].map(name => [name, `/demo-quest-vehicles/${name}.png`]));
const subjects = {
  art: '/learning/subjects/art-v1.png',
  math: '/learning/subjects/math-v1.png',
  english: '/learning/subjects/english-v1.png',
  'p.e.': '/learning/subjects/physical-education-v1.png',
  science: '/learning/subjects/science-v1.png',
  geography: '/learning/subjects/geography-v1.png',
};
const seasons = {
  winter: '/learning/weather/winter-v1.png',
  spring: '/learning/weather/spring-v1.png',
  autumn: '/learning/weather/autumn-fall-v1.png',
  summer: '/learning/weather/summer-v1.png',
  'summer again': '/learning/weather/summer-v1.png',
};
const signs = {
  'wet floor': '/learning/signs/wet-floor-v3.png',
  'no parking': '/learning/signs/no-parking-v3.png',
  'fire exit': '/learning/signs/fire-exit-v3.png',
  'school zone': '/learning/signs/school-zone-v3.png',
};
const recycleChoices = {
  'food soup': '/demo-recycling-choices/soup.png',
  'dirty tissue': '/demo-recycling-choices/tissue.png',
  'used chewing gum': '/demo-recycling-choices/gum.png',
  'a glass bottle': '/demo-recycling-choices/glass-bottle.png',
};
const choices = {
  v34: vehicles,
  'pdf_1.3_โรงเรียน_4': subjects,
  school_subjects_context_02: subjects,
  school_subjects_context_03: subjects,
  school_subjects_context_09: subjects,
  school_subjects_context_10: subjects,
  w_pdf_06: seasons,
  w_pdf_08: seasons,
  s03: signs,
  nature_environment_context_08: recycleChoices,
};
export function imageForChoice({ demo, questionId, choice }) {
  if (demo !== true || typeof choice !== 'string') return null;
  return choices[questionId]?.[choice.trim().toLowerCase()] ?? null;
}

const scenes = {
  conversation: {
    c01: '/learning/greeting/thank-you-v1.png',
    c07: '/learning/greeting/borrow-a-pen-v1.png',
    'pdf_3.3_1': '/learning/greeting/thank-you-v1.png',
  },
  conversation_rescue: { c3_cr_1: '/learning/greeting/thank-you-v1.png' },
  emotions_feelings: { e_pdf_07: '/learning/emotions/sad-v1.png' },
  market: { m09: '/learning/clothes/shoes-v1.png' },
  question_words: { c3_qw_8: '/learning/transport/bus-v1.png' },
  pronouns_master: { pronouns_master_context_03: '/learning/transport/bicycle-v1.png' },
  tenses_arena: { tenses_arena_assessment_04: '/learning/verbs/cook-v1.png' },
  sign_detective: {
    c3_sd_1: '/images/no_smoking.svg',
    c3_sd_2: '/assessment/onet-recreated/keep-off-grass.webp',
    c3_sd_5: '/learning/signs/wet-floor-v3.png',
  },
  nouns_quantifiers: {
    nouns_quantifiers_context_01: '/learning/verbs/drink-v1.png',
    nouns_quantifiers_context_06: '/learning/classroom/library-v1.png',
  },
  world_countries: { world_countries_context_02: '/learning/countries/china-chinese-v1.png' },
  culture_festivals: {
    cult_01: '/learning/culture_festivals/halloween-v1.png',
    cult_04: '/learning/culture_festivals/christmas-v1.png',
    cult_07: '/learning/culture_festivals/songkran-v1.png',
  },
};
export function demoPracticeScene({ demo, isExam, questId, questionId }) {
  if (demo !== true || isExam !== false) return null;
  return Object.hasOwn(scenes, questId) && Object.hasOwn(scenes[questId], questionId)
    ? scenes[questId][questionId] : null;
}

export function demoBossScenes({ demo, questId, questionId }) {
  if (demo !== true) return [];
  if (questId === 'strategy_boss' && ['onet_2552_01_dinner_place', 'onet_2552_02_after_dinner'].includes(questionId)) return ['/learning/places/cinema-v1.png', '/learning/places/restaurant-v1.png'];
  if (questId === 'finalboss' && questionId === 'draft_fresh_ch4_28') return ['/demo-boss-art/rainy-picnic.png'];
  if (questId === 'chapter5_boss' && questionId === 'onet_2567_04_see_you_later') return ['/learning/classroom/library-v1.png'];
  return [];
}

export function orderingPreviewScene({ missionId, previewOnly, roundId, stepId }) {
  if (previewOnly !== true || missionId !== 'c3_ordering_preview_v1' || roundId !== 'oe1') return null;
  return { a: '/learning/routines/wake-up-v1.png', b: '/learning/routines/brush-my-teeth-v1.png', c: '/learning/routines/have-breakfast-v1.png', d: '/learning/routines/go-to-school-v1.png' }[stepId] ?? null;
}

