# Question Bank and Blueprint Audit Report

Date: 2026-10-14  
Scope: 1,157 questions across 40 banks (QUESTS, Pre-test, Arena, Final Boss).  
Status: Content & Media Audit completed. Sampler specifications designed.

---

## 1. Executive Summary

| Category | Finding | Action / Status |
|---|---|---|
| **Total Items Analyzed** | 1,157 questions across 40 banks | 0 out-of-bounds keys, 0 missing options |
| **Media Status (SET7)** | 30 questions: 15 `present_unverified` SVGs, 10 `pending_teacher` (Batch 2 charts/tables), 5 `not_required` | Preview at `/scratch/media-review.html`; awaiting teacher review |
| **Media Status (Placeholders)** | 11 items contain textual placeholder hints (e.g. `(Recycle symbol)`, `(Shopping cart)`) | Documented below; requires real stimulus replacement |
| **Standard Tagging** | 0 / 1,157 items have explicit `standard` or `indicator` tags | Content mapping established for 6 O-NET standards |
| **Culture Gap (ต 2.1)** | 0 items in `QUESTS` test festivals/culture; 3 items found in `RealOnetSimulator` & `ch3_missions` | Need to import/author ต 2.1 items before running official Blueprint sampler |
| **Difficulty Tagging** | 1,127 / 1,157 items have `difficulty: none` | Framework proposed: Foundation, Application, Transfer |
| **Blueprint Sampler** | Official spec: 32 items, 60 minutes, 3.125 pts/item (Quota: 6, 10, 6, 2, 4, 4) | Architecture defined for implementation after bank tagging |

---

## 2. SET7 Media & Placeholder Audit

### SET7 (30 Items)
- **7.1 Pictures (`pdf_set7_0` – `pdf_set7_14`, 15 items):**
  - Stored in `public/images/` as vector SVGs (`rain_school.svg`, `breakfast.svg`, `clean_classroom.svg`, `no_smoking.svg`, `teaching.svg`, `library.svg`, `cross_road.svg`, `clean_school.svg`, `noisy_class.svg`, `flowchart.svg`, `town_map.svg`, `school_map.svg`, `house_map.svg`, `no_signal.svg`).
  - Currently marked `present_unverified` because they need teacher visual fidelity sign-off against source PDF.
- **7.3 & 7.4 Charts and Tables (`pdf_set7_15` – `pdf_set7_24`, 10 items):**
  - Repaired in Batch 2 with verified structured data (`scoreTable`, `set7-color-sales`, `set7-sales-trend`, `set7-daily-timeline`, `set7-english-scores`, `set7-population`).
  - Tested at 320/390/768/1366px; awaiting owner/teacher sign-off.
- **7.5 Passages (`pdf_set7_25` – `pdf_set7_29`, 5 items):**
  - Plain text reading questions; no external media required.

### 11 Placeholder Items
These items currently embed textual descriptions of symbols directly into their question stems rather than rendering a visual stimulus:
1. `quest:school | pdf_1.4_สิ่งแวดล้อม_1`: You see this sign: (Recycle symbol). What should you do?
2. `quest:school | pdf_1.4_สิ่งแวดล้อม_6`: What does this symbol mean? (Recycle symbol)
3. `quest:school | pdf_1.6_เครื่องดื่ม_7`: Which drink is usually served in a box? (Juice box symbol)
4. `quest:school | pdf_1.6_เครื่องดื่ม_10`: What does this symbol mean? (Hot drink)
5. `quest:school | pdf_1.7_เวลาว่างและนันทนาการ_6`: What activity uses this symbol (Game controller)?
6. `quest:school | pdf_1.9_การซื้อ-ขาย_6`: What does this symbol mean? (Shopping cart)
7. `quest:school | pdf_1.10_ลมฟ้าอากาศ_6`: What does this symbol mean? (Sun)
8. `quest:school | pdf_1.10_ลมฟ้าอากาศ_8`: What does this symbol mean? (Rainy cloud)
9. `quest:food | f_pdf_10`: What is a symbol for eating at a place? (ป้าย 🍽️)
10. `quest:illness | i_pdf_06`: What does this symbol mean? (สัญลักษณ์เตียง/ตึกที่มีกากบาทแดง)
11. `quest:illness | i_pdf_10`: This symbol means: 💉

**Recommendation:** Provide real vector/raster stimuli for these 11 questions and remove the parenthetical text from stems so they don't give away answers or fail media audits.

---

## 3. Question Bank Duplicates & Answer Key Audit

- **Answer Keys:** All 1,157 questions have valid options and valid numerical answers ($0 \le \text{answer} < \text{options.length}$).
- **Duplicates Analysis:**
  - 297 unique stems appear in multiple banks.
  - Principal cause: Legacy duplication where the first 20 questions of early quests (Vocab, Signs, Directions, Conversation, Grammar) were copy-pasted into Pre-test (20 items) and Final Boss (30 items), as well as repeating items across difficulty blocks within quests.
  - When sampling for official exam simulations, sampling must use unique content signatures (`question + options + answer`) to guarantee zero duplicate items in an exam paper.

---

## 4. O-NET Grade 6 Test Blueprint Alignment

### Official NIETS Specification (2568 - 2569 B.E.)
- **Format:** 32 multiple-choice questions (4 options, 1 correct answer)
- **Time:** 60 minutes
- **Scoring:** 3.125 points per question = 100 total points
- **Distribution across learning standards:**

| Standard | Description | Required Items | Percentage | Bank Coverage |
|---|---|---:|---:|---:|
| **ต 1.1** | ภาษาเพื่อการสื่อสาร (ป้าย สัญลักษณ์ นิทาน บทอ่าน ความเข้าใจ) | 6 | 18.75% | 739 items (123x) |
| **ต 1.2** | ทักษะสื่อสารโต้ตอบ (ทักทาย ขอบคุณ ขอโทษ สื่อสารประจำวัน) | 10 | 31.25% | 146 items (14x) |
| **ต 1.3** | นำเสนอข้อมูลตนเอง/เรื่องใกล้ตัว ผัง ตาราง แผนภูมิ กราฟ | 6 | 18.75% | 144 items (24x) |
| **ต 2.1** | เทศกาล วันสำคัญ และวัฒนธรรมเจ้าของภาษา | 2 | 6.25% | **0 items in QUESTS** |
| **ต 2.2** | เปรียบเทียบภาษาและวัฒนธรรม (ไวยากรณ์ โครงสร้าง วรรคตอน) | 4 | 12.50% | 75 items (18x) |
| **ต 4.1** | การใช้ภาษาในห้องเรียน สถานศึกษา และชุมชน | 4 | 12.50% | 53 items (13x) |
| **รวม** | | **32** | **100.00%** | |

### Critical Finding: Gap in Standard ต 2.1
- While standards ต 1.1, 1.2, 1.3, 2.2, and 4.1 have substantial item pools, **ต 2.1 (Culture & Festivals)** is not represented in the active `QUESTS` bank.
- Culture material exists in `src/data/missions/ch3_missions.js` (`rd_festival`: Halloween passage, 4 items) and `src/components/RealOnetSimulator.jsx` (3 Halloween items), plus Worksheet P6 pages 43-48 (Festivals).
- **Prerequisite for Blueprint Sampler:** Before activating the official 32-item Blueprint sampler, a bank of at least 8-10 verified ต 2.1 questions (Christmas, Halloween, New Year, Songkran, Loy Krathong, etc.) must be added to the pool.

---

## 5. Blueprint Sampler Architecture

```mermaid
flowchart TD
    Bank[Approved Question Pool] --> Filter[Filter: Review Approved & Valid Media]
    Filter --> Dedup[Deduplicate by Content Signature]
    Dedup --> Partition[Partition by Standard: ต 1.1, 1.2, 1.3, 2.1, 2.2, 4.1]
    Partition --> Sample[Quota-based Sampler: 6 / 10 / 6 / 2 / 4 / 4]
    Sample --> ShuffleOpts[Shuffle Options with Key Remapping]
    ShuffleOpts --> Paper[32-Question O-NET Exam Paper (60 Min / 100 Pts)]
```

### Invariants:
1. Every generated paper has exactly 32 questions with score weight 3.125 pts each.
2. Quota is strictly enforced: ต 1.1 (6), ต 1.2 (10), ต 1.3 (6), ต 2.1 (2), ต 2.2 (4), ต 4.1 (4).
3. Option shuffling is deterministic or seeded, remapping `answer` without mutating bank items.
4. Two-step questions and unverified media items are excluded from standard MCQ exam papers.
