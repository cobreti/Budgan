# Budgan — Copilot Architecture Reference

**Stack:** Vue 3 · TypeScript · Vite · Pinia · InversifyJS · Vuetify · vue-i18n · Vitest · Cypress

---

## Repo Layout

```
App/
├── config/budgan/            # Vite config + entry for Budgan app (port 8000, early stage)
├── config/engine-testapp/    # Vite config + entry for Engine-TestApp (port 8001, active)
└── src/
    ├── engine/               # ★ Pure TypeScript — zero Vue/Pinia imports ever
    │   ├── models/           # Legacy type-only definitions (BankAccount, CSV)
    │   ├── modules/
    │   │   ├── bdg-workspace/   # BdgWorkspace, BdgAccount, BdgAccountSegment, BdgWorkspaceFactory
    │   │   ├── bdg-settings/    # BdgSettings (column mapping CRUD)
    │   │   └── csv-import/      # CsvContentExtractor, CsvContentImporter, CsvColumns, CsvColumnMapping
    │   ├── services/            # IdGenerator, ReaderFactory
    │   ├── types/               # Result<T>, ResultWithError<T,E>
    │   └── setup-inversify.module.ts  # All engine DI bindings
    ├── inversify/            # Container creation (shared by both apps)
    ├── engine-testapp/       # Active Vue app
    │   ├── assets/           # colors-def.scss (CSS custom properties)
    │   ├── components/       # NavigationBar, CsvSelection, CsvColumnMapping
    │   ├── i18n/             # vue-i18n setup + en/fr JSON locales
    │   ├── router/           # Vue Router (locale-prefixed routes)
    │   ├── stores/           # Pinia (bridge between engine and Vue)
    │   └── views/            # Routed page views
    └── budgan/               # Future production app (scaffolded, not active)
```

---

## Path Aliases

| Alias | Resolves to |
|---|---|
| `@engine/` | `src/engine/` |
| `@inversify/` | `src/inversify/` |
| `@engineTestApp/` | `src/engine-testapp/` |
| `@engineTestAppViews/` | `src/engine-testapp/views/` |
| `@engineTestAppRouter/` | `src/engine-testapp/router/` |
| `@/` (engine-testapp) | `src/engine-testapp/` |
| `@/` (budgan) | `src/budgan/` |

### ❌ Never use `../` relative imports across directories

```ts
// ❌ Wrong
import { IdGenerator } from '../../../engine/services/IdGenerator'
import container from '../../inversify/setup-inversify'
import { useWorkspaceStore } from '../../stores/workspace-store'

// ✅ Correct
import { IdGenerator } from '@engine/services/IdGenerator'
import container from '@inversify/setup-inversify'
import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'
```

The **only** allowed relative imports are same-folder imports (e.g. `'./types'`).

### Alias availability per tsconfig context

`tsconfig.engine-testapp.json` defines all aliases below — they all work in engine-testapp Vue files and TypeScript files:

| Alias | Defined in |
|---|---|
| `@engine/*` | `tsconfig.engine-testapp.json` + `tsconfig.app.json` |
| `@inversify/*` | `tsconfig.engine-testapp.json` + `tsconfig.app.json` |
| `@engineTestApp/*` | `tsconfig.engine-testapp.json` |
| `@engineTestAppViews/*` | `tsconfig.engine-testapp.json` |
| `@engineTestAppRouter/*` | `tsconfig.engine-testapp.json` |

> **Note:** TypeScript `paths` in a child tsconfig **completely replaces** (does not merge) the parent's `paths`. All required aliases must be explicitly listed in `tsconfig.engine-testapp.json`.

---

## Naming Conventions

| Entity | Rule | Example |
|---|---|---|
| Files | `kebab-case` | `csv-content-extractor.ts` |
| Abstract/token class | `PascalCase` (no prefix) | `BdgSettings`, `IdGenerator` |
| Concrete implementation | `PascalCase` + **`Impl`** suffix | `BdgSettingsImpl` |
| Domain entity | **`Bdg`** prefix | `BdgWorkspace`, `BdgAccount` |
| Pinia store fn | `use{Name}Store` | `useWorkspaceStore` |
| Pinia store ID | `kebab-case` string | `'workspace'` |
| CSS class | BEM `block__element--modifier` | `workspace-view__menu-item--active` |
| i18n key | dot-namespaced | `workspace.mapping.cardNumber` |
| `data-testid` | `kebab-case` | `workspace-apply-mapping` |
| CsvColumns values | `kebab-case` string literal | `'card-number'`, `'date-transaction'` |

---

## Core Patterns

### 1 — Abstract Class as DI Token (REQUIRED)

Never use a raw `interface` for anything injectable. Always use an `abstract class` with `static readonly bindingTypeId`.

```typescript
// ✅ engine/modules/my-feature/my-service.ts
import { InversifyUtils } from '@inversify/inversify-utils'

export abstract class MyService {
  static readonly bindingTypeId = InversifyUtils.createBindingId('MyService')
  abstract doThing(): void
}

// ✅ concrete impl (same file or separate)
import { injectable } from 'inversify'

@injectable()
export class MyServiceImpl extends MyService {
  doThing(): void { /* ... */ }
}
```

Then register in `src/engine/setup-inversify.module.ts`:
```typescript
options.bind<MyService>(MyService.bindingTypeId).to(MyServiceImpl)
// use .inSingletonScope() if state must be shared
```

### 2 — Result Pattern (fallible operations)

```typescript
import type { Result } from '@engine/types/result-pattern'

// Return Result<T>, never throw for expected failures
getAccount(id: string): Result<BdgAccount> {
  const a = this._accounts.get(id)
  return a ? { success: true, value: a } : { success: false }
}

// Caller
const result = workspace.getAccount(id)
if (result.success) { /* result.value is typed */ }
```

Types available: `Result<T>` and `ResultWithError<T, E>`.

### 3 — Factory Pattern

Use for domain aggregates that need injected services:

```typescript
export abstract class BdgWorkspaceFactory {
  static readonly bindingTypeId = InversifyUtils.createBindingId('WorkspaceFactory')
  abstract createWorkspace(): BdgWorkspace
}

@injectable()
export class BdgWorkspaceFactoryImpl extends BdgWorkspaceFactory {
  constructor(@inject(IdGenerator.bindingTypeId) private idGenerator: IdGenerator) { super() }
  createWorkspace(): BdgWorkspace {
    return new BdgWorkspaceImpl(this.idGenerator, this.idGenerator.generateId())
  }
}
```

### 4 — Pinia Store as Engine↔Vue Bridge

```typescript
// engine-testapp/stores/my-store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import container from '../../inversify/setup-inversify'
import { MyService } from '@engine/modules/my-feature/my-service'

export const useMyStore = defineStore('my-store', () => {
  const service = ref<MyService>(container.get<MyService>(MyService.bindingTypeId))

  const items = computed(() => service.value.getItems())

  function addItem(name: string): void {
    service.value.add(name)
  }

  return { items, addItem }
}, {
  persist: { key: 'engine-testapp-my-store', storage: localStorage }
})
```

### 5 — ID Generation

```typescript
// Always inject IdGenerator — never call crypto.randomUUID() directly
import container from '../../inversify/setup-inversify'
import { IdGenerator } from '@engine/services/IdGenerator'

const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)
const newId = idGenerator.generateId()
```

---

## DI Container — Current Bindings

| Token (abstract class) | Impl | Scope |
|---|---|---|
| `IdGenerator` | `IdGeneratorImpl` | transient |
| `ReaderFactory` | `FileReaderFactoryImpl` | transient |
| `BdgWorkspaceFactory` | `BdgWorkspaceFactoryImpl` | singleton |
| `BdgSettings` | `BdgSettingsImpl` | singleton |
| `CsvContentImporter` | `CsvContentImporterImpl` | transient |

---

## Engine Domain

### Key Types

```typescript
// Workspace
BdgWorkspace      { id, name, accounts: BdgAccount[], createAccount(name), getAccount(id) }
BdgAccount        { id, name, columnMappingId, segments: BdgAccountSegment[], addSegment(segment) }
BdgAccountSegment { name, dateStart, dateEnd, dateStartAsString, dateEndAsString, rows: BdgAccountSegmentRow[] }
BdgAccountSegmentRow { cardNumber, description, dateTransactionAsString, dateInscriptionAsString?,
                       dateTransaction?, dateInscription?, amount }

// Settings
BdgSettings         { columnMappings: BdgColumnMapping[], add/update/removeColumnMapping() }
BdgColumnMapping    { id: string, name: string, columnMapping: CsvColumnMapping }

// CSV Import
CsvContentExtractionResult  { delimiter, headerRowIndex, header: string[], rows: CsvJsonRecord[] }
CsvColumnMapping            { 'card-number'?: number, 'date-transaction'?: number, 'amount'?: number,
                              'description'?: number, 'date-inscription'?: number }
CsvColumns (const)          'card-number' | 'date-inscription' | 'date-transaction' | 'amount' | 'description'
CsvContentImporter          import(file: File, columnMapping: CsvColumnMapping): Promise<ResultWithError<BdgAccountSegment, string>>
```

> **Date parsing:** `BdgAccountSegment` uses `moment` (production dependency) to parse date strings in **local time**. Never use `new Date("YYYY-MM-DD")` directly — it parses as UTC and shifts by one day in timezones west of UTC.

### Legacy models (`src/engine/models/`) — use for Budgan app only
`BankAccount`, `BankAccountTransaction`, `BankAccountTransactionsGroup`, `Statement`, `CSVSettings`  
**For engine-testapp new code, use the `csv-import/` types above instead.**

---

## Routing

All routes are locale-prefixed. Pattern: `/:locale(en|fr)/...`

```
/:locale
  /                       home
  /zip-file               zip-file (stub)
  /settings
    /column-mappings      settings-column-mappings
  /workspace              workspace layout (sidebar nav)
    /create               workspace-create
    /accounts             workspace-accounts
    /segments             workspace-segments (requires selectedAccountId)
```

**Constructing links in templates:**
```vue
<RouterLink :to="{ name: 'workspace-accounts', params: { locale: localeParam } }">
```
```typescript
const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})
```

**Route guard** (in `i18n.ts`): lazily loads locale JSON, sets `i18n.global.locale`, redirects to `/en` if invalid.  
**Route tracker** (in `routeTracker.ts`): stores `from.path` in `to.meta.from`.

---

## CSS Rules

```scss
/* Each component */
<style scoped>
  @use 'colors-def';         /* gives access to CSS custom properties */

  .my-component { ... }                        /* block */
  .my-component__title { ... }                 /* element */
  .my-component__button--danger { ... }        /* modifier */
</style>
```

- **Never hardcode colors.** Always use `var(--token-name)` from `colors-def.scss`.
- CSS vars are mapped to Vuetify theme: `rgb(var(--v-theme-primary))`, etc.
- Mobile breakpoint: `@media (max-width: 640px)`
- Buttons: `border-radius: 999px`, `min-height: 2.75rem`

---

## i18n Rules

- Add keys to both `i18n/locales/en.json` and `i18n/locales/fr.json`.
- No hardcoded user-visible strings in templates — always `{{ t('key') }}`.
- Key structure: `section.subsection.label` (e.g., `workspace.mapping.cardNumber`).

---

## Testing Rules

- All interactive/testable elements need `data-testid="kebab-case-name"`.
- Unit specs (`.spec.ts`) co-located with the file they test.
- Engine classes are tested directly (no Vue test utils needed).
- E2E tests in `cypress/e2e/` use `cy.get('[data-testid="..."]')`.

---

## Checklist for New Features

1. **Engine logic** → `src/engine/modules/<feature>/` — pure TS, no framework
2. **New service** → abstract class + `Impl`, register in `setup-inversify.module.ts`
3. **New entity needing an ID** → use `IdGenerator` from DI
4. **Fallible operation** → return `Result<T>`, not `throw`
5. **Expose to UI** → Pinia store in `engine-testapp/stores/`, persist if stateful
6. **New route** → add under `/:locale(en|fr)/`, lazy-load with `() => import(...)`
7. **New Vue component** → scoped BEM styles, `@use 'colors-def'`, `data-testid` on all interactive elements
8. **New i18n text** → add to both `en.json` and `fr.json`

