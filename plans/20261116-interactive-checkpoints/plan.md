# Interactive checkpoints and source comparison

## Requirements

- User authorizes comparison with the original public learning guide and interactive checkpoints.
- Preserve the screenshot-style Astro UI and English/Vietnamese Markdown; Prettier printWidth 120.
- Verify source answers by option text and pair definitions, not shuffled indices.
- Reproduce verified immediate feedback, retry, matching and finish-lock behavior.
- Keep state local, shared between locales, and robust to old/corrupt/unavailable storage.
- Audit all outline metadata and the full available lesson; do not claim other lesson bodies are complete.

## Phases

1. Inspect source guide, lesson payload, links and live interactions — in progress.
2. Add behavioral regression tests and prove failures on the static implementation — pending.
3. Implement verified question data, interaction modules, progress/completion and source citations — pending.
4. Full checks/build/browser suite, independent review and docs reconciliation — pending.

## Scope Contract

Changed — source metadata, bilingual lesson controls, feedback, checkpoint storage, completion gating, styles and tests/docs.
Impacted — grading, matching, saved-state compatibility, language navigation, keyboard/mobile/no-JS reading.
Will verify — source comparison, meaningful RED tests, full format/type/build/browser suite and independent review.
Deliberately skipped — untranscribed 37 lesson groups, accounts, cross-device sync and deployment.
