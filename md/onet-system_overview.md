# 🗺️ System Overview — English Quest AI: O-NET Adventure ป.6

> **Version**: 1.0.0 · **Stack**: React 18 + Vite + TailwindCSS + Supabase + PWA  
> **Updated**: ตุลาคม 2569 · **Target Users**: นักเรียนประถม 6 & ครูผู้สอน

---

## 1. ภาพรวมระบบ (Big Picture)

```
┌─────────────────────────────────────────────────────────┐
│              English Quest O-NET Adventure               │
│                   React SPA (PWA)                        │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  นักเรียน    │  │    ครู       │  │  Demo Mode    │ │
│  │  (Student)   │  │  (Teacher)   │  │  (No Login)   │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │          │
│  ┌──────▼─────────────────▼───────────────────▼───────┐ │
│  │               AppContext (React Context)            │ │
│  │   navigate · student · addXP · completeQuest ...   │ │
│  └──────────────────────────┬──────────────────────────┘ │
│                             │                            │
│  ┌──────────────────────────▼──────────────────────────┐ │
│  │              Storage Layer (utils/storage.js)       │ │
│  │   localStorage (session) + Supabase (cloud sync)   │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
              ┌───────────────▼───────────────┐
              │        Supabase DB             │
              │   Table: students              │
              │   Table: exam_sessions         │
              └───────────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | รายละเอียด |
|---|---|---|
| **Frontend Framework** | React 18.3.1 | Functional components + Hooks |
| **Build Tool** | Vite 5.4.2 | Dev server port 5173, fast HMR |
| **Styling** | TailwindCSS 3.4.10 | Custom tokens + `index.css` utilities |
| **Animations** | framer-motion 11.3.19 | Modal transitions, micro-animations |
| **Confetti** | canvas-confetti 1.9.4 | Level-up & badge celebration |
| **Database** | Supabase (PostgreSQL) | Cloud sync, `students` table |
| **Legacy DB** | Firebase Firestore | มี config แต่ storage.js ใช้ Supabase เป็นหลัก |
| **PWA** | vite-plugin-pwa 1.3.0 | Standalone install, offline-first |
| **State** | React Context (AppContext) | ไม่ใช้ Redux/Zustand |
| **Routing** | Custom page-state machine | ไม่ใช้ React Router |

---

## 3. โครงสร้างไฟล์ (File Structure)

```
o net/
├── src/
│   ├── App.jsx                  ← Root component + AppContext provider
│   ├── main.jsx                 ← React DOM entry point
│   ├── index.css                ← Design system (tokens, glass-card, animations)
│   │
│   ├── config/
│   │   ├── supabase.js          ← Supabase client (primary DB)
│   │   └── firebase.js          ← Firebase/Firestore (legacy, offline cache)
│   │
│   ├── utils/
│   │   ├── storage.js           ← CRUD สำหรับ student data (LS + Supabase)
│   │   ├── scoring.js           ← XP, Level, Badge, Ranking algorithms
│   │   ├── arenaStorage.js      ← Chapter 4 Arena + Final Exam storage
│   │   ├── audio.js             ← BGM & SFX helpers
│   │   ├── avatar.js            ← Avatar/icon utilities
│   │   ├── cacheHelper.js       ← Cache TTL management
│   │   └── useSpeech.js         ← Web Speech API hook (TTS)
│   │
│   ├── data/
│   │   ├── questions.js         ← Chapter 1 questions (~225KB, คลังข้อสอบหลัก)
│   │   ├── chapter3_questions.js← Chapter 3 strategy questions (~78KB)
│   │   ├── chapter4_questions.js← Chapter 4 Arena questions (~122KB)
│   │   ├── chapter4_config.js   ← Arena mission config (6 modes)
│   │   ├── finalBossQuestions.js← Final Boss questions
│   │   ├── lessons.js           ← Mini lesson content per quest
│   │   ├── badges.js            ← Badge definitions + unlock logic
│   │   ├── vocab_dictionary.js  ← Vocabulary for tooltip/translation
│   │   └── missions/
│   │       ├── ch1_missions.js  ← Chapter 1 game missions (flashcard, fill-blank etc.)
│   │       ├── ch2_missions.js  ← Chapter 2 missions
│   │       ├── ch3_missions.js  ← Chapter 3 missions
│   │       └── ch5_missions.js  ← Chapter 5 missions
│   │
│   └── components/
│       ├── App-level
│       │   ├── Navigation.jsx        ← Bottom nav bar (map/badge/report/review/ranking)
│       │   ├── BGMToggle.jsx         ← Background music toggle button
│       │   ├── XPToast.jsx           ← XP gain notification toast
│       │   ├── BadgeModal.jsx        ← Badge unlock popup
│       │   ├── DailyRewardModal.jsx  ← Daily login streak reward
│       │   └── CuteUpdateModal.jsx   ← App update notification
│       │
│       ├── Auth & Landing
│       │   ├── LandingPage.jsx       ← หน้าแรก (เลือก Login / Demo)
│       │   ├── StudentLoginPage.jsx  ← นักเรียน login (ชั้น + เลขที่)
│       │   └── TeacherLoginPage.jsx  ← ครู login (username/password)
│       │
│       ├── Student Flow
│       │   ├── PreTestPage.jsx       ← ข้อสอบ Pre-test (ก่อนเรียน)
│       │   ├── QuestMap.jsx          ← แผนที่ Quest ทั้งหมด (28KB)
│       │   ├── MiniLesson.jsx        ← บทเรียนสั้นก่อนทำข้อสอบ
│       │   ├── QuizPage.jsx          ← หน้าทำข้อสอบหลัก (24KB)
│       │   ├── FeedbackModal.jsx     ← Feedback หลังตอบ (ถูก/ผิด + เหตุผล)
│       │   ├── MissionSelect.jsx     ← เลือก game mission ภายใน quest
│       │   ├── FinalBoss.jsx         ← Boss ปลาย Chapter 1 (14KB)
│       │   ├── BadgePage.jsx         ← คอลเลคชัน Badge
│       │   ├── StudentReport.jsx     ← รายงานความก้าวหน้าของนักเรียน
│       │   ├── ReviewMistakePage.jsx ← ฝึกซ้ำข้อที่ผิด (Mistake Bank)
│       │   ├── TechniqueHub.jsx      ← ฮับเทคนิคการสอบ O-NET
│       │   ├── VocabDrillHub.jsx     ← ฝึกคำศัพท์ Flashcard drill
│       │   ├── RealOnetSimulator.jsx ← จำลองข้อสอบ O-NET จริง (22KB)
│       │   ├── SpeakButton.jsx       ← ปุ่มฟังเสียง TTS
│       │   └── VocabTooltip.jsx      ← Tooltip คำแปลศัพท์
│       │
│       ├── Chapter 4 — O-NET Arena
│       │   ├── OnetArena.jsx         ← หน้าหลัก Arena (mission list, 19KB)
│       │   ├── ExamMode.jsx          ← โหมดสอบ timed (12KB)
│       │   ├── ExamReport.jsx        ← รายงานหลังสอบแต่ละ mission
│       │   └── FinalExamReport.jsx   ← รายงานสอบปลายภาค (13KB)
│       │
│       ├── Ranking System
│       │   ├── RankingPage.jsx           ← หน้า Leaderboard หลัก
│       │   └── ranking/
│       │       ├── LeaderboardList.jsx   ← รายการอันดับ
│       │       ├── LeaderboardTabs.jsx   ← Tab (Class / All)
│       │       ├── TopThreePodium.jsx    ← โพเดียมอันดับ 1-3
│       │       ├── MyRankCard.jsx        ← การ์ดอันดับตัวเอง
│       │       ├── TierBadge.jsx         ← แสดง Tier icon
│       │       ├── TierInfoModal.jsx     ← ข้อมูล Tier system
│       │       ├── LoginRankModal.jsx    ← แสดงอันดับตอน login
│       │       ├── RankShiftToast.jsx    ← แจ้งเตือนเมื่ออันดับเปลี่ยน
│       │       ├── RankWatcher.jsx       ← Background watcher อันดับ
│       │       └── RankingTips.jsx       ← เคล็ดลับเพิ่มอันดับ
│       │
│       ├── Mini Games
│       │   └── games/
│       │       ├── GameMissionRouter.jsx ← Router เลือก game type
│       │       ├── FlashcardGame.jsx     ← เกม Flashcard (12KB)
│       │       ├── FillBlankGame.jsx     ← เกม Fill in the blank
│       │       ├── MatchingGame.jsx      ← เกม Matching pairs
│       │       ├── RearrangeGame.jsx     ← เกม Rearrange words
│       │       ├── ConvoGame.jsx         ← เกม Conversation
│       │       └── StoryTapGame.jsx      ← เกม Story tap
│       │
│       └── Teacher
│           ├── TeacherDashboard.jsx   ← Dashboard ครู (166KB — ไฟล์ใหญ่ที่สุด)
│           └── ClearCacheBtn.jsx      ← ปุ่มล้าง cache
```

---

## 4. Routing System (Page State Machine)

ระบบไม่ใช้ React Router แต่ใช้ `page` state ใน `App.jsx`:

```
landing
  ├── student-login → [login] → pretest → map
  ├── teacher-login → [login] → teacher
  └── demo          → map (isDemo = true)

map
  ├── lesson       (currentQuest)
  ├── quiz         (currentQuest)
  ├── mission-select (currentQuest) → game (currentMission)
  ├── finalboss
  ├── technique-hub
  ├── vocab-drill
  ├── real-simulator
  ├── arena        → exam (currentQuest) → exam-report
  │                → final-exam → final-exam-report
  ├── badge
  ├── report
  ├── review
  └── ranking

teacher (standalone, ไม่มี bottom nav)
```

### Pages ที่แสดง Bottom Nav:
`map`, `badge`, `report`, `review`, `ranking`

---

## 5. AppContext API

`useApp()` hook ให้เข้าถึง:

| Property/Function | Type | คำอธิบาย |
|---|---|---|
| `page` | string | หน้าปัจจุบัน |
| `navigate(target, quest?)` | function | เปลี่ยนหน้า |
| `student` | object \| null | ข้อมูล student ปัจจุบัน |
| `setStudent` | function | อัปเดต student state |
| `currentQuest` | string | Quest ID ที่เลือกอยู่ |
| `questProgress` | object | `{ questId: { pct, passed, stars, ... } }` |
| `unlockedQuests` | object | `{ questId: boolean }` — quests ที่ unlock แล้ว |
| `xpInfo` | object | `{ current, needed, pct }` — XP progress to next level |
| `addXP(amount, reason)` | async | เพิ่ม XP + check level up |
| `completeQuest(id, score, total)` | async | บันทึกผล quest + award XP |
| `completePreTest(scores, total)` | async | บันทึก pre-test |
| `saveMistake(studentId, q)` | async | บันทึกข้อผิด |
| `processReviewAnswer(id, qId, correct)` | async | ประมวลผลการฝึกซ้ำ |
| `handleLogin(student)` | function | Login นักเรียน |
| `handleTeacherLogin(account)` | function | Login ครู |
| `handleLogout()` | function | Logout + set offline |
| `showToast(msg)` | function | แสดง toast notification |
| `unlockBadge(badgeId)` | async | Unlock badge + show modal |
| `checkBadges()` | async | ตรวจสอบ badges ที่ควรได้รับ |
| `viewFinalExamReport(result?)` | function | นำทางไปหน้ารายงาน Final Exam |

---

## 6. Student Data Model (Supabase: `students` table)

```js
{
  id:             "std_1234567890_abc123",   // Auto-generated
  name:           "ด.ช.สมชาย ใจดี",
  class:          "ป.6/1",
  number:         "5",
  role:           "student",                 // 'student' | 'teacher'
  isDemo:         false,
  xp:             1250,
  level:          7,
  badges:         ["vocab_master", "streak_3"],
  translatePermission: "full",              // 'full' | 'vocab_only' | 'off'
  
  preTest: {
    categoryScores: { vocabulary: 8, grammar: 6, ... },
    totalScore:     20,
    date:           "2026-09-01T..."
  },
  
  questProgress: {
    vocabulary: { score: 85, total: 100, pct: 85, passed: true, best: 90, attempts: 3, stars: [2,3,2], roundsPlayed: 3, lastPlayed: "..." },
    signs:      { ... },
    // ...
  },
  
  mistakeBank: {
    "q_vocab_001": { ...questionObj, timesWrong: 2, correctInReview: 1, mastered: false, addedAt: "..." }
  },
  
  finalBoss: {
    score: 18, total: 20, pct: 90, passed: true, date: "..."
  },
  
  badgeStats: {
    correctBySkill:    { vocabulary: 45, grammar: 30, ... },
    mistakesFixed:     12,
    streakDays:        5,
    lastLoginDate:     "2026-09-11",
    maxCombo:          8,
    retryCorrectCount: 3,
    failedThenPassed:  2,
    pretestScore:      65,
    posttestScore:     82,
    perfectLevels:     4,
    twoStepTotal:      20,
    twoStepBothCorrect: 14,
    // ...
  },
  
  rankingStats: {
    totalAnswered:          250,
    totalCorrect:           210,
    fastGuessCount:         3,
    averageTimePerQuestion: 18.5
  },
  
  arenaStats: {               // Chapter 4 data
    bestMiniMock:       { score: 9, total: 10, percent: 90, timeUsed: 320, date: "..." },
    bestSpeedMock:      { ... },
    bestSkillMixedMock: { ... },
    bestWeaknessMock:   { ... },
    bestFullMock:       { ... },
    bestFinalSimulation:{ ... },
    finalExamResult:    { score: 42, total: 50, points: 84, percent: 84, skillScores: {...} },
    arenaBadges:        ["arena_challenger", "speed_solver"],
    arenaRankScore:     430,
    attempts:           [ ...last20Attempts ]
  },
  
  lastActive:    "2026-09-11T14:00:00.000Z",  // Online heartbeat
  createdAt:     "2026-08-01T...",
  updatedAt:     "2026-09-11T..."
}
```

---

## 7. Storage Architecture

### การไหลของข้อมูล:

```
[User Action]
     │
     ▼
[updateCurrentStudent(updates)]
     │
     ├─── localStorage.setItem('eq_onet_current', ...)   ← ทันที (sync)
     │
     └─── supabase.from('students').update(...)           ← background (async, non-blocking)
```

### Cache Strategy สำหรับ Teacher Dashboard:

```
getAllStudents()
     │
     ├─ if cache < 5 min → return cached
     │
     └─ else → fetch Supabase → update cache → return
```

### Arena Storage (Chapter 4):

```
localStorage:  eng_quest_arena_{studentId}  ← Fast read/write
Supabase:      students.arenaStats          ← Cross-device sync (background)
```

---

## 8. XP & Level System

### XP Events (จาก `scoring.js`):

| Event | XP |
|---|---|
| ตอบถูกครั้งแรก | +10 |
| ตอบถูกหลังดูเฉลย | +5 |
| ทำครบ 10 ข้อ | +20 |
| ผ่านด่าน ≥70% | +50 |
| ผ่านด่าน ≥90% | +100 |
| ได้ Badge ใหม่ | +30 |
| ทำ Pre-test | +15 |
| ผ่าน Final Boss | +150 |
| Combo ×3 | +5 |
| Combo ×5 | +15 |
| Combo ×10 | +30 |
| เล่นซ้ำ quest ที่ผ่านแล้ว | ×50% XP |

### Level Progression:

| ช่วง Level | XP/Level | XP สะสมถึง Level ปลาย |
|---|---|---|
| Lv 1–10 | 200 | 1,800 |
| Lv 11–20 | 350 | 5,300 |
| Lv 21–30 | 500 | 10,300 |
| Lv 31–40 | 750 | 17,800 |
| Lv 41–50 | 1,000 | 27,800 |
| Lv 51+ | 1,500 | ∞ |

### Level Titles:

```
Lv 1–5:  Quest Beginner 🌱
Lv 6–10: Quest Explorer 🗺️
Lv 11–15: Quest Adventurer ⚔️
Lv 16–20: Quest Knight 🛡️
Lv 21–25: Quest Hero 🦸
Lv 26–30: Quest Champion 🏅
Lv 31–35: Grammar Master ⚡
Lv 36–40: O-NET Warrior 🔥
Lv 41–50: O-NET Champion 👑
Lv 51+:  O-NET Legend ✨
```

---

## 9. Quest / Chapter Structure

### Chapter 1 — O-NET Core Skills (7 Quests)

| Quest ID | ชื่อ | Unlock Condition |
|---|---|---|
| `vocabulary` | Vocabulary | เสมอ (เริ่มต้น) |
| `signs` | Signs | เสมอ |
| `directions` | Directions | เสมอ |
| `market` | Market | ผ่าน vocabulary |
| `conversation` | Conversation | ผ่าน signs + directions |
| `reading` | Reading | ผ่าน vocab + signs + directions |
| `grammar` | Grammar | ผ่าน reading |
| `finalboss` | Final Boss | ผ่าน **ทุก** quest ข้างต้น |

### Chapter 2 — Extended Vocabulary (4 Quests)

Unlock หลังผ่าน Final Boss:

| Quest ID | ชื่อ |
|---|---|
| `illness` | Illness & Health |
| `jobs` | Jobs & Occupations |
| `food` | Food & Drinks |
| `numbers` | Numbers & Math |

### Chapter 3 — Two-Step Strategy (5 Quests + Boss)

Unlock หลัง Chapter 2 ผ่านทั้งหมด (avg ≥70%):

| Quest ID | ชื่อ |
|---|---|
| `question_words` | Question Words |
| `sign_detective` | Sign Detective |
| `conversation_rescue` | Conversation Rescue |
| `map_escape` | Map Escape |
| `reading_detective` | Reading Detective |
| `strategy_boss` | Strategy Boss |

### Chapter 4 — O-NET Arena (6 Missions)

Unlock หลัง `strategy_boss`:

| Mission | ข้อ | เวลา | Unlock |
|---|---|---|---|
| Mini Mock Arena 🎯 | 10 | 10 นาที | ทันที |
| Speed Mock Challenge ⚡ | 15 | 15 นาที | ทันที |
| Skill Mixed Mock 🧠 | 20 | 25 นาที | ทันที |
| Weakness Mock 🛠️ | 20 | 25 นาที | ทันที |
| Full Mock Test 📝 | 30 | 30 นาที | ทันที |
| Final Exam Simulation 👑 | 30 | 30 นาที | Full Mock ≥70% |

### Final Exam (สอบปลายภาค)

- **50 ข้อ**, 100 คะแนน (ข้อละ 2 คะแนน)
- เวลา **60 นาที**
- ทำได้ **เพียงครั้งเดียว** (one-shot, ไม่สามารถ retry ได้)
- Unlock: Teacher เปิดด้วย PIN

---

## 10. Mini Game Types

| Game Type | Component | คำอธิบาย |
|---|---|---|
| `flashcard` | FlashcardGame | ท่องคำศัพท์ flip card |
| `fill_blank` | FillBlankGame | เติมคำในช่องว่าง |
| `matching` | MatchingGame | จับคู่คำ-ความหมาย |
| `rearrange` | RearrangeGame | เรียงลำดับคำ |
| `conversation` | ConvoGame | เลือกคำตอบบทสนทนา |
| `story_tap` | StoryTapGame | แตะเลือกคำในเรื่อง |

---

## 11. Ranking System

### Rank Score Formula:

```
rankScore = cappedXP
          + (totalStars × 20)          // cap 15 stars/quest
          + (badgesCount × 50)
          + (completedMissions × 80)   // cap 5 rounds/quest
          + (completedQuests × 150)
          + (mistakesFixed × 10)
          + (growthScore × 15)         // post - pre test score
          + (finalBossScore × 5)
          - (adjustedFastGuess × 30)   // penalty สำหรับ spam click
```

**XP Cap**: `(legitimateAnswers × 50) + 2000` — ป้องกัน XP farming

### Ranking Tiers (10 ระดับ):

| Tier | Min Score | Icon |
|---|---|---|
| Novice Trainee | 0 | 🌱 |
| Bronze Adventurer | 500 | 🪵 |
| Silver Explorer | 1,500 | 🥈 |
| Gold Scholar | 4,000 | 🥇 |
| Platinum Guardian | 8,000 | 🛡️ |
| Diamond Master | 15,000 | 💎 |
| Grandmaster | 30,000 | 🐉 |
| O-NET Legend | 50,000 | 👑 |
| Mythic Conqueror | 75,000 | 🏆 |
| O-NET God | 100,000 | 🌟 |

---

## 12. Badge System

### Badge Categories (จาก `data/badges.js`):

- **Skill Badges** — ผ่าน quest แต่ละหมวด
- **Streak Badges** — ล็อคอินติดต่อกัน (3, 7, 14, 30 วัน)
- **Performance Badges** — คะแนนสูง (90%+, Perfect)
- **Review Badges** — แก้ข้อผิดในระบบ Mistake Bank
- **Strategy Badges** — Two-step strategy accuracy
- **Arena Badges** — ผ่าน Arena missions
- **Combo Badges** — ตอบต่อเนื่องไม่ผิด

### Badge Unlock Logic:
`checkUnlockedBadges(student, existingBadges)` ใน `data/badges.js` — ตรวจสอบทุก badge condition เมื่อจบ quest

---

## 13. Daily Streak Reward System

### Rewards (วนซ้ำทุก 7 วัน):

| วัน | XP | Icon |
|---|---|---|
| 1 | 25 | 🌱 |
| 2 | 50 | 🔥 |
| 3 | 100 ⭐ | ⚡ |
| 4 | 150 | 💫 |
| 5 | 200 ⭐ | 🌟 |
| 6 | 300 | 🚀 |
| 7 | 500 ⭐ | 👑 |

Claim แล้วจะไม่แสดงซ้ำในวันเดิม (`lastRewardClaimedDate`)

---

## 14. Online Status System

```
[Student] → updateLastActive(id)     ← ทันทีที่ login
         → interval 4 นาที (tab visible เท่านั้น)
         → setOffline(id) เมื่อ logout

[Teacher Dashboard] → handleCheckOnline()
                    → getStudentsOnlineStatus(withinMinutes = 10)
                    → แสดงนักเรียนที่ lastActive ≥ 10 นาทีที่ผ่านมา
```

---

## 15. Teacher Dashboard Features

หน้า [TeacherDashboard.jsx](file:///c:/Users/Omarov/Desktop/o%20net/src/components/TeacherDashboard.jsx) (166KB) ประกอบด้วย:

### ส่วน Global (มองเห็นตลอด):

- **Class Filter** — กรองดูเฉพาะห้องเรียน
- **Online Status** — เช็คสถานะ real-time (on-demand)
- **Top Stats** — 4 cards: จำนวนนักเรียน, Pre-test เฉลี่ย, คะแนนปัจจุบัน, Growth
- **Weak Areas** — จุดอ่อนของทั้งห้อง
- **Pie Charts** ← (เพิ่งเพิ่ม) — สัดส่วนระดับผล, อัตราสำเร็จ Quest, Weak Quest map

### Tabs:

| Tab | เนื้อหา |
|---|---|
| 📋 ภาพรวม | แสดงรายนักเรียน + mini progress bars |
| 📊 ตารางนักเรียน | Full table + sort + pagination + สิทธิ์คำแปล |
| 🏆 Ranking Summary | Top 5 + Fast-guess stats |
| 🧠 Strategy Analytics | Two-step accuracy + Lucky guessers |
| 🏟️ O-NET Arena | Arena best scores ทุกนักเรียน |

### Teacher Actions:

- Import CSV / Google Sheets
- Export CSV
- เพิ่มนักเรียนทีละคน
- ลบนักเรียน / Reset ทั้งห้อง
- Toggle สิทธิ์คำแปล (แปลทั้งหมด / เฉพาะศัพท์ / ปิด)
- เปิด/ปิด Final Exam Session (PIN)

---

## 16. Translation Permission System

ครูสามารถควบคุมการแปลภาษาของนักเรียนแต่ละคน:

| Permission | ค่า | คำอธิบาย |
|---|---|---|
| 🟢 แปลทั้งหมด | `"full"` | แปลได้ทุกอย่าง (default) |
| 🟡 เฉพาะศัพท์ | `"vocab_only"` | แปลเฉพาะคำศัพท์ ไม่แปลโจทย์ |
| 🔴 ปิดแปล | `"off"` | ปิดทั้งหมด (เหมาะวันสอบ) |

---

## 17. PWA Configuration

```json
{
  "name": "O-NET Adventure",
  "short_name": "O-NET Adv",
  "display": "standalone",
  "theme_color": "#1e293b",
  "background_color": "#0f172a"
}
```

**Strategy**: `autoUpdate` — Service worker อัปเดตอัตโนมัติ, `skipWaiting: true`, `clientsClaim: true`

**Runtime Caching**: ปิด (network-first เสมอ เพื่อให้ข้อมูลล่าสุด)

---

## 18. Mistake Bank System

เมื่อนักเรียนตอบผิด:
1. ข้อนั้นถูกเก็บลง `mistakeBank[questionId]`
2. นักเรียนเห็นในหน้า **Review Mistake** 
3. ตอบถูก 2 ครั้งติดกัน → `mastered: true` (ออกจาก active bank)
4. แก้ข้อผิดได้ลด `fastGuessCount` -5 (เป็น incentive ให้ไม่ spam click)

---

## 19. Key Files by Size (ใหญ่ที่สุด)

| ไฟล์ | ขนาด | หมายเหตุ |
|---|---|---|
| `TeacherDashboard.jsx` | **166KB** | ใหญ่สุด — รวมทุก feature ของครู |
| `data/questions.js` | **225KB** | คลังข้อสอบ Chapter 1 |
| `data/chapter4_questions.js` | **122KB** | คลังข้อสอบ Arena |
| `data/chapter3_questions.js` | **78KB** | คลังข้อสอบ Strategy |
| `data/badges.js` | **23KB** | Badge definitions |
| `data/lessons.js` | **11KB** | เนื้อหาบทเรียน |

---

## 20. Environment Variables

```env
VITE_SUPABASE_URL=https://rultxzglaxnojkoyzhnk.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

หากไม่มี `.env` ระบบจะ fallback ใช้ hardcoded defaults ใน `supabase.js`

---

## 21. Demo Mode

```js
DEMO_STUDENT = {
  id: 'demo_student',
  isDemo: true,
  role: 'student',
  xp: 0, level: 1, badges: []
}
```

- XP และ quest results ไม่ถูกบันทึกลง Supabase
- ทุก state เก็บใน memory เท่านั้น (จะหายเมื่อ refresh)
- ไม่มี Daily Reward / Badge unlock จริง

---

## 22. Deployment

```
Firebase Hosting (Primary):
  Project: o-net69
  Domain: o-net69.web.app

Build:
  npm run build → dist/
  vite build (ESM + tree-shaking)
```

---

*สร้างโดย Antigravity IDE — อัปเดต: ตุลาคม 2569*
