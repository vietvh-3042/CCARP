# Agreed product decisions

## Session 2026-11-15

- Q: Content handling? → A: English faithful to screenshots; natural Vietnamese translation; retain API identifiers/code and consistent terminology.
- Q: Interactive exercises? → A: Extract all visible questions/options; scoring only after answer keys are confirmed.
- Q: Visual direction? → A: Keep study layout, improve readability and mobile, use own identity.
- Q: Progress? → A: Browser-local progress for first version; no account or cross-device sync.
- Q: Node setup? → A: Use nvm to switch version when needed.

- Q: UI fidelity? → A: Match screenshots throughout overall layout, sidebar and content; supersedes earlier separate visual identity.
- Q: Formatting? → A: Add Prettier with printWidth: 120.

- Matching exercise instructions: preserve original action text in Markdown comments; show a reading instruction while answer keys are unavailable.

## Session 2026-11-16

- Q: Course scope? → A: Clone the learning index and every internal module from the supplied CertSafari course URLs: 53 pages, 38 lesson groups and 7 domains, with English and Vietnamese content.
- Q: Exercises? → A: All Checkpoints must work. Source answer keys are now verified; interactive choice, fill, multi-select, matching and ordering supersede the initial reading-only matching treatment.
- Q: Styling? → A: Use Tailwind CSS v4 instead of standalone CSS files; preserve the source layout, sidebar and lesson content.

## Session 2026-11-16 — URL và dọn mã

- Q: Lesson URL format? → A: Replace numeric lesson URLs with title slugs matching the source site; keep English/Vietnamese routes and the current lesson when switching.
- Q: Cleanup scope? → A: Review and remove unused code/data. Keep source screenshots, active content, provenance and compatibility needed by existing links/progress.
