// Fixed 32-item O-NET P.6 simulation used by the Final Boss.
// Quotas mirror BLUEPRINT_CONFIG and source provenance remains attached.
import { cultureQuestions } from './cultureQuestions';
import { OFFICIAL_ONET_BOSS_QUESTIONS } from './officialOnetBossQuestions';

const VERSION = 'final-boss-blueprint-v1';

function find(group, suffix) {
  const item = OFFICIAL_ONET_BOSS_QUESTIONS[group].find(question => question.id.endsWith(`_${suffix}`));
  if (!item) throw new Error(`Missing Final Boss source item: ${group}/${suffix}`);
  return item;
}

function release(item, standard, indicator, difficulty = 'application', overrides = {}) {
  return {
    ...item,
    ...overrides,
    standard,
    indicator,
    difficulty,
    reviewStatus: 'approved',
    approvedModes: ['onet_blueprint_32'],
    itemVersion: VERSION,
    scoringPolicy: 'first_response_v1',
    contentReview: {
      status: 'approved_for_blueprint', reviewer: 'workspace_owner', approvedBy: 'workspace_owner',
      approvalSource: 'explicit_user_request_for_32_item_final_boss', version: VERSION,
    },
    mediaReview: {
      status: (overrides.stimuli || item.stimuli) ? 'verified' : 'not_required',
      reviewer: 'Codex', version: VERSION,
    },
  };
}

const communication = [
  release(find('finalboss', 'no_photography'), 'ต 1.1', 'ต 1.1 ป.6/3'),
  release(find('finalboss', 'accessible_parking'), 'ต 1.1', 'ต 1.1 ป.6/3'),
  release(find('finalboss', 'keep_off_grass'), 'ต 1.1', 'ต 1.1 ป.6/3'),
  release(find('finalboss', 'cafe_total'), 'ต 1.1', 'ต 1.1 ป.6/4'),
  release(find('strategy_boss', 'dinner_place'), 'ต 1.1', 'ต 1.1 ป.6/4', 'foundation', {
    question: 'Where will John and Kathy have dinner?',
    stimuli: [{ type: 'passage', title: 'Evening Plan', text: 'John and Kathy are going to eat at a Chinese restaurant. After dinner, they will go to the cinema.' }],
  }),
  release(find('strategy_boss', 'after_dinner'), 'ต 1.1', 'ต 1.1 ป.6/4', 'application', {
    question: 'What will John and Kathy do after dinner?',
    stimuli: [{ type: 'passage', title: 'Evening Plan', text: 'John and Kathy are going to eat at a Chinese restaurant. After dinner, they will go to the cinema.' }],
  }),
];

// Match the communicative task, rather than assigning indicators by array position.
// Missing /2, /3 and /5 coverage is addressed in the separate V2 review draft.
const interaction = [
  ['and_you', 1], ['very_well', 1], ['when_tennis', 4], ['excuse_me_zoo', 1], ['dog_accident', 1],
  ['introduce_friend', 1], ['you_are_welcome', 1], ['bank_directions', 4], ['stepping_foot', 1], ['once_week', 4],
].map(([id, indicator], index) => release(find('chapter2_boss', id), 'ต 1.2', `ต 1.2 ป.6/${indicator}`, index % 3 === 0 ? 'foundation' : 'application'));

const information = [
  release(find('finalboss', 'sugar_most'), 'ต 1.3', 'ต 1.3 ป.6/2'),
  release(find('finalboss', 'sugar_ten'), 'ต 1.3', 'ต 1.3 ป.6/2'),
  release(find('finalboss', 'sugar_compare'), 'ต 1.3', 'ต 1.3 ป.6/2'),
  release(find('finalboss', 'shopping_table'), 'ต 1.3', 'ต 1.3 ป.6/2'),
  release(find('finalboss', 'height_comparison'), 'ต 1.3', 'ต 1.3 ป.6/1'),
  release(find('grammar', 'family_visitors'), 'ต 1.3', 'ต 1.3 ป.6/1'),
];

const christmas = cultureQuestions.find(question => question.id === 'cult_05');
const songkran = cultureQuestions.find(question => question.id === 'cult_08');
const culture = [
  release(christmas, 'ต 2.1', 'ต 2.1 ป.6/2', 'application', {
    question: 'Look at the picture. Which festival is the child celebrating?',
    stimuli: [{ type: 'image', src: '/assessment/onet-blueprint/christmas-tree.webp', alt: 'A child decorating a pine tree with lights, candy canes and round ornaments' }],
    visualAdaptation: { type: 'ai_generated_exam_illustration', purpose: 'cultural_context' },
  }),
  release(songkran, 'ต 2.1', 'ต 2.1 ป.6/2', 'application', {
    question: 'Look at the picture. How is the child showing respect to an elder during Songkran?',
    stimuli: [{ type: 'image', src: '/assessment/onet-blueprint/songkran-respect.webp', alt: 'A Thai child gently pouring scented water onto an elder’s hands during Songkran' }],
    visualAdaptation: { type: 'ai_generated_exam_illustration', purpose: 'cultural_context' },
  }),
];

const languageComparison = [
  release(find('grammar', 'vowel_sound'), 'ต 2.2', 'ต 2.2 ป.6/1'),
  release(find('grammar', 'intonation'), 'ต 2.2', 'ต 2.2 ป.6/1'),
  release(find('grammar', 'punctuation'), 'ต 2.2', 'ต 2.2 ป.6/1'),
  release(find('grammar', 'tablet_are'), 'ต 2.2', 'ต 2.2 ป.6/1', 'foundation'),
];

const schoolCommunity = [
  release(find('chapter5_boss', 'math_help'), 'ต 4.1', 'ต 4.1 ป.6/1'),
  release(find('chapter5_boss', 'carry_books'), 'ต 4.1', 'ต 4.1 ป.6/1', 'foundation'),
  release(find('chapter5_boss', 'turn_on_light'), 'ต 4.1', 'ต 4.1 ป.6/1'),
  release(find('chapter5_boss', 'hard_math'), 'ต 4.1', 'ต 4.1 ป.6/1'),
];

export const finalBossQuestions = [
  ...communication,
  ...interaction,
  ...information,
  ...culture,
  ...languageComparison,
  ...schoolCommunity,
];
