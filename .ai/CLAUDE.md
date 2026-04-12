# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Before writing any code

Read **`.github/ARCHITECTURE.md`** — it is the single source of truth for naming conventions, mandatory patterns, routing, CSS, i18n, and testing rules.

## Project overview

**Budgan** is a Vue 3 + TypeScript financial application for CSV bank statement import and workspace management. The repo contains two apps under `App/src/`:

- `engine-testapp/` — the active app (port 8001)
- `budgan/` — scaffolded, not yet active (port 8000)

All commands are run from the `App/` directory.

## Commands

```bash
# Development
npm run dev:engine-testapp     # Start active app on port 8001

# Build
npm run build:engine-testapp   # Vite build
npm run build                  # Full build with type-check

# Unit tests
npm run test:unit:engine-testapp
npm run coverage:engine-testapp

# E2E tests
npm run test:e2e               # Cypress headless
npm run test:e2e:dev           # Cypress interactive

# Code quality
npm run lint                   # ESLint + autofix
npm run format                 # Prettier (src/ only)
npm run type-check:engine-testapp
```

## Architecture

The codebase enforces **unidirectional dependency flow**:

```
src/engine/          ← Pure TypeScript — NEVER import Vue or Pinia here
src/inversify/       ← Shared DI container
src/engine-testapp/  ← Vue 3 app (stores, components, views, router, i18n)
```

**Data flow for CSV import:**
1. User loads a file → Pinia store captures it
2. `CsvContentExtractor` (pure TS) detects delimiter, finds header row, parses to typed rows
3. Column mapping UI lets user map CSV columns to semantic fields (`card-number`, `date-transaction`, `amount`, etc.)
4. `BdgWorkspaceFactory` creates a workspace domain aggregate with accounts
5. Pinia store persists a snapshot to localStorage; on reload, hydrates via factory

## Mandatory patterns

### Dependency Injection (InversifyJS)

Use abstract class as both the token and interface:

```typescript
export abstract class MyService {
  static readonly bindingTypeId = InversifyUtils.createBindingId('MyService')
  abstract doThing(): void
}

@injectable()
export class MyServiceImpl extends MyService {
  doThing(): void { /* ... */ }
}

// In setup-inversify.module.ts:
options.bind<MyService>(MyService.bindingTypeId).to(MyServiceImpl).inSingletonScope()
```

**Current DI bindings:**

| Token | Impl | Scope |
|---|---|---|
| `IdGenerator` | `IdGeneratorImpl` | transient |
| `ReaderFactory` | `FileReaderFactoryImpl` | transient |
| `BdgWorkspaceFactory` | `BdgWorkspaceFactoryImpl` | singleton |
| `BdgSettings` | `BdgSettingsImpl` | singleton |
| `CsvContentImporter` | `CsvContentImporterImpl` | transient |

### Result pattern (no throwing for expected errors)

```typescript
import type { Result } from '@engine/types/result-pattern'

getAccount(id: string): Result<BdgAccount> {
  const a = this._accounts.get(id)
  return a ? { success: true, value: a } : { success: false }
}

// Caller
const result = workspace.getAccount(id)
if (result.success) { /* result.value is typed */ }
```

Use `ResultWithError<T, E>` when the caller needs the error type.

### Factory pattern

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

### ID Generation

Always inject `IdGenerator` — **never call `crypto.randomUUID()` directly**:

```typescript
const idGenerator = container.get<IdGenerator>(IdGenerator.bindingTypeId)
const newId = idGenerator.generateId()
```

### Pinia stores

Stores act as the bridge between the engine and Vue. They hold references to engine services via the DI container and persist state to localStorage. Live object references (class instances) are excluded from persistence via `omit`; they are reconstructed from factory methods on hydration.

### Path aliases — never use `../` across directories

| Alias | Resolves to |
|---|---|
| `@engine/` | `src/engine/` |
| `@inversify/` | `src/inversify/` |
| `@engineTestApp/` | `src/engine-testapp/` |
| `@engineTestAppViews/` | `src/engine-testapp/views/` |
| `@engineTestAppRouter/` | `src/engine-testapp/router/` |
| `@/` | App-specific root (`src/engine-testapp/` or `src/budgan/`) |

Same-directory relative imports (`./types`) are allowed. Note: TypeScript `paths` in a child tsconfig **replaces** (does not merge) the parent's — all required aliases must be explicitly listed in `tsconfig.engine-testapp.json`.

### Naming conventions

| Entity | Convention |
|---|---|
| Files | `kebab-case` |
| Abstract/token class | `PascalCase` (no prefix) |
| Concrete DI implementation | `PascalCase` + `Impl` suffix |
| Domain entities | `Bdg` prefix (e.g. `BdgWorkspace`, `BdgAccount`) |
| Pinia store function | `use{Name}Store` |
| Pinia store ID | `kebab-case` string |
| CSS classes | BEM (`workspace-view__menu-item--active`) |
| CSS values | Always `var(--token-name)` from `colors-def.scss`, never hardcoded |
| i18n keys | Dot-namespaced (`workspace.mapping.cardNumber`) |
| Test selectors | `data-testid="kebab-case"` on all interactive/testable elements |
| CsvColumns values | `kebab-case` string literal (`'card-number'`, `'date-transaction'`) |

### Routing

All routes are locale-prefixed: `/:locale(en|fr)/...`. Current route tree:

```
/:locale
  /                       home
  /zip-file               zip-file (stub)
  /settings
    /column-mappings      settings-column-mappings
  /workspace              workspace layout (sidebar nav)
    /create               workspace-create
    /accounts             workspace-accounts
    /segments             workspace-segments (menu item disabled when no account selected)
```

Construct links in templates as:

```vue
<RouterLink :to="{ name: 'workspace-accounts', params: { locale: localeParam } }">
```

```typescript
const localeParam = computed(() => {
  const l = route.params.locale
  return typeof l === 'string' ? l : 'en'
})
```

Route guard in `i18n.ts` lazily loads locale JSON and redirects to `/en` if locale is invalid.

### i18n

All user-visible strings use `{{ t('key') }}`. Keys must be added to **both** `i18n/locales/en.json` and `i18n/locales/fr.json`.

### CSS

Each component uses scoped BEM styles with CSS custom properties:

```scss
<style scoped>
  @use 'colors-def';  /* required for CSS custom properties */

  .my-component { ... }
  .my-component__title { ... }
  .my-component__button--danger { ... }
</style>
```

Never hardcode colors — always use `var(--token-name)`. Mobile breakpoint: `@media (max-width: 640px)`.

## Engine domain key types

```typescript
// Workspace
BdgWorkspace      { id, name, accounts: BdgAccount[], createAccount(name), getAccount(id) }
BdgAccount        { id, name, columnMappingId, segments: BdgAccountSegment[], addSegment(segment) }
BdgAccountSegment { name, dateStart, dateEnd, dateStartAsString, dateEndAsString, rows: BdgAccountSegmentRow[] }
BdgAccountSegmentRow { cardNumber, description, dateTransactionAsString, dateInscriptionAsString?,
                       dateTransaction?, dateInscription?, amount }

// Settings
BdgSettings         { columnMappings: BdgColumnMapping[], add/update/removeColumnMapping() }
BdgColumnMapping    { id, name, columnMapping: CsvColumnMapping }

// CSV Import
CsvContentExtractionResult  { delimiter, headerRowIndex, header: string[], rows: CsvJsonRecord[] }
CsvColumnMapping            { 'card-number'?: number, 'date-transaction'?: number, 'amount'?: number,
                              'description'?: number, 'date-inscription'?: number }
CsvContentImporter          import(file, columnMapping): Promise<ResultWithError<BdgAccountSegment, string>>
```

> **Date parsing:** `BdgAccountSegment` uses `moment` (production dependency) to parse date strings in **local time**. Never use `new Date("YYYY-MM-DD")` directly — it parses as UTC and causes an off-by-one day in timezones west of UTC.

**Note:** `src/engine/models/` contains legacy types (`BankAccount`, `Statement`, etc.) — for engine-testapp new code, use the `csv-import/` types above instead.

## Checklist for new features

1. **Engine logic** → `src/engine/modules/<feature>/` — pure TS, no framework imports
2. **New service** → abstract class + `Impl`, register in `setup-inversify.module.ts`
3. **New entity needing an ID** → use `IdGenerator` from DI
4. **Fallible operation** → return `Result<T>`, not `throw`
5. **Expose to UI** → Pinia store in `engine-testapp/stores/`, persist if stateful
6. **New route** → add under `/:locale(en|fr)/`, lazy-load with `() => import(...)`
7. **New Vue component** → scoped BEM styles, `@use 'colors-def'`, `data-testid` on all interactive elements
8. **New i18n text** → add to both `en.json` and `fr.json`

## Tools directory

`Tools/StatementGenerator/` is a standalone Node.js utility (requires Node 20+) for generating mock CSV bank statements used in testing the import pipeline.