import type { BdgSettings } from '@engine/modules/bdg-settings/bdg-settings'
import type { CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content'

export type BdgSettingsExportColumnMappingEntry = {
  id: string
  name: string
  columnMapping: CsvColumnMapping
}

export type BdgSettingsExportEntry = BdgSettingsExportColumnMappingEntry

export type BdgSettingsExport = Record<string, BdgSettingsExportEntry>

export class BdgSettingsExporter {
  export(settings: BdgSettings): BdgSettingsExport {
    const result: BdgSettingsExport = {}

    for (const mapping of settings.columnMappings) {
      const key = `ColumnMapping:${mapping.id}`
      result[key] = {
        id: mapping.id,
        name: mapping.name,
        columnMapping: mapping.columnMapping,
      }
    }

    return result
  }
}
