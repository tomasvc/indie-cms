# Freelance OS

Freelance OS is a business management dashboard for independent contractors. Track projects, clients, invoices, and time in one place — with a dashboard that surfaces revenue, workload, and what needs attention.

Built with Next.js and Supabase. The repo is named `indie-cms`; the product is **Freelance OS**.

## Features

### Dashboard
- KPI cards for revenue, active projects, and outstanding invoices
- Financial charts (monthly revenue, client breakdown)
- Workload view across active projects
- Recent activity feed and overdue invoice alerts
- Quick actions for common tasks

### Projects
- List, create, and edit projects with status, priority, budget, and timeline
- Project detail view with progress, client info, tasks, time entries, and activity
- Task tracking per project (todo / in progress / done)

### Clients
- Client directory with contact details and billing history
- Per-client project and invoice views

### Invoices
- Create and manage invoices with line items, tax, and discounts
- Status workflow: draft → sent → paid / overdue / void
- Link invoices to projects and clients

### Account
- Email/password authentication (sign up, login, password reset)
- Guided onboarding for new users
- Profile and notification settings
- Light / dark theme

### Demo mode
- One-click demo login for trying the app without creating an account
- Requires a pre-configured demo user in Supabase (see [Environment variables](#environment-variables))

### Coming soon
- **Time & Earnings** — dedicated earnings view (`/earnings`)
- **Portfolio** — publishable project showcase (`/portfolio`)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js](https://nextjs.org) (App Router, Turbopack in dev) |
| Language | TypeScript |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com) |
| Backend | [Supabase](https://supabase.com) — Postgres, Auth, Row Level Security |
| Charts | [Recharts](https://recharts.org) |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| Fonts | Outfit, Fraunces, JetBrains Mono |

## Prerequisites

- Node.js 20+
- npm (or pnpm / yarn)
- A [Supabase](https://supabase.com) project

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/tomasvc/indie-cms.git
cd indie-cms
npm install
```

### 2. Configure environment variables

Create `.env.local` in the project root:

```env
# Required — from Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key

# Optional — demo account (server-only, not exposed to the browser)
DEMO_USER_EMAIL=demo@example.com
DEMO_USER_PASSWORD=your-demo-password

# Optional — use mock data on the dashboard (useful without a full DB)
NEXT_PUBLIC_USE_MOCK_DASHBOARD=false
```

> **Note:** This project uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Supabase's dashboard may label this as the anon key — either format works during the transition period. See [Supabase's publishable key announcement](https://github.com/orgs/supabase/discussions/29260).

### 3. Set up the database

Apply migrations to your Supabase project:

```bash
# Link your local CLI to the remote project (first time only)
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

Migrations live in `supabase/migrations/` and cover:

| Migration | Tables / changes |
|-----------|------------------|
| `20250302000000_create_profiles_onboarding` | `profiles`, signup trigger |
| `20260302114329_update_profiles_onboarding` | Onboarding column |
| `20260302120000_profiles_rls_policies` | Profile RLS fixes |
| `20260302140000_create_tasks` | `tasks` |
| `20260302150000_fix_tasks_trigger_updated_at` | Tasks trigger fix |
| `20260302160000_create_time_entries` | `time_entries` |
| `20260302170000_create_invoices` | `invoices`, `line_items` |
| `20260313164653_add_notes_and_unit_to_invoices` | Invoice notes & unit |

The app also expects `projects` and `clients` tables (referenced by invoices, tasks, and time entries). Ensure those exist in your Supabase schema — column shapes are defined in [`types/index.ts`](types/index.ts).

For local Supabase development:

```bash
npx supabase start
npx supabase db reset   # applies all migrations to the local instance
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/auth/login`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable / anon key |
| `DEMO_USER_EMAIL` | For demo | Email of the demo Supabase user |
| `DEMO_USER_PASSWORD` | For demo | Password for the demo user |
| `NEXT_PUBLIC_USE_MOCK_DASHBOARD` | No | Set to `true` to render the dashboard with mock data |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run watch` | Watch Tailwind CSS output (legacy path) |

## Project structure

```
app/
├── (authenticated)/     # Protected routes (sidebar layout)
│   ├── dashboard/       # KPIs, charts, workload, activity
│   ├── projects/        # Project list, detail, create, edit
│   ├── clients/         # Client list and detail
│   ├── invoices/        # Invoice list and creation
│   ├── settings/        # Profile, notifications, security
│   └── onboarding/      # First-run setup flow
├── auth/                # Login, sign-up, password reset, demo
└── globals.css          # Design tokens and global styles

components/
├── ui/                  # shadcn/ui primitives
└── …                    # App-level components (sidebar, forms, etc.)

lib/
├── actions/             # Server actions (CRUD for each domain)
├── data/                # Data-fetching helpers
├── dashboard/           # Dashboard aggregation logic
├── supabase/            # Supabase client, server, and session proxy
└── helpers/             # Formatting utilities

supabase/
└── migrations/          # SQL migrations

types/
└── index.ts             # Shared TypeScript domain types
```

## Authentication

Auth uses Supabase with cookie-based sessions via `@supabase/ssr`. Session refresh runs through `proxy.ts` at the root (Next.js 16 proxy convention).

Protected routes require a valid session. New users are redirected to `/onboarding` until they complete setup. The demo flow signs in via `/auth/demo` and sets a `demo` cookie.

## Design system

UI follows the Freelance OS design system: green-teal brand palette, semantic `--c-*` CSS tokens, and a type scale built on Outfit (UI), Fraunces (display), and JetBrains Mono (data). Design rules live in [`.cursor/rules/design-system.mdc`](.cursor/rules/design-system.mdc).

## Deployment

Deploy to [Vercel](https://vercel.com) or any Node.js host that supports Next.js:

1. Connect the repository
2. Set the environment variables from [Environment variables](#environment-variables)
3. Run `supabase db push` against your production Supabase project
4. Deploy — `npm run build` runs automatically on Vercel

## Contributing

This is a private project (`package.json` sets `"private": true`). If you are working on it locally, match existing patterns: server components for data fetching, server actions for mutations, and the established component / token conventions.
