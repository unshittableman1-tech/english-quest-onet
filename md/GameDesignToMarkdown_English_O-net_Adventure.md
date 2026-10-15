# 🎮 Game Design to Markdown - Master Prompt
> **[INSTRUCTION FOR AI]**
> You are an Expert Game Architect. Below is a complete Game Design Document extracted from the creator's answers. Use this as absolute context for all code, lore, and design generation.

## 1. วิสัยทัศน์ & เป้าหมาย
- **Working Title (ชื่อโปรเจกต์):** English O-net Adventure
- **Elevator Pitch (อธิบายเกมสั้นๆ):** เกมส์การเรียนรู้ การศึกษา ทดสอบวัดระดับความสามารถทางการศึกษาระดับชาติ วิชาภาษอังกฤษ ชั้น ป.6
- **Target Audience (กลุ่มเป้าหมาย):** เด็กและครอบครัว (Family/Kids), ผู้ใหญ่ (Mature/18+), เฉพาะกลุ่ม (Niche/Cult)
- **Unique Selling Point (จุดขายหลัก):** จุดขาย	สิ่งที่เด็กได้	สิ่งที่ครู/โรงเรียนได้
🗺️ 1. O-NET ในรูปแบบ Adventure	รู้สึกเหมือนเล่นเกม ไม่ใช่ทำข้อสอบ	เด็กมีแรงจูงใจในการฝึก
⚔️ 2. Gamification จริงจัง	XP, Level, Badge, Rank, Mission	กระตุ้นให้เด็กฝึกต่อเนื่อง
🧠 3. ฝึกตามจุดอ่อน ไม่ใช่ทำข้อสอบมั่ว ๆ	รู้ว่าตัวเองอ่อนเรื่องอะไร	ครูเห็นจุดที่ต้องซ่อมเสริม
📈 4. Progress ของนักเรียนแบบเห็นภาพ	เห็นพัฒนาการตัวเอง	ครูติดตามรายคน/รายห้องได้
🏆 5. แข่งขันได้ แต่ไม่กดดัน	Rank / Team / Match / Achievement	ใช้สร้างกิจกรรมในห้องเรียนได้
👨‍🏫 6. Teacher Dashboard	—	ครูควบคุมกิจกรรมและติดตามเด็ก
🏫 7. ใช้ได้ทั้งห้องเรียนและที่บ้าน	มือถือ/PC/Tablet	ไม่จำกัดเฉพาะเวลาเรียน
🎯 8. ออกแบบเพื่อ O-NET โดยเฉพาะ	ฝึกตรงเป้าหมายการสอบ	โรงเรียนใช้เป็นเครื่องมือยกระดับผลสัมฤทธิ์
- **Core Memory / X-Factor (จุดเด่นที่น่าจดจำ):** ถ้าต้องสรุป X-Factor เป็นประโยคเดียว
“จากเด็กที่ไม่อยากทำข้อสอบ → กลายเป็นเด็กที่อยากกลับมาเล่นเพื่อเก่งขึ้น”
- **Direct Competitors (คู่แข่งในตลาด):** สำหรับ O-NET Adventure ผมจะแบ่งคู่แข่งออกเป็น 2 ระดับ เพราะคู่แข่งที่แท้จริงไม่ได้มีแค่เว็บ O-NET โดยตรง  คู่แข่ง	จุดแข็ง	ช่องว่างที่ O-NET Adventure เข้าไปได้ ระบบข้อสอบ O-NET ออนไลน์ทั่วไป	มีข้อสอบจำนวนมาก ใช้งานตรงไปตรงมา	มักเน้น “ทำข้อสอบ” มากกว่า “สร้างแรงจูงใจ” ติวเตอร์ / สถาบันกวดวิชา	มีครูและการอธิบายแบบเข้มข้น	ต้นทุนสูง และไม่สามารถติดตามเด็กได้ตลอดเวลา แพลตฟอร์ม Quiz / Game-based Learning เช่น Kahoot!, Quizizz	สนุก แข่งขันง่าย	ไม่ได้ออกแบบเฉพาะ Journey ของ O-NET แพลตฟอร์ม EdTech รายใหญ่	Content และฐานผู้ใช้แข็งแรง	ประสบการณ์อาจกว้างเกินไป ไม่ได้โฟกัส “พิชิต O-NET” ข้อสอบ/หนังสือ O-NET แบบดั้งเดิม	ราคาถูก คุ้นเคย	ไม่มี XP, Level, Mission, Dashboard และ Feedback แบบทันที 🥊 คู่แข่งที่ต้องระวังที่สุด  ผมมองว่า ไม่ใช่เว็บข้อสอบ O-NET แต่คือ  “วิธีเดิมที่โรงเรียนใช้ติว O-NET”  เช่น ครูแจกข้อสอบ → เด็กทำ → ครูเฉลย → จบ  เพราะนี่คือพฤติกรรมที่ O-NET Adventure ต้องเข้ามาเปลี่ยน  ⚔️ Competitive Positioning  จุดที่เราควรยืนคือ:  คู่แข่งส่วนใหญ่  Content → Question → Score  แต่ O-NET Adventure  Mission → Play → XP → Progress → Achievement → Mastery  ดังนั้นคำพูดที่ผมอยากให้ใช้ใน Pitch คือ:  “เราไม่ได้แข่งขันกับเว็บข้อสอบ แต่เรากำลังเปลี่ยนวิธีที่เด็กเตรียมตัวสอบ O-NET”  และนี่เชื่อมกับ X-Factor ของเราโดยตรง:  🎮 Make O-NET Practice Feel Like a Game. เปลี่ยนการติว O-NET ให้เป็นเกมที่เด็กอยากเล่น
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** O-NET Adventure ไม่ได้ถูกออกแบบมาให้เป็นเพียงระบบทำข้อสอบออนไลน์ แต่เป็น Learning Experience ที่นำแนวคิดของเกมมาผสมกับการเตรียมความพร้อมสำหรับการสอบ O-NET โดยเปลี่ยน “การทำข้อสอบ” ให้กลายเป็น Mission และเปลี่ยน “คะแนน” ให้กลายเป็นความก้าวหน้าที่เด็กมองเห็นและรู้สึกภูมิใจ

หัวใจสำคัญคือการสร้างแรงจูงใจให้ผู้เรียนอยากกลับมาเรียนด้วยตนเอง ผ่านระบบ XP, Level, Badge, Rank, Achievement และ Challenge ขณะเดียวกันครูยังสามารถติดตามผล วิเคราะห์จุดอ่อน และนำข้อมูลไปวางแผนการสอนหรือซ่อมเสริมได้

ในอนาคต O-NET Adventure สามารถพัฒนาไปสู่ Educational Game Platform ที่รองรับหลายวิชา หลายระดับชั้น และเชื่อมโยงข้อมูลการเรียนรู้ของนักเรียนอย่างต่อเนื่อง โดยมีเป้าหมายสำคัญคือ

“เปลี่ยนเด็กที่ไม่อยากทำข้อสอบ ให้กลายเป็นเด็กที่อยากกลับมาเล่นเพื่อพัฒนาตัวเอง”

นี่คือความแตกต่างที่ O-NET Adventure ต้องการสร้างให้เกิดขึ้นในห้องเรียนไทย


## 2. ระบบเกมเพลย์
- **Main Genre (แนวเกมหลัก):** Not specified
- **Play Mode (โหมดการเล่น):** Single Player (Story-driven), Multiplayer (Local/Couch Co-op), Party Game / Minigames, Multiplayer (PvP Arena/Match), ให้ AI แนะนำ (Let AI Decide)
- **Difficulty Level (ระดับความยาก):** ปรับระดับได้อิสระ (Easy/Normal/Hard), Adaptive (ความยากปรับตามฝีมือผู้เล่น)
- **Skill vs Luck (ทักษะ vs ดวง):** ทักษะเพียวๆ (Pure Skill/Reflexes), ทักษะการวางแผน (Strategy/Tactics/Puzzle Logic)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 3. Art Direction & Game Bible
- **Art Style & Render Quality (สไตล์งานภาพและคุณภาพ):** 3D Stylized (Zelda/Genshin)
- **Mood & Lighting (อารมณ์และทิศทางแสง):** อบอุ่นผ่อนคลาย (Cozy / Soft Lighting), อลังการ (Epic / Golden Hour)
- **Camera & Composition (มุมกล้องและการจัดองค์ประกอบ):** High Angle / Bird-eye view (มุมกด เห็นความกว้างของฉาก), Rule of Thirds (จัดวางสมดุล ดูเป็นธรรมชาติ)
- **Color Palette & Lore Rules (โทนสีและกฎจักรวาล):** พาสเทล/น่ารัก (Pastel & Soft Colors)
- **Game Specifics & UI (องค์ประกอบบนหน้าจอ):** ให้ AI แนะนำ (Let AI Decide)
- **Negative Prompts (ข้อห้าม / สิ่งที่ไม่ต้องการให้มี):** ห้ามมีความรุนแรง/เลือด (Family friendly, no gore)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 4. โลกและการสำรวจ
- **World Structure (โครงสร้างโลก):** แยกเป็นโซนชัดเจน (Hub-based / Semi-open)
- **Exploration Focus (เน้นการสำรวจแค่ไหน):** เน้นหาของสะสมและความลับ (Collectibles/Secrets)
- **Fast Travel (การเดินทางข้ามแผนที่):** เปิดแผนที่แล้ววาร์ปได้ทันทีจากทุกที่, ให้ AI แนะนำ (Let AI Decide)
- **Dynamic Environment (สภาพแวดล้อมยืดหยุ่น):** มีระบบ สภาพอากาศและฤดูกาลส่งผลต่อเกมเพลย์
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 5. เนื้อเรื่อง & ธีมเกม
- **World Theme (ธีมของโลก):** High Fantasy (เวทมนตร์/มังกร/อัศวิน), Sci-Fi / Space Exploration (อวกาศ), Modern / Realistic (โลกยุคปัจจุบัน)
- **Story Importance (ความสำคัญของเนื้อเรื่อง):** เนื้อเรื่องแตกแขนง เลือกตอบได้ (Branching), เนื้อเรื่องสไตล์สืบสวน (Mystery/Detective), ให้ AI แนะนำ (Let AI Decide)
- **Ending Type (รูปแบบฉากจบ):** ให้ AI แนะนำ (Let AI Decide)
- **Tone & Atmosphere (โทนและบรรยากาศ):** สดใส/น่ารัก/ผ่อนคลาย (Cozy/Wholesome), ตลก/กาว/หลุดโลก (Comedy/Parody/Meme), ตื่นเต้น/ผจญภัยมหากาพย์ (Epic Adventure)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 6. การสร้างตัวละคร
- **Character Creation (การสร้างตัวละคร):** ปรับแต่งหน้าตา/ทรงผมได้พื้นฐาน, อัปโหลดภาพ/อวาตาร์ 3D V-Tuber เข้าไปเล่นได้
- **Character Age (อายุ/ช่วงวัย):** เด็กเล็ก/ประถม (Child), วัยรุ่น/มัธยม (Teen/Highschool), วัยกลางคน/คนแก่ (Elderly), หลากหลายช่วงวัย (ตัวละครแก่ลงตามเวลาได้)
- **Background/Origin (ภูมิหลังตัวละคร):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 7. ระบบความสามารถ
- **Class System (ระบบสายอาชีพ):** ไม่มีอาชีพ (ใช้อาวุธอะไรก็ได้)
- **Skill Tree Structure (โครงสร้างสกิลทรี):** ไม่มีสกิลทรี (สกิลได้ตามเลเวลแบบตายตัว)
- **Abilities Type (ประเภทสกิล):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 8. ระบบต่อสู้ & แอคชัน
- **Combat Pace (จังหวะการต่อสู้):** Turn-based Tactical (เดินบนตาราง Grid), Real-time with Pause (หยุดเวลาวางแผนได้), Card-based Combat (ใช้การ์ดต่อสู้), ให้ AI แนะนำ (Let AI Decide)
- **Combat Depth (ความลึกของการต่อสู้):** One-button Combat (โจมตีปุ่มเดียวง่ายๆ), การทำลายชิ้นส่วนบอส (Part Breaking), ให้ AI แนะนำ (Let AI Decide)
- **Elemental System (ระบบธาตุ):** ให้ AI แนะนำ (Let AI Decide), ไม่มีระบบธาตุ (Physical ล้วน)
- **Controller Support (การรองรับคอนโทรลเลอร์):** Keyboard & Mouse เท่านั้น, Touch Screen เท่านั้น, รองรับ Gamepad (Controller) จอยสติ๊ก, รองรับทุกรูปแบบ (Full Cross-input Support), Voice Command (สั่งการด้วยเสียง)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 9. ศัตรู & บอส
- **Enemy Diversity (ความหลากหลายของศัตรู):** มอนสเตอร์แฟนตาซี/สัตว์ป่าหลากหลาย, ให้ AI แนะนำ (Let AI Decide)
- **Enemy AI (พฤติกรรมของศัตรู):** มี Pattern ตายตัวที่ให้ผู้เล่นจับทางได้, AI ฉลาดขั้นสุด (เรียนรู้พฤติกรรมผู้เล่นและดักทางได้), ให้ AI แนะนำ (Let AI Decide)
- **Boss Fights (ลักษณะการสู้บอส):** บอสมีหลายร่าง/หลายเฟส (Multi-phase), บอสปริศนา (Puzzle Boss ต้องใช้กลไกฉากฆ่า)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 10. โหมดการเล่น
- **Level Design (การสร้างด่าน):** ให้ AI แนะนำ (Let AI Decide)
- **Dungeon Types (ประเภทดันเจี้ยน):** ให้ AI แนะนำ (Let AI Decide)
- **Puzzles in Levels (ปริศนาในด่าน):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 11. ระบบสัตว์เลี้ยง & พาหนะ
- **Pets System (ระบบสัตว์เลี้ยง):** สัตว์เลี้ยงประดับ (Cosmetic เดินตามเฉยๆ), ช่วยเก็บของ/ให้บัฟสเตตัส
- **Pet Breeding (การเพาะพันธุ์):** ให้ AI แนะนำ (Let AI Decide)
- **Mounts & Vehicles (สัตว์ขี่ หรือ พาหนะ):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 12. ความก้าวหน้า & รางวัล
- **Character Progression (การพัฒนาตัวละคร):** รวบรวมคอลเลกชัน/Achievement (Pokedex), อัปเลเวลเพื่อเพิ่มสเตตัสพื้นฐาน
- **Max Level (ระบบเลเวลตัน):** เพิ่ม Max Level ขึ้นเรื่อยๆ ตามแพทช์, ให้ AI แนะนำ (Let AI Decide)
- **Economy (ระบบค่าเงิน):** ให้ AI แนะนำ (Let AI Decide)
- **Player Trading (การซื้อขายระหว่างผู้เล่น):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 13. ระบบเศรษฐกิจ & คราฟต์ไอเทม
- **Crafting Depth (ความลึกของการคราฟต์):** ให้ AI แนะนำ (Let AI Decide), ไม่มีระบบคราฟต์
- **Gathering (การหาวัตถุดิบ):** ให้ AI แนะนำ (Let AI Decide)
- **Inventory System (ระบบช่องเก็บของ):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 14. ระบบเสียงและดนตรี
- **Music Style (แนวเพลง):** ออเคสตร้า / Epic Cinematic
- **Voice Acting (ระบบเสียงพากย์):** ให้ AI แนะนำ (Let AI Decide)
- **Sound Design Focus (จุดเน้นด้านเสียง):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 15. ระบบสังคม & ผู้เล่นหลายคน
- **Social Grouping (ระบบกลุ่ม):** ระบบ Party / Co-op ขนาดเล็ก (2-4 คน), ระบบศิษย์-อาจารย์ (Mentor), ให้ AI แนะนำ (Let AI Decide)
- **Communication (ช่องทางการสื่อสาร):** ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 16. โหมดแข่งขัน & จัดอันดับ
- **Leaderboards (ตารางอันดับ):** Leaderboard โชว์คะแนนขำๆ (High Score), จัดอันดับการฟาร์ม/กิจกรรม (เช่น ตกปลาใหญ่สุด), Hall of Fame (บันทึกชื่อคนเคลียร์เกมคนแรก)
- **Ranked Mode (โหมดจัดอันดับจริงจัง):** แบ่ง Tier (Bronze, Silver, Gold, Challenger), จัดอันดับด้วยตัวเลข MMR/ELO ซ่อนอยู่
- **Guild Wars & Tournaments (สงครามกิลด์ & ทัวร์นาเมนต์):** ไม่มี
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 17. กิจกรรมเสริม & มินิเกม
- **Side Activities (กิจกรรมเสริม):** ไม่มีกิจกรรมเสริม เน้นต่อสู้/เดินเรื่องอย่างเดียว
- **Minigames (มินิเกมในเกม):** ไม่มี
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 18. เทคโนโลยี & เอนจิน
- **Target Platforms (แพลตฟอร์มเป้าหมาย):** PC (Steam/Epic), Web Browser (HTML5/WebGL), Mobile (iOS/Android), VR / AR Headsets, Cross-Platform (ลงทุกเครื่อง)
- **Game Engine (เอนจินที่จะใช้):** RPG Maker, Roblox Studio / UEFN, GameMaker Studio, Unity, Custom Engine (เขียนเอนจินเอง), ให้ AI แนะนำ (Let AI Decide)
- **Network Architecture (โครงสร้าง Network):** Offline แต่ต่อเน็ตเช็คเซฟ, Dedicated Server (เซิร์ฟเวอร์กลาง), Cloud Gaming (สตรีมมิ่ง)
- **Cross-play (เล่นข้ามเครื่อง):** Cross-play ครบทุกเครื่อง, Cross-save ถ่ายโอนเซฟได้
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 19. โมเดลธุรกิจ & การทำเงิน
- **Business Model (รูปแบบธุรกิจ):** Freemium (ฟรีบทแรก ซื้อบทต่อไป), Subscription (จ่ายรายเดือน), ให้ AI แนะนำ (Let AI Decide)
- **Battle Pass / VIP:** มี Battle Pass (สายฟรี + พรีเมียม)
- **Advertisement (การใส่โฆษณา):** ไม่มีโฆษณาเลย
- **LiveOps (แผนอัปเดตระยะยาว):** อัปเดตแก้บั๊กฟรี, อัปเดตเป็น Season ตลอดไป, กิจกรรม Event หมุนเวียนทุกสัปดาห์
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## 20. ขอบเขต งบประมาณ & ทีมงาน
- **Team Size (ขนาดทีมพัฒนา):** ทำคนเดียว (Solo Dev 100%)
- **Estimated Budget (งบประมาณ):** ทุนส่วนตัวนิดหน่อย (10k-50k บาท)
- **Expected Timeline (เวลาผลิต):** โปรเจกต์สั้นๆ (1-3 เดือน), งาน Game Jam (ไม่เกิน 2 สัปดาห์)
- **Testing Plan (แผนการปล่อย):** ปล่อยตัว Demo เล่นฟรีก่อน, มี Closed Alpha/Beta จำกัดคน, ให้ AI แนะนำ (Let AI Decide)
- **📝 อธิบายเพิ่มเติม / ไอเดียของคุณ (Optional):** Not specified

## Heuristic Analysis (Rule-based Estimate)
- **Estimated Dev Time:** ~7 เดือน - 10 เดือน
- **Estimated Budget:** ~฿31,440 - ฿51,090
- **Risk Level:** MEDIUM RISK

---
*Generated by Game Design to Markdown — Ready to paste into Claude, Codex, or Antigravity*
