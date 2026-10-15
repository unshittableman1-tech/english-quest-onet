# Assessment Reporting And Simulator Repair

Date: 2026-10-13

## Delivered Scope

Completed the software repair portion of plan step 2: consistent Pre-test reporting, explicit handling of two-step questions in practice/review versus MCQ exams, and correction of the five-part timed practice. Validation uses isolated browser data and intercepted remote requests; no live student records were rewritten.

## Pre-test Reporting

`src/utils/preTestResult.js` resolves results in this order:

| Evidence | Behavior |
|---|---|
| Valid recorded total | Use score / recorded total, including zero scores |
| No total, complete category counts matching the score | Infer the denominator from those counts |
| No total/categories, known pretest-v1 | Use its documented 20-item profile |
| Unknown, inconsistent or invalid legacy result | Retain the raw score; percentage remains unknown |
| No raw Pre-test record, existing positive legacy percentage | Preserve that percentage-only compatibility without inventing a paper total |

Student reports, teacher summaries/details/CSV, ranking growth and new growth-badge eligibility now use the same resolved baseline. The student report displays the actual denominator or an unknown state. Exports leave unknown percentages blank instead of writing zero. Class growth compares the same students who have both a baseline and current quest results. An unknown baseline cannot create growth points or new growth badges. Existing stored XP, badges, attempts and raw historical results are preserved; there is no retrospective migration or badge revocation.

## Two-Step Questions And Exams

- `getQuestionFeedback` chooses the existing authored explanation for all four main-answer/reason combinations. Quiz feedback no longer falls back to generic text when the question uses the original `feedback` object.
- Review now asks both the main question and its reason. It shows the selected main answer while choosing a reason and reads the current prompt. Only both-correct results increment review progress; two correct reviews are still required. A synchronous selection lock prevents double clicks from counting as two reviews. Speech controls are separate from answer buttons.
- MCQ-only ExamMode and the school final pool exclude two-step items instead of silently grading only their main answers. Invalid MCQ keys are excluded. If too few supported items remain, ExamMode displays the required count and starts no timer or attempt. Existing approved practice-only mode restrictions are preserved.
- Existing image/passage rendering, media preflight, timeout scoring and single-submission protection still pass regression checks. Unreviewed source media remains gated. This repair does not certify the content of every exam pool or implement the official Blueprint sampler.
- Corrected a directly verifiable key error: `fs15` previously selected 82 despite its own explanation calculating `(85+78+91+70)/4 = 81`. New `fs15-key-v2` selects 81 and records arithmetic evidence. Past attempt snapshots and scores are not regraded.

## Five-Part Practice

The visible name is now "ชุดฝึกภาษาอังกฤษ 5 ส่วน": 45 questions, 45 minutes, with results expressed as a practice percentage. The Quest Map shortcut uses the same name. The existing component/file/route remains available for compatibility.

Options are shuffled once per session with the answer index remapped and item identities recorded as `practice-sim-v2`. Reading questions about Mike retain his passage; the three Halloween questions now display an explicit matching passage. The permission and hospital-job questions were clarified to remove ambiguous context. These are authored practice corrections, not source-PDF extractions or official Blueprint approvals.

The clock uses a wall-clock deadline from the first question and continues through later part-tip screens, where remaining time is visible. Timeout uses the latest selected answers. Finish and reward refs prevent duplicate submission/XP, including under StrictMode. An unanswered timeout awards no XP. Speech buttons do not select answers, and reading passages remain fully visible without a short internal scroll area.

## Verification

- 82 unit tests pass, including old/new/unknown denominators, consistent class growth, no awards from unknown baselines, all four real two-step feedback branches, final-pool MCQ checks and the corrected arithmetic key.
- Shuffle tests cover 100 deterministic seeds and preserve correct text and passage overrides without mutating source items.
- `reports-simulator-browser` checks student reports and CSV for 20/30/unknown totals, all real two-step review outcomes, duplicate-click protection and mastery, the full 45-item practice with 45/45 -> 100%, one XP award on double submit, latest-answer timeout, timeout during part tips, empty timeout and MCQ shortage without submission.
- `new-learner-browser`, `browser-smoke`, `quiz-browser` and `question-media-browser` pass. This includes Chapter 2 progression, teacher overview/exports, legacy/two-step Quiz, media failure gates and exam timing/double-submit behavior.
- Production build passes with the existing bundle/static-dynamic-import warnings. Screenshots at 320/390/1366px show no horizontal overflow and were visually inspected. Files are under `scratch/phase0-screenshots/pretest-report-*`, `simulator-*` and `two-step-review-*`.

The regenerated inventory remains 1,157 rows: 23 verified media, 86 present_unverified, 11 placeholders and 1,037 not_required triage rows; 30 practice-release-eligible items and 98 blocked rows. Inline Simulator content and mission payloads remain outside that inventory's stated scope. Remaining work includes SET7 acceptance, missing-media repairs, full answer/duplicate audits, standards/difficulty tags and the official Blueprint sampler.
