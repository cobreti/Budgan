# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Budgan** is an Angular + TypeScript financial application for CSV bank statement import and journal management. The active app lives in `App/Budgan/`.

All commands are run from the `App/Budgan/` directory.

## Commands

```bash
# Development
ng serve                # Start dev server (default port 4200)

# Build
ng build               # Angular CLI build

# Unit tests
ng test                # Vitest unit tests

# Code quality
npx prettier --write . # Format with Prettier
```

## Architecture

```
App/Budgan/src/
├── components/         # Reusable Angular components
│   ├── app/            # Root component, routing config, app config, locale guards
│   ├── columns-mapping-list/
│   ├── header/
│   ├── journal-list/
│   ├── main-menu/
│   │   └── main-menu-button/
│   ├── main/
│   ├── page-menu/
│   │   └── page-menu-button/
│   └── page/
├── Models/             # Plain TypeScript interfaces (data shapes)
├── services/           # Injectable services (interface + Impl pattern)
├── types/              # Shared utility types (Result<T>)
└── views/              # Routed page components
    ├── Home/
    ├── columns-mapping/
    └── journals/
```

**Data flow for CSV import:**
1. User loads a file → component calls `CsvContentExtractorService`
2. `CsvContentExtractorServiceImpl` detects delimiter, finds header row, parses to typed rows
3. Column mapping UI lets user assign CSV columns to semantic fields
4. `ColumnsMappingService` persists the mapping to IndexedDB via `IndexdbService` (Dexie)

## Mandatory patterns

### Services (Angular DI)

Always define a TypeScript interface for the contract, an `InjectionToken`, and an `Impl` class:

```typescript
// my-feature.service.ts
export interface MyFeatureService {
  doThing(): void;
}

export const MY_FEATURE_SERVICE = new InjectionToken<MyFeatureService>('MyFeatureService');

@Injectable({ providedIn: 'root' })
export class MyFeatureServiceImpl implements MyFeatureService {
  doThing(): void { /* ... */ }
}
```

- Use `inject()` inside the `Impl` class — never constructor injection.
- Register every new token in `src/components/app/app.config.ts`:

```typescript
{ provide: MY_FEATURE_SERVICE, useClass: MyFeatureServiceImpl }
```

**Current service tokens registered in `app.config.ts`:**

| Token | Impl |
|---|---|
| `ID_GENERATOR_SERVICE` | `IdGeneratorServiceImpl` |
| `LOCALE_SERVICE` | `LocaleServiceImpl` |
| `JOURNAL_SERVICE` | `JournalServiceImpl` |
| `COLUMNS_MAPPING_SERVICE` | `ColumnsMappingServiceImpl` |
| `CSV_CONTENT_EXTRACTOR_SERVICE` | `CsvContentExtractorServiceImpl` |

`IndexdbService` is used directly (no token) — it extends Dexie and is `providedIn: 'root'`.

### Result pattern (no throwing for expected errors)

```typescript
import { Result } from '../types/result';

save(item: MyModel): Promise<Result<MyModel>> {
  // ...
  return { success: true, value: item };
  return { success: false, error: 'name-exists' };
}

// Caller
const result = await service.save(item);
if (result.success) { /* result.value is typed */ }
```

`Result<T>` is defined as `{ success: true; value: T } | { success: false; error: string }`.

### Angular component rules

- **Standalone components only** — do NOT set `standalone: true` (it is the default in Angular v20+).
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in every `@Component` decorator.
- Use signals (`signal()`, `computed()`) for all local state.
- Use `input()` and `output()` functions instead of `@Input`/`@Output` decorators.
- Use native control flow (`@if`, `@for`, `@switch`) — never `*ngIf`, `*ngFor`, `*ngSwitch`.
- Do NOT use `ngClass` or `ngStyle` — use `class` and `style` bindings instead.
- Do NOT use `@HostBinding` / `@HostListener` — put host bindings in the `host` object of `@Component`.
- Use `inject()` in the component body, not constructor parameters.
- Add `TranslatePipe` to the `imports` array of any component that uses `| translate`.

### Persistence — IndexedDB via Dexie

`IndexdbService` (extends `Dexie`) owns all database access:

| Table | Schema | Entity type |
|---|---|---|
| `workspaces` | `&id, &name` | `JournalModel` |
| `columnMappings` | `&id, &name` | `ColumnsMapping` |

Services inject `IndexdbService` directly to read/write their respective tables.

### Naming conventions

| Entity | Convention |
|---|---|
| Files | `kebab-case` (e.g. `journal.service.ts`, `journal-list.component.ts`) |
| Service interface | `PascalCase` (e.g. `JournalService`) |
| Service token | `SCREAMING_SNAKE_CASE` (e.g. `JOURNAL_SERVICE`) |
| Service implementation | `PascalCase` + `Impl` suffix (e.g. `JournalServiceImpl`) |
| Components | `PascalCase` + `Component` suffix |
| i18n keys | Dot-namespaced (`menu.newJournal`) |
| Test selectors | `data-testid="kebab-case"` on all interactive/testable elements |

### Routing

Routes are locale-prefixed. Current route tree:

```
/                           → redirects to browser locale (defaultLocaleGuard)
/:locale
  /                         home
  /journals                 journal list
  /journal/new              new journal
  /journal/:journalId       journal details
  /columns-mapping/new      new columns mapping
  /columns-mapping/:id      columns mapping details
/**                         → redirects to /en
```

`localeGuard` validates the locale param (must be `en` or `fr`), calls `LocaleService.setLocale()`, and calls `TranslateService.use()`. `defaultLocaleGuard` redirects `/` to the browser's detected locale.

Construct links using the Angular Router:

```typescript
this.router.navigate([locale, 'journals']);
```

### i18n

Localization uses `@ngx-translate/core` with an HTTP loader.

- Translation files: `public/assets/i18n/en.json` and `public/assets/i18n/fr.json`  
  **Do NOT place them under `src/assets/`** — Angular CLI only serves from `public/`.
- All user-visible strings: `{{ 'some.key' | translate }}` in templates.
- Nested keys: `{ "menu": { "newJournal": "New Journal" } }` → `'menu.newJournal' | translate`.
- Every key must be present in **both** `en.json` and `fr.json`.

## Domain key types

```typescript
// Models
JournalModel   { id: string; name: string }
ColumnsMapping { id?: string; name: string; cardNumberColumn: number;
                 dateInscriptionColumn: number; amountColumn: number;
                 descriptionColumn: number }

// CSV extraction
CsvContentExtractionResult { delimiter: string; headerRowIndex: number;
                             header: string[]; rows: CsvJsonRecord[] }
CsvJsonRecord              Record<string, string>

// Result
Result<T>  { success: true; value: T } | { success: false; error: string }
```

## Checklist for new features

1. **New service** → interface + `InjectionToken` + `Impl` class; register token in `app.config.ts`
2. **New entity needing an ID** → inject `ID_GENERATOR_SERVICE` and call `generateId()`
3. **Persistence** → add a table to `IndexdbService` (new Dexie version entry)
4. **Fallible operation** → return `Result<T>`, not `throw`
5. **New component** → standalone, `OnPush`, signals for state, `data-testid` on all interactive elements
6. **New route** → add to `app.routes.ts` under `/:locale`, lazy-load with `() => import(...)`
7. **New i18n text** → add key to both `en.json` and `fr.json`

## Tools directory

`Tools/StatementGenerator/` is a standalone Node.js utility (requires Node 20+) for generating mock CSV bank statements used in testing the import pipeline.
