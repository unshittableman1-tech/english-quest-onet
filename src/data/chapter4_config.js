export const ARENA_MISSIONS = [
  { 
    id: 'mini_mock_arena', 
    name: 'Mini Mock Arena', 
    icon: '🎯', 
    description: 'ข้อสอบอุ่นเครื่อง 10 ข้อ คละทักษะพื้นฐาน',
    questions: 10, 
    timeLimit: 600, // 10 minutes
    unlock: () => true // unlocked by default when Chapter 4 is open
  },
  { 
    id: 'speed_mock_challenge', 
    name: 'Speed Mock Challenge', 
    icon: '⚡', 
    description: 'ข้อสอบเร็ว 15 ข้อ ฝึกอ่านโจทย์และตัดตัวเลือก',
    questions: 15, 
    timeLimit: 900, // 15 minutes
    unlock: () => true
  },
  { 
    id: 'skill_mixed_mock', 
    name: 'Skill Mixed Mock', 
    icon: '🧠', 
    description: 'ข้อสอบคละ Signs, Conversation, Reading, Grammar',
    questions: 20, 
    timeLimit: 1500, // 25 minutes
    unlock: () => true
  },
  { 
    id: 'weakness_mock', 
    name: 'Weakness Mock', 
    icon: '🛠️', 
    description: 'ระบบสร้างข้อสอบจากจุดอ่อนของนักเรียน',
    questions: 20, 
    timeLimit: 1500, // 25 minutes
    unlock: () => true
  },
  { 
    id: 'full_mock_test', 
    name: 'Full Mock Test', 
    icon: '📝', 
    description: 'ข้อสอบจำลอง 30 ข้อ จับเวลาเหมือนสนามจริง',
    questions: 30, 
    timeLimit: 1800, // 30 minutes
    unlock: () => true
  },
  { 
    id: 'final_exam_simulation', 
    name: 'Final Exam Simulation', 
    icon: '👑', 
    description: 'สนามสอบใหญ่สุดท้าย จำลองข้อสอบ O-NET เต็มรูปแบบ',
    questions: 30, 
    timeLimit: 1800, // 30 minutes
    isBoss: true,
    unlock: (stats) => (stats?.bestFullMock?.percent || 0) >= 70 // ต้องผ่าน Full Mock 70% ขึ้นไป
  },
  { 
    id: 'onet_year_2564', 
    name: 'แนวข้อสอบ O-NET ปี 64', 
    icon: '📕', 
    description: 'แนวข้อสอบเสมือนจริง อิง Test Blueprint สทศ. ป.6 (32 ข้อ · 100 คะแนน · 60 นาที)',
    questions: 32, 
    timeLimit: 3600, // 60 minutes
    isYearSim: true,
    year: 2564,
    passRate: '60%',
    badgeLabel: 'ปี 2564',
    unlock: () => true
  },
  { 
    id: 'onet_year_2565', 
    name: 'แนวข้อสอบ O-NET ปี 65', 
    icon: '📘', 
    description: 'แนวข้อสอบเสมือนจริง อิง Test Blueprint สทศ. ป.6 (32 ข้อ · 100 คะแนน · 60 นาที)',
    questions: 32, 
    timeLimit: 3600, // 60 minutes
    isYearSim: true,
    year: 2565,
    passRate: '64%',
    badgeLabel: 'ปี 2565',
    unlock: () => true
  },
  { 
    id: 'onet_year_2566', 
    name: 'แนวข้อสอบ O-NET ปี 66', 
    icon: '📗', 
    description: 'แนวข้อสอบเสมือนจริง อิง Test Blueprint สทศ. ป.6 (32 ข้อ · 100 คะแนน · 60 นาที)',
    questions: 32, 
    timeLimit: 3600, // 60 minutes
    isYearSim: true,
    year: 2566,
    passRate: '65%',
    badgeLabel: 'ปี 2566',
    unlock: () => true
  },
  { 
    id: 'onet_year_2567', 
    name: 'แนวข้อสอบ O-NET ปี 67', 
    icon: '📙', 
    description: 'แนวข้อสอบเสมือนจริง อิง Test Blueprint สทศ. ป.6 (32 ข้อ · 100 คะแนน · 60 นาที)',
    questions: 32, 
    timeLimit: 3600, // 60 minutes
    isYearSim: true,
    year: 2567,
    passRate: '58%',
    badgeLabel: 'ปี 2567',
    unlock: () => true
  },
  { 
    id: 'onet_year_2568', 
    name: 'จำลอง O-NET ปี 2568', 
    icon: '🎯', 
    description: 'ข้อสอบจำลองตามโครงสร้าง O-NET ป.6 ปี 2568 (32 ข้อ · 60 นาที)',
    questions: 32, 
    timeLimit: 3600, // 60 minutes
    isYearSim: true,
    year: 2568,
    passRate: '62%',
    badgeLabel: 'ปี 2568',
    unlock: () => true
  }
];

// ── Final Exam Config (สอบปลายภาค) ────────────────────────────
export const FINAL_EXAM_CONFIG = {
  id: 'final_exam',
  name: 'สอบปลายภาค 🎓',
  icon: '🎓',
  description: 'การสอบปลายภาคอย่างเป็นทางการ 50 ข้อ 100 คะแนน (ข้อละ 2 คะแนน) — สุ่มครอบคลุมทุกหัวข้อ ทำได้เพียงครั้งเดียว',
  questions: 50,
  timeLimit: 3600, // 60 minutes (1 hour)
  pointsPerQuestion: 2, // 50 questions × 2 points = 100 points
  totalPoints: 100,
  passingPercent: 70, // 70 points (35 questions)
  isFinalExam: true,
};
