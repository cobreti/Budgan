# GitHub Copilot Instructions

## Before starting any task

Always read **`.github/ARCHITECTURE.md`** before writing or modifying any code.

That file is the single source of truth for:
- Repo layout and path aliases
- Naming conventions
- All mandatory code patterns (DI token, Result<T>, Factory, Pinia bridge)
- Routing, CSS, i18n, and testing rules
- A checklist to follow for every new feature

Apply everything described in that document when generating code, including:
- The abstract-class-as-DI-token pattern (never raw interfaces for injectable services)
- The `Impl` suffix convention for concrete classes
- The `Bdg` prefix for domain entities
- The `Result<T>` pattern for fallible operations
- BEM CSS naming with CSS custom properties from `colors-def.scss`
- Locale-prefixed routing (`/:locale(en|fr)/...`)
- `data-testid` attributes on all interactive/testable elements
- Pinia stores as the bridge between the engine layer and the Vue UI
- **Always use path aliases for imports — never use relative paths with `../` or `../../`**
- ID generation via the `IdGenerator` service from the DI container

## Import alias rules (strictly enforced)

**Never write relative imports that cross directories.** Always use the correct alias:

| What you are importing | Alias to use |
|---|---|
| Anything from `src/engine/` | `@engine/` |
| Anything from `src/inversify/` | `@inversify/` |
| Anything inside `src/engine-testapp/` | `@engineTestApp/` |
| Views inside `src/engine-testapp/views/` | `@engineTestAppViews/` |
| Router files inside `src/engine-testapp/router/` | `@engineTestAppRouter/` |

**Examples:**
```ts
// ✅ Correct
import { IdGenerator } from '@engine/services/IdGenerator'
import container from '@inversify/setup-inversify'
import { useWorkspaceStore } from '@engineTestApp/stores/workspace-store'
import { CsvContentExtractor } from '@engine/modules/csv-import/csv-content-extractor'

// ❌ Wrong — never use ../ paths
import { IdGenerator } from '../../../engine/services/IdGenerator'
import container from '../../inversify/setup-inversify'
import { useWorkspaceStore } from '../../stores/workspace-store'
```

The only allowed relative imports are **same-directory** imports (e.g. `'./types'` inside the same component folder).

