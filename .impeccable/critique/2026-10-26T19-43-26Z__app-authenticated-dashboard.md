---
target: dashboard
total_score: 19
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:/Users/tomv/Desktop/projects/indie-cms/app/(authenticated)/dashboard"
timestamp: 2026-10-26T19-43-26Z
slug: app-authenticated-dashboard
---
# Critique: Dashboard (app/(authenticated)/dashboard)

Method: dual-agent (A: design review, B: detector). Source-based; no live render.

## Design Health Score: 19/40 (Poor)
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | No page title, as-of date, or period labels; key charts collapsed |
| 2 | Match System / Real World | 2 | "Invoices Sent" counts outstanding; donut "Total" = all clients |
| 3 | User Control and Freedom | 2 | No period switch; overdue invoice rows aren't links |
| 4 | Consistency and Standards | 2 | Off-palette purple chart gradient; DollarSign icons in a multi-currency app |
| 5 | Error Prevention | 3 | Careful currency separation; undefined --chart-6 |
| 6 | Recognition Rather Than Recall | 2 | Definitions in non-focusable tooltips; warnings two disclosures deep |
| 7 | Flexibility and Efficiency | 1 | 2 quick actions, no Log time, no shortcuts, dead-end rows |
| 8 | Aesthetic and Minimalist Design | 2 | Revenue shown twice; 5 boilerplate "This is a summary of your..." descriptions |
| 9 | Error Recovery | 1 | Empty states give no next step; zero projects hides the KPI strip |
| 10 | Help and Documentation | 2 | Tooltips not reachable by keyboard or touch |

## Design Specificity Verdict
Generic. The design reads as a stock shadcn SaaS dashboard. The positioning ("project health and money, together") lives in lib/dashboard but never shows up in the layout. Progress, money, and invoices sit in three separate cards. The detector found 0 issues across 13 dashboard files and the shell, so the problems are about composition and meaning, not pattern-level slop.

## Priority Issues
- [P1] The dashboard doesn't deliver the positioning. There is no per-project health view (progress vs time burn vs budget, margin, unbilled). The dashboard doesn't query time entries. The priority badge never renders because `priority` is missing from the select. Command: shape, then layout.
- [P1] There is no hierarchy or entry point. The page has no h1. Revenue is duplicated (top-stats and financials). The 5 boilerplate descriptions read as filler. Quick Actions takes 25% of the width for 2 buttons. Financials is squeezed. Command: layout + distill.
- [P1] Accessibility: the chevron toggles are unnamed and have no aria-expanded. Collapsed panels are aria-hidden but their contents stay focusable. The info-icon tooltips can't be focused. The charts have no text alternative, and the pie labels are 7-9px with fill="black". Progress bars are unlabeled. Priority is shown only by a flag icon. Keyboard focus gets no styling. Command: harden.
- [P2] Mobile and loading: the skeleton uses fixed grid-cols-4/2, so it looks broken at 390px. Donut overlays use hard-coded top offsets. Multi-currency KPI values wrap badly. The overdue table scrolls sideways. Command: adapt.
- [P2] Labels and data semantics: "Invoices Sent" should be "Awaiting payment". The repeat-business chart mixes two denominators. The missed-contact check is inverted (isAfter now) and has the typo "missesd". Some formatting isn't locale-aware. Command: clarify.

## Persona Red Flags
- Alex: no shortcuts, overdue invoice rows aren't links, no "Send reminder", no "Log time", collapse state resets.
- Sam: no headings, unnamed buttons, focusable content inside aria-hidden panels, flag-only priority. The demo banner text is about 3.3:1.
- Hiring manager (3-min demo): can't see what makes it different. The best insight (client concentration warnings) is collapsed, the typo and boilerplate hurt credibility, and nothing pulls them into the project detail page.

## Minor Observations
The doc says KPI values use Fraunces serif, but the code renders them in sans and they have no tabular-nums. Card titles are grey in light mode and white in dark mode. A divide-x stray border appears on the mobile KPI grid. "+∞" shows when last month was 0. "Unbilled" means project value minus invoiced, not unbilled logged time. Avg Days to Pay has no unit.

## Questions to Consider
1. If the hero were one ranked list of "projects that need you, sorted by money at risk", which cards would still earn their place?
2. Why does the most useful sentence (one client = 62% of revenue) take two clicks and a hover to reach?
3. What single element would let a 5-second visitor say what Freelance OS does differently?
