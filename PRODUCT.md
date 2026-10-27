# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary audience today: evaluators of the work.** Freelance OS is a portfolio / showcase piece. The people who actually open it are prospective employers and clients judging the author's product, design, and engineering craft. Most of them arrive through the one-click demo login, spend a few minutes clicking around a seeded workspace, and never create an account.

**Modeled user (the persona the product is designed for):** an independent contractor (designer, developer, consultant) juggling several clients and projects at once. Their recurring jobs: see what needs attention, track project progress against time and budget, keep client records, and send and chase invoices.

Every surface has to work for both. It must be credible to a freelancer who knows the domain, and it must show its quality within a short demo session.

## Product Purpose

A business management workspace for independent contractors: projects, clients, tasks, time entries, and invoices in one place, with a dashboard that surfaces revenue, workload, and what needs attention.

Success right now: a reviewer who logs into the demo understands what the product does within seconds and leaves convinced of the author's craft. Every flow they try works end to end with believable data.

## Positioning

**Project health and money, together.** Most freelancer tools keep time tracking, project tracking, and billing in separate places. Freelance OS ties progress, time burn, and financials together per project, through financial health, margins, unbilled work, and revenue signals, so a freelancer can tell at a glance whether a project is going well, not only whether it is on schedule.

## Operating Context

- **Demo session is the main entry point.** `/auth/demo` signs into a pre-seeded demo user and sets a `demo` cookie. A demo banner and a demo-reset control exist (`components/demo-banner.tsx`, `components/demo-reset-button.tsx`). Before the demo user is replaced, its time entries and invoices are deleted.
- Real accounts: email/password sign-up → guided onboarding (`/onboarding`) → dashboard. Unauthenticated users are redirected to `/auth/login`. The auth screens carry a marketing panel (`components/auth-marketing-panel.tsx`).
- Usage scene for the modeled user: a desktop work session for planning and invoicing, plus quick checks on a phone (invoice status, what's overdue, logging time).

## Capabilities and Constraints

- **Domains:** Dashboard (KPIs, financial charts, workload, activity, overdue alerts, quick actions), Projects (status, priority, budget, timeline, tasks todo / in progress / done, time entries, activity, kanban), Clients (directory, billing history, per-client projects and invoices), Invoices (line items, tax, discounts; draft → sent → paid / overdue / void), Settings (profile, notifications, security), light/dark theme.
- **Coming soon (not built; don't present as working):** Time & Earnings (`/earnings`), Portfolio (`/portfolio`).
- **Multi-currency and locale are required.** Clients are billed in different currencies and locales. Money always goes through the currency-aware formatters (`lib/helpers/format.ts`). Never hard-code a currency symbol, number format, or date format.
- **Mobile matters.** Every authenticated surface must be fully usable at phone width, not just shrunk down.
- Stack (existing): Next.js App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Supabase (Postgres, Auth, RLS), Recharts, Framer Motion.
- Terminology: the product is **Freelance OS**. `indie-cms` is only the repo name and never appears in the UI.

## Brand Commitments

- Name: **Freelance OS**.
- The current green-teal palette and Outfit / Fraunces / JetBrains Mono type are the incumbent implementation (documented in `.cursor/rules/design-system.mdc`). When asked during init, the user chose **not** to make them binding commitments, so they can change in a deliberate redesign.

## Evidence on Hand

- Demo workspace data comes from the seeded demo user. `@faker-js/faker` is a dev dependency, and `NEXT_PUBLIC_USE_MOCK_DASHBOARD` renders the dashboard with mock data.
- No real customers, testimonials, usage numbers, or pricing exist. Never invent them, including on auth and marketing surfaces.

## Product Principles

1. **Understood within the demo.** A reviewer should see what each screen is for and what it does within seconds. Never leave a demo session on an empty, broken, or half-built screen.
2. **Health, not just status.** Wherever a project, client, or invoice appears, link its progress to time and money instead of showing either one alone.
3. **Domain-credible.** Data, wording, and workflows should feel right to a working freelancer: real invoice lifecycles, real currency handling, believable numbers.
4. **Every viewport, every user.** Phone-width use and accessibility are part of the quality being shown, not extras.
5. **Honest about scope.** Unfinished features are clearly marked as coming soon, never faked.

## Accessibility & Inclusion

- WCAG 2.1 AA is the required standard: contrast in both light and dark themes, full keyboard operation (including kanban and keyboard navigation of lists and tables), visible focus, accessible charts and status indicators that don't rely on color alone, and touch targets of at least 44px on mobile.
- Locale-aware formatting of money, numbers, and dates for international users.
