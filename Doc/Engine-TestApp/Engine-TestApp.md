# Engine TestApp — Architecture

The `engine-testapp` is a Vue 3 application that acts as an interactive harness for the Budgan engine layer. It lets developers create workspaces, define column mappings, and import CSV bank statements through the full engine pipeline.

---

## 1. Layer Overview

```mermaid
graph TD
    subgraph UI ["UI Layer (engine-testapp)"]
        NAV[NavigationBar]
        VIEWS[Views]
        STORES[Pinia Stores]
        COMP[Components]
    end

    subgraph ENGINE ["Engine Layer (engine)"]
        WS[bdg-workspace]
        SET[bdg-settings]
        CSV[csv-import]
        SVC[services]
    end

    subgraph DI ["DI Layer (inversify)"]
        CONT[Inversify Container]
    end

    subgraph PERSIST ["Persistence"]
        LS[(localStorage)]
    end

    STORES -->|reads / writes| ENGINE
    STORES -->|hydrates on reload| LS
    UI -->|uses| STORES
    VIEWS -->|uses| COMP
    CONT -->|provides| ENGINE
    STORES -->|container.get| CONT
```

---

## 2. Routing Tree

```mermaid
graph LR
    ROOT["/:locale(en|fr)"]
    HOME["/ → Home"]
    ZIP["zip-file → ZipFile"]
    WRK["workspace → Workspace"]
    WRK_CREATE["create → WorkspaceCreate"]
    WRK_ACC["accounts → Accounts"]
    SET["settings → Settings"]
    SET_MAP["column-mappings → SettingsColumnMappings"]

    ROOT --> HOME
    ROOT --> ZIP
    ROOT --> WRK
    WRK --> WRK_CREATE
    WRK --> WRK_ACC
    WRK --> WRK_SEG["segments → Segments\n(requires selectedAccountId)"]
    ROOT --> SET
    SET --> SET_MAP

    style WRK_CREATE fill:#e8f4fd
    style WRK_ACC fill:#e8f4fd
    style WRK_SEG fill:#e8f4fd
    style SET_MAP fill:#fef9e7
```

---

## 3. Domain Model (Engine Layer)

```mermaid
classDiagram
    class BdgWorkspace {
        <<interface>>
        +id: string
        +name: string
        +accounts: BdgAccount[]
        +createAccount(name, columnMappingId) BdgAccount
        +getAccount(id) Result~BdgAccount~
        +loadAccount(account) void
    }
    class BdgWorkspaceImpl {
        -_idGenerator: IdGenerator
        -_accounts: Map
    }
    class BdgAccount {
        <<interface>>
        +id: string
        +name: string
        +columnMappingId: string
        +segments: BdgAccountSegment[]
        +addSegment(segment) void
    }
    class BdgAccountImpl
    class BdgAccountSegment {
        +name: string
        +dateStart: Date
        +dateEnd: Date
        +dateStartAsString: string
        +dateEndAsString: string
        +rows: BdgAccountSegmentRow[]
    }
    class BdgAccountSegmentRow {
        <<type>>
        +cardNumber: string
        +description: string
        +dateTransactionAsString: string
        +dateInscriptionAsString?: string
        +dateTransaction?: Date
        +dateInscription?: Date
        +amount: number
    }
    class BdgWorkspaceFactory {
        <<abstract>>
        +bindingTypeId: string
        +createWorkspace() BdgWorkspace
        +reconstructWorkspace(id, name, accounts) BdgWorkspace
    }
    class BdgWorkspaceFactoryImpl

    class BdgSettings {
        <<abstract>>
        +bindingTypeId: string
        +columnMappings: BdgColumnMapping[]
        +addColumnMapping(mapping) void
        +updateColumnMapping(mapping) void
        +removeColumnMapping(id) void
    }
    class BdgSettingsImpl

    class BdgColumnMapping {
        <<type>>
        +id: string
        +name: string
        +columnMapping: CsvColumnMapping
    }

    class CsvColumnMapping {
        <<type>>
        card-number?: number
        date-inscription?: number
        date-transaction?: number
        amount?: number
        description?: number
    }

    class CsvContentExtractor {
        +extract(csvText) CsvContentExtractionResult
    }
    class CsvContentExtractionResult {
        <<type>>
        +delimiter: string
        +headerRowIndex: number
        +header: string[]
        +rows: CsvJsonRecord[]
    }
    class CsvContentImporter {
        <<abstract>>
        +bindingTypeId: string
        +import(file, columnMapping) Promise~ResultWithError~
    }
    class CsvContentImporterImpl {
        -readerFactory: ReaderFactory
    }

    BdgWorkspace <|.. BdgWorkspaceImpl
    BdgWorkspaceImpl "1" o-- "0..*" BdgAccount
    BdgAccount <|.. BdgAccountImpl
    BdgAccountImpl "1" o-- "0..*" BdgAccountSegment
    BdgAccountSegment "1" o-- "0..*" BdgAccountSegmentRow
    BdgWorkspaceFactory <|-- BdgWorkspaceFactoryImpl
    BdgWorkspaceFactory ..> BdgWorkspace : creates

    BdgSettings <|-- BdgSettingsImpl
    BdgSettingsImpl "1" o-- "0..*" BdgColumnMapping
    BdgColumnMapping *-- CsvColumnMapping

    CsvContentExtractor ..> CsvContentExtractionResult : produces
    CsvContentImporter <|-- CsvContentImporterImpl
    CsvContentImporterImpl ..> CsvContentExtractor : uses
    CsvContentImporterImpl ..> BdgAccountSegment : produces
```

---

## 4. Pinia Stores

```mermaid
classDiagram
    class WorkspaceStore {
        +parsedJson: CsvContentExtractionResult | null
        +appliedMapping: CsvColumnMapping | null
        +selectedFileName: string | null
        +selectedFileSize: number | null
        +isJsonVisible: boolean
        +currentWorkspace: BdgWorkspace | null
        +workspaceSnapshot: WorkspaceSnapshot | null
        +selectedAccountId: string | null
        +setParsedJson(content) void
        +setAppliedMapping(mapping) void
        +setSelectedFile(file) void
        +setCurrentWorkspace(workspace) void
        +createAccountInCurrentWorkspace(name, mappingId) BdgAccount
        +removeAccountFromCurrentWorkspace(accountId) void
        +setSelectedAccount(accountId) void
        +clearSelectedAccount() void
        +importSegmentToSelectedAccount(file) Promise~ResultWithError~
        +rebuildWorkspaceFromSnapshot() void
    }
    note for WorkspaceStore "Persisted: workspaceSnapshot → localStorage\ncurrentWorkspace excluded (rebuilt via factory)\nSegments are in-memory only (not persisted)"

    class SettingsStore {
        +settings: BdgSettings
        +columnMappings: BdgColumnMapping[]
        +columnMappingsSnapshot: BdgColumnMapping[]
        +insertMapping(mapping) void
        +updateMapping(mapping) void
        +removeMapping(id) void
    }
    note for SettingsStore "Persisted: columnMappingsSnapshot → localStorage\nRe-feeds BdgSettings domain on hydration"

    class WorkspaceSnapshot {
        <<type>>
        +id: string
        +name: string
        +accounts: Array
    }

    WorkspaceStore ..> BdgWorkspaceFactory : container.get
    WorkspaceStore ..> BdgSettings : container.get
    WorkspaceStore ..> CsvContentImporter : container.get
    WorkspaceStore *-- WorkspaceSnapshot
    SettingsStore ..> BdgSettings : container.get
```

---

## 5. Component Tree

```mermaid
graph TD
    APP[EngineTestApp.vue]
    LAYOUT[layout.vue]
    NAV[NavigationBar]
    HOME[Home]
    ZIP[ZipFile]
    WRK[Workspace]
    WRK_C[WorkspaceCreate]
    WRK_A[Accounts]
    WRK_S[Segments]
    SET[Settings]
    SET_CM[SettingsColumnMappings]
    CM[CsvColumnMapping component]

    APP --> LAYOUT
    LAYOUT --> NAV
    LAYOUT --> HOME
    LAYOUT --> ZIP
    LAYOUT --> WRK
    WRK --> WRK_C
    WRK --> WRK_A
    WRK --> WRK_S
    LAYOUT --> SET
    SET --> SET_CM
    SET_CM --> CM

    style CM fill:#d5f5e3
    style SET_CM fill:#fef9e7
    style WRK_A fill:#e8f4fd
    style WRK_S fill:#e8f4fd
```

---

## 6. CSV Import Data Flow

```mermaid
sequenceDiagram
    actor User
    participant SCM as SettingsColumnMappings
    participant CE as CsvContentExtractor
    participant CMC as CsvColumnMapping component
    participant SS as SettingsStore
    participant BDS as BdgSettings (domain)
    participant LS as localStorage

    User->>SCM: Opens local CSV file
    SCM->>CE: extract(csvText)
    CE-->>SCM: CsvContentExtractionResult (headers + rows)
    SCM->>CMC: :parsed-json prop
    User->>CMC: Maps columns → save
    CMC->>SS: insertMapping(BdgColumnMapping)
    SS->>BDS: addColumnMapping(mapping)
    SS->>LS: persist columnMappingsSnapshot
```

---

## 7. Segment Import Flow

```mermaid
sequenceDiagram
    actor User
    participant SV as Segments view
    participant WS as WorkspaceStore
    participant BDS as BdgSettings (domain)
    participant CI as CsvContentImporter
    participant RF as ReaderFactory
    participant CE as CsvContentExtractor
    participant ACC as BdgAccount

    User->>SV: Selects CSV file
    SV->>WS: importSegmentToSelectedAccount(file)
    WS->>WS: getAccount(selectedAccountId)
    WS->>BDS: find BdgColumnMapping by columnMappingId
    BDS-->>WS: CsvColumnMapping
    WS->>CI: import(file, columnMapping)
    CI->>RF: createReader()
    RF-->>CI: FileReader
    CI->>CI: reader.readAsText(file)
    CI->>CE: extract(csvText)
    CE-->>CI: CsvContentExtractionResult
    CI->>CI: map rows → BdgAccountSegmentRow[]
    CI-->>WS: ResultWithError~BdgAccountSegment~
    WS->>ACC: addSegment(segment)
    WS-->>SV: ResultWithError~BdgAccountSegment~
    SV->>User: Show success / error message
```

---

## 8. Workspace Creation Flow

```mermaid
sequenceDiagram
    actor User
    participant WC as WorkspaceCreate
    participant WF as BdgWorkspaceFactory
    participant WS as WorkspaceStore
    participant LS as localStorage

    User->>WC: Enter name → submit
    WC->>WF: createWorkspace()
    WF-->>WC: BdgWorkspace
    WC->>WS: setCurrentWorkspace(workspace)
    WS->>WS: _syncWorkspaceSnapshot()
    WS->>LS: persist workspaceSnapshot

    User->>WC: Navigate to Accounts
    User->>+WC: Enter account name + select column mapping → submit
    WC->>WS: createAccountInCurrentWorkspace(name, mappingId)
    WS->>WS: _syncWorkspaceSnapshot()
    WS->>LS: persist updated workspaceSnapshot
```

---

## 9. Persistence & Hydration

```mermaid
graph LR
    subgraph localStorage
        WK_KEY["engine-testapp-workspace\n(workspaceSnapshot)"]
        ST_KEY["engine-testapp-settings\n(columnMappingsSnapshot)"]
    end

    subgraph "On page reload"
        WK_H["WorkspaceStore\nafterHydrate:\nrebuildWorkspaceFromSnapshot()"]
        ST_H["SettingsStore\nafterHydrate:\nfor each mapping → addColumnMapping()"]
    end

    WK_KEY -->|pinia-plugin-persistedstate| WK_H
    ST_KEY -->|pinia-plugin-persistedstate| ST_H

    WK_H -->|BdgWorkspaceFactory.reconstructWorkspace| BWS["BdgWorkspace (live)"]
    ST_H -->|BdgSettings.addColumnMapping| BST["BdgSettings (live)"]
```

---

## 10. DI Container Bindings

| Abstract Class (token) | Concrete Class | Scope |
|---|---|---|
| `BdgWorkspaceFactory` | `BdgWorkspaceFactoryImpl` | Singleton |
| `BdgSettings` | `BdgSettingsImpl` | Singleton |
| `IdGenerator` | `IdGeneratorImpl` | Transient |
| `ReaderFactory` | `FileReaderFactoryImpl` | Transient |
| `CsvContentImporter` | `CsvContentImporterImpl` | Transient |

All bindings are declared in `engine/setup-inversify.module.ts` and loaded into the shared Inversify container at `inversify/setup-inversify.ts`.

---

## 11. Key Conventions

| Rule | Description |
|---|---|
| `Bdg` prefix | All domain entities (e.g. `BdgWorkspace`, `BdgAccount`, `BdgSettings`) |
| `Impl` suffix | All concrete implementations (e.g. `BdgWorkspaceImpl`) |
| Abstract class as DI token | Abstract classes carry a static `bindingTypeId` — never raw interfaces |
| `Result<T>` | Fallible operations return `{ success: true, value: T }` or `{ success: false }` |
| BEM CSS | All scoped styles use BEM (e.g. `.workspace-view__menu-item--active`) |
| i18n | All user-visible strings go through `useI18n()` / `t('...')` |
| Locale routing | All routes prefixed with `/:locale(en|fr)/` |
| Path aliases | `@engine/`, `@inversify/`, `@engineTestApp/`, `@engineTestAppViews/`, `@engineTestAppRouter/` |
| `data-testid` | All interactive/testable elements carry a `data-testid` attribute |

