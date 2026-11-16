const now = () => new Date().toISOString();

export function createDemoStudent() {
  return {
    id: 'demo_student',
    name: 'น้องเดโม',
    class: 'ป.6/1',
    number: '99',
    school_id: 'demo_school',
    school_code: 'DEMO',
    school_name: 'โรงเรียนสาธิต English Quest',
    roomCode: 'DEMO',
    xp: 1260,
    level: 5,
    role: 'student',
    isDemo: true,
    demoBossAccess: true,
    preTest: { score: 14, total: 20, percent: 70, version: 'demo-fixture' },
    questProgress: {
      about_myself: { score: 9, total: 10, pct: 90, best: 90, passed: true, attempts: 1, roundsPlayed: 1, stars: [3] },
      family: { score: 8, total: 10, pct: 80, best: 80, passed: true, attempts: 2, roundsPlayed: 2, stars: [2, 3] },
      school: { score: 7, total: 10, pct: 70, best: 70, passed: true, attempts: 1, roundsPlayed: 1, stars: [2] },
      question_words: { score: 8, total: 10, pct: 80, best: 80, passed: true, attempts: 1, roundsPlayed: 1, stars: [2] },
      pronouns_master: { score: 8, total: 10, pct: 80, best: 80, passed: true, attempts: 1, roundsPlayed: 1, stars: [2] },
      c3_labeling_lab: { score: 8, total: 10, pct: 80, best: 80, passed: true, attempts: 1, roundsPlayed: 1, stars: [2] },
      c3_ordering_quest: { score: 9, total: 10, pct: 90, best: 90, passed: true, attempts: 1, roundsPlayed: 1, stars: [3] },
      tenses_arena: { score: 8, total: 10, pct: 80, best: 80, passed: true, attempts: 1, roundsPlayed: 1, stars: [2] },
      c3_graph_comparison: { score: 8, total: 10, pct: 80, best: 80, passed: true, attempts: 1, roundsPlayed: 1, stars: [2] },
    },
    badgeStats: {
      streakDays: 4,
      mistakesFixed: 8,
      totalAnswered: 64,
      totalCorrect: 51,
      correctBySkill: { vocabulary: 16, reading: 10, grammar: 9 },
      pretestScore: 70,
      posttestScore: 82,
    },
    rankingStats: { totalAnswered: 64, totalCorrect: 51, fastGuessCount: 1, averageTimePerQuestion: 7 },
    badges: ['first_quest', 'vocab_rookie'],
    mistakeBank: {},
    arenaStats: { arenaBadges: [], arenaRankScore: 0, attempts: [], finalExamResult: null },
    createdAt: now(),
    updatedAt: now(),
  };
}

export const DEMO_RANKING_STUDENTS = Object.freeze([
  { id: 'demo_rank_1', name: 'ฟาตีมะ', class: 'ป.6/1', xp: 2000, level: 7, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] } }, rankingStats: { totalAnswered: 100, totalCorrect: 95, averageTimePerQuestion: 4 }, badgeStats: { pretestScore: 40, posttestScore: 80, streakDays: 5, mistakesFixed: 20, correctBySkill: { vocabulary: 15 } } },
  { id: 'demo_rank_2', name: 'อาหมัด', class: 'ป.6/2', xp: 1800, level: 6, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3] } }, rankingStats: { totalAnswered: 80, totalCorrect: 70, averageTimePerQuestion: 5 }, badgeStats: { pretestScore: 30, posttestScore: 60, streakDays: 3, mistakesFixed: 10, correctBySkill: { vocabulary: 10 } } },
  { id: 'demo_rank_3', name: 'อาดีล', class: 'ป.6/1', xp: 1500, level: 6, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2] } }, rankingStats: { totalAnswered: 60, totalCorrect: 40, averageTimePerQuestion: 6 }, badgeStats: { pretestScore: 20, posttestScore: 40, streakDays: 1, mistakesFixed: 5, correctBySkill: { vocabulary: 5 } } },
  { id: 'demo_rank_4', name: 'ซัยนับ', class: 'ป.6/2', xp: 1320, level: 5, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 3, 3, 3, 3, 2, 2] } }, rankingStats: { totalAnswered: 72, totalCorrect: 55, averageTimePerQuestion: 6 }, badgeStats: { pretestScore: 45, posttestScore: 68, streakDays: 4, mistakesFixed: 8, correctBySkill: { vocabulary: 12 } } },
  { id: 'demo_rank_5', name: 'ยูซุฟ', class: 'ป.6/1', xp: 1180, level: 5, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 3, 3, 2, 2, 2] } }, rankingStats: { totalAnswered: 66, totalCorrect: 48, averageTimePerQuestion: 7 }, badgeStats: { pretestScore: 38, posttestScore: 62, streakDays: 3, mistakesFixed: 7, correctBySkill: { vocabulary: 11 } } },
  { id: 'demo_rank_6', name: 'มารียัม', class: 'ป.6/2', xp: 960, level: 4, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 3, 2, 2, 2] } }, rankingStats: { totalAnswered: 58, totalCorrect: 41, averageTimePerQuestion: 8 }, badgeStats: { pretestScore: 35, posttestScore: 58, streakDays: 2, mistakesFixed: 6, correctBySkill: { vocabulary: 9 } } },
  { id: 'demo_rank_7', name: 'อิบรอฮีม', class: 'ป.6/1', xp: 740, level: 3, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 3, 2, 2, 2] } }, rankingStats: { totalAnswered: 54, totalCorrect: 36, averageTimePerQuestion: 7 }, badgeStats: { pretestScore: 32, posttestScore: 52, streakDays: 2, mistakesFixed: 4, correctBySkill: { vocabulary: 8 } } },
  { id: 'demo_rank_8', name: 'อามีนะฮ์', class: 'ป.6/2', xp: 560, level: 3, role: 'student', isDemo: true, questProgress: { demo: { stars: [3, 3, 3, 2, 2, 2] } }, rankingStats: { totalAnswered: 50, totalCorrect: 31, averageTimePerQuestion: 8 }, badgeStats: { pretestScore: 28, posttestScore: 48, streakDays: 1, mistakesFixed: 3, correctBySkill: { vocabulary: 7 } } },
]);
