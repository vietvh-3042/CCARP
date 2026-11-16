# Lesson slugs and unused-code cleanup

## Scope

Use the original source slug in `/en/lessons/{slug}/` and `/vi/lessons/{slug}/`. Keep lesson IDs for saved checkpoint progress. Render numeric compatibility pages fully; JavaScript adopts the canonical URL using history.replaceState while preserving query/fragment, and no-JavaScript bookmarks retain their original reading position. Source aliases redirect to canonical pages.

## Tasks

- [x] Inspect routing, navigation, import pipeline and tests.
- [x] Centralize slug URL generation; migrate canonical routes and redirects.
- [x] Update generated content links, library resume, language switching and pagination.
- [x] Remove code/data proven unused; retain user images and source evidence.
- [x] Verify full build, source/link audit and browser suite; independent review.
- [x] Update current documentation and record results.

## Scope Contract

Changed — Canonical URLs, navigation, generated content links and unused code/data.
Impacted — Every public lesson route, locale switching, redirects, saved-progress entry points and source audits.
Will verify — Full type/build/format/source-link checks and browser suite, including legacy URL/hash/query migration and preserved answers.
Deliberately skipped — External services, deployment, accounts and cross-device synchronization.

## Result

Completed. Formatter/check/build/source audit passed; 35/35 browser tests passed. Static output: 269 pages, including 106 canonical lessons, 106 numeric compatibility pages, 54 source aliases and three entry/library pages. All 10,338 internal links passed the audit. Independent review confirmed the no-JavaScript bookmark fix and reported no further findings.

[Verification report](../reports/verification-20261116-lesson-slugs-cleanup.md)
