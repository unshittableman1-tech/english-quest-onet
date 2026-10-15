# Media Source Repair Batch 2

Date: 2026-10-13

## Scope And Status

Compared rendered source pages and extracted text for SET7 7.3 (charts) and 7.4 (tables). Repaired 10 existing items, not 10 new questions or quests. Technical source comparison is complete for this batch; teacher/content/accessibility review and publication rights confirmation remain pending. None of these items is release-approved.

Review URL: http://127.0.0.1:5173/scratch/media-review.html

This local development page previews pending items, source links and answer explanations. It cannot approve items, award XP or submit grades. It is not included as a production build entry point.

## Source Evidence

| Source | SHA-256 | Stimulus Pages | Answer Page |
|---|---|---|---|
| `pdf_blueprints/SET7/7.3 แผนภูมิ.pdf` | `00bf1ac023811100950a8d13f62cfafc5b6aa017bff5f14d898f7da17b0f245a` | 4-6 | 7 |
| `pdf_blueprints/SET7/7.4 ตาราง.pdf` | `41dd7a41e67fbac25ba5a88796a7065c0e6cb56c9ff7a770e8f1112e50595fc2` | 5 | 7 |

Rendered evidence is retained under `scratch/content-audit/media-evidence/`. Full source pages, including adjacent questions and answer explanations, were inspected. These are supplied tutoring worksheets, not a claim of official O-NET item provenance.

## Repairs

| Item | Finding | Repair | Source Question Page | Key |
|---|---|---|---|---|
| `pdf_set7_15` | Existing chart reverses blue/red order and relative values; old visual makes B and D true | Blue=100, Red=80, Green=120; restore labels, units and scale; clarify stem to ask which statement is correct | 4 | D |
| `pdf_set7_16` | Source itself has two true options: A (2021 highest) and D (2020 lowest); app uses an inaccurate bar chart instead of source line chart | Restore line series 50,60,55; adapt D to "2020 is the highest", explicitly version this distractor change | 4 | A |
| `pdf_set7_17` | Timeline absent despite being present in source | Restore Morning, Class, Lunch, After school, Home as ordered sequence; do not invent times | 5 | B |
| `pdf_set7_18` | Existing bars distort relative scores and omit numeric scale | Restore 28.8,38.5,33.1 with year and score labels | 5 | B |
| `pdf_set7_19` | Existing bars exaggerate decrease and omit source values/units | Restore 66.30,66.05,65.93 million with zero baseline and exact labels; not presented as verified live demographic statistics | 6 | C |
| `pdf_set7_20` | Old SVG uses fabricated scores, making B and C true | Structured table with source values | 5 | B |
| `pdf_set7_21` | Old values cannot support source's numerical explanation | Compare absolute changes: mathematics 6.7, English 5.4 | 5 | A |
| `pdf_set7_22` | Difference coincidentally matches despite wrong table data | Restore actual calculation 34.5-27.5=7.0 | 5 | B |
| `pdf_set7_23` | Old table makes both C and D true (first two math values equal) | Restore non-equal 27.5,27.8,34.5 | 5 | C |
| `pdf_set7_24` | English 2563 value incorrect in old SVG | Restore 38.5; keep average-score question and explanatory feedback | 6 | B |

Shared table:

| Year (B.E.) | Mathematics Average | English Average |
|---|---:|---:|
| 2562 | 27.5 | 28.8 |
| 2563 | 27.8 | 38.5 |
| 2564 | 34.5 | 33.1 |

## Version And Review Policy

- Existing IDs retained with `itemVersion=media-repair-v2` and source/stimulus version metadata. No saved attempt or original asset overwritten.
- The old `table_scores.svg` and graph files remain available for historical references; repaired current items no longer point to them.
- `sourceCheck` records Codex technical comparison, source hash, method and date. It is not a teacher sign-off.
- `reviewStatus` and `mediaReview.status` remain `pending_teacher`; reviewer is null. Media preflight still blocks these items from normal scoring.
- Review approval must match the new item version; a sign-off for an old version does not validate changed stimuli.
- The line-chart distractor adaptation and the clearer color-chart stem require explicit teacher review. Accessibility data tables disclose chart data, not interpreted answers, but equivalence to the intended visual skill still needs pedagogical sign-off.
- No retroactive rescoring: historical results involving an incorrect stimulus must be reviewed under a separate incident/remediation policy.

## Inventory Delta

Latest automatic inventory still contains 1,127 positional records (duplicates across banks are not unique item counts):

- 89 present_unverified (includes the 10 repaired but pending items, and the newly restored timeline).
- 11 placeholders, up from 7: detector now also catches Game controller, Shopping cart, Sun and Rainy cloud descriptions.
- 1,027 not_required according to declared data and limited heuristics, not a certificate of PDF completeness.
- 100 records blocked before assessment, zero release-approved records.

## Verification

- Unit tests verify source hashes, table values, numerical uniqueness of table/color/line answers, chart bounds, pending approval, version mismatch and non-mutation of old objects.
- Browser tests inspect all 10 repairs at 320,390,768,1366 pixels, SVG marks, chart data, table values, ordered timeline, source link and navigation. Screenshot review includes mobile and desktop.
- Preview uses the same renderer as learning/exam pages but does not use grading handlers. Learner preflight remains in force.
- Final verification: 63 unit tests pass; production build passes with existing bundle/import warnings; source-preview, media failure, quiz-flow and full browser smoke suites pass. No production database writes were used for verification.

## Next Batch

Continue SET7 picture and map comparisons, restore the 11 symbolic placeholders only after checking actual source stimuli, inspect existing reading passages, and extend inventory to mission game payloads and the inline simulator. Finish teacher sign-off and rights confirmation before re-enabling affected assessment sets. Do not add quests based only on unreviewed coverage gaps.
