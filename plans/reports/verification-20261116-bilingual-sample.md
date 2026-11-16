# Bilingual sample verification — 2026-11-16

## Scope Contract

Changed — Astro sample, bilingual content, screenshot UI, locale switching, local progress and Prettier.
Impacted — generated routes/assets, source parity, anchors, accessibility, search and stored completion.
Will verify — full current suite and production build; source, HTML and independent code reviews.
Deliberately skipped — untranscribed 37 groups, answer grading, accounts and deployment.

## Results on final application code

| Check                         | Result                                                                                                |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| Prettier                      | `printWidth: 120`, Astro plugin installed; format check passed                                        |
| `npm run check`               | Exit 0; 16 files, 0 errors / 0 warnings / 0 hints                                                     |
| `npm run build`               | Exit 0; 5 static pages                                                                                |
| `npm test`                    | Exit 0; 14/14 passed in 3.0 seconds                                                                   |
| Source review                 | Full English lesson visually compared to supplied image; no concrete missing paragraphs/options found |
| HTMLParser audit              | 5 pages; correct lang, no duplicate IDs/content outside HTML; 63 local references resolve             |
| Independent final code review | No concrete blockers or new regressions                                                               |
| Code size                     | No source/test code file reaches 200 lines                                                            |

Routes: `/`, `/en/`, `/vi/`, `/en/lessons/1.1/`, `/vi/lessons/1.1/`.

## Covered behavior

Content/section/question parity and SHA-256; direct links/404; language and fragment preservation; completion persistence and undo; malformed or denied localStorage; keyboard menu/Escape; mobile overflow; no-JS reading; ungraded questions; header search.

## Visual evidence

[Desktop at 2560 × 1440](sample-desktop.png) · [Mobile at 390 × 844](sample-mobile.png).
At desktop width 2560, main content starts at x=1044 with width 768, matching the source column geometry. Images were inspected; this is not a full pixel-difference assertion.

## Limits

Only lesson 1.1 is fully transcribed/translated. 53 sidebar titles are metadata, not 53 completed lessons. Hidden answer keys, explanations, source destinations and the separate 12-question practice set remain unavailable. No public deployment or Git commit was performed.

## Documentation-only closeout contract

Changed — README, roadmap, changelog, architecture, standards, plan and this report.
Impacted — documentation accuracy and relative links; application bytes unchanged.
Will verify — Prettier and local Markdown links only.
Deliberately skipped — rerunning application tests after prose-only updates; final app code already passed above.
