# Frontend Development Flow

This document contains detailed technical standards, patterns, and code examples for frontend development in the Vefy project.

## Critical Rules (ZERO TOLERANCE)

### 1. TYPE SAFETY - NO "any", NO Type Assertions, NO Error Suppression

**ABSOLUTELY FORBIDDEN:**

```typescript
// NEVER use any
onError: (error: any) => {
  const errorMessage = error?.message
}

// NEVER suppress TypeScript errors
// @ts-expect-error
// @ts-ignore

// NEVER use type assertions
const value = data as string
const response = result as unknown as ApiResponse
```

**CORRECT:**

```typescript
import type { z } from "zod"
import { insertVehicleSchema } from "@vefy/shared"

type InsertVehicle = z.infer<typeof insertVehicleSchema>

// Proper error handling
if (error instanceof Error) {
  toast.error(error.message)
}
```

### 2. SEMANTIC COLORS ONLY - NO Hardcoded Color Values

**FORBIDDEN:**

```typescript
className = "bg-[#101922] text-white"
className = "text-[#137fec]"
className = "bg-green-100 text-green-800"
```

**CORRECT:**

```typescript
className = "bg-background text-foreground"
className = "text-primary"
className = "text-muted-foreground"
className = "bg-card border-border"
```

### 3. SVG ICONS - Use lucide-react Only

**FORBIDDEN:**

```typescript
<svg className="h-5 w-5" viewBox="0 0 24 24">
  <path fill="currentColor" d="M22.56 12.25c0-.78..." />
</svg>
```

**CORRECT:**

```typescript
import { Car, Wrench, Droplets } from "lucide-react"

<Car className="h-5 w-5" />
<Wrench className="h-4 w-4 text-muted-foreground" />
```

### 4. SEPARATION OF CONCERNS - Logic MUST Be in Hooks

**FORBIDDEN - Logic in component:**

```typescript
export default function GaragePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.api.vehicles.$get().then(r => r.json()).then(setVehicles)
  }, [])

  const handleDelete = async (id: string) => {
    await api.api.vehicles[":id"].$delete({ param: { id } })
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  return (/* JSX with logic mixed in */)
}
```

**CORRECT:**

```typescript
// hooks/garage/useVehicles.ts
export function useVehicles() {
  const { data, error, mutate } = useSWR("vehicles", () =>
    api.api.vehicles.$get().then((r) => r.json())
  )

  const deleteVehicle = async (id: string) => {
    await api.api.vehicles[":id"].$delete({ param: { id } })
    mutate()
  }

  return { vehicles: data ?? [], isLoading: !data && !error, deleteVehicle, mutate }
}

// app/garage/page.tsx - PURE UI
export default function GaragePage() {
  const { vehicles, isLoading, deleteVehicle } = useVehicles()
  return (/* JSX only */)
}
```

### 5. UI/UX SKILL INTEGRATION - MUST Use frontend-design

Before implementing ANY UI/UX feature, invoke the frontend-design skill:

```
/frontend-design design a vehicle dashboard with dark theme
```

**When to invoke:** Creating new pages, designing components, choosing colors/typography/layouts, implementing animations, improving UX and accessibility.

### 6. SHARED SCHEMAS - Use @vefy/shared

**FORBIDDEN - Duplicate Zod schemas locally:**

```typescript
// Don't create local schemas that exist in shared package
const vehicleSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
})
```

**CORRECT:**

```typescript
import { insertVehicleSchema, type InsertVehicle } from "@vefy/shared"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const form = useForm<InsertVehicle>({
  resolver: zodResolver(insertVehicleSchema),
})
```

### 7. API CLIENT - Use Hono RPC Client

**FORBIDDEN - Raw fetch or hardcoded URLs:**

```typescript
const res = await fetch("/api/vehicles")
const res = await fetch(`http://localhost:3001/api/vehicles/${id}`)
```

**CORRECT:**

```typescript
import { api } from "@/lib/api"

// GET list
const res = await api.api.vehicles.$get()
const vehicles = await res.json()

// GET by id
const res = await api.api.vehicles[":id"].$get({ param: { id } })

// POST
const res = await api.api.vehicles.$post({ json: data })

// PATCH
const res = await api.api.vehicles[":id"].$patch({ param: { id }, json: data })

// DELETE
await api.api.vehicles[":id"].$delete({ param: { id } })
```

### 8. ERROR HANDLING - Consistent Pattern

```typescript
const { t } = useT()

try {
  const res = await api.api.vehicles.$post({ json: data })
  if (!res.ok) {
    const error = await res.json()
    toast.error(error.error || t("common.error"))
    return
  }
  const vehicle = await res.json()
  toast.success(t("common.success"))
  mutate()
} catch {
  toast.error(t("common.connectionError"))
}
```

### 9. i18n - ALL User-Facing Text MUST Use useT()

**FORBIDDEN - Hardcoded strings in UI:**

```typescript
<Label>Hãng xe</Label>
<Button>Thêm xe</Button>
<p>Đang tải...</p>
toast.error("Có lỗi xảy ra")
```

**CORRECT:**

```typescript
import { useT } from "@/lib/i18n"

const { t, locale } = useT()

<Label>{t("vehicleForm.brand")}</Label>
<Button>{t("vehicleForm.addVehicle")}</Button>
<p>{t("common.loading")}</p>

// With parameters
{t("alerts.expiredDays", { days: 5 })}
{t("prediction.remainingDays", { days: prediction.effectiveDaysRemaining })}

// Pass locale to formatters
{formatDate(vehicle.warrantyExpiry, locale)}
{formatNumber(prediction.lastOdo, locale)}
```

**i18n Architecture:**
- Messages: `lib/i18n/messages/vi.ts` and `lib/i18n/messages/en.ts`
- Provider: `I18nProvider` wraps app in root layout
- Hook: `useT()` returns `{ t, locale, setLocale }`
- Type-safe keys: `MessageKey` type provides IDE autocomplete
- Parameter interpolation: `{paramName}` syntax in message strings
- New translations: add keys to BOTH `vi.ts` and `en.ts`

### 10. FORMS - Use Controller Pattern (NOT register)

**FORBIDDEN - register pattern:**

```typescript
<Input {...register("brand")} />
<Select {...register("type")} />
```

**CORRECT - Controller pattern:**

```typescript
import { Controller, useForm } from "react-hook-form"

<Controller
  control={control}
  name="brand"
  render={({ field }) => (
    <BrandSelect vehicleType={watchedType} value={field.value} onChange={field.onChange} />
  )}
/>

<Controller
  control={control}
  name="type"
  render={({ field }) => (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={field.value === "car" ? "default" : "outline"}
        onClick={() => field.onChange("car")}
      >
        {t("common.car")}
      </Button>
      <Button
        type="button"
        variant={field.value === "motorcycle" ? "default" : "outline"}
        onClick={() => field.onChange("motorcycle")}
      >
        {t("common.motorcycle")}
      </Button>
    </div>
  )}
/>
```

**Why Controller over register:**
- Works with custom components (ColorPicker, BrandSelect, etc.)
- Explicit control over value/onChange — no ref forwarding issues
- Cleaner integration with i18n and conditional rendering
- Consistent pattern across all form fields

### 11. UTILITIES - Use cn() for Class Names

**FORBIDDEN:**

```typescript
className={`bg-card p-4 ${isActive ? 'border-primary' : 'border-border'}`}
```

**CORRECT:**

```typescript
import { cn } from "@/lib/utils"

className={cn("bg-card p-4", isActive ? "border-primary" : "border-border")}
```

### 12. CODE LANGUAGE - English Only

ALL code, comments, variable names, function names, commit messages, and CLI output MUST be in English.

**FORBIDDEN:**

```typescript
// Lấy danh sách xe
const danhSachXe = await fetchVehicles()
console.log("Đang tải...")
toast.error("Có lỗi xảy ra")
return c.json({ error: "Không tìm thấy xe" }, 404)
```

**CORRECT:**

```typescript
// Fetch vehicle list
const vehicleList = await fetchVehicles()
console.log("Loading...")
toast.error(t("common.error")) // user-facing text goes through i18n
return c.json({ error: "Vehicle not found" }, 404)
```

**Rules:**
- Variable/function names: English (`vehicleList`, `handleDelete`, `oilChanges`)
- Code comments: English
- Console logs / error messages in code: English
- API error responses: English
- Commit messages: English
- User-facing text: ALWAYS through `t()` from i18n (never hardcoded in any language)

### Enforcement Checklist

Before submitting ANY code:

1. Search for `any` type -> Replace with proper types
2. Search for `@ts-expect-error` or `@ts-ignore` -> Fix underlying issue
3. Search for `as` or `as unknown as` -> Use type guards
4. Search for `text-[#` or `bg-[#` -> Use semantic tokens
5. Search for inline `<svg` -> Use lucide-react icons
6. Check if logic is in hooks -> Move useState/handlers to hooks
7. Verify frontend-design was invoked -> Use skill for UI tasks
8. Search for raw `fetch()` -> Use Hono RPC client
9. Check for local Zod schemas -> Use `@vefy/shared` schemas
10. Check page file length -> If >200 lines, split into smaller components
11. Search for hardcoded Vietnamese/English strings -> Use `t()` from `useT()`
12. Search for `register(` in forms -> Replace with `Controller` pattern
13. Search for non-English text in code (variable names, comments, error messages) -> Rewrite in English

---

## Project Structure

```
apps/web/src/
├── app/                              # Next.js App Router pages (kebab-case)
│   ├── layout.tsx                    # Root layout (I18nProvider)
│   ├── page.tsx                      # Home (redirects to /garage)
│   ├── globals.css                   # Global styles & Tailwind tokens
│   ├── garage/
│   │   └── page.tsx                  # Garage page (thin wrapper)
│   └── vehicle/[id]/
│       ├── layout.tsx                # Tab navigation layout
│       ├── page.tsx                  # Redirect to overview
│       ├── overview/page.tsx
│       ├── documents/page.tsx
│       ├── oil/page.tsx
│       └── parts/page.tsx
├── components/
│   ├── core/
│   │   ├── atoms/                    # Basic UI elements
│   │   │   ├── Badge/
│   │   │   │   └── index.tsx
│   │   │   ├── Button/
│   │   │   │   └── index.tsx
│   │   │   ├── Input/
│   │   │   │   └── index.tsx
│   │   │   ├── Label/
│   │   │   │   └── index.tsx
│   │   │   └── Select/
│   │   │       └── index.tsx
│   │   ├── molecules/                # Composed UI elements
│   │   │   ├── AlertBadge/
│   │   │   │   └── index.tsx
│   │   │   ├── AlertList/
│   │   │   │   └── index.tsx
│   │   │   ├── BrandSelect/
│   │   │   │   └── index.tsx
│   │   │   ├── Card/
│   │   │   │   └── index.tsx
│   │   │   ├── ColorPicker/
│   │   │   │   └── index.tsx
│   │   │   ├── ConfirmDialog/
│   │   │   │   └── index.tsx
│   │   │   ├── Dialog/
│   │   │   │   └── index.tsx
│   │   │   └── OcrButton/
│   │   │       └── index.tsx
│   │   └── templates/                # Page-level compositions
│   │       ├── Garage/
│   │       │   ├── index.tsx         # Main: GarageContent
│   │       │   ├── VehicleCard.tsx
│   │       │   └── VehicleFormModal.tsx
│   │       ├── VehicleOverview/
│   │       │   ├── index.tsx
│   │       │   ├── StatusCard.tsx
│   │       │   └── OilPredictionCard.tsx
│   │       ├── VehicleDocuments/
│   │       │   └── index.tsx
│   │       ├── VehicleOil/
│   │       │   ├── index.tsx
│   │       │   ├── OilChangeFormModal.tsx
│   │       │   └── OilHistoryList.tsx
│   │       └── VehicleParts/
│   │           ├── index.tsx
│   │           └── PartFormModal.tsx
├── hooks/                            # Custom hooks (feature-based folders)
│   ├── garage/
│   │   ├── useGaragePage.ts
│   │   └── useVehicleForm.ts
│   ├── vehicles/
│   │   ├── useVehicle.ts
│   │   ├── useVehicleDocuments.ts
│   │   ├── useOilChanges.ts
│   │   ├── useOilChangeForm.ts
│   │   ├── useParts.ts
│   │   └── usePartForm.ts
│   └── ocr/
│       └── useOcrReader.ts
├── lib/
│   ├── api.ts                        # Hono RPC client instance
│   ├── utils.ts                      # cn(), formatDate(str, locale), formatNumber(n, locale)
│   ├── image-utils.ts                # Image resize for OCR
│   └── i18n/
│       ├── index.tsx                 # I18nProvider, useT() hook
│       ├── types.ts                  # Locale, MessageKey, FlattenKeys types
│       └── messages/
│           ├── vi.ts                 # Vietnamese translations (default)
│           └── en.ts                 # English translations
```

---

## Naming Conventions

| Category | Pattern | Example |
|---|---|---|
| **Pages (routes)** | kebab-case folders | `app/garage/page.tsx`, `app/vehicle/[id]/oil/page.tsx` |
| **Component folders** | **PascalCase** | `Button/`, `VehicleCard/`, `OilPredictionCard/` |
| **Component main file** | `index.tsx` | `Button/index.tsx` |
| **Sub-components** | PascalCase file | `Garage/VehicleCard.tsx`, `VehicleOil/OilHistoryList.tsx` |
| **Atoms** | `components/core/atoms/` | `Badge/`, `Button/`, `Input/` |
| **Molecules** | `components/core/molecules/` | `AlertBadge/`, `BrandSelect/`, `Dialog/` |
| **Templates** | `components/core/templates/` | `Garage/`, `VehicleOverview/`, `VehicleParts/` |
| **Hook folders** | kebab-case feature | `hooks/garage/`, `hooks/vehicles/` |
| **Hook files** | `use[Name].ts` (camelCase) | `useGaragePage.ts`, `useVehicleForm.ts` |
| **Utils** | `[name].ts` | `utils.ts`, `image-utils.ts` |
| **Types (from shared)** | PascalCase | `Vehicle`, `OilChange`, `Part` |
| **Component exports** | PascalCase function | `VehicleCard`, `AlertBadge` |

### Component Hierarchy (Atomic Design)

| Level | Location | What goes here | Example |
|---|---|---|---|
| **Atoms** | `core/atoms/` | Single UI elements, no business logic | `Button`, `Input`, `Badge`, `Label`, `Select` |
| **Molecules** | `core/molecules/` | Composed atoms, may have light logic | `AlertBadge`, `BrandSelect`, `ColorPicker`, `Dialog`, `ConfirmDialog`, `OcrButton` |
| **Templates** | `core/templates/` | Page-level compositions with sub-components | `Garage`, `VehicleOverview`, `VehicleOil`, `VehicleParts` |

### Template Folder Pattern

Templates group related sub-components together:

```
VehicleOil/
├── index.tsx                 # Main: VehicleOilContent (exported)
├── OilChangeFormModal.tsx    # Sub-component
├── OilHistoryList.tsx        # Sub-component
└── OilSettingsCard.tsx       # Sub-component
```

**index.tsx imports and composes sub-components:**
```typescript
// VehicleOil/index.tsx
import { OilChangeFormModal } from "./OilChangeFormModal"
import { OilHistoryList } from "./OilHistoryList"
import { OilSettingsCard } from "./OilSettingsCard"
import { useOilChanges } from "@/hooks/vehicles/useOilChanges"

export function VehicleOilContent() {
  const { oilChanges, prediction, ... } = useOilChanges(vehicleId)
  return (
    <div className="space-y-6">
      <OilSettingsCard />
      <OilChangeFormModal />
      <OilHistoryList oilChanges={oilChanges} />
    </div>
  )
}
```

### Page Composition Pattern

Pages are **thin wrappers** — all logic in hooks, all UI in templates:

```typescript
// app/garage/page.tsx
import { GarageContent } from "@/components/core/templates/Garage"

export default function GaragePage() {
  return <GarageContent />
}
```

---

## Technical Standards

### SWR Data Fetching (Feature-Based Hooks)

Hooks are organized in **feature-based folders** under `hooks/`:

```
hooks/
├── garage/
│   ├── useGaragePage.ts          # List vehicles + alert summary
│   └── useVehicleForm.ts         # Create vehicle form logic
├── vehicles/
│   ├── useVehicle.ts             # Single vehicle detail
│   ├── useVehicleDocuments.ts    # Update vehicle info/documents
│   ├── useOilChanges.ts          # Oil changes + prediction
│   ├── useOilChangeForm.ts       # Oil change form logic
│   ├── useParts.ts               # Parts list + delete
│   └── usePartForm.ts            # Part form logic
└── ocr/
    └── useOcrReader.ts           # OCR camera + API call
```

```typescript
// hooks/garage/useGaragePage.ts
import useSWR from "swr"
import { api } from "@/lib/api"

export function useGaragePage() {
  const { data, mutate } = useSWR("vehicles", async () => {
    const res = await api.api.vehicles.$get()
    return res.json()
  })

  const deleteVehicle = async (id: string) => {
    await api.api.vehicles[":id"].$delete({ param: { id } })
    mutate()
  }

  return {
    vehicles: data ?? [],
    isLoading: !data,
    totalAlerts: data?.reduce((sum, v) => sum + v.activeAlertCount, 0) ?? 0,
    deleteVehicle,
    mutate,
  }
}

// hooks/vehicles/useVehicle.ts
export function useVehicle(id: string) {
  return useSWR(id ? `vehicle-${id}` : null, async () => {
    const res = await api.api.vehicles[":id"].$get({ param: { id } })
    return res.json()
  })
}
```

### React Hook Form + Zod (Controller Pattern)

```typescript
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertVehicleSchema, type InsertVehicle } from "@vefy/shared"
import { useT } from "@/lib/i18n"

// Hook: form logic
export function useVehicleForm(onSuccess: () => void) {
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      type: "car",
      brand: "",
      model: "",
      color: "Trắng",
    },
  })

  const onSubmit = handleSubmit(async (data) => {
    const res = await api.api.vehicles.$post({ json: data })
    if (res.ok) {
      reset()
      onSuccess()
    }
  })

  return { control, watch, errors, onSubmit }
}

// Component: Controller pattern for all fields
function VehicleFormFields({ control, errors }: { control: Control<InsertVehicle>; errors: FieldErrors<InsertVehicle> }) {
  const { t } = useT()

  return (
    <>
      <Controller
        control={control}
        name="brand"
        render={({ field }) => (
          <div>
            <Label>{t("vehicleForm.brand")}</Label>
            <BrandSelect
              vehicleType={watchedType}
              value={field.value}
              onChange={field.onChange}
            />
            {errors.brand && <p className="text-sm text-danger">{errors.brand.message}</p>}
          </div>
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <div>
            <Label>{t("vehicleForm.color")}</Label>
            <ColorPicker value={field.value} onChange={field.onChange} />
          </div>
        )}
      />
    </>
  )
}
```

### Component Standards

```typescript
import { cn } from "@/lib/utils"

interface VehicleCardProps {
  vehicle: Vehicle
  onDelete?: (id: string) => void
  className?: string
}

export function VehicleCard({ vehicle, onDelete, className }: VehicleCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      {/* UI only - no logic */}
    </div>
  )
}
```

### Responsive Design

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {vehicles.map((v) => (
    <VehicleCard key={v.id} vehicle={v} />
  ))}
</div>
```

---

## Screen-Level Component Decomposition

Split into smaller components when: **>200 lines** OR **3+ UI states** OR **2+ conditional renders**.

**Rules:**
- One component per file (PascalCase)
- No inner function component definitions
- Page file is a thin wrapper — renders template component only
- All logic lives in feature-based hooks
- Sub-components are co-located inside the template folder

**Example — VehicleParts feature:**

```
components/core/templates/VehicleParts/
├── index.tsx                     # VehiclePartsContent (main export)
├── PartFormModal.tsx             # Sub-component: add part form
├── PartListItem.tsx              # Sub-component: single part card
└── PartEmptyState.tsx            # Sub-component: empty state

hooks/vehicles/
├── useParts.ts                   # SWR fetch + delete logic
└── usePartForm.ts                # Form logic (Controller + submit)
```

**Full composition flow:**
```
app/vehicle/[id]/parts/page.tsx        → thin wrapper
  └── <VehiclePartsContent />          → template (co-located sub-components)
        ├── <PartFormModal />          → sub-component (uses usePartForm hook)
        │     ├── <Dialog />           → molecule
        │     ├── <Input />            → atom
        │     └── <Button />           → atom
        ├── <PartListItem />           → sub-component
        │     ├── <Card />             → molecule
        │     └── <Badge />            → atom
        └── <ConfirmDialog />          → molecule
```

---

## Shared Package Integration

Always check `@vefy/shared` before creating local schemas, constants, or types.

### Validation Schemas

```typescript
import { insertVehicleSchema, insertOilChangeSchema, insertPartSchema } from "@vefy/shared"
import type { Vehicle, OilChange, Part, InsertVehicle } from "@vefy/shared"
```

### Constants

```typescript
import { OIL_CYCLE_DEFAULTS, ALERT_THRESHOLDS, VEHICLE_COLORS } from "@vefy/shared"
import { CAR_BRAND_GROUPS, MOTORCYCLE_BRAND_GROUPS } from "@vefy/shared"
```

### Alert & Prediction Utils

```typescript
import { computeAllAlerts, getActiveAlerts, countAlertsByStatus } from "@vefy/shared"
import { predictOilChange, oilPredictionToAlert } from "@vefy/shared"
```

---

## Thinking & Decision-Making Framework

### 1. State Management Decision

| State Type       | Tool                     | Use For                              |
|------------------|--------------------------|--------------------------------------|
| **Server state** | SWR                      | All data from API — lists, details   |
| **Form state**   | React Hook Form + Zod    | Form inputs, validation, submission  |
| **UI state**     | useState / useReducer    | Modals, toggles, local UI state     |

### 2. Component Placement Decision

Before creating a new component, ask:
- Is it a single, generic UI element (button, input, badge)? → `core/atoms/[Name]/index.tsx`
- Is it a composed UI element reused across features (dialog, form input, select)? → `core/molecules/[Name]/index.tsx`
- Is it a page-level feature composition? → `core/templates/[Feature]/index.tsx`
- Is it a sub-component of a template? → Co-locate inside the template folder: `core/templates/[Feature]/[SubName].tsx`

### 3. Performance

- SWR handles caching and revalidation automatically
- Use `React.memo` for expensive renders with stable props
- Optimize images with `next/image`
- Avoid premature optimization — measure first

### 4. Accessibility

- Proper ARIA labels on interactive elements
- Full keyboard navigation (Tab, Enter, Escape)
- Focus management for dialogs
- Color contrast compliance
- Semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<section>`)
