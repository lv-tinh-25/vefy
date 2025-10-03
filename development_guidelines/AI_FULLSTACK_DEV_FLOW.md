# Full-Stack Integration Development Flow

This document contains integration principles, patterns, and examples for working across both frontend and backend in the Vefy project.

For stack-specific details, refer to:
- Frontend: `AI_FE_DEV_FLOW.md`
- Backend: `AI_BE_DEV_FLOW.md`

---

## Integration Principles (MANDATORY)

### 1. Shared Package First - The Single Source of Truth

Always check `@vefy/shared` before creating new code. The shared package is the source of truth for:

- **Validation Schemas (Zod)**: Form validation rules that must match between FE and BE
- **Types**: API contracts, interfaces (Vehicle, OilChange, Part, Alert, OilPrediction)
- **Constants**: Oil cycle defaults, alert thresholds, vehicle colors, brand groups
- **Utils**: Alert computation, oil prediction algorithm

```typescript
// CORRECT Flow
// 1. Check shared package first
import { insertVehicleSchema, type InsertVehicle } from "@vefy/shared"

// 2. Frontend uses schema directly with React Hook Form
const form = useForm<InsertVehicle>({
  resolver: zodResolver(insertVehicleSchema),
})

// 3. Backend uses same schema with Hono zValidator
app.post("/", zValidator("json", insertVehicleSchema), async (c) => {
  const data = c.req.valid("json") // Same type as frontend form
})
```

### 2. Type-Safe API Contract via Hono RPC

The API app type flows from backend to frontend:

```typescript
// Backend: apps/api/src/app.ts
const app = new Hono()
  .get("/api/vehicles", async (c) => { /* ... */ })
  .post("/api/vehicles", zValidator("json", insertVehicleSchema), async (c) => { /* ... */ })

export type AppType = typeof app // <-- The contract

// Frontend: apps/web/src/lib/api.ts
import { hc } from "hono/client"
import type { AppType } from "@vefy/api/client"

// The API is mounted inside the Next app, so the client calls the same origin
export const api = hc<AppType>("/")

// Usage - fully typed, autocomplete for routes and params
const res = await api.api.vehicles.$get()
const vehicles = await res.json() // Return type inferred from backend
```

### 3. Separation of Concerns

```
Frontend (apps/web/src/)
├── app/                → Pages (App Router), layout, routing
├── components/         → UI ONLY (JSX, Tailwind classes)
├── lib/
│   ├── api.ts          → Hono RPC client instance
│   ├── hooks/          → SWR hooks + UI logic
│   └── utils.ts        → cn(), formatDate(), formatNumber()

Backend (apps/api/src/)
├── app.ts              → Hono app, routes composition, AppType export
├── routes/             → HTTP layer (validation, params, response)
├── services/           → Business logic (DB queries, computation)

Shared (packages/shared/src/)
├── schemas/            → Zod validation (shared BE & FE)
├── types/              → Interfaces (Vehicle, OilChange, Part, Alert)
├── constants/          → Defaults, thresholds, brand lists, colors
└── utils/              → Alert computation, oil prediction
```

### 4. Data Flow: DB -> Service -> Route -> Frontend

```
Drizzle Schema (packages/db)
  ↓ DB Row (Drizzle inferred type)
Service Layer (apps/api/src/services/)
  ↓ toVehicle() mapping → Vehicle (shared type)
Route Layer (apps/api/src/routes/)
  ↓ c.json(vehicle) → HTTP Response
Hono RPC Client (apps/web/src/lib/api.ts)
  ↓ api.api.vehicles.$get() → typed response
SWR Hook (apps/web/src/hooks/)
  ↓ useSWR() → { data, error, mutate }
Component (apps/web/src/components/)
  ↓ props → JSX rendering
```

### 5. Validation Consistency

Same Zod schema validates on both sides:

```typescript
// packages/shared/src/schemas/vehicle.ts
export const insertVehicleSchema = z.object({
  type: z.enum(["car", "motorcycle"]),
  brand: z.string().min(1, "Vui long chon hang xe"),
  model: z.string().min(1, "Vui long nhap ten xe"),
  // ...
})

// Backend validates request body
app.post("/", zValidator("json", insertVehicleSchema), ...)

// Frontend validates form input
useForm<InsertVehicle>({ resolver: zodResolver(insertVehicleSchema) })
```

---

## Full-Stack Feature Implementation Workflow

### Phase 1: Discovery & Analysis

1. **Analyze Shared Package** - Check existing schemas, constants, types in `packages/shared/`
2. **Analyze Database** - Read Drizzle schema in `packages/db/src/schema/`
3. **Analyze Backend** - Check existing routes and services in `apps/api/src/`
4. **Analyze Frontend** - Check existing components, hooks, pages in `apps/web/src/`
5. **Task Requirements** - Identify endpoints, business logic, UI components needed

### Phase 2: Shared Package Setup

6. **Create/Update Shared Resources**:
   - Zod schemas in `packages/shared/src/schemas/`
   - Types in `packages/shared/src/types/` (or inferred from schemas)
   - Constants in `packages/shared/src/constants/`
   - Utils in `packages/shared/src/utils/`
   - Export from `packages/shared/src/index.ts`
7. **Build shared package**: `pnpm --filter @vefy/shared build`

### Phase 3: Database (if needed)

8. **Update Drizzle Schema** in `packages/db/src/schema/`
9. **Export from index** in `packages/db/src/schema/index.ts`
10. **Generate migration**: `pnpm db:generate`
11. **Apply migration**: `pnpm db:migrate`

### Phase 4: Backend Implementation

12. **Service Layer** - Create/update service functions in `apps/api/src/services/`
13. **Route Layer** - Create/update routes with zValidator in `apps/api/src/routes/`
14. **Register Route** - Mount in `apps/api/src/app.ts`
15. **Test API** - Verify endpoints return correct data

### Phase 5: Frontend Implementation

16. **SWR Hook** - Create data fetching hook in `apps/web/src/hooks/<feature>/`
17. **Components** - Create UI components in `apps/web/src/components/`
18. **Form Hook** - Create form logic hook with shared schema
19. **Page** - Compose in App Router page
20. **Verify** - Test full flow in browser

---

## Full-Stack Example: Adding a New Feature (e.g., Service Records)

### 1. Shared Package

```typescript
// packages/shared/src/schemas/service-record.ts
import { z } from "zod"

export const insertServiceRecordSchema = z.object({
  vehicleId: z.string().uuid(),
  type: z.enum(["maintenance", "repair", "inspection"]),
  date: z.string(),
  odometer: z.number().int().positive().optional(),
  cost: z.number().positive().optional(),
  description: z.string().min(1),
  note: z.string().optional(),
})

export type InsertServiceRecord = z.infer<typeof insertServiceRecordSchema>

export interface ServiceRecord extends InsertServiceRecord {
  id: string
  createdAt: string
}
```

### 2. Database Schema

```typescript
// packages/db/src/schema/service-records.ts
import { pgTable, uuid, varchar, integer, numeric, text, timestamp, pgEnum } from "drizzle-orm/pg-core"
import { vehicles } from "./vehicles"

export const serviceTypeEnum = pgEnum("service_type", ["maintenance", "repair", "inspection"])

export const serviceRecords = pgTable("service_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  vehicleId: uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" }),
  type: serviceTypeEnum("type").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  odometer: integer("odometer"),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  description: text("description").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

### 3. Backend Service

```typescript
// apps/api/src/services/service-record.service.ts
import { db } from "@vefy/db"
import { serviceRecords } from "@vefy/db"
import { eq, desc } from "drizzle-orm"
import type { ServiceRecord, InsertServiceRecord } from "@vefy/shared"

function toServiceRecord(row: typeof serviceRecords.$inferSelect): ServiceRecord {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    type: row.type,
    date: row.date,
    odometer: row.odometer ?? undefined,
    cost: row.cost ? Number(row.cost) : undefined,
    description: row.description,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listByVehicle(vehicleId: string) {
  const rows = await db
    .select()
    .from(serviceRecords)
    .where(eq(serviceRecords.vehicleId, vehicleId))
    .orderBy(desc(serviceRecords.date))
  return rows.map(toServiceRecord)
}

export async function create(vehicleId: string, data: InsertServiceRecord) {
  const [row] = await db
    .insert(serviceRecords)
    .values({ ...data, vehicleId })
    .returning()
  return toServiceRecord(row)
}
```

### 4. Backend Route

```typescript
// apps/api/src/routes/service-records.ts
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { insertServiceRecordSchema } from "@vefy/shared"
import * as serviceRecordService from "../services/service-record.service"

export const serviceRecordRoutes = new Hono()
  .get("/", async (c) => {
    const vehicleId = c.req.param("vehicleId")
    const records = await serviceRecordService.listByVehicle(vehicleId)
    return c.json(records)
  })
  .post("/", zValidator("json", insertServiceRecordSchema), async (c) => {
    const vehicleId = c.req.param("vehicleId")
    const data = c.req.valid("json")
    const record = await serviceRecordService.create(vehicleId, data)
    return c.json(record, 201)
  })
```

### 5. Frontend Hook

```typescript
// apps/web/src/hooks/vehicles/useServiceRecords.ts
import useSWR from "swr"
import { api } from "@/lib/api"

export function useServiceRecords(vehicleId: string) {
  const { data, error, mutate } = useSWR(
    vehicleId ? `service-records-${vehicleId}` : null,
    async () => {
      const res = await api.api.vehicles[":vehicleId"]["service-records"].$get({
        param: { vehicleId },
      })
      return res.json()
    }
  )

  return { records: data ?? [], isLoading: !data && !error, mutate }
}
```

### 6. Frontend Page (Pure UI)

```typescript
// app/vehicle/[id]/services/page.tsx
"use client"
import { useServiceRecords } from "@/hooks/vehicles/useServiceRecords"

export default function ServicesPage({ params }: { params: { id: string } }) {
  const { records, isLoading, mutate } = useServiceRecords(params.id)

  if (isLoading) return <div>Dang tai...</div>

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <ServiceRecordCard key={record.id} record={record} />
      ))}
    </div>
  )
}
```

---

## Best Practices

### 1. Type Safety Across the Stack
- Define schemas/types in shared package
- Backend uses same schemas for validation
- Frontend uses same schemas for forms
- Hono RPC provides end-to-end type safety
- No type casting or `any` types

### 2. DRY (Don't Repeat Yourself)
- Validation rules in one place (shared schemas)
- Constants defined once, used everywhere
- Type mapping (toVehicle, toOilChange) in service layer only

### 3. Consistency
- Same Zod schema validates both FE forms and BE requests
- Same types used across the entire stack
- Same constants (thresholds, defaults) shared

### 4. Maintainability
- Change schema once, updates both FE and BE
- AppType auto-updates frontend API client types
- Drizzle schema changes generate type-safe migrations

### 5. Avoid Over-Engineering
- Only make changes that are directly requested
- Keep solutions simple and focused
- Don't add features beyond what was asked
- Don't add abstractions for single-use patterns
