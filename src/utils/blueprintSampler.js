// ============================================================
// blueprintSampler.js — Official O-NET Grade 6 Test Blueprint Sampler
// Specification: 32 MCQs, 60 minutes, 3.125 points/question = 100 points
// Distribution:
//   ต 1.1: 6 questions (Language for Communication: signs, passages, symbols)
//   ต 1.2: 10 questions (Interpersonal Communication: greetings, requests, dialogs)
//   ต 1.3: 6 questions (Information Presentation: maps, directions, personal info, charts)
//   ต 2.1: 2 questions (Language and Culture: festivals, holidays, traditions)
//   ต 2.2: 4 questions (Language and Culture Comparison: grammar, tenses, structures)
//   ต 4.1: 4 questions (Language in School & Community: classroom, school, study)
// Total = 32 questions
// ============================================================

import { QUESTS } from '../data/questions';
import {
  miniMockPool, speedMockPool, skillMixedPool, fullMockPool, finalSimPool
} from '../data/chapter4_questions';
import { cultureQuestions } from '../data/cultureQuestions';
import { inspectQuestionMedia } from './questionMedia';
import { isSingleStepMcq } from './questionFormat';

export const BLUEPRINT_CONFIG = {
  id: 'onet_blueprint_32',
  name: 'O-NET Grade 6 Official Simulation',
  titleThai: 'จำลองสอบ O-NET ป.6 เสมือนจริง (ตาม Test Blueprint สทศ.)',
  totalQuestions: 32,
  timeLimitSeconds: 3600, // 60 minutes
  pointsPerQuestion: 3.125,
  totalPoints: 100,
  passingPercent: 70, // 70 points = 22.4 correct items
  quota: {
    'ต 1.1': 6,
    'ต 1.2': 10,
    'ต 1.3': 6,
    'ต 2.1': 2,
    'ต 2.2': 4,
    'ต 4.1': 4,
  },
  standardLabels: {
    'ต 1.1': 'ภาษาเพื่อการสื่อสาร (ป้าย สัญลักษณ์ บทอ่าน)',
    'ต 1.2': 'ทักษะสื่อสารโต้ตอบ (บทสนทนาประจำวัน การถาม-ตอบ)',
    'ต 1.3': 'นำเสนอข้อมูลและเรื่องใกล้ตัว (ข้อมูลตนเอง ทิศทาง แผนภูมิ)',
    'ต 2.1': 'เทศกาล วันสำคัญ และวัฒนธรรมเจ้าของภาษา',
    'ต 2.2': 'เปรียบเทียบภาษาและวัฒนธรรม (ไวยากรณ์และโครงสร้างประโยค)',
    'ต 4.1': 'การใช้ภาษาในห้องเรียน สถานศึกษา และชุมชน',
  }
};

// Quest ID to Primary O-NET Standard Mapping
export const QUEST_STANDARD_MAP = {
  // ต 1.1
  signs: 'ต 1.1',
  sign_detective: 'ต 1.1',
  reading: 'ต 1.1',
  reading_detective: 'ต 1.1',
  food: 'ต 1.1',
  illness: 'ต 1.1',
  shapes_colors: 'ต 1.1',
  clothes_fashion: 'ต 1.1',
  vocabulary: 'ต 1.1',
  nature_environment: 'ต 1.1',

  // ต 1.2
  conversation: 'ต 1.2',
  conversation_rescue: 'ต 1.2',
  emotions_feelings: 'ต 1.2',
  market: 'ต 1.2',
  question_words: 'ต 1.2',

  // ต 1.3
  directions: 'ต 1.3',
  map_escape: 'ต 1.3',
  about_myself: 'ต 1.3',
  family: 'ต 1.3',
  weather_seasons: 'ต 1.3',
  numbers: 'ต 1.3',
  jobs: 'ต 1.3',

  // ต 2.1
  culture_festivals: 'ต 2.1',
  world_countries: 'ต 2.1',

  // ต 2.2
  grammar: 'ต 2.2',
  tenses_arena: 'ต 2.2',
  adjectives_comp: 'ต 2.2',
  pronouns_master: 'ต 2.2',
  nouns_quantifiers: 'ต 2.2',
  prepositions_hub: 'ต 2.2',

  // ต 4.1
  school: 'ต 4.1',
  school_subjects: 'ต 4.1',
  classroom: 'ต 4.1',
};

// Skill to Standard Mapping for Arena items
export const SKILL_STANDARD_MAP = {
  signs: 'ต 1.1',
  reading: 'ต 1.1',
  conversation: 'ต 1.2',
  question_words: 'ต 1.2',
  directions: 'ต 1.3',
  vocabulary: 'ต 1.1',
  food: 'ต 1.1',
  grammar: 'ต 2.2',
  classroom: 'ต 4.1',
};

/**
 * Resolves standard tag for an authored or arena item
 */
export function resolveQuestionStandard(question = {}) {
  if (question.standard && BLUEPRINT_CONFIG.quota[question.standard]) {
    return question.standard;
  }
  if (question.quest && QUEST_STANDARD_MAP[question.quest]) {
    return QUEST_STANDARD_MAP[question.quest];
  }
  if (question.skill && SKILL_STANDARD_MAP[question.skill]) {
    return SKILL_STANDARD_MAP[question.skill];
  }
  return null;
}

/**
 * Checks whether an item is eligible for the official Blueprint release
 */
export function isBlueprintEligible(question = {}) {
  if (!question || !question.question) return false;
  if (!isSingleStepMcq(question)) return false;
  if (question.reviewStatus !== 'approved') return false;
  if (!Array.isArray(question.approvedModes) || !question.approvedModes.includes('onet_blueprint_32')) return false;
  if (question.contentReview?.status !== 'approved_for_blueprint' || !question.contentReview?.approvedBy) return false;
  if (!BLUEPRINT_CONFIG.quota[question.standard] || !question.indicator || !question.difficulty) return false;

  // Inspect media stimuli and placeholders
  const inspection = inspectQuestionMedia(question);
  if (inspection.blocked) return false;

  return true;
}

/**
 * Pseudo-random generator with seed support (LCG)
 */
function createSeededRandom(seed) {
  if (typeof seed !== 'number') {
    return Math.random;
  }
  let s = (seed >>> 0) || 123456789;
  return function () {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Shuffle array using Fisher-Yates with optional PRNG
 */
export function shuffleArray(arr, rng = Math.random) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles options of a question and remaps its correct answer index without mutating original
 */
export function shuffleQuestionOptions(question, rng = Math.random) {
  const originalOptions = question.options || [];
  const correctOptionText = originalOptions[question.answer];
  const shuffledOptions = shuffleArray(originalOptions, rng);
  const newAnswerIndex = shuffledOptions.indexOf(correctOptionText);

  return {
    ...question,
    options: shuffledOptions,
    answer: newAnswerIndex >= 0 ? newAnswerIndex : question.answer,
    _originalAnswer: question.answer,
  };
}

/**
 * Content signature for strict deduplication
 */
export function getQuestionSignature(q) {
  const stem = (q.question || '').trim().toLowerCase();
  const opts = Array.isArray(q.options) ? q.options.map(o => String(o).trim().toLowerCase()).sort().join('|') : '';
  return `${stem}::${opts}`;
}

/**
 * Collects and deduplicates all release-eligible questions across banks
 */
export function getAllBlueprintEligibleQuestions(additionalQuestions = []) {
  const all = [];
  const seen = new Set();

  function collect(items) {
    if (!Array.isArray(items)) return;
    for (const q of items) {
      if (!isBlueprintEligible(q)) continue;
      const sig = getQuestionSignature(q);
      if (!seen.has(sig)) {
        seen.add(sig);
        const standard = resolveQuestionStandard(q);
        all.push({ ...q, standard });
      }
    }
  }

  // 1. Quests Pool
  QUESTS.forEach(quest => collect(quest.questions));

  // 2. Arena Pools
  collect(finalSimPool);
  collect(fullMockPool);
  collect(miniMockPool);
  collect(skillMixedPool);
  collect(speedMockPool);

  // 3. Culture & Festivals Bank
  collect(cultureQuestions);
  collect(additionalQuestions);

  return all;
}

/**
 * Samples a 32-question exam paper strictly satisfying NIETS Test Blueprint quotas
 * @param {Object} options
 * @param {number} [options.seed] Optional integer seed for reproducible exams
 * @param {boolean} [options.shuffleOptions] Whether to shuffle option order (default: true)
 * @returns {Array} Array of 32 exam items with standard, scoreWeight and remapped options
 */
export function sampleBlueprintExam(options = {}) {
  const { seed, shuffleOptions = true, questionPool = null } = options;
  const rng = createSeededRandom(seed);

  const pool = questionPool === null
    ? getAllBlueprintEligibleQuestions()
    : questionPool.filter(isBlueprintEligible).map(question => ({ ...question, standard: resolveQuestionStandard(question) }));

  // Partition pool by O-NET Standard
  const byStandard = {
    'ต 1.1': [],
    'ต 1.2': [],
    'ต 1.3': [],
    'ต 2.1': [],
    'ต 2.2': [],
    'ต 4.1': [],
  };

  for (const q of pool) {
    if (byStandard[q.standard]) {
      byStandard[q.standard].push(q);
    }
  }

  const selected = [];
  const selectedSignatures = new Set();

  for (const [standard, requiredCount] of Object.entries(BLUEPRINT_CONFIG.quota)) {
    const candidates = shuffleArray(byStandard[standard] || [], rng);
    let pickedCount = 0;

    for (const q of candidates) {
      const sig = getQuestionSignature(q);
      if (!selectedSignatures.has(sig)) {
        selectedSignatures.add(sig);
        selected.push({
          ...q,
          standard,
          scoreWeight: BLUEPRINT_CONFIG.pointsPerQuestion,
        });
        pickedCount++;
        if (pickedCount >= requiredCount) break;
      }
    }

    if (pickedCount < requiredCount) {
      throw new Error(`Insufficient eligible items for Standard ${standard}: required ${requiredCount}, found ${pickedCount}`);
    }
  }

  // Final exam paper order shuffle
  let paper = shuffleArray(selected, rng);

  // Option permutation with remapped answer keys
  if (shuffleOptions) {
    paper = paper.map(q => shuffleQuestionOptions(q, rng));
  }

  return paper;
}

/**
 * Calculates student score on a Blueprint exam paper
 * @param {Array} examQuestions 32 items
 * @param {Object} answers Map of question index -> selected option index
 * @returns {Object} detailed score summary
 */
export function calculateBlueprintScore(examQuestions = [], answers = {}) {
  let correctCount = 0;
  const byStandard = {};

  for (const standard of Object.keys(BLUEPRINT_CONFIG.quota)) {
    byStandard[standard] = { total: 0, correct: 0, points: 0, maxPoints: 0 };
  }

  examQuestions.forEach((q, index) => {
    const selectedAnswer = answers[index];
    const isCorrect = selectedAnswer !== undefined && Number(selectedAnswer) === Number(q.answer);
    const standard = q.standard || 'ต 1.1';

    if (!byStandard[standard]) {
      byStandard[standard] = { total: 0, correct: 0, points: 0, maxPoints: 0 };
    }

    byStandard[standard].total++;
    byStandard[standard].maxPoints += BLUEPRINT_CONFIG.pointsPerQuestion;

    if (isCorrect) {
      correctCount++;
      byStandard[standard].correct++;
      byStandard[standard].points += BLUEPRINT_CONFIG.pointsPerQuestion;
    }
  });

  const totalPoints = correctCount * BLUEPRINT_CONFIG.pointsPerQuestion;
  const percent = (totalPoints / BLUEPRINT_CONFIG.totalPoints) * 100;

  return {
    correctCount,
    totalQuestions: examQuestions.length,
    points: Math.round(totalPoints * 1000) / 1000,
    maxPoints: BLUEPRINT_CONFIG.totalPoints,
    percent: Math.round(percent * 100) / 100,
    passed: percent >= BLUEPRINT_CONFIG.passingPercent,
    byStandard,
  };
}
