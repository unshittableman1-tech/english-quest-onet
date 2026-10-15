# Family Media Repair Batch 3

Date: 2026-10-13. Scope: three held Family items, version `family-media-v2`.
Status: owner approved `family-media-v2` for practice after reviewing the Family preview and explicitly approving it in chat on 2026-10-13. Earlier authorization to perform repairs alone was not content approval.

## Source and Changes

Source: `pdf_blueprints/SET1/1.2 ครอบครัว.pdf`, visually inspected rendered pages 4-7.
SHA-256: `580df49430f886017ebd417508978c0ee60c49391405a0ae13839225c62733f6`.

| Item | Source | Repair | Key |
| --- | --- | --- | --- |
| pdf_1.2_ครอบครัว_1 | Page 4, family emoji | New family illustration; stem asks which word matches the picture | C. Family |
| pdf_1.2_ครอบครัว_6 | Page 5, home emoji | New residential house illustration; same picture-reading stem | C. Home |
| pdf_1.2_ครอบครัว_9 | Page 6, answer page 7 | All choices use My rather than His; source key His aunt is wrong for the stated relationship | C. My aunt |

The third item is an adaptation correcting the supplied worksheet itself: the cousin is **my aunt's son**, therefore his mother is **my aunt**, not **his aunt**. Original IDs, stems/options/keys and prior status remain available in `legacySnapshot`. No historical scores are regraded.

Illustrations are newly authored with the built-in image generator, not crops or reproductions of source artwork. Original generated files were copied unchanged to `public/assessment/family/f01-v1.png` and `f06-v1.png`. Exact prompts and original paths are in `md/Family Image Generation.json`. Descriptive alt text is present; assessment-equivalent accessibility and source publication rights remain pending separate review.

## Review

- Family: http://127.0.0.1:5173/scratch/media-review.html?batch=family
- SET7: http://127.0.0.1:5173/scratch/media-review.html
- Both previews support temporary answers, explanations, item navigation and source-page links. They do not save grades, XP or approval.
- Family now has ten live practice items, including these three approved repairs. SET7 ten repaired items remain pending. No official O-NET alignment or exam release is granted by this Family approval.

## Verification

- `npm.cmd test`: 85/85 passed, including three new Family tests: source hashes/pages, live gating, PNG/provenance, pronoun correction and non-mutation.
- `npm.cmd run build`: passed; existing large-chunk/mixed-import warnings remain.
- `tests/family-media-browser.mjs`: passed at 320/390/1366px; real decoded alpha/visible pixels, zoom/Escape/focus, all answers/source links, no browser errors and no localStorage/network writes.
- `tests/media-source-browser.mjs`: passed for all ten SET7 items at 320/390/768/1366px, including exact graph/table/timeline data and PDF links.
- `tests/new-learner-browser.mjs`: passed again after integration; actual login with a mock roster, 20-item Pre-test, all ten Chapter 1 quests (Family 7/7), review mastery, Chapter 2 Quiz and refresh persistence; no real cloud writes.
- Screenshots: `scratch/phase0-screenshots/family-media-{0,1,2}-{320,390,1366}.png`; manually inspected mobile family and desktop home screenshots.
- Refreshed media inventory: 1,157 rows, verified 23, present_unverified 86, placeholder 11, not_required 1,037, blocked 98, releaseEligible 30. These are bank rows, not unique items. Approval gates intentionally keep counts unchanged.

## Remaining Work

SET7 still needs owner review. Continue remaining inventory media repairs and answer/duplicate audits, followed by indicator/difficulty tagging and Blueprint sampling. This batch does not complete the entire media inventory, membership integration or payments.

## Owner Approval Update

- Explicit approval applies only to the three Family items in `family-media-v2`, including both image assets and the corrected My aunt choice. Source publication rights and assessment-equivalent accessibility remain separate unresolved checks.
- `reviewStatus: approved`, `approvedModes: [practice_assessment]`; image media verified by workspace owner at this version. No historical grades are changed; existing saved Family results retain their original denominator.
- Updated inventory: 1,157 rows; verified 25, present_unverified 84, placeholder 11, not_required 1,037; blocked 95 and practice releaseEligible 33.
- Approval does not restore the removed draft-review link on the Family learner screen.
- Post-approval verification: 85/85 unit tests and production build passed. New learner browser completed Family 10/10, persisted the actual total, unlocked Chapter 2 and retained progress after refresh without real cloud writes.
