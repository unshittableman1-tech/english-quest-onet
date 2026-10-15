# Implementation Plan

English Quest AI: O-NET Adventure P.6

Updated: 2026-10-14

## Implementation Status

แผนได้รับอนุมัติแล้วเมื่อ 2026-10-12 เริ่มส่งมอบแบบ milestone ตามลำดับในเอกสารนี้

| งาน | สถานะ | ผลที่ทำแล้ว |
|---|---|---|
| Phase 0: Core | เสร็จในขอบเขตแอปและ local verification | XP, Ranking, Tier, แถบ Level, progression, คำนวณคะแนนครูจากข้อมูลจริง, timer และการกู้ผลสอบจาก cloud |
| Phase 1: Landing | เสร็จด้าน UI | CTA หลักเดียว, ทางเข้าครู, demo, ลิงก์สำหรับครู, wording ป.6, responsive |
| Phase 2: Teacher UI | เสร็จส่วน Overview / Navigation / Early Warning | Header 2 แถว, sidebar จัดกลุ่ม, KPI, ranked weak quests, แผนทบทวน, export และธีม |
| Student Learning UI | ปรับและทดสอบ local แล้ว | Quest Map ครบ 36 ด่านรวม Culture Quiz และบอสท้ายบท 2/5, ภารกิจแนะนำ, แยกสนามสอบ, หน้าโจทย์/เสียง/เฉลย/รางวัล; ไม่ใช่การรับรองเนื้อหาทุกข้อ |
| Phase 2A: Content QA / Blueprint Alignment | บรรลุการสร้าง Sampler และแท็กมาตรฐาน | พัฒนา Blueprint Sampler 32 ข้อ (100 คะแนน) ตามโควตา สทศ., เติมคลัง ต 2.1 (วัฒนธรรมและเทศกาล 12 ข้อ), Unit tests ผ่าน 101/101 |
| Phase 2A.2B: Assessment Media Completeness | Batch 2 SET7 10 ข้อ + Batch 3 Family 3 ข้อพร้อมตรวจรับ; ยังรออนุมัติเนื้อหารายชุดและยังไม่ครบคลัง | Family มีภาพใหม่ 2 ภาพและแก้สรรพนามผิดจากต้นฉบับ; มี renderer, preflight, provenance/version และหน้าตรวจแบบไม่ให้คะแนน |
| Phase 3–4: Auth / Membership / Package Model | Foundation ผ่าน local tests; ยังไม่เชื่อม UI/ฐานข้อมูลจริง | เพิ่ม migration, RLS, Auth adapter และ subscription helper; ต้องทำ staging และ login cutover |
| Phase 5–6: Quota / Payment | ยังไม่เริ่ม enforcement/payment | มี quota helper สำหรับ UI เท่านั้น ยังไม่มี server enforcement หรือ payment workflow |
| Phase 7–8: Performance / Production | ยังไม่เสร็จ | Code splitting, production access tests และ hardening |

### Delivery 1: Core and Frontend

- เพิ่มกติกา XP ที่ขาด: ผ่าน 70% = 50 XP, ผ่าน 90% = 100 XP, Pre-test = 15 XP, Final Boss = 150 XP
- รับ XP ต่อเนื่องโดยอ่าน session ล่าสุด ไม่ทับคะแนน/quest/badge ที่บันทึกใน event เดียวกัน และปฏิเสธ reward ที่ไม่ใช่ตัวเลข finite
- Rank Score คำนวณจากกิจกรรมตามสูตรเดิมใน system overview พร้อม cap และโทษ fast guessing 30 คะแนน; ปรับข้อความ UI ให้ตรงสูตร
- คืนข้อมูล Tier ทั้ง 10 ระดับตาม contract ของ UI และใช้หน่วย `pts` สำหรับ Rank Score
- แถบ XP ใช้ `current`, `needed`, `pct` ตรงกัน และแสดงสถานะ Level สูงสุด
- นักเรียนใหม่เปิด Chapter 1; บทถัดไปต้องผ่านทุก quest ในบทก่อนอย่างน้อย 70% และเคลียร์ข้อผิด; boss ของ Chapter 3/4 ต้องผ่านด่านอื่นในบทนั้นก่อน
- รักษาสิทธิ์เข้าบทที่นักเรียนเดิมเคยเริ่มไว้จากระบบเปิดทุกด่าน เพื่อไม่ตัดความก้าวหน้าเดิม
- คะแนนเฉลี่ยครูและจุดอ่อนคำนวณจากข้อมูลจริง แทนค่า mock 42% / 78%; แยกนักเรียนที่ยังไม่มีผลออกจากผู้ได้คะแนนศูนย์
- แก้ cloud merge ให้เก็บผลสอบปลายภาค และตรวจ cloud ก่อนเปิดสอบจริง; timeout ใช้คำตอบล่าสุดและป้องกัน double submit ในหน้า ExamMode
- Landing ใช้ภาพเดิมของโปรเจกต์และตัดเมนูที่ไม่ทำงาน, avatar/0 XP, ข้อความระดับชั้นที่ผิด และ CTA ขนาดตายตัว
- Teacher Overview แยกเป็น component, เหลือ donut เฉพาะสัดส่วนผลการเรียน, ใช้ progress bar และรายการด่านที่ควรทบทวน
- Early Warning ใช้เกณฑ์เดียวกันใน badge/overview/list แยก `high`, `medium`, `watch`; ไม่ตีความข้อมูลที่หายไปเป็นคะแนนต่ำหรือไม่เข้าเรียน 999 วัน
- สร้างแผนทบทวนจากด่านที่ยังไม่ผ่านและ mistake bank ดาวน์โหลดเป็น TXT และ export รายชื่อนักเรียนที่ต้องติดตามเป็น CSV
- รายงานบทเรียน, การเปรียบเทียบห้อง, drill-down และ CSV ใช้ chapter catalog ปัจจุบัน
- แผนทบทวนเป็นเอกสารสร้างใน browser ยังไม่ใช่ระบบมอบหมายงานหรือบันทึก intervention ลงฐานข้อมูล

### Verification

- `npm test`: 21 regression tests ครอบคลุม XP/ranking/progression/analytics/one-shot cache และการจัดกลุ่ม Chapter
- `npm run build`: production build ผ่าน; ยังมีคำเตือน bundle ใหญ่และ static/dynamic import ปะปนตามงาน Phase 7
- Playwright ตรวจ landing ที่ 320, 390, 768, 1366 และ 1920px: CTA อยู่จอแรก, เห็นส่วนถัดไป และไม่มี horizontal overflow
- ตรวจ Teacher Dashboard บน desktop/tablet/mobile, ธีมสว่าง/มืด, room filters, drawer, Early Warning, review plan และไฟล์ export
- ตรวจ map, ranking tier modal, exam timeout, double submit และ Final Boss timeout โดยไม่มี uncaught runtime error ในเส้นทางที่ทดสอบ
- Browser tests ใช้ข้อมูลจำลองและดัก request ภายนอก ไม่เขียนฐานข้อมูลจริง; วิธีรันทดสอบอยู่ใน `tests/README.md`
- ภาพตรวจ UI อยู่ใน `scratch/phase0-screenshots/`; dev preview ที่ `http://127.0.0.1:5173/`

### Delivery 2: Membership Foundation

- เพิ่ม `supabase/migrations/202610120001_membership_foundation.sql`: `platform_admins`, `schools`, `school_members`, `plans`, `subscriptions`
- ใช้ school ID แบบ text เพื่อรองรับ `sch_*` เดิม แต่ไม่ seed รายชื่อโรงเรียนตัวอย่างหรือราคาแพ็กเกจเป็นข้อมูลจริง
- RLS แยกโรงเรียน: ครูเห็นสมาชิกของตัวเอง, school admin เห็น roster ในโรงเรียน, platform admin อ่านทุกโรงเรียน; browser ไม่มีสิทธิ์เขียน role/แพ็กเกจ/สัญญา
- Auth adapter ตรวจ user ผ่าน Supabase `getUser()` และอ่าน role จากฐานข้อมูล ไม่เชื่อ role ใน localStorage หรือ user metadata
- เพิ่ม subscription helper: วันเริ่ม/หมดอายุ, trial, suspended/past_due, override ค่า 0/false และ quota boundary; เป็น display logic ไม่ใช่ server enforcement
- เพิ่ม read-only schema audit และ staging/cutover runbook ใน `supabase/README.md`
- `npm test` ผ่าน 39 tests รวม SQL/RLS บน PostgreSQL แบบ disposable ด้วย PGlite; จำลอง Supabase Auth context ไม่ใช่ hosted integration test
- ยังไม่เปลี่ยนหน้า login, ยังไม่ apply migration, ไม่เปลี่ยน policies ของ `students` เดิม และยังไม่เปิดใช้งานระบบสมาชิกจริง

### Remaining Gates

Milestone 1 ผ่านในขอบเขต demo/UI; ยังไม่ใช่การรับรองพร้อมขายตาม Definition of Done ด้านล่าง

- การ submit สอบพร้อมกันหลายเครื่องยังต้อง unique constraint และ atomic server operation; client/cache guard ไม่ใช่การบังคับ one-shot ฝั่งฐานข้อมูล
- ยังต้องย้าย hardcoded teacher/admin login ไป Supabase Auth และทดสอบ RLS ข้ามโรงเรียนก่อนเปิดขาย
- มี schema/adapter สมาชิกและแพ็กเกจแล้ว แต่ยังไม่มีการเชื่อม UI หรือ quota/payment จริง และยังไม่ได้ apply migration หรือทดสอบฐานข้อมูล production
- การลดเวลาโหลดและขนาด bundle ยังเป็นงาน Phase 7; การปรับ Landing รอบนี้เป็นการลดความซับซ้อนของ UI
- การผ่าน regression tests ไม่ใช่การรับรองเฉลย การจัดหน่วย ความยาก หรือสัดส่วน Blueprint; ต้องผ่าน Phase 2A ก่อนใช้อ้างความครอบคลุมหรือความเทียบเคียงข้อสอบจริง

ลำดับถัดไป: ใช้ตารางจับคู่ที่ทำเสร็จแล้วทวนข้อสอบ/เฉลยรายข้อ → ยืนยันและซ่อมปัญหาที่กีดขวางการเรียน/หน้าสอบ → จัดคลังและติดแท็ก → ทำตัวสุ่มตาม Blueprint → ตัดสินใจเพิ่มด่านเฉพาะช่องว่างที่ยืนยัน จากนั้นเดิน Phase 3-4 ต่อ ระบบสมาชิกมี foundation แล้วแต่ยังต้อง audit schema บน staging, ย้าย ownership, ตรวจ RLS ด้วย Auth จริง และถอด hardcoded accounts ก่อน quota/payment

### Delivery 3: Student UI and Curriculum Audit

- ปรับ Quest Map ให้ดูทีละบท แสดงครบ 33 ด่าน แนะนำภารกิจถัดไป/ทบทวน และแยกสนามสอบ
- แสดงดาวและรอบฝึกสะสมจริง แยกสถานะยังไม่เริ่ม/ยังไม่ผ่าน/ผ่านเกณฑ์ และแยกด่านท้าทายท้ายบท
- ปรับหน้าทำโจทย์ให้พื้นหลังสงบ ตัวอักษรอ่านง่าย ปุ่มเสียงแยกจากคำตอบ และกันกดซ้ำในเส้นทางที่ทดสอบ
- ปรับหน้าต่างเฉลยเป็นพื้นสว่าง รองรับมือถือ/คีย์บอร์ด และเฉลยเหตุผลของโจทย์สองขั้น
- ยกเลิกค่าดูเฉลยเพิ่มใน Quiz/Review; ค่าตอบผิดเดิมยังคงอยู่ ไม่ใช้คำอธิบายเฉลยแทนคำแปลที่ไม่มีจริง
- รวม Badge ในคิว ลดพลุ และรองรับ reduced motion
- แก้ตัวอย่าง offer a Thai drink ให้ใช้ Would you like some Thai iced tea? พร้อมคำแปล; ยังไม่ได้ตรวจความถูกต้องทางภาษาครบทุกข้อ
- ตรวจไฟล์ต้นทางใน `o net` เทียบสำเนา `o net2/pdf_blueprints`: 65 ไฟล์ตรงกันด้วย SHA-256 (57 PDF, 8 DOCX)
- สรุปผลตรวจหลักสูตรและตารางจับคู่ด้านล่าง; ยังไม่ย้ายด่าน เปลี่ยน prerequisite หรือล้างประวัตินักเรียน
- Verification ล่าสุดก่อนงานเอกสารนี้: `npm test` 50 รายการผ่าน, build ผ่าน และ browser tests ใช้ข้อมูลจำลอง ไม่ใช่ hosted integration หรือผล pilot นักเรียน

### Curriculum Audit Summary

หลักฐานอ้างอิง:

- [รายงานหลักสูตรและ Blueprint](<C:/Users/Omarov/Desktop/o net2/md/Curriculum and Blueprint Audit.md>)
- [ตารางจับคู่ครบ 44 หัวข้อ](<C:/Users/Omarov/Desktop/o net2/md/SET1-SET7 Curriculum Mapping.md>)
- [CSV พร้อมรหัสข้อสอบและหน้าเอกสาร](<C:/Users/Omarov/Desktop/o net2/md/SET1-SET7 Curriculum Mapping.csv>)

ข้อค้นพบที่ยืนยันจากข้อมูล/โค้ด:

- 33 ด่าน มีรายการ Quiz รวม 697; เหลือ 460 signatures ตาม question/stimulus/options/answer/reason ไม่ใช่การรับรอง 460 ทักษะหรือเฉลยที่ถูกต้อง
- 3 ด่านมีมินิเกมแต่ไม่มี Quiz: shapes_colors, tenses_arena, clothes_fashion; นักเรียนใหม่อาจติด progression ที่กำหนดให้ผ่านทุกด่าน
- School รวมข้ออื่น 50 ข้อ; Signs รวม SET5 คำสั่ง/ขอร้อง/แนะนำ; Reading รวมภาพ/ผัง/กราฟ/ตาราง/ความคิดเห็น ต้องตรวจงานที่วัด ไม่ใช้ชื่อด่านแทนตัวชี้วัด
- ไม่มี difficulty/standard/indicator/sourcePage/reviewStatus ใน QUESTS ที่ตรวจ จึงยังไม่ยืนยันลำดับความยากหรือจำนวนข้อที่ผ่านครู
- Pre-test มี 20 ข้อ แต่บางเส้นทางใช้ตัวหาร 30 และไม่บันทึก total; ต้องตรวจแก้ก่อนใช้รายงาน growth
- Simulator 5 Parts มี 45 ข้อ/45 นาที และคำตอบถูกอยู่ A ทุกข้อโดยไม่สลับตัวเลือก ส่วน Full Mock/Final Simulation ใช้ 30 ข้อ/30 นาที และปลายภาคใช้ 50 ข้อ/60 นาที
- ExamMode ยังไม่ render image/passage และส่วนเหตุผลของ two_step ที่อาจสุ่มเข้าไปในกระดาษสอบ
- ความไม่สมบูรณ์ของสื่อมีทั้งระดับข้อมูลและ UI: บางข้อมีเพียงคำบรรยายว่ารูปอะไรหรือ emoji; บางข้อมี asset แล้วแต่โหมดสอบไม่แสดง ต้องซ่อมทั้งสองด้าน ไม่สรุปว่าเว็บไม่มีภาพทุกข้อ
- Blueprint ทางการปี 2568/2569 ที่ตรวจเป็น 32 ข้อ/60 นาที ข้อละ 3.125 คะแนน; quota ตามมาตรฐาน ต 1.1/1.2/1.3/2.1/2.2/4.1 คือ 6/10/6/2/4/4 ไม่ใช่ quota Grammar/Reading/Signs ของเกมเดิม
- ตารางครบ 44 หัวข้อ: พบหลักฐาน ID/ข้อความเชื่อมต้นทาง 21 หัวข้อ อีก 23 หัวข้อยังต้องตรวจเนื้อหาและมินิเกมที่เกี่ยวข้อง ไม่ถือว่าไม่มีเนื้อหา
- อ่าน checklist Word 8 ไฟล์แล้ว (7 เนื้อหาไม่ซ้ำ); เป้าหมายที่ระบุโดยตรงครอบคลุม 9/14 ตัวชี้วัด อีก 5 ตัวต้องตรวจร่วมกับเอกสาร/เนื้อหาอื่น ไม่ใช่ข้อสรุปว่าต้องเพิ่ม 5 ด่าน
- แยกชุดสอบสถานการณ์ 30 ข้อของ SET2 และแถววรรคตอนใน checklist SET7 ออกจาก 44 หัวข้อ PDF เพื่อไม่ตกหล่นหรือเหมารวมผิดตัวชี้วัด

ข้อกำกับการตีความ: จำนวนที่จับคู่ได้เป็น candidate ไม่ใช่ approved item; การไม่พบ stem ตรงกันไม่พิสูจน์ว่าขาดเนื้อหา และชุดโค้งหักศอกระบุ ม.3 จึงไม่ใช้เป็น Blueprint ป.6 โดยตรง โครงสร้าง 6 โลกที่เสนอไว้ยังเป็นแนวทาง ไม่ใช่แผนย้ายที่อนุมัติแล้ว

## 1. Objective

เป้าหมายของแผนนี้คือรวมงานปรับปรุงระบบทั้งหมดให้เป็น roadmap เดียว ครอบคลุม 3 แกนหลัก:

1. ปรับ Frontend และ Landing Page ให้ชัดขึ้น ใช้งานง่ายขึ้น และดูพร้อมขายมากขึ้น
2. เพิ่มระบบสมาชิก โรงเรียน แพ็กเกจ และ quota เพื่อรองรับการขายในอนาคต
3. ยกระดับระบบจาก prototype ภายในไปสู่ production-ready SaaS สำหรับโรงเรียนและครู

## 2. Current System Summary

ระบบปัจจุบันเป็น React + Vite + Tailwind PWA ใช้ `AppContext` และ `page` state แทน routing library มีข้อมูลข้อสอบ/mission อยู่ใน `src/data` และเก็บข้อมูลผู้เรียนด้วย localStorage + Supabase sync

ฟีเจอร์หลักที่มีแล้ว:

- Student login ด้วยรหัสโรงเรียน ชั้น และเลขที่
- Quest map, quiz, mini games, pre-test, final boss
- XP, level, badge, mistake bank
- Ranking และ leaderboard
- Teacher dashboard
- Super admin dashboard แบบ local/config-driven
- Final exam session เปิดสอบด้วย PIN
- PWA build และ Firebase Hosting config

จุดที่ควรระวัง:

- Teacher/admin login ยัง hardcoded ใน frontend
- Landing page มีข้อมูลเยอะและ CTA หลายตัวแข่งกันเอง
- Ranking/scoring logic ในเอกสารกับโค้ดจริงยังไม่ตรงกัน
- Unlock progression หลายจุดเปิดหมดอยู่
- Bundle ใหญ่ เพราะ dashboard, data, games ถูกโหลดรวมกันมาก
- Supabase security/RLS ต้องออกแบบให้ชัดก่อนขายจริง

## 3. Product Direction

ระบบควรวางตัวเป็น SaaS สำหรับโรงเรียน:

- เจ้าของระบบขายแพ็กเกจให้โรงเรียน
- โรงเรียนมีครู/แอดมินของตัวเอง
- ครูเพิ่มนักเรียนและดู dashboard เฉพาะโรงเรียนตัวเอง
- นักเรียนเข้าใช้งานง่าย ไม่ต้องสมัครซับซ้อน
- Super Admin ควบคุมแพ็กเกจ, quota, วันหมดอายุ และสถานะการชำระเงิน

## 4. User Roles

### 4.1 Super Admin

สิทธิ์:

- เห็นทุกโรงเรียน
- สร้าง/แก้ไข/ระงับโรงเรียน
- จัดการ plan/package
- อนุมัติการชำระเงิน
- ปรับ quota และวันหมดอายุ
- ดู usage ทั้งระบบ

### 4.2 School Admin

สิทธิ์:

- จัดการข้อมูลโรงเรียนตัวเอง
- จัดการครูในโรงเรียน
- จัดการห้องเรียนและนักเรียน
- ดู usage และ package ปัจจุบัน

### 4.3 Teacher

สิทธิ์:

- ดู dashboard นักเรียนเฉพาะโรงเรียน/ห้องที่ได้รับสิทธิ์
- เพิ่ม/นำเข้านักเรียนตาม quota
- เปิด/ปิด final exam session ถ้า package รองรับ
- export รายงานถ้า package รองรับ

### 4.4 Student

สิทธิ์:

- เข้าใช้งานด้วย school code + class + number
- ทำแบบฝึก/เกม/ข้อสอบ
- ดูผลของตัวเอง
- ใช้ feature ตาม package ของโรงเรียน

### 4.5 Guest/Demo

สิทธิ์:

- ทดลองเล่นแบบจำกัด
- ไม่บันทึกข้อมูลจริงลงฐานข้อมูล
- ใช้สำหรับหน้า landing และการขาย

## 5. Package Model

### 5.1 Suggested Plans

| Plan | Target | Limits | Features |
|---|---|---|---|
| Free Trial | ทดลองใช้ | 14 วัน, 1 โรงเรียน, 1 ห้อง, 30 นักเรียน | Quest พื้นฐาน, dashboard พื้นฐาน |
| Basic | โรงเรียนเล็ก | 100 นักเรียน, 3 ครู | Quest, pre-test, report, basic dashboard |
| Pro | โรงเรียนทั่วไป | 500 นักเรียน, 10 ครู | Ranking, final exam, export CSV, mistake analytics |
| School Plus | โรงเรียนใหญ่ | 1,500+ นักเรียน, หลายครู | Multi-class analytics, advanced reports, priority support |
| Custom | ขายตรง | กำหนดเอง | กำหนด quota และฟีเจอร์เอง |

### 5.2 Feature Flags

ควบคุม feature ด้วย plan:

- `max_students`
- `max_teachers`
- `max_classes`
- `can_use_ranking`
- `can_use_final_exam`
- `can_export_csv`
- `can_import_csv`
- `can_use_advanced_analytics`
- `can_use_translation_control`
- `can_use_school_share_link`
- `can_use_custom_branding`

### 5.3 Subscription Status

สถานะที่ต้องรองรับ:

- `trialing`
- `active`
- `past_due`
- `expired`
- `suspended`
- `cancelled`

## 6. Frontend UI Improvement Plan

### 6.1 Landing Page Problems

ปัจจุบันหน้า landing มีข้อมูลเยอะเกินไปใน viewport แรก:

- Navbar มีหลายเมนูที่ยังไม่ได้ทำงานจริง
- มี avatar และ XP ทั้งที่ยังไม่ได้ login
- CTA 3 ตัวขนาดใกล้กัน ทำให้ไม่รู้ควรกดอะไร
- มี badge/ข้อความหลายจุดแข่งกันเอง
- ข้อความบางจุดไม่ตรงกัน เช่น P.6, U.6, ม.6, ป.6
- ปุ่ม fixed width เสี่ยงล้นบน mobile

### 6.2 Landing Page Goal

ผู้ใช้ควรเข้าใจภายใน 3 วินาที:

1. ระบบนี้คือเกมติวภาษาอังกฤษ O-NET ป.6
2. นักเรียนกดเริ่มเรียน ครูกดเข้าสู่ระบบครู
3. ใช้กับโรงเรียน/ห้องเรียนได้จริง

### 6.3 Proposed First Screen

โครงสร้างใหม่:

```text
Navbar:
Logo                                          เข้าสู่ระบบครู

Hero:
English Quest AI
เกมติวภาษาอังกฤษ O-NET ป.6
ทำภารกิจ สะสม XP ทบทวนข้อผิด พร้อมสอบจริง

Primary CTA:
[เริ่มเรียน]

Secondary:
[ทดลองเล่น]  [ดูสำหรับครู]

Trust line:
เข้าใช้งานด้วยรหัสโรงเรียน ชั้น และเลขที่

Feature chips:
O-NET Blueprint | Mistake Review | Teacher Dashboard
```

### 6.4 Landing Page Implementation Tasks

Files:

- `src/components/LandingPage.jsx`
- `src/components/landing/LandingNavbar.jsx`
- `src/components/landing/LandingCTACards.jsx`
- `src/components/landing/LandingFeatureBadges.jsx`
- `src/components/landing/ONETRibbon.jsx`

Tasks:

1. ลด navbar เหลือ logo + teacher login
2. เอา fake menu และ avatar/0 XP ออก
3. แก้ hero copy ให้สั้นและตรงกลุ่ม
4. ทำปุ่มนักเรียนเป็น CTA หลักเพียงตัวเดียว
5. ทำ teacher/demo เป็น secondary action
6. แก้คำว่า `U.6`, `ม.6` ให้เป็น `ป.6` หรือ `P.6`
7. เปลี่ยน fixed width เป็น responsive width เช่น `w-full max-w-[420px]`
8. ลด badges เหลือ 3 จุดขายหลัก
9. ตรวจ mobile viewport ให้ CTA อยู่ในจอแรก

### 6.5 UI Acceptance Criteria

- นักเรียนเห็นปุ่ม `เริ่มเรียน` โดยไม่ต้องเลื่อนบนมือถือทั่วไป
- ครูหาทางเข้า dashboard ได้ใน 1 คลิก
- ไม่มีเมนูที่กดแล้วไม่ทำงาน
- ข้อความระดับชั้นตรงกันทั้งหมดเป็น O-NET ป.6
- Landing page โหลดเร็วขึ้นและดูไม่แน่น

## 7. Membership System Architecture

### 7.1 Authentication

ควรย้าย teacher/admin ไปใช้ Supabase Auth:

- Super Admin login ด้วย email/password
- School Admin login ด้วย email/password
- Teacher login ด้วย email/password
- Student ยังใช้ school code + class + number ได้ใน phase แรก

เหตุผล:

- เอา password hardcoded ออกจาก frontend
- รองรับ reset password
- ผูก user กับ role ได้
- ใช้ RLS ตรวจสิทธิ์จาก auth user ได้

### 7.2 Suggested Tables

#### `plans`

```sql
id
code
name
description
price_monthly
price_yearly
max_students
max_teachers
max_classes
features jsonb
is_active
created_at
updated_at
```

#### `schools`

```sql
id
code
name
province
area
contact_name
contact_email
contact_phone
status
created_at
updated_at
```

#### `school_members`

```sql
id
school_id
user_id
role
status
created_at
updated_at
```

Roles:

- `school_admin`
- `teacher`

#### `subscriptions`

```sql
id
school_id
plan_id
status
starts_at
ends_at
trial_ends_at
max_students_override
max_teachers_override
features_override jsonb
created_at
updated_at
```

#### `payments`

```sql
id
school_id
subscription_id
amount
currency
status
method
payment_reference
slip_url
paid_at
approved_by
approved_at
notes
created_at
updated_at
```

#### `classes`

```sql
id
school_id
name
grade
teacher_id
created_at
updated_at
```

#### `students`

ควรเพิ่ม/บังคับ fields:

```sql
school_id
class_id
school_code
class
number
name
role
xp
level
quest_progress jsonb
badge_stats jsonb
ranking_stats jsonb
arena_stats jsonb
created_at
updated_at
```

### 7.3 Data Ownership Rules

หลักการ:

- Student อยู่ใต้ school เดียว
- Teacher เห็นเฉพาะ students ใน school ของตัวเอง
- School Admin เห็นทุก class ใน school
- Super Admin เห็นทุก school
- Client ห้าม update/delete ข้าม school

## 8. Security Plan

### 8.1 Must Fix Before Selling

1. เอา hardcoded teacher accounts ออกจาก `TeacherLoginPage.jsx`
2. เอาปุ่มเข้า Super Admin โดยตรงออก
3. ใช้ Supabase Auth สำหรับครู/admin
4. เปิด Supabase RLS
5. สร้าง policies แยกตาม role
6. จำกัด delete/reset ให้เฉพาะ role ที่เหมาะสม
7. ตรวจทุก query ให้ filter ด้วย `school_id`
8. ไม่ expose ข้อมูลโรงเรียนอื่นใน frontend

### 8.2 RLS Policy Direction

ตัวอย่าง rule เชิงแนวคิด:

- Super Admin: read/write all tables
- School Admin: read/write school data เฉพาะ school ตัวเอง
- Teacher: read students/classes เฉพาะ school ตัวเอง และ write เฉพาะ action ที่อนุญาต
- Student: read/write เฉพาะ record ตัวเอง หรือใช้ controlled RPC สำหรับ login/update progress

### 8.3 Sensitive Operations

ควรย้ายไป Supabase Edge Functions หรือ RPC:

- reset all data
- delete student
- approve payment
- change subscription
- create school
- assign teacher role
- open/close final exam session

## 9. Payment Plan

### 9.1 Phase 1: Manual Payment

เหมาะกับช่วงเริ่มขาย:

- Super Admin สร้าง invoice/manual payment record
- โรงเรียนโอนเงิน
- อัปโหลดหรือส่งสลิป
- Super Admin กด approve
- ระบบต่ออายุ subscription

ข้อดี:

- ทำเร็ว
- เหมาะกับขายโรงเรียนไทย
- ไม่ต้องรีบเชื่อม payment gateway

### 9.2 Phase 2: Payment Gateway

ตัวเลือกในอนาคต:

- Stripe
- Omise
- GB Prime Pay
- PromptPay QR

งานที่ต้องเพิ่ม:

- checkout page
- payment callback/webhook
- auto renew subscription
- invoice/receipt
- failed payment handling

## 10. Implementation Phases

## Phase 0: Stabilize Existing Core

Priority: Critical

Tasks:

1. แก้ `XP_RULES` ให้ครบตามที่ component เรียกใช้
2. แก้ `calculateRankScore(student)` ให้คืน number จริง
3. แก้ `getRankingTier(score)` ให้คืน object ที่ UI ใช้ได้
4. แก้ unlock progression ให้ตรง chapter จริง
5. ตรวจ final exam one-shot behavior
6. ตรวจ build หลังแก้

Acceptance:

- Build ผ่าน
- Ranking page ไม่ crash
- Quest map แสดง tier ถูก
- XP ไม่เป็น `NaN`
- Unlock behavior สอดคล้องกับ product flow

## Phase 1: Landing Page Cleanup

Priority: High

Tasks:

1. ปรับ landing hero
2. ลด navbar
3. ลด CTA เหลือ hierarchy ชัดเจน
4. แก้ wording ป.6
5. ตรวจ responsive mobile

Acceptance:

- หน้าแรกดูชัดและโล่งขึ้น
- CTA หลักเด่นที่สุด
- ไม่มี fake navigation
- ข้อความไม่ขัดกัน

## Phase 2: Teacher Dashboard UI Refinement

Priority: High

### Current Dashboard Observations

จากหน้าปัจจุบัน Teacher Hub มีฟีเจอร์ครบและดูเป็น dashboard จริงจังแล้ว แต่ข้อมูลจำนวนมากถูกแสดงพร้อมกันใน viewport เดียว ทำให้ครูต้องใช้แรงอ่านมากกว่าที่ควร โดยเฉพาะ header, sidebar, KPI cards และ chart section

สิ่งที่ดีแล้ว:

- Layout หลักชัดเจน มี sidebar, top header และ content area
- Dark theme ดูเป็นระบบและเหมาะกับ dashboard
- KPI cards ด้านบนช่วยสรุปห้องเรียนได้เร็ว
- มีเมนูสำคัญครบ เช่น รายชื่อนักเรียน, Early Warning, Ranking, O-NET Exam Center
- มี filter ห้องและ online check ซึ่งเป็น workflow สำคัญสำหรับครู

ปัญหาที่พบ:

- Header แน่น เพราะรวมชื่อหน้า, โรงเรียน, filter ห้อง, online status และ theme controls ไว้แถวเดียว
- Sidebar แสดงข้อมูลโรงเรียนซ้ำกับ header
- KPI cards ทุกใบมีน้ำหนักเท่ากัน ทำให้ไม่รู้ว่า insight หลักคืออะไร
- Pie chart section มี legend เยอะ โดยเฉพาะจุดอ่อน Quest ทำให้อ่านยาก
- สีหลายกลุ่มถูกใช้พร้อมกัน ทำให้ semantic meaning ยังไม่ชัด
- Early Warning มี badge จำนวนมาก แต่ยังไม่มี action ที่ชัดว่าครูควรทำอะไรต่อ

### Dashboard UX Goal

หน้า dashboard สำหรับครูควรตอบ 3 คำถามทันที:

1. ห้องนี้ภาพรวมเป็นอย่างไร
2. นักเรียนกลุ่มไหนต้องช่วยก่อน
3. ครูควรกด action อะไรต่อ

### Proposed Dashboard Layout

โครงสร้างแนะนำ:

```text
Header
ภาพรวมห้องเรียน
โรงเรียนบ้านนาสาร · BNS01

Controls Row
[ทุกห้อง] [ป.6/1] [ป.6/2]        [เช็คออนไลน์] [โหมดมืด]

KPI Row
นักเรียน 77 | คะแนนเฉลี่ย 78% | Growth +36% | กลุ่มเสี่ยง 75

Main Insight
- นักเรียนเก่งมาก 63 คน
- ต้องเสริมพื้นฐาน 11 คน
- Quest ที่อ่อนสุด: Mini Mock, nouns_quantifiers

Charts
[ระดับผลการเรียน] [อัตราสำเร็จ Quest]

Action Panel
[ดู Early Warning] [เปิดสอบ O-NET] [Export รายงาน]
```

### Header Improvements

Tasks:

1. แยก header เป็น 2 ชั้น:
   - ชั้นแรก: title + school context
   - ชั้นสอง: room filters + quick actions
2. ลด pill ที่ไม่จำเป็นใน header
3. ย้าย theme toggle ไป sidebar footer หรือ settings area
4. ทำให้ room filter เป็น segmented control ที่อ่านง่าย

Acceptance:

- Header ไม่ล้นบนจอ laptop
- ครูเห็นชื่อหน้าและโรงเรียนชัด
- Filter ห้องยังใช้งานได้ใน 1 คลิก

### Sidebar Improvements

Tasks:

1. ลด card โรงเรียนใน sidebar ให้ compact
2. เอาข้อมูลโรงเรียนซ้ำออก ถ้า header แสดงอยู่แล้ว
3. จัดกลุ่มเมนูเป็น:
   - Overview
   - Students
   - Analytics
   - Exams
   - Settings
4. ทำ active state ให้เด่น แต่ไม่กินพื้นที่มาก
5. Early Warning badge ควรแสดงจำนวนและมี tooltip/label ที่บอกความหมาย

Acceptance:

- Sidebar scan ง่ายขึ้น
- เมนูสำคัญไม่จมหาย
- ไม่มีข้อมูลซ้ำที่ไม่จำเป็น

### KPI Card Improvements

Tasks:

1. กำหนด primary KPI คือ `คะแนนปัจจุบัน`
2. ทำ primary KPI ให้เด่นกว่าการ์ดอื่นเล็กน้อย
3. เพิ่ม trend/subtext เช่น `+36% จาก Pre-test`
4. เปลี่ยน label ให้ action-oriented มากขึ้น:
   - `จำนวนนักเรียน`
   - `Pre-test เฉลี่ย`
   - `คะแนนปัจจุบัน`
   - `Growth`
   - `กลุ่มเสี่ยง`
5. พิจารณารวม `Growth` กับ `คะแนนปัจจุบัน` หากพื้นที่แน่น

Acceptance:

- ครูเข้าใจตัวเลขหลักภายใน 3 วินาที
- KPI ไม่ดูเท่ากันหมดจนไม่มี hierarchy
- ข้อมูลไม่ซ้ำกับ chart ด้านล่างมากเกินไป

### Chart and Insight Improvements

Tasks:

1. เก็บ donut chart ไว้เฉพาะข้อมูลที่เหมาะกับสัดส่วน เช่นระดับผลการเรียน
2. เปลี่ยน `จุดอ่อน Quest` จาก donut เป็น ranked list
3. เพิ่ม insight sentence เหนือ chart เช่น:
   - `นักเรียน 14% ต้องเสริมพื้นฐาน`
   - `Quest ที่อ่อนสุดคือ Mini Mock`
   - `อัตราสำเร็จรวม 36%`
4. ลด legend ที่ยาวเกินไป
5. ใช้สีแบบ semantic:
   - เขียว = ดี/ผ่าน
   - เหลือง = เฝ้าระวัง
   - แดง = เสี่ยง
   - ฟ้า/ม่วง = ข้อมูลทั่วไป

Acceptance:

- จุดอ่อนของห้องเรียนอ่านได้ทันที
- Chart ไม่บังคับให้ครูตีความเองทุกจุด
- สีแต่ละสีมีความหมายคงที่

### Early Warning Workflow

Tasks:

1. เพิ่ม action card สำหรับ Early Warning ในหน้า overview
2. แสดง top reasons เช่น:
   - คะแนนต่ำกว่า 50%
   - ไม่เข้าเรียนเกิน 3 วัน
   - ทำข้อผิดซ้ำ
   - fast guessing สูง
3. เพิ่มปุ่ม:
   - `ดูรายชื่อนักเรียนกลุ่มเสี่ยง`
   - `สร้างแผนทบทวน`
   - `Export รายชื่อ`
4. แยก severity:
   - High risk
   - Medium risk
   - Watch list

Acceptance:

- ครูรู้ทันทีว่าควรช่วยใครก่อน
- Early Warning ไม่เป็นแค่ตัวเลข
- มี next action จากหน้า overview

### Responsive Dashboard Behavior

Tasks:

1. Desktop: sidebar fixed, content max-width ที่อ่านสบาย
2. Tablet: sidebar collapsible
3. Mobile: dashboard เปลี่ยนเป็น stacked cards และซ่อน chart หนักบางส่วน
4. KPI cards ใช้ grid responsive
5. Chart cards ไม่ควรบีบจน legend อ่านไม่ได้

Acceptance:

- ใช้ได้ดีบน laptop 1366px
- Tablet ไม่ล้นแนวนอน
- Mobile เห็น KPI และ action สำคัญก่อน chart

### Dashboard Implementation Files

Files likely to change:

- `src/components/TeacherDashboard.jsx`
- `src/components/SuperAdminDashboard.jsx`
- `src/index.css`

Possible new components:

- `src/components/teacher/TeacherShell.jsx`
- `src/components/teacher/TeacherSidebar.jsx`
- `src/components/teacher/TeacherHeader.jsx`
- `src/components/teacher/KpiCard.jsx`
- `src/components/teacher/InsightPanel.jsx`
- `src/components/teacher/EarlyWarningPanel.jsx`
- `src/components/teacher/WeakQuestList.jsx`

Recommendation:

ควรเริ่มจากแยก component เฉพาะ dashboard ออกจาก `TeacherDashboard.jsx` ทีละส่วน เพราะไฟล์นี้ใหญ่และเสี่ยงแก้ยากในระยะยาว

## Phase 2A: Content QA and Blueprint Alignment

Priority: High; เป็นงานถัดไปก่อนรับรองหลักสูตรและเดินหน้าเปิดขาย โดยคงหมายเลข Phase 3-8 เดิม

สถานะ: ตารางจับคู่เสร็จแล้ว การตรวจเฉลยครบคลังและ implementation ด้านล่างยังไม่เริ่ม

### 2A.1 Source Mapping

- [x] เทียบต้นทางกับสำเนาครบ 65 ไฟล์ด้วย hash
- [x] อ่าน checklist Word 8 ไฟล์และแยกไฟล์ซ้ำ
- [x] จับคู่ครบ 44 หัวข้อ SET1-SET7 กับตัวชี้วัดเป้าหมาย ด่าน และหลักฐาน candidate
- [x] บันทึกรายการเสริมจาก checklist และช่องว่างการระบุตัวชี้วัด

### 2A.2 Item Review Before Expansion

- [ ] ตรวจ candidate เทียบหน้าเอกสารจริง รวมภาพ บทอ่าน ตัวเลือก เฉลย และเหตุผล ไม่ตรวจเฉพาะข้อความโจทย์
- [ ] ทำรายการสื่อประกอบตาม Phase 2A.2B ควบคู่การตรวจรายข้อ ไม่ให้สถานะ approved เฉพาะข้อความโดยละเลยภาพ/ตารางที่ใช้ตอบ
- [ ] ตรวจ 23 หัวข้อที่ยังเชื่อมต้นทางไม่ได้ในคลัง/มินิเกมเดิมก่อนสรุปว่าขาด
- [ ] ให้ครูทวนและกำหนด approved / needs_revision / unrelated พร้อมเหตุผล; จำนวน approved ปัจจุบันเป็นไม่ทราบ ไม่ใช่ศูนย์
- [ ] แยกตัวชี้วัดที่ checklist ตั้งใจสอนจากสิ่งที่ item วัดจริง; ระบุ primary indicator หนึ่งตัวสำหรับนับ quota
- [ ] ตรวจช่องว่างของทั้ง 14 ตัวชี้วัดร่วมกับเอกสารอื่น ไม่เพิ่มด่านตามชื่อ SET หรือจำนวนตัวชี้วัดที่ไม่ปรากฏใน checklist ทันที

### 2A.2B Assessment Media Completeness

Priority: Critical สำหรับข้อที่ไม่สามารถตอบอย่างเป็นธรรมได้หากไม่มีสื่อ ต้องผ่านก่อนนับ coverage ของข้อดังกล่าวและก่อนนำเข้าสอบจริง

ปัญหาที่ต้องแยก:

- Missing source media: มีโจทย์อ้างภาพ/ตาราง/สัญลักษณ์ แต่ไม่ได้เก็บสิ่งเร้าต้นฉบับไว้
- Placeholder media: ใช้ emoji หรือข้อความเช่น `(Recycle symbol)`, `(ป้ายช้อนส้อม)`, `(สัญลักษณ์เตียง/ตึกที่มีกากบาทแดง)` แทนภาพที่โจทย์ต้องให้เด็กตีความ
- Rendering gap: มี q.image/q.passage ในข้อมูล แต่บางหน้าหรือโหมดไม่แสดง เช่น ExamMode
- Unverified media: มีภาพที่สร้างใหม่แล้ว แต่ยังไม่ตรวจค่ากราฟ แกน แผนที่ สัญลักษณ์ หรือความสัมพันธ์กับตัวเลือก/เฉลย

คำบรรยายที่บอกชื่อหรือความหมายรูปอาจเฉลยคำตอบ เปลี่ยนข้อวัดการตีความภาพเป็นการแปลข้อความ หรือทำให้ตอบไม่ได้ อิโมจิใช้ตกแต่ง/ให้รางวัลได้ แต่ไม่แทนสื่อประเมินที่ต้องมีรายละเอียดคงที่ เว้นแต่ต้นฉบับและครูยืนยันว่าเหมาะกับสิ่งที่วัด

#### Media Inventory and Source Verification

- [ ] ตรวจ item ที่อ้าง picture/chart/table/map/sign/symbol รวมข้อที่ไม่มีคำเหล่านี้แต่ต้นฉบับมีสื่อ และตรวจมินิเกมทุกชนิด ไม่พึ่งค้น keyword อย่างเดียว
- [ ] ใช้ตาราง 44 หัวข้อเป็นจุดเริ่ม แล้วขยาย inventory ไป Pre-test, Quiz, Review, Final Boss, Arena, Simulator และตัวเลือกที่เป็นรูป
- [ ] บันทึก itemId/version, sourceFile/page, stimulusId/version, ชนิดสื่อ, บทบาทในการตอบ, asset/data path, สิทธิ์ใช้, renderer ที่รองรับ และผู้ตรวจ
- [ ] แยกสถานะ not_required / missing / placeholder / present_unverified / render_failure / verified ไม่ถือว่ามี path แล้วเท่ากับครบ
- [ ] แยกภาพประกอบตกแต่งออกจากสิ่งเร้าที่จำเป็นต่อคำตอบ และผูกสิ่งเร้าร่วมกับทุกข้อที่ใช้ภาพ/บทอ่าน/ตารางเดียวกัน
- [ ] ผลลัพธ์งานนี้เป็น Media Inventory รายข้อพร้อมรายการซ่อม ไม่ใช่การเพิ่มภาพสุ่มให้ทุกด่าน

#### Restore or Rebuild Faithful Stimuli

- [ ] ถ้าใช้ต้นฉบับได้ตามสิทธิ์ ให้สกัดภาพเฉพาะส่วนจาก PDF ความละเอียดเพียงพอ โดยไม่ติดเลขเฉลย คำตอบ หรือส่วนใบงานครู และบันทึกหน้าอ้างอิง
- [ ] ถ้าต้องวาดใหม่ ให้ใช้ต้นฉบับและข้อมูลที่ตรวจแล้วเป็นฐาน รักษาทิศทาง จำนวน ตำแหน่ง สีที่มีความหมาย และรายละเอียดที่ใช้ตอบ พร้อมระบุ adapted version
- [ ] ตารางเก็บเป็น structured data และแสดงด้วย HTML table; กราฟ/ผัง/นาฬิกา/แผนที่สร้างแบบ deterministic จากข้อมูล ใช้ SVG/canvas/library ที่เหมาะสม ไม่ใช้ภาพ AI เดาค่าตัวเลขหรือทิศทาง
- [ ] ภาพวัตถุ/ฉากอาจใช้ภาพที่ได้รับอนุญาตหรือภาพสร้างใหม่ แต่ต้องตรวจว่าไม่เพิ่มหรือลดเบาะแสจนคำตอบหรือความยากเปลี่ยน ห้ามใช้ภาพสร้างใหม่โดยไม่ตรวจแล้วอ้างว่าเหมือนต้นฉบับ
- [ ] ถ้าอ่านข้อมูลต้นฉบับไม่ชัด ให้พักข้อไว้ขอตรวจ ไม่เติมค่าหรือรายละเอียดที่คาดเดา
- [ ] ลบ/ปรับข้อความ placeholder เฉพาะเมื่อสื่อจริงพร้อมและตรวจแล้ว โดยรักษาข้อความที่มีอยู่จริงในต้นฉบับ ไม่ลบคำบรรยายที่เป็นส่วนของโจทย์อย่างเหมารวม
- [ ] ให้ครูตรวจคู่ stimulus + question + options + answer หลังแทนสื่อทุกครั้ง การแก้ภาพต้องมีเวอร์ชันและไม่เปลี่ยนประวัติ attempt เก่า

#### Shared Renderer and Learning UI

- [ ] เพิ่ม QuestionStimulus renderer กลางสำหรับ image / symbol / passage / table / chart / map / grouped stimuli และนำไปใช้ในทุกโหมดที่มีข้อประเภทนั้น
- [ ] ใช้ adapter รองรับ q.image/q.passage เดิมระหว่างย้าย schema ไม่ทำให้ข้อเก่าหาย และไม่ใช้ emoji เป็น fallback เมื่อภาพเสีย
- [ ] แสดงสิ่งเร้าก่อนหรือข้างคำถามตามพื้นที่; มือถือเลื่อนอ่านได้ มีขยายภาพ/ตาราง ตัวหนังสือในภาพไม่เล็กจนอ่านไม่ได้ และไม่ crop รายละเอียดที่ใช้ตอบ
- [ ] ข้อหลายคำถามใช้สิ่งเร้าร่วมต้องเข้าถึงสิ่งเร้าเดิมได้ตลอด ไม่บังคับจำข้อมูลจากหน้าก่อน และไม่จับคู่ภาพผิดหลังสุ่มข้อ
- [ ] ถ้าตัวเลือกเป็นรูป ให้รองรับ image options พร้อม label A-D และสุ่มโดยเก็บ identity/เฉลยที่ถูกต้อง
- [ ] เตรียม alt text หรือข้อมูลเทียบเท่าที่บรรยายสิ่งเร้าโดยไม่แปลความเป็นเฉลย; ไม่ซ่อนข้อมูลจำเป็นจากผู้ใช้โปรแกรมอ่านหน้าจอ หากรูปแบบการเข้าถึงเปลี่ยนสิ่งที่วัด ต้องให้ครูกำหนด assessment/accommodation ที่เหมาะสม
- [ ] สี รูปทรง เส้นแกน และสัญลักษณ์อ่านได้ชัด ไม่พึ่งสีอย่างเดียว ปุ่มขยายมี keyboard focus และรองรับการกลับตำแหน่งเดิม

#### Eligibility Gates and Failure Handling

- [ ] เพิ่ม requiresStimulus + stimulusStatus + supportedRenderers ลงใน item eligibility; approved content ต้องมีสื่อ verified และแสดงได้ในโหมดปลายทางด้วย
- [ ] ข้อที่ต้องมีสื่อแต่ missing/placeholder/unverified ห้ามใช้ให้คะแนน mastery, Pre/Post, mock หรือ official exam; อนุญาต preview เฉพาะผู้ตรวจพร้อมป้ายสถานะ ไม่ใช้เป็นข้อฝึกที่คิดคะแนนแบบปกติ
- [ ] ตรวจ asset/data ก่อนเริ่มกระดาษสอบ ถ้าตัดข้อไม่สมบูรณ์แล้ว quota ไม่ครบ ให้แจ้งว่าคลังไม่พร้อม ห้ามเติมข้อผิดมาตรฐานเงียบ ๆ
- [ ] ถ้าสื่อเสียระหว่าง attempt ให้แสดงข้อผิดพลาดและทางกู้คืนตามนโยบายโหมดนั้น ไม่ให้เด็กเดา ไม่หักคะแนนจากความผิดพลาดของระบบ และไม่แทนด้วยข้อความที่เผยเฉลย
- [ ] กำหนดการพักเวลา/กลับเข้าข้อ/ส่งตรวจ attempt ของการสอบจับเวลาก่อนใช้งานจริง พร้อมบันทึกเหตุการณ์ ไม่เปลี่ยนเวลา/คะแนนย้อนหลังโดยไม่มีหลักฐาน

#### Verification and Completion Criteria

- [ ] Unit tests ตรวจ schema/eligibility, missing asset, reference ไป stimulus ไม่มีจริง และ shared-stimulus identity หลังสุ่ม
- [ ] ตรวจค่าตาราง ผลรวมกราฟ แกน/หน่วย ทิศทาง/ตำแหน่งแผนที่ และเฉลยกับข้อมูลจริง ไม่ใช้ screenshot เพียงอย่างเดียวรับรองค่าตัวเลข
- [ ] Browser tests ครบ Quiz/Review/Pre-test/FinalBoss/Arena/Simulator ที่ใช้สื่อ; ตรวจ image decode/network failure และ canvas/SVG ไม่ว่าง
- [ ] ตรวจ screenshot desktop/tablet/mobile และ zoom ว่าอ่านรายละเอียดได้ ไม่ล้น ไม่บังตัวเลือก/ปุ่ม และไม่มีคำตอบหลุดจากชื่อไฟล์/ข้อความ UI/ตัวช่วย
- [ ] ครู sign-off สื่อที่ใช้ตอบใน release pool; ทวน inventory หลังแก้ข้อมูลหรือ asset ทุกครั้ง

Deliverables ที่วางแผนไว้:

- Media Inventory รายข้อ พร้อม source page, สถานะ, สิทธิ์ใช้ และผู้ตรวจ
- ชุด assets/structured stimulus data ที่มีเวอร์ชันและหลักฐานเทียบต้นฉบับ
- Shared QuestionStimulus renderer และ adapter ของข้อเดิม
- Eligibility gate ในเครื่องออกข้อสอบ พร้อมรายงานคลังที่สื่อยังไม่พร้อม
- ชุดทดสอบสื่อและบันทึก teacher sign-off ก่อนนำเข้า approved assessment pool

#### Implementation Batch 1 (2026-10-13)

- เพิ่ม `scripts/audit-question-media.mjs` และ `md/Question Media Inventory.json/.csv`: 1,127 รายการจาก QUESTS, Pre-test, arena array exports และ FinalBoss (เป็นจำนวนแถวตามตำแหน่ง ไม่ใช่จำนวนข้อไม่ซ้ำ)
- ผล triage: 88 present_unverified, 7 placeholder, 1,032 not_required ตามข้อมูลที่ประกาศและ heuristic; not_required ไม่ใช่หลักฐานว่า PDF ไม่มีสื่อ ต้องทวนต้นฉบับ โดยเฉพาะรายการ needsManualReview
- 7 placeholder อยู่ใน school/food/illness; ไม่มีการเติมภาพหรือแก้เฉลยโดยคาดเดา
- เพิ่ม `QuestionStimulus` รองรับ legacy image/passage และ structured table; ภาพขยายด้วย native dialog คืน focus หลังปิด; ตารางมี caption/header และเลื่อนภายในบนมือถือ
- เชื่อม Quiz, PreTest, ReviewMistake, FinalBoss และ ExamMode; Quiz คงสิ่งเร้าไว้ทั้งสองชั้นของ two-step
- เพิ่ม preflight ก่อนเริ่มชุด: กัน missing/placeholder/unsupported/unverified และภาพโหลดไม่สำเร็จ; ถ้าชุดมีข้อที่ใช้ไม่ได้ หยุดทั้งชุดโดยไม่ตัด/เติมข้อเงียบ ๆ
- ExamMode เริ่มเวลาหลัง preflight; เมื่อ renderer รายงานภาพเสียระหว่างทำ จะหยุดหน้าทำข้อสอบและไม่ auto-submit ชุดที่หยุด ไม่เปิดให้ผู้เรียน pause/resume เวลาเอง
- ข้อที่มีสื่อต้องมี mediaReview.status=verified, reviewer และ version ก่อนผ่าน media gate; ไม่มีการใส่ sign-off ให้ข้อมูล production เดิมอัตโนมัติ
- เพิ่ม `isMediaReleaseEligible` สำหรับ content approval + media approval แต่ยังไม่ได้ผูกกับเครื่องสุ่มตาม Blueprint ซึ่งเป็นงานถัดไป; คลังปัจจุบันยังไม่มี release-approved records
- ชุดทดสอบใช้ synthetic fixtures แยกจากการรับรองเนื้อหา production; ไม่มีการล้างประวัติหรือแก้ข้อมูล cloud
- Verification: `npm test` ผ่าน 56 tests; build ผ่าน (ยังมีคำเตือน bundle ใหญ่/import เดิม); `tests/question-media-browser.mjs`, `tests/quiz-browser.mjs`, `tests/browser-smoke.mjs` ผ่าน ตรวจภาพ desktop/mobile และ zoom 320/390/1366px แล้ว รวมการไม่ auto-submit หลังสื่อเสียกลางสอบ

ข้อจำกัด/งานต่อ:

- ยังไม่สกัดหรือแทนสื่อจริงจาก PDF; ต้องตรวจคู่ภาพ/บทอ่าน/ตารางกับคำถาม ตัวเลือก และเฉลยก่อน sign-off ทั้ง 88 รายการ
- ยังไม่ครอบคลุม payload ของมินิเกม, inline RealOnetSimulator, image options, shared-stimulus registry, renderer กราฟ/แผนที่จาก structured data และ accessibility equivalence review
- heuristic จับได้เพียง placeholder ที่ทราบ ไม่สามารถยืนยันข้อที่อ้างสื่อแบบอื่นครบทุกข้อ; ต้องตรวจต้นฉบับทุกแถวในตารางจับคู่
- สื่อเสียกลางชุดจะยกเลิกการส่งผลชุดนั้น; XP/สถิติรายข้อที่บันทึกไปก่อนเกิดเหตุไม่ได้ rollback อัตโนมัติ ต้องออกแบบ attempt/event transaction และนโยบาย recovery ต่อก่อนใช้สอบจริง
- บางชุดเดิมจะถูกพักเพราะมีสื่อยังไม่ตรวจรับ เป็นผลของ media gate ไม่ใช่การรับรองว่าข้อความล้วนที่เหลือผ่าน content review แล้ว

#### Implementation Batch 2 (2026-10-13)

- เทียบ PDF SET7 7.3 หน้า 4-7 และ 7.4 หน้า 5-7 ด้วยภาพ render และข้อความ; บันทึก SHA-256/source pages ใน `src/data/mediaRepairs.js`
- ซ่อม `pdf_set7_15` ถึง `pdf_set7_24` รวม 10 ข้อ: กราฟ 4, ลำดับกิจกรรม 1, ตาราง 5; ข้อมูลตารางเป็น 27.5/28.8, 27.8/38.5, 34.5/33.1 ตามต้นฉบับ ไม่ใช่ตัวเลข SVG เดิม
- พบตัวเลือกกำกวมจากข้อมูลแอปเดิมในกราฟสีและตาราง; พบข้อกราฟเส้นต้นฉบับมี A และ D ถูกทั้งคู่ จึงเสนอเวอร์ชันดัดแปลงตัวลวง D พร้อม change log ไม่อ้างว่าเป็นสำเนาต้นฉบับที่ไม่เปลี่ยนเลย
- เพิ่ม deterministic bar/line charts, แกน/หน่วย/ค่าตัวเลข, ตารางข้อมูลกราฟที่เข้าถึงได้ และ ordered sequence ใน shared renderer; schema ป้องกันค่า NaN, ข้อมูลตารางผิดรูป และแกน/step ไม่ถูกต้อง
- เพิ่มหน้าตรวจ local `http://127.0.0.1:5173/scratch/media-review.html` ไม่บันทึกคะแนน/XP/approval มีลิงก์เปิด PDF หน้าต้นฉบับและเฉลย
- ข้อซ่อมทุกข้อเป็น `media-repair-v2`, `pending_teacher`; sourceCheck โดย Codex ไม่ใช่ teacher sign-off และสิทธิ์เผยแพร่ยังรอยืนยัน ไม่ปลด media gate ให้เอง
- เพิ่ม detector สำหรับข้อความ Game controller, Shopping cart, Sun, Rainy cloud ที่ยังแทนภาพ; inventory ล่าสุด 1,127 แถว: 89 present_unverified, 11 placeholder, 1,027 not_required แบบ triage และ 100 แถวถูกพักก่อนประเมิน
- เก็บไฟล์ภาพเดิมและประวัติเก่าไว้ ไม่เปลี่ยนคะแนนย้อนหลัง; กรณีผลเก่าเกิดจากสื่อผิดต้องมีนโยบาย remediation แยก
- รายละเอียดตารางรายข้อและหลักฐาน: `md/Media Source Repair Batch 2.md`
- Verification Batch 2: unit tests 63/63 ผ่าน, build ผ่านพร้อมคำเตือน bundle/import เดิม; browser tests `media-source-browser`, `question-media-browser`, `quiz-browser` และ `browser-smoke` ผ่าน; ตรวจภาพทั้ง 10 ข้อที่ 320/390/768/1366px และ source hash ของ PDF จริง
- งานค้าง: ครูตรวจรับ 10 ข้อและยืนยันสิทธิ์, ต่อด้วยภาพ/แผนที่/สัญลักษณ์, passages และ payload มินิเกม/Simulator; ยังไม่รับรองสัดส่วน Blueprint

สถานะ: Batch 1 และชุดซ่อมต้นฉบับ Batch 2 ลงมือแล้ว แต่ Phase 2A.2B ยังไม่เสร็จ และยังไม่รับรองสื่อ/เฉลย/Blueprint ครบคลัง

### 2A.3 Repair Verified Learning and Exam Blockers

- Update 2026-10-13: ตรวจยืนยัน `shapes_colors`, `tenses_arena`, `clothes_fashion` มี 0 MCQ เพราะ adapter อ่านเฉพาะ fill_blank แต่ missions เป็น flashcard/matching/rearrange; ปิดปุ่ม Quiz ว่างใน MissionSelect และคงกิจกรรมเรียนรู้ไว้แล้ว ยังไม่ถือว่าซ่อม assessment หรือ progression เสร็จ
- Verification ของ empty-assessment guard: browser test ครบทั้ง 3 ด่าน ตรวจ disabled/ไม่มี navigation เข้าสอบว่าง แต่เข้าเกมเรียนรู้ได้, ปุ่ม Quiz ด่าน family ยังทำงาน, layout 320/390/1366px ผ่าน; unit tests 63/63 และ build ผ่าน (คำเตือน bundle/import เดิม)
- Update ชุดร่าง 2026-10-13: เพิ่มข้อประเมินแต่งใหม่ให้ shapes_colors/clothes_fashion/tenses_arena อย่างละ 10 ข้อใน `src/data/questAssessments.js` พร้อมรูปทรง SVG วาดใหม่ 6 ไฟล์, provenance, explanation, provisional difficulty และ version; ปัจจุบันไม่ใช่คลัง 0 ข้อแล้ว แต่ยัง pending_teacher ทั้ง 30 ข้อ จึงยังไม่ปลดปุ่มให้คะแนนจริง
- เพิ่มลิงก์ "ลอง Quiz ชุดร่าง" เฉพาะ dev ใน MissionSelect และหน้า interactive review `/scratch/assessment-review.html` (กรอง quest ได้) ให้ลองเลือกคำตอบ/ดูเฉลยโดยไม่บันทึกคะแนน/XP/approval; แยกจากปุ่ม "Quiz รอตรวจรับ" เพื่อลดความสับสนว่าเป็นปัญหาโหลดไม่ขึ้น
- ชุดใหม่ใช้ `first_response_v1`: บันทึกคำตอบครั้งแรกแยกจากหลังเฉลย, score/ผ่านด่านคิดจากครั้งแรกในรอบ; XP ฝึกยังแยกได้, storage ตรวจ evidence และเก็บ lastAssessment โดยไม่เปลี่ยนผลเดิม; ยังไม่ใช่ calibrated independent mastery และไม่เปลี่ยนนโยบายด่าน legacy ทั้งระบบ
- รายละเอียดและข้อจำกัด: `md/Three Quest Assessment Drafts.md`; progression tests ใช้การอนุมัติจำลองใน isolated fixture เท่านั้น ไม่ปลด content/media review ใน production
- Verification ชุดร่าง: unit tests 68/68, build, `quest-assessments-browser`, `empty-assessment-browser`, `quiz-browser`, `media-source-browser` และ `browser-smoke` ผ่าน; ตรวจภาพ/ตัวเลือกที่ 320/390/1366px และ pixel checks รูปทรง; inventory ล่าสุด 1,157 แถว (99 present_unverified, 11 placeholder, 1,047 not_required แบบ triage), 130 แถวถูกพัก รวม draft 30 ข้อ, release-approved ยังเป็น 0
- Approval update 2026-10-13: ผู้ใช้ลองหน้า `assessment-review.html?quest=shapes_colors` แล้วอนุมัติ "เพิ่มเป็น quiz ได้เลย" จึงเปิด Shapes & Colors 10 ข้อเป็น Quiz ฝึก พร้อม content/media approval ตามเวอร์ชันที่ลอง; ไม่ขยายการอนุมัติไป Clothes/Tenses อีก 20 ข้อ, SET7 หรือสนามสอบ
- Shapes เข้าได้จาก Quest Map → MissionSelect → Quiz Mode, preflight ภาพผ่าน, คิดคะแนนครั้งแรก/XP/ผลผ่านด้วย flow เดิม; แก้ MiniLesson ที่ไม่มีบทให้เปลี่ยนหน้าใน effect แทนการอัปเดต parent ระหว่าง render
- จำกัด approvedModes=['practice_assessment']; ตัวเก็บข้อสอบปลายภาคไม่ดึงชุดที่ไม่ได้อนุมัติสำหรับ school_final_50 และยังไม่อ้าง official Blueprint alignment; accessibility equivalence และ difficulty calibration ไม่ถือว่าผ่านตามการอนุมัติภาพฝึกครั้งนี้
- Verification หลังอนุมัติ: 69 unit tests, build, browser เข้า Shapes ผ่านหน้าเว็บหลักจริงและทำชุด/บันทึกหลักฐานผ่าน, ปุ่ม Clothes/Tenses ยังถูกพัก; inventory 1,157 แถว มี verified สำหรับ practice 10, present_unverified 89, placeholder 11, not_required แบบ triage 1,047 และพักก่อนประเมิน 120 แถว
- Clothing illustrations update 2026-10-13: ตามคำขอเพิ่มรูปประกอบ `clothes_fashion` ครบ 10 ข้อ ใช้ภาพ PNG โปร่งใส 9 ภาพใน `public/assessment/clothes/` (เสื้อกันฝนใช้ร่วม 2 ข้อ) สร้างด้วย built-in image_gen ไม่ใช้ emoji หรือหน้าการ์ดเฉลย; เก็บ prompt และที่มาครบใน `md/Clothing Image Generation.json`
- ชุดเสื้อผ้าเปลี่ยนเป็น `practice-illustrated-v2`: 4 ข้อแรกวัดคำศัพท์จากภาพ อีก 6 ข้อคงโจทย์บริบทพร้อมภาพประกอบ; คงตัวเลือก/เฉลยเดิมและใช้ renderer ขยายภาพที่มีอยู่ ไม่เปลี่ยน Shapes ที่อนุมัติแล้ว ทั้งเนื้อหา/สื่อของชุดเสื้อผ้ายัง pending_teacher และ accessibility equivalence ยังรอทวน ไม่เปิดคิดคะแนนหรือรวมสนามสอบจากการเพิ่มภาพเพียงอย่างเดียว
- Verification ภาพเสื้อผ้า: unit tests 70/70, build และ `quest-assessments-browser` ผ่าน; `clothing-images-browser` ตรวจทั้ง 10 ข้อที่ 320/390/1366px ว่าภาพโหลด มี pixels/ความโปร่งใสจริง ไม่ล้นแนวนอน ตัวเลือกครบ และขยาย/Escape/คืน focus ได้; ไม่มีการเขียนข้อมูลนักเรียนจริง
- Inventory หลังเพิ่มภาพเสื้อผ้า: 1,157 แถว มี verified สำหรับ practice 10, present_unverified 99, placeholder 11, not_required แบบ triage 1,037 และพักก่อนประเมิน 120 แถว งานถัดไปคือผู้ใช้/ครูตรวจรูปและความเหมาะสมรายข้อก่อนอนุมัติชุดเสื้อผ้า
- Clothing approval update 2026-10-13: ผู้ใช้ตรวจหน้า `assessment-review.html?quest=clothes_fashion` แล้วแจ้ง "ผมดูแล้ว อนุมัตครับ" จึงบันทึกผู้อนุมัติเป็น workspace_owner และอนุมัติเนื้อหา/สื่อครบ 10 ข้อเฉพาะ `practice-illustrated-v2` สำหรับ `practice_assessment`; เปิด Quiz ฝึกใน MissionSelect โดยไม่เปลี่ยนเนื้อหา รูป เกณฑ์ผ่าน หรือประวัติคะแนนเดิม ไม่รวม school_final_50/official O-NET และไม่ถือว่า accessibility equivalence ผ่านแล้ว
- Verification หลังอนุมัติเสื้อผ้า: unit tests 70/70, build, `quest-assessments-browser` และ `empty-assessment-browser` ผ่าน; เข้า Shapes/Clothes จาก Quest Map จริงได้พร้อมภาพ/ตัวเลือกที่ 320/390/1366px และตรวจการบันทึก first-response evidence ด้วยข้อมูลทดสอบแยก Tenses 10 ข้อยัง pending_teacher
- Inventory ล่าสุดหลังอนุมัติ: 1,157 แถว มี verified สำหรับ practice 20, present_unverified 89, placeholder 11, not_required แบบ triage 1,037 และพักก่อนประเมิน 110 แถว; การอนุมัตินี้ไม่ขยายไป SET7 หรือคลังอื่น
- Tenses approval update 2026-10-13: ผู้ใช้แนบภาพหน้า `assessment-review.html?quest=tenses_arena` และแจ้ง "เห็นแล้ว อนุมัติ" จึงบันทึก workspace_owner approval สำหรับ Tenses 10 ข้อเวอร์ชัน `practice-draft-v1` เฉพาะ `practice_assessment` และเปิด Quiz ผ่าน MissionSelect; คงโจทย์/เฉลย/เวอร์ชันที่ตรวจแล้ว สื่อระบุ not_required เพราะวัดรูปประโยคจากข้อความ ไม่สร้างภาพตกแต่งหรือรับรองสื่อที่ไม่มีอยู่
- หลังอนุมัติ Tenses ทั้ง 3 ชุดมี Quiz ฝึกที่ตรวจรับแล้ว รวม 30 ข้อ โดยไม่แก้คะแนนย้อนหลัง ไม่ขยายไป school_final_50/official O-NET, SET7 หรือคลังอื่น; difficulty calibration และ accessibility equivalence ยังเป็นงานแยก
- Verification หลังอนุมัติ Tenses: unit tests 71/71, build, `quest-assessments-browser` และ `empty-assessment-browser` ผ่าน; ใช้ approval จริงทั้ง 3 ชุดเข้า Quest Map → MissionSelect → Quiz, ตรวจ layout ที่ 320/390/1366px และบันทึก first-response evidence; สำเนา pending ใน test fixture ยังถูกปิดกั้น ไม่มีการเขียนข้อมูลนักเรียนจริง
- Inventory ปัจจุบัน: 1,157 แถว, verified media สำหรับ practice 20, present_unverified 89, placeholder 11, not_required แบบ triage 1,037; releaseEligible สำหรับ practice 30 และพักก่อนประเมิน 100 แถว (Tenses เป็น approved text-only ไม่ใช่ verified image 10 ภาพ)
- ห้ามสร้างข้อสอบด้วยการแปลง emoji/หน้าการ์ดเฉลยเป็นสิ่งเร้าประเมินอัตโนมัติ; เลือกข้อที่ตรวจแล้ว หรือออกแบบ assessment เฉพาะทักษะพร้อมตรวจสื่อและเฉลย โดยไม่ลดเกณฑ์หรือให้ XP แทนการผ่าน
- [x] ซ่อม assessment ด่านว่างทั้ง 3 สำหรับ Quiz ฝึก: Shapes/Clothes/Tenses ชุดละ 10 ข้อผ่านผู้ใช้ตรวจรับแล้ว บันทึกคะแนนคำตอบครั้งแรกและผ่านตามเกณฑ์เดิม; ไม่ถือว่าทั้งคลังหรือ Blueprint ผ่านการตรวจแล้ว
- [x] ทดสอบผู้เรียนใหม่จนปลดล็อกบท 2 และเดินต่อได้โดยไม่พึ่ง legacy progress: browser flow เริ่ม session ว่าง → login ผ่าน roster จำลอง → Pre-test 20 ข้อ → บท 1 ทั้ง 10 ด่าน → ทบทวนข้อผิด 3 ข้อ ข้อละ 2 ครั้ง → เข้า Quiz บท 2 และ reload แล้วยังเก็บความก้าวหน้า (2026-10-13)
- New learner repair 2026-10-13: ตรวจข้อความบทอ่าน Lisa เดิมครบทั้ง 3 ข้อใน Pre-test และบันทึก Codex media rendering check เฉพาะสำเนา Pre-test; ไม่เพิ่ม human content approval หรือ official-source claim และยังไม่เข้า official release pool
- ใช้ practice readiness ร่วมกันใน MissionSelect/Quiz เพื่อพัก pending/rejected/quarantined และสื่อ missing/placeholder/present_unverified ก่อนสุ่มฝึก; ข้อที่ถูกพักยังอยู่ในคลังเดิม หน้า Quiz แสดงจำนวนรอบจริง/จำนวนพักเมื่อมีรายการถูกพัก และคงเกณฑ์ผ่าน 70%; หน้าสอบยังตรวจชุดเต็มตามเส้นทางเดิม
- พบ Family ข้อ `pdf_1.2_ครอบครัว_9` ไม่มีตัวเลือกที่ตอบความสัมพันธ์ตามโจทย์ได้ จึง quarantine พร้อมเหตุผล โดยยังไม่แก้โจทย์/เฉลยเดิม; Family ฝึกได้ 7 ข้อหลังพักภาพ 2 ข้อและข้อกำกวม 1 ข้อ บท 1 รวมพัก 15 รายการ
- แก้ ReviewMistakePage ให้คงโจทย์ระหว่างแสดง feedback และเลือกข้อถัดไปจาก queue หลัง mastery update เพื่อไม่ค้าง/ข้ามตำแหน่งเมื่อรายการหาย; ตรวจแล้วว่าคะแนน Shapes 7/10 หลังแก้คำตอบยังคงเดิม และบท 2 ล็อกจนทบทวนครบจริง
- Pre-test ส่วนที่ทำแล้ว: บันทึก `total=20`/`version=pretest-v1`, validate category totals และใช้ total จริงคำนวณ badgeStats ของผลใหม่; ยังไม่แก้ประวัติเก่าหรือรับรอง denominator ของรายงานทุกหน้า
- Verification รอบผู้เรียนใหม่: 74 unit tests, build, `new-learner-browser`, `quiz-browser` และ `question-media-browser` ผ่าน; รายละเอียด/ขอบเขต/หลักฐานอยู่ใน `md/New Learner Verification.md` ข้อมูลฐานจำลองทั้งหมด ไม่มี live student writes
- Regression หลังแก้ตัวเลือกข้อฝึก: `quest-assessments-browser` และ `browser-smoke` ผ่านด้วย ทั้งสามชุดที่อนุมัติแล้ว, Quest Map, teacher overview/report และ exam timeout/double-submit ยังทำงานตาม tests เดิม
- Inventory หลังรอบนี้: 1,157 แถว, verified media 23 (human-approved practice 20 + technical Pre-test passage checks 3), present_unverified 86, placeholder 11, not_required triage 1,037; practice releaseEligible ยังคง 30 และพักก่อนประเมิน 98 แถว
- [x] บันทึก total/version ของ Pre-test และแก้การคำนวณเปอร์เซ็นต์/รายงานที่ใช้ตัวหารไม่ตรงจำนวนข้อ: ใช้ resolver ร่วมทุก consumer; ข้อมูลเก่าใช้ category totals หรือ version ที่ทราบเท่านั้น ข้อมูลที่ระบุจำนวนข้อไม่ได้แสดง unknown และไม่เขียนประวัติย้อนหลัง (2026-10-13)
- [x] ทำ ExamMode ให้แสดง image/passage ครบ; แยก two_step ออกจากข้อสอบ MCQ และหยุดเมื่อข้อที่รองรับไม่ครบจำนวน พร้อมตรวจ timeout/ส่งซ้ำและสื่อเสีย; ยังไม่รับรองเนื้อหา/สื่อของทั้งคลัง
- [ ] ใช้ผล Media Inventory จาก 2A.2B ซ่อมทั้งข้อที่ไม่มีสื่อและข้อที่มีสื่อแต่ renderer ไม่รองรับ ก่อนเปิดใช้ประเมิน
- [x] แก้ Simulator ตำแหน่งคำตอบตายตัวและคำถามที่ไม่สัมพันธ์กับ passage; แยกชื่อเป็นชุดฝึก 5 ส่วน 45 ข้อ/45 นาที/คะแนนเปอร์เซ็นต์ พร้อมเฉลยหลังสลับตัวเลือกและนาฬิกาที่นับต่อระหว่างเปลี่ยน Part (2026-10-13)
- [x] Normalize feedback schema ของ two_step ผ่าน adapter เลือกคำอธิบายจริงทั้ง 4 กรณี และให้หน้าทบทวนตอบครบคำตอบ+เหตุผลก่อนนับความชำนาญ พร้อมป้องกันกดซ้ำ (2026-10-13)
- Reporting repair 2026-10-13: StudentReport, teacher overview/detail/CSV, Ranking และ growth badges ใช้ baseline เดียวกัน; class growth เทียบกลุ่มผู้เรียนที่มีข้อมูลทั้งสองด้าน และ unknown baseline ไม่สร้างคะแนน growth/Badge ใหม่ ไม่เรียกคืน XP/Badge ที่มีอยู่แล้ว
- Simulator repair: เพิ่ม passage Halloween ให้ตรง 3 ข้อ, ชี้บริบทโจทย์อนุญาต/อาชีพให้ชัด, ใช้ deadline และ snapshot คำตอบล่าสุด ป้องกันส่ง/ให้ XP ซ้ำ และไม่ให้ XP เมื่อหมดเวลาโดยไม่ตอบเลย; ยังเป็น authored practice ไม่ใช่ official Blueprint
- แก้ key `fs15` เป็นเวอร์ชัน `fs15-key-v2`: ค่าเฉลี่ย (85+78+91+70)/4 เท่ากับ 81 เดิม key ชี้ 82; บันทึก arithmetic sourceCheck โดยไม่ regrade ประวัติเดิม
- Verification ของรอบข้อ 2: unit tests 82/82, build, `reports-simulator-browser`, `new-learner-browser`, `browser-smoke`, `quiz-browser` และ `question-media-browser` ผ่าน; รายงาน/CSV 20/30/unknown, สองขั้นครบ 4 กรณี/กดซ้ำ, Simulator 45/45/สลับเฉลย/timeout/XP ครั้งเดียว และ MCQ shortage ไม่ส่งชุดไม่ครบ ตรวจ layout 320/390/1366px โดยใช้ข้อมูลแยกและไม่เขียนข้อมูลนักเรียนจริง
- รายละเอียดขอบเขต/หลักฐาน/ข้อที่ยังเหลือ: `md/Assessment Reporting and Simulator Repair.md`; งานถัดไปคือ SET7 และสื่อที่ยังขาด ก่อนตรวจเฉลย/ข้อซ้ำ/แท็กและตัวสุ่มตาม Blueprint

### Step 3 Update: Family Media Repair Batch 3 (2026-10-13)

- [x] เทียบ Family PDF หน้า 4-7 และเก็บ hash/หน้าต้นฉบับ/ตัวเลือกเดิม; ข้อ 1 และ 6 ใช้ภาพสร้างใหม่แทนอิโมจิ พร้อมแก้คำถามเป็นการอ่านภาพ
- [x] แก้ Family ข้อ 9 ซึ่งต้นฉบับและเฉลยใช้ `His aunt` ผิดความสัมพันธ์ เป็น `My aunt`; เก็บเวอร์ชันเดิมไว้ ไม่แก้ผลย้อนหลัง
- [x] เพิ่มหน้าตรวจ Family 3 ข้อ: `http://127.0.0.1:5173/scratch/media-review.html?batch=family`; SET7 10 ข้อยังคงที่ `http://127.0.0.1:5173/scratch/media-review.html`
- [x] ทั้งสองหน้าทดลองตอบ/ดูเหตุผลและลิงก์ PDF ได้ โดยไม่เขียนคะแนน XP หรือสถานะอนุมัติ
- [ ] เจ้าของตรวจรับ SET7 `media-repair-v2` และ Family `family-media-v2` แยกรายชุด; คำอนุมัติให้เริ่มงานรอบนี้ไม่ใช่การอนุมัติโจทย์เวอร์ชันที่เพิ่งสร้าง
- [ ] หลังอนุมัติแล้วจึงเปิดชุดที่เกี่ยวข้องตาม mode และ media version; ขณะนี้ Family ยังฝึกได้ 7 ข้อ และสื่อภาพใหม่ยังเป็น pending_teacher
- Verification: unit tests 85/85, production build, Family browser และ SET7 browser ผ่าน; ตรวจภาพไม่ว่าง/โปร่งใส, zoom/Escape/focus, source links และ layout 320/390/1366px (SET7 เพิ่ม 768px)
- New learner regression ผ่านซ้ำหลังเชื่อม Family: login/Pre-test 20 ข้อ → บท 1 ครบ 10 ด่าน (Family 7/7) → ทบทวนข้อผิด → เข้า Quiz บท 2 และ refresh ยังเก็บความก้าวหน้า โดยไม่เขียนข้อมูล cloud จริง
- Inventory หลังซ่อม: 1,157 แถว, verified 23, present_unverified 86, placeholder 11, not_required 1,037; พักก่อนประเมิน 98 แถว, releaseEligible 30 คงเดิม เพราะงานซ่อมไม่ใช่ content approval และแถวอาจซ้ำข้าม bank
- หลักฐาน/ขอบเขต: `md/Family Media Repair Batch 3.md`; prompt และแหล่งไฟล์ภาพ: `md/Family Image Generation.json`
- งานต่อหลังตรวจรับ: ซ่อมสื่อที่เหลือเป็นชุดเล็กตาม Inventory แล้วตรวจเฉลย/ข้อซ้ำ/แท็กตัวชี้วัดและความยาก ก่อนตัวสุ่ม Blueprint; สมาชิก/แพ็กเกจ/ชำระเงินจริงยังเป็นระยะถัดไป

### Family Approval Update (2026-10-13)

- [x] ผู้ใช้ตรวจหน้า `media-review.html?batch=family` แล้วอนุมัติ Family `family-media-v2` ทั้ง 3 ข้อ รวมภาพครอบครัว/บ้านและตัวเลือก My aunt; เปิดเฉพาะ Quiz ฝึก ทำให้ Family ครบ 10 ข้อ
- [x] บันทึก owner approval และ verified media ตามเวอร์ชัน โดยไม่เปลี่ยนคะแนนย้อนหลัง/ตัวหารของผลเดิม และไม่คืนปุ่มชุดร่างบนหน้าผู้เรียน
- การอนุมัตินี้ไม่ครอบคลุม SET7, school_final_50 หรือ official O-NET; สิทธิ์เผยแพร่ต้นฉบับและ accessibility equivalence ยังเป็นงานแยก
- Inventory ล่าสุด: 1,157 แถว; verified 25, present_unverified 84, placeholder 11, not_required 1,037; พักก่อนประเมิน 95 แถว, releaseEligible สำหรับ practice 33
- Unit tests หลังอนุมัติ 85/85 ผ่าน; production build ผ่านพร้อมคำเตือน chunk/import เดิม
- New learner browser ผ่านหลังเปิดใช้: Family 10/10 บันทึกผลครบ เข้าบท 2 ได้ และ refresh รักษาผลเดิม; ทดสอบด้วยข้อมูลจำลอง ไม่เขียน cloud จริง

### 2A.4 Bank Classification and Difficulty

- [ ] ตัดสำเนาซ้ำในคลังหลักโดยแยกการทบทวนโดยตั้งใจออกจาก duplicate ที่เพิ่มจำนวนรายการ
- [ ] จัด School/Signs/Reading ตามข้อที่ผ่าน review แล้ว ไม่ย้ายทั้ง pool จากชื่อด่าน
- [ ] เพิ่ม itemId/itemVersion, primaryStandard/indicator, secondarySkills, topic, difficulty, cognitiveLevel, stimulusId, sourceFile/sourcePage และ reviewStatus
- [ ] เรียง Foundation → Application → Transfer พร้อม prerequisite ระดับทักษะ; แยก XP Level จาก mastery
- [ ] แยก first-attempt accuracy จากคำตอบหลังดูเฉลย และเก็บจำนวนข้อใหม่ที่ใช้ประเมิน
- [ ] ทำ mapping/version สำหรับประวัติเดิมก่อนย้ายหน่วย ไม่ล้างคะแนน บัญชี หรือ attempt history
- [ ] ใช้ difficulty ที่ครูประเมินเป็นค่าเริ่มต้น แล้วปรับจาก pilot; ไม่อ้างว่าความยากผ่านการเทียบมาตรฐานก่อนมีข้อมูล

### 2A.5 Blueprint Exam Profiles

- [ ] แยก practice / onet_p6_2569 / school_final_50 พร้อมชื่อ จำนวนข้อ เวลา และวิธีคิดคะแนนที่ตรงกับ profile
- [ ] official profile ใช้ approved MCQ เท่านั้น: 32 ข้อ/60 นาที/3.125 คะแนนต่อข้อ และ quota 6/10/6/2/4/4 ตามมาตรฐาน
- [ ] เลือกเฉพาะ item ที่ผ่านทั้ง content review และ media eligibility ของโหมดสอบ ไม่ใช้เกณฑ์มีข้อความ/เฉลยอย่างเดียว
- [ ] ถ้าคลัง approved ไม่พอ quota ให้แจ้งออกชุดไม่ได้ ไม่เติม general items เงียบ ๆ
- [ ] สุ่มโดย item/stimulus identity รักษากลุ่ม passage/table และ remap เฉลยหลังสลับตัวเลือก
- [ ] เก็บ seed/item versions/blueprintVersion ใน attempt และตรวจ quota/no duplicates/stimulus completeness หลาย seed
- [ ] ไม่ใช้คำว่าเจนตาม Blueprint กับชุดที่เพียงสุ่มจากด่านหรือทำ quota ตาม skill เดิม

### 2A.6 Decide Additional Games and Learning UI

#### Target Learning Route

ทิศทาง UX ที่ยืนยัน: **พื้นฐาน → ชีวิตประจำวัน → การสื่อสาร → อ่านและตีความข้อมูล → ภาษาและวัฒนธรรม → ด่านบูรณาการ**

เส้นทางนี้เป็นเป้าหมายด้านการเรียนรู้ ไม่ใช่การย้ายทั้ง 33 quest ตามชื่อทันที; ตารางด้านล่างเป็น candidate assignment ต้องทวน item-level mapping และ difficulty ก่อนเปลี่ยนข้อมูลจริง หนึ่งด่านอาจแยกกิจกรรมหรือมี prerequisite จากหลายช่วง

| ช่วง | กลุ่มกิจกรรมที่เสนอ | เงื่อนไขการจัด |
|---|---|---|
| พื้นฐาน | ตัวเอง/ครอบครัว, คำศัพท์/จำนวน/รูปทรง, คำถาม/สรรพนาม/คำนาม/คำคุณศัพท์พื้นฐาน | ใช้คำและประโยคสั้นก่อน; คัดส่วน grammar ที่เป็น prerequisite ไม่ย้าย grammar ทั้งชุดมาไว้ต้นทาง |
| ชีวิตประจำวัน | Daily Routine, บ้าน/โรงเรียน, อาหาร/สุขภาพ/อากาศ/เครื่องแต่งกาย/การซื้อขาย | งานเล่าเวลาและกิจวัตรต้องตรวจ tense/time expressions ที่เด็กเรียนมาก่อน |
| การสื่อสาร | Conversation, Requests, Classroom language, feelings/jobs และการตอบรับอย่างสุภาพ | จัดจากวลี → บทสนทนาสั้น → สถานการณ์ใหม่; Classroom/Requests เป็นกิจกรรมย่อยหรือแยกด่านตาม coverage ที่ตรวจแล้ว |
| อ่านและตีความข้อมูล | ป้าย, ตำแหน่ง/ทิศทาง/แผนที่, reading, กราฟ/ตาราง/ลำดับ | เพิ่มความซับซ้อนจากข้อมูลจุดเดียว → เปรียบเทียบ → อนุมาน; แยก Chart/Table activity จาก passage เมื่อหลักฐานรองรับ |
| ภาษาและวัฒนธรรม | เทศกาล, การเปรียบเทียบวัฒนธรรม, countries/language และ cultural communication | Countries ไม่ได้เท่ากับ culture coverage; ต้องตรวจทักษะและตัวชี้วัดก่อนนับหรือเพิ่มด่าน |
| ด่านบูรณาการ | ภารกิจหลายทักษะ, boss/challenge, งานถ่ายโอนความรู้ไปบริบทใหม่ | ไม่ใช่จุดเริ่มเรียนภาษา/วัฒนธรรมครั้งแรก; ปลดล็อกจากหลักฐานทักษะ ไม่ใช่ XP หรือชื่อ Level |

Prerequisite ของทักษะต้องข้ามช่วงได้ เช่น polite requests อาจอาศัยโครงสร้างคำถามพื้นฐาน; ห้ามบังคับว่าทุกบทในช่วงก่อนหน้าต้องเสร็จเพียงเพราะอยู่คนละกลุ่ม UI

#### Four Modes And Evidence

| โหมด | ประสบการณ์ | หลักฐานที่บันทึก |
|---|---|---|
| เรียนรู้ | บทสั้น ตัวอย่าง Flashcard/ตัวละคร พร้อมเสียงและคำแปลตามสิทธิ์ | การเข้าร่วม/จบบทและ XP; ไม่ให้สถานะ mastery จากการเปิดอ่านหรือเห็นคำตอบ |
| ฝึก | ข้อสั้นพร้อม feedback และการลองใหม่ | จำนวนรอบ, การใช้ตัวช่วย, คำตอบครั้งแรกและหลังเฉลยแยกกัน; คะแนนฝึกไม่ใช่คะแนนสอบ |
| ท้าทาย | ข้อใหม่/สถานการณ์บูรณาการ ลดตัวช่วย | ความแม่นยำครั้งแรกของข้อที่ approved, item/stimulus versions, ทักษะ/ความยาก และความใหม่ของข้อ; ใช้เป็นหลักฐาน mastery เมื่อผ่านเกณฑ์ที่กำหนด |
| จำลองสอบ | ชุดตาม exam profile พร้อมเวลา กติกา และการแสดงสื่อครบ | attempt/seed/profile/Blueprint version, total/score/time/quota; ไม่มีตัวช่วยที่ขัดกติกา และไม่อ้าง official alignment ถ้ายังไม่ผ่าน quota audit |

UI ต้องแยกสองเรื่อง: **XP/Level/รางวัล = engagement** และ **ความชำนาญ = หลักฐานการตอบตามเกณฑ์**; คะแนนที่เคยเก็บก่อนมี mode/evidence version ต้องแสดงเป็น legacy score ไม่แปลงย้อนหลังเป็น mastery ใหม่โดยไม่มีหลักฐาน

ใช้แผนที่/ตัวละครในหน้าเส้นทาง จุดเลือกกิจกรรม และฉากรางวัล ส่วนหน้าทำโจทย์คงพื้นหลังสงบ ตัวหนังสือชัด และวางภาพ/บทอ่าน/ข้อมูลก่อนตัวเลือก; animation ไม่เคลื่อนโจทย์/ปุ่ม และเคารพ reduced motion

#### Delivery Order

1. ซ่อมด่านว่างและหน้าสอบ: UI ไม่พาไปสอบว่าง, มี assessment ที่ตรวจแล้วสำหรับด่านบังคับ, แสดงสื่อครบ, แก้ two_step/Simulator/Pre-test total พร้อมทดสอบ progression ผู้เรียนใหม่
2. จัดคลัง ตรวจต้นฉบับและเฉลย สื่อ ตัวลวง และ duplicate; ปิด teacher sign-off/สิทธิ์ใช้สำหรับ release pool
3. ติดแท็กตัวชี้วัด/ความยาก/ทักษะ/โหมด พร้อมเวอร์ชันและ mapping ประวัติเดิม
4. ทำตัวสุ่มตาม Blueprint และรายงานคลังไม่พอ quota โดยไม่เติมข้ออื่นเงียบ ๆ
5. ใช้ coverage ที่ผ่าน review ตัดสินใจแยก Classroom/Requests, Daily Routine, Chart/Table, Festival/Culture หรือเพิ่มด่าน พร้อมย้ายเส้นทาง UI 6 ช่วงแบบมี migration

สถานะ: ทิศทางและลำดับงานบันทึกแล้ว; ยังไม่ย้าย quest.chapter, prerequisite, ประวัติคะแนน หรือเปิดโหมดใหม่ทั้ง 4 ใน production

- [ ] สรุปช่องว่างจาก approved coverage ก่อนเลือกปรับด่านเดิม แยก subskill หรือเพิ่มด่านใหม่
- [ ] พิจารณา Classroom/Requests, Daily Routine, Chart/Table และ Culture/Language เฉพาะเมื่อหลักฐานยืนยันว่าคลัง/กิจกรรมเดิมยังไม่พอ
- [ ] ใช้เส้นทางเรียนรู้ / ฝึก / ท้าทาย / จำลองสอบ; พื้นที่โจทย์สงบและแสดงสิ่งเร้าครบ
- [ ] ออกแบบภาพ/ตารางให้ใช้ได้บนมือถือ พร้อมเสียง/แปลตาม profile; official exam ไม่มีตัวช่วยเกินกติกา
- [ ] ให้ครูเห็น coverage ที่ approved และ unknown แยกกัน ไม่ใช้จำนวนดาวหรือ completion แทนความครอบคลุม

Acceptance:

- ทุกหัวข้อมีสถานะ review ที่ตรวจย้อนกลับได้ ไม่จำเป็นต้องถือว่าทุกหัวข้อมี coverage เต็มตั้งแต่รุ่นแรก
- ไม่มี mandatory quest ที่ผู้เรียนใหม่ประเมินผ่านไม่ได้ และประวัติเดิมไม่สูญหาย
- ทุก item ที่ปล่อยใน official pool ผ่าน review มี stimulus ครบ และ renderer รองรับ
- ข้อที่จำเป็นต้องตีความภาพ/ตาราง/สัญลักษณ์ไม่มี emoji/คำบรรยายแทนสื่อหรือข้อความเฉลยแฝง และผ่าน media verification ตาม 2A.2B
- ชุดสอบตรงจำนวน/เวลา/คะแนน/quota ของ profile พร้อมรายงานเมื่อคลังไม่เพียงพอ
- Pre/Post/Growth ใช้ total/version ที่ถูกต้อง และไม่เปรียบเทียบต่าง profile โดยไม่อธิบาย
- มี teacher sign-off และตรวจการใช้เอกสาร/ภาพก่อนเผยแพร่เชิงพาณิชย์

## Phase 3: Auth Foundation

Priority: High

Tasks:

1. ตั้ง Supabase Auth
2. สร้าง role model
3. เพิ่ม `school_members`
4. เปลี่ยน Teacher Login ให้ใช้ auth จริง
5. เอา hardcoded accounts ออก
6. สร้าง Super Admin seed แบบปลอดภัย

Acceptance:

- ครู login ด้วย email/password
- Super Admin แยก role จริง
- ไม่มี admin shortcut ใน frontend
- logout/session ทำงานถูก

## Phase 4: School and Package Data Model

Priority: High

Tasks:

1. สร้าง `schools`
2. สร้าง `plans`
3. สร้าง `subscriptions`
4. ย้าย school data จาก localStorage ไป Supabase
5. ผูก students กับ `school_id`
6. ทำ helper ตรวจ current subscription

Acceptance:

- โรงเรียนมี package ปัจจุบัน
- ครูเห็นเฉพาะโรงเรียนตัวเอง
- Super Admin จัดการโรงเรียนจากฐานข้อมูลจริง

## Phase 5: Quota and Feature Gates

Priority: Medium

Tasks:

1. จำกัดจำนวนนักเรียนตาม plan
2. จำกัดจำนวนครูตาม plan
3. จำกัด feature เช่น final exam/export/ranking ตาม plan
4. เพิ่ม UI แจ้งเตือนเมื่อเกิน quota
5. เพิ่มหน้า package status ใน teacher dashboard

Acceptance:

- เพิ่มนักเรียนเกิน quota ไม่ได้
- Feature ที่ package ไม่รองรับถูก lock
- ครูเห็น package และวันหมดอายุ

## Phase 6: Manual Payment

Priority: Medium

Tasks:

1. สร้าง `payments`
2. เพิ่มหน้า Super Admin สำหรับบันทึก/อนุมัติ payment
3. ต่ออายุ subscription เมื่อ approve
4. เพิ่ม payment history ของโรงเรียน
5. เพิ่ม notification ใกล้หมดอายุ

Acceptance:

- Super Admin ต่ออายุ package ได้
- โรงเรียนหมดอายุแล้วถูกจำกัดสิทธิ์
- Payment history ตรวจสอบย้อนหลังได้

## Phase 7: Performance and Code Splitting

Priority: Medium

Tasks:

1. Lazy load TeacherDashboard
2. Lazy load SuperAdminDashboard
3. Lazy load game pages
4. Split large question pools by route/chapter
5. ตรวจ bundle size

Acceptance:

- Initial JS bundle ลดลงอย่างชัดเจน
- Landing page โหลดเร็วขึ้น
- Dashboard ยังทำงานครบ

## Phase 8: Production Hardening

Priority: Medium

Tasks:

1. RLS policies ครบ
2. Audit delete/reset operations
3. Error logging
4. Backup/export strategy
5. Admin activity log
6. Terms/privacy page
7. Data retention policy

Acceptance:

- ข้อมูลข้ามโรงเรียนไม่รั่ว
- operation สำคัญมี log
- พร้อมใช้งานกับโรงเรียนจริง

## 11. Suggested Milestone Timeline

### Milestone 1: Clean Product Demo

Scope:

- Fix scoring/ranking crash risks
- Landing page cleanup
- Build verification

Outcome:

- ใช้ demo ขาย/นำเสนอได้ดีขึ้น

### Milestone 1A: Verified Learning Content

Scope:

- Phase 2A: ทวนรายข้อและจัดสถานะ approved/needs_revision/unrelated จากตารางที่ทำแล้ว
- ซ่อม progression/หน้าสอบ/Pre-test และตรวจ stimulus ให้ครบ
- ทำ coverage matrix และ official exam profile ที่ตรวจ quota ย้อนกลับได้

Outcome:

- ใช้เนื้อหารุ่นที่ครูอนุมัติสำหรับ pilot ได้ พร้อมระบุขอบเขตที่ยังไม่ครบ
- ไม่มีข้อสรุปเพิ่มหรือย้ายด่านจากชื่อหัวข้อเพียงอย่างเดียว

### Milestone 2: Private Beta for Schools

Scope:

- Supabase Auth
- schools/plans/subscriptions
- teacher scoped dashboard
- basic quota
- ผ่านเกณฑ์เนื้อหา/เส้นทางเรียนสำหรับรุ่น pilot ตาม Milestone 1A

Outcome:

- ให้โรงเรียนทดลองใช้จริงได้แบบควบคุมสิทธิ์

### Milestone 3: Sellable MVP

Scope:

- manual payment
- package status
- expiration handling
- RLS hardening
- import/export stable

Outcome:

- เริ่มขาย package ได้

### Milestone 4: Scalable SaaS

Scope:

- payment gateway
- invoice
- code splitting
- advanced analytics
- support tools

Outcome:

- พร้อมขยายหลายโรงเรียน

## 12. Recommended Immediate Next Steps

ลำดับที่ควรทำต่อหลังตารางจับคู่วันที่ 2026-10-13:

1. ทวนข้อสอบ/มินิเกมรายหัวข้อจากตาราง SET1-SET7 ให้มีสถานะ review ก่อนตัดสินใจเพิ่มด่าน
2. ทำ Media Inventory และซ่อมปัญหาที่ตรวจยืนยันแล้ว: assessment ว่าง, progression, Pre-test total, สื่อที่ขาด/เป็น placeholder/ไม่แสดงในหน้าสอบ และ Simulator
3. จัดคลังจากรายการผ่าน review ติดแท็กมาตรฐาน/ตัวชี้วัด/ความยาก พร้อมรักษาประวัติเดิม
4. ทำตัวสุ่มตาม Blueprint เป็น profile แยก และทดสอบ quota/รูปแบบ/สิ่งเร้า
5. เพิ่มหรือย้ายด่านเฉพาะช่องว่างที่ approved coverage ยืนยัน แล้ว pilot เส้นทางเรียน
6. ต่อ Phase 3-4 จาก foundation ที่มี: audit schema/ข้อมูลเดิมบน staging, ownership และ migration ไม่สร้าง foundation ซ้ำโดยไม่จำเป็น
7. เชื่อม teacher/admin Auth จริง, session/reset password และทดสอบ RLS ข้ามโรงเรียน
8. เชื่อม subscription/package แล้วจึง enforce quota และ manual payment

เหตุผล:

- Scoring/ranking กระทบความถูกต้องของระบบ
- Landing page กระทบ conversion และความน่าเชื่อถือ
- Auth/security เป็นเงื่อนไขสำคัญก่อนขาย package
- Content QA เป็นเงื่อนไขความถูกต้องของสิ่งที่เด็กเรียนและคะแนนที่ครูใช้ ไม่ทดแทนด้วยการผ่าน build หรือ software tests

## 13. Files Likely To Change

Frontend:

- `src/components/LandingPage.jsx`
- `src/components/landing/LandingNavbar.jsx`
- `src/components/landing/LandingCTACards.jsx`
- `src/components/landing/LandingFeatureBadges.jsx`
- `src/components/TeacherLoginPage.jsx`
- `src/components/TeacherDashboard.jsx`
- `src/components/SuperAdminDashboard.jsx`
- `src/App.jsx`

Utilities:

- `src/utils/scoring.js`
- `src/utils/storage.js`
- `src/utils/schoolStorage.js`
- `src/utils/arenaStorage.js`

Config:

- `src/config/supabase.js`
- `.env`

New possible files:

- `src/utils/auth.js`
- `src/utils/subscription.js`
- `src/utils/featureFlags.js`
- `src/data/plans.js`
- `supabase/migrations/*`
- `supabase/policies/*`

## UI Icon System Update (2026-10-13)

- [x] ใช้ Lucide Outline Icons ใน navigation, quest cards, mode selector, รางวัล/Badge, ranking, report, teacher/admin controls และปุ่ม/สถานะของมินิเกม
- [x] เพิ่ม `src/components/UIIcon.jsx` เป็นตัวแสดงผลกลางสำหรับ metadata ไอคอนเดิม; SVG ใช้ currentColor, stroke 1.8 และขนาดตามข้อความ โดยไม่แก้ข้อมูลคะแนน/คลังข้อสอบ
- [x] แปลงข้อความแจ้งเตือน/รางวัลที่มีสัญลักษณ์ผ่าน UIIconText และคง label ของปุ่ม/เมนูไว้; decorative icons ซ่อนจาก screen reader
- [x] รักษาภาพข้อสอบ สัญลักษณ์บนการ์ดคำศัพท์ รูปตัวเลือก และสื่อการเรียนรู้ไว้ ไม่แปลงสิ่งเร้าของโจทย์เป็นไอคอน UI
- Verification: unit tests 87/87 และ production build ผ่าน; outline browser ตรวจ SVG/ขนาด/เมนู Badge และ layout 320/390/1366px; browser smoke ตรวจ landing/quest/teacher/exam และ new learner flow ผ่านในรอบ migration
- ขอบเขตไม่รวมข้อความเอกสารพิมพ์ HTML ที่สร้างเพื่อ export หรืออิโมจิที่เป็นเนื้อหา/สิ่งเร้า ไม่ถือว่าการเปลี่ยนไอคอนเป็น content approval เพิ่มเติม
- เครื่องมือ mechanical migration: `scripts/migrate-ui-icons.mjs` ใช้ JSX AST และไม่แก้ไฟล์ data; ไม่ใช้ DOM mutation หรือการซ่อนไอคอนด้วย CSS

## Pastel Quest Palette Update (2026-10-13)

- [x] เพิ่มคู่สี 6 ชุด: sky, rose, mint, lilac, peach และ lemon ผ่าน `src/utils/questPalette.js`; กำหนดตามหัวข้อคงที่ ไม่เปลี่ยนสีตามคะแนนหรือการเรียงรายการ
- [x] ใช้สีอ่อนกับพื้นไอคอน/การ์ด/ปุ่ม และสีเข้มคู่กันกับเส้นไอคอน/ข้อความ; icon slot 44x44px, radius 8px ไม่ทำให้ layout ขยับ
- [x] คงเขียวสำหรับผ่านเกณฑ์ เทาสำหรับล็อก และขอบทองสำหรับแนะนำ ไม่ใช้สีประจำหัวข้อแทนความหมายของสถานะ
- [x] เมนูผู้เรียนมีคู่สี 5 ชุดและ active state; ลดความจืดโดยไม่เพิ่มของตกแต่งหรือเปลี่ยนภาพโจทย์/คะแนน/การปลดล็อก
- Verification: unit tests 89/89, contrast ink/soft และ ink/surface ทุกคู่ >=4.5:1, production build ผ่าน; browser ตรวจ 6 topic tones, 5 nav tones, ขนาดไอคอนคงที่ และ layout 320/390/1366px

## Quest Map Readability Update (2026-10-13)

- [x] ซ่อน Review Checkpoint ของบทที่คำแนะนำหลักด้านบนกำลังชี้ให้ทบทวนอยู่ เพื่อไม่ให้ข้อมูล/ปุ่มซ้ำกัน; ยังแสดง checkpoint เมื่อเลือกบทอื่นที่มีข้อผิดค้าง
- [x] เพิ่มข้อความคำอธิบายด่านจาก 13 เป็น 14px และจำนวนรอบ/ดาวจาก 12 เป็น 13px พร้อม line-height ที่เหมาะสม โดยคงคู่สี คะแนน และ progression
- Verification: unit tests 89/89, production build และ `tests/review-map-browser.mjs` ผ่าน; ตรวจ CTA หลักเพียงจุดเดียว, checkpoint บทอื่น, การไปหน้าทบทวน และ screenshot 320/390/1366px
- ยังไม่ปรับภาพพื้นหลังหรือเพิ่มเอฟเฟกต์ฉลองครบทุกด่านในรอบนี้

## Soft Pastel Glass Update (2026-10-13)

- [x] การ์ดด่านที่ไม่ล็อกใช้พื้น pastel surface 88%, backdrop blur 10px และเงา/ขอบไฮไลต์ขาวบาง; คงขอบสีประจำหัวข้อและขอบทองของด่านแนะนำ
- [x] เมนูผู้เรียนใช้พื้นขาว 88% และ blur 12px; ปุ่ม ข้อความ ไอคอน และสถานะยังคมชัด ไม่ใช้ filter blur กับเนื้อหาหรือเปลี่ยนภาพโจทย์
- [x] fallback สีทึบเมื่อไม่รองรับ color-mix/backdrop-filter, โหมด prefers-reduced-transparency และ forced-colors; ด่านล็อกยังเป็นพื้นเทาทึบ
- Verification: unit tests 89/89, production build, outline browser 320/390/1366px พร้อมจำลองลดความโปร่งใส และ quiz-browser ผ่าน; ตรวจภาพหน้าจอเดสก์ท็อปแล้ว
- ขอบเขตเอฟเฟกต์เฉพาะ quest cards และ navigation ไม่ครอบคลุมหน้าโจทย์/ข้อสอบหรือเอกสารพิมพ์

## Completion Copy and Glass Polish (2026-10-13)

- [x] เมื่อผ่านครบทุกด่านแต่ยังมีข้อผิดค้าง แสดง "ผ่านครบทุกด่านแล้ว · เสริมความชำนาญต่อ"; รายละเอียดระบุบทและจำนวนข้อของบทนั้น ไม่เหมารวมว่าเป็นยอดทั้งระบบ
- [x] ผู้เรียนที่ยังผ่านไม่ครบใช้คำแนะนำทบทวนก่อนเดินทางต่อเหมือนเดิม ไม่มีการเปลี่ยนผลผ่าน คะแนน หรือเงื่อนไขความชำนาญ
- [x] เพิ่ม inset white highlight และเงานุ่มของการ์ดเล็กน้อย โดยคง opacity 88% และ blur เดิม
- Verification: review-map browser ตรวจทั้งผู้เรียนผ่านครบ/ยังไม่ครบ และ layout 320/390/1366px; production build ผ่าน

## Vocab Drill Expansion and Layout (2026-10-13)

- [x] เพิ่มกริยาพื้นฐาน 12 คำ และกิจวัตรประจำวัน 10 วลี เป็น learning decks ที่แต่งใหม่ พร้อมคำแปล ประโยคตัวอย่างอังกฤษ/ไทย และปุ่มเสียงอ่านคำ/ประโยค; ไม่เพิ่ม QUESTS หรือข้อสอบหลัก
- [x] คลังรวม 22 หมวด แยกคำศัพท์ใกล้ตัว/การสื่อสาร/ภาษาและไวยากรณ์ พร้อมค้นหาชื่อหมวดไทย/อังกฤษ และจำนวนรายการจริง
- [x] ตรวจทั้ง 20 หมวดเดิมว่าตรง missionId ที่ระบุ และตัด fallback ไป Mission แรก; ไม่มีข้อมูลให้พักหมวด ไม่ดึงชุดอื่นมาแทน
- [x] แก้ adapter ของหมวดอาหารที่ข้อมูลจับคู่เป็นไทยด้านซ้าย/อังกฤษพร้อมสัญลักษณ์ด้านขวา ให้เสียงอ่าน/คำอังกฤษ/ความหมายไทยอยู่ถูกช่อง โดยไม่เปลี่ยนข้อมูล Mission ต้นฉบับ
- [x] หน้าคลัง 4 คอลัมน์บน desktop, 3 บน tablet, 2 บน mobile; ใช้ pastel tokens เดียวกับ Quest Map และแก้ไอคอนรถ/อาชีพ/เสื้อผ้า/สิ่งแวดล้อม/ปริมาณที่เคยตกไปใช้ Sparkles
- [x] กล่องเลือกโหมดใช้ native dialog รองรับ Escape/คืน focus; โหมดเดิมครบ 6 แบบ และคง daily XP cap 50 พร้อม diminishing returns เดิม ไม่ให้ XP เพียงเปิดหมวด
- [x] รองรับหน้าการ์ดข้อความขนาดเหมาะสม ไม่ใช้ตัวอักษรขนาดอิโมจิกับวลียาว และไม่ทำซ้ำคำอังกฤษเป็นภาพในการจับคู่/ดวล/ใบ้คำ
- [x] เพิ่มภาพการกระทำจริงสำหรับ 22 รายการใหม่ พร้อม alt/version/provenance และตรวจโหลด/ความโปร่งใส/การแสดงผลทางเทคนิค; ยังรอเจ้าของตรวจรับความหมายรายภาพ
- [ ] ตรวจรับเนื้อหา learning decks ใหม่และปรับตัวอย่างจากการใช้งานจริง ก่อนนำไปดัดแปลงเป็นข้อประเมิน; ไม่อ้าง official Blueprint หรืออนุมัติชุดสอบเพิ่ม
- Verification: unit tests 91/91, production build, vocab-drill browser ผ่าน 22 หมวด/search/dialog/focus, เปิด 6 โหมดของทั้งสองหมวดใหม่, ตัวอย่างสองภาษา/ปุ่มเสียง และ layout 320/390/768/1366px; browser smoke หน้าแรก/quest/teacher/exam ผ่านโดยไม่เขียน cloud จริง

## Vocab Illustration Batch 1 and Practice History (2026-10-13)

- [x] ตรวจภาษา 22 รายการใหม่ (กริยา 12/กิจวัตร 10) พร้อมแยก wake up/get up, listen to, do homework และคำบุพบท/ตัวอย่างที่สัมพันธ์กัน; หลักฐาน `md/Vocab Learning Review.md`
- [x] เพิ่มภาพ raster จาก imagegen สำหรับ wake up/get up พร้อม alt/version/provenance และทดสอบ PNG โปร่งใสจริง ไม่ใช่อิโมจิ; แสดงใน Flashcard กิจวัตรและ fallback เป็นคำเมื่อภาพโหลดไม่ได้
- [x] สร้างภาพใหม่ครบ 22/22 รายการใน Action Verbs และ Daily Routine; ยังรอการตรวจรับความหมายภาพจากเจ้าของ และไม่ครอบคลุมภาพของ 20 หมวดเดิม
- [x] แสดงภาพใน Flashcard ทุกคำและฝั่งอังกฤษของ Memory Match; Audio Detective ซ่อนภาพก่อนตอบเพื่อไม่ให้คำตอบรั่ว
- [x] ลดความเด่นของพื้นหลังเฉพาะพื้นที่คลังด้วยพื้นสีอ่อน 91% โดยไม่เบลอข้อความหรือเปลี่ยนพื้นหลังทั้งระบบ
- [x] ประวัติในเครื่องแยกตาม learner id: จำนวนรอบที่จบ/วันที่ล่าสุด/โหมด ไม่ใช่ mastery หรือ XP; ผู้ไม่มีประวัติแสดงว่าไม่มีข้อมูล ไม่เหมาว่าไม่เคยฝึก
- [x] ป้องกันรับ completion callback ซ้ำต่อรอบ; ไม่บันทึกประวัติจากการเปิดหมวด และไม่เปลี่ยน daily XP cap หรือคะแนนด่าน
- Verification: unit tests 93/93, production build และ `vocab-images-browser` ผ่าน; ตรวจภาพ 22 ไฟล์ไม่ซ้ำ โปร่งใส ไม่ว่าง มี alt และ layout 320/390/1366px; หลักฐาน prompts `md/Routine Image Generation.json` กับ `md/Vocab Illustration Generation Batch 2.json`, assets `public/learning/verbs/` และ `public/learning/routines/`
- New learner regression ผ่านหลังปรับ selector ปุ่ม login ในเทสต์จากลูกศรข้อความเก่าเป็น accessible name ปัจจุบัน; ผู้เรียนยังผ่านบท 1/ทบทวน/เข้าบท 2 ได้และ refresh รักษาผล โดยไม่เขียน cloud จริง

## Vocab Illustration Batch 3 (2026-10-14)

- [x] สร้างและเชื่อมภาพ Transport 12 กับ Places 8 รวม 20 ภาพ โดยใช้ built-in imagegen; เก็บไฟล์ใน `public/learning/transport/` และ `public/learning/places/`
- [x] เพิ่มภาพผ่าน registry แบบไม่แก้ข้อมูล Mission ต้นฉบับ พร้อม alt/version/provenance และสถานะ `technical_check_only`; หลักฐาน prompt อยู่ที่ `md/Vocab Illustration Generation Batch 3.json`
- [x] ตรวจเชิงภาพว่าแต่ละรายการจำแนกได้ กรอบภาพครบ ไม่มี caption/logo และคง fallback เป็นคำเดิมเมื่อภาพโหลดไม่ได้
- [ ] รอเจ้าของตรวจรับความเหมาะสมรายภาพ; ห้ามตีความสถานะเชิงเทคนิคเป็นการอนุมัติสื่อข้อสอบ
- [ ] หมวดเดิมที่เหลือ 18 หมวด รวม 148 การ์ด ยังต้องจัดทำ/ตรวจภาพเป็นชุดถัดไป โดยใช้สื่อกำหนดแน่นอนสำหรับป้าย ทิศทาง ธง ตัวเลข รูปทรง และไวยากรณ์
- Verification: unit tests 94/94, production build และ `vocab-images-browser` ผ่าน; ภาพ Vocab Drill รวม 42 ไฟล์ไม่ซ้ำ โปร่งใส ไม่ว่าง มี alt และไม่ล้นที่ 320/390/1366px

## Vocab Audio Sanitization and Pronunciation Accuracy (2026-10-14)

- [x] ตรวจความถูกต้องของเสียงอ่าน (TTS) และคำศัพท์ใน 22 หมวด Vocab Drill: พบว่าบางการ์ดมีสัญลักษณ์อิโมจิ, ธงชาติ, ZWJ, ลูกศร (`→`) และคำแปล (`= อะไร`) ติดอยู่ในข้อความออกเสียง
- [x] เพิ่ม `cleanSpeechText` ใน `src/utils/useSpeech.js` เพื่อทำความสะอาดข้อความก่อนส่งเข้า Web Speech API: ลบอิโมจิ, ธงชาติ, variation selectors, แทนที่ลูกศรด้วยจุลภาคเพื่อให้ออกเสียงเว้นวรรคอย่างเป็นธรรมชาติ และตัดส่วนคำแปลไทยออก
- [x] ปรับ `FlashcardGame.jsx` และ `AudioDetectiveGame.jsx` ให้เลือกข้อความออกเสียงเป็นภาษาอังกฤษเป้าหมายเสมอ โดยเฉพาะหมวด Jobs, Tenses, Pronouns, Subjects และ Quantifiers ไม่ดึงคำอธิบายภาษาไทยใน `frontLabel` มาออกเสียง
- [x] เพิ่ม Unit Test ตรวจสอบ `cleanSpeechText` ครอบคลุมการ์ดทุกใบใน 22 หมวด ไม่ให้อิโมจิหรือธงชาติรั่วเข้าเสียงอ่าน
- Verification: unit tests 95/95, production build ผ่าน, `vocab-drill-browser`, `vocab-images-browser` และ `browser-smoke` ผ่านครบถ้วน

## Question Bank, Media & Blueprint Audit (2026-10-14)

- [x] ตรวจสื่อ SET7 (30 ข้อ): 15 ข้อใน 7.1 รูปภาพมี SVG แล้วแต่รอครูตรวจรับเชิงเนื้อหา (`present_unverified`), 10 ข้อใน 7.3/7.4 ซ่อมข้อมูลตาราง/กราฟแล้วใน Batch 2 (`pending_teacher`), 5 ข้อใน 7.5 เป็นบทอ่านไม่ต้องใช้สื่อ
- [x] ตรวจ 11 รายการ Placeholder ในคลังข้อสอบ: พบว่ามีคำใบ้สัญลักษณ์ในเนื้อโจทย์ (เช่น `(Recycle symbol)`, `(Shopping cart)`, `(Sun)`) ซึ่งต้องแทนที่ด้วย visual stimulus จริง
- [x] ตรวจเฉลยและคลังข้อสอบ 1,157 ข้อ ใน 40 banks: เฉลยถูกต้องตามช่วง (0 out-of-bounds), พบข้อความซ้ำ 297 รูปแบบจากการคัดลอกลง Pre-test/Final Boss
- [x] ตรวจตัวชี้วัดและมาตรฐาน O-NET ป.6: ปัจจุบัน 1,157 ข้อยังไม่มีแท็กมาตรฐาน; วิเคราะห์การกระจายตัวพบ ต 1.1 (739 ข้อ), ต 1.2 (146 ข้อ), ต 1.3 (144 ข้อ), ต 2.2 (75 ข้อ), ต 4.1 (53 ข้อ) และ **ต 2.1 วัฒนธรรม/เทศกาลยังขาดใน QUESTS (0 ข้อ)**
- [x] ออกแบบสถาปัตยกรรม Test Blueprint Sampler: ขนาด 32 ข้อ 60 นาที ข้อละ 3.125 คะแนน ตามโควตา 6/10/6/2/4/4 พร้อมเงื่อนไขกรองเฉพาะ approved items, deduplication, และ shuffle options โดยไม่ mutate คลัง; วางเงื่อนไขต้องเติมข้อสอบ ต 2.1 ก่อนเปิดสุ่มตาม Blueprint
- [x] บันทึกรายงานการตรวจสอบละเอียดไว้ใน `md/Question Bank and Blueprint Audit.md`

## Blueprint Release Guard and Culture Review (2026-10-14)

- [x] ยกเลิกการอนุมัติอัตโนมัติของ Culture & Festivals 12 ข้อที่สร้างโดย agent; ทุกข้อเป็น `pending_teacher`, ไม่มี `approvedModes` และไม่เข้าสู่ Quiz, Final Exam หรือ Blueprint
- [x] เพิ่มเวอร์ชันและหลักฐานสถานะรอตรวจให้ข้อ Culture พร้อมหน้าตรวจรับที่ `/scratch/media-review.html?batch=culture`; หน้านี้ไม่บันทึกคะแนน XP หรือสถานะอนุมัติ
- [x] เปลี่ยน Blueprint eligibility เป็น fail-closed: ต้องมี `standard`, `indicator`, `difficulty`, การอนุมัติ `onet_blueprint_32` และ `contentReview.approved_for_blueprint` จากผู้ตรวจที่ระบุ
- [x] ตัด fallback ที่เคยเหมาข้อไม่ทราบมาตรฐานเป็น `ต 1.1`; หากคลังที่ตรวจรับไม่พอตาม quota ตัวสุ่มต้อง throw พร้อมจำนวนที่ขาด
- [x] คงการทดสอบ sampler ด้วย fixture ที่มีหลักฐานอนุมัติชัดเจน แยกจากคลัง production เพื่อไม่สร้างสถานะอนุมัติปลอม
- [x] เจ้าของงานตรวจรับ Culture 12 ข้อจากหน้า review; ผูก approval กับ `culture-draft-v1` และ `explicit_user_chat_after_culture_review` โดยเดิมอนุญาตเฉพาะ `onet_blueprint_32`
- [x] อนุมัติเพิ่ม `practice_assessment` สำหรับ Festivals & Culture Quiz บท 5 ภายหลัง; ข้อชุดนี้ยังไม่อนุญาตใน School Final และใช้คะแนนคำตอบครั้งแรก
- [ ] ติดแท็กและตรวจรับข้อจากมาตรฐานอื่นรายข้อให้ครบ quota ก่อนเชื่อม sampler เข้าหน้าจำลองสอบ
- Verification: unit tests 102/102, production build และ `culture-review-browser` ผ่าน; ตรวจ Culture 12 ข้อและ layout 320/390/1366px โดยไม่มี runtime error หรือ release claim

## Vocab Drill Culture & Festivals (2026-10-14)

- [x] เพิ่มหมวด `เทศกาลและวัฒนธรรม (Festivals & Culture)` เป็นหมวดที่ 23 ใน Vocab Drill และกลุ่มวัฒนธรรมแยกต่างหาก
- [x] เพิ่ม learning cards 31 รายการ ครอบคลุม Halloween, Christmas, Valentine's Day, Songkran, Loy Krathong, Mother's Day และ New Year ทั้งวันสำคัญ กิจกรรม สัญลักษณ์ และวลีที่เกี่ยวข้อง
- [x] ทุกการ์ดมีคำแปลและประโยคตัวอย่างอังกฤษ/ไทย รองรับเสียงอ่าน และติด `ต 2.1` แบบ learning-only; การ์ด Vocab ไม่เพิ่ม QUESTS หรือเปลี่ยน quota Blueprint 2 ข้อ (Quest วัฒนธรรมเพิ่มแยกภายหลัง)
- [x] คง `assessmentEligible: false` เพื่อไม่ให้คำศัพท์ฝึกถูกนำไปเป็นข้อสอบโดยอัตโนมัติ
- [ ] เพิ่มและตรวจรับภาพประกอบรายคำใน batch สื่อถัดไป; ปัจจุบันใช้ข้อความชัดเจนและไม่ใช้อิโมจิแทนภาพคำศัพท์
- Verification: unit tests 103/103, production build และ `vocab-drill-browser` ผ่าน 23 หมวด พร้อม Culture flashcard และ layout 320/390/768/1366px

## Chapter 2 and 5 Challenges (2026-10-14)

- [x] แต่งข้อท้าทายท้ายบท 2 และ 5 อย่างละ 10 ข้อจากจุดประสงค์ด่านเดิม พร้อมคำอธิบายเฉลย ระดับความยากชั่วคราว และตารางประกอบบางข้อ
- [x] เปิดหน้าตรวจร่างแยก: `/scratch/challenge-review.html?chapter=2` และ `?chapter=5`; ไม่มีคะแนนหรือ XP
- [x] เจ้าของงานตรวจและอนุมัติหน้าร่างทั้งสองในแชต; เก็บร่าง `boss-review-v1` แยกจากสำเนาที่อนุมัติใช้เฉพาะ `practice_assessment` (ไม่เข้า School Final หรือ Blueprint)
- [x] เพิ่ม Social Challenge และ Knowledge Challenge ใน Quest Map; บอสปลดล็อกเมื่อผ่านด่านหลักของบท และบอสบท 2 เป็นเงื่อนไขก่อนเข้าบท 3 สำหรับผู้เรียนใหม่
- [x] ทดสอบผู้เรียนเดิมที่เริ่มบท 3 แล้วไม่สูญเสียสิทธิ์; เล่นบอสในเบราว์เซอร์แล้วตรวจว่าคะแนนนับคำตอบครั้งแรกและบันทึกผลได้
- [x] ตรวจ unit tests 106/106, production build และ browser review ที่ 320/390/1366px
- [ ] ระดับความยากยังเป็นแท็กชั่วคราว; เก็บผลการเล่นจริงเพื่อปรับความยากและตรวจ accessibility ของตารางเพิ่มเติม

## 14. Definition of Done

ระบบถือว่าพร้อมเริ่มขายแบบ MVP เมื่อ:

- ครู/admin login ด้วยระบบ auth จริง
- ไม่มี password hardcoded ใน frontend
- โรงเรียนมี subscription และ package จริง
- จำกัด quota นักเรียนได้
- ครูเห็นเฉพาะข้อมูลโรงเรียนตัวเอง
- Super Admin จัดการโรงเรียน/package/payment ได้
- Landing page ชัดเจนและ mobile-friendly
- Build ผ่านและไม่มี runtime crash จาก scoring/ranking
- มี RLS ป้องกันข้อมูลข้ามโรงเรียน
- ไม่มี mandatory assessment ว่างหรือ progression ที่กีดขวางผู้เรียนใหม่
- ข้อสอบที่ปล่อยใช้ผ่าน content review พร้อม source/version และแสดงภาพ/บทอ่านครบ
- สื่อจำเป็นของข้อประเมินผ่าน media review; ไม่มีข้ออ้างภาพ/กราฟ/ตารางที่ตอบไม่ได้เพราะสื่อหาย หรือใช้คำบรรยายที่เปิดเผยคำตอบแทนสื่อ
- โหมดที่อ้างตรง Blueprint ใช้จำนวน เวลา คะแนน และ quota ที่ตรวจสอบได้ตามปีที่ระบุ
- รายงานทักษะ/Pre-test/Growth ใช้ตัวหารและ profile ที่ถูกต้อง พร้อมระบุ unknown coverage

