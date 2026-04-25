import type { CsvColumnMapping } from '@engine/modules/csv-import/csv-column-content.ts'

export type BdgColumnMapping = {
  id: string
  name: string
  columnMapping: CsvColumnMapping
}
