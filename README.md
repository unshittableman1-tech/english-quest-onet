# English Quest AI: O-NET Adventure ป.6 🎮⚔️

เว็บแอปแนวเกมมิฟิเคชันสำหรับติวภาษาอังกฤษ O-NET ป.6 พัฒนาด้วย React + Vite + Tailwind CSS

## ✨ ฟีเจอร์หลัก

| ฟีเจอร์ | รายละเอียด |
|---|---|
| 🎮 Quest System | 8 ด่าน พร้อมระบบปลดล็อก |
| ⭐ XP & Level | สะสม XP เพิ่ม Level |
| 🏅 Badge | 8 Badge สำหรับผู้เชี่ยวชาญ |
| 🤖 AI Tutor | Feedback อัจฉริยะทุกข้อ |
| 📝 Pre-test | แบบทดสอบก่อนเรียน 20 ข้อ วิเคราะห์รายหมวด |
| 🏆 Final Boss | O-NET จำลอง 30 ข้อ จับเวลา 30 นาที |
| 👩‍🏫 Teacher Dashboard | ดูผลนักเรียนทั้งชั้น + Export CSV |
| 📱 Mobile First | ใช้งานได้บนมือถือ แท็บเล็ต คอมพิวเตอร์ |
| 💾 LocalStorage | บันทึกข้อมูลในเครื่อง ไม่ต้อง Backend |

## 🚀 วิธีติดตั้งและรัน

### ความต้องการ
- Node.js 18+ 
- npm 8+

### ขั้นตอน
```bash
# 1. ติดตั้ง dependencies
npm install

# 2. รัน dev server
npm run dev
```

จากนั้นเปิดเบราว์เซอร์ที่ `http://localhost:5173`

### Build สำหรับ Production
```bash
npm run build
npm run preview
```

## 📁 โครงสร้างไฟล์

```
src/
├── App.jsx                    # หลัก Router + Context
├── index.css                  # Global styles + animations
├── main.jsx                   # Entry point
├── components/
│   ├── LoginPage.jsx          # หน้า Login
│   ├── PreTestPage.jsx        # Pre-test 20 ข้อ
│   ├── QuestMap.jsx           # Quest Map การ์ด
│   ├── MiniLesson.jsx         # บทเรียนสั้น
│   ├── QuizPage.jsx           # ระบบ Quiz + XP + Combo
│   ├── FeedbackModal.jsx      # AI Tutor Feedback
│   ├── BadgePage.jsx          # Badge Collection
│   ├── StudentReport.jsx      # รายงานผลนักเรียน
│   ├── TeacherDashboard.jsx   # Teacher Dashboard
│   ├── FinalBoss.jsx          # O-NET Final Boss
│   ├── Navigation.jsx         # Bottom Navigation
│   └── XPToast.jsx            # XP Toast animation
├── data/
│   ├── questions.js           # ข้อสอบทุกด่าน (85+ ข้อ)
│   ├── lessons.js             # Mini Lesson content
│   └── finalBossQuestions.js  # O-NET Final Boss 30 ข้อ
└── utils/
    ├── storage.js             # LocalStorage helpers
    └── scoring.js             # XP, Level, Badge logic
```

## 🗺️ ด่านทั้งหมด

| # | ด่าน | หมวด | เปิดเมื่อ |
|---|---|---|---|
| 1 | Vocabulary Village 📚 | คำศัพท์ | เปิดตั้งแต่แรก |
| 2 | Signs City 🚦 | ป้ายสัญญาณ | เปิดตั้งแต่แรก |
| 3 | Direction Maze 🧭 | ทิศทาง | เปิดตั้งแต่แรก |
| 4 | Market Quest 🛒 | การซื้อขาย | ผ่าน Vocabulary ≥70% |
| 5 | Conversation Café 💬 | บทสนทนา | ผ่าน Signs + Directions ≥70% |
| 6 | Reading Dungeon 📖 | การอ่าน | ผ่าน 3 ด่านแรก ≥70% |
| 7 | Grammar Boss ⚡ | ไวยากรณ์ | ผ่าน Reading ≥70% |
| 8 | O-NET Final Boss 🏆 | ผสมทุกหมวด | ผ่านทุกด่าน ≥70% |

## 💯 ระบบคะแนน

| เหตุการณ์ | XP |
|---|---|
| ตอบถูกครั้งแรก | +10 XP |
| ตอบถูกหลังดูเฉลย | +5 XP |
| ทำครบ 10 ข้อ | +20 XP |
| ผ่านด่าน ≥70% | +50 XP |
| ผ่านด่าน ≥90% | +100 XP |
| ได้ Badge ใหม่ | +30 XP |
| ทำ Pre-test เสร็จ | +15 XP |
| ผ่าน Final Boss | +150 XP |

Level เพิ่มทุก **100 XP**

## 🏅 Badge

ได้ Badge เมื่อทำได้ **≥80%** ในแต่ละด่าน

- 🦸 Vocabulary Hero
- 🎯 Sign Master  
- 🧭 Direction Navigator
- ⭐ Market Star
- 💫 Conversation Star
- ⚔️ Reading Warrior
- ⚡ Grammar Fighter
- 🏆 O-NET Legend

## 👩‍🏫 Teacher Dashboard

เข้าได้จากหน้า Login ปุ่ม "Teacher Dashboard" (ไม่ต้อง Login)
- ดูผลนักเรียนทุกคนที่ใช้งานในเครื่อง
- วิเคราะห์จุดอ่อนของห้องเรียน
- Export ข้อมูลเป็น CSV
- Reset ข้อมูลทั้งหมด

## 🔮 การต่อยอด

- เพิ่มข้อสอบจาก PDF (เพิ่มใน `src/data/questions.js`)
- เชื่อม Firebase / Supabase สำหรับ Multi-device
- เพิ่ม PWA support (Service Worker)
- เพิ่ม Text-to-Speech ฝึกออกเสียง
- เพิ่ม Multiplayer / Class Competition

---
พัฒนาเพื่อโรงเรียนประถมศึกษา | English Quest AI Team
