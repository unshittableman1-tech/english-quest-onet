# New Learner Verification

Date: 2026-10-13

## Scope And Outcome

Verified the real application screens from an empty browser session through StudentLoginPage, all 20 Pre-test items, all 10 Chapter 1 quests, mistake review and entry into the Chapter 2 Conversation Cafe Quiz. No previous quest progress, pre-test result, XP or badges were injected. A synthetic roster record was supplied through intercepted database requests; every remote request was intercepted and no live student data was read or written. This verifies local application behavior, not production database policies or deployment.

Evidence: `tests/new-learner-browser.mjs`, `scratch/new-learner-report.json` and `scratch/phase0-screenshots/new-learner-chapter2-{320,390,1366}.png`.

## Findings And Repairs

1. The Pre-test stopped at media preflight because its three existing Lisa passage questions had no media check. The unchanged inline passage and answer consistency were inspected. Only the Pre-test copies now record a Codex rendering check at `pretest-reading-v1`. The passage is complete, retained as text and displayed in the question area. This is technical media verification of existing local content, not human content sign-off, a PDF-source match or official exam approval; the three items remain ineligible for official release profiles.
2. Practice Quiz previously sampled unverified images and symbolic placeholders, then stopped the whole selected round. A shared practice readiness check now excludes pending/rejected/quarantined items, invalid/missing/placeholder/unverified media and items authorized only for other modes before practice sampling. MissionSelect uses the same check. The selected images still undergo loading preflight and runtime failure checks. The existing exam path retains its full selected set and fails if its stimuli are unavailable.
3. Practice displays the actual round size and held-item count when there are exclusions. The original banks are retained for repair. Family currently has seven usable text questions; two image questions remain pending technical/media review. `pdf_1.2_ครอบครัว_9` is quarantined because its stem asks for the cousin's mother but its four choices do not provide that relationship correctly. Its original stem/options/key remain available for later revision. Chapter 1 currently holds 15 items in total (14 media cases and this ambiguous item). Passing remains 70% of the actual round; Weather's existing four-item round is unchanged.
4. Pre-test now saves its real total (20) and `pretest-v1` alongside category scores, rejects inconsistent totals and computes new badge statistics using the saved denominator. Historical records are not rewritten. Remaining report screens and legacy-denominator handling are a separate audit in the plan.
5. ReviewMistakePage now retains the question being explained while a mastered item disappears from the queue, selects the successor using the updated queue and handles an empty queue after feedback. This prevents undefined-question errors or skipped queue positions during mastery updates.

## End-To-End Evidence

| Stage | Result |
|---|---|
| Login | Empty browser session; fixture student has no previous learning data |
| Pre-test | 20/20, saved total 20 and pretestScore 100%; all three passages displayed |
| Chapter 1 | All 10 quests completed once through MissionSelect and Quiz; actual totals saved |
| Shapes first responses | Three wrong-then-correct answers produce 7/10, with three saved mistakes |
| Unlock before review | Chapter 2 remains locked even after all Chapter 1 quests pass |
| Review | Each of three mistakes answered correctly twice; all become mastered |
| Chapter 2 | Conversation Cafe becomes available and its Quiz opens with four choices |
| Reload | All ten quest results and chapter access persist without seeded legacy progress |
| Layout | No horizontal overflow at 320, 390 and 1366px; screenshots retained |

Software checks: 74 unit tests and production build pass, along with the new learner browser path, legacy Quiz/two-step regression, media renderer/failure regression, all three actual approved assessment flows and full browser smoke (map, teacher overview, reports and exam timing/submission). Existing bundle/import warnings remain. The three previously approved practice banks keep their original version and approval scope. Broader content correctness, missing media repairs, source fidelity, accessibility equivalence, calibrated mastery, official Blueprint sampling and live deployment remain separate work.

Current inventory has 1,157 rows: 23 technically verified media (20 human-approved practice items plus three unchanged Pre-test passage checks), 86 present_unverified, 11 placeholders and 1,037 not_required triage rows. Practice release eligibility remains 30; 98 rows remain blocked before assessment. These row counts are not unique-item or approved-skill counts.
