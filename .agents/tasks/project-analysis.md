# รายงานวิเคราะห์โปรเจกต์: English Quest AI — O-NET Adventure ป.6

> วิเคราะห์เมื่อ: ตรวจสอบจาก workspace `c:\Users\Omarov\Desktop\o net2`

---

## 1. สรุปภาพรวม (Executive Summary)

โปรเจกต์นี้คือ **เว็บแอปแนว Gamification สำหรับติวภาษาอังกฤษ O-NET ป.6** ชื่อ **English Quest AI: O-NET Adventure** พัฒนาด้วย React + Vite + TailwindCSS และ deploy บน Firebase Hosting ใช้ **Supabase (PostgreSQL)** เป็น cloud database หลักสำหรับบันทึกข้อมูลนักเรียน

โปรเจกต์มีระดับความสมบูรณ์สูงมาก — มีระบบ 4 บทเรียน (Chapter), Mini Game 6 แบบ, Ranking System, Teacher Dashboard ขนาดใหญ่, Daily Streak, Mistake Bank ครบถ้วน อย่างไรก็ตาม มีปัญหาสำคัญหลายจุดที่ต้องแก้ไข

---

## 2. ข้อมูลพื้นฐาน

| รายการ | ค่า |
|---|---|
| **ชื่อโปรเจกต์** | `english-quest-onet` (package.json) |
| **Version** | 1.0.0 |
| **กลุ่มเป้าหมาย** | นักเรียน ป.6 + ครู โรงเรียนบ้านน้ำใส สพม.ปัตตานี 2 |
| **Firebase Project** | `o-net69` (`.firebaserc`) |
| **Deploy URL** | `o-net69.web.app` |
| **Build output** | `dist/` |

---

## 3. Tech Stack

| Layer | Technology | รายละเอียด |
|---|---|---|
| **Frontend** | React 18.3.1 | Functional components + Hooks |
| **Build Tool** | Vite 5.4.2 | Dev server port 5173 |
| **Styling** | TailwindCSS 3.4.10 | + PostCSS, Autoprefixer |
| **Animations** | framer-motion 11.3.19 | Modal transitions |
| **Confetti** | canvas-confetti 1.9.4 | Level-up & badge |
| **Cloud DB** | Supabase (`@supabase/supabase-js` ^2.112.0) | PRIMARY — PostgreSQL |
| **Legacy DB** | Firebase Firestore (`firebase` ^12.15.0) | ✅ initialized แต่ **ไม่ได้ใช้ใน app** |
| **PWA** | vite-plugin-pwa ^1.3.0 | Workbox, standalone install |
| **State** | React Context (`AppContext`) | ไม่ใช้ Redux/Zustand |
| **Routing** | Custom page state machine | ไม่ใช้ React Router |
| **Hosting** | Firebase Hosting | `public: "dist"` + SPA rewrites |

---

## 4. โครงสร้าง Source Code

### 4.1 Directory Structure

```
src/
├── App.jsx              ← Root component + AppContext (state machine routing)
├── main.jsx             ← Entry point
├── index.css            ← Design system tokens
│
├── config/
│   ├── supabase.js      ← Supabase client (PRIMARY DB)
│   └── firebase.js      ← Firebase/Firestore (initialized แต่ไม่ถูก import ใน app)
│
├── utils/
│   ├── storage.js       ← CRUD operations (localStorage + Supabase)
│   ├── scoring.js       ← XP, Level, Badge, Rank score algorithms
│   ├── arenaStorage.js  ← Chapter 4 Arena + Final Exam storage
│   ├── audio.js         ← BGM & SFX helpers
│   ├── avatar.js        ← Avatar utilities
│   ├── cacheHelper.js   ← Cache TTL management
│   └── useSpeech.js     ← Web Speech API hook (TTS)
│
├── data/
│   ├── questions.js          ← Chapter 1 questions (219 KB — ใหญ่ที่สุด)
│   ├── chapter3_questions.js ← Chapter 3 strategy questions (76 KB)
│   ├── chapter4_questions.js ← Chapter 4 Arena questions (119 KB)
│   ├── chapter4_config.js    ← Arena mission config (6 modes)
│   ├── finalBossQuestions.js ← Final Boss questions (1.8 KB)
│   ├── lessons.js            ← Mini lesson content (11 KB)
│   ├── badges.js             ← Badge definitions + unlock logic (23 KB)
│   ├── vocab_dictionary.js   ← Vocabulary tooltips (16 KB)
│   └── missions/
│       ├── ch1_missions.js
│       ├── ch2_missions.js
│       ├── ch3_missions.js
│       └── ch5_missions.js   ← ⚠️ ch4_missions.js หายไป
│
└── components/
    ├── LandingPage.jsx       ← Decomposed เป็น sub-components ใน /landing/
    ├── StudentLoginPage.jsx
    ├── TeacherLoginPage.jsx
    ├── LoginPage.jsx         ← ⚠️ DEAD CODE (ไม่ถูก import ใน App.jsx)
    ├── QuestMap.jsx
    ├── QuizPage.jsx
    ├── PreTestPage.jsx
    ├── FinalBoss.jsx
    ├── MiniLesson.jsx
    ├── MissionSelect.jsx
    ├── ReviewMistakePage.jsx
    ├── TechniqueHub.jsx
    ├── VocabDrillHub.jsx
    ├── RealOnetSimulator.jsx
    ├── BadgePage.jsx
    ├── StudentReport.jsx
    ├── TeacherDashboard.jsx  ← ⚠️ 166KB (ใหญ่ผิดปกติ)
    ├── OnetArena.jsx
    ├── ExamMode.jsx
    ├── ExamReport.jsx
    ├── FinalExamReport.jsx
    ├── RankingPage.jsx
    ├── games/                ← Mini game components (6 types)
    ├── ranking/              ← Leaderboard sub-components (10 files)
    └── landing/              ← Landing page sub-components
```

### 4.2 Routing System (Page State Machine)

`App.jsx` ใช้ `useState('landing')` แทน React Router:

```
landing → student-login → pretest → map
        → teacher-login → teacher
        → demo → map (isDemo=true)

map → lesson / quiz / mission-select / game
    → finalboss / technique-hub / vocab-drill / real-simulator
    → arena → exam → exam-report
            → final-exam → final-exam-report
    → badge / report / review / ranking
```

Bottom Navigation แสดงเฉพาะ pages: `map`, `badge`, `report`, `review`, `ranking`

### 4.3 Data Flow

```
[User Action]
     │
     ▼
[AppContext functions: addXP, completeQuest, ...]
     │
     ├── localStorage.setItem('eq_onet_current', ...)  ← ทันที (sync)
     └── supabase.from('students').update(...)          ← async background
```

---

## 5. ฟีเจอร์ที่มีอยู่แล้ว

### 5.1 ระบบหลักที่ทำงานได้

| ฟีเจอร์ | สถานะ | ไฟล์หลัก |
|---|---|---|
| Landing Page (decomposed) | ✅ | `components/landing/*` |
| Student Login (ชั้น + เลขที่) | ✅ | `StudentLoginPage.jsx` |
| Teacher Login (username/password) | ✅ | `TeacherLoginPage.jsx` |
| Demo Mode | ✅ | `App.jsx` DEMO_STUDENT |
| Pre-test 20/30 ข้อ | ✅ | `PreTestPage.jsx` |
| Quest Map (4 Chapters) | ✅ | `QuestMap.jsx` |
| Quiz System + XP + Combo | ✅ | `QuizPage.jsx` |
| Mini Lesson | ✅ | `MiniLesson.jsx` |
| AI Feedback Modal | ✅ | `FeedbackModal.jsx` |
| Final Boss (Ch.1) | ✅ | `FinalBoss.jsx` |
| Chapter 4 Arena (6 missions) | ✅ | `OnetArena.jsx`, `ExamMode.jsx` |
| Final Exam (50 ข้อ, one-shot) | ✅ | `ExamMode.jsx` (missionId='final_exam') |
| Mistake Bank + Review | ✅ | `ReviewMistakePage.jsx` |
| Badge System (หลาย categories) | ✅ | `BadgePage.jsx`, `data/badges.js` |
| Daily Streak Reward | ✅ | `DailyRewardModal.jsx` |
| Ranking System + Tiers | ✅ | `RankingPage.jsx`, `components/ranking/*` |
| XP + Level Up | ✅ | `App.jsx addXP()`, `utils/scoring.js` |
| Teacher Dashboard | ✅ | `TeacherDashboard.jsx` |
| Mini Games (6 types) | ✅ | `components/games/*` |
| TTS (Text-to-Speech) | ✅ | `SpeakButton.jsx`, `useSpeech.js` |
| Vocab Tooltip | ✅ | `VocabTooltip.jsx` |
| Real O-NET Simulator | ✅ | `RealOnetSimulator.jsx` |
| Technique Hub | ✅ | `TechniqueHub.jsx` |
| Vocab Drill Hub | ✅ | `VocabDrillHub.jsx` |
| PWA (installable) | ✅ | `vite.config.js` + Workbox |
| BGM Toggle | ✅ | `BGMToggle.jsx` |
| Online Heartbeat (4 min) | ✅ | `App.jsx useEffect` |
| Login Rank Modal | ✅ | `ranking/LoginRankModal.jsx` |
| Rank Shift Toast | ✅ | `ranking/RankShiftToast.jsx` |
| Translation Permission System | ✅ | `TeacherDashboard.jsx` |
| Export/Import CSV | ✅ | `TeacherDashboard.jsx` |
| Supabase Sync (background) | ✅ | `utils/storage.js` |

---

## 6. ปัญหาและ Issues ที่พบ

### 🔴 ปัญหาสำคัญ (Critical)

#### 6.1 `src/components/LoginPage.jsx` — Dead Code
- **ไฟล์นี้ไม่ถูก import ใน `App.jsx` เลย**
- App.jsx ใช้ `StudentLoginPage.jsx` และ `TeacherLoginPage.jsx` แทน
- `LoginPage.jsx` ยังมี logic เก่า: `navigate('teacher')` ตรงๆ แทนที่จะเป็น `teacher-login`
- หากเผลอใช้ไฟล์นี้จะเกิด bug (routing ผิด + ไม่มี CuteUpdateModal)
- **แนะนำ: ลบทิ้ง** หรือ archive

#### 6.2 `src/config/firebase.js` — Initialized แต่ไม่ได้ใช้
- ไฟล์นี้ initialize Firebase/Firestore และ export `db`
- **ไม่มีไฟล์ใดใน `src/` import จาก `config/firebase.js` เลย**
- storage.js ใช้ Supabase ทั้งหมด
- ผลคือ Firebase SDK ถูก bundle เข้า app โดยไม่มีประโยชน์ (เพิ่ม bundle size)
- **แนะนำ: ลบ firebase.js ออก** และ remove dependency `firebase` จาก package.json (หากไม่ใช้ Firebase Hosting ด้วย script แยก)

#### 6.3 ข้อความ target audience ผิดใน Landing Page
- `LandingPage.jsx` บรรทัด 66: `"สำหรับนักเรียนชั้นมัธยมศึกษาปีที่ 6"`
- แต่ `package.json` ระบุว่า: `"เกมติวภาษาอังกฤษ O-NET สำหรับนักเรียนประถม 6"`
- ชื่อโรงเรียน "บ้านน้ำใส สพม.ปัตตานี 2" — สพม. คือ สำนักงานเขตพื้นที่การศึกษามัธยมศึกษา (**ระดับมัธยม**)
- อาจเป็นการเปลี่ยนกลุ่มเป้าหมายในภายหลัง แต่ข้อความยังขัดแย้งกัน
- **แนะนำ: ตรวจสอบ** ว่าโปรเจกต์นี้ใช้กับ ป.6 หรือ ม.6 แล้วแก้ให้ consistent

#### 6.4 `src/data/missions/ch4_missions.js` — หายไป
- มีไฟล์ `ch1_missions.js`, `ch2_missions.js`, `ch3_missions.js`, `ch5_missions.js`
- **`ch4_missions.js` หายไป** — Chapter 4 เป็น Arena mode ซึ่งอาจใช้ `chapter4_config.js` แทน แต่ naming ไม่ consistent
- **แนะนำ: ตรวจสอบ** ว่า Chapter 4 missions ถูก load จากไหน และ document ให้ชัดเจน

### 🟡 ปัญหาปานกลาง (Medium)

#### 6.5 `TeacherDashboard.jsx` ขนาด 166KB — Monolith
- ไฟล์เดียวใหญ่ผิดปกติ รวม HTML template สำหรับ print report ไว้ด้วย
- ยากต่อการ maintain และ debug
- **แนะนำ: แตก** เป็น sub-components (PrintableReport, StudentTable, ArenaStats ฯลฯ)

#### 6.6 `confetti` import ใน `App.jsx` ไม่ถูกใช้
- `App.jsx` บรรทัด 2: `import confetti from 'canvas-confetti';`
- แต่ `confetti()` ไม่ถูกเรียกใช้ใน App.jsx เลย (ใช้ใน BadgeModal, FinalBoss ฯลฯ แทน)
- **แนะนำ: ลบ import นี้ออก**

#### 6.7 `LandingFeatureBadges.jsx` — ข้อความขัดแย้ง
- บรรทัด 7: `{ icon: '🎯', text: 'ติว O-NET ม.6', ...}` — ระบุ ม.6
- แต่ badge อื่นๆ และ context บ่งชี้ว่าเป็น ป.6
- **แนะนำ: แก้ให้ consistent**

#### 6.8 `supabase.js` — Hardcoded Anon Key
- `src/config/supabase.js` มี fallback เป็น hardcoded URL และ anon key
- หากมี `.env` ก็ใช้ได้ แต่ถ้า `.env` หาย จะ expose key ใน source code
- **แนะนำ: ไม่ควร commit hardcoded key** — ควรให้ app fail gracefully หรือใช้ public-safe key เท่านั้น (Supabase anon key ปลอดภัยกว่า service role key แต่ควร review RLS policies)

### 🟢 ปัญหาเล็กน้อย (Minor)

#### 6.9 Script files รกโฟลเดอร์ root
- มีไฟล์ทดสอบหลายไฟล์ใน root: `test_csv.cjs`, `test_fetch.js`, `test_fetch_html.js`, `test_regex.js`, `test_write.js`
- รวมถึงไฟล์ที่ไม่เกี่ยวข้อง: `sheet_html.txt`, `answer.txt`, `curve.txt`, `eng.txt`
- **แนะนำ: ย้าย** ไปไว้ใน `scripts/` หรือ `tools/` หรือลบทิ้ง

#### 6.10 PDF ส่วนตัวใน root directory
- มีไฟล์ PDF ภาษาไทยและ Word document ใน root: เช่น `613896855353033047_บัญชีออมทรัพย์นักเรียน.doc`
- ไม่ควรอยู่ใน source repository
- **แนะนำ: เพิ่มใน `.gitignore`**

---

## 7. ไฟล์ Scripts พิเศษ

| ไฟล์ | วัตถุประสงค์ |
|---|---|
| `check_classes.js` | Script Node.js สำหรับ query Firestore ดู summary จำนวนนักเรียนแต่ละห้อง — **ใช้ Firestore โดยตรง** (ไม่ใช่ Supabase) |
| `expandQuestions.cjs` | Script สร้าง/expand questions ใน `src/data/questions.js` ให้ครบ 50 ข้อต่อ quest โดย clone + ปรับ ID |
| `generate_ch3_questions.cjs` | Script generate Chapter 3 questions จาก templates และเขียนลงไฟล์ `src/data/chapter3_questions.js` |
| `import_csv.js` | Script import รายชื่อนักเรียนจาก CSV ไปยัง Firestore (format: เลขที่, ชื่อ, _, ชั้น) — **ใช้ Firestore โดยตรง** |
| `test_csv.cjs`, `test_fetch*.js`, `test_regex.js`, `test_write.js` | Script ทดสอบ (dev artifacts) — ไม่จำเป็นต้องอยู่ใน repo |

> **หมายเหตุ**: `check_classes.js` และ `import_csv.js` ใช้ **Firebase Firestore** ไม่ใช่ Supabase — นี่แสดงว่า **ช่วงแรกใช้ Firestore** แล้วย้ายมา Supabase ทีหลัง แต่ scripts ยังไม่ได้ update

---

## 8. สถานะ Firebase / Deployment

```json
// .firebaserc
{ "projects": { "default": "o-net69" } }

// firebase.json — Firebase Hosting only
{
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

- ✅ Firebase Hosting configured (SPA mode)
- ✅ Cache headers สำหรับ `index.html`, `sw.js`, `registerSW.js` — no-cache (ดีสำหรับ PWA update)
- ✅ `dist/` ปัจจุบัน build ไว้แล้ว (มีไฟล์ใน `dist/`)
- ⚠️ Firebase Firestore **ไม่ได้ใช้ใน app** แต่มีอยู่ใน dependencies และ config

---

## 9. การประเมิน Data Files

| ไฟล์ | ขนาด | สถานะ |
|---|---|---|
| `questions.js` (Ch.1) | 219 KB | ✅ ใช้งานหลัก |
| `chapter4_questions.js` | 119 KB | ✅ ใช้งานหลัก |
| `chapter3_questions.js` | 76 KB | ✅ Generated file (จาก `generate_ch3_questions.cjs`) |
| `badges.js` | 23 KB | ✅ ใช้งานหลัก |
| `vocab_dictionary.js` | 16.5 KB | ✅ ใช้งานหลัก |
| `lessons.js` | 11 KB | ✅ ใช้งานหลัก |
| `finalBossQuestions.js` | 1.8 KB | ✅ ใช้งานหลัก |
| `chapter4_config.js` | 2.7 KB | ✅ Arena config |

---

## 10. สรุปปัญหาและ Recommendations

### Priority สูง (แก้เร็ว)

1. **แก้ข้อความ target audience** ใน `LandingPage.jsx` (ม.6 vs ป.6) และ `LandingFeatureBadges.jsx`
2. **ลบ `LoginPage.jsx`** ออก (dead code, อาจสร้างความสับสน)
3. **ลบ `import confetti` ที่ไม่ใช้** ออกจาก `App.jsx`
4. **ตรวจสอบ** ว่า `ch4_missions.js` ไม่ได้หายไปจริงหรือ Chapter 4 ใช้ config คนละแบบ

### Priority กลาง

5. **ลบ Firebase SDK ออก** (หรืออย่างน้อย remove import ที่ไม่ได้ใช้) เพื่อลด bundle size
6. **ย้าย `check_classes.js` และ `import_csv.js`** ไปใช้ Supabase แทน Firestore ให้ consistent กับ app
7. **ย้าย test scripts** ออกไปไว้ใน `scripts/` หรือลบทิ้ง
8. **เพิ่ม `.gitignore`** สำหรับ PDF/DOC ส่วนตัว

### Priority ต่ำ (Long-term)

9. **แตก `TeacherDashboard.jsx`** ออกเป็น sub-components
10. **พิจารณา** ย้าย hardcoded Supabase key ออกจาก source code โดยใช้ `.env` เท่านั้น
11. **Update scripts** `generate_ch3_questions.cjs` และ `expandQuestions.cjs` ให้มี README อธิบายการใช้งาน

---

## 11. หมายเหตุการ Migration: Firestore → Supabase

จากการวิเคราะห์ พบว่าโปรเจกต์เคยใช้ **Firebase Firestore** เป็น DB หลัก แต่ได้ย้ายมาใช้ **Supabase** แล้ว หลักฐาน:

- `import_csv.js` และ `check_classes.js` ยังคง query Firestore โดยตรง
- `src/config/firebase.js` initialize แต่ไม่ถูก import ใน app code
- `src/utils/storage.js` ใช้ Supabase ทั้งหมด
- `package.json` ยังมี `firebase` ^12.15.0 เป็น dependency (bundle เพิ่มโดยไม่จำเป็น)
- Document `onet-system_overview.md` ระบุ "Legacy DB: Firebase Firestore"

---

*วิเคราะห์โดย: Kiro Investigation Agent | ไฟล์ที่อ่าน: 25+ files*
