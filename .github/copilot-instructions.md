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
- Path aliases (`@engine/`, `@engineTestApp/`, etc.) instead of long relative imports
- ID generation via the `IdGenerator` service from the DI container

