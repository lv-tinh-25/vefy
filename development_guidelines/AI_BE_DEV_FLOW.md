# Backend Development Flow

This document contains detailed technical standards, patterns, and code examples for backend development in the Vefy project.

## Critical Rules (ZERO TOLERANCE)

### 1. TYPE SAFETY - NO "any" Type

**FORBIDDEN:**

```typescript
async function findAll(query: any) {
  return db.select().from(vehicles).where(query)
}

function handleError(error: any) {
  console.log(error.message)
}
```

**CORRECT:**

```typescript
import { eq, desc } from "drizzle-orm"
import { vehicles } from "@vefy/db"
import type { Vehicle } from "@vefy/shared"

async function findAll(): Promise<Vehicle[]> {
  const rows = await db.select().from(vehicles)
  return rows.map(toVehicle)
}

function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message)
  }
}
```

### 2. SHARED PACKAGE INTEGRATION - Use Zod Schemas

Always use validation schemas from `@vefy/shared` to ensure FE/BE consistency.

**FORBIDDEN:**

```typescript
// Backend creates own validation
import { z } from "zod"
const vehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
})
```

**CORRECT:**

```typescript
import { insertVehicleSchema } from "@vefy/shared"
import { zValidator } from "@hono/zod-validator"

app.post("/", zValidator("json", insertVehicleSchema), async (c) => {
  const data = c.req.valid("json")
  // data is fully typed from shared schema
})
```

### 3. ZOD VALIDATOR MIDDLEWARE - Always Validate Input

Every POST/PATCH/PUT route MUST use `zValidator` middleware with shared schemas.

**FORBIDDEN:**

```typescript
app.post("/", async (c) => {
  const data = await c.req.json() // Unvalidated!
  const vehicle = await vehicleService.create(data)
  return c.json(vehicle, 201)
})
```

**CORRECT:**

```typescript
import { zValidator } from "@hono/zod-validator"
import { insertVehicleSchema } from "@vefy/shared"

app.post("/", zValidator("json", insertVehicleSchema), async (c) => {
  const data = c.req.valid("json") // Validated & typed
  const vehicle = await vehicleService.create(data)
  return c.json(vehicle, 201)
})
```

### 4. ERROR HANDLING - Consistent HTTP Responses

**FORBIDDEN:**

```typescript
app.get("/:id", async (c) => {
  const vehicle = await vehicleService.getById(c.req.param("id"))
  return c.json(vehicle) // What if null?
})
```

**CORRECT:**

```typescript
app.get("/:id", async (c) => {
  const id = c.req.param("id")
  const vehicle = await vehicleService.getById(id)
  if (!vehicle) return c.json({ error: "Khong tim thay xe" }, 404)
  return c.json(vehicle)
})
```

### 5. FUNCTIONAL SERVICE PATTERN - No Classes

Services are plain exported functions, not classes. Each service file is a module.

**FORBIDDEN:**

```typescript
class VehicleService {
  constructor(private db: Database) {}
  async findAll() { /* ... */ }
}
```

**CORRECT:**

```typescript
// services/vehicle.service.ts
import { db } from "@vefy/db"
import { vehicles } from "@vefy/db"

export async function listAll() {
  return db.select().from(vehicles)
}

export async function getById(id: string) {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id))
  return row ?? null
}
```

### 6. TYPE MAPPING - DB Row to Shared Type

Always map Drizzle DB rows to shared types before returning to API.

```typescript
import type { Vehicle } from "@vefy/shared"

function toVehicle(row: typeof vehicles.$inferSelect): Vehicle {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    licensePlate: row.licensePlate,
    color: row.color,
    // ... map all fields
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
```

### Enforcement Checklist

1. Search for `any` type -> Replace with proper types
2. Check validation -> All POST/PATCH routes use `zValidator` with shared schemas
3. Check error responses -> Return proper HTTP status codes (404, 400, 500)
4. Check services -> Functional pattern, no classes
5. Check type mapping -> DB rows mapped to shared types
6. Run quality checks -> `pnpm --filter @vefy/api build`

---

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts            # Standalone node server (pnpm --filter @vefy/api dev:standalone, port 3001)
│   ├── app.ts              # Hono app instance, routes, exports AppType
│   │                       # Normally served by Next.js: apps/web/src/app/api/[...route]/route.ts
│   ├── lib/
│   │   ├── auth.ts         # better-auth config (email/password, Google, rate limit)
│   │   └── email.ts        # nodemailer (verification + reset password mails)
│   ├── middleware/
│   │   └── auth.ts         # requireAuth: sets userId on context
│   ├── routes/
│   │   ├── vehicles.ts     # /api/vehicles CRUD + requireVehicleOwner on /:id and nested routes
│   │   ├── oil-changes.ts  # /api/vehicles/:vehicleId/oil-changes
│   │   ├── parts.ts        # /api/vehicles/:vehicleId/parts
│   │   ├── expenses.ts     # /api/vehicles/:vehicleId/expenses
│   │   ├── expenses-global.ts # /api/expenses (all vehicles of the user)
│   │   ├── notifications.ts   # /api/notifications (alerts + dismiss)
│   │   ├── profile.ts      # /api/profile
│   │   ├── upload.ts       # /api/upload/avatar
│   │   └── ocr.ts          # /api/ocr/read-odometer (per-user limits)
│   └── services/           # one *.service.ts per domain (functional, no classes)
├── package.json
└── tsconfig.json
```

---

## Naming Conventions

### File & Folder Naming

| Type        | Convention | Example                    |
| ----------- | ---------- | -------------------------- |
| Route file  | kebab-case | `oil-changes.ts`           |
| Service     | kebab-case | `oil-change.service.ts`    |
| Utility     | kebab-case | `date-utils.ts`            |

### Variable & Function Naming

| Type          | Convention     | Example             |
| ------------- | -------------- | ------------------- |
| Functions     | camelCase      | `listAll()`         |
| Variables     | camelCase      | `vehicleId`         |
| Constants     | UPPER_SNAKE    | `DEFAULT_USER_ID`   |
| Types         | PascalCase     | `Vehicle`, `Part`   |
| DB columns    | camelCase      | `oilCycleKm`        |

---

## Route Structure

### Standard CRUD Route Pattern

```typescript
import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import { insertVehicleSchema, updateVehicleInfoSchema } from "@vefy/shared"
import * as vehicleService from "../services/vehicle.service"

export const vehicleRoutes = new Hono()
  // List all
  .get("/", async (c) => {
    const vehicles = await vehicleService.listAll()
    return c.json(vehicles)
  })
  // Get by ID
  .get("/:id", async (c) => {
    const id = c.req.param("id")
    const vehicle = await vehicleService.getById(id)
    if (!vehicle) return c.json({ error: "Khong tim thay xe" }, 404)
    return c.json(vehicle)
  })
  // Create
  .post("/", zValidator("json", insertVehicleSchema), async (c) => {
    const data = c.req.valid("json")
    const vehicle = await vehicleService.create(data)
    return c.json(vehicle, 201)
  })
  // Update
  .patch("/:id", zValidator("json", updateVehicleInfoSchema), async (c) => {
    const id = c.req.param("id")
    const data = c.req.valid("json")
    const vehicle = await vehicleService.update(id, data)
    if (!vehicle) return c.json({ error: "Khong tim thay xe" }, 404)
    return c.json(vehicle)
  })
  // Delete
  .delete("/:id", async (c) => {
    const id = c.req.param("id")
    await vehicleService.remove(id)
    return c.json({ success: true })
  })
```

### Nested Route Pattern

```typescript
// Parent route mounts child routes
export const vehicleRoutes = new Hono()
  .get("/", /* ... */)
  .route("/:vehicleId/oil-changes", oilChangeRoutes)
  .route("/:vehicleId/parts", partRoutes)

// Child route accesses parent params
export const oilChangeRoutes = new Hono()
  .get("/", async (c) => {
    const vehicleId = c.req.param("vehicleId")
    const oilChanges = await oilChangeService.listByVehicle(vehicleId)
    return c.json(oilChanges)
  })
```

### App Composition

```typescript
// app.ts - Main app with all routes
import { Hono } from "hono"
import { cors } from "hono/cors"

const app = new Hono()
  .use("/*", cors())
  .get("/api/health", (c) => c.json({ status: "ok" }))
  .route("/api/vehicles", vehicleRoutes)
  .route("/api/ocr", ocrRoutes)

export type AppType = typeof app  // Exported for Hono RPC client
export { app }
```

---

## Service Standards

### Basic CRUD Service

```typescript
import { db } from "@vefy/db"
import { vehicles } from "@vefy/db"
import { eq } from "drizzle-orm"
import type { Vehicle, InsertVehicle } from "@vefy/shared"

function toVehicle(row: typeof vehicles.$inferSelect): Vehicle {
  return { /* map fields */ }
}

export async function listAll(): Promise<Vehicle[]> {
  const rows = await db.select().from(vehicles)
  return rows.map(toVehicle)
}

export async function getById(id: string): Promise<Vehicle | null> {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id))
  return row ? toVehicle(row) : null
}

export async function create(data: InsertVehicle): Promise<Vehicle> {
  const [row] = await db.insert(vehicles).values({ /* ... */ }).returning()
  return toVehicle(row)
}

export async function update(id: string, data: Partial<InsertVehicle>): Promise<Vehicle | null> {
  const [row] = await db
    .update(vehicles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vehicles.id, id))
    .returning()
  return row ? toVehicle(row) : null
}

export async function remove(id: string): Promise<void> {
  await db.delete(vehicles).where(eq(vehicles.id, id))
}
```

---

## Drizzle ORM Patterns

### Query Patterns

```typescript
import { db } from "@vefy/db"
import { vehicles, oilChanges, parts } from "@vefy/db"
import { eq, desc, and, gte, lte } from "drizzle-orm"

// Simple select
const allVehicles = await db.select().from(vehicles)

// Select with where
const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id))

// Select with ordering
const ocs = await db
  .select()
  .from(oilChanges)
  .where(eq(oilChanges.vehicleId, vehicleId))
  .orderBy(desc(oilChanges.date))

// Insert with returning
const [row] = await db.insert(vehicles).values(data).returning()

// Update with returning
const [row] = await db
  .update(vehicles)
  .set({ ...data, updatedAt: new Date() })
  .where(eq(vehicles.id, id))
  .returning()

// Delete
await db.delete(vehicles).where(eq(vehicles.id, id))
```

### Schema Definition

```typescript
import { pgTable, uuid, varchar, integer, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core"

export const vehicleTypeEnum = pgEnum("vehicle_type", ["car", "motorcycle"])

export const vehicles = pgTable("vehicles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  type: vehicleTypeEnum("type").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year"),
  // ...
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
```

---

## Shared Package Integration

### Validation Schemas

```typescript
import {
  insertVehicleSchema,
  updateVehicleInfoSchema,
  insertOilChangeSchema,
  insertPartSchema,
} from "@vefy/shared"
```

### Types

```typescript
import type {
  Vehicle,
  OilChange,
  Part,
  InsertVehicle,
  UpdateVehicleInfo,
  InsertOilChange,
  InsertPart,
} from "@vefy/shared"
```

### Constants & Utils

```typescript
import {
  OIL_CYCLE_DEFAULTS,
  computeAllAlerts,
  predictOilChange,
  oilPredictionToAlert,
} from "@vefy/shared"
```

---

## Error Handling

### HTTP Status Code Guidelines

| Status | When                                    |
|--------|-----------------------------------------|
| 200    | Successful GET, PATCH, DELETE            |
| 201    | Successful POST (resource created)       |
| 400    | Validation error (Zod handles this)      |
| 404    | Resource not found                       |
| 500    | Unexpected server error                  |

### Error Response Format

```typescript
// Not found
return c.json({ error: "Khong tim thay xe" }, 404)

// Validation error (handled by zValidator automatically)
// Returns 400 with Zod error details

// Business logic error
return c.json({ error: "Odometer phai lon hon hoac bang lan truoc" }, 400)
```
