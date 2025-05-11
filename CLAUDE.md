# Vefy — Vehicle Management App

## Overview

Personal vehicle management app for cars and motorcycles, targeting the Vietnamese market. Tracks warranties, documents, oil change schedules, spare parts, automatic alerts, and uses AI to predict next oil change + OCR to read odometer from photos.

## Tech Stack

- **Monorepo**: Turborepo + pnpm
- **Frontend**: Next.js 15 (App Router) + React 19 + Tailwind v4 + SWR + React Hook Form
- **Backend**: Hono 4 (TypeScript REST API with RPC type-safe client)
- **Database**: Drizzle ORM + PostgreSQL (Supabase)
- **Validation**: Zod (shared FE/BE)
- **Auth**: better-auth 1.6 (email/password + Google OAuth, Drizzle adapter)
- **AI/OCR**: Google Gemini (`@google/genai`, model `gemini-2.5-flash`)
- **Storage**: Supabase Storage (avatar uploads)
- **Mail**: nodemailer (SMTP — email verification)

## Monorepo Structure

```
vefy/
├── apps/
│   ├── web/              # Next.js 15 — port 3000
│   └── api/              # Hono API — port 3001
├── packages/
│   ├── shared/           # Zod schemas, constants, utils (alerts, oil prediction)
│   ├── db/               # Drizzle schema + PostgreSQL client
│   └── tsconfig/         # Shared TypeScript configs
```

### Package Dependencies

```
@vefy/tsconfig  ←  all packages/apps
@vefy/shared    ←  @vefy/db, @vefy/api, @vefy/web
@vefy/db        ←  @vefy/api
@vefy/api       ←  @vefy/web (devDep, only for AppType)
```

## Commands

```bash
pnpm dev              # Run web + api concurrently
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm db:generate      # Generate Drizzle migration files
pnpm db:migrate       # Apply migrations to Supabase
pnpm db:studio        # Open Drizzle Studio (DB GUI)
```

## Key Architecture Decisions

- **Zod schemas in `@vefy/shared`, Drizzle schemas in `@vefy/db`**: Intentionally separate. Zod = API contract, Drizzle = DB structure. Service layer maps between them.
- **Alert computation is pure functions in `@vefy/shared`**: Can run server-side and client-side without DB calls.
- **Hono RPC client**: `AppType` exported from `apps/api/src/app.ts`, consumed by `apps/web/src/lib/api.ts` via `hc<AppType>()`. Full type-safety from API definition to frontend.
- **No `.js` extensions in imports**: tsx and drizzle-kit require extensionless imports.
- **`dotenv-cli`** loads root `.env` for turbo tasks and API dev server.
- **Auth via better-auth**: session stored in cookie (7-day expiry, 24h refresh). `requireAuth` middleware reads session and sets `userId` on context. All vehicle-scoped routes are protected and ownership-checked.

## Database Tables

**App tables:**
- `vehicles` — 17 columns (id, userId, type, name, brand, model, year, licensePlate, color, warranty/registration/insurance expiry, oil cycle settings, timestamps)
- `oil_changes` — 7 columns (id, vehicleId FK cascade, date, odometer, oilType, note, createdAt)
- `parts` — 9 columns (id, vehicleId FK cascade, name, installDate, warrantyMonths, warrantyExpiry, odometer, note, createdAt)

**better-auth tables (auto-managed):**
- `user` — 8 columns (id, email, name, image, emailVerified, profileComplete, timestamps)
- `session` — 7 columns (id, userId FK, token, expiresAt, ipAddress, userAgent, timestamps)
- `account` — 10 columns (email/password credentials + OAuth providers)
- `verification` — 5 columns (email verification tokens)

## API Endpoints

```
ALL    /api/auth/*                                    # better-auth (sign-in, sign-up, OAuth, verify, etc.)
GET    /api/health

# Profile (auth required)
GET    /api/profile/me
PATCH  /api/profile/complete
PATCH  /api/profile/update

# Upload (auth required)
POST   /api/upload/avatar
DELETE /api/upload/avatar

# Vehicles (auth required, ownership-checked)
GET    /api/vehicles
GET    /api/vehicles/:id
POST   /api/vehicles
PATCH  /api/vehicles/:id
DELETE /api/vehicles/:id

# Oil changes (auth required)
GET    /api/vehicles/:vehicleId/oil-changes
POST   /api/vehicles/:vehicleId/oil-changes
DELETE /api/vehicles/:vehicleId/oil-changes/:id

# Parts (auth required)
GET    /api/vehicles/:vehicleId/parts
POST   /api/vehicles/:vehicleId/parts
DELETE /api/vehicles/:vehicleId/parts/:id

# OCR (auth required)
POST   /api/ocr/read-odometer
```

## Frontend Pages

**Public / auth flow:**
- `/` — landing
- `/auth/login` — email/password + Google OAuth
- `/auth/register` — email signup
- `/auth/verify-email` — email verification landing
- `/auth/complete-profile` — name/avatar setup after signup (or after Google OAuth if missing)

**Authenticated:**
- `/garage` — vehicle list, add vehicle, global alerts
- `/account` — profile settings (name, avatar, account deletion)
- `/vehicle/[id]/overview` — alerts, status cards, oil prediction
- `/vehicle/[id]/documents` — edit vehicle info, warranty/registration/insurance dates
- `/vehicle/[id]/oil` — oil cycle settings, AI prediction, add/list oil changes, OCR
- `/vehicle/[id]/parts` — add/list parts with warranty tracking

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
| Oil change | ≤ 14 days remaining | Oil (AI prediction) |

### Oil Prediction Formula
- Requires ≥ 2 oil change records
- `avgKmPerDay = totalKm / totalDays` (across full history)
- `estimatedOdo = newest.odo + avgKmPerDay × daysSince`
- `effectiveDaysRemaining = min(daysUntilByKm, daysUntilByTime)`

## Development Guidelines

For detailed development guidelines, refer to:

- **Frontend Development**: `development_guidelines/AI_FE_DEV_FLOW.md`
- **Backend Development**: `development_guidelines/AI_BE_DEV_FLOW.md`
- **Full-Stack Integration**: `development_guidelines/AI_FULLSTACK_DEV_FLOW.md`

## Environment Variables

```
# Database
DATABASE_URL             — Supabase PostgreSQL connection string

# Auth (better-auth)
BETTER_AUTH_SECRET       — session signing key
FRONTEND_URL             — frontend base URL (for auth redirects)
GOOGLE_CLIENT_ID         — Google OAuth client ID
GOOGLE_CLIENT_SECRET     — Google OAuth client secret

# Email (verification)
SMTP_HOST                — SMTP host (e.g. Mailtrap)
SMTP_PORT                — SMTP port
SMTP_USER                — SMTP username
SMTP_PASS                — SMTP password
SMTP_FROM                — "From" address on outgoing mail

# Storage (Supabase)
SUPABASE_URL             — Supabase project URL
SUPABASE_SERVICE_KEY     — Supabase service role key (server-side avatar upload)

# AI / OCR
GEMINI_API_KEY           — Google Gemini API key (odometer OCR)

# Frontend
NEXT_PUBLIC_API_URL      — API base URL (default: http://localhost:3001)
```
