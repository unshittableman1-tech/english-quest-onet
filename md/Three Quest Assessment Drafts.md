# Three Quest Assessment Drafts

Date: 2026-10-13

## Approval Update

Latest Tenses update: the workspace owner attached the `assessment-review.html?quest=tenses_arena` screenshot and explicitly approved it in chat ("เห็นแล้ว อนุมัติ"). All 10 Tenses items are now approved for `practice_assessment` at the previewed `practice-draft-v1` version. Content approval records `explicit_user_chat_after_tenses_preview`; media is `not_required` for these text-based grammar items, not a claim of verified pictures. Stems, options, keys and feedback were not changed.

All three formerly empty banks now have an approved practice Quiz (30 items total). Their normal Quest Map -> MissionSelect -> Quiz Mode entries are enabled subject to existing chapter prerequisites. No retrospective score changes, difficulty calibration, accessibility certification, SET7 approval, school-final authorization or official Blueprint alignment are implied.

Post-Tenses verification: 71 unit tests, production build, `quest-assessments-browser` and `empty-assessment-browser` pass. All three scoring flows now use actual bank approvals without approval overrides, including first-response persistence and actual app entry at 320/390/1366px. Isolated pending copies remain blocked and do not mutate persisted bank files; no real student/cloud data was written. Current inventory: 1,157 rows; 20 verified media, 89 present_unverified, 11 placeholder, 1,037 not_required (triage), 30 practice-release-eligible items, and 100 blocked before assessment.

### Earlier Clothes Approval

Latest update: after viewing the illustrated Clothes preview, the workspace owner explicitly approved it in chat ("ผมดูแล้ว อนุมัตครับ"). All 10 `clothes_fashion` items are now approved for `practice_assessment` at the reviewed `practice-illustrated-v2` version, with verified media approval against the same version. This supersedes the pending clothing state in the historical delivery notes below. The normal Quest Map -> MissionSelect -> Quiz Mode entry is enabled. Tenses alone remains pending (10 items).

This approval does not change the pictures, stems, choices, answer keys, scoring policy or historical student results. It does not authorize `school_final_50` or official O-NET use, and does not settle accessibility equivalence or difficulty calibration. The image prompt manifest records the owner approval and scope.

Post-Clothes-approval verification: 70 unit tests, build, `quest-assessments-browser` and `empty-assessment-browser` pass. Actual Shapes/Clothes approval is used in Quiz flow tests without approval overrides; only Tenses uses an isolated scoring fixture. Actual app entry and image/options layout are checked at 320/390/1366px. No real student/cloud writes occur. Latest inventory: 1,157 rows; 20 verified for practice, 89 present_unverified, 11 placeholder, 1,037 not_required (triage), and 110 blocked before assessment.

### Earlier Shapes Approval

After trying the Shapes preview, the workspace owner explicitly approved adding it as Quiz in chat. The 10 `shapes_colors` items are now approved for `practice_assessment`, with matching content/media approval recorded against the tested `practice-draft-v1` version. Clothes and Tenses (20 items) remain pending.

The approved Shapes set is accessible through the normal Quest Map -> MissionSelect -> Quiz Mode flow, including first-response scoring, XP and stored progress. Approval was not extended to school-final or official O-NET profiles; the final-exam collector excludes items with a mode restriction that does not authorize its profile. Accessibility equivalence/accommodations and difficulty calibration remain separate pending tasks, not implied by this visual practice approval.

Final verification after approval: 69 unit tests, build, approved Shapes browser flow and pending-entry guard pass; actual Shapes data is used without a simulated approval override. The other two sets use isolated approval fixtures only when testing their scoring implementation.

## Delivery

### Clothing Illustration Update

At the user's request, all 10 `clothes_fashion` items now include raster pictures in `practice-illustrated-v2`. Nine transparent PNG illustrations were generated with the built-in image_gen tool and saved unchanged under `public/assessment/clothes/`; questions 1 and 5 intentionally reuse the raincoat. The complete prompts, asset paths and generation provenance are in `md/Clothing Image Generation.json`. These are new illustrations, not extracted official exam images or emoji substitutes.

The first four stems now ask which word matches the picture. The remaining six retain their context questions and add related pictures. Options, answer indices and feedback are unchanged. The existing shared stimulus renderer provides complete-object display and image enlargement. Content/media review remains `pending_teacher`, approved modes remain empty, and accessibility equivalence still requires review. Shapes approval and Tenses content were not changed.

Verification: 70 unit tests and production build pass. `clothing-images-browser` checks all 10 pictures at 320/390/1366px for successful decoding, nonblank/transparent pixels, intact choices, no horizontal overflow, and zoom/Escape/focus return. `quest-assessments-browser` also passes the approved Shapes flow, first-response persistence and pending clothing/Tenses gates. Browser verification uses isolated data and makes no real student/cloud writes. Large PNG delivery can be optimized separately while preserving the reviewed originals.

Updated inventory: 1,157 rows; 10 verified for practice, 99 present_unverified, 11 placeholder, 1,037 not_required (triage), and 120 blocked before assessment. Loading a picture does not certify content or Blueprint alignment.

### Initial Draft Delivery

Initially added 10 authored MCQs per formerly empty quest: `shapes_colors`, `clothes_fashion`, `tenses_arena`. Each item has an ID, `practice-draft-v1` version, feedback, lesson-objective provenance and provisional difficulty. All started pending; the approval update above supersedes that state for Shapes only. These are new practice items, not copied official exam questions and not an approved Blueprint pool.

Local interactive review: http://127.0.0.1:5173/scratch/assessment-review.html

The local MissionSelect screen offers a development-only "ลอง Quiz ชุดร่าง" link for pending sets, scoped to that quest. Review choices and feedback are transient: no XP, grade, pass or approval is written. Normal Shapes Quiz entry is enabled; the other two remain disabled until approval. Production builds do not expose this development review link or include the scratch HTML as an entry point.

## Content And Sources

| Quest | Items | Objective | Source Relationship |
|---|---:|---|---|
| shapes_colors | 10 | Six shape names, three color names, one shape/color phrase | Existing shapes_flip/shapes_match; worksheet pages 46-47 support shape vocabulary, not literal MCQ stems or copied image colors |
| clothes_fashion | 10 | Vocabulary and contextual use of clothing | Existing clothes_flip/clothes_match; worksheet pages 19-20 support vocabulary; belt objective additionally supported by tutor worksheet page 47 |
| tenses_arena | 10 | Present simple, present continuous, past simple and future simple; affirmative, negative and question forms | Existing ten_flip/ten_rearrange lesson objectives, not claims of source-PDF item equivalence |

Supporting PDFs were visually inspected for the cited vocabulary pages. Their original picture-matching tasks are not automatically equivalent to the authored MCQs. Color recognition is an authored extension. Initially, clothing questions measured words/context without garment pictures; the illustration update above introduces visual word recognition for the first four items and contextual picture support for the rest.

Six original deterministic SVG drawings were added under `public/assessment/forms/`. They contain no emoji, embedded answer labels or external assets. Geometry/color and nonblank rendering were checked. Images were not extracted from teacher answer pages, and old assets were not overwritten.

Shape and color descriptions for screen readers are provisional. A teacher must decide whether they provide an equivalent assessment or require a separate accommodation, especially for color-vision differences. Pending approval must not be bypassed just because the images load correctly.

## Scoring Policy

- New items opt into `first_response_v1`; legacy quests keep their existing scoring behavior.
- The first answer per item determines the new practice-assessment score. A corrected answer after feedback can earn learning XP but cannot replace the original assessment response.
- Summary labels the result as "คะแนนคำตอบครั้งแรก". Completion records item/version, original choice, first correctness and final practice correctness.
- Storage validates evidence totals, score, unique item identities and response types before saving. The latest evidence is stored separately from legacy aggregate scores as `lastAssessment`.
- Existing pass flags, old totals/stars and unrelated progress are preserved. No retrospective regrading was performed.
- This is first response within a practice round, not a claim of independent mastery: repeat exposure, translation/hints and difficulty calibration require further evidence work.

## Checks

- 30 authored items have four distinct choices and explicit answer/explanation checks; all three previewed versions are approved for practice only.
- Browser tests preview all 30 items on 320/390/1366px screens and inspect rendered image pixels, review answer interaction and the local preview link.
- Isolated test-only approval fixtures exercise all three Quiz flows and real local persistence. A wrong-then-correct response remains wrong in the first-response score.
- Progression tests demonstrate a 60% fixture does not pass regardless of XP; 70% fixtures unlock the appropriate next gate when other prerequisites and mistake review are satisfied. These tests do not certify release readiness of other banks.
- Initial draft delivery did not approve any content. Subsequent human approvals apply only to the previewed Shapes, illustrated Clothes and Tenses practice versions as recorded above. No real student/cloud data was changed during verification; accessibility equivalence and deployment remain separate tasks.
- Initial draft verification: 68 unit tests, production build (existing bundle/import warnings), draft-assessment browser flow, pending-entry guard, legacy quiz, SET7 preview and full browser smoke passed. Later approval verification and the latest regenerated inventory are recorded above.
