```mermaid
classDiagram
    class BdgSettings
    class BdgCsvSettings
    class CsvColumnMapping
    
    BdgSettings "1" *-- "1" BdgCsvSettings : has
    BdgCsvSettings "1" *-- "*" CsvColumnMapping : has
```
