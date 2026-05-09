import type { BdgSettingsService } from '@engine/modules/bdg-storage/bdg-settings.service.ts'
import type { BdgColumnMapping } from '@engine/modules/bdg-settings/bdg-column-mapping.ts'
import type {
  ColumnMappingEntry,
  IndexDBDatabase
} from '@engine/modules/bdg-storage/indexdb/indexdb-database-impl.ts'

export class IndexDbSettingsService implements BdgSettingsService{

  constructor(private _database : IndexDBDatabase)
  {
    
  }

  saveColumnMapping(columnMapping: BdgColumnMapping): Promise<void> {

    const columnMappingEntry : ColumnMappingEntry = {
      id: columnMapping.id,
      name: columnMapping.name,
      columnMapping: columnMapping.columnMapping
    }

    this._database.columnMapping.add(columnMappingEntry)

    return Promise.resolve(undefined)
  }

}
