# Vefy — Vehicle Management App

## Overview

Personal vehicle management app for cars and motorcycles, targeting the Vietnamese market. Tracks warranties, documents, oil change schedules, spare parts, expenses, automatic alerts/notifications, predicts the next oil change, and uses AI OCR to read the odometer from photos.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind v4 + SWR + React Hook Form
- **Backend**: Hono 4 (TypeScript REST API with RPC type-safe client), served from inside the Next.js app
- **Database**: Drizzle ORM + PostgreSQL (Supabase)
- **Validation**: Zod (shared FE/BE)
- **Auth**: better-auth 1.6 (email/password + Google OAuth, Drizzle adapter, DB-backed rate limiting)
- **AI/OCR**: Google Gemini (`@google/genai`, `gemini-2.5-flash` with fallback to `gemini-2.5-flash-lite` on quota errors)
- **Storage**: Supabase Storage (avatar uploads)
- **Mail**: nodemailer over SMTP (Gmail App Password) — email verification + password reset

## Monorepo Structure

```
vefy/
├── apps/
│   ├── web/              # Next.js 15 — port 3000; also serves the API at /api/*
│   └── api/              # Hono app (routes, services, auth); imported by web
├── packages/
│   ├── shared/           # Zod schemas, constants, utils (alerts, oil prediction, dates, expense stats)
│   ├── db/               # Drizzle schema, migrations, PostgreSQL client
│   └── tsconfig/         # Shared TypeScript configs
```

### Package Dependencies

```
@vefy/tsconfig  ←  all packages/apps
@vefy/shared    ←  @vefy/db, @vefy/api, @vefy/web
@vefy/db        ←  @vefy/api
@vefy/api       ←  @vefy/web (runtime dependency: mounted as the /api route handler)
```

## Commands

```bash
pnpm dev              # Next.js on http://localhost:3000 (UI + API)
pnpm build            # Build all packages
pnpm typecheck        # tsc --noEmit in every package
pnpm lint             # ESLint (web, zero warnings allowed)
pnpm test             # Vitest (shared utils, API services)
pnpm db:generate      # Generate Drizzle migration files
pnpm db:migrate       # Apply migrations to Supabase
pnpm db:studio        # Open Drizzle Studio (DB GUI)

pnpm --filter @vefy/api dev:standalone   # Optional: run the Hono API alone on port 3001
```

## Key Architecture Decisions

- **Single origin**: `apps/web/src/app/api/[...route]/route.ts` mounts the Hono app via `hono/vercel`. Frontend, API and auth cookies share one domain — no CORS/cookie cross-site issues. `next.config.ts` loads the root `.env` and transpiles `@vefy/*` packages.
- **Hono RPC client**: `AppType` exported from `apps/api/src/app.ts`, consumed by `apps/web/src/lib/api.ts` via `hc<AppType>("/")`. Full type-safety from API definition to frontend. Give explicit status codes on every `c.json(...)` so the client can narrow by `res.status`.
- **Zod schemas in `@vefy/shared`, Drizzle schemas in `@vefy/db`**: Intentionally separate. Zod = API contract, Drizzle = DB structure. Service layer maps between them.
- **Alert computation is pure functions in `@vefy/shared`**: Can run server-side and client-side without DB calls.
- **Dates are calendar strings in `Asia/Ho_Chi_Minh`**: Use `todayDateStr`, `daysUntil`, `daysBetweenDates`, `addMonthsToDate` from `@vefy/shared` — never `toISOString().slice(0, 10)` or local-time `Date` math (breaks between 00:00–07:00 VN and differs between local and UTC servers).
- **Auth via better-auth**: session cookie (7-day expiry, 24h refresh; `__Secure-` prefixed on HTTPS — middleware checks both names). `requireAuth` sets `userId` on the Hono context.
- **Ownership checks are enforced in the backend**: `requireVehicleOwner` in `routes/vehicles.ts` guards `/api/vehicles/:id` and every nested route (returns 404 for other users' vehicles); nested deletes also filter by `vehicleId`.
- **DB client**: `postgres` with `prepare: false` (Supabase transaction pooler compatible) and a pool cached on `globalThis` in dev so Next HMR doesn't leak connections.
- **App origin** (`apps/api/src/lib/origin.ts`): Vercel preview URL → `FRONTEND_URL` → Vercel production domain → localhost. Used by auth, CORS and SEO, so `FRONTEND_URL` is optional on Vercel.
- **Vehicle tabs are static**: `app/vehicle/[id]/layout.tsx` returns `[]` from `generateStaticParams`, so each vehicle's shell is rendered once and cached; `<Link>` then prefetches whole tabs and switching is instant. Pages there must stay client-only (data via SWR) — no `cookies()`/`headers()`/server data fetching.
- **SWR feedback**: `SWRActivityProvider` (`lib/swr-activity.tsx`) drives the thin top `RefreshIndicator` while a hook refetches over existing data. Mutating dialogs `await` the revalidation before closing so they never close onto stale data.
- **Third-party clients are created lazily** (Supabase, Gemini) so importing the API never throws during `next build` when env vars are missing.
- **No `.js` extensions in imports**: tsx and drizzle-kit require extensionless imports.

## Deploy, CI & SEO

- **Vercel**: Git integration on project `vefy` — pushes to `master` deploy to production, other branches/PRs get preview URLs. Root directory `apps/web` (pnpm workspace is auto-detected); Node version comes from `.nvmrc` (22). Set the env vars listed below (`DATABASE_URL` must be the Supabase transaction pooler, port 6543; generate fresh `BETTER_AUTH_SECRET` and `CRON_SECRET`). Run `pnpm db:migrate` locally before pushing code that needs a new migration.
- **Cron**: `apps/web/vercel.json` schedules `GET /api/cron/keepalive` daily (guarded by `CRON_SECRET`, which Vercel sends as a Bearer token) so Supabase's free tier doesn't pause.
- **Google OAuth**: register `https://<domain>/api/auth/callback/google` alongside the localhost URI. Preview deployments have changing URLs, so Google sign-in only works on production (email/password works everywhere).
- **Search Console**: HTML-tag verification via `GOOGLE_SITE_VERIFICATION`, then submit `/sitemap.xml`.
- **CI**: `.github/workflows/ci.yml` runs install (frozen lockfile) → typecheck → lint → test → web build on pushes to `master` and PRs.
- **SEO**: root metadata (title template, Open Graph, `GOOGLE_SITE_VERIFICATION`), `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`, `icon.svg`. Only `/auth/login` and `/auth/register` are indexable; every other route sets `noindex`. Client pages get titles from a small server `layout.tsx` per route. New public files must be added to the middleware matcher exclusions.

## Git Workflow

- Repository: `github.com/lv-tinh-25/vefy`, main branch `master`. Work on a feature branch, merge into `master` when approved.
- Agents only commit locally. Never push, add remotes, or deploy — the owner pushes.
- Commit messages follow Conventional Commits (`feat(scope): …`, `fix: …`, `chore: …`), in English.
- The commit identity is set in the repo-local git config. Do not add `Co-Authored-By` trailers for AI assistants — an authorship preference, not concealment; AI tooling stays in the repo (`CLAUDE.md`, `.claude/`, `development_guidelines/`).

## Database Tables

**App tables:**
- `vehicles` — 18 columns (id, userId, type, variant, name, brand, model, year, licensePlate, color, warranty/registration/insurance expiry, timestamps; the legacy `oil_cycle_*` columns are unused and pending a drop)
- `oil_changes` — 9 columns (id, vehicleId FK cascade, kind, date, odometer, cost, oilType, note, createdAt)
- `vehicle_oil_settings` — 6 columns (vehicleId FK cascade, kind, enabled, cycleKm, useDays, cycleDays); PK (vehicleId, kind). Only overrides are stored; missing kinds use `OIL_KIND_DEFAULTS`
- `parts` — 10 columns (id, vehicleId FK cascade, name, installDate, warrantyMonths, warrantyExpiry, odometer, cost, note, createdAt)
- `expenses` — 10 columns (id, vehicleId FK cascade, oilChangeId/partId FK cascade, date, amount, category `part|other`, name, note, createdAt). Rows linked to an oil change/part are auto-created and read-only.
- `dismissed_alerts` — 4 columns (id, userId, alertKey, dismissedAt); unique (userId, alertKey)
- `ocr_usage` — 4 columns (userId, date, count, lastAt); PK (userId, date)

**better-auth tables (auto-managed):**
- `user` — 8 columns (id, email, name, image, emailVerified, profileCompleted, timestamps)
- `session` — 8 columns (id, userId FK, token, expiresAt, ipAddress, userAgent, timestamps)
- `account` — 13 columns (email/password credentials + OAuth providers)
- `verification` — 6 columns (password reset tokens; email verification tokens are stateless JWTs)
- `rate_limit` — 4 columns (id, key, count, lastRequest)

## API Endpoints

```
ALL    /api/auth/*                                    # better-auth (sign-in/up, OAuth, verify email, reset password, ...)
GET    /api/health
GET    /api/cron/keepalive                          # Vercel Cron, Bearer CRON_SECRET

# Profile & upload (auth required)
GET    /api/profile/me
PATCH  /api/profile/complete
PATCH  /api/profile/update
POST   /api/upload/avatar
DELETE /api/upload/avatar

# Vehicles (auth required, ownership-checked)
GET    /api/vehicles
GET    /api/vehicles/:id
POST   /api/vehicles
PATCH  /api/vehicles/:id                            # 409 VARIANT_LOCKED when changing variant after oil history exists
DELETE /api/vehicles/:id

GET    /api/vehicles/:vehicleId/oil-changes
POST   /api/vehicles/:vehicleId/oil-changes           # { date, odometer, note, items: [{ kind, cost, oilType }] } — one record per item
DELETE /api/vehicles/:vehicleId/oil-changes/:id
PUT    /api/vehicles/:vehicleId/oil-settings          # per-kind cycles

GET    /api/vehicles/:vehicleId/parts
POST   /api/vehicles/:vehicleId/parts
DELETE /api/vehicles/:vehicleId/parts/:id

GET    /api/vehicles/:vehicleId/expenses
GET    /api/vehicles/:vehicleId/expenses/summary
POST   /api/vehicles/:vehicleId/expenses              # "other" expenses only
DELETE /api/vehicles/:vehicleId/expenses/:id

# Cross-vehicle (auth required)
GET    /api/expenses
GET    /api/expenses/summary
GET    /api/notifications
POST   /api/notifications/dismiss
POST   /api/notifications/dismiss-all

# OCR (auth required, per-user limits)
POST   /api/ocr/read-odometer   # 200 ok/unreadable · 429 OCR_DAILY_LIMIT|OCR_COOLDOWN · 503 OCR_UNAVAILABLE
```

## Frontend Pages

**Public / auth flow:**
- `/` — redirects to `/garage` (middleware sends guests to `/auth/login`)
- `/auth/login` — email/password + Google OAuth; unverified accounts are sent to `/auth/verify-email?from=login`
- `/auth/register` — email signup
- `/auth/verify-email` — "check your email" + resend button (60s cooldown)
- `/auth/forgot-password` — request a reset link
- `/auth/reset-password` — set a new password from the emailed link (handles expired/used links)
- `/auth/complete-profile` — name/avatar setup after signup (skipped if already completed)

**Authenticated:**
- `/garage` — vehicle list, add vehicle
- `/expenses` — expenses across all vehicles
- `/account` — profile, language/theme, change password, logout all devices, delete account
- `/vehicle/[id]/overview` — status cards, oil prediction, ⋮ menu (delete vehicle)
- `/vehicle/[id]/documents` — edit vehicle info, warranty/registration/insurance dates
- `/vehicle/[id]/oil` — per-kind cycle settings and predictions, add several kinds at one odometer reading, history filtered by kind, OCR (hidden for electric motorcycles)
- `/vehicle/[id]/parts` — add/list parts with warranty tracking
- `/vehicle/[id]/expenses` — per-vehicle expenses, chart, "other" expenses

The user menu holds notifications (swipe or "dismiss all"), theme, language, expenses, account settings and logout.

## Business Logic

### Vehicle Types
- **Car** (`car`): has registration inspection
- **Motorcycle** (`motorcycle`): no registration inspection; `variant` is `manual`, `scooter` or `electric` (required on create; legacy rows without one count as manual). The variant can't change once the vehicle has oil changes

### Oil Kinds (`OIL_KIND_DEFAULTS` in `@vefy/shared`)
| Profile | Kind | Default km | Time limit (default) | Enabled by default |
|---|---|---|---|---|
| Car | engine | 5,000 | off · 180 days | yes |
| Car | transmission | 60,000 | off · 730 days | yes |
| Car | brake | 40,000 | **on** · 730 days | yes |
| Car | power_steering | 60,000 | off · 730 days | no |
| Car | differential | 40,000 | off · 730 days | no |
| Manual / scooter | engine | 2,000 | off · 90 days | yes |
| Scooter | gear | 6,000 | off · 180 days | yes |

Electric motorcycles have no oil kinds.

### Brand Groups (Vietnam market)
- Cars: Popular, Chinese, Luxury, Other
- Motorcycles: Popular (gasoline), Electric, Big displacement, Other

### Alert System
| Type | Warning threshold | Applies to |
|---|---|---|
| Warranty, Registration, Insurance | ≤ 30 days remaining | Documents |
| Part warranty | ≤ 30 days remaining | Parts |
| Oil change | ≤ 14 days remaining | Oil prediction |

### Oil Prediction Formula
- Computed per enabled kind from that kind's newest record and its own cycle
- `avgKmPerDay = totalKm / totalDays` across **every** oil change of the vehicle, whatever the kind (needs ≥ 2 records); the vehicle drives the same distance whichever fluid was changed
- `estimatedOdo = newestOfKind.odo + avgKmPerDay × daysSince`
- `effectiveDaysRemaining = min(daysUntilByKm, daysUntilByTime)`; the time limit alone works from a single record
- Alert keys are per kind; engine oil keeps the pre-kinds key format so earlier dismissals still apply

### Part Warranty
- `warrantyExpiry = installDate + warrantyMonths` (clamped to month end, e.g. Jan 31 + 1 month = Feb 28)

### Auth Emails
- Verification and password-reset links expire after 30 minutes; reset links are single-use
- Password reset revokes all sessions
- Verification/reset emails limited to 3 per hour per IP (better-auth rate limit, stored in `rate_limit`)

### OCR Limits
- 10 scans per user per day (VN calendar day), at least 10 seconds between scans
- A scan counts whenever Gemini is called, even if the odometer can't be read
- If both Gemini models are unavailable, the scan is refunded (cooldown still applies)

## Development Guidelines

For detailed development guidelines, refer to:

- **Frontend Development**: `development_guidelines/AI_FE_DEV_FLOW.md`
- **Backend Development**: `development_guidelines/AI_BE_DEV_FLOW.md`
- **Full-Stack Integration**: `development_guidelines/AI_FULLSTACK_DEV_FLOW.md`

## Environment Variables

All in the root `.env` (loaded by `next.config.ts`; see `.env.example`).

```
# Database
DATABASE_URL             — Supabase PostgreSQL connection string (use the transaction pooler, port 6543, on serverless)

# Auth (better-auth)
BETTER_AUTH_SECRET       — session signing key
FRONTEND_URL             — public origin of the web app; optional on Vercel (see App origin)
BETTER_AUTH_URL          — optional; defaults to FRONTEND_URL
GOOGLE_CLIENT_ID         — Google OAuth client ID
GOOGLE_CLIENT_SECRET     — Google OAuth client secret (redirect URI: <origin>/api/auth/callback/google)

# Email
SMTP_HOST / SMTP_PORT    — e.g. smtp.gmail.com / 465 (port 465 enables TLS)
SMTP_USER / SMTP_PASS    — Gmail address / App Password
SMTP_FROM                — "Name <same Gmail address>"

# Storage (Supabase)
SUPABASE_URL             — Supabase project URL
SUPABASE_SERVICE_KEY     — Supabase service role key (server-side avatar upload)

# AI / OCR
GEMINI_API_KEY           — Google AI Studio API key
OCR_DAILY_LIMIT          — optional, default 10
OCR_COOLDOWN_SECONDS     — optional, default 10

# Deploy / SEO
CRON_SECRET              — Vercel Cron bearer token for /api/cron/keepalive
GOOGLE_SITE_VERIFICATION — optional, Search Console HTML-tag token
```
