import { getEffectiveBadgeStats } from '../utils/preTestResult.js';

const growth = stats => Number.isFinite(stats.pretestScore) && Number.isFinite(stats.posttestScore)
  ? Math.max(0, stats.posttestScore - stats.pretestScore) : 0;

export const BADGE_CATEGORIES = {
  Vocabulary: { name: 'คำศัพท์ (Vocabulary)', color: 'from-blue-500 to-cyan-400' },
  Signs:      { name: 'ป้ายสัญลักษณ์ (Signs)', color: 'from-red-500 to-orange-400' },
  Directions: { name: 'บอกทิศทาง (Directions)', color: 'from-green-500 to-emerald-400' },
  Conversation:{ name: 'บทสนทนา (Conversation)', color: 'from-purple-500 to-violet-400' },
  Reading:    { name: 'การอ่าน (Reading)', color: 'from-indigo-500 to-blue-600' },
  Grammar:    { name: 'ไวยากรณ์ (Grammar)', color: 'from-pink-500 to-rose-400' },
  Effort:     { name: 'ความพยายาม (Effort)', color: 'from-amber-500 to-yellow-400' },
  Growth:     { name: 'การพัฒนา (Growth)', color: 'from-teal-500 to-emerald-400' },
  Streak:     { name: 'การเรียนต่อเนื่อง (Streak)', color: 'from-orange-500 to-red-500' },
  Strategy:   { name: 'กลยุทธ์สอบ (Strategy)', color: 'from-fuchsia-500 to-purple-600' },
  Arena:      { name: 'โอเน็ตอารีน่า (O-NET Arena)', color: 'from-blue-600 to-indigo-600' },
  Special:    { name: 'ความสำเร็จพิเศษ (Special)', color: 'from-yellow-300 to-white' },
};

export const BADGES = [
  // ── Vocabulary ─────────────────────────────────────────────────────────────
  {
    id: 'vocab_rookie', name: 'Vocabulary Rookie', icon: '🚗', category: 'Vocabulary', tier: 'bronze',
    description: 'เริ่มจดจำคำศัพท์พื้นฐานได้แล้ว', conditionText: 'ตอบคำถามหมวด Vocabulary ถูก 30 ข้อ',
    xpReward: 30, maxProgress: 30,
    check: (stats) => stats.correctBySkill?.vocabulary >= 30,
    getProgress: (stats) => stats.correctBySkill?.vocabulary || 0
  },
  {
    id: 'vocab_hero', name: 'Vocabulary Hero', icon: '🧠', category: 'Vocabulary', tier: 'silver',
    description: 'เข้าใจคำศัพท์พื้นฐานได้เป็นอย่างดี', conditionText: 'ตอบคำถามหมวด Vocabulary ถูก 100 ข้อ',
    xpReward: 80, maxProgress: 100,
    check: (stats) => stats.correctBySkill?.vocabulary >= 100,
    getProgress: (stats) => stats.correctBySkill?.vocabulary || 0
  },
  {
    id: 'word_master', name: 'Word Master', icon: '👑', category: 'Vocabulary', tier: 'gold',
    description: 'เจ้าพ่อ/เจ้าแม่คำศัพท์ รู้ศัพท์เยอะมาก', conditionText: 'ตอบคำถามหมวด Vocabulary ถูก 250 ข้อ',
    xpReward: 150, maxProgress: 250,
    check: (stats) => stats.correctBySkill?.vocabulary >= 250,
    getProgress: (stats) => stats.correctBySkill?.vocabulary || 0
  },

  // ── Signs ──────────────────────────────────────────────────────────────────
  {
    id: 'sign_scout', name: 'Sign Scout', icon: '🚦', category: 'Signs', tier: 'bronze',
    description: 'เริ่มอ่านป้ายสัญลักษณ์จราจรได้', conditionText: 'ตอบคำถามหมวด Signs ถูก 30 ข้อ',
    xpReward: 30, maxProgress: 30,
    check: (stats) => stats.correctBySkill?.signs >= 30,
    getProgress: (stats) => stats.correctBySkill?.signs || 0
  },
  {
    id: 'sign_master', name: 'Sign Master', icon: '🛑', category: 'Signs', tier: 'silver',
    description: 'อ่านป้ายสัญลักษณ์ O-NET ได้คล่อง', conditionText: 'ตอบคำถามหมวด Signs ถูก 100 ข้อ',
    xpReward: 80, maxProgress: 100,
    check: (stats) => stats.correctBySkill?.signs >= 100,
    getProgress: (stats) => stats.correctBySkill?.signs || 0
  },
  {
    id: 'sign_legend', name: 'Sign Legend', icon: '🏆', category: 'Signs', tier: 'gold',
    description: 'เชี่ยวชาญการอ่านป้ายสัญลักษณ์อย่างแท้จริง', conditionText: 'ตอบหมวด Signs ถูก 150 ข้อ และได้ดาวเต็ม',
    xpReward: 150, maxProgress: 150,
    check: (stats) => stats.correctBySkill?.signs >= 150 && (stats.perfectLevels || 0) >= 1,
    getProgress: (stats) => stats.correctBySkill?.signs || 0
  },

  // ── Directions ─────────────────────────────────────────────────────────────
  {
    id: 'direction_walker', name: 'Direction Walker', icon: '🧭', category: 'Directions', tier: 'bronze',
    description: 'เข้าใจทิศทางและการเดินทาง', conditionText: 'ตอบคำถามหมวด Directions ถูก 30 ข้อ',
    xpReward: 30, maxProgress: 30,
    check: (stats) => stats.correctBySkill?.directions >= 30,
    getProgress: (stats) => stats.correctBySkill?.directions || 0
  },
  {
    id: 'direction_navigator', name: 'Direction Navigator', icon: '🗺️', category: 'Directions', tier: 'silver',
    description: 'เชี่ยวชาญการบอกทางเหมือนเป็น GPS มีชีวิต', conditionText: 'ตอบคำถามหมวด Directions ถูก 80 ข้อ',
    xpReward: 80, maxProgress: 80,
    check: (stats) => stats.correctBySkill?.directions >= 80,
    getProgress: (stats) => stats.correctBySkill?.directions || 0
  },

  // ── Conversation ───────────────────────────────────────────────────────────
  {
    id: 'polite_speaker', name: 'Polite Speaker', icon: '🙏', category: 'Conversation', tier: 'bronze',
    description: 'รู้จักใช้คำทักทายและการสนทนาเบื้องต้น', conditionText: 'ตอบคำถามหมวด Conversation ถูก 30 ข้อ',
    xpReward: 30, maxProgress: 30,
    check: (stats) => stats.correctBySkill?.conversation >= 30,
    getProgress: (stats) => stats.correctBySkill?.conversation || 0
  },
  {
    id: 'conversation_star', name: 'Conversation Star', icon: '💬', category: 'Conversation', tier: 'silver',
    description: 'สนทนาได้อย่างเป็นธรรมชาติและถูกต้อง', conditionText: 'ตอบคำถามหมวด Conversation ถูก 100 ข้อ',
    xpReward: 80, maxProgress: 100,
    check: (stats) => stats.correctBySkill?.conversation >= 100,
    getProgress: (stats) => stats.correctBySkill?.conversation || 0
  },

  // ── Reading ────────────────────────────────────────────────────────────────
  {
    id: 'detail_hunter', name: 'Detail Hunter', icon: '🔍', category: 'Reading', tier: 'bronze',
    description: 'จับใจความสำคัญและหารายละเอียดเก่ง', conditionText: 'ตอบคำถามหมวด Reading ถูก 30 ข้อ',
    xpReward: 50, maxProgress: 30,
    check: (stats) => stats.correctBySkill?.reading >= 30,
    getProgress: (stats) => stats.correctBySkill?.reading || 0
  },
  {
    id: 'reading_warrior', name: 'Reading Warrior', icon: '📖', category: 'Reading', tier: 'silver',
    description: 'อ่านเร็วและจับใจความได้ครบถ้วน', conditionText: 'ผ่านด่าน Reading 10 รอบ',
    xpReward: 100, maxProgress: 10,
    check: (stats) => (stats.readingPassagesCompleted || 0) >= 10,
    getProgress: (stats) => stats.readingPassagesCompleted || 0
  },

  // ── Grammar ────────────────────────────────────────────────────────────────
  {
    id: 'grammar_fighter', name: 'Grammar Fighter', icon: '🧩', category: 'Grammar', tier: 'silver',
    description: 'เข้าใจโครงสร้างไวยากรณ์พื้นฐาน', conditionText: 'ตอบคำถามหมวด Grammar ถูก 80 ข้อ',
    xpReward: 80, maxProgress: 80,
    check: (stats) => stats.correctBySkill?.grammar >= 80,
    getProgress: (stats) => stats.correctBySkill?.grammar || 0
  },
  {
    id: 'tense_master', name: 'Tense Master', icon: '⏳', category: 'Grammar', tier: 'gold',
    description: 'ใช้งาน Tense ได้อย่างแม่นยำ', conditionText: 'ทำข้อสอบหมวด Grammar ได้คะแนน ≥80%',
    xpReward: 120, maxProgress: 1, // binary condition
    check: (stats) => (stats.grammarBoss || 0) >= 80,
    getProgress: (stats) => (stats.grammarBoss || 0) >= 80 ? 1 : 0
  },

  // ── Effort ─────────────────────────────────────────────────────────────────
  {
    id: 'never_give_up', name: 'Never Give Up', icon: '💪', category: 'Effort', tier: 'silver',
    description: 'ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น!', conditionText: 'ตอบผิดแล้วแก้ตัวใหม่จนถูกสะสม 20 ครั้ง',
    xpReward: 50, maxProgress: 20,
    check: (stats) => (stats.retryCorrectCount || 0) >= 20,
    getProgress: (stats) => stats.retryCorrectCount || 0
  },
  {
    id: 'mistake_learner', name: 'Mistake Learner', icon: '🩹', category: 'Effort', tier: 'bronze',
    description: 'เริ่มต้นแก้ไขจุดอ่อนของตัวเอง', conditionText: 'แก้ไขข้อผิดสะสมได้ครบ 3 ข้อ',
    xpReward: 30, maxProgress: 3,
    check: (stats) => (stats.mistakesFixed || 0) >= 3,
    getProgress: (stats) => Math.min(3, stats.mistakesFixed || 0)
  },
  {
    id: 'mistake_fixer', name: 'Mistake Fixer', icon: '🔧', category: 'Effort', tier: 'silver',
    description: 'ตั้งใจทบทวนและแก้ไขข้อผิดอย่างต่อเนื่อง', conditionText: 'แก้ไขข้อผิดสะสมได้ครบ 10 ข้อ',
    xpReward: 50, maxProgress: 10,
    check: (stats) => (stats.mistakesFixed || 0) >= 10,
    getProgress: (stats) => Math.min(10, stats.mistakesFixed || 0)
  },
  {
    id: 'mistake_breaker', name: 'Mistake Breaker', icon: '🛠️', category: 'Effort', tier: 'gold',
    description: 'กล้าเผชิญหน้าและแก้ไขจุดอ่อนของตัวเอง', conditionText: 'แก้ไขข้อผิดสะสมได้ครบ 30 ข้อ',
    xpReward: 80, maxProgress: 30,
    check: (stats) => (stats.mistakesFixed || 0) >= 30,
    getProgress: (stats) => Math.min(30, stats.mistakesFixed || 0)
  },
  {
    id: 'comeback_hero', name: 'Comeback Hero', icon: '🧗', category: 'Effort', tier: 'gold',
    description: 'เคยล้มแล้วลุกขึ้นมาผ่านได้อย่างสง่างาม', conditionText: 'เคยเล่นไม่ผ่านแล้วกลับมาผ่านได้ 3 ด่าน',
    xpReward: 100, maxProgress: 3,
    check: (stats) => (stats.failedThenPassed || 0) >= 3,
    getProgress: (stats) => stats.failedThenPassed || 0
  },

  // ── Growth ─────────────────────────────────────────────────────────────────
  {
    id: 'growth_starter', name: 'Growth Starter', icon: '🌱', category: 'Growth', tier: 'silver',
    description: 'เห็นการพัฒนาอย่างชัดเจน', conditionText: 'คะแนน Post-test มากกว่า Pre-test 10%',
    xpReward: 80, maxProgress: 10,
    check: (stats) => growth(stats) >= 10,
    getProgress: growth
  },
  {
    id: 'growth_hero', name: 'Growth Hero', icon: '🚀', category: 'Growth', tier: 'gold',
    description: 'พัฒนาการก้าวกระโดดสุดยอด!', conditionText: 'คะแนน Post-test มากกว่า Pre-test 25%',
    xpReward: 150, maxProgress: 25,
    check: (stats) => growth(stats) >= 25,
    getProgress: growth
  },

  // ── Streak ─────────────────────────────────────────────────────────────────
  {
    id: 'streak_3', name: '3-Day Streak', icon: '🔥', category: 'Streak', tier: 'bronze',
    description: 'ความตั้งใจเริ่มต้นขึ้นแล้ว', conditionText: 'เข้าเรียนต่อเนื่อง 3 วัน',
    xpReward: 30, maxProgress: 3,
    check: (stats) => (stats.streakDays || 0) >= 3,
    getProgress: (stats) => stats.streakDays || 0
  },
  {
    id: 'streak_7', name: 'Weekly Warrior', icon: '🔥', category: 'Streak', tier: 'silver',
    description: 'เรียนรู้สม่ำเสมอครบสัปดาห์', conditionText: 'เข้าเรียนต่อเนื่อง 7 วัน',
    xpReward: 100, maxProgress: 7,
    check: (stats) => (stats.streakDays || 0) >= 7,
    getProgress: (stats) => stats.streakDays || 0
  },
  {
    id: 'streak_14', name: 'Quest Champion', icon: '🌟', category: 'Streak', tier: 'gold',
    description: 'วินัยคือหนทางสู่ความสำเร็จ', conditionText: 'เข้าเรียนต่อเนื่อง 14 วัน',
    xpReward: 200, maxProgress: 14,
    check: (stats) => (stats.streakDays || 0) >= 14,
    getProgress: (stats) => stats.streakDays || 0
  },

  // ── Strategy ───────────────────────────────────────────────────────────────
  {
    id: 'question_key', name: 'Question Key Holder', icon: '🗝️', category: 'Strategy', tier: 'silver',
    description: 'เชี่ยวชาญการใช้ Question Words', conditionText: 'ทำด่าน Question Word Gate ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1,
    check: (stats) => (stats.strategyQuests?.question_words || 0) >= 80,
    getProgress: (stats) => (stats.strategyQuests?.question_words || 0) >= 80 ? 1 : 0
  },
  {
    id: 'sign_detective', name: 'Sign Detective', icon: '🕵️', category: 'Strategy', tier: 'silver',
    description: 'สุดยอดนักสืบป้ายเตือน', conditionText: 'ทำด่าน Sign Detective ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1,
    check: (stats) => (stats.strategyQuests?.sign_detective || 0) >= 80,
    getProgress: (stats) => (stats.strategyQuests?.sign_detective || 0) >= 80 ? 1 : 0
  },
  {
    id: 'polite_responder', name: 'Polite Responder', icon: '💬', category: 'Strategy', tier: 'silver',
    description: 'ตอบคำถามมารยาทได้ยอดเยี่ยม', conditionText: 'ทำด่าน Conversation Rescue ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1,
    check: (stats) => (stats.strategyQuests?.conversation_rescue || 0) >= 80,
    getProgress: (stats) => (stats.strategyQuests?.conversation_rescue || 0) >= 80 ? 1 : 0
  },
  {
    id: 'map_escape_master', name: 'Map Escape Master', icon: '🗺️', category: 'Strategy', tier: 'silver',
    description: 'หลบหนีออกจากเขาวงกตแผนที่ได้', conditionText: 'ทำด่าน Map Escape ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1,
    check: (stats) => (stats.strategyQuests?.map_escape || 0) >= 80,
    getProgress: (stats) => (stats.strategyQuests?.map_escape || 0) >= 80 ? 1 : 0
  },
  {
    id: 'keyword_hunter', name: 'Keyword Hunter', icon: '🔍', category: 'Strategy', tier: 'gold',
    description: 'หา Keyword จับจุดถูกเผง', conditionText: 'ทำด่าน Reading Detective ได้ 80% ขึ้นไป',
    xpReward: 100, maxProgress: 1,
    check: (stats) => (stats.strategyQuests?.reading_detective || 0) >= 80,
    getProgress: (stats) => (stats.strategyQuests?.reading_detective || 0) >= 80 ? 1 : 0
  },
  {
    id: 'inference_ninja', name: 'Inference Ninja', icon: '🥷', category: 'Strategy', tier: 'gold',
    description: 'อ่านแบบอนุมานและคิดวิเคราะห์ได้ทะลุปรุโปร่ง', conditionText: 'ทำข้อสอบ Two-Step ได้ถูกต้องทั้งเหตุผลหลัก 20 ข้อ',
    xpReward: 100, maxProgress: 20,
    check: (stats) => (stats.twoStepBothCorrect || 0) >= 20,
    getProgress: (stats) => stats.twoStepBothCorrect || 0
  },
  {
    id: 'no_guess_knight', name: 'No Guess Knight', icon: '🛡️', category: 'Strategy', tier: 'gold',
    description: 'อัศวินผู้ไม่เคยเดา มั่นคงและแม่นยำ', conditionText: 'ตอบถูก 80% ขึ้นไป โดยใช้เวลาคิดเฉลี่ยเกิน 5 วิ (No Guess)',
    xpReward: 150, maxProgress: 1,
    check: (stats) => (stats.noGuessBadgeEarned || 0) >= 1,
    getProgress: (stats) => stats.noGuessBadgeEarned || 0
  },
  {
    id: 'strategy_castle_champion', name: 'Strategy Castle Champion', icon: '🏰', category: 'Strategy', tier: 'gold',
    description: 'ผู้พิชิตปราสาทกลยุทธ์', conditionText: 'เอาชนะ Strategy Castle Boss ได้',
    xpReward: 300, maxProgress: 1,
    check: (stats) => (stats.strategyBossPassed || 0) >= 1,
    getProgress: (stats) => stats.strategyBossPassed || 0
  },

  // ── Special ────────────────────────────────────────────────────────────────
  {
    id: 'combo_master', name: 'Combo Master', icon: '⚡', category: 'Special', tier: 'silver',
    description: 'สมาธิดีเยี่ยม ไม่มีสะดุด', conditionText: 'ตอบถูกติดกัน 10 ข้อ (Combo x10)',
    xpReward: 80, maxProgress: 10,
    check: (stats) => (stats.maxCombo || 0) >= 10,
    getProgress: (stats) => stats.maxCombo || 0
  },
  {
    id: 'onet_legend', name: 'O-NET Legend', icon: '👑', category: 'Special', tier: 'gold',
    description: 'พร้อมแล้วสำหรับสนามสอบ O-NET!', conditionText: 'ทำคะแนน Final Boss ได้ ≥ 70%',
    xpReward: 300, maxProgress: 1, // binary condition
    check: (stats) => (stats.bossPassed || 0) >= 1,
    getProgress: (stats) => stats.bossPassed || 0
  },
  // ── Arena (Chapter 4) ──────────────────────────────────────────────────────
  {
    id: 'arena_challenger', name: 'Arena Challenger', icon: '🎯', category: 'Arena', tier: 'bronze',
    description: 'ก้าวแรกสู่สังเวียน', conditionText: 'ทำ Mini Mock ได้ 80% ขึ้นไป',
    xpReward: 50, maxProgress: 1, check: () => false, getProgress: () => 0 // Checked in arenaStorage
  },
  {
    id: 'speed_solver', name: 'Speed Solver', icon: '⚡', category: 'Arena', tier: 'silver',
    description: 'นักแก้โจทย์ความเร็วแสง', conditionText: 'ทำ Speed Mock Challenge ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1, check: () => false, getProgress: () => 0
  },
  {
    id: 'mixed_skill_fighter', name: 'Mixed Skill Fighter', icon: '🧠', category: 'Arena', tier: 'silver',
    description: 'ทักษะรอบด้าน', conditionText: 'ทำ Skill Mixed Mock ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1, check: () => false, getProgress: () => 0
  },
  {
    id: 'weakness_crusher', name: 'Weakness Crusher', icon: '🛠️', category: 'Arena', tier: 'silver',
    description: 'ทำลายจุดอ่อน', conditionText: 'ทำ Weakness Mock ได้ 80% ขึ้นไป',
    xpReward: 80, maxProgress: 1, check: () => false, getProgress: () => 0
  },
  {
    id: 'mock_test_survivor', name: 'Mock Test Survivor', icon: '📝', category: 'Arena', tier: 'silver',
    description: 'ผู้รอดชีวิตจากสนามจำลอง', conditionText: 'ทำ Full Mock Test ผ่าน 70%',
    xpReward: 100, maxProgress: 1, check: () => false, getProgress: () => 0
  },
  {
    id: 'onet_ready', name: 'O-NET Ready!', icon: '✨', category: 'Arena', tier: 'gold',
    description: 'ความรู้แน่นปึ้ก', conditionText: 'ทำ Full Mock Test ได้ 80% ขึ้นไป',
    xpReward: 150, maxProgress: 1, check: () => false, getProgress: () => 0
  },
  {
    id: 'onet_champion', name: 'O-NET Champion', icon: '🏆', category: 'Arena', tier: 'gold',
    description: 'แชมป์เปี้ยนสนามสอบ', conditionText: 'ทำ Final Exam Simulation ได้ 80% ขึ้นไป',
    xpReward: 200, maxProgress: 1, check: () => false, getProgress: () => 0
  },
  {
    id: 'onet_legend_arena', name: 'O-NET Legend (Arena)', icon: '👑', category: 'Arena', tier: 'gold',
    description: 'ตำนานโอเน็ตตัวจริง', conditionText: 'ทำ Final Exam Simulation ได้ 90% ขึ้นไป',
    xpReward: 300, maxProgress: 1, check: () => false, getProgress: () => 0
  }
];

export function checkUnlockedBadges(student, currentBadges = []) {
  if (!student || !student.badgeStats) return [];
  
  const newlyUnlocked = [];
  const stats = getEffectiveBadgeStats(student);
  
  for (const badge of BADGES) {
    if (!currentBadges.includes(badge.id)) {
      if (badge.check(stats)) {
        newlyUnlocked.push(badge.id);
      }
    }
  }
  
  return newlyUnlocked;
}
