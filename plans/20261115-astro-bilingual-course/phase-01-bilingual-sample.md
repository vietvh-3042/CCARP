# Phase 01 — bilingual sample

## Context links

[Plan](plan.md) · [Verification](../reports/verification-20261116-bilingual-sample.md) · [Decisions](../../docs/clarifications.md)

## Overview

Priority: high. Status: complete for the first sample; the rest of the course is pending.

## Key insights

The screenshots contain hidden explanations and answer keys that cannot be transcribed. Matching columns preserve original order and must not imply verified pairs. The latest visual requirement is screenshot fidelity.

## Requirements

Full English/Vietnamese lesson 1.1; stable language/section links; browser-local read completion; screenshot-style layout and mobile navigation; no invented grading; Prettier 120 columns.

## Architecture

Validated Markdown → Astro static routes; shared components/CSS; minimal browser JS for menu, locale hash, search and storage.

## Related files

Content: `src/content/lessons/{en,vi}/business-problems-to-claude-solutions.md`.
UI: `src/components/`, `src/layouts/`, `src/styles/`, `src/pages/`.
Source metadata: `src/data/`. Verification: `tests/bilingual-course.spec.ts`.

## Implementation steps and todo

- [x] Inventory source images and extract sidebar titles.
- [x] Transcribe, translate and review sample content.
- [x] Build two language routes and screenshot-style components.
- [x] Add browser-local completion and progressive navigation.
- [x] Add Prettier printWidth 120.
- [x] Run full checks, browser suite, HTML audit and code review.

## Success criteria

5 built pages; 6 sections, 9 checkpoints and 2 matching panels per language; 14/14 tests pass; valid internal links and source hashes; no unresolved review blockers.

## Risk assessment

A successful sample is not a completed 38-group course. Retain explicit pending statuses and source/version caveats.

## Security considerations

No accounts, secrets or remote mutations. Local storage is optional and guarded. External reference links use `rel="noreferrer"`.

## Next steps

Transcribe and translate the remaining 37 groups, then review their source coverage before exposing published links.
