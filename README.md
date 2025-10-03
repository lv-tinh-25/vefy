<p align="center">
  <img src="apps/web/src/app/icon.svg" width="72" height="72" alt="Vefy logo" />
</p>

<h1 align="center">Vefy</h1>

<p align="center">
  Personal vehicle management for cars and motorcycles — warranties, documents, oil changes, parts and expenses in one place.
</p>

<p align="center">
  <a href="https://vefy.vercel.app">Live demo</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#deployment">Deployment</a>
</p>

---

## Features

- **Garage** — manage multiple cars and motorcycles with brands tailored to the Vietnamese market.
- **Documents** — track warranty, registration inspection (cars) and insurance expiry dates.
- **Oil changes** — log changes, configure the cycle by km and time, and get a prediction of the next change based on your actual riding/driving rate.
- **AI odometer reading** — snap a photo of the dashboard and Google Gemini fills in the odometer (per-user daily limit, automatic model fallback).
- **Spare parts** — record installed parts and their warranty period.
- **Expenses** — per-vehicle and cross-vehicle spending with charts; oil changes and parts are added automatically.
- **Alerts & notifications** — expiring documents, part warranties and upcoming oil changes, dismissable per item.
- **Accounts** — email/password with verification and password reset, or Google sign-in; avatar upload; delete account.
- **Bilingual & themed** — Vietnamese / English UI, light and dark mode, mobile-first layout.

## Tech stack

| Layer | Tools |
| --- | --- |
| Monorepo | Turborepo, pnpm workspaces |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4, SWR, React Hook Form |
| Backend | Hono 4 mounted inside Next.js (`/api/*`), type-safe RPC client |
| Data | PostgreSQL on Supabase, Drizzle ORM, Zod schemas shared between client and server |
| Auth | better-auth (email/password, Google OAuth, DB-backed rate limiting) |
| Services | Google Gemini (OCR), Supabase Storage (avatars), Nodemailer over SMTP |
| Quality | TypeScript, ESLint, Vitest, GitHub Actions |

```
apps/
  web/        Next.js app — UI, and serves the API at /api/*
  api/        Hono routes, services and auth
packages/
  shared/     Zod schemas, constants, pure utils (alerts, oil prediction, dates)
  db/         Drizzle schema, migrations, Postgres client
  tsconfig/   Shared TypeScript configs
```

## Getting started

**Prerequisites:** Node.js 22 (see `.nvmrc`), pnpm 9 (`corepack enable`), a free [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/lv-tinh-25/vefy.git
cd vefy
pnpm install
cp .env.example .env      # fill in the values (see Configuration)
pnpm db:migrate           # create the tables in your database
pnpm dev                  # http://localhost:3000
```

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the app (UI + API) on port 3000 |
| `pnpm build` | Production build |
| `pnpm typecheck` | Type-check every package |
| `pnpm lint` | ESLint (zero warnings) |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm db:generate` | Generate a migration after changing the Drizzle schema |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Browse the database with Drizzle Studio |

## Configuration

All variables live in the root `.env`; `.env.example` documents each one.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Supabase Postgres — use the transaction pooler (port 6543) in production |
| `BETTER_AUTH_SECRET` | yes | Session signing key (`openssl rand -base64 32`) |
| `FRONTEND_URL` | local / custom domain | Public origin; detected automatically on Vercel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | yes | Verification and password-reset emails (e.g. Gmail + App Password) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | for avatars | Supabase Storage |
| `GEMINI_API_KEY` | for OCR | [Google AI Studio](https://aistudio.google.com/apikey) key |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | for Google sign-in | OAuth client; redirect URI `<origin>/api/auth/callback/google` |
| `CRON_SECRET` | production | Protects the daily keep-alive cron |
| `OCR_DAILY_LIMIT`, `OCR_COOLDOWN_SECONDS` | no | Override OCR limits (defaults 10/day, 10 s) |
| `GOOGLE_SITE_VERIFICATION` | no | Google Search Console token |

## Deployment

Vefy deploys to [Vercel](https://vercel.com) as a single Next.js app — frontend, API and auth share one origin.

1. Import the repository on Vercel and set **Root Directory** to `apps/web`.
2. Add the environment variables above (`FRONTEND_URL` is optional unless you use a custom domain).
3. Deploy. Every push to `master` updates production; pull requests get preview URLs.
4. Add `https://<your-domain>/api/auth/callback/google` to the Google OAuth client.

`apps/web/vercel.json` schedules a daily request to `/api/cron/keepalive` so the Supabase free tier is not paused for inactivity. Run `pnpm db:migrate` against the production database before deploying code that adds a migration.

CI (`.github/workflows/ci.yml`) runs typecheck, lint, tests and a production build on every pull request and push to `master`.

## License

[MIT](LICENSE) © 2025 Tinh Le V. DN
