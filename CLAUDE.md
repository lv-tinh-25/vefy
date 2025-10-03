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
pnpm lint             # Lint all packages
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
- **No `.js` extensions in imports**: tsx and drizzle-kit require extensionless imports.

## Database Tables

**App tables:**
- `vehicles` — 17 columns (id, userId, type, name, brand, model, year, licensePlate, color, warranty/registration/insurance expiry, oil cycle settings, timestamps)
- `oil_changes` — 8 columns (id, vehicleId FK cascade, date, odometer, cost, oilType, note, createdAt)
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
PATCH  /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/vehicles/:vehicleId/oil-changes
POST   /api/vehicles/:vehicleId/oil-changes
DELETE /api/vehicles/:vehicleId/oil-changes/:id

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
- `/vehicle/[id]/oil` — oil cycle settings, prediction, add/list oil changes, OCR
- `/vehicle/[id]/parts` — add/list parts with warranty tracking
- `/vehicle/[id]/expenses` — per-vehicle expenses, chart, "other" expenses

The user menu holds notifications (swipe or "dismiss all"), theme, language, expenses, account settings and logout.

## Business Logic

### Vehicle Types
- **Car** (`car`): has registration inspection, default oil cycle 5,000 km / 180 days
- **Motorcycle** (`motorcycle`): no registration inspection, default oil cycle 1,500 km / 90 days

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
- Requires ≥ 2 oil change records
- `avgKmPerDay = totalKm / totalDays` (across full history)
- `estimatedOdo = newest.odo + avgKmPerDay × daysSince`
- `effectiveDaysRemaining = min(daysUntilByKm, daysUntilByTime)`

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
FRONTEND_URL             — public origin of the web app (auth base URL + redirects)
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
```
