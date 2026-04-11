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

### Result pattern (no throwing for expected errors)

```typescript
type Result<T> = { success: true; value: T } | { success: false }
// Use ResultWithError<T, E> when the caller needs the error type

const result = workspace.getAccount(id)
if (result.success) { /* result.value is typed */ }
```

### Path aliases — never use `../` across directories

| Import source | Alias |
|---|---|
| `src/engine/` | `@engine/` |
| `src/inversify/` | `@inversify/` |
| `src/engine-testapp/` | `@engineTestApp/` |
| `src/engine-testapp/views/` | `@engineTestAppViews/` |
| `src/engine-testapp/router/` | `@engineTestAppRouter/` |

Same-directory relative imports (`./types`) are allowed.

### Naming conventions

| Entity | Convention |
|---|---|
| Concrete DI implementation | `PascalCase` + `Impl` suffix |
| Domain entities | `Bdg` prefix (e.g. `BdgWorkspace`, `BdgAccount`) |
| Pinia store function | `use{Name}Store` |
| CSS classes | BEM (`.workspace-view__item--active`) |
| CSS values | Always `var(--token-name)` from `colors-def.scss`, never hardcoded |
| i18n keys | Dot-namespaced (`workspace.mapping.cardNumber`) |
| Test selectors | `data-testid="kebab-case"` on all interactive/testable elements |

### Routing

All routes are locale-prefixed: `/:locale(en|fr)/...`. When adding routes, follow this pattern.

### i18n

All user-visible strings use `{{ t('key') }}`. Keys must be added to **both** `i18n/locales/en.json` and `i18n/locales/fr.json`.

### Pinia stores

Stores act as the bridge between the engine and Vue. They hold references to engine services via the DI container and persist state to localStorage. Live object references (class instances) are excluded from persistence via `omit`; they are reconstructed from factory methods on hydration.

## Tools directory

`Tools/StatementGenerator/` is a standalone Node.js utility (requires Node 20+) for generating mock CSV bank statements used in testing the import pipeline.