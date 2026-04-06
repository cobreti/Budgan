```mermaid

classDiagram
    direction TD

    class CsvImporter {
        <<interface>>
    }
    class CsvImporterImpl
    class BdgAccountSegment
    class AccountInfo
    class CsvContent
    class CsvColumnContentMapping
     
    
    CsvImporter <-- CsvImporterImpl
    CsvImporterImpl "1" *-- "0..*" BdgAccountSegment
    
    CsvImporterImpl ..> AccountInfo
    CsvImporterImpl ..> CsvContent
    CsvImporterImpl ..> CsvColumnContentMapping
```
