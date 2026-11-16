# Bilingual Astro course — initial delivery

## Confirmed decisions

- English faithfully transcribed; Vietnamese naturally translated, preserving technical identifiers.
- Missing source URLs, answers and explanations recorded rather than inferred.
- Questions readable without grading. Original unsupported matching instructions retained in Markdown comments.
- Latest UI instruction supersedes separate identity: match screenshot header, sidebar and content; adapt for mobile.
- Locale switch preserves lesson and section fragment; completion is browser-local and shared between locales.
- Node 24.15.0 via nvm; Prettier printWidth 120.
- Local repository delivery; no commit, push or deployment requested.

## Phases

1. Inventory 53 screenshots / 38 groups / 7 domains — complete.
2. Extract and translate all 53 sidebar titles — complete.
3. Transcribe and translate full lesson 1.1 — complete draft with source audit.
4. Astro routes, reference UI, locale switching and reading progress — complete sample.
5. Full checks, browser tests and independent review — complete, 14/14 pass.
6. Remaining 37 lesson groups — pending; original overall content goal remains unfinished.

Detailed sample phase: [phase-01-bilingual-sample.md](phase-01-bilingual-sample.md).
Evidence: [verification report](../reports/verification-20261116-bilingual-sample.md).

## Scope Contract

Changed — Astro scaffold, sample content, screenshot UI, navigation, storage, formatting and documentation.
Impacted — static routes, locale/anchor parity, source traceability, accessibility and persisted state.
Will verify — full format/type/build/browser checks, content/source audit, independent HTML and code review.
Deliberately skipped — remaining content extraction, unconfirmed grading, accounts and deployment.

## Acceptance results

- Both sample locales render 6 sections / 9 checkpoints / 2 matching panels.
- No fabricated answer keys or source URLs.
- Completion survives reload/locale changes; failed storage leaves reading usable.
- Menu supports keyboard/no-JS; mobile has no page overflow.
- Build 5 routes; 14 tests pass; HTML audit resolves 63 internal references.
- Independent final review found no concrete blockers or new regressions.
