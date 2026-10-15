# Vocab Learning Review

Date: 2026-10-13. Scope: 12 action verbs and 10 daily routine phrases in `src/data/vocabDrill.js`.
Status: authored learning material, technical language check only. Not owner-approved assessment items, calibrated mastery measures or official Blueprint evidence.

## Language Check

| English | Thai | Check |
| --- | --- | --- |
| eat | กิน | eat rice: verb with object |
| drink | ดื่ม | drink water: verb with object |
| read | อ่าน | read a book: singular noun with article |
| write | เขียน | write my name: consistent first person |
| walk | เดิน | walk to school: movement and destination |
| run | วิ่ง | run in the park: place preposition |
| play | เล่น | play football: no article before sport |
| listen | ฟัง | listen to my teacher: includes to |
| speak | พูด | speak English: language name |
| open | เปิด | open the door: action not adjective |
| close | ปิด | close the window: action |
| help | ช่วย | help my friend: direct object |
| wake up | ตื่นนอน | Become awake; can remain lying in bed |
| get up | ลุกจากที่นอน | Leave the lying position; distinguished from wake up |
| brush my teeth | แปรงฟันของฉัน | my agrees with I; plural teeth |
| take a shower | อาบน้ำ | includes a |
| get dressed | แต่งตัว | common daily-routine phrase |
| have breakfast | กินอาหารเช้า | no article before meal |
| go to school | ไปโรงเรียน | no article for routine school attendance |
| have lunch | กินอาหารกลางวัน | at noon: time expression |
| do my homework | ทำการบ้านของฉัน | do homework, not make; uncountable homework |
| go to bed | เข้านอน | not identical to sleep; nine interpreted at night in bedtime context |

All 22 entries have a Thai meaning and a complete English/Thai example. This checks local consistency, not vocabulary coverage, difficulty calibration, TTS voice quality or student comprehension. No irregular-verb or classroom-request expansion was added.

## Illustration Batches 1-2

The built-in image generator produced 22 raster assets, copied unchanged into `public/learning/verbs/` and `public/learning/routines/`.

- `wake-up-v1.png`: child still lying under the blanket, head on pillow, open eye and hand near eye.
- `get-up-v1.png`: child pushing up from the bed edge, both feet beside the bed.

All 22 have actual transparency and nonblank decoded pixels, complete visible actions at mobile size, no embedded text and descriptive Thai alt text. They are attached to every Action Verbs and Daily Routine flashcard. Memory Match also shows the illustration on the English tile; Audio Detective remains image-free before answering so the listening answer is not revealed. Failure to load falls back to the existing word card, not fabricated image content.

Image status is `technical_check_only`, version `vocab-illustrations-v1`. Exact prompts and original paths: `md/Routine Image Generation.json` and `md/Vocab Illustration Generation Batch 2.json`. Owner visual review remains separate; no exam-media approval is implied.

## Illustration Batch 3

The built-in image generator produced 20 additional transparent raster assets for the first two legacy categories: Transport 12 and Places 8. They are copied unchanged into `public/learning/transport/` and `public/learning/places/`, with exact prompts and generated-source paths recorded in `md/Vocab Illustration Generation Batch 3.json`.

All 20 were visually checked for recognizable subject, complete framing and absence of captions/logos. They are attached through an additive registry so the historical mission data remains unchanged. Status is `technical_check_only`, version `vocab-legacy-batch3-v1`; owner visual review remains pending and this does not approve assessment media. Current coverage is 42 illustrated Vocab Drill cards; 148 cards across 18 legacy categories remain.

Flashcards render the raster illustration in place of the historical emoji/symbol, not alongside it. The original symbol is retained only as a load-failure fallback. Memory Match already follows the same replacement behavior.

## Practice History

Local-only record: `onet_vocab_practice_v1:<encoded learner id>`, schema version 1. Stores completed sessions, last practice timestamp and mode by category, not score/XP/mastery. Unknown historical activity is labelled "ยังไม่มีประวัติการฝึก", not "never practiced". Demo/anonymous history stays in memory. It is not synced across devices.

Only completion records a session; opening a category or backing out does not. Repeated completion callbacks from the same attempt are ignored. Existing daily XP cap/diminishing returns and legacy score records are preserved. Storage failures are reported without inventing historical progress.

## Verification

- Unit tests: 94/94; exact category/deck mapping, learning-only scope, image assets, learner isolation, malformed cache and write failures.
- `vocab-drill-browser`: 22 categories/search/native-dialog/Escape/focus, six modes for both new decks and bilingual examples; 320/390/768/1366 layouts.
- `vocab-practice-browser`: ten-card completion, one XP/history record despite double click, restoration on remount and learner isolation.
- `vocab-images-browser`: 42 unique transparent nonblank images decode with alt text and remain overflow-free at 320/390/1366.
- Production build passed; existing large-chunk/mixed-import warnings remain.
- New learner regression passed after updating its stale text-arrow login selector to the current accessible button name: login, Pre-test 20, all Chapter 1 quests, review, Chapter 2 and refresh persistence; no real cloud writes.
